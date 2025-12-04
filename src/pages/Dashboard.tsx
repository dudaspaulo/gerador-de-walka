import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/projects/EmptyState";
import { useProjectStore } from "@/stores/projectStore";
import { Building2, Download, TrendingUp, Clock, BarChart2, FolderOpen } from "lucide-react";

type DashboardTab = 'overview' | 'projects';

export default function Dashboard() {
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects');

  const publishedCount = projects.filter(p => p.status === 'published').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        <GlassCard variant="container" className="animate-fade-in">
          {/* Dashboard Tabs */}
          <div className="flex gap-2 mb-6 pb-4 border-b border-walka-dark/10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-secondary text-white'
                  : 'bg-white/50 text-walka-dark hover:bg-white'
              }`}
            >
              <BarChart2 size={16} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-secondary text-white'
                  : 'bg-white/50 text-walka-dark hover:bg-white'
              }`}
            >
              <FolderOpen size={16} />
              <span>Projetos</span>
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-walka-dark">Estatísticas</h2>
                <p className="text-sm text-walka-muted">Visão geral dos seus projetos</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-block text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                    <Building2 size={20} className="text-secondary" />
                  </div>
                  <p className="text-2xl font-bold text-walka-dark">{projects.length}</p>
                  <p className="text-xs text-walka-muted">Total Projetos</p>
                </div>
                <div className="glass-block text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp size={20} className="text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-walka-dark">{publishedCount}</p>
                  <p className="text-xs text-walka-muted">Publicados</p>
                </div>
                <div className="glass-block text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                    <Clock size={20} className="text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-walka-dark">{draftCount}</p>
                  <p className="text-xs text-walka-muted">Rascunhos</p>
                </div>
                <div className="glass-block text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <Download size={20} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-walka-dark">∞</p>
                  <p className="text-xs text-walka-muted">Exportações</p>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-walka-dark">Seus Projetos</h2>
                <p className="text-sm text-walka-muted">Gerencie seus hotsites imobiliários</p>
              </div>

              {projects.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
