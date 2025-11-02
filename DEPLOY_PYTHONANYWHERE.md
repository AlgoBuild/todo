# Deploy to PythonAnywhere - Step by Step Guide

## Prerequisites

1. GitHub account (create at [github.com](https://github.com) if needed)
2. Code pushed to GitHub repository
3. PythonAnywhere account (create free at [pythonanywhere.com](https://www.pythonanywhere.com))

---

## Step 1: Push Code to GitHub

If you haven't already pushed your code:

```bash
# Navigate to your project directory
cd D:\webDev\todo

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Todo app"

# Add GitHub remote (replace with your repo URL)
git remote add origin git@github.com:AlgoBuild/todos.git

# Push to GitHub
git push -u origin main
# or if your branch is master:
git push -u origin master
```

**Important:** Make sure these files are pushed:
- `app.py`
- `requirements.txt`
- `templates/` folder
- `static/` folder
- `.gitignore`

---

## Step 2: Create PythonAnywhere Account

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Click "Sign up for free"
3. Choose the **Beginner** plan (free tier)
4. Create account (email verification required)

---

## Step 3: Access Bash Console

1. After logging in, click on the **Consoles** tab
2. Click "New console" → "Bash"
3. This opens a Linux terminal where you'll work

---

## Step 4: Clone Your Repository

In the Bash console:

```bash
# Navigate to your home directory (you're probably already there)
cd ~

# Clone your repository
git clone git@github.com:AlgoBuild/todos.git

# Or if using HTTPS:
git clone https://github.com/AlgoBuild/todos.git

# Navigate into the project
cd todos

# Verify files are there
ls -la
```

You should see:
- `app.py`
- `requirements.txt`
- `templates/`
- `static/`

---

## Step 5: Set Up Python Virtual Environment

```bash
# Create a virtual environment (PythonAnywhere uses Python 3.10 by default)
python3.10 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

**Note:** If you get an error about Python version, try:
```bash
python3.9 -m venv venv
# or
python3.11 -m venv venv
```

Check available Python versions:
```bash
python3 --version
```

---

## Step 6: Test Your App Locally (Optional but Recommended)

In the Bash console:

```bash
# Make sure you're in the project directory and venv is activated
cd ~/todos
source venv/bin/activate

# Run your app
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

Press `Ctrl+C` to stop it.

---

## Step 7: Configure the Web App

1. Click on the **Web** tab in PythonAnywhere dashboard
2. Click "Add a new web app"
3. Click "Next" on the domain selection (use the free `.pythonanywhere.com` domain)
4. Select **Flask** framework
5. Select **Python 3.10** (or the version you used for venv)
6. Click "Next"

---

## Step 8: Set Web App Path

In the **Web** tab, configure:

### Source code:
- **Path**: `/home/YOUR_USERNAME/todos`
  - Replace `YOUR_USERNAME` with your actual PythonAnywhere username
  - Example: `/home/johnsmith/todos`

### Working directory:
- **Working directory**: `/home/YOUR_USERNAME/todos`
  - Same as path above

---

## Step 9: Update WSGI Configuration File

1. In the **Web** tab, find "WSGI configuration file"
2. Click on the file link (usually `/var/www/YOUR_USERNAME_pythonanywhere_com_wsgi.py`)
3. Delete all the default content
4. Replace with:

```python
import sys

# Path to your project
path = '/home/YOUR_USERNAME/todos'
if path not in sys.path:
    sys.path.insert(0, path)

# Activate virtual environment
activate_this = '/home/YOUR_USERNAME/todos/venv/bin/activate_this.py'
with open(activate_this) as f:
    exec(f.read(), {'__file__': activate_this})

# Import your Flask app
from app import app as application

# Initialize database on first run
from app import init_db
init_db()
```

**Important:** Replace `YOUR_USERNAME` with your actual PythonAnywhere username!

**Example:** If your username is `johnsmith`, use:
```python
path = '/home/johnsmith/todos'
activate_this = '/home/johnsmith/todos/venv/bin/activate_this.py'
```

---

## Step 10: Set Environment Variables

1. In the **Web** tab, scroll down to "Environment variables"
2. Click "Add a new environment variable"
3. Add:
   - **Name**: `SECRET_KEY`
   - **Value**: Generate a random secret key

**To generate a secret key:**

In Bash console:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and use it as the value.

**Or manually set:**
- **Name**: `SECRET_KEY`
- **Value**: `your-super-secret-key-here-make-it-long-and-random`

---

## Step 11: Initialize Database

Your database will be created automatically when the app runs (because of `init_db()` in the WSGI file).

However, you can also create it manually:

In Bash console:
```bash
cd ~/todos
source venv/bin/activate
python3 -c "from app import init_db; init_db(); print('Database initialized!')"
```

---

## Step 12: Reload Web App

1. Go to the **Web** tab
2. Click the big green **Reload** button
3. Wait a few seconds for reload to complete

---

## Step 13: Access Your App

1. In the **Web** tab, you'll see your app URL
2. It will be: `https://YOUR_USERNAME.pythonanywhere.com`
3. Click the link or copy and paste it in your browser
4. Your todo app should be live!

---

## Step 14: Test Your App

1. Visit your app URL
2. Try signing up for a new account
3. Test adding todos
4. Test drag and drop
5. Test editing todos (double-click)
6. Everything should work!

---

## Troubleshooting

### App shows error page:

1. Check the **Web** tab → **Error log** section
2. Look for error messages
3. Common issues:
   - Wrong path in WSGI file
   - Virtual environment not activated correctly
   - Missing dependencies
   - Import errors

### Database errors:

- The database is created automatically in your project directory
- Path: `/home/YOUR_USERNAME/todos/todos.db`
- Make sure the app has write permissions (it should by default)

### Static files not loading:

- Check that `static/` folder is in your repository
- Verify paths in your templates are correct
- Files should be at: `/home/YOUR_USERNAME/todos/static/`

### Template files not found:

- Check that `templates/` folder is in your repository
- Verify folder name is exactly `templates` (not `template`)

### Module not found errors:

1. Make sure virtual environment is activated in WSGI file
2. Check that all dependencies are installed:
   ```bash
   source venv/bin/activate
   pip list
   ```
3. Reinstall if needed:
   ```bash
   pip install -r requirements.txt
   ```

### App reloads but shows "Hello from Flask":

- Check WSGI file - make sure it imports `from app import app`
- Verify the path to your project is correct

---

## Updating Your App

When you make changes to your code:

1. **Pull latest code from GitHub:**
   ```bash
   cd ~/todos
   git pull origin main
   ```

2. **Reload web app:**
   - Go to **Web** tab
   - Click **Reload** button

That's it! No need to restart anything else.

---

## File Structure on PythonAnywhere

Your files will be at:
```
/home/YOUR_USERNAME/todos/
├── app.py
├── requirements.txt
├── todos.db          (created automatically)
├── venv/             (virtual environment)
├── templates/
│   ├── index.html
│   ├── login.html
│   └── signup.html
└── static/
    ├── app.js
    ├── auth.js
    └── style.css
```

---

## Free Tier Limitations

- **App URL**: `YOUR_USERNAME.pythonanywhere.com`
- **CPU time**: 100 seconds/day
- **Web app**: Sleeps after 3 months of inactivity
- **Bash consoles**: Limited to 2 at a time
- **Storage**: 512MB
- **Outgoing web requests**: Only to whitelisted sites

**Good news:** Your todo app doesn't make outgoing requests, so it should work fine on free tier!

---

## Security Notes

1. **SECRET_KEY**: Set a strong random secret key in environment variables
2. **Database**: SQLite is fine for small apps, but data is stored on the server
3. **HTTPS**: Free tier includes SSL (HTTPS)
4. **Sessions**: Flask sessions are secure with a proper SECRET_KEY

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] PythonAnywhere account created
- [ ] Repository cloned in Bash console
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Web app created in Web tab
- [ ] Source code path set correctly
- [ ] WSGI file configured with correct paths
- [ ] SECRET_KEY environment variable set
- [ ] Web app reloaded
- [ ] App accessible at `YOUR_USERNAME.pythonanywhere.com`
- [ ] Tested signup/login
- [ ] Tested adding todos

---

## Next Steps After Deployment

1. **Custom domain** (optional, paid tier):
   - Add your own domain name
   - Configure DNS settings

2. **Monitor usage**:
   - Check **Tasks** tab for scheduled jobs
   - Monitor **Files** tab for storage

3. **Set up automatic backups**:
   - Download `todos.db` periodically
   - Or use GitHub for code backups

---

## Need Help?

If you encounter issues:

1. Check the **Error log** in Web tab
2. Check **Server log** in Web tab
3. Try running app locally in Bash console to see errors
4. Verify all paths use your actual username
5. Make sure virtual environment is activated

---

## Summary

**Deployment Steps:**
1. Push code to GitHub ✓
2. Create PythonAnywhere account ✓
3. Clone repo in Bash console ✓
4. Set up virtual environment ✓
5. Install dependencies ✓
6. Create Web app in Web tab ✓
7. Configure WSGI file ✓
8. Set SECRET_KEY environment variable ✓
9. Reload web app ✓
10. Test your app ✓

Your todo app should now be live at:
`https://YOUR_USERNAME.pythonanywhere.com`

