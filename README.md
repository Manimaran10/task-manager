Collaborative Task Manager

Live Deployment

Frontend URL: https://collobrative-taskmanager.netlify.app

<!-- Backend API: https://task-manager-sktg.onrender.com -->

API Health Check: https://task-manager-sktg.onrender.com/health

GitHub Repository: https://github.com/Manimaran10/task-manager

Setup Instructions (How to run the FE/BE locally) :
Prerequisites
Node.js 18+ installed

MongoDB Atlas account (or local MongoDB)

Git

1. Clone the Repository
bash
git clone: https://github.com/Manimaran10/task-manager.git

cd task-manager

2. Backend Setup
bash
cd backend
npm install
cp .env.example .env
Configure .env file:

env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/task_manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
Start Backend:

bash
npm run dev      # Development mode
# or
npm run build    # Build for production
npm start        # Start production server
Backend runs at: http://localhost:5000

3. Frontend Setup
bash
cd ../frontend
npm install
cp .env.example .env
Configure .env file:

env
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
Start Frontend:

bash
npm run dev
Frontend runs at: http://localhost:5173

4. Access the Application
Open browser: http://localhost:5173

Register new account or use test credentials

Start managing tasks!

📡 API Contract Documentation
Base URL
Production: https://task-manager-sktg.onrender.com/api/v1

Local: http://localhost:5000/api/v1

Authentication Endpoints

POST :/auth/register	- Register new user,        Content-Type: application/json
POST :/auth/login	    - User login,               Content-Type: application/json
GET  :/auth/me          - Get current userprofile,	Authorization: Bearer <token>
PUT	 :/auth/profile	    - Update userprofile,   	Authorization: Bearer <token>

Task Endpoints

GET	 :/tasks	        -Get all tasks	    -status, priority, assignedTo, sortBy, order
POST :/tasks	        -Create new task	-
GET	 :/tasks/:id	    -Get single task	-
PUT	 :/tasks/:id	    -Update task	-
DELETE :/tasks/:id	    -Delete task	-
GET	 :/health	        -Service health status

<!-- Method	Endpoint	Description	Headers
GET	/notifications	Get user notifications	Authorization: Bearer <token>
PUT	/notifications/:id/read	Mark notification as read	Authorization: Bearer <token>
Health Check -->

Request/Response Examples
Register User:

json
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "user_id", "username": "john_doe", ... },
    "token": "jwt_token_here"
  }
}
Create Task:

json
POST /tasks
{
  "title": "Complete project",
  "description": "Finish final features",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "priority": "high",
  "status": "todo",
  "assignedToId": "user_id"
}

Architecture Overview & Design Decisions :

Backend Architecture Pattern

The application follows a Service-Repository-Controller pattern with clear separation of concerns:

text
┌─────────────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────┐
│   Controllers   │ →  │   Services  │ →  │ Repositories │ →  │   Models   │
│ (HTTP Layer)    │    │ (Business   │    │ (Data Access)│    │ (Database  │
│                 │    │   Logic)    │    │              │    │  Schemas)  │
└─────────────────┘    └─────────────┘    └──────────────┘    └────────────┘
        │                      │                     │               │
        ▼                      ▼                     ▼               ▼
   API Routes           Validation           Database Queries    MongoDB
   Error Handling       Notifications        Caching             Collections
   Request/Response     Real-time Events     Transactions
Database Choice: MongoDB
Why MongoDB was chosen:

Flexible Schema: Task management features evolve frequently. MongoDB's document model allows adding new fields (attachments, tags, comments) without database migrations.

Hierarchical Data Structure: Tasks naturally fit document structure with nested comments, subtasks, and metadata that would require multiple joins in relational databases.

Real-Time Capabilities: MongoDB Change Streams complement Socket.IO for reactive architectures, allowing real-time data synchronization.

Cloud Native: MongoDB Atlas provides automatic scaling, global distribution, backups, and monitoring out-of-the-box.

Performance for Read-Heavy Workloads: Task management applications are typically read-heavy with frequent task listing operations where MongoDB excels.

Developer Productivity: JSON-like documents map naturally to JavaScript/TypeScript objects, reducing impedance mismatch.

JWT Authentication Implementation
How JWT is handled:

Token Generation: Upon successful login/registration, server generates a JWT token containing user ID and email, signed with a secret key, valid for 7 days.

Token Storage: Tokens are stored in browser's localStorage (considered for API-first approach) with plans to implement HttpOnly cookies for enhanced security.

Middleware Protection: All protected routes use authentication middleware that:

Extracts token from Authorization header
Verifies token signature and expiry
Attaches decoded user information to request object
Returns 401 for invalid/missing tokens
Security Considerations:
Tokens have limited lifespan (7 days)
No sensitive data in token payload
Environment-based secret keys

CORS configured to prevent unauthorized domains


Service Layer Implementation
Purpose and Benefits:

Business Logic Encapsulation: Service classes contain all business rules, keeping controllers thin and focused on HTTP concerns.
Testability: Services can be unit tested independently without HTTP layer dependencies.
Reusability: Common logic (task assignment, notification sending) is centralized in services.
Transaction Management: Services coordinate multiple repository calls within transactions when needed.

