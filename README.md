# IntraDesk - Internal Knowledge Portal

A secure, user-friendly, and professional-looking internal knowledge portal for company employees.

## Features

- **Azure AD Authentication**: Secure login with company domain verification
- **Dashboard**: Overview of document categories with statistics
- **Document Management**: Organized by Policies, SOPs, Templates, and FAQs
- **Search & Filter**: Advanced document discovery with department filters
- **Admin Panel**: Document upload and management system
- **Responsive Design**: Works across all devices

## Technology Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Azure AD (MSAL.js)
- **Storage**: Azure Blob Storage
- **Deployment**: Docker + Azure App Service

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Azure AD tenant
- Azure Storage Account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. Set up environment variables (see .env.example files)
4. Run database migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. Start the development servers:
   ```bash
   # Backend (port 3001)
   cd backend
   npm run dev
   
   # Frontend (port 3000)
   cd frontend
   npm start
   ```

## Project Structure

```
intraDesk/
├── frontend/          # React application
├── backend/           # Express.js API
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── docker-compose.yml # Development environment
```

## Security

- Azure AD authentication with MFA
- Role-based access control
- Data encryption at rest and in transit
- Regular security updates and audits

## Support

For support and questions, please contact the IT department.
