import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogDescription
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { DollarSign, Download, FileText } from 'lucide-react';
import { Worker, SalaryRecord, AttendanceRecord, getData, setData, generateId } from '../lib/storage';
import { formatCurrency, calculateWorkingDays, exportToExcel } from '../lib/utils';
import { toast } from 'sonner';

export default function Salary() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState('');
  const [bonusDeduction, setBonusDeduction] = useState({ bonus: 0, deduction: 0 });
  
  const [loading,setLoading]=useState(true);
  useEffect(() => {
    loadData();
  }, []);
  

  async function loadData() {
    try{
      const workersData = await getData<Worker>("workers");
      const salaryData = await getData<SalaryRecord>("salaries");
      const attendanceData = await getData<AttendanceRecord>("attendance");
      setWorkers(workersData);
      setSalaries(salaryData);
      setAttendance(attendanceData);
    }catch(err){
      console.log(err);
      toast.error("Failed to load salary data");

    }finally{
      setLoading(false);
    }
  }

 if(loading){

return (

<div className="flex justify-center items-center py-20">

Loading Salary...

</div>

);

}

  const getSalaryData = () => {
    return workers.map((worker) => {
      const daysWorked = calculateWorkingDays(attendance, worker.id, selectedMonth);
      const existingSalary = salaries.find(
        (s) => s.workerId === worker.id && s.month === selectedMonth
      );

      const bonus = existingSalary?.bonus || 0;
      const deduction = existingSalary?.deduction || 0;
      const basicSalary = worker.dailyWage * daysWorked;
      const finalSalary = basicSalary + bonus - deduction;

      return {
        id: existingSalary?.id || generateId(),
        workerId: worker.id,
        workerName: worker.name,
        role: worker.role,
        dailyWage: worker.dailyWage,
        daysWorked,
        bonus,
        deduction,
        finalSalary,
      };
    });
  };

  const handleSaveBonusDeduction = async () => {
    const worker = workers.find((w) => w.id === editingWorkerId);
    if (!worker) return;

    const daysWorked = calculateWorkingDays(attendance, editingWorkerId, selectedMonth);
    const basicSalary = worker.dailyWage * daysWorked;
    const finalSalary = basicSalary + bonusDeduction.bonus - bonusDeduction.deduction;

    const existingSalary = salaries.find(
      (s) => s.workerId === editingWorkerId && s.month === selectedMonth
    );

    const salaryRecord: SalaryRecord = {
      id: existingSalary?.id || generateId(),
      workerId: editingWorkerId,
      month: selectedMonth,
      daysWorked,
      bonus: bonusDeduction.bonus,
      deduction: bonusDeduction.deduction,
      finalSalary,
    };

    let updatedSalaries: SalaryRecord[];
    if (existingSalary) {
      updatedSalaries = salaries.map((s) =>
        s.workerId === editingWorkerId && s.month === selectedMonth ? salaryRecord : s
      );
    } else {
      updatedSalaries = [...salaries, salaryRecord];
    }

    await setData('salaries', updatedSalaries);
    setSalaries(updatedSalaries);
    await loadData();
    setIsDialogOpen(false);
    toast.success('Bonus/Deduction updated successfully');
  };

  const openBonusDialog = (workerId: string) => {
    const existingSalary = salaries.find(
      (s) => s.workerId === workerId && s.month === selectedMonth
    );
    setEditingWorkerId(workerId);
    setBonusDeduction({
      bonus: existingSalary?.bonus ?? 0,
      deduction: existingSalary?.deduction ?? 0,
    });
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = getSalaryData().map((row) => ({
      'Worker Name': row.workerName,
      Role: row.role,
      'Daily Wage': row.dailyWage,
      'Days Worked': row.daysWorked,
      'Basic Salary': row.dailyWage * row.daysWorked,
      Bonus: row.bonus,
      Deduction: row.deduction,
      'Final Salary': row.finalSalary,
    }));

    exportToExcel(exportData, `Salary_${selectedMonth}`);
    toast.success('Salary sheet exported successfully');
  };

  const generatePayslip = (workerData: any) => {
    const content = `
=== PAYSLIP ===
Month: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Worker: ${workerData.workerName}
Role: ${workerData.role}

Daily Wage: ${formatCurrency(workerData.dailyWage)}
Days Worked: ${workerData.daysWorked}
Basic Salary: ${formatCurrency(workerData.dailyWage * workerData.daysWorked)}

Bonus: ${formatCurrency(workerData.bonus)}
Deduction: ${formatCurrency(workerData.deduction)}

FINAL SALARY: ${formatCurrency(workerData.finalSalary)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${workerData.workerName}_${selectedMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payslip generated');
  };

  const salaryData = getSalaryData();
  const totalSalary = salaryData.reduce((sum, row) => sum + row.finalSalary, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salary Sheet</h2>
          <p className="text-sm text-gray-500 mt-1">Manage monthly salaries with auto-calculation</p>
        </div>

        <Button className="shadow-sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Month Selection & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Label>Select Month</Label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Total Monthly Payroll
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSalary)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Salary Sheet - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Daily Wage</TableHead>
                  <TableHead className="text-right">Days Worked</TableHead>
                  <TableHead className="text-right">Basic Salary</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Deduction</TableHead>
                  <TableHead className="text-right">Final Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No workers found. Add workers to calculate salaries.
                    </TableCell>
                  </TableRow>
                ) : (
                  salaryData.map((row) => (
                    <TableRow key={row.workerId}>
                      <TableCell className="font-medium">{row.workerName}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell className="text-right">₹{row.dailyWage}</TableCell>
                      <TableCell className="text-right">{row.daysWorked}</TableCell>
                      <TableCell className="text-right">
                        ₹{(row.dailyWage * row.daysWorked).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        +₹{row.bonus}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -₹{row.deduction}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{row.finalSalary.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBonusDialog(row.workerId)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePayslip(row)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bonus/Deduction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
className="max-w-md"
aria-describedby="bonus-desc"
>
          <DialogHeader>

<DialogTitle>

Edit Bonus & Deduction

</DialogTitle>

<DialogDescription id="bonus-desc">

Update worker bonus and deduction for selected month.

</DialogDescription>

</DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (₹)</Label>
              <Input
                id="bonus"
                type="number"
                value={bonusDeduction.bonus}
                onChange={(e) =>
                  setBonusDeduction({ ...bonusDeduction, bonus: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction">Deduction (₹)</Label>
              <Input
                id="deduction"
                type="number"
                value={bonusDeduction.deduction}
                onChange={(e) =>
                  setBonusDeduction({ ...bonusDeduction, deduction: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBonusDeduction}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
