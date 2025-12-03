import { FolderOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyState() {
  return (
    <div className="glass-block text-center py-16 px-8">
      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
        <FolderOpen size={40} className="text-secondary" />
      </div>
      
      <h3 className="text-xl font-semibold text-walka-dark mb-2">
        Nenhum projeto ainda
      </h3>
      
      <p className="text-walka-muted mb-6 max-w-md mx-auto">
        Comece criando seu primeiro hotsite imobiliário. Configure tudo de forma visual e exporte o código pronto para produção.
      </p>
      
      <Link to="/projects/new" className="btn-primary">
        <Plus size={18} />
        Criar Primeiro Projeto
      </Link>
    </div>
  );
}
