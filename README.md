📅 Calendar App with Integration App Flows
Description
This is a simple calendar application that integrates with Integration App to manage customer flows and integrations. The application allows users to connect with external tools like Google Calendar and manage events or tasks efficiently.

Features
Integrations

Connect and manage external tools like Google Calendar.
Display available integrations dynamically.
Automatically detect the connection status.
Customer Flows

Create and configure customer instances for specific flows (e.g., new-updates-on-meetings).
Pass parameters like id to configure flows dynamically.
Event Management

Submit event data like description, dueDate, and parentId.
Trigger event submission to configured flows or a webhook endpoint.
Tech Stack
Frontend: React.js
Backend: Node.js + Express
API Integration: Integration App API
State Management: React Hooks (useState, useEffect)
Setup Instructions
Prerequisites:
Node.js and npm installed.
Git installed.
1. Clone the Repository
Run the following command in your terminal:

bash
Copy code
git clone <repository-url>
cd <project-folder>
2. Install Dependencies
Navigate to the backend and frontend folders, then install the required packages.

bash
Copy code
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
3. Environment Variables
In the backend, create a .env file with the following:

env
Copy code
WORKSPACE_KEY=<your-workspace-key>
WORKSPACE_SECRET=<your-workspace-secret>
4. Run the Project
Start the backend and frontend servers:

bash
Copy code
# Backend
cd backend
node server.js

# Frontend
cd ../frontend
npm start
Access the application at:
http://localhost:3000
