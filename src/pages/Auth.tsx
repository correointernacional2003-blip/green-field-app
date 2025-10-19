import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Loader2 } from 'lucide-react';
import { authAPI, LoginRequest, RegisterRequest } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import heroImage from '@/assets/hero-agro.jpg';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  dni: z.string().min(3, 'DNI debe tener al menos 3 caracteres'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  farm: z.object({
    name: z.string().min(2, 'Nombre de la finca debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    location: z.string().min(2, 'Ubicación debe tener al menos 2 caracteres'),
  }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    password: '',
    dni: '',
    name: '',
    lastName: '',
    farm: {
      name: '',
      description: '',
      location: '',
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse(loginData);
      setIsLoading(true);
      
      const response = await authAPI.login(loginData);
      saveAuth(response);
      
      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesión exitosamente',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Error de validación',
          description: error.errors[0].message,
        });
      } else if (error.message === 'Network Error') {
        toast({
          variant: 'destructive',
          title: 'Error de conexión',
          description: 'No se puede conectar con el servidor. Verifica que la API esté activa y la URL sea correcta.',
        });
      } else if (error.response?.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Credenciales inválidas',
          description: error.response?.data?.message || 'Email o contraseña incorrectos',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      registerSchema.parse(registerData);
      setIsLoading(true);
      
      const response = await authAPI.register(registerData);
      saveAuth(response);
      
      toast({
        title: 'Cuenta creada',
        description: 'Tu cuenta ha sido creada exitosamente',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Error de validación',
          description: error.errors[0].message,
        });
      } else if (error.message === 'Network Error') {
        toast({
          variant: 'destructive',
          title: 'Error de conexión',
          description: 'No se puede conectar con el servidor. Verifica que la API esté activa y la URL sea correcta.',
        });
      } else if (error.response?.data?.code === 'USER_ALREADY_EXISTS') {
        toast({
          variant: 'destructive',
          title: 'Usuario ya existe',
          description: 'Ya existe una cuenta con este email',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al registrarse',
          description: error.response?.data?.message || error.message || 'No se pudo crear la cuenta',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={heroImage} 
          alt="Granja agrícola con ganado" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80 mix-blend-multiply" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            <Sprout className="w-10 h-10" />
          </div>
          <h2 className="text-5xl font-bold mb-4">AgroSmart</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Revoluciona la gestión de tu granja con tecnología inteligente. 
            Control completo de animales, alimentación, ordeño y recursos.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-soft p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-soft">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AgroSmart</h1>
            <p className="text-muted-foreground">Gestión Agrícola Inteligente</p>
          </div>

          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Accede a tu cuenta</CardTitle>
              <CardDescription>Ingresa tus credenciales o crea una nueva cuenta</CardDescription>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        placeholder="Juan"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI / Documento</Label>
                    <Input
                      id="dni"
                      placeholder="A123456"
                      value={registerData.dni}
                      onChange={(e) => setRegisterData({ ...registerData, dni: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3 text-foreground">Información de la Finca</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Nombre de la Finca</Label>
                        <Input
                          id="farmName"
                          placeholder="Mi Finca"
                          value={registerData.farm.name}
                          onChange={(e) => setRegisterData({ 
                            ...registerData, 
                            farm: { ...registerData.farm, name: e.target.value } 
                          })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Ubicación</Label>
                        <Input
                          id="farmLocation"
                          placeholder="Ciudad, Departamento"
                          value={registerData.farm.location}
                          onChange={(e) => setRegisterData({ 
                            ...registerData, 
                            farm: { ...registerData.farm, location: e.target.value } 
                          })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmDescription">Descripción (Opcional)</Label>
                        <Input
                          id="farmDescription"
                          placeholder="Descripción de la finca"
                          value={registerData.farm.description}
                          onChange={(e) => setRegisterData({ 
                            ...registerData, 
                            farm: { ...registerData.farm, description: e.target.value } 
                          })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
};

export default Auth;
