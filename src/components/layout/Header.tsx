import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/projects", label: "Projetos", icon: FolderOpen },
  ];

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-walka-dark font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white header-text">Walk'a</h1>
              <p className="text-xs text-white/60">Hotsite Generator</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-walka-dark" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          
          <Link
            to="/projects/new"
            className="btn-primary ml-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Projeto</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
