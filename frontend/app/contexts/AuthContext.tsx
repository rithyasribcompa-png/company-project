import React, { createContext, useContext, useEffect, useState } from "react";

interface User {

username:string;

role:string;

}

interface AuthContextType {

user: User | null;

login:(userData:User)=>void;

logout:()=>void;

isAuthenticated:boolean;

loading:boolean;

}

const AuthContext=createContext<AuthContextType|undefined>(undefined);


export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{

const [user,setUser]=useState<User|null>(null);

const [loading,setLoading]=useState(true);


// CHECK LOGIN FROM LOCAL STORAGE

useEffect(()=>{

const savedUser=localStorage.getItem("user");

if(savedUser){

try{

setUser(JSON.parse(savedUser));

}catch{

localStorage.removeItem("user");

}

}

setLoading(false);

},[]);


// LOGIN

const login=(userData:User)=>{

localStorage.setItem(

"user",

JSON.stringify(userData)

);

setUser(userData);

};


// LOGOUT

const logout=()=>{

localStorage.removeItem("user");
localStorage.removeItem("token");

setUser(null);

};


return(

<AuthContext.Provider

value={{

user,

login,

logout,

isAuthenticated:!!user,

loading

}}

>

{children}

</AuthContext.Provider>

);

};


export const useAuth=()=>{

const context=useContext(AuthContext);

if(!context){

throw new Error("useAuth must be used inside AuthProvider");

}

return context;

};