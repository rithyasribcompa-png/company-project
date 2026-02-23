const express = require("express");

const router = express.Router();

const db = require("../database");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();


// =======================================
// LOGIN USER
// POST /api/v1/users/login
// =======================================

router.post("/login",(req,res)=>{

const { username , password } = req.body;

if(!username || !password){

return res.status(400).json({

success:false,

message:"Username and Password Required"

});

}


// FIND USER

db.get(

`SELECT * FROM users WHERE username=?`,

[username],

async(err,user)=>{

if(err){

console.error(err);

return res.status(500).json({

success:false,

message:"Database Error"

});

}

if(!user){

return res.status(401).json({

success:false,

message:"Invalid Credentials"

});

}


// PASSWORD CHECK

const match = await bcrypt.compare(

password,

user.password

);

if(!match){

return res.status(401).json({

success:false,

message:"Invalid Credentials"

});

}


// CREATE JWT TOKEN

const token = jwt.sign(

{

id:user.id,

username:user.username,

role:user.role

},

process.env.JWT_SECRET || "construction_secret",

{

expiresIn:"8h"

}

);


// SEND RESPONSE

res.json({

success:true,

token,

user:{

id:user.id,

username:user.username,

role:user.role

}

});

}

);

});



// =======================================
// GET USERS (ADMIN ONLY)
// GET /api/v1/users
// =======================================

router.get("/",(req,res)=>{

db.all(

`SELECT id,username,role,createdAt FROM users`,

[],

(err,rows)=>{

if(err){

return res.status(500).json({

message:err.message

});

}

res.json(rows);

}

);

});



// =======================================
// ADD USER
// POST /api/v1/users
// =======================================

router.post("/",async(req,res)=>{

try{

const { username , password , role } = req.body;

if(!username || !password || !role){

return res.status(400).json({

message:"All fields required"

});

}


// HASH PASSWORD

const hashedPassword = await bcrypt.hash(

password,

10

);


db.run(

`INSERT INTO users

(username,password,role)

VALUES (?,?,?)`,

[username,hashedPassword,role],

function(err){

if(err){

return res.status(500).json({

error:err.message

});

}

res.status(201).json({

message:"User Added",

id:this.lastID

});

}

);

}catch(error){

console.error(error);

res.status(500).json({

message:"Server Error"

});

}

});


module.exports = router;