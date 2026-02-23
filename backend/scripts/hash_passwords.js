const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.db');

(async function(){
  const db = new sqlite3.Database(dbPath, (err)=>{ if(err) return console.error('DB open error',err.message); });

  db.all("SELECT id, username, password FROM users", [], async (err, rows) => {
    if(err){ console.error(err.message); db.close(); return; }
    for(const row of rows){
      const p = row.password || '';
      if(!p.startsWith('$2')){
        try{
          const hash = await bcrypt.hash(p, 10);
          await new Promise((res, rej)=>{
            db.run('UPDATE users SET password=? WHERE id=?', [hash, row.id], function(err){ if(err) return rej(err); res(); });
          });
          console.log('Updated user', row.username);
        }catch(e){ console.error('Hash error', e); }
      } else {
        console.log('Already hashed', row.username);
      }
    }
    db.close();
  });
})();
