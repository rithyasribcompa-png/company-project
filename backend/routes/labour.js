const express = require("express");
const router = express.Router();
const db = require("../database");
const verifyToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");


// ================= CREATE LABOUR =================

router.post(
"/",
verifyToken,
allowRoles("Admin","Supervisor"),
(req,res)=>{

const {

name,
contact,
role,
dailyWage,
assignedProject

}=req.body;

if(

!name ||

!contact ||

!role ||

dailyWage == null

){

return res.status(400).json({

message:"Missing required fields"

});

}

db.run(

`INSERT INTO labour
(name,contact,role,dailyWage,assignedProject)

VALUES (?,?,?,?,?)`,

[

name,
contact,
role,
dailyWage,
assignedProject

],

function(err){

if(err){

console.log(err);

return res.status(500).json({

message:err.message

});

}

res.json({

success:true,

data:{

id:this.lastID,

name,
contact,
role,
dailyWage,
assignedProject

}

});

}

);

}

);


// ================= GET ALL =================

router.get("/",verifyToken,(req,res)=>{

db.all(

`SELECT * FROM labour ORDER BY id DESC`,

[],

(err,rows)=>{

if(err){

return res.status(500).json({

message:err.message

});

}

res.json(rows || []);

}

);

});


// ================= GET ONE =================

router.get("/:id",verifyToken,(req,res)=>{

const {id}=req.params;

db.get(

`SELECT * FROM labour WHERE id=?`,

[id],

(err,row)=>{

if(err){

return res.status(500).json({

message:err.message

});

}

if(!row){

return res.status(404).json({

message:"Not found"

});

}

res.json(row);

}

);

});


// ================= UPDATE =================

router.put(

"/:id",

verifyToken,

allowRoles("Admin","Supervisor"),

(req,res)=>{

const {id}=req.params;

const {

name,
contact,
role,
dailyWage,
assignedProject

}=req.body;

db.run(

`UPDATE labour SET

name=?,
contact=?,
role=?,
dailyWage=?,
assignedProject=?

WHERE id=?`,

[

name,
contact,
role,
dailyWage,
assignedProject,
id

],

function(err){

if(err){

console.log(err);

return res.status(500).json({

message:err.message

});

}

if(this.changes===0){

return res.status(404).json({

message:"Not found"

});

}

res.json({

success:true

});

}

);

}

);


// ================= DELETE =================

router.delete(

"/:id",

verifyToken,

allowRoles("Admin","Supervisor"),

(req,res)=>{

const {id}=req.params;

db.run(

`DELETE FROM labour WHERE id=?`,

[id],

function(err){

if(err){

return res.status(500).json({

message:err.message

});

}

res.json({

success:true

});

}

);

}

);

module.exports = router;