Real-Time Integration: Services trigger Socket.IO events after business operations complete.

Example Service Flow:

text
Create Task Request → Task Controller → Task Service → Task Repository → Database
                                           ↓
                                    Send Notification
                                           ↓
                                    Emit Socket Event
🔌 Socket.IO Real-Time Integration
Implementation Strategy
Socket.IO enables real-time bidirectional communication between server and connected clients for collaborative task management.

How It's Integrated:
Server-Side Setup:

Socket.IO server initialized alongside Express HTTP server
JWT authentication middleware validates socket connections
Users automatically join personal rooms based on their user ID
Event handlers for task creation, updates, and deletion
Client-Side Integration:
Socket connection established on user login
Token automatically included in connection handshake
Event listeners for real-time updates
Automatic reconnection on disconnection

Real-Time Events Implemented:
task:created - Emitted when new task is created
task:updated - Emitted when task properties change
task:deleted - Emitted when task is removed
notification:new - Emitted when user receives notification

<!-- Room Management:

Each user joins room: user:{userId} for private notifications

Global room for broadcast updates

Task-specific rooms for focused collaboration -->

Fallback Mechanisms:

WebSocket with polling transport fallback
Automatic reconnection with exponential backoff

Connection state monitoring

Real-Time Features Enabled:
Live Task Updates: When any user modifies a task, all connected users see changes instantly without page refresh.
Assignment Notifications: When a task is assigned to a user, they receive instant in-app notification.
Collaborative Editing: Multiple users can view and update tasks simultaneously with conflict prevention.
<!-- Presence Indicators: Shows which team members are currently online. -->

Integration with Data Layer:
Socket events triggered from service layer after database operations

Optimistic UI updates on client side
Conflict resolution for simultaneous edits
Notification persistence in database alongside real-time delivery

Trade-offs & Assumptions
Trade-offs Made:
MongoDB vs PostgreSQL:

Chose MongoDB for flexibility in evolving task schema

Trade-off: Sacrificed complex relational queries for schema flexibility
Mitigation: Implemented application-level joins where needed
JWT in localStorage vs HttpOnly Cookies:
Chose localStorage for easier API testing and mobile app compatibility
Trade-off: Increased XSS risk vs CSRF protection
Mitigation: Implemented CORS, input sanitization, short token expiry

Service Layer Complexity:

Chose comprehensive service layer for separation of concerns
Trade-off: Added abstraction layers vs simplicity
Benefit: Better testability and maintainability
Real-Time vs Polling:
Chose Socket.IO for true real-time updates
Trade-off: Server resource usage vs user experience
Mitigation: Efficient room management, connection pooling

Assumptions Made:
Team Size: Application designed for small to medium teams (5-50 users).

Task Complexity: Assumes tasks have moderate complexity suitable for document database.
Real-Time Requirements: Assumes real-time collaboration is critical for user experience.
Security Model: Assumes trusted client environment for token storage.

Deployment Environment: Assumes cloud deployment with managed services.

User Behavior: Assumes moderate concurrent edits with basic conflict resolution needs.

Future Improvements Considered:
Implement HttpOnly cookies with refresh token rotation
Add Redis for Socket.IO adapter and caching
Implement MongoDB Change Streams for database-level real-time
Add task commenting and file attachments
Implement advanced search with ElasticSearch
Add task dependencies and Gantt chart views
Implement offline capability with sync

📁 Project Structure
text
collaborative-task-manager/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── api/             # API client services
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route components
│   │   └── types/          # TypeScript definitions
│   ├── public/
│   └── package.json
│
└── backend/                 # Node.js TypeScript backend
    ├── src/
    │   ├── controllers/     # Request handlers
    │   ├── services/        # Business logic layer
    │   ├── repositories/    # Data access abstraction
    │   ├── models/         # MongoDB schemas
    │   ├── middleware/     # Express middleware
    │   ├── routes/         # API route definitions
    │   ├── socket/         # Socket.IO implementation
    │   └── validations/    # Zod validation schemas
    ├── package.json
    └── server.ts           # Application entry point

Testing:
Backend Tests

Unit tests for service layer business logic
Authentication and authorization tests
Socket.IO event handling tests
Database operation tests

Run tests:

bash
cd backend
npm test

Key Test Cases:
User registration validation
Task creation with business rules
Real-time notification delivery
Authentication middleware
Error handling scenarios


Security Measures Implemented :

Password Security: bcrypt hashing with salt rounds
JWT Security: Signed tokens with expiration
Input Validation: Zod schemas for all API inputs
CORS: Restrictive origin policy
HTTP Headers: Helmet.js for security headers
Rate Limiting: On authentication endpoints
Error Handling: Generic error messages in production

Support & Contact
For issues or questions:

GitHub Issues: https://github.com/Manimaran10/task-manager/issues

Live Application: https://collobrative-taskmanager.netlify.app

License
This project is for assessment purposes. All rights reserved.

Last Updated: December 2024
Version: 1.0.0
Status: Production Ready 🚀