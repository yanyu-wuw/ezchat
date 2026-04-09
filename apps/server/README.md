# EzChat Server

Express.js + Socket.io real-time chat server.

## Features

- Real-time messaging using Socket.io
- User presence management
- Direct and broadcast messaging
- Typing indicators
- REST API for client discovery

## Environment Variables

```
SERVER_PORT=3000
NODE_ENV=development
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://user:password@localhost:5432/ezchat
```

## Running

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Users

- `GET /api/users` - List all active users

## Socket.io Events

### Client → Server

- `user:join` - User joins chat
- `message:send` - Send a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

### Server → Client

- `message:receive` - New message received
- `users:update` - User list updated
- `typing:indicator` - User typing indicator
- `user:offline` - User went offline
