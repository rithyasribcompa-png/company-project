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
import { Plus, Download, Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import { Project, Worker, getData, setData, generateId } from '../lib/storage';
import api from "../lib/api";
import { formatCurrency, formatDate, exportToExcel } from '../lib/utils';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'active' as 'active' | 'completed' | 'pending',
  });

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    const projectData = await getData<Project>("projects");
    const workerData = await getData<Worker>("workers");
    setProjects(projectData || []);
    setWorkers(workerData || []);
  } catch (err) {
    console.log(err);
  }
};

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    const newProject: Project = {
      id: editingProject?.id || generateId(),
      name: formData.name,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: Number(formData.budget),
      status: formData.status,
      assignedWorkers: editingProject?.assignedWorkers || [],
    };

    if (editingProject) {
      const updated = projects.map((p) => (p.id === editingProject.id ? newProject : p));
      await setData('projects', updated);
      toast.success('Project updated successfully');
    } else {
      await setData('projects', [...projects, newProject]);
      toast.success('Project added successfully');
    }

    loadData();
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget.toString(),
      status: project.status as 'active' | 'completed' | 'pending',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const filtered = projects.filter((p) => p.id !== id);
      await setData('projects', filtered);
      loadData();
      toast.success('Project deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      budget: '',
      status: 'active',
    });
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const exportData = projects.map((p) => ({
      'Project Name': p.name,
      Location: p.location,
      'Start Date': p.startDate,
      'End Date': p.endDate,
      Budget: p.budget,
      Status: p.status,
      'Assigned Workers': getAssignedWorkersCount(p.name),
    }));

    exportToExcel(exportData, 'Projects');
    toast.success('Projects data exported successfully');
  };

  const getAssignedWorkersCount = (projectName: string): number => {
    return workers.filter((w) => w.assignedProject === projectName).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage construction projects</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Residential Complex"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingProject ? 'Update' : 'Add'} Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No projects found. Add your first project to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="font-semibold">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assigned Workers</span>
                      <span className="font-semibold">
                        {getAssignedWorkersCount(project.name)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
