# Smart To-Do List Tracker

A production-ready Android mobile application for task management with React Native frontend and NestJS backend.

## Features

- **User Authentication**: Register, login, logout with JWT authentication
- **Task Management**: Create, read, update, delete tasks
- **Task Organization**: Categories, priorities, tags, due dates
- **Subtasks**: Break down tasks into smaller steps
- **Analytics**: Dashboard with productivity statistics, daily goals, streaks
- **Calendar**: View tasks by date
- **Settings**: Theme customization, notification preferences, daily goals

## Tech Stack

### Frontend
- React Native + Expo
- TypeScript
- React Navigation
- TanStack React Query
- AsyncStorage
- Expo Notifications

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Expo CLI
- Android Studio (for APK building)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=to_do_list
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:
```bash
npm run start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm start
```

## Building Android APK

### Development Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas build:configure
```

3. Build development APK:
```bash
eas build --platform android --profile development
```

### Production Build

1. Update `app.config.js` with production settings
2. Build production APK:
```bash
eas build --platform android --profile production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `PATCH /api/tasks/:id/incomplete` - Mark task as incomplete

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Subtasks
- `GET /api/tasks/:taskId/subtasks` - Get task subtasks
- `POST /api/tasks/:taskId/subtasks` - Create subtask
- `PUT /api/tasks/:taskId/subtasks/:id` - Update subtask
- `DELETE /api/tasks/:taskId/subtasks/:id` - Delete subtask

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/daily` - Get daily statistics
- `GET /api/analytics/weekly` - Get weekly statistics
- `GET /api/analytics/monthly` - Get monthly statistics
- `GET /api/analytics/categories` - Get category statistics

### User Settings
- `GET /api/user-settings` - Get user settings
- `PUT /api/user-settings` - Update user settings
- `POST /api/user-settings/reset` - Reset to defaults

## Database Schema

### Users
- id, name, email, password, created_at, updated_at

### Categories
- id, user_id, name, icon, created_at, updated_at

### Tasks
- id, user_id, category_id, title, description, priority, status, start_date, due_date, completed_at, tags, created_at, updated_at

### Subtasks
- id, task_id, title, is_completed, created_at, updated_at

### Recurring Tasks
- id, task_id, repeat_type, repeat_interval, start_date, end_date, created_at, updated_at

### User Settings
- id, user_id, daily_goal, theme, notifications_enabled, language, created_at, updated_at

## Development

### Running Tests

Backend:
```bash
cd backend
npm run test
```

Frontend:
```bash
cd frontend
npm run test
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting

## License

MIT License