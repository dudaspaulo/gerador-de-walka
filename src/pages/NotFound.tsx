import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard variant="container" className="max-w-md text-center">
        <div className="glass-block p-8">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-secondary">404</span>
          </div>
          
          <h1 className="text-2xl font-bold text-walka-dark mb-2">
            Página não encontrada
          </h1>
          
          <p className="text-walka-muted mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="btn-ghost text-walka-dark border-walka-dark/20"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <Link to="/" className="btn-primary">
              <Home size={16} />
              Ir para Dashboard
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NotFound;
