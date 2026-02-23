import React from "react";
import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Package,
  FolderOpen,
  LogOut,
  Menu,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../components/ui/sheet";

const Layout: React.FC = () => {

const { user, logout, loading } = useAuth();

const navigate = useNavigate();
const location = useLocation();


// ---------- Loading ----------
if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      Loading...
    </div>
  );
}


// ---------- Logout ----------
const handleLogout = () => {

logout();

navigate("/login");

};


// ---------- Navigation ----------
const navigation = [

{
name:"Dashboard",
href:"/",
icon:LayoutDashboard,
roles:["Admin","Supervisor","Accountant"]
},

{
name:"Labour",
href:"/labour",
icon:Users,
roles:["Admin"]
},

{
name:"Attendance",
href:"/attendance",
icon:Calendar,
roles:["Admin","Supervisor"]
},

{
name:"Salary",
href:"/salary",
icon:DollarSign,
roles:["Admin","Accountant"]
},

{
name:"Materials",
href:"/materials",
icon:Package,
roles:["Admin","Accountant"]
},

{
name:"Projects",
href:"/projects",
icon:FolderOpen,
roles:["Admin","Supervisor"]
}

];


// ---------- Role Filter ----------
const filteredNav = navigation.filter(

(item)=> item.roles.includes(user?.role ?? "")

);


// ---------- Sidebar Links ----------
const NavLinks = () => (

<>

{filteredNav.map((item)=>{

const Icon=item.icon;

const active =

location.pathname === "/"

? location.pathname === item.href

: location.pathname.startsWith(item.href);


return(

<Link

key={item.name}

to={item.href}

className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all

${active

? "bg-blue-600 text-white"

:"text-gray-700 hover:bg-gray-100"

}

`}

>

<Icon className="w-5 h-5"/>

<span>{item.name}</span>

</Link>

);

})}

</>

);


// ---------- Layout ----------
return (

<div className="min-h-screen flex flex-col bg-gray-50">


{/* ================= HEADER ================= */}

<header className="bg-white border-b sticky top-0 z-10">

<div className="flex justify-between items-center px-4 py-3">


{/* Mobile Menu + Title */}

<div className="flex items-center gap-3">

<Sheet>

<SheetTrigger asChild>

<Button
variant="ghost"
size="icon"
className="lg:hidden"
>

<Menu className="w-5 h-5"/>

</Button>

</SheetTrigger>

<SheetContent side="left" className="w-64">

<nav className="flex flex-col gap-2 mt-6">

<NavLinks/>

</nav>

</SheetContent>

</Sheet>

<h1 className="font-bold text-xl">

Construction Manager

</h1>

</div>



{/* User Info */}

<div className="flex items-center gap-4">

<div>

<p className="text-sm font-semibold">

{user?.username}

</p>

<p className="text-xs capitalize">

{user?.role}

</p>

</div>

<Button
variant="ghost"
size="icon"
aria-label="Logout"
onClick={handleLogout}
>

<LogOut className="w-5 h-5"/>

</Button>

</div>

</div>

</header>



{/* ================= BODY ================= */}

<div className="flex flex-1">


{/* ---------- Sidebar ---------- */}

<aside className="hidden lg:block w-64 bg-white border-r">

<nav className="p-4 flex flex-col gap-2">

<NavLinks/>

</nav>

</aside>



{/* ---------- Main + Footer ---------- */}

<div className="flex flex-col flex-1">


{/* MAIN */}

<main className="flex-1 p-6 overflow-auto">

<Outlet/>

</main>



{/* FOOTER */}

<footer className="bg-white border-t px-6 py-3 text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2">

<p>

© {new Date().getFullYear()} Construction Manager. All Rights Reserved.

</p>

<p>

Developed by

<span className="font-semibold text-blue-600 ml-1">

Gopinath .R and Rithyasri .S

</span>

</p>

</footer>


</div>

</div>

</div>

);

};

export default Layout;