# Todo List Application

A minimalistic todo list application with drag-and-drop priority management, user authentication, and day-based task organization.

## Live Demo

🚀 **Try it out:** [https://minitodo.pythonanywhere.com/](https://minitodo.pythonanywhere.com/)

## Features

- ✅ User authentication (login/signup)
- ✅ Add tasks for today and/or any future day
- ✅ Check off completed tasks
- ✅ Drag and drop to reorder tasks within each day
- ✅ Date-based task organization with visual headers
- ✅ Minimalistic UI design
- ✅ Fully responsive (mobile, tablet, desktop)

## Tech Stack

- **Backend**: Python, Flask, SQLite
- **Frontend**: HTML, CSS, JavaScript

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows (PowerShell/CMD)
venv\Scripts\activate

# Mac/Linux/Git Bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Database Schema

- **users**: Stores user accounts with hashed passwords
- **todos**: Stores tasks with user_id, task text, completion status, priority, and date

## API Endpoints

- `POST /login` - User login
- `POST /signup` - User signup
- `POST /logout` - User logout
- `GET /api/todos` - Get todos for today and/or future days
- `POST /api/todos` - Create a new todo (today and/or any future date)
- `PUT /api/todos/<id>` - Update a todo (toggle completion or edit text)
- `POST /api/todos/reorder` - Reorder todos within same date
- `DELETE /api/todos/<id>` - Delete a todo

