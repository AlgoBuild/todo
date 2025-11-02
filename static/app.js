let todos = [];
let draggedElement = null;
let selectedDate = 'today'; // 'today' or 'tomorrow'

// Load todos on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
    
    // Handle date toggle buttons
    document.querySelectorAll('.date-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDate = btn.dataset.date;
        });
    });
    
    // Handle task form submission
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        const task = input.value.trim();
        
        if (task) {
            await addTodo(task, selectedDate);
            input.value = '';
        }
    });
});

// Load todos from API
async function loadTodos() {
    try {
        const response = await fetch('/api/todos');
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

// Add new todo
async function addTodo(task, dateType = 'today') {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const targetDate = dateType === 'tomorrow' ? tomorrow : today;
        
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task, date: targetDate })
        });
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            const todo = await response.json();
            todos.push(todo);
            renderTodos();
        }
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todo.completed })
        });
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            todos[index] = updatedTodo;
            renderTodos();
        }
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

// Reorder todos
async function reorderTodos() {
    const todoItems = Array.from(document.querySelectorAll('.todo-item'));
    const todoIds = todoItems.map(item => parseInt(item.dataset.id));
    
    try {
        const response = await fetch('/api/todos/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todo_ids: todoIds })
        });
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            // Update priorities in local array based on order within each date
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            
            let todayPriority = 0;
            let tomorrowPriority = 0;
            
            todoIds.forEach(id => {
                const todo = todos.find(t => t.id === id);
                if (todo) {
                    if (todo.date === today) {
                        todo.priority = todayPriority++;
                    } else if (todo.date === tomorrow) {
                        todo.priority = tomorrowPriority++;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error reordering todos:', error);
        // Reload todos on error
        loadTodos();
    }
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('empty-state');
    
    if (todos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    // Sort by date then priority
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.priority - b.priority;
    });
    
    const today = new Date().toISOString().split('T')[0];
    let currentDate = null;
    let html = '';
    
    sortedTodos.forEach(todo => {
        // Add date header if date changed
        if (todo.date !== currentDate) {
            currentDate = todo.date;
            const dateLabel = todo.date === today ? 'Today' : 'Tomorrow';
            html += `<div class="date-header">${dateLabel}</div>`;
        }
        
        html += `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" 
             data-id="${todo.id}" 
             data-date="${todo.date}"
             draggable="true">
            <input type="checkbox" 
                   class="todo-checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text" ondblclick="startEditing(${todo.id})">${escapeHtml(todo.task)}</span>
            <input type="text" 
                   class="todo-edit-input" 
                   value="${escapeHtml(todo.task)}" 
                   style="display: none;"
                   onblur="finishEditing(${todo.id}, this)"
                   onkeydown="handleEditKeydown(event, ${todo.id}, this)">
        </div>`;
    });
    
    todoList.innerHTML = html;
    
    // Setup drag and drop
    setupDragAndDrop();
}

// Setup drag and drop
function setupDragAndDrop() {
    const items = document.querySelectorAll('.todo-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        // Only allow reordering within the same date
        const draggedDate = draggedElement.dataset.date;
        const targetDate = this.dataset.date;
        
        if (draggedDate !== targetDate) {
            this.classList.remove('drag-over');
            return false;
        }
        
        const todoList = document.getElementById('todoList');
        const allItems = Array.from(todoList.querySelectorAll('.todo-item'));
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            todoList.insertBefore(draggedElement, this.nextSibling);
        } else {
            todoList.insertBefore(draggedElement, this);
        }
        
        reorderTodos();
    }
    
    this.classList.remove('drag-over');
    return false;
}

// Start editing a todo
function startEditing(id) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!todoItem) return;
    
    const textSpan = todoItem.querySelector('.todo-text');
    const editInput = todoItem.querySelector('.todo-edit-input');
    
    if (!textSpan || !editInput) return;
    
    textSpan.style.display = 'none';
    editInput.style.display = 'block';
    editInput.focus();
    editInput.select();
}

// Finish editing a todo
async function finishEditing(id, input) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!todoItem) return;
    
    const textSpan = todoItem.querySelector('.todo-text');
    const newTask = input.value.trim();
    
    if (!textSpan) return;
    
    // If task is empty, cancel edit and restore original
    if (!newTask) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            input.value = todo.task;
        }
        textSpan.style.display = '';
        input.style.display = 'none';
        return;
    }
    
    // Update the task via API
    await updateTaskName(id, newTask);
    
    textSpan.style.display = '';
    input.style.display = 'none';
}

// Handle keyboard events during editing
function handleEditKeydown(event, id, input) {
    if (event.key === 'Enter') {
        event.preventDefault();
        input.blur(); // This will trigger finishEditing
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
        if (todoItem) {
            const textSpan = todoItem.querySelector('.todo-text');
            const todo = todos.find(t => t.id === id);
            if (todo) {
                input.value = todo.task;
            }
            if (textSpan) {
                textSpan.style.display = '';
            }
            input.style.display = 'none';
        }
    }
}

// Update task name via API
async function updateTaskName(id, task) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task })
        });
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                // Update the text span
                const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
                if (todoItem) {
                    const textSpan = todoItem.querySelector('.todo-text');
                    if (textSpan) {
                        textSpan.textContent = updatedTodo.task;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating task name:', error);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

