import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Worker, Project, AttendanceRecord, getData, setData, generateId, SalaryRecord } from '../lib/storage';
import { getDaysInMonth } from '../lib/utils';
import { Calendar, Download } from 'lucide-react';
import { exportToExcel } from '../lib/utils';
import { toast } from 'sonner';

export default function Attendance() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(){
    try{
      const [
        workersData,
        projectData,
        attendanceData
      ]= await Promise.all([
        getData<Worker>("workers"),
        getData<Project>("projects"),
        getData<AttendanceRecord>("attendance")
      ]);
      setWorkers(workersData);
      setProjects(projectData);
      setAttendance(attendanceData);
    }catch(err){
      toast.error("Failed to load attendance");
      console.error(err);
    }finally{
      setLoading(false);
    }
  }

  if(loading){
    return(
      <div className="h-screen flex justify-center items-center">Loading Attendance...</div>
    );
  }

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month);

  const filteredWorkers = selectedProject === 'all'
    ? workers
    : workers.filter((w) => w.assignedProject === selectedProject);

  const getAttendanceStatus = (workerId: string, day: number): 'P' | 'A' | 'H' | null => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendance.find((a) => a.workerId === workerId && a.date === date);
    return record ? record.status : null;
  };

  const markAttendance = (workerId: string, day: number, status: 'P' | 'A' | 'H') => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingRecord = attendance.find((a) => a.workerId === workerId && a.date === date);

    let updatedAttendance: AttendanceRecord[];

    if (existingRecord) {
      updatedAttendance = attendance.map((a) =>
        a.workerId === workerId && a.date === date ? { ...a, status } : a
      );
    } else {
      const worker = workers.find((w) => w.id === workerId);
      const newRecord: AttendanceRecord = {
        id: generateId(),
        workerId,
        date,
        status,
        projectId: worker?.assignedProject || '',
      };
      updatedAttendance = [...attendance, newRecord];
    }

    setData('attendance', updatedAttendance);
    setAttendance(updatedAttendance);
  };

  const calculateTotalDays = (workerId: string): number => {
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getAttendanceStatus(workerId, day);
      if (status === 'P') total += 1;
      if (status === 'H') total += 0.5;
    }
    return total;
  };

  const handleExport = () => {
    const exportData = filteredWorkers.map((worker) => {
      const row: any = {
        'Worker Name': worker.name,
        Role: worker.role,
        Project: worker.assignedProject,
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const status = getAttendanceStatus(worker.id, day);
        row[`Day ${day}`] = status || '-';
      }

      row['Total Days'] = calculateTotalDays(worker.id);
      return row;
    });

    exportToExcel(exportData, `Attendance_${selectedMonth}`);
    toast.success('Attendance exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Sheet</h2>
          <p className="text-sm text-gray-500 mt-1">Mark daily attendance for workers</p>
        </div>

        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter by Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                P
              </div>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">
                A
              </div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                H
              </div>
              <span>Half Day</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workers found. Add workers to mark attendance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-semibold border">
                      Worker Name
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <th
                        key={day}
                        className="px-2 py-3 text-center text-sm font-semibold border min-w-[40px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold border bg-blue-50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-4 py-2 border font-medium">
                        <div>
                          <div className="text-sm">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.role}</div>
                        </div>
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const status = getAttendanceStatus(worker.id, day);
                        return (
                          <td key={day} className="border p-1">
                            <select
                              value={status || ''}
                              onChange={(e) =>
                                markAttendance(
                                  worker.id,
                                  day,
                                  e.target.value as 'P' | 'A' | 'H'
                                )
                              }
                              className={`w-full h-8 text-center text-xs font-bold rounded border-none cursor-pointer ${
                                status === 'P'
                                  ? 'bg-green-500 text-white'
                                  : status === 'A'
                                  ? 'bg-red-500 text-white'
                                  : status === 'H'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <option value="">-</option>
                              <option value="P">P</option>
                              <option value="A">A</option>
                              <option value="H">H</option>
                            </select>
                          </td>
                        );
                      })}
                      <td className="border px-4 py-2 text-center font-bold bg-blue-50">
                        {calculateTotalDays(worker.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
