import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { breedsAPI, Breed } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const FARM_ID = 1; // TODO: Get from auth context

const Breeds = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [formData, setFormData] = useState<Partial<Breed>>({
    name: '',
    description: '',
  });

  // Fetch breeds
  const { data: breedsData, isLoading } = useQuery({
    queryKey: ['breeds', FARM_ID],
    queryFn: () => breedsAPI.getAll(FARM_ID)
  });

  // Create breed mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Breed>) => breedsAPI.create(FARM_ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds', FARM_ID] });
      toast({ title: 'Raza creada exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear raza',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Update breed mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Breed> }) =>
      breedsAPI.update(FARM_ID, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds', FARM_ID] });
      toast({ title: 'Raza actualizada exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar raza',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Delete breed mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => breedsAPI.delete(FARM_ID, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeds', FARM_ID] });
      toast({ title: 'Raza eliminada exitosamente' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar raza',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBreed?.id) {
      updateMutation.mutate({ id: editingBreed.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (breed: Breed) => {
    setEditingBreed(breed);
    setFormData(breed);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta raza?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBreed(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const breeds = breedsData?.items || [];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Razas</h1>
                <p className="text-sm text-muted-foreground">Administra las razas de ganado</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Raza
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBreed ? 'Editar Raza' : 'Nueva Raza'}</DialogTitle>
                  <DialogDescription>
                    {editingBreed ? 'Modifica los datos de la raza' : 'Completa los datos de la nueva raza'}
                  </DialogDescription>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingBreed ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Razas Registradas</CardTitle>
            <CardDescription>Lista de todas las razas de ganado en tu granja</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : breeds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay razas registradas. Crea una nueva raza para comenzar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Peso Promedio</TableHead>
                    <TableHead>Producción Láctea</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breeds.map((breed) => (
                    <TableRow key={breed.id}>
                      <TableCell className="font-medium">{breed.name}</TableCell>
                      <TableCell>{breed.description || '--'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(breed)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => breed.id && handleDelete(breed.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Breeds;
