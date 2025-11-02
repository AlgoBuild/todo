# Todo List Application

A minimalistic todo list application with drag-and-drop priority management, user authentication, and day-based task organization.

## Live Demo

🚀 **Try it out:** [https://minitodo.pythonanywhere.com/](https://minitodo.pythonanywhere.com/)

## Features

- ✅ User authentication (login/signup)
- ✅ Add tasks for today or tomorrow
- ✅ Check off completed tasks
- ✅ Drag and drop to reorder tasks within each day
- ✅ Date-based task organization with visual headers
- ✅ Minimalistic UI design
- ✅ Fully responsive (mobile, tablet, desktop)

## Tech Stack

- **Backend**: Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
# On Windows: .\venv\bin\python
# On Mac/Linux: source venv/bin/activate
```

2. Install dependencies:
```bash
# On Windows with Git Bash venv: .\venv\bin\pip install -r requirements.txt
# On Mac/Linux: pip install -r requirements.txt
```

3. Run the application:
```bash
# On Windows with Git Bash venv: .\venv\bin\python app.py
# On Mac/Linux: python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Database Schema

- **users**: Stores user accounts with hashed passwords
- **todos**: Stores tasks with user_id, task text, completion status, priority, and date

## API Endpoints

- `POST /login` - User login
- `POST /signup` - User signup
- `POST /logout` - User logout
- `GET /api/todos` - Get todos for today and tomorrow
- `POST /api/todos` - Create a new todo (today or tomorrow)
- `PUT /api/todos/<id>` - Update a todo (toggle completion or edit text)
- `POST /api/todos/reorder` - Reorder todos within same date
- `DELETE /api/todos/<id>` - Delete a todo

