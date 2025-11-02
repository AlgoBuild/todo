# Push Files to GitHub - Quick Guide

## On Your Local Machine (Windows)

Run these commands in PowerShell or Command Prompt:

```bash
# Navigate to your project directory
cd D:\webDev\todo

# Check git status
git status

# Add all files (except those in .gitignore)
git add .

# Check what will be committed
git status

# Commit the files
git commit -m "Add Flask app files - app.py, templates, static files"

# Push to GitHub
git push origin main
```

## Files That Should Be Pushed:

- ✅ `app.py` - Main Flask application
- ✅ `requirements.txt` - Python dependencies
- ✅ `templates/` folder - HTML templates
  - `index.html`
  - `login.html`
  - `signup.html`
- ✅ `static/` folder - CSS and JavaScript
  - `app.js`
  - `auth.js`
  - `style.css`
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - Documentation

## Files That Should NOT Be Pushed (already ignored):

- ❌ `todos.db` - Database file (ignored)
- ❌ `__pycache__/` - Python cache (ignored)
- ❌ `.venv/` or `venv/` - Virtual environment (ignored)
- ❌ `DEPLOY_PYTHONANYWHERE.md` - Optional (you can include it if you want)

