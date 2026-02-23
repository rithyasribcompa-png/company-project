# 🚀 QUICK START GUIDE

## 30-Second Setup

```bash
cd c:\Users\gopin\Documents\test_one\try_new\web_run\figma\company-project
npm run dev
```

**Wait 30 seconds**, then open:
```
http://localhost:5175
```

---

## 🔑 Demo Accounts

Copy & paste any of these credentials:

### Admin Account
```
Username: admin
Password: admin123
```

### Supervisor Account
```
Username: supervisor
Password: super123
```

### Accountant Account
```
Username: accountant
Password: account123
```

---

## 📖 What to Try First

### 1️⃣ Login
- Enter any credentials above
- Click "Login"
- You should see the Dashboard

### 2️⃣ Add a Worker
- Click "Labour" tab
- Click "Add Worker" button
- Fill in:
  - Name: `John Doe`
  - Contact: `9876543210`
  - Role: `Mason`
  - Daily Wage: `500`
- Click "Add Worker"
- See the worker appear in the table

### 3️⃣ Add a Project
- Click "Projects" tab
- Click "Add Project" button
- Fill in:
  - Name: `Building A`
  - Location: `Delhi`
  - Start Date: Pick today
  - Budget: `100000`
- Click "Add Project"

### 4️⃣ Export Data
- In any page (Labour, Projects, etc.)
- Click "Export" button
- Your data downloads as Excel file

### 5️⃣ Import Data
- In any page, click "Import" button
- Select your Excel file
- Data uploads and appears in the table

---

## ⚙️ Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5175 |
| Backend API | http://localhost:5000 |
| DB | SQLite (file-based) |

---

## 🛑 Troubleshooting

### "Connection refused" error?
→ Run `npm run dev` in the project root

### Ports already in use?
→ Kill the process: see TROUBLESHOOTING.md

### Lost login?
→ Refresh page and log in again

### Data not saving?
→ Check browser console for errors (F12)

---

## 📂 File Structure

```
company-project/
├── backend/          ← API server
├── frontend/         ← React app
├── database.db       ← Your data
├── SETUP_COMPLETE.md ← Full guide
├── TROUBLESHOOTING.md ← Help
└── PROJECT_REPORT.md ← Status
```

---

## 🎮 Features Overview

| Feature | Location | What it does |
|---------|----------|------------|
| **Labour Management** | Labour tab | Hire, fire, track workers |
| **Projects** | Projects tab | Create and manage projects |
| **Materials** | Materials tab | Track construction materials |
| **Attendance** | Attendance tab | Mark daily worker attendance |
| **Salary** | Salary tab | Calculate monthly salaries |
| **Dashboard** | Home tab | Overview of all data |

---

## 💡 Pro Tips

1. **Bulk Operations**: Use Export to save data, Import to load it back
2. **Search**: Use search bar to filter workers, projects, etc.
3. **Multiple Tabs**: Open in Chrome/Firefox for better performance
4. **Excel Integration**: Data is Excel-compatible (export/import)
5. **API Direct**: Hit endpoints directly with Postman: `http://localhost:5000/api/v1/labour`

---

## 🐛 Report Issues

If something doesn't work:
1. Check TROUBLESHOOTING.md
2. Look at browser console (F12 → Console tab)
3. Check terminal output (where npm run dev is running)
4. Restart: Ctrl+C in terminal, then `npm run dev` again

---

## 📞 Need Help?

- **API Questions**: See SETUP_COMPLETE.md → API Endpoints Reference
- **Errors**: See TROUBLESHOOTING.md
- **Status**: See PROJECT_REPORT.md
- **Development**: See code comments in `/backend` and `/frontend`

---

**Version**: 1.0.0 ✅  
**Status**: Production Ready 🟢  
**Last Updated**: 23-02-2026

---

**Enjoy your Construction Management System!** 🏗️
