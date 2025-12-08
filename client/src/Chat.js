import { useState, useEffect, useRef } from 'react';

function Chat({ user, socket, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socket.off('newMessage');
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const message = {
      sender: user.name,
      senderId: user._id,
      text,
      time: new Date().toLocaleTimeString()
    };

    socket.emit('sendMessage', message);
    setText('');
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        Welcome, <strong>{user.name}</strong>
        <button onClick={onLogout} style={{ marginLeft: '10px' }}>Logout</button>
      </div>

      <div style={{
        border: '1px solid #ccc',
        height: '400px',
        overflowY: 'auto',
        padding: '10px',
        marginBottom: '10px'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '10px',
              textAlign: msg.senderId === user._id ? 'right' : 'left'
            }}
          >
            <strong>{msg.sender}</strong>
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>{msg.time}</span>
            <div style={{
              background: msg.senderId === user._id ? '#007bff' : '#e9e9e9',
              color: msg.senderId === user._id ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '8px',
              display: 'inline-block',
              maxWidth: '70%'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Send</button>
      </form>
    </div>
  );
}

export default Chat;
