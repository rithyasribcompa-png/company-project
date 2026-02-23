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
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Plus, Search, Download, Upload, Edit, Trash2 } from 'lucide-react';
import { Worker, Project, getData, setData, generateId, updateItem } from '../lib/storage';
import { exportToExcel, importFromExcel } from '../lib/utils';
import { toast } from 'sonner';

export default function Labour() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    role: '',
    dailyWage: '',
    assignedProject: '',
  });
  
  async function loadData() {
    try{
      const [workersData,projectsData]= await Promise.all([
        getData<Worker>("workers"),
        getData<Project>("projects")
      ]);
      setWorkers(workersData);
      setProjects(projectsData);
    }catch(err){
      toast.error("Failed loading workers");
      console.error(err);
    }finally{
      setLoading(false);
    }
  }
  const [loading,setLoading]=useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  if(loading){

return(

<div className="h-screen flex justify-center items-center">

Loading Workers...

</div>

);

}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newWorker: Worker = {
      id: editingWorker?.id || generateId(),
      name: formData.name,
      contact: formData.contact,
      role: formData.role,
      dailyWage: Number(formData.dailyWage),
      assignedProject: formData.assignedProject,
    };

    if (editingWorker) {

await updateItem(

"labour",

String(editingWorker.id),

newWorker

);

toast.success("Worker updated successfully");

}else {
      await setData("workers",[...workers,newWorker]);
      toast.success('Worker added successfully');
    }

    await loadData();
    resetForm();
  };

const handleEdit = (worker: Worker) => {

if(!worker){

toast.error("Worker data missing");

return;

}

setEditingWorker({

...worker,

id:String(worker.id ?? "")

});


setFormData({

name: worker.name ?? "",

contact: worker.contact ?? "",

role: worker.role ?? "",

// SAFE CONVERSION ⭐

dailyWage:

worker.dailyWage != null

? String(worker.dailyWage)

: "",

assignedProject:

worker.assignedProject ?? ""

});

setIsDialogOpen(true);

};

  const handleDelete = async(id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      const filtered = workers.filter((w) => w.id !== id);
      await setData("workers",filtered);
      loadData();
      toast.success('Worker deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      role: '',
      dailyWage: '',
      assignedProject: '',
    });
    setEditingWorker(null);
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const exportData = workers.map((w) => ({
      'Worker ID': w.id,
      Name: w.name,
      Contact: w.contact,
      Role: w.role,
      'Daily Wage': w.dailyWage,
      'Assigned Project': w.assignedProject,
    }));
    exportToExcel(exportData, 'Workers_Data');
    toast.success('Data exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      const imported: Worker[] = data.map((row: any) => ({
        id: generateId(),
        name: row.Name || '',
        contact: row.Contact || '',
        role: row.Role || '',
        dailyWage: Number(row['Daily Wage']) || 0,
        assignedProject: row['Assigned Project'] || '',
      }));

      await setData('workers', [...workers, ...imported]);
      loadData();
      toast.success(`Imported ${imported.length} workers`);
    } catch (error) {
      toast.error('Failed to import data');
    }

    e.target.value = '';
  };

  const filteredWorkers = workers.filter((worker) =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.contact.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Labour Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your workforce</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Mason, Carpenter, Helper"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyWage">Daily Wage (₹)</Label>
                  <Input
                    id="dailyWage"
                    type="number"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Assigned Project</Label>
                  <select
                    id="project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.assignedProject}
                    onChange={(e) => setFormData({ ...formData, assignedProject: e.target.value })}
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingWorker ? 'Update' : 'Add'} Worker
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, role, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workers ({filteredWorkers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Daily Wage</TableHead>
                  <TableHead>Assigned Project</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No workers found. Add your first worker to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-mono text-xs">{String(worker.id).slice(0,8)}</TableCell>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.contact}</TableCell>
                      <TableCell>{worker.role}</TableCell>
                      <TableCell>₹{worker.dailyWage}</TableCell>
                      <TableCell>{worker.assignedProject || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(worker)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(worker.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
    </div>
  );
}
