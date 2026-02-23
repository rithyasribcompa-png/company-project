import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, FolderOpen, Package, DollarSign, Calendar } from 'lucide-react';
import { getData, Worker, Project, Material, AttendanceRecord } from '../lib/storage';
import { formatCurrency, getCurrentMonth, calculateWorkingDays } from '../lib/utils';
import { toast } from 'sonner';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeProjects: 0,
    totalMaterials: 0,
    monthlySalary: 0,
    todayPresent: 0,
    todayAbsent: 0,
  });
const [loading,setLoading]=useState(true);

const loadDashboard = async()=>{

try{

const [

workers,

projects,

materials,

attendance

]= await Promise.all([

getData<Worker>("workers"),

getData<Project>("projects"),

getData<Material>("materials"),

getData<AttendanceRecord>("attendance")

]);

const activeProjects = projects.filter(

p=>p.status==="active"

).length;

const totalMaterialsQty = materials.reduce(

(sum,m)=>sum+m.quantity,

0

);

const currentMonth = getCurrentMonth();

let monthlySalary=0;

workers.forEach(worker=>{

const daysWorked=

calculateWorkingDays(

attendance,

worker.id,

currentMonth

);

monthlySalary +=

worker.dailyWage * daysWorked;

});

const today=

new Date()

.toISOString()

.split("T")[0];

const todayAttendance=

attendance.filter(

a=>a.date===today

);

const todayPresent=

todayAttendance.filter(

a=>a.status==="P" || a.status==="H"

).length;

const todayAbsent=

todayAttendance.filter(

a=>a.status==="A"

).length;

setStats({

totalWorkers:workers.length,

activeProjects,

totalMaterials:totalMaterialsQty,

monthlySalary,

todayPresent,

todayAbsent

});

}catch(err){

toast.error("Dashboard Load Failed");

console.error(err);

}finally{

setLoading(false);

}

};
  useEffect(() =>  {
    loadDashboard();
  }, []);

  const cards = [
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Materials in Stock',
      value: stats.totalMaterials,
      icon: Package,
      color: 'bg-orange-500',
    },
    {
      title: 'Monthly Salary',
      value: formatCurrency(stats.monthlySalary),
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of your construction business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">{stats.todayPresent}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">{stats.todayAbsent}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalWorkers > 0
                  ? Math.round((stats.todayPresent / stats.totalWorkers) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Total Workers Registered</span>
                <span className="text-sm font-semibold">{stats.totalWorkers}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Active Construction Sites</span>
                <span className="text-sm font-semibold">{stats.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Estimated Monthly Payroll</span>
                <span className="text-sm font-semibold">{formatCurrency(stats.monthlySalary)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Data Storage</span>
                <span className="text-sm font-semibold">Local Server (SQLite Database)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-semibold">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-semibold text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Welcome to Construction Manager! Here's what you can do:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Labour Management:</strong> Add, edit, and manage your workforce</li>
              <li><strong>Attendance:</strong> Mark daily attendance with Excel-like interface</li>
              <li><strong>Salary:</strong> Auto-calculate salaries based on attendance</li>
              <li><strong>Materials:</strong> Track inventory and costs</li>
              <li><strong>Projects:</strong> Manage multiple construction sites</li>
              <li><strong>Export/Import:</strong> Use Excel files for bulk operations</li>
            </ul>
            <p className="text-xs text-gray-600 mt-4">
              <strong>Note:</strong> Data is stored locally in your browser. Clear browser data will remove all records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}