# AI PR Review Frontend

An Angular-based frontend application for AI-powered pull request code review and analysis.

## Features

- 🔐 User Authentication (Login/Signup)
- 📊 Dashboard with analytics
- 📁 Repository Management
- 🔀 Pull Request Viewing
- 🔍 AI-Powered Code Analysis
- 📈 Analysis History and Reports

## Project Structure

```
ai-pr-review-frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Core services, guards, interceptors, models
│   │   ├── auth/           # Authentication module
│   │   ├── dashboard/      # Dashboard module
│   │   ├── repositories/   # Repository management module
│   │   ├── pull-requests/  # Pull request module
│   │   ├── analysis/       # Analysis module
│   │   └── shared/         # Shared components
│   ├── assets/
│   ├── environments/
│   └── styles.css
├── angular.json
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17)

## Installation

```bash
# Install dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli
```

## Configuration

Update the environment files with your API endpoints:

- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

## Development Server

```bash
# Start development server
npm start
# or
ng serve

# Navigate to http://localhost:4200/
```

## Build

```bash
# Build for production
npm run build
# or
ng build --configuration production

# The build artifacts will be stored in the `dist/` directory
```

## Running with Docker

```bash
# Build Docker image
docker build -t ai-pr-review-frontend .

# Run container
docker run -p 4200:80 ai-pr-review-frontend
```

## Module Overview

### Core Module
- **Services**: Authentication, Repository, Pull Request, Analysis, GitHub, Dashboard
- **Guards**: Auth Guard for route protection
- **Interceptors**: HTTP interceptor for adding auth tokens
- **Models**: User, Repository, Pull Request, Analysis

### Feature Modules
- **Auth**: Login and Signup components
- **Dashboard**: Main dashboard with statistics
- **Repositories**: Repository list and add repository
- **Pull Requests**: PR list and details
- **Analysis**: Analysis dashboard, history, and details

### Shared Module
- Navbar component
- Sidebar component
- Loading spinner
- Error message
- Confirmation dialog

## License

MIT
