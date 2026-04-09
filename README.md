# EzChat - Real-time Chat Application

A full-stack real-time chat application built with React, Node.js, and Socket.io.

## Features

- Real-time Messaging: Instant message delivery using Socket.io
- User Authentication: JWT-based auth system
- Direct & Group Chat: One-to-one and group conversations
- Modern UI: React with Tailwind CSS
- Responsive Design: Desktop and mobile compatible
- Real-time Notifications: Instant delivery status
- Message History: Persistent storage with PostgreSQL

## Tech Stack

### Frontend

- React 19: UI framework
- TypeScript: Type safety
- Vite: Build tool
- Tailwind CSS: Styling
- Socket.io Client: Real-time communication
- React Router: Routing

### Backend

- Node.js: Runtime
- Express: HTTP server
- Socket.io: WebSocket communication
- PostgreSQL: Database
- TypeScript: Type safety
- JWT: Authentication

## Project Structure

```
ezchat/
├── apps/
│   ├── server/           # Express API & Socket.io server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── socket/
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── styles/
│       └── package.json
├── packages/
│   └── types/            # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       └── package.json
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18 or later
- pnpm 8 or later
- PostgreSQL 15 or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ezchat

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string
```

### Development

```bash
# Start both frontend and backend in development mode
pnpm dev

# Frontend runs on http://localhost:5173
# Backend runs on http://localhost:3000
```

### Production Build

```bash
# Build all packages
pnpm build

# Start the server
pnpm start
```

## 📖 API Documentation

See [apps/server/README.md](./apps/server/README.md) for detailed API documentation.

## 🎓 Learning Outcomes

This project demonstrates:

- Full-stack application development
- Real-time WebSocket communication
- RESTful API design
- Component-based React architecture
- TypeScript best practices
- Database design and ORM usage
- Authentication & Authorization
- Responsive UI/UX design

## 📝 License

MIT
