import { Project } from "@/types/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  onExport?: (project: Project) => void;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`}>
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

      {/* Content - Simplified */}
      <div className="p-4">
        <h3 className="font-semibold text-walka-dark line-clamp-2 text-center">
          {project.name}
        </h3>
      </div>
      </GlassCard>
    </Link>
  );
}
