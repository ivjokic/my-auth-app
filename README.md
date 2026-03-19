# my-auth-app

A full-stack authentication app built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- User registration with validation
- Login / Logout
- JWT-based session (persists on refresh)
- Protected home page

## Setup

### Prerequisites

- Node.js
- MongoDB

### Backend

1. `cd backend`
2. `npm install`
3. Create `.env` file:

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
PORT=5000
```

4. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`
