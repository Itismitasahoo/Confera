export default function Toast({ message, onClose, type = "error" }) {
  const isSuccess = type === "success";

  return (
    <div className={`toast ${isSuccess ? "toastSuccess" : "toastError"}`}>
      <span>{isSuccess ? "✓" : "✕"}</span>

      <p>{message}</p>

      <button onClick={onClose}>×</button>
    </div>
  );
}
