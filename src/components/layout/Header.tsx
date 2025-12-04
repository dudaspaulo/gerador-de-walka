import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

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
