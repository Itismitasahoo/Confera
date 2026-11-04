# 🎥 Confera

<h3 align="center">Real-time video meetings, made simple.</h3>

<p align="center">
  A browser-based video conferencing platform for seamless communication, collaboration, and connection.
</p>

<p align="center">
  <a href="https://confera-peach.vercel.app/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-FF7043?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://github.com/Itismitasahoo/Confera">
    <img src="https://img.shields.io/badge/GitHub-Repository-24292F?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC-333333?style=flat-square" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
</p>

---

## ✨ Overview

Confera is a real-time video conferencing web application that brings video communication, screen sharing, and instant messaging into one platform.

Users can create a meeting, share its unique code, and connect with others directly through a browser. The application combines WebRTC for live media communication with Socket.IO for real-time events and messaging.

## 🚀 Features

| | Feature | Description |
|---|---|---|
| 🎥 | **Video Conferencing** | Real-time audio and video communication. |
| 🔗 | **Meeting Rooms** | Create or join meetings using a unique meeting code. |
| 🖥️ | **Screen Sharing** | Share your screen during a meeting. |
| 💬 | **Live Chat** | Exchange messages with participants in real time. |
| 👥 | **Participant Names** | Identify participants within the meeting. |
| 🔔 | **Activity Notifications** | Get notified when someone joins or leaves. |
| 🕘 | **Meeting History** | View previous meeting entries and join them again. |
| 🔐 | **Authentication** | User registration and login. |

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Material UI |
| **Styling** | CSS Modules |
| **Backend** | Node.js, Express.js |
| **Real-time Communication** | Socket.IO |
| **Media Communication** | WebRTC |
| **Database** | MongoDB |
| **Deployment** | Vercel, Render |

## ⚙️ How It Works

Confera uses a combination of technologies to handle different parts of the meeting experience.

- **React** manages the interface, meeting controls, and application state.
- **WebRTC** establishes peer-to-peer connections for audio and video.
- **Socket.IO** handles signaling, chat messages, and participant activity.
- **Express.js** provides the backend application structure and API endpoints.
- **MongoDB** stores persistent application data.

## 📁 Project Structure

```text
Confera/
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── contexts/
│       ├── styles/
│       └── utils/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       └── routes/
│
├── .gitignore
└── README.md
```

## 💻 Getting Started

Follow these steps to run Confera locally.

### Prerequisites

- Node.js and npm
- Git
- MongoDB database (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/Itismitasahoo/Confera.git
cd Confera
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Confera/frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_SERVER_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:5173/** in your browser.

## 🌍 Deployment

Confera is deployed using separate frontend and backend services.

| Component | Platform |
|---|---|
| 🌐 Frontend | [Vercel](https://vercel.com/) |
| ⚡ Backend | [Render](https://render.com/) |
| 🗄️ Database | [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) |

**Live application:** [confera-peach.vercel.app](https://confera-peach.vercel.app/)

### Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `PORT` | Backend | Server port |
| `MONGO_URI` | Backend | MongoDB connection string |
| `VITE_SERVER_URL` | Frontend | Backend server URL |

> **Note:** Keep credentials and environment-specific configuration in `.env` files. Never commit secrets to the repository.

## 📸 Screenshots

Screenshots of the application will be added soon.

## 👩‍💻 Author

**Itismita Sahoo**

Developer of Confera.

<p>
  <a href="https://github.com/Itismitasahoo">
    <img src="https://img.shields.io/badge/GitHub-Itismitasahoo-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://linkedin.com/in/itismitasahoo">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
</p>


<p align="center">
  <strong>Confera</strong>
  <br/>
  <sub>Built to bring people closer, one meeting at a time. ♥</sub>
</p>
