import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectGalleryItem, ProjectPlant, ProjectTour, ProjectPrice, ProjectFaq, FullProject } from '@/types/project';

// Helper to generate IDs
const generateId = () => crypto.randomUUID();

interface ProjectStore {
  projects: Project[];
  gallery: ProjectGalleryItem[];
  plants: ProjectPlant[];
  tours: ProjectTour[];
  prices: ProjectPrice[];
  faqs: ProjectFaq[];
  
  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  getFullProject: (id: string) => FullProject | undefined;
  
  // Gallery CRUD
  addGalleryItem: (item: Omit<ProjectGalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, updates: Partial<ProjectGalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  getProjectGallery: (projectId: string) => ProjectGalleryItem[];
  
  // Plants CRUD
  addPlant: (plant: Omit<ProjectPlant, 'id'>) => void;
  updatePlant: (id: string, updates: Partial<ProjectPlant>) => void;
  deletePlant: (id: string) => void;
  getProjectPlants: (projectId: string) => ProjectPlant[];
  
  // Tours CRUD
  addTour: (tour: Omit<ProjectTour, 'id'>) => void;
  updateTour: (id: string, updates: Partial<ProjectTour>) => void;
  deleteTour: (id: string) => void;
  getProjectTours: (projectId: string) => ProjectTour[];
  
  // Prices CRUD
  addPrice: (price: Omit<ProjectPrice, 'id'>) => void;
  updatePrice: (id: string, updates: Partial<ProjectPrice>) => void;
  deletePrice: (id: string) => void;
  getProjectPrices: (projectId: string) => ProjectPrice[];
  
  // FAQs CRUD
  addFaq: (faq: Omit<ProjectFaq, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<ProjectFaq>) => void;
  deleteFaq: (id: string) => void;
  getProjectFaqs: (projectId: string) => ProjectFaq[];
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      gallery: [],
      plants: [],
      tours: [],
      prices: [],
      faqs: [],

      // Project operations
      addProject: (project) => {
        const id = generateId();
        const newProject: Project = {
          ...project,
          id,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          gallery: state.gallery.filter((g) => g.project_id !== id),
          plants: state.plants.filter((p) => p.project_id !== id),
          tours: state.tours.filter((t) => t.project_id !== id),
          prices: state.prices.filter((p) => p.project_id !== id),
          faqs: state.faqs.filter((f) => f.project_id !== id),
        }));
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      getFullProject: (id) => {
        const project = get().getProject(id);
        if (!project) return undefined;
        return {
          ...project,
          gallery: get().getProjectGallery(id),
          plants: get().getProjectPlants(id),
          tours: get().getProjectTours(id),
          prices: get().getProjectPrices(id),
          faqs: get().getProjectFaqs(id),
        };
      },

      // Gallery operations
      addGalleryItem: (item) => {
        const newItem: ProjectGalleryItem = { ...item, id: generateId() };
        set((state) => ({ gallery: [...state.gallery, newItem] }));
      },

      updateGalleryItem: (id, updates) => {
        set((state) => ({
          gallery: state.gallery.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      deleteGalleryItem: (id) => {
        set((state) => ({
          gallery: state.gallery.filter((g) => g.id !== id),
        }));
      },

      getProjectGallery: (projectId) =>
        get()
          .gallery.filter((g) => g.project_id === projectId)
          .sort((a, b) => a.display_order - b.display_order),

      // Plants operations
      addPlant: (plant) => {
        const newPlant: ProjectPlant = { ...plant, id: generateId() };
        set((state) => ({ plants: [...state.plants, newPlant] }));
      },

      updatePlant: (id, updates) => {
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePlant: (id) => {
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
        }));
      },

      getProjectPlants: (projectId) =>
        get().plants.filter((p) => p.project_id === projectId),

      // Tours operations
      addTour: (tour) => {
        const newTour: ProjectTour = { ...tour, id: generateId() };
        set((state) => ({ tours: [...state.tours, newTour] }));
      },

      updateTour: (id, updates) => {
        set((state) => ({
          tours: state.tours.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTour: (id) => {
        set((state) => ({
          tours: state.tours.filter((t) => t.id !== id),
        }));
      },

      getProjectTours: (projectId) =>
        get().tours.filter((t) => t.project_id === projectId),

      // Prices operations
      addPrice: (price) => {
        const newPrice: ProjectPrice = { ...price, id: generateId() };
        set((state) => ({ prices: [...state.prices, newPrice] }));
      },

      updatePrice: (id, updates) => {
        set((state) => ({
          prices: state.prices.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePrice: (id) => {
        set((state) => ({
          prices: state.prices.filter((p) => p.id !== id),
        }));
      },

      getProjectPrices: (projectId) =>
        get().prices.filter((p) => p.project_id === projectId),

      // FAQs operations
      addFaq: (faq) => {
        const newFaq: ProjectFaq = { ...faq, id: generateId() };
        set((state) => ({ faqs: [...state.faqs, newFaq] }));
      },

      updateFaq: (id, updates) => {
        set((state) => ({
          faqs: state.faqs.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      deleteFaq: (id) => {
        set((state) => ({
          faqs: state.faqs.filter((f) => f.id !== id),
        }));
      },

      getProjectFaqs: (projectId) =>
        get().faqs.filter((f) => f.project_id === projectId),
    }),
    {
      name: 'walka-projects',
    }
  )
);
