import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle
} from '../components/ui/card';

import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext"; // ⭐ added


export default function Login() {

const [username,setUsername]=useState('');
const [password,setPassword]=useState('');
const [error,setError]=useState('');
const [loading,setLoading]=useState(false); // ⭐ added

const navigate = useNavigate();

const { login } = useAuth(); // ⭐ use auth context


const handleSubmit = async(e:React.FormEvent)=>{

e.preventDefault();

if(!username.trim() || !password.trim()){

setError("Enter username and password");

return;

}

setError("");
setLoading(true);

try{

const response = await api.post(

"/users/login",

{

username:username.trim(),
password

});

if(response.data.success){

// save token

localStorage.setItem(

"token",

response.data.token

);

// save user

localStorage.setItem(

"user",

JSON.stringify(response.data.user)

);

// ⭐ update auth context

login(response.data.user);

navigate("/");

}

else{

setError("Invalid username or password");

}

}

catch(error:any){

console.log(error);

setError(

error?.response?.data?.message

|| "Server Error"

);

}

finally{

setLoading(false);

}

};



return (

<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">

<Card className="w-full max-w-md">

<CardHeader className="text-center">

<div className="flex justify-center mb-4">

<div className="p-3 bg-blue-600 rounded-full">

<Building2 className="w-8 h-8 text-white"/>

</div>

</div>

<CardTitle className="text-2xl">

Construction Manager

</CardTitle>

<CardDescription>

Sign in to access your dashboard

</CardDescription>

</CardHeader>



<CardContent>

<form

onSubmit={handleSubmit}

className="space-y-4"

>

{error &&(

<Alert variant="destructive">

<AlertCircle className="h-4 w-4"/>

<AlertDescription>

{error}

</AlertDescription>

</Alert>

)}



<div className="space-y-2">

<Label htmlFor="username">

Username

</Label>

<Input

id="username"

type="text"

placeholder="Enter username"

value={username}

onChange={(e)=>

setUsername(e.target.value)

}

required

/>

</div>



<div className="space-y-2">

<Label htmlFor="password">

Password

</Label>

<Input

id="password"

type="password"

placeholder="Enter password"

value={password}

onChange={(e)=>

setPassword(e.target.value)

}

required

/>

</div>



<Button

type="submit"

className="w-full"

disabled={loading}

>

{loading ? "Signing In..." : "Sign In"}

</Button>

</form>



<div className="mt-6 p-4 bg-blue-50 rounded-lg">

<p className="text-sm font-semibold mb-2">

Demo Credentials:

</p>

<div className="text-xs space-y-1">

<p>

<strong>Admin:</strong>

admin / admin123

</p>

<p>

<strong>Supervisor:</strong>

supervisor / super123

</p>

<p>

<strong>Accountant:</strong>

accountant / account123

</p>

</div>

</div>

</CardContent>

</Card>

</div>

);

}