import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { lotsAPI, Lot } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const FARM_ID = 1; // TODO: Get from auth context

const Lots = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [formData, setFormData] = useState<Partial<Lot>>({
    name: '',
    description: '',
  });

  // Fetch lots
  const { data: lotsData, isLoading } = useQuery({
    queryKey: ['lots', FARM_ID],
    queryFn: () => lotsAPI.getAll(FARM_ID)
  });

  // Create lot mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Lot>) => lotsAPI.create(FARM_ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', FARM_ID] });
      toast({ title: 'Lote creado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al crear lote',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Update lot mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lot> }) =>
      lotsAPI.update(FARM_ID, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', FARM_ID] });
      toast({ title: 'Lote actualizado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar lote',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Delete lot mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => lotsAPI.delete(FARM_ID, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lots', FARM_ID] });
      toast({ title: 'Lote eliminado exitosamente' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar lote',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLot?.id) {
      updateMutation.mutate({ id: editingLot.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (lot: Lot) => {
    setEditingLot(lot);
    setFormData(lot);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este lote?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLot(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      FULL: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const lots = lotsData?.items ?? [];

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
                <h1 className="text-2xl font-bold text-foreground">Gestión de Lotes</h1>
                <p className="text-sm text-muted-foreground">Administra los grupos de ganado</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLot ? 'Editar Lote' : 'Nuevo Lote'}</DialogTitle>
                  <DialogDescription>
                    {editingLot ? 'Modifica los datos del lote' : 'Completa los datos del nuevo lote'}
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
                      {editingLot ? 'Actualizar' : 'Crear'}
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
            <CardTitle>Lotes Registrados</CardTitle>
            <CardDescription>Lista de todos los grupos de ganado en tu granja</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay lotes registrados. Crea un nuevo lote para comenzar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.id}</TableCell>
                      <TableCell>{lot.name}</TableCell>
                      <TableCell>{lot.description || '--'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lot)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => lot.id && handleDelete(lot.id)}
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

export default Lots;
