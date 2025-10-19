import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { paddocksAPI, Paddock } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const FARM_ID = 1; // TODO: Get from auth context

const Paddocks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaddock, setEditingPaddock] = useState<Paddock | null>(null);
  const [formData, setFormData] = useState<Partial<Paddock>>({
    name: '',
    description: '',
    surface: undefined,
    type: 'PASTURE',
    location: ''
  });

  // Fetch paddocks
  const { data: paddocksData, isLoading } = useQuery({
    queryKey: ['paddocks', FARM_ID],
    queryFn: () => paddocksAPI.getAll(FARM_ID)
  });

  // Create paddock mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Paddock>) => paddocksAPI.create(FARM_ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paddocks', FARM_ID] });
      toast({ title: 'Potrero creado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear potrero',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Update paddock mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Paddock> }) =>
      paddocksAPI.update(FARM_ID, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paddocks', FARM_ID] });
      toast({ title: 'Potrero actualizado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar potrero',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Delete paddock mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => paddocksAPI.delete(FARM_ID, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paddocks', FARM_ID] });
      toast({ title: 'Potrero eliminado exitosamente' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar potrero',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaddock?.id) {
      updateMutation.mutate({ id: editingPaddock.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (paddock: Paddock) => {
    setEditingPaddock(paddock);
    setFormData(paddock);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este potrero?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPaddock(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surface: undefined,
      type: 'PASTURE',
      description: '',
      location: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      AVAILABLE: 'default',
      OCCUPIED: 'secondary',
      MAINTENANCE: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const paddocks = paddocksData?.items || [];

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
                <h1 className="text-2xl font-bold text-foreground">Gestión de Potreros</h1>
                <p className="text-sm text-muted-foreground">Administra los espacios físicos de la finca</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Potrero
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPaddock ? 'Editar Potrero' : 'Nuevo Potrero'}</DialogTitle>
                  <DialogDescription>
                    {editingPaddock ? 'Modifica los datos del potrero' : 'Completa los datos del nuevo potrero'}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Paddock['type'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PASTURE">Pastizal</SelectItem>
                          <SelectItem value="CORRAL">Corral</SelectItem>
                          <SelectItem value="STABLE">Establo</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Área (hectáreas)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={formData.surface || ''}
                        onChange={(e) => setFormData({ ...formData, surface: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Sector norte, cerca del río"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder=""
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingPaddock ? 'Actualizar' : 'Crear'}
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
            <CardTitle>Potreros Registrados</CardTitle>
            <CardDescription>Lista de todos los espacios físicos de tu finca</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : paddocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay potreros registrados. Crea un nuevo potrero para comenzar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paddocks.map((paddock) => (
                    <TableRow key={paddock.id}>
                      <TableCell className="font-medium">{paddock.id}</TableCell>
                      <TableCell>{paddock.name}</TableCell>
                      <TableCell>{paddock.type}</TableCell>
                      <TableCell>{paddock.surface ? `${paddock.surface} ha` : '-'}</TableCell>
                      <TableCell>{paddock.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(paddock)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => paddock.id && handleDelete(paddock.id)}
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

export default Paddocks;
