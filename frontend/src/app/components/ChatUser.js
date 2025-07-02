export default function ChatUser({ user }) {
  return (
    <div className="chat-user">
      <div className="chat-user-info">
        <strong>{user.name}</strong> (@{user.username})
      </div>
    </div>
  );
}