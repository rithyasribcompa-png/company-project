const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('DB open error', err.message);
});
// Print tables
db.all("SELECT name, type, sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY name", [], (err, rows) => {
  if (err) {
    console.error('sqlite_master error', err.message);
    db.close();
    return;
  }
  console.log('Schema objects:', JSON.stringify(rows, null, 2));

  // Print users table info and contents if exists
  db.all("PRAGMA table_info('users')", [], (err2, cols) => {
    if (err2) {
      console.error('PRAGMA error', err2.message);
      db.close();
      return;
    }
    console.log('Users table columns:', JSON.stringify(cols, null, 2));

    db.all('SELECT id, username, password, role FROM users', [], (err3, rows3) => {
      if (err3) {
        console.error('Query error', err3.message);
      } else {
        console.log('Users rows:', JSON.stringify(rows3, null, 2));
      }
      db.close();
    });
  });
});
