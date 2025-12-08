import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './Login';
import Chat from './Chat';

const socket = io('http://localhost:5001');

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    socket.emit('join', userData._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chat App</h1>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat user={user} socket={socket} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
