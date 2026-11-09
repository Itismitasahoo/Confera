import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./contexts/AuthContext.jsx";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import { useParams, useNavigate } from "react-router-dom";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const { addToUserHistory } = useContext(AuthContext);

  const { meetingCode: urlMeetingCode } = useParams();
  const navigate = useNavigate();

  const [meetingCode] = useState(() => {
    return (
      urlMeetingCode ||
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  });

  useEffect(() => {
    if (!urlMeetingCode) {
      navigate(`/video-meet/${meetingCode}`, { replace: true });
    }
  }, [urlMeetingCode, meetingCode, navigate]);

  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [cameraFacing, setCameraFacing] = useState("user");
  let [cameraSwitching, setCameraSwitching] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [messageToDelete, setMessageToDelete] = useState(null);

  let [message, setMessage] = useState("");

  const [meetingActivity, setMeetingActivity] = useState([]);

  let [newMessages, setNewMessages] = useState(3);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  const seenMeetingEvents = useRef(new Set());

  let [videos, setVideos] = useState([]);

  const [copied, setCopied] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState(null);

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(meetingCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Failed to copy meeting code:", error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    let videoStream = null;
    let audioStream = null;

    // Request camera with balanced video quality
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      setVideoAvailable(true);
      console.log("Video permission granted");
    } catch (error) {
      setVideoAvailable(false);
      console.log("Video permission unavailable:", error);
    }

    // Request microphone with audio processing
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setAudioAvailable(true);
      console.log("Audio permission granted");
    } catch (error) {
      setAudioAvailable(false);
      console.log("Audio permission unavailable:", error);
    }

    // Check screen-sharing support
    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter((device) => device.kind === "videoinput");

      setHasMultipleCameras(cameras.length > 1);
    } catch (error) {
      console.log("Could not detect cameras:", error);
      setHasMultipleCameras(false);
    }

    // Combine available camera and microphone tracks
    const tracks = [
      ...(videoStream?.getVideoTracks() || []),
      ...(audioStream?.getAudioTracks() || []),
    ];

    const userMediaStream = new MediaStream(tracks);

    window.localStream = userMediaStream;

    if (localVideoref.current) {
      localVideoref.current.srcObject = userMediaStream;
    }
  };

  const switchCamera = async () => {
    if (cameraSwitching || screen === true || !window.localStream) {
      return;
    }

    const nextFacing = cameraFacing === "user" ? "environment" : "user";

    setCameraSwitching(true);

    let newStream;

    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      if (!newVideoTrack) {
        throw new Error("No camera track available");
      }

      const oldVideoTracks = window.localStream.getVideoTracks();

      // Replace the video track for every connected participant
      for (const id in connections) {
        const videoSender = connections[id]
          .getSenders()
          .find((sender) => sender.track?.kind === "video");

        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      // Preserve audio and replace only the camera track
      oldVideoTracks.forEach((track) => {
        window.localStream.removeTrack(track);
        track.stop();
      });

      window.localStream.addTrack(newVideoTrack);

      if (localVideoref.current) {
        localVideoref.current.srcObject = window.localStream;
      }

      setCameraFacing(nextFacing);
    } catch (error) {
      console.error("Camera switching failed:", error);

      if (newStream) {
        newStream.getTracks().forEach((track) => track.stop());
      }

      alert("Unable to switch camera. Please try again.");
    } finally {
      setCameraSwitching(false);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", meetingCode, username);
      socketIdRef.current = socketRef.current.id;

      // Prevent duplicate event listeners on reconnection
      socketRef.current.off("chat-message");
      socketRef.current.off("message-deleted");
      socketRef.current.off("user-left");
      socketRef.current.off("user-joined");

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("message-deleted", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.filter((item) => item.id !== messageId),
        );
      });

      socketRef.current.on("user-left", (id, name) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));

        const eventKey = `left-${id}`;

        if (!seenMeetingEvents.current.has(eventKey)) {
          seenMeetingEvents.current.add(eventKey);

          setMeetingActivity((prev) => [
            ...prev,
            {
              id: eventKey,
              text: `${name || "A participant"} left the meeting`,
            },
          ]);
        }
      });

      socketRef.current.on("user-joined", (id, clients, usernames) => {
        // Show notification when another participant joins
        if (id !== socketIdRef.current) {
          const eventKey = `joined-${id}`;

          if (!seenMeetingEvents.current.has(eventKey)) {
            seenMeetingEvents.current.add(eventKey);

            const joinedName = usernames?.[id] || "A participant";

            setMeetingActivity((prev) => [
              ...prev,
              {
                id: eventKey,
                text: `${joinedName} joined the meeting`,
              },
            ]);
          }
        }

        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? {
                        ...video,
                        stream: event.stream,
                        username: usernames[socketListId] || "Participant",
                      }
                    : video,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                username: usernames[socketListId] || "Participant",
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
  };
  let handleAudio = () => {
    setAudio(!audio);
    // getUserMedia();
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender, timestamp, messageId) => {
    setMessages((prevMessages) => {
      // Prevent duplicate messages using their unique IDs
      if (prevMessages.some((item) => item.id === messageId)) {
        return prevMessages;
      }

      return [
        ...prevMessages,
        {
          id: messageId,
          sender: sender,
          senderSocketId: socketIdSender,
          data: data,
          timestamp: timestamp,
        },
      ];
    });

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  let deleteMessage = (messageId) => {
    if (!socketRef.current || !messageId) return;

    socketRef.current.emit("delete-message", messageId);
  };

  const confirmDeleteMessage = () => {
    if (!messageToDelete) return;

    deleteMessage(messageToDelete);
    setMessageToDelete(null);
  };

  let connect = async () => {
    try {
      await addToUserHistory(meetingCode);
    } catch (e) {
      console.log("Could not save meeting history:", e);
    }

    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyContainer}>
          <h2 className={styles.lobbyHeading}>Enter into Lobby</h2>
          <TextField
            className={styles.usernameField}
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button
            className={styles.connectButton}
            variant="contained"
            onClick={connect}
          >
            Connect
          </Button>

          <div className={styles.videoTile}>
            <video ref={localVideoref} autoPlay muted></video>

            <div className={styles.participantName}>{username || "You"}</div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.meetingCodeBox}>
            <span>
              Meeting Code: <strong>{meetingCode}</strong>
            </span>

            <Button
              className={styles.copyCodeButton}
              variant="contained"
              onClick={copyMeetingCode}
            >
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>

          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {/* Meeting join/leave notifications */}
                  {meetingActivity.map((activity) => (
                    <div key={activity.id} className={styles.meetingActivity}>
                      {activity.text}
                    </div>
                  ))}

                  {/* Normal chat messages */}
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div
                          style={{ marginBottom: "20px" }}
                          key={item.id || index}
                        >
                          <div className={styles.messageHeader}>
                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>

                            {item.senderSocketId === socketIdRef.current && (
                              <button
                                className={styles.deleteMessageButton}
                                onClick={() => setMessageToDelete(item.id)}
                                title="Delete message"
                              >
                                ⋮
                              </button>
                            )}
                          </div>

                          <p>{item.data}</p>

                          <p className={styles.messageTime}>
                            {item.timestamp
                              ? new Date(item.timestamp).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  },
                                )
                              : ""}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                {messageToDelete && (
                  <div className={styles.deleteConfirmOverlay}>
                    <div className={styles.deleteConfirmDialog}>
                      <h3>Delete Message?</h3>

                      <p>
                        Are you sure you want to delete this message? This
                        action cannot be undone.
                      </p>

                      <div className={styles.deleteConfirmActions}>
                        <button
                          className={styles.cancelDeleteButton}
                          onClick={() => setMessageToDelete(null)}
                        >
                          Cancel
                        </button>

                        <button
                          className={styles.confirmDeleteButton}
                          onClick={confirmDeleteMessage}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.chattingArea}>
                  <TextField
                    className={styles.chatInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button
                    className={styles.sendButton}
                    variant="contained"
                    onClick={sendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            {hasMultipleCameras && (
              <IconButton
                onClick={switchCamera}
                disabled={cameraSwitching || screen === true}
                style={{ color: cameraSwitching ? "#ffb199" : "white" }}
                title="Switch Camera"
              >
                <FlipCameraAndroidIcon />
              </IconButton>
            )}

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="orange">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          <div className={styles.conferenceView}>
            {/* Your own video */}
            <div className={styles.selfVideoContainer}>
              <div className={styles.videoTile}>
                <video ref={localVideoref} autoPlay muted playsInline />

                <div className={styles.participantName}>
                  {username || "You"} (You)
                </div>
              </div>
            </div>

            {/* Other participants' videos */}
            {videos.map((video) => (
              <div
                key={video.socketId}
                className={`${styles.videoTile} ${styles.clickableVideoTile}`}
                onClick={() => setSelectedVideo(video)}
              >
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                />

                <div className={styles.participantName}>
                  {video.username || "Participant"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedVideo && (
        <div
          className={styles.enlargedVideoOverlay}
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className={styles.closeEnlargedVideo}
            onClick={() => setSelectedVideo(null)}
          >
            ×
          </button>

          <div
            className={styles.enlargedVideoContent}
            onClick={(event) => event.stopPropagation()}
          >
            <video
              autoPlay
              playsInline
              ref={(ref) => {
                if (ref && selectedVideo.stream) {
                  ref.srcObject = selectedVideo.stream;
                }
              }}
            />

            <div className={styles.participantName}>
              {selectedVideo.username || "Participant"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
