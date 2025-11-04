from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['DATABASE'] = 'todos.db'
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database"""
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            priority INTEGER NOT NULL DEFAULT 0,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

def login_required(f):
    """Decorator to check if user is logged in"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/')
def index():
    """Render the main page"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and handler"""
    if request.method == 'POST':
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        conn = get_db()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ?',
            (username,)
        ).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return jsonify({'success': True, 'username': user['username']})
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
    
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Signup page and handler"""
    if request.method == 'POST':
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = get_db()
        # Check if username already exists
        existing = conn.execute(
            'SELECT id FROM users WHERE username = ?',
            (username,)
        ).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Username already exists'}), 400
        
        password_hash = generate_password_hash(password)
        cursor = conn.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            (username, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        session['user_id'] = user_id
        session['username'] = username
        return jsonify({'success': True, 'username': username}), 201
    
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/logout', methods=['POST'])
def logout():
    """Logout handler"""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/todos', methods=['GET'])
@login_required
def get_todos():
    """Get all todos for a specific date (defaults to today)."""
    user_id = session['user_id']
    today = datetime.now().strftime('%Y-%m-%d')
    date_param = request.args.get('date', today)
    # Basic validation: expect YYYY-MM-DD, fallback to today if invalid
    try:
        _ = datetime.strptime(date_param, '%Y-%m-%d')
    except ValueError:
        date_param = today
    conn = get_db()
    todos = conn.execute(
        'SELECT * FROM todos WHERE user_id = ? AND date = ? ORDER BY date ASC, priority ASC, id ASC',
        (user_id, date_param)
    ).fetchall()
    conn.close()
    return jsonify([dict(todo) for todo in todos])

@app.route('/api/todos', methods=['POST'])
@login_required
def add_todo():
    """Add a new todo"""
    user_id = session['user_id']
    data = request.json
    task = data.get('task', '').strip()
    date_str = data.get('date', None)
    
    if not task:
        return jsonify({'error': 'Task cannot be empty'}), 400
    
    # Validate and set date (allow today or any future date)
    today = datetime.now().strftime('%Y-%m-%d')
    if date_str:
        try:
            # Ensure valid format and not in the past
            _ = datetime.strptime(date_str, '%Y-%m-%d')
            if date_str < today:
                return jsonify({'error': 'Date cannot be in the past'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    target_date = date_str if date_str else today
    conn = get_db()
    
    # Get the max priority for the target date to add new item at the end
    max_priority = conn.execute(
        'SELECT MAX(priority) FROM todos WHERE user_id = ? AND date = ?',
        (user_id, target_date)
    ).fetchone()[0] or -1
    
    cursor = conn.execute(
        'INSERT INTO todos (user_id, task, completed, priority, date) VALUES (?, ?, ?, ?, ?)',
        (user_id, task, False, max_priority + 1, target_date)
    )
    conn.commit()
    todo_id = cursor.lastrowid
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (todo_id, user_id)).fetchone()
    conn.close()
    
    return jsonify(dict(todo)), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
@login_required
def update_todo(todo_id):
    """Update a todo (toggle completed status or update task name)"""
    user_id = session['user_id']
    data = request.json
    conn = get_db()
    
    if 'completed' in data:
        conn.execute(
            'UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?',
            (data['completed'], todo_id, user_id)
        )
    
    if 'task' in data:
        task = data.get('task', '').strip()
        if not task:
            conn.close()
            return jsonify({'error': 'Task cannot be empty'}), 400
        conn.execute(
            'UPDATE todos SET task = ? WHERE id = ? AND user_id = ?',
            (task, todo_id, user_id)
        )
    
    conn.commit()
    todo = conn.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', (todo_id, user_id)).fetchone()
    conn.close()
    
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    
    return jsonify(dict(todo))

@app.route('/api/todos/reorder', methods=['POST'])
@login_required
def reorder_todos():
    """Update priorities of todos based on drag and drop"""
    user_id = session['user_id']
    data = request.json
    todo_ids = data.get('todo_ids', [])
    
    if not todo_ids:
        return jsonify({'error': 'No todo IDs provided'}), 400
    
    conn = get_db()
    
    # Get all todos with their dates to group by date
    todos_data = {}
    for todo_id in todo_ids:
        todo = conn.execute(
            'SELECT date FROM todos WHERE id = ? AND user_id = ?',
            (todo_id, user_id)
        ).fetchone()
        if todo:
            todos_data[todo_id] = todo['date']
    
    # Group by date and assign priorities within each date
    date_priorities = {}
    for todo_id in todo_ids:
        if todo_id in todos_data:
            date = todos_data[todo_id]
            if date not in date_priorities:
                date_priorities[date] = 0
            conn.execute(
                'UPDATE todos SET priority = ? WHERE id = ? AND user_id = ?',
                (date_priorities[date], todo_id, user_id)
            )
            date_priorities[date] += 1
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
@login_required
def delete_todo(todo_id):
    """Delete a todo"""
    user_id = session['user_id']
    conn = get_db()
    conn.execute('DELETE FROM todos WHERE id = ? AND user_id = ?', (todo_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)

