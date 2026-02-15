🧠 Real-Time Task Collaboration Platform...
A full-stack real-time task collaboration system inspired by Trello.

Users can:
- Create boards
- Create lists within boards
- Create tasks inside lists
- Drag and drop tasks across lists
- View real-time updates across multiple sessions
- Track activity history

🛠 Tech Stack

- Frontend 
React (SPA)
Axios
Socket.io Client
dnd-kit (Drag & Drop)

- Backend
Node.js
Express.js
MySQL
Socket.io
JWT Authentication

🏗 Architecture Overview
- Frontend Architecture
Single Page Application using React Router.
State managed using React hooks (useState, useEffect).
Board state structure:
  Boards
  Lists (per board)
  Tasks grouped by list
  Activity logs
Real-time updates handled via WebSocket listener.
Drag-and-drop handled using dnd-kit with DndContext.

- Backend Architecture
REST-based API structure.
Modular folder structure:
  routes/
  controllers/
  middleware/
  config/
JWT-based route protection.
Real-time communication using Socket.io.
Activity logging stored in relational database.

🗄 Database Schema Design
Users
id
name
email
password

Boards
id
name
created_by

Lists
id
title
board_id

Tasks
id
title
description
list_id
assigned_user_id
position

Activity Logs
id
task_id
action
user_id
created_at

Relational integrity maintained using foreign keys.

🔌 API Contract
Authentication
POST /api/auth/signup
POST /api/auth/login


Boards
GET /api/boards
POST /api/boards


Lists
GET /api/lists/:boardId
POST /api/lists

Tasks
GET /api/tasks/:listId
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id


Activity
GET /api/activity/:boardId


⚡ Real-Time Synchronization Strategy
Backend emits taskUpdated event whenever:
   Task created
   Task moved/updated
Frontend listens to taskUpdated
Upon receiving event:
  Re-fetch lists
  Re-fetch activity logs
Ensures consistency across multiple clients.

📈 Scalability Considerations
1. Database Indexing
Indexes can be added on:
    tasks.list_id
    lists.board_id
    activity_logs.task_id

2. WebSocket Optimization
Instead of broadcasting to all users, use room-based Socket.io channels per board.

3. Pagination
Activity logs can be paginated for large boards.

4. Horizontal Scaling
Use Redis adapter for Socket.io to scale across multiple server instances.

5. Caching
Frequently accessed boards can be cached using Redis.

▶ Setup Instructions
Backend...
cd hintro-backend
npm install
npm run dev


Create .env:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hintro_db
JWT_SECRET=your_secret

Frontend...
cd hintro-frontend
npm install
npm start

Demo Credentials...

Email: prema@test.com
Password: 123456
