const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req,res,next)=>{

const header = req.headers.authorization;

if(!header){

return res.status(401).json({

message:"Access Denied"

});

}

const token = header.split(" ")[1];

try{

const decoded = jwt.verify(
	token,
	process.env.JWT_SECRET || "construction_secret"
);

req.user = decoded;

next();

}catch(err){

return res.status(403).json({

message:"Invalid Token"

});

}

};

module.exports = verifyToken;