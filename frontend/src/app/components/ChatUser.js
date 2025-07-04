export default function ChatUser({ user }) {
  return (
    <div className="chat-user">
      <div className="chat-user-info">
        <strong>{user}</strong>
      </div>
    </div>
  );
}