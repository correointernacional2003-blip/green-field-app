import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsAPI, Animal } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const FARM_ID = 1; // TODO: Get from auth context

const Animals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState<Partial<Animal>>({
    name: '',
    earring: '',
    birthDate: '',
    sex: 'FEMALE',
    lotId: 0,
    breedId: 0,
    paddockId: 0,
    entry: '',
    acquisition: '',
    origin: '',
    status: 'ACTIVE',
    weight: 0,
    color: '',
    observations: '',
  });

  // Fetch animals
  const { data: animalsData, isLoading } = useQuery({
    queryKey: ['animals', FARM_ID],
    queryFn: () => animalsAPI.getAll(FARM_ID, { page: 0, size: 100 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Animal>) => animalsAPI.create(FARM_ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', FARM_ID] });
      toast({ title: 'Animal creado exitosamente' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error al crear animal', 
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive' 
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Animal> }) => 
      animalsAPI.update(FARM_ID, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', FARM_ID] });
      toast({ title: 'Animal actualizado exitosamente' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error al actualizar animal', 
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive' 
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => animalsAPI.delete(FARM_ID, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', FARM_ID] });
      toast({ title: 'Animal eliminado exitosamente' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error al eliminar animal', 
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      earring: '',
      birthDate: '',
      sex: 'FEMALE',
      lotId: 0,
      breedId: 0,
      paddockId: 0,
      entry: '',
      acquisition: '',
      origin: '',
      status: 'ACTIVE',
      weight: 0,
      color: '',
      observations: '',
    });
    setEditingAnimal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnimal) {
      updateMutation.mutate({ id: editingAnimal.id!, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData(animal);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este animal?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const animals = animalsData?.content || [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Gestión de Animales</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAnimal ? 'Editar Animal' : 'Crear Nuevo Animal'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earring">Arete *</Label>
                    <Input
                      id="earring"
                      value={formData.earring}
                      onChange={(e) => setFormData({ ...formData, earring: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sexo *</Label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value: 'MALE' | 'FEMALE') => 
                        setFormData({ ...formData, sex: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Macho</SelectItem>
                        <SelectItem value="FEMALE">Hembra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lotId">ID Lote *</Label>
                    <Input
                      id="lotId"
                      type="number"
                      value={formData.lotId}
                      onChange={(e) => setFormData({ ...formData, lotId: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breedId">ID Raza *</Label>
                    <Input
                      id="breedId"
                      type="number"
                      value={formData.breedId}
                      onChange={(e) => setFormData({ ...formData, breedId: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paddockId">ID Potrero *</Label>
                    <Input
                      id="paddockId"
                      type="number"
                      value={formData.paddockId}
                      onChange={(e) => setFormData({ ...formData, paddockId: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry">Entrada *</Label>
                    <Input
                      id="entry"
                      type="date"
                      value={formData.entry}
                      onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acquisition">Adquisición *</Label>
                    <Input
                      id="acquisition"
                      value={formData.acquisition}
                      onChange={(e) => setFormData({ ...formData, acquisition: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origen *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'ACTIVE' | 'SOLD' | 'DECEASED' | 'TRANSFERRED') => 
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="SOLD">Vendido</SelectItem>
                        <SelectItem value="DECEASED">Fallecido</SelectItem>
                        <SelectItem value="TRANSFERRED">Transferido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAnimal ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Animales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : animals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay animales registrados. Crea uno nuevo para comenzar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arete</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Sexo</TableHead>
                      <TableHead>Fecha Nacimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animals.map((animal: Animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.earring}</TableCell>
                        <TableCell>{animal.name}</TableCell>
                        <TableCell>{animal.sex === 'MALE' ? 'Macho' : 'Hembra'}</TableCell>
                        <TableCell>{new Date(animal.birthDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            animal.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            animal.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                            animal.status === 'DECEASED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {animal.status === 'ACTIVE' ? 'Activo' :
                             animal.status === 'SOLD' ? 'Vendido' :
                             animal.status === 'DECEASED' ? 'Fallecido' : 'Transferido'}
                          </span>
                        </TableCell>
                        <TableCell>{animal.weight || '-'}</TableCell>
                        <TableCell>{animal.lotId}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(animal)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(animal.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Animals;