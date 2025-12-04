import { Project } from "@/types/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, MapPin, Building2, Download, Edit, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  onExport?: (project: Project) => void;
}

export function ProjectCard({ project, onExport }: ProjectCardProps) {
  return (
    <GlassCard 
      variant="card" 
      className="p-0 overflow-hidden group cursor-pointer"
    >
      {/* Cover Image - Uses dashboard_cover_image if available, fallback to hero */}
      <div className="relative h-40 overflow-hidden">
        {(project.dashboard_cover_image || project.hero_image_url) ? (
          <img 
            src={project.dashboard_cover_image || project.hero_image_url} 
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: project.brand_color || '#6E00B0' }}
          >
            <Building2 size={48} className="text-white/50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={project.status === 'published' ? 'badge-published' : 'badge-draft'}>
            {project.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
        </div>

        {/* Brand Color Indicator */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: project.brand_color || '#10E6E1' }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {project.logo_url && (
              <img 
                src={project.logo_url} 
                alt={project.name}
                className="w-8 h-8 rounded-lg object-contain bg-white p-1"
              />
            )}
            <h3 className="font-semibold text-walka-dark line-clamp-1">{project.name}</h3>
          </div>
        </div>

        <p className="text-sm text-walka-muted mb-3 line-clamp-1">
          {project.builder_name}
        </p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-walka-muted">
            <MapPin size={12} />
            <span className="line-clamp-1">{project.city_state || 'Localização não definida'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-walka-muted">
            <Calendar size={12} />
            <span>Entrega: {project.delivery_date || 'A definir'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Link 
            to={`/projects/${project.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          >
            <Edit size={12} />
            Editar
          </Link>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onExport?.(project);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Download size={12} />
            Exportar
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
