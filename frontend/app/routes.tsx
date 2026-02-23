import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Labour from './pages/Labour';
import Attendance from './pages/Attendance';
import Salary from './pages/Salary';
import Materials from './pages/Materials';
import Projects from './pages/Projects';
import NotFound from './pages/NotFound';
import { useAuth } from "./contexts/AuthContext";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Checking login...</div>;
  return user ? children : <Navigate to="/login" replace />;
};
const RoleRoute = ({
children,
allowedRoles

}:{children:React.ReactNode,
allowedRoles:string[]
})=>{

const {user}=useAuth();

if(!user || !allowedRoles.includes(user.role)){

return <Navigate to="/" replace/>

}

return children;

};
// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
const { user, loading } = useAuth();
if (loading) return <div>Loading...</div>;
return !user ? children : <Navigate to="/" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'labour',
        Component: Labour,
      },
      {
        path: 'attendance',
        Component: Attendance,
      },
      {
path:'salary',

element:(

<RoleRoute allowedRoles={["Admin","Accountant"]}>

<Salary/>

</RoleRoute>

)

},
      {
        path: 'materials',
        Component: Materials,
      },
      {
        path: 'projects',
        Component: Projects,
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);

