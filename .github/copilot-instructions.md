# EzChat Project Instructions

This is a full-stack real-time chat application built with React, Node.js, and Socket.io.

## Project Overview

- **Frontend**: 70% React 19 + TypeScript + Tailwind CSS
- **Backend**: 30% Express + Socket.io + TypeScript
- **Database**: PostgreSQL (optional for basic demo)
- **Build Tool**: Turbo monorepo

## Quick Start

```bash
# Install dependencies
pnpm install

# Development - both frontend and backend
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start
```

## Project Structure

- `apps/server` - Express backend with Socket.io
- `apps/web` - React frontend with Vite
- `packages/types` - Shared TypeScript types

## Key Features

✨ Real-time messaging
👤 User authentication placeholder
💬 Direct and broadcast messages
📱 Responsive design
🔔 Typing indicators
🟢 Online status tracking

## Technologies Used

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS 3
- Socket.io Client
- React Router

**Backend:**
- Express 4
- Socket.io 4
- TypeScript 5
- Node.js 18+

## Development Workflow

For detailed development instructions, see:
- [Server README](./apps/server/README.md)
- [Web README](./apps/web/README.md)
