# Todo List Application

A minimalistic todo list application with drag-and-drop priority management, user authentication, and day-based task organization.

## Features

- ✅ User authentication (login/signup)
- ✅ Add tasks to current day
- ✅ Check off completed tasks
- ✅ Drag and drop to reorder tasks (change priority)
- ✅ Minimalistic UI design
- ✅ Responsive design

## Tech Stack

- **Backend**: Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Deployment**: PythonAnywhere

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to `http://localhost:5000`

## PythonAnywhere Deployment

1. Upload your files to PythonAnywhere
2. In the Web tab, configure your WSGI file to point to `app.py`
3. Make sure to set the `SECRET_KEY` environment variable for production:
   - Go to the Files tab
   - Edit `.env` or set it in your WSGI configuration
4. The database will be created automatically on first run

## Database Schema

- **users**: Stores user accounts with hashed passwords
- **todos**: Stores tasks with user_id, task text, completion status, priority, and date

## API Endpoints

- `POST /login` - User login
- `POST /signup` - User signup
- `POST /logout` - User logout
- `GET /api/todos` - Get all todos for today
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/<id>` - Update a todo (toggle completion)
- `POST /api/todos/reorder` - Reorder todos based on drag and drop
- `DELETE /api/todos/<id>` - Delete a todo

