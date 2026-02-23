import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getData, addItem, updateItem, deleteItem } from "../lib/storage";
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
import { Plus, Download, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Material, Project } from '../lib/storage';
import { formatCurrency, exportToExcel } from '../lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    costPerUnit: '',
    projectUsed: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, projectsData] = await Promise.all([
        getData<Material>("materials"),
        getData<Project>("projects"),
      ]);
      setMaterials(materialsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newMaterial = {
      name: formData.name,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      costPerUnit: Number(formData.costPerUnit),
      projectUsed: formData.projectUsed,
    };

    if (editingMaterial) {
      await updateItem("materials", editingMaterial.id, newMaterial as any);
      toast.success("Material updated");
    } else {
      await addItem("materials", newMaterial as any);
      toast.success("Material added");
    }

    loadData();
    resetForm();
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit,
      costPerUnit: material.costPerUnit.toString(),
      projectUsed: material.projectUsed,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await deleteItem('materials', id);
      loadData();
      toast.success('Material deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
      costPerUnit: '',
      projectUsed: '',
    });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const exportData = materials.map((m) => ({
      'Material Name': m.name,
      Quantity: m.quantity,
      Unit: m.unit,
      'Cost per Unit': m.costPerUnit,
      'Total Cost': m.quantity * m.costPerUnit,
      'Project Used': m.projectUsed,
    }));

    exportToExcel(exportData, 'Materials_Stock');
    toast.success('Materials data exported successfully');
  };

  const lowStockMaterials = materials.filter((m) => m.quantity < 10);
  const totalValue = materials.reduce((sum, m) => sum + m.quantity * m.costPerUnit, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Materials & Stock</h2>
          <p className="text-sm text-gray-500 mt-1">Track materials and inventory</p>
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
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Material Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cement, Steel, Bricks"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="kg, bags, pieces"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPerUnit">Cost per Unit (₹)</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectUsed">Project Used</Label>
                  <select
                    id="projectUsed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.projectUsed}
                    onChange={(e) => setFormData({ ...formData, projectUsed: e.target.value })}
                  >
                    <option value="">General Stock</option>
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
                  <Button type="submit">{editingMaterial ? 'Update' : 'Add'} Material</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Low Stock Alert:</strong> {lowStockMaterials.length} material(s) have quantity less than 10.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{lowStockMaterials.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Project Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No materials found. Add your first material to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => {
                    const totalCost = material.quantity * material.costPerUnit;
                    const isLowStock = material.quantity < 10;

                    return (
                      <TableRow key={material.id} className={isLowStock ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {material.name}
                            {isLowStock && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{material.quantity}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell className="text-right">₹{material.costPerUnit}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{totalCost.toFixed(2)}
                        </TableCell>
                        <TableCell>{material.projectUsed || 'General Stock'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(material)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(material.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
