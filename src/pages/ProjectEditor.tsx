import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { useProjectStore } from "@/stores/projectStore";
import { Project, ProjectPlant, ProjectTour, ProjectPrice, ProjectFaq, ProjectGalleryItem } from "@/types/project";
import { exportProjectAsZip } from "@/lib/exportHotsite";
import { toast } from "sonner";
import { 
  Save, Download, Trash2, Plus, X, 
  Building2, Image, MapPin, Layers, Video, DollarSign, HelpCircle, Search,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TabId = 'info' | 'hero' | 'location' | 'plants' | 'tours' | 'seo';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Info & Branding', icon: Building2 },
  { id: 'hero', label: 'Hero', icon: Image },
  { id: 'location', label: 'Local & Galeria', icon: MapPin },
  { id: 'plants', label: 'Plantas', icon: Layers },
  { id: 'tours', label: 'Tours & Preços', icon: Video },
  { id: 'seo', label: 'SEO & Export', icon: Search },
];

const defaultProject: Omit<Project, 'id' | 'created_at'> = {
  name: '',
  slug: '',
  builder_name: '',
  city_state: '',
  address_full: '',
  whatsapp_link: '',
  email_contact: '',
  brand_color: '#10E6E1',
  hero_headline: '',
  hero_subheadline: '',
  hero_image_url: '',
  logo_url: '',
  seo_image_url: '',
  delivery_date: '',
  launch_date: '',
  footage_range: '',
  typologies_text: '',
  cta_link: '',
  location_desc: '',
  map_embed_src: '',
  points_of_interest: '',
  tech_specs: '',
  seo_title: '',
  seo_desc: '',
  status: 'draft',
  favicon_filename: 'favicon.png',
  webclip_filename: 'apple-touch-icon.png',
  dashboard_cover_image: '',
};

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const { 
    getProject, getFullProject, addProject, updateProject, deleteProject,
    getProjectGallery, addGalleryItem, deleteGalleryItem,
    getProjectPlants, addPlant, updatePlant, deletePlant,
    getProjectTours, addTour, updateTour, deleteTour,
    getProjectPrices, addPrice, updatePrice, deletePrice,
    getProjectFaqs, addFaq, updateFaq, deleteFaq,
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'created_at'>>(defaultProject);
  const [projectId, setProjectId] = useState<string | null>(isNew ? null : id || null);

  // Related data states
  const [gallery, setGallery] = useState<ProjectGalleryItem[]>([]);
  const [plants, setPlants] = useState<ProjectPlant[]>([]);
  const [tours, setTours] = useState<ProjectTour[]>([]);
  const [prices, setPrices] = useState<ProjectPrice[]>([]);
  const [faqs, setFaqs] = useState<ProjectFaq[]>([]);

  // Load existing project data
  useEffect(() => {
    if (!isNew && id) {
      const project = getProject(id);
      if (project) {
        const { id: _, created_at: __, ...rest } = project;
        setFormData(rest);
        setGallery(getProjectGallery(id));
        setPlants(getProjectPlants(id));
        setTours(getProjectTours(id));
        setPrices(getProjectPrices(id));
        setFaqs(getProjectFaqs(id));
      }
    }
  }, [id, isNew]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    if (isNew || !projectId) {
      const newId = addProject(formData);
      setProjectId(newId);
      
      // Save related data
      gallery.forEach(g => addGalleryItem({ ...g, project_id: newId }));
      plants.forEach(p => addPlant({ ...p, project_id: newId }));
      tours.forEach(t => addTour({ ...t, project_id: newId }));
      prices.forEach(p => addPrice({ ...p, project_id: newId }));
      faqs.forEach(f => addFaq({ ...f, project_id: newId }));
      
      toast.success('Projeto criado com sucesso!');
      navigate(`/projects/${newId}`);
    } else {
      updateProject(projectId, formData);
      toast.success('Projeto salvo com sucesso!');
    }
  };

  const handleExport = async () => {
    if (!projectId) {
      toast.error('Salve o projeto antes de exportar');
      return;
    }
    
    const fullProject = getFullProject(projectId);
    if (!fullProject) {
      toast.error('Erro ao carregar projeto');
      return;
    }
    
    try {
      await exportProjectAsZip(fullProject);
      toast.success('Hotsite exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar hotsite');
      console.error(error);
    }
  };

  const handleDelete = () => {
    if (!projectId) return;
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(projectId);
      toast.success('Projeto excluído');
      navigate('/');
    }
  };

  // Plant handlers
  const handleAddPlant = () => {
    const newPlant: Omit<ProjectPlant, 'id'> = {
      project_id: projectId || '',
      title: '',
      style: 'ECO',
      package: 'STANDARD',
      footage: '',
      image_url: '',
      availability_text: 'Unidades disponíveis',
    };
    if (projectId) {
      addPlant(newPlant);
      setPlants(getProjectPlants(projectId));
    } else {
      setPlants([...plants, { ...newPlant, id: crypto.randomUUID() } as ProjectPlant]);
    }
  };

  // Tour handlers
  const handleAddTour = () => {
    const newTour: Omit<ProjectTour, 'id'> = {
      project_id: projectId || '',
      label: '',
      iframe_url: '',
      style_category: 'ECO',
    };
    if (projectId) {
      addTour(newTour);
      setTours(getProjectTours(projectId));
    } else {
      setTours([...tours, { ...newTour, id: crypto.randomUUID() } as ProjectTour]);
    }
  };

  // Price handlers
  const handleAddPrice = () => {
    const newPrice: Omit<ProjectPrice, 'id'> = {
      project_id: projectId || '',
      title: '',
      price_value: '',
      badge_text: '',
      features: '',
      cta_link: '',
    };
    if (projectId) {
      addPrice(newPrice);
      setPrices(getProjectPrices(projectId));
    } else {
      setPrices([...prices, { ...newPrice, id: crypto.randomUUID() } as ProjectPrice]);
    }
  };

  // FAQ handlers
  const handleAddFaq = () => {
    const newFaq: Omit<ProjectFaq, 'id'> = {
      project_id: projectId || '',
      question: '',
      answer: '',
    };
    if (projectId) {
      addFaq(newFaq);
      setFaqs(getProjectFaqs(projectId));
    } else {
      setFaqs([...faqs, { ...newFaq, id: crypto.randomUUID() } as ProjectFaq]);
    }
  };

  // Gallery handlers
  const handleAddGalleryItem = () => {
    const newItem: Omit<ProjectGalleryItem, 'id'> = {
      project_id: projectId || '',
      image_url: '',
      display_order: gallery.length,
    };
    if (projectId) {
      addGalleryItem(newItem);
      setGallery(getProjectGallery(projectId));
    } else {
      setGallery([...gallery, { ...newItem, id: crypto.randomUUID() } as ProjectGalleryItem]);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Header />

        <GlassCard variant="container" className="animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <ArrowLeft size={20} className="text-walka-dark" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-walka-dark">
                  {isNew ? 'Novo Projeto' : formData.name || 'Editar Projeto'}
                </h2>
                <p className="text-sm text-walka-muted">
                  {isNew ? 'Configure seu novo hotsite' : `Slug: ${formData.slug}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isNew && projectId && (
                <button onClick={handleDelete} className="btn-danger">
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={handleExport} className="btn-ghost text-walka-dark border-walka-dark/20">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar ZIP</span>
              </button>
              <button onClick={handleSave} className="btn-primary">
                <Save size={16} />
                <span className="hidden sm:inline">Salvar</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-walka-dark/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all outline-none focus:ring-0 ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
                      : 'bg-white/50 text-walka-dark hover:bg-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="glass-block">
            {/* Info & Branding Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                  <Building2 size={18} className="text-secondary" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Empreendimento *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Studio Bela Vista"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="studio-bela-vista"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Construtora</Label>
                    <Input
                      value={formData.builder_name}
                      onChange={(e) => handleInputChange('builder_name', e.target.value)}
                      placeholder="Nome da construtora"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade/Estado</Label>
                    <Input
                      value={formData.city_state}
                      onChange={(e) => handleInputChange('city_state', e.target.value)}
                      placeholder="São Paulo, SP"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Endereço Completo</Label>
                    <Input
                      value={formData.address_full}
                      onChange={(e) => handleInputChange('address_full', e.target.value)}
                      placeholder="Rua das Flores, 123 - Centro"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp (com DDD)</Label>
                    <Input
                      value={formData.whatsapp_link}
                      onChange={(e) => handleInputChange('whatsapp_link', e.target.value)}
                      placeholder="https://wa.me/5511999999999"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email de Contato</Label>
                    <Input
                      value={formData.email_contact}
                      onChange={(e) => handleInputChange('email_contact', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor da Marca (HEX)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.brand_color}
                        onChange={(e) => handleInputChange('brand_color', e.target.value)}
                        className="w-14 h-10 p-1 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={formData.brand_color}
                        onChange={(e) => handleInputChange('brand_color', e.target.value)}
                        placeholder="#10E6E1"
                        className="glass-input flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Arquivo do Logo (ex: logo.png)</Label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="logo.png"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published') => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon Filename</Label>
                    <Input
                      value={formData.favicon_filename}
                      onChange={(e) => handleInputChange('favicon_filename', e.target.value)}
                      placeholder="favicon.png"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Webclip Filename</Label>
                    <Input
                      value={formData.webclip_filename}
                      onChange={(e) => handleInputChange('webclip_filename', e.target.value)}
                      placeholder="apple-touch-icon.png"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Imagem de Capa (Dashboard)</Label>
                    <Input
                      value={formData.dashboard_cover_image}
                      onChange={(e) => handleInputChange('dashboard_cover_image', e.target.value)}
                      placeholder="URL ou nome do arquivo para thumbnail no dashboard"
                      className="glass-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hero Tab */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                  <Image size={18} className="text-secondary" />
                  Seção Hero
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Headline Principal</Label>
                    <Input
                      value={formData.hero_headline}
                      onChange={(e) => handleInputChange('hero_headline', e.target.value)}
                      placeholder="Studios de alto padrão na melhor localização"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Subheadline</Label>
                    <Textarea
                      value={formData.hero_subheadline}
                      onChange={(e) => handleInputChange('hero_subheadline', e.target.value)}
                      placeholder="Invista em imóveis compactos com alta rentabilidade..."
                      className="glass-input min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Imagem Hero (nome do arquivo, ex: hero.jpg)</Label>
                    <Input
                      value={formData.hero_image_url}
                      onChange={(e) => handleInputChange('hero_image_url', e.target.value)}
                      placeholder="hero.jpg"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Entrega</Label>
                    <Input
                      value={formData.delivery_date}
                      onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      placeholder="Dez/2026"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Lançamento</Label>
                    <Input
                      value={formData.launch_date}
                      onChange={(e) => handleInputChange('launch_date', e.target.value)}
                      placeholder="Mar/2024"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metragens</Label>
                    <Input
                      value={formData.footage_range}
                      onChange={(e) => handleInputChange('footage_range', e.target.value)}
                      placeholder="20m² a 45m²"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipologias</Label>
                    <Input
                      value={formData.typologies_text}
                      onChange={(e) => handleInputChange('typologies_text', e.target.value)}
                      placeholder="Studios"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Link do CTA Principal</Label>
                    <Input
                      value={formData.cta_link}
                      onChange={(e) => handleInputChange('cta_link', e.target.value)}
                      placeholder="Deixe vazio para usar WhatsApp"
                      className="glass-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location & Gallery Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                  <MapPin size={18} className="text-secondary" />
                  Localização
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Descrição da Localização</Label>
                    <Textarea
                      value={formData.location_desc}
                      onChange={(e) => handleInputChange('location_desc', e.target.value)}
                      placeholder="Descreva os benefícios da localização..."
                      className="glass-input min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Iframe do Google Maps</Label>
                    <Input
                      value={formData.map_embed_src}
                      onChange={(e) => handleInputChange('map_embed_src', e.target.value)}
                      placeholder="https://www.google.com/maps/embed?..."
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pontos de Interesse (um por linha)</Label>
                    <Textarea
                      value={formData.points_of_interest}
                      onChange={(e) => handleInputChange('points_of_interest', e.target.value)}
                      placeholder="Metrô Paulista - 5 min&#10;Shopping - 10 min&#10;Parque Ibirapuera - 15 min"
                      className="glass-input min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Gallery Section */}
                <div className="pt-6 border-t border-walka-dark/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                      <Image size={18} className="text-secondary" />
                      Galeria de Imagens
                    </h3>
                    <button onClick={handleAddGalleryItem} className="btn-primary text-sm py-2">
                      <Plus size={14} />
                      Adicionar Imagem
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {gallery.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <span className="text-sm text-walka-muted w-8">{index + 1}.</span>
                        <Input
                          value={item.image_url}
                          onChange={(e) => {
                            if (projectId) {
                              // Update in store and refresh
                            }
                            setGallery(gallery.map(g => 
                              g.id === item.id ? { ...g, image_url: e.target.value } : g
                            ));
                          }}
                          placeholder="URL da imagem"
                          className="glass-input flex-1"
                        />
                        <button
                          onClick={() => {
                            if (projectId) deleteGalleryItem(item.id);
                            setGallery(gallery.filter(g => g.id !== item.id));
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {gallery.length === 0 && (
                      <p className="text-sm text-walka-muted text-center py-8">
                        Nenhuma imagem adicionada ainda
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Plants Tab */}
            {activeTab === 'plants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                    <Layers size={18} className="text-secondary" />
                    Plantas
                  </h3>
                  <button onClick={handleAddPlant} className="btn-primary text-sm py-2">
                    <Plus size={14} />
                    Adicionar Planta
                  </button>
                </div>
                
                {/* Tech Specs */}
                <div className="space-y-2">
                  <Label>Ficha Técnica (um item por linha)</Label>
                  <Textarea
                    value={formData.tech_specs}
                    onChange={(e) => handleInputChange('tech_specs', e.target.value)}
                    placeholder="Área total: 5.000m²&#10;Torres: 2&#10;Andares: 25&#10;Unidades por andar: 8"
                    className="glass-input min-h-[120px]"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-walka-dark/10">
                  {plants.map((plant, index) => (
                    <div key={plant.id} className="p-4 bg-white/50 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-secondary">Planta {index + 1}</h4>
                        <button
                          onClick={() => {
                            if (projectId) deletePlant(plant.id);
                            setPlants(plants.filter(p => p.id !== plant.id));
                          }}
                          className="btn-danger text-xs"
                        >
                          <X size={12} />
                          Remover
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Título</Label>
                          <Input
                            value={plant.title}
                            onChange={(e) => {
                              if (projectId) updatePlant(plant.id, { title: e.target.value });
                              setPlants(plants.map(p => 
                                p.id === plant.id ? { ...p, title: e.target.value } : p
                              ));
                            }}
                            placeholder="Studio ECO 28m²"
                            className="glass-input"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Estilo</Label>
                          <Select
                            value={plant.style}
                            onValueChange={(value: 'ECO' | 'SLIM' | 'URBAN') => {
                              if (projectId) updatePlant(plant.id, { style: value });
                              setPlants(plants.map(p => 
                                p.id === plant.id ? { ...p, style: value } : p
                              ));
                            }}
                          >
                            <SelectTrigger className="glass-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ECO">ECO</SelectItem>
                              <SelectItem value="SLIM">SLIM</SelectItem>
                              <SelectItem value="URBAN">URBAN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Pacote</Label>
                          <Select
                            value={plant.package}
                            onValueChange={(value: 'STANDARD' | 'BASIC' | 'ESSENTIAL' | 'DESIGN') => {
                              if (projectId) updatePlant(plant.id, { package: value });
                              setPlants(plants.map(p => 
                                p.id === plant.id ? { ...p, package: value } : p
                              ));
                            }}
                          >
                            <SelectTrigger className="glass-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="BASIC">Basic</SelectItem>
                              <SelectItem value="ESSENTIAL">Essential</SelectItem>
                              <SelectItem value="DESIGN">Design</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Metragem</Label>
                          <Input
                            value={plant.footage}
                            onChange={(e) => {
                              if (projectId) updatePlant(plant.id, { footage: e.target.value });
                              setPlants(plants.map(p => 
                                p.id === plant.id ? { ...p, footage: e.target.value } : p
                              ));
                            }}
                            placeholder="28m²"
                            className="glass-input"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">URL da Imagem</Label>
                          <Input
                            value={plant.image_url}
                            onChange={(e) => {
                              if (projectId) updatePlant(plant.id, { image_url: e.target.value });
                              setPlants(plants.map(p => 
                                p.id === plant.id ? { ...p, image_url: e.target.value } : p
                              ));
                            }}
                            placeholder="https://..."
                            className="glass-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {plants.length === 0 && (
                    <p className="text-sm text-walka-muted text-center py-8">
                      Nenhuma planta adicionada ainda
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tours & Prices Tab */}
            {activeTab === 'tours' && (
              <div className="space-y-6">
                {/* Tours Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                      <Video size={18} className="text-secondary" />
                      Tours 360°
                    </h3>
                    <button onClick={handleAddTour} className="btn-primary text-sm py-2">
                      <Plus size={14} />
                      Adicionar Tour
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tours.map((tour, index) => (
                      <div key={tour.id} className="p-4 bg-white/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-secondary text-sm">Tour {index + 1}</h4>
                          <button
                            onClick={() => {
                              if (projectId) deleteTour(tour.id);
                              setTours(tours.filter(t => t.id !== tour.id));
                            }}
                            className="btn-danger text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={tour.label}
                              onChange={(e) => {
                                if (projectId) updateTour(tour.id, { label: e.target.value });
                                setTours(tours.map(t => 
                                  t.id === tour.id ? { ...t, label: e.target.value } : t
                                ));
                              }}
                              placeholder="ECO Basic"
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Categoria</Label>
                            <Select
                              value={tour.style_category}
                              onValueChange={(value: 'ECO' | 'SLIM' | 'URBAN') => {
                                if (projectId) updateTour(tour.id, { style_category: value });
                                setTours(tours.map(t => 
                                  t.id === tour.id ? { ...t, style_category: value } : t
                                ));
                              }}
                            >
                              <SelectTrigger className="glass-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ECO">ECO</SelectItem>
                                <SelectItem value="SLIM">SLIM</SelectItem>
                                <SelectItem value="URBAN">URBAN</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">URL do Iframe</Label>
                            <Input
                              value={tour.iframe_url}
                              onChange={(e) => {
                                if (projectId) updateTour(tour.id, { iframe_url: e.target.value });
                                setTours(tours.map(t => 
                                  t.id === tour.id ? { ...t, iframe_url: e.target.value } : t
                                ));
                              }}
                              placeholder="https://..."
                              className="glass-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {tours.length === 0 && (
                      <p className="text-sm text-walka-muted text-center py-4">
                        Nenhum tour adicionado
                      </p>
                    )}
                  </div>
                </div>

                {/* Prices Section */}
                <div className="pt-6 border-t border-walka-dark/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                      <DollarSign size={18} className="text-secondary" />
                      Tabela de Preços
                    </h3>
                    <button onClick={handleAddPrice} className="btn-primary text-sm py-2">
                      <Plus size={14} />
                      Adicionar Preço
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {prices.map((price, index) => (
                      <div key={price.id} className="p-4 bg-white/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-secondary text-sm">Preço {index + 1}</h4>
                          <button
                            onClick={() => {
                              if (projectId) deletePrice(price.id);
                              setPrices(prices.filter(p => p.id !== price.id));
                            }}
                            className="btn-danger text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Título</Label>
                            <Input
                              value={price.title}
                              onChange={(e) => {
                                if (projectId) updatePrice(price.id, { title: e.target.value });
                                setPrices(prices.map(p => 
                                  p.id === price.id ? { ...p, title: e.target.value } : p
                                ));
                              }}
                              placeholder="Pacote Standard"
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Valor</Label>
                            <Input
                              value={price.price_value}
                              onChange={(e) => {
                                if (projectId) updatePrice(price.id, { price_value: e.target.value });
                                setPrices(prices.map(p => 
                                  p.id === price.id ? { ...p, price_value: e.target.value } : p
                                ));
                              }}
                              placeholder="R$ 60.000,00"
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Badge</Label>
                            <Input
                              value={price.badge_text}
                              onChange={(e) => {
                                if (projectId) updatePrice(price.id, { badge_text: e.target.value });
                                setPrices(prices.map(p => 
                                  p.id === price.id ? { ...p, badge_text: e.target.value } : p
                                ));
                              }}
                              placeholder="Mais vendido"
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Link CTA</Label>
                            <Input
                              value={price.cta_link}
                              onChange={(e) => {
                                if (projectId) updatePrice(price.id, { cta_link: e.target.value });
                                setPrices(prices.map(p => 
                                  p.id === price.id ? { ...p, cta_link: e.target.value } : p
                                ));
                              }}
                              placeholder="https://..."
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Características (uma por linha)</Label>
                            <Textarea
                              value={price.features}
                              onChange={(e) => {
                                if (projectId) updatePrice(price.id, { features: e.target.value });
                                setPrices(prices.map(p => 
                                  p.id === price.id ? { ...p, features: e.target.value } : p
                                ));
                              }}
                              placeholder="Mobília completa&#10;Ar condicionado&#10;Eletrodomésticos"
                              className="glass-input min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {prices.length === 0 && (
                      <p className="text-sm text-walka-muted text-center py-4">
                        Nenhum preço adicionado
                      </p>
                    )}
                  </div>
                </div>

                {/* FAQs Section */}
                <div className="pt-6 border-t border-walka-dark/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                      <HelpCircle size={18} className="text-secondary" />
                      Perguntas Frequentes
                    </h3>
                    <button onClick={handleAddFaq} className="btn-primary text-sm py-2">
                      <Plus size={14} />
                      Adicionar FAQ
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="p-4 bg-white/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-secondary text-sm">FAQ {index + 1}</h4>
                          <button
                            onClick={() => {
                              if (projectId) deleteFaq(faq.id);
                              setFaqs(faqs.filter(f => f.id !== faq.id));
                            }}
                            className="btn-danger text-xs"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Pergunta</Label>
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                if (projectId) updateFaq(faq.id, { question: e.target.value });
                                setFaqs(faqs.map(f => 
                                  f.id === faq.id ? { ...f, question: e.target.value } : f
                                ));
                              }}
                              placeholder="Como funciona o financiamento?"
                              className="glass-input"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Resposta</Label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => {
                                if (projectId) updateFaq(faq.id, { answer: e.target.value });
                                setFaqs(faqs.map(f => 
                                  f.id === faq.id ? { ...f, answer: e.target.value } : f
                                ));
                              }}
                              placeholder="O financiamento pode ser feito..."
                              className="glass-input min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <p className="text-sm text-walka-muted text-center py-4">
                        Nenhuma FAQ adicionada
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEO & Export Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-walka-dark flex items-center gap-2">
                  <Search size={18} className="text-secondary" />
                  SEO & Meta Tags
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Título SEO (max 60 caracteres)</Label>
                    <Input
                      value={formData.seo_title}
                      onChange={(e) => handleInputChange('seo_title', e.target.value)}
                      placeholder="Studio Bela Vista | Studios de alto padrão em SP"
                      maxLength={60}
                      className="glass-input"
                    />
                    <p className="text-xs text-walka-muted text-right">
                      {formData.seo_title.length}/60
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição SEO (max 160 caracteres)</Label>
                    <Textarea
                      value={formData.seo_desc}
                      onChange={(e) => handleInputChange('seo_desc', e.target.value)}
                      placeholder="Invista em studios compactos com alta rentabilidade na melhor localização de São Paulo. Entrega prevista para 2026."
                      maxLength={160}
                      className="glass-input min-h-[80px]"
                    />
                    <p className="text-xs text-walka-muted text-right">
                      {formData.seo_desc.length}/160
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>URL da Imagem OG (para compartilhamento)</Label>
                    <Input
                      value={formData.seo_image_url}
                      onChange={(e) => handleInputChange('seo_image_url', e.target.value)}
                      placeholder="https://..."
                      className="glass-input"
                    />
                  </div>
                </div>

                {/* Export Preview */}
                <div className="pt-6 border-t border-walka-dark/10">
                  <h3 className="font-semibold text-walka-dark mb-4">Exportar Hotsite</h3>
                  <div className="p-4 bg-white/50 rounded-xl">
                    <p className="text-sm text-walka-muted mb-4">
                      O arquivo ZIP conterá a estrutura completa do hotsite:
                    </p>
                    <ul className="text-sm text-walka-dark space-y-1 mb-4">
                      <li>📄 index.html</li>
                      <li>📁 css/style.css</li>
                      <li>📁 js/script.js</li>
                      <li>📁 images/ (referências)</li>
                    </ul>
                    <button onClick={handleExport} className="btn-primary w-full">
                      <Download size={18} />
                      Download ZIP do Hotsite
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
