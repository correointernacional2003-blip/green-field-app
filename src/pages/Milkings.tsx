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
import { ArrowLeft, Plus, Pencil, Trash2, Milk } from 'lucide-react';
import { milkingsAPI, Milking, animalsAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFarmId } from '@/hooks/useFarmId';

const Milkings = () => {
  const navigate = useNavigate();
  const farmId = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilking, setEditingMilking] = useState<Milking | null>(null);
  const [formData, setFormData] = useState<Partial<Milking>>({
    date: new Date().toISOString().split('T')[0],
    shift: 'MORNING',
    quantity: 0,
    observations: '',
    animalId: 0,
  });

  // Fetch milkings (paginated)
  const { data: milkingsData, isLoading } = useQuery({
    queryKey: ['milkings', farmId],
    queryFn: () => milkingsAPI.getAll(farmId!),
    enabled: !!farmId,
  });

  // Fetch animals for the select dropdown
  const { data: animalsData } = useQuery({
    queryKey: ['animals', farmId],
    queryFn: () => animalsAPI.getAll(farmId!),
    enabled: !!farmId,
  });

  // Create milking mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Milking>) => milkingsAPI.create(farmId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkings', farmId] });
      toast({ title: 'Ordeño registrado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al registrar ordeño',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Update milking mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Milking> }) =>
      milkingsAPI.update(farmId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkings', farmId] });
      toast({ title: 'Ordeño actualizado exitosamente' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar ordeño',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  // Delete milking mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => milkingsAPI.delete(farmId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkings', farmId] });
      toast({ title: 'Ordeño eliminado exitosamente' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar ordeño',
        description: error.response?.data?.message || 'Ocurrió un error',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMilking?.id) {
      updateMutation.mutate({ id: editingMilking.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (milking: Milking) => {
    setEditingMilking(milking);
    setFormData({
      date: milking.date,
      shift: milking.shift,
      quantity: milking.quantity,
      observations: milking.observations || '',
      animalId: milking.animalId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de ordeño?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMilking(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shift: 'MORNING',
      quantity: 0,
      observations: '',
      animalId: 0,
    });
  };

  const getShiftBadge = (shift: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      MORNING: 'default',
      AFTERNOON: 'secondary',
      NIGHT: 'outline'
    };
    const labels: Record<string, string> = {
      MORNING: 'Mañana',
      AFTERNOON: 'Tarde',
      NIGHT: 'Noche'
    };
    return <Badge variant={variants[shift]}>{labels[shift]}</Badge>;
  };

  const milkings = milkingsData?.items ?? [];
  const animals = animalsData?.items ?? [];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Milk className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Gestión de Ordeño</h1>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingMilking(null); resetForm(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Ordeño
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMilking ? 'Editar Ordeño' : 'Registrar Nuevo Ordeño'}</DialogTitle>
                  <DialogDescription>
                    {editingMilking ? 'Actualiza los datos del ordeño' : 'Completa el formulario para registrar un nuevo ordeño'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shift">Turno *</Label>
                      <Select
                        value={formData.shift}
                        onValueChange={(value) => setFormData({ ...formData, shift: value as Milking['shift'] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MORNING">Mañana</SelectItem>
                          <SelectItem value="AFTERNOON">Tarde</SelectItem>
                          <SelectItem value="NIGHT">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="animalId">Animal *</Label>
                      <Select
                        value={formData.animalId?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, animalId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el animal" />
                        </SelectTrigger>
                        <SelectContent>
                          {animals.map((animal) => (
                            <SelectItem key={animal.id} value={animal.id?.toString() || ''}>
                              {animal.name} ({animal.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad (Litros) *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                        required
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
                      placeholder="Observaciones adicionales sobre el ordeño..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingMilking ? 'Actualizar' : 'Registrar'}
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
            <CardTitle>Registros de Ordeño</CardTitle>
            <CardDescription>Historial de todos los ordeños registrados en la granja</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : milkings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay ordeños registrados. Registra un nuevo ordeño para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Cantidad (L)</TableHead>
                      <TableHead>Observaciones</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milkings.map((milking) => {
                      const animal = animals.find(a => a.id === milking.animalId);
                      return (
                        <TableRow key={milking.id}>
                          <TableCell className="font-medium">{milking.id}</TableCell>
                          <TableCell>{new Date(milking.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getShiftBadge(milking.shift)}</TableCell>
                          <TableCell>{animal ? `${animal.name} (${animal.code})` : `ID: ${milking.animalId}`}</TableCell>
                          <TableCell className="font-medium">{milking.quantity} L</TableCell>
                          <TableCell className="max-w-xs truncate">{milking.observations || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(milking)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => milking.id && handleDelete(milking.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Milkings;
