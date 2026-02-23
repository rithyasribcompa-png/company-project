// =======================
// IMPORTS
// =======================

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");


// =======================
// CREATE DATABASE
// =======================

const db = new sqlite3.Database("./database.db",(err)=>{

if(err){

console.error("❌ Database Error :",err.message);

}else{

console.log("✅ Database Connected");

}

});


// Enable FK
db.run("PRAGMA foreign_keys = ON");


// =======================
// TABLES
// =======================

db.serialize(async()=>{


// USERS

db.run(`

CREATE TABLE IF NOT EXISTS users(

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE NOT NULL,

password TEXT NOT NULL,

role TEXT NOT NULL,

createdAt DATETIME DEFAULT CURRENT_TIMESTAMP

)

`,(err)=>{

if(err) console.log(err.message);

else console.log("✅ Users Ready");

});



// LABOUR ⭐⭐⭐⭐⭐

db.run(`

CREATE TABLE IF NOT EXISTS labour(

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT NOT NULL,

contact TEXT,

role TEXT,

dailyWage REAL DEFAULT 0,

assignedProject TEXT,

createdAt DATETIME DEFAULT CURRENT_TIMESTAMP

)

`,(err)=>{

if(err) console.log(err.message);

else console.log("✅ Labour Ready");

});



// PROJECTS

db.run(`

CREATE TABLE IF NOT EXISTS projects(

id TEXT PRIMARY KEY,

name TEXT,

location TEXT,

startDate TEXT,

endDate TEXT,

budget REAL,

status TEXT,

assignedWorkers TEXT

)

`);


// MATERIALS

db.run(`

CREATE TABLE IF NOT EXISTS materials(

id TEXT PRIMARY KEY,

name TEXT,

quantity REAL,

unit TEXT,

costPerUnit REAL,

projectUsed TEXT

)

`);


// ATTENDANCE

db.run(`

CREATE TABLE IF NOT EXISTS attendance(

id TEXT PRIMARY KEY,

workerId TEXT,

date TEXT,

status TEXT,

projectId TEXT

)

`);


// SALARIES

db.run(`

CREATE TABLE IF NOT EXISTS salaries(

id TEXT PRIMARY KEY,

workerId TEXT,

month TEXT,

daysWorked REAL,

bonus REAL,

deduction REAL,

finalSalary REAL

)

`);




// DEMO USERS

try{

const admin=await bcrypt.hash("admin123",10);

const supervisor=await bcrypt.hash("super123",10);

const accountant=await bcrypt.hash("account123",10);

db.run(

`

INSERT OR IGNORE INTO users

(username,password,role)

VALUES

(?,?,?),

(?,?,?),

(?,?,?)

`,

[

"admin",admin,"Admin",

"supervisor",supervisor,"Supervisor",

"accountant",accountant,"Accountant"

],

()=>{

console.log("✅ Demo Users Ready");

}

);

}catch(e){

console.log("Hash error",e);

}

});


module.exports=db;