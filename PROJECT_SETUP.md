# Smart Waste Management System - Project Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (installed and running)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Database Setup

Make sure MongoDB is installed and running on your system. The default connection string is `mongodb://localhost:27017/authDB`.

If you need to change the database connection, edit the `backend/server.js` file and update the MongoDB connection string.

### 3. Running the Application

#### Option 1: Using the Startup Script (Recommended)
Simply double-click the `start-project.bat` file in the root directory. This will:
- Start MongoDB (if not already running)
- Start the backend server on port 4000
- Start the frontend server on port 5173

#### Option 2: Manual Start

##### Start Backend
```bash
cd backend
npm run dev
```

##### Start Frontend (in a separate terminal)
```bash
cd frontend
npm run dev
```

## Access Points

- Frontend Application: http://localhost:5173
- Backend API: http://localhost:4000/api
- MongoDB: mongodb://localhost:27017

## Troubleshooting

### 1. MongoDB Connection Issues
- Ensure MongoDB is installed and running
- Check if MongoDB service is started: `net start MongoDB`
- Verify the connection string in `backend/server.js`

### 2. Port Already in Use
- If port 4000 is in use, change it in `backend/server.js`
- If port 5173 is in use, change it in `frontend/vite.config.js`

### 3. External API Issues
- The application uses an external API for area data (`https://swms-area-api.onrender.com`)
- If this API is down, the application will use fallback data

### 4. Authentication Issues
- The application uses a mock token for development: `mock-jwt-token`
- If authentication fails, check the `backend/middleware/auth.js` file

## Project Structure

```
swms-project/
├── backend/          # Node.js/Express backend
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Authentication middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── scripts/      # Database initialization scripts
│   └── server.js     # Main server file
├── frontend/         # React/Vite frontend
│   ├── public/       # Static assets
│   ├── src/          # Source code
│   └── vite.config.js # Vite configuration
└── start-project.bat # Startup script
```

## Features

- User authentication (admin, driver, regular user)
- Bin management and monitoring
- Complaint registration and tracking
- Schedule management for waste collection
- Area-based waste management

## Default Login Credentials

For testing purposes, you can use the mock authentication with:
- Email: admin@gmail.com
- Role: admin
- Token: mock-jwt-token

This is automatically handled by the frontend and backend for development purposes.
