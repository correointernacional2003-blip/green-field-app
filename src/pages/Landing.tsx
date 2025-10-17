import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Package2, Milk, Apple, BarChart3, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-agro.jpg';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package2,
      title: 'Gestión de Ganado',
      description: 'Control completo de tus animales, razas y lotes',
    },
    {
      icon: Milk,
      title: 'Control de Ordeño',
      description: 'Registra y analiza la producción láctea diaria',
    },
    {
      icon: Apple,
      title: 'Plan de Alimentación',
      description: 'Optimiza la nutrición de tu ganado',
    },
    {
      icon: BarChart3,
      title: 'Reportes Detallados',
      description: 'Visualiza datos y toma decisiones informadas',
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Tus datos protegidos con tecnología moderna',
    },
    {
      icon: Zap,
      title: 'Rápido y Eficiente',
      description: 'Accede a tu información desde cualquier lugar',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img 
          src={heroImage} 
          alt="Granja agrícola moderna" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/70 to-primary-dark/80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm mb-8 shadow-2xl">
            <Sprout className="w-14 h-14" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Bienvenido a AgroSmart
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/95 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            La plataforma inteligente para gestionar tu granja de manera eficiente. 
            Control total de animales, alimentación, ordeño y suministros en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl"
              onClick={() => navigate('/auth')}
            >
              Comenzar Ahora
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Conocer Más
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Todo lo que necesitas para tu granja
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas profesionales diseñadas para optimizar cada aspecto de tu operación agrícola
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border"
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-soft">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para transformar tu granja?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Únete a los productores que ya están optimizando su gestión agrícola con AgroSmart
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl"
            onClick={() => navigate('/auth')}
          >
            Crear Cuenta Gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">AgroSmart</span>
          </div>
          <p className="text-sm">
            © 2025 AgroSmart. Sistema de gestión agrícola inteligente.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
