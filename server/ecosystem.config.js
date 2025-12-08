module.exports = {
  apps: [
    {
      name: 'chat-server-1',
      script: 'server.js',
      env: {
        PORT: 5001
      }
    },
    {
      name: 'chat-server-2',
      script: 'server.js',
      env: {
        PORT: 5002
      }
    },
    {
      name: 'chat-server-3',
      script: 'server.js',
      env: {
        PORT: 5003
      }
    }
  ]
};
