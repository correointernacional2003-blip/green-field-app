import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  Package2, 
  Milk, 
  Apple, 
  LogOut,
  BarChart3
} from 'lucide-react';
import { clearAuth } from '@/lib/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  const modules = [
    {
      title: 'Animales',
      description: 'Gestión de ganado y razas',
      icon: Package2,
      color: 'from-primary to-primary-light',
      route: '/animals',
      available: true,
    },
    {
      title: 'Razas',
      description: 'Gestión de razas de ganado',
      icon: Package2,
      color: 'from-primary-light to-accent',
      route: '/breeds',
      available: true,
    },
    {
      title: 'Lotes',
      description: 'Organización de grupos de ganado',
      icon: Package2,
      color: 'from-accent to-primary',
      route: '/lots',
      available: true,
    },
    {
      title: 'Potreros',
      description: 'Gestión de espacios físicos',
      icon: Package2,
      color: 'from-primary to-accent',
      route: '/paddocks',
      available: true,
    },
    {
      title: 'Ordeño',
      description: 'Registro de producción láctea',
      icon: Milk,
      color: 'from-primary-light to-accent',
      route: '/milkings',
      available: true,
    },
    {
      title: 'Alimentación',
      description: 'Control de alimentación del ganado',
      icon: Apple,
      color: 'from-accent to-primary-dark',
      route: '/feedings',
      available: true,
    },
    {
      title: 'Suministros',
      description: 'Inventario de insumos agrícolas',
      icon: Package2,
      color: 'from-primary to-accent',
      route: '/supplies',
      available: true,
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: BarChart3,
      color: 'from-primary-dark to-primary',
      route: '/reports',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AgroSmart</h1>
                <p className="text-sm text-muted-foreground">Panel de Control</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Panel de Control
          </h2>
          <p className="text-muted-foreground">
            Selecciona un módulo para comenzar a gestionar tu granja
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module.title}
              className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-border ${
                !module.available ? 'opacity-60' : 'hover:-translate-y-1'
              }`}
              onClick={() => module.available && navigate(module.route)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {module.available ? (
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Acceder
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Próximamente
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
