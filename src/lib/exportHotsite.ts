import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FullProject } from '@/types/project';

// Helper to get unique styles from plants/tours that have content
function getActiveStyles(items: { style?: string; style_category?: string }[]): string[] {
  const styles = new Set<string>();
  items.forEach(item => {
    const style = item.style || item.style_category;
    if (style) styles.add(style);
  });
  return Array.from(styles);
}

// Generate the HTML template
function generateHTML(project: FullProject): string {
  const ctaLink = project.cta_link || project.whatsapp_link || '#';
  
  // Generate points of interest HTML - using icon-check.svg instead of icon-local.svg
  const pointsHtml = project.points_of_interest
    .split('\n')
    .filter(line => line.trim())
    .map(point => `
          <div class="div-icon-txt-local">
            <img alt="" src="images/icon-check.svg" loading="lazy" class="img-icon-local">
            <h4 class="h4-local">${point.trim()}</h4>
          </div>`)
    .join('');

  // Generate gallery HTML (split into two rows)
  const galleryImages = project.gallery;
  const midpoint = Math.ceil(galleryImages.length / 2);
  const row1 = galleryImages.slice(0, midpoint);
  const row2 = galleryImages.slice(midpoint);
  
  const galleryRow1Html = row1
    .map(img => `<img loading="lazy" src="${img.image_url}" alt="Galeria" class="gallery-image">`)
    .join('\n                      ');
  
  const galleryRow2Html = row2
    .map(img => `<img loading="lazy" src="${img.image_url}" alt="Galeria" class="gallery-image">`)
    .join('\n                      ');

  // Get active styles from plants (only generate tabs for styles that have content)
  const activePlantStyles = getActiveStyles(project.plants);
  
  // Generate plant style tabs HTML - only for styles with content
  const plantStyleTabsHtml = activePlantStyles
    .map((style, idx) => `<button class="btn${idx === 0 ? ' is-active' : ''}" data-style="${style.toLowerCase()}">${style}</button>`)
    .join('\n          ');

  // Generate plants imgMap for JS
  const imgMap: Record<string, Record<string, string>> = {};
  activePlantStyles.forEach(style => {
    imgMap[style.toLowerCase()] = { standard: '', basic: '', essential: '', design: '' };
  });
  
  project.plants.forEach(plant => {
    const style = plant.style.toLowerCase();
    const pkg = plant.package.toLowerCase();
    if (imgMap[style]) {
      imgMap[style][pkg] = plant.image_url;
    }
  });

  // Get active styles from tours (only generate tabs for styles that have content)
  const activeTourStyles = getActiveStyles(project.tours);

  // Generate tour style tabs HTML - only for styles with content
  const tourStyleTabsHtml = activeTourStyles
    .map((style, idx) => `<button class="tab${idx === 0 ? ' is-active' : ''}" data-tab="${style.toLowerCase()}">${style}</button>`)
    .join('\n      ');

  // Generate tours HTML grouped by style - only for styles with content
  const toursByStyle: Record<string, typeof project.tours> = {};
  activeTourStyles.forEach(style => {
    toursByStyle[style] = [];
  });
  
  project.tours.forEach(tour => {
    if (toursByStyle[tour.style_category]) {
      toursByStyle[tour.style_category].push(tour);
    }
  });

  const toursHtml = activeTourStyles
    .map((style, index) => {
      const tours = toursByStyle[style];
      if (tours.length === 0) return '';
      
      const buttons = tours
        .map((tour, i) => `<button class="btn${i === 0 ? ' is-active' : ''}" data-iframe="${tour.iframe_url}">${tour.label}</button>`)
        .join('\n        ');
      
      const firstTour = tours[0];
      return `
    <div class="tab-panel${index === 0 ? ' is-active' : ''}" id="panel-${style.toLowerCase()}">
      <h3 class="h3">${style}</h3>
      <div class="tour-selector">
        ${buttons}
      </div>
      <div class="iframe-wrap">
        <iframe src="${firstTour?.iframe_url || ''}" allowfullscreen loading="lazy" title="Tour ${style}"></iframe>
      </div>
    </div>`;
    })
    .filter(Boolean)
    .join('\n');

  // Generate tech specs HTML
  const techSpecsHtml = project.tech_specs
    .split('\n')
    .filter(line => line.trim())
    .map(spec => {
      const [label, value] = spec.split(':').map(s => s.trim());
      return `
            <div class="div-detalhe">
              <div class="div-icon-txt">
                <img alt="" src="images/icon-check.svg" loading="lazy" class="img-icon-check">
                <h4 class="h4-infos">${label || spec}</h4>
              </div>
              <h5 class="h5-infos">${value || ''}</h5>
            </div>`;
    })
    .join('');

  // Generate prices HTML
  const pricesHtml = project.prices
    .map((price, index) => {
      const featuresHtml = price.features
        .split('\n')
        .filter(line => line.trim())
        .map(feature => `
                <div class="div-icon-txt-price">
                  <img alt="" src="images/icon-check.svg" loading="lazy" class="img-icon-check check-price">
                  <h4 class="h4-price">${feature.trim()}</h4>
                </div>`)
        .join('');

      return `
          <div id="price-${index + 1}" class="${index === 2 ? 'price-4' : ''}">
            <div class="div-txt-h6-price">
              <h6 class="h6-price">${price.badge_text || 'Opção'}</h6>
            </div>
            <h5 class="h5-price">${price.title}</h5>
            <h5 class="h5-a-partir">a partir de</h5>
            <h3 class="h3-price">${price.price_value}</h3>
            <div class="div-caract-price">${featuresHtml}
            </div>
            <a href="${price.cta_link || ctaLink}" target="_blank" class="bt-price">
              <span class="txt-bt-agenda">Agende sua visita</span>
              <img alt="" src="images/icon-seta.svg" class="img-icon-seta">
            </a>
          </div>`;
    })
    .join('');

  // Generate FAQ HTML
  const faqHtml = project.faqs
    .map(faq => `
        <button class="custom-accordion">${faq.question}</button>
        <div class="custom-panel">
          <p>${faq.answer}</p>
        </div>`)
    .join('');

  // Phone display extraction
  const phoneDisplay = project.whatsapp_link.replace('https://wa.me/', '').replace(/\D/g, '');
  const formattedPhone = phoneDisplay.length === 13 
    ? `+${phoneDisplay.slice(0, 2)} (${phoneDisplay.slice(2, 4)}) ${phoneDisplay.slice(4, 9)}-${phoneDisplay.slice(9)}`
    : phoneDisplay;

  // Favicon and webclip filenames
  const faviconFile = project.favicon_filename || 'favicon.png';
  const webclipFile = project.webclip_filename || 'apple-touch-icon.png';

  // Determine image path helper - if it looks like a URL use as-is, otherwise prefix with images/
  const imgPath = (val: string) => {
    if (!val) return '';
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('images/')) return val;
    return `images/${val}`;
  };

  const heroImagePath = imgPath(project.hero_image_url);
  const logoPath = imgPath(project.logo_url);
  const seoImagePath = imgPath(project.seo_image_url) || heroImagePath;

  return `<!DOCTYPE html>
<html lang="pt-br" data-project="${project.slug}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${project.seo_title || project.name}</title>
  <meta name="description" content="${project.seo_desc || project.hero_subheadline}">
  <meta name="theme-color" content="${project.brand_color}">
  <link rel="stylesheet" href="css/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="images/${faviconFile}">
  <link rel="apple-touch-icon" href="images/${webclipFile}">
  <meta property="og:title" content="${project.seo_title || project.name}">
  <meta property="og:description" content="${project.seo_desc || project.hero_subheadline}">
  <meta property="og:image" content="${seoImagePath}">
  <meta property="og:type" content="website">
</head>
<body>
  <div id="top"></div>
  <header class="site-header container">
    <div class="brand">
      <img src="${logoPath}" alt="${project.name}" class="brand-logo">
      <span class="brand-name">${project.name}</span>
    </div>
    <nav class="nav">
      <a href="#section-local">Sobre o Local</a>
      <a href="#section-galeria">Galeria</a>
      <a href="#section-plantas">Plantas</a>
      <a href="#tours">Tour 360</a>
      <a href="#section-ficha-tecnica">Ficha Técnica</a>
      <a href="#section-price">Preços</a>
      <a href="#section-faq">FAQ</a>
    </nav>
  </header>

  <section class="hero hero-cover" style="background-image: url('${heroImagePath}');">
    <div class="hero-overlay"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1 class="title">${project.hero_headline}</h1>
        <p class="subtitle">${project.hero_subheadline}</p>
        <ul class="badges">
          <li><img width="20" src="images/icon-chave.svg" class="img-icon-entrega"> Entrega prevista: <strong>${project.delivery_date}</strong></li>
          <li><img width="20" src="images/icon-calendario.svg" class="img-icon-entrega"> Lançamento: <strong>${project.launch_date}</strong></li>
          <li><img width="20" src="images/icon-regua.svg" class="img-icon-entrega"> Metragens: <strong>${project.footage_range}</strong></li>
          <li><img width="20" src="images/icon-cama.svg" class="img-icon-entrega"> Tipologias: <strong>${project.typologies_text}</strong></li>
        </ul>
        <a class="btn cta" href="${ctaLink}">Ver Tours 360</a>
      </div>
    </div>
  </section>

  <section id="section-local" class="section-local">
    <div class="container w-container">
      <div class="div-local">
        <div class="div-txt-local">
          <h2 class="h2">Conheça mais sobre a localização</h2>
          <h3 class="h4">${project.location_desc}</h3>
          ${pointsHtml}
        </div>
        <div class="div-maps">
          <aside class="aside">
            <div class="map-embed">
              <iframe title="Mapa" loading="lazy" src="${project.map_embed_src}"></iframe>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>

  <section id="section-galeria" class="section-galeria">
    <div class="container w-container">
      <div class="div-galeria">
        <h2 class="h2">Imagens do ${project.name}</h2>
        <div class="div-galeria-imgs">
          <img width="30" class="gallery-arrow-left" src="images/icon-seta-esquerda.png">
          <img width="30" class="gallery-arrow-right" src="images/icon-seta-direita.png">
          <div class="galeria">
            <div class="main-gallery-container">
              <div class="horizontal-scroll-container">
                <div class="image-gallery-container">
                  <div class="image-row image-row-1">
                    ${galleryRow1Html}
                  </div>
                  <div class="image-row image-row-2">
                    ${galleryRow2Html}
                  </div>
                </div>
              </div>
            </div>
            <div id="image-modal" class="image-modal">
              <span class="close-modal">×</span>
              <img class="modal-image-content" id="modal-image">
              <img src="images/icon-seta-esquerda.png" class="modal-arrow modal-arrow-left">
              <img src="images/icon-seta-direita.png" class="modal-arrow modal-arrow-right">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="section-plantas" class="section section-plantas">
    <div class="container grid-2 plantas-grid">
      <div class="plantas-left">
        <h2 class="h2">Plantas — Studio</h2>
        <div class="tabs style-tabs">
          ${plantStyleTabsHtml}
        </div>
        <div class="tabs package-tabs">
          <button class="btn pkg is-active" data-package="standard">Standard</button>
          <button class="btn pkg" data-package="basic">Basic</button>
          <button class="btn pkg" data-package="essential">Essential</button>
          <button class="btn pkg" data-package="design">Design</button>
        </div>
        <div class="planta-imagem-wrap">
          <img id="planta-img" src="" alt="Planta">
        </div>
      </div>
      <div class="planta-card">
        <h3 class="h3" id="planta-nome">Selecione uma planta</h3>
        <p class="planta-disponibilidade"><span>🔥</span> Unidades disponíveis</p>
        <button class="btn ghost btn-agendar" onclick="window.open('${project.whatsapp_link}', '_blank')">📅 Agende sua visita</button>
        <h4 class="h4">Características</h4>
        <p id="planta-desc" class="planta-desc"></p>
      </div>
    </div>
  </section>

  <section id="tours" class="container section">
    <h2 class="h2">Tour 360 por estilo</h2>
    <div class="tabs">
      ${tourStyleTabsHtml}
    </div>
    <div class="tab-panels">
      ${toursHtml}
    </div>
  </section>

  <section id="section-ficha-tecnica" class="section-ficha-tecnica">
    <div class="container w-container">
      <div class="div-ficha-tecnica">
        <div class="div-txt-ficha">
          <h2 class="h2">Ficha técnica do empreendimento</h2>
          <div class="div-detalhes">${techSpecsHtml}
          </div>
        </div>
        <div class="div-img-ficha">
          <img width="291" class="img-ficha-tecnica" src="images/ficha-img.png">
        </div>
      </div>
    </div>
  </section>

  <section id="section-price" class="section-price">
    <div class="container w-container">
      <h2 class="h2 h2-preco">Invista em um studio mobiliado</h2>
      <div class="div-tabelas">${pricesHtml}
      </div>
    </div>
  </section>

  <section id="section-faq" class="section-faq">
    <div class="container w-container">
      <div class="div-faq">
        <h2 class="h2">Dúvidas frequentes</h2>
        ${faqHtml}
      </div>
    </div>
  </section>

  <section id="footer" class="footer">
    <div class="container w-container">
      <div class="div-footer">
        <div class="div-logo">
          <img width="116" src="${logoPath}" class="logo">
        </div>
        <div class="div-fale-com-vendas">
          <h3 class="h5 h5-footer">Fale com o time de vendas!</h3>
          <div class="div-icon-txt icon-txt-footer">
            <img width="15" src="images/icon-whats.svg" class="img-icon-whats">
            <h4 class="h4 h4-footer">${formattedPhone}</h4>
          </div>
        </div>
        <div class="div-txt-h5">
          <h5 class="h5 h5-footer">${project.address_full}</h5>
        </div>
      </div>
      <div class="div-copyright">
        <h3 class="h5 h5-copyright">Copyright © ${new Date().getFullYear()} ${project.name} | All Rights Reserved</h3>
      </div>
    </div>
    <a id="button-topo" href="#top" class="button bt-back-top w-button"> </a>
  </section>

  <div class="back-to-top">
    <a href="#top" class="bt-back-top"></a>
  </div>

  <script src="js/script.js" defer></script>
</body>
</html>`;
}

// Generate the CSS with brand color injection - FIXED: button text colors, map height, plant alignment
function generateCSS(brandColor: string): string {
  return `/* ========================================================================= */
/* ESTILOS PADRONIZADOS - Walk'a Hotsite                                    */
/* ========================================================================= */

:root {
  --bg: #f4f4f4;
  --text: #1d242b;
  --muted: #65707a;
  --brand: ${brandColor};
  --brand-2: #152328;
  --container: min(1160px, 92vw);
  --border: 1px solid rgba(13, 18, 23, .08);
  --gap: 20px;
  --radius: 8px;
  --shadow: 0 2px 4px rgba(0,0,0,0.05);
  --surface: #ffffff;
  --padrão: 'Poppins', sans-serif;
  --azul: #152328;
  --cinza-1: #f4f4f4;
  --branco-lofteria: #ffffff;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font: 400 16px/1.6 'Poppins', sans-serif, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
.container { width: var(--container); margin-inline: auto; padding-inline: var(--gap); }
.section { padding: 60px 0; }
.grid-2 { display: grid; grid-template-columns: 1.1fr .9fr; gap: var(--gap); }
.cards { display: grid; gap: var(--gap); }
.cards-4 { grid-template-columns: repeat(4, 1fr); }
.cards-3 { grid-template-columns: repeat(3, 1fr); }
.card { background: var(--surface); border: var(--border); border-radius: var(--radius); padding: clamp(14px, 2.5vw, 24px); box-shadow: var(--shadow); }
.link-card { color: var(--text); text-decoration: none; }
.link-card:hover { outline: 2px solid var(--brand); }
.site-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
.brand { display: flex; align-items: center; gap: 12px; }
.brand.small .brand-logo { width: 24px; }
.brand-logo { width: 36px; height: auto; }
.brand-name { color: var(--brand-2); font-weight: 700; }
.nav { display: flex; flex-wrap: wrap; gap: 12px; }
.nav a { color: var(--muted); text-decoration: none; padding: 8px 12px; border-radius: 999px; }
.nav a:hover { background: rgba(21, 35, 40, .06); color: var(--brand-2); }
.hero.hero-cover { position: relative; display: flex; align-items: center; min-height: clamp(320px, 48vw, 560px); background-position: center; background-size: cover; background-repeat: no-repeat; background-attachment: fixed; border-bottom: var(--border); }
.hero-overlay { position: absolute; inset: 0; background-color: rgba(26, 25, 25, 0.85); }
.hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.1fr .9fr; gap: var(--gap); align-items: center; }
.title { color: #fafafa; font-size: clamp(28px, 5vw, 48px); margin: 0 0 8px; }
.subtitle { color: #9199a2; margin: 0 0 16px; }
.badges { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-wrap: wrap; gap: 10px; }
.badges li { background: #fff; border: var(--border); border-radius: 999px; padding: 8px 12px; font-size: .95rem; box-shadow: var(--shadow); display: flex; align-items: center; gap: 8px; }
.img-icon-entrega { width: 20px; height: auto; }
.h2 { color: var(--brand-2); font-size: clamp(22px, 3.6vw, 34px); margin: 0 0 12px; font-weight: 600; }
.h3 { color: var(--brand-2); font-size: clamp(18px, 2.3vw, 22px); margin: 0 0 8px; font-weight: 600; }
.h4 { color: var(--brand-2); font-size: 16px; font-weight: 400; line-height: 1.6; margin: 0; }
.h5 { color: var(--muted); font-size: 14px; font-weight: 400; margin: 0; }
.list { padding-left: 18px; }
.kpi h3 { color: var(--muted); font-size: 1rem; margin: 0 0 6px; }
.kpi p { font-size: 1.15rem; margin: 0; }

/* BUTTONS - FIXED: Ensure readable text on dark/colored backgrounds */
.btn { appearance: none; background: #fff; color: var(--brand-2); border: 1px solid rgba(21, 35, 40, .12); border-radius: 999px; padding: 10px 16px; font-weight: 700; cursor: pointer; box-shadow: var(--shadow); text-decoration: none !important; transition: transform .06s ease, box-shadow .2s ease, background .2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 1rem; }
.btn.cta { background: var(--brand); color: #ffffff !important; border-color: transparent; }
.btn.ghost { background: #fff; border: 1px solid rgba(21, 35, 40, .18); color: var(--brand-2); }
.btn:hover { transform: translateY(-1px); box-shadow: 0 12px 22px rgba(15, 23, 42, .12); }
.btn.is-active { background: var(--brand); color: #ffffff !important; border-color: transparent; }
.btn.pkg { font-size: 0.9rem; padding: 8px 14px; }
.btn.pkg:hover { background: rgba(244, 123, 107, .12); }

.tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.tab { background: #fff; color: var(--brand-2); border: 1px solid rgba(21, 35, 40, .18); border-radius: 999px; padding: 8px 12px; cursor: pointer; box-shadow: var(--shadow); font-size: 1rem; font-weight: 500; }
.tab.is-active { background: var(--brand); color: #ffffff !important; border-color: transparent; }
.tab-panels > .tab-panel { display: none; }
.tab-panels > .tab-panel.is-active { display: block; }
.tour-selector { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.iframe-wrap { position: relative; overflow: hidden; background: #0e1215; border-radius: var(--radius); box-shadow: var(--shadow); }
.iframe-wrap::before { content: ""; display: block; padding-top: 56.25%; }
.iframe-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.section-galeria { background: #fff; padding: 60px 0; }
.container-galeria { width: var(--container); margin-inline: auto; }
.div-galeria-imgs { position: relative; }
.gallery-arrow-left, .gallery-arrow-right { position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; cursor: pointer; z-index: 10; transition: opacity 0.3s ease, transform 0.2s ease; }
.gallery-arrow-left { left: -70px; }
.gallery-arrow-right { right: -70px; }
.image-view { display: none; }
.main-gallery-container { width: 100%; overflow: hidden; position: relative; }
.horizontal-scroll-container { overflow-x: auto; overflow-y: hidden; scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none; }
.horizontal-scroll-container::-webkit-scrollbar { display: none; }
.image-gallery-container { display: flex; flex-direction: column; gap: 16px; width: max-content; }
.image-row { display: flex; gap: 16px; }
.gallery-image { width: 280px; height: 180px; object-fit: cover; border-radius: 12px; cursor: pointer; transition: transform 0.3s ease; }
.gallery-image:hover { transform: scale(1.04); }
.image-modal { display: none; position: fixed; inset: 0; z-index: 1000; background-color: rgba(0, 0, 0, 0.9); align-items: center; justify-content: center; }
.image-modal.active { display: flex; }
.modal-image-content { max-width: 90%; max-height: 85%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
.close-modal { position: absolute; top: 25px; right: 40px; color: #fff; font-size: 40px; font-weight: 300; cursor: pointer; z-index: 1100; }
.modal-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; cursor: pointer; opacity: 0.9; z-index: 1100; }
.modal-arrow-left { left: 60px; }
.modal-arrow-right { right: 60px; }
.modal-arrow:hover { opacity: 1; }
.section-ficha-tecnica { background: var(--cinza-1); padding: 60px 0; }
.div-ficha-tecnica { display: flex; justify-content: space-between; align-items: center; gap: 40px; max-width: 1160px; margin-inline: auto; padding-inline: 20px; }
.div-txt-ficha { display: flex; flex-direction: column; gap: 24px; width: 60%; }
.h2-ficha { font-family: var(--padrão); font-weight: 600; font-size: clamp(22px, 3.6vw, 34px); color: var(--azul); margin: 0; padding: 0; line-height: 1.2; }
.div-txt-h2-ficha { padding: 0; margin: 0 0 16px 0; }
.h4-infos, .h5-infos { margin: 0; line-height: 1.4; }
.div-detalhes { display: flex; flex-direction: column; gap: 18px; }
.div-detalhe { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dcdcdc; padding-bottom: 12px; }
.div-detalhe:last-child { border-bottom: none; }
.div-icon-txt { display: flex; align-items: center; gap: 10px; }
.img-icon-check { width: 22px; height: 22px; background-color: var(--branco-lofteria); border-radius: 50%; padding: 4px; flex-shrink: 0; }
.h4-infos { font-family: var(--padrão); font-size: 1rem; color: var(--azul); font-weight: 600; }
.h5-infos { font-family: var(--padrão); font-size: 1rem; color: var(--muted); font-weight: 400; text-align: right; }
.div-img-ficha { display: flex; justify-content: center; align-items: center; width: 35%; }
.img-ficha-tecnica { width: 100%; max-width: 291px; height: auto; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.img-icon-check.check-price { background-color: var(--azul); align-self: center; }
.section-price { background: var(--brand-2); padding: 60px 0; color: #fff; }
.section-price .container { max-width: 1160px; margin-inline: auto; padding-inline: 20px; }
.section-price h2.h2-preco { color: var(--bg); font-weight: 700; text-align: center; margin-bottom: 48px; }
.div-tabelas { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
#price-1, #price-2, #price-3, .price-4 { background: var(--bg); color: var(--text); border-radius: 14px; padding: 28px 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, .08); display: flex; flex-direction: column; align-items: center; justify-content: space-between; transition: transform .2s ease, box-shadow .3s ease; }
#price-3 { background: #fff; }
#price-1:hover, #price-2:hover, #price-3:hover, .price-4:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0, 0, 0, .12); }
.div-txt-h6-price { border-radius: 999px; padding: 4px 14px; margin-bottom: 12px; font-size: 13px; color: #fff; text-transform: lowercase; font-weight: 500; display: inline-block; }
.h6-price { color: inherit; font-size: inherit; font-weight: inherit; margin: 0; }
#price-1 .div-txt-h6-price { background: var(--muted); }
#price-2 .div-txt-h6-price { background: var(--muted); }
#price-3 .div-txt-h6-price { background: var(--brand); }
.price-4 .div-txt-h6-price { background: var(--brand-2); }
.h5-price { color: var(--brand-2); font-size: 1.1rem; font-weight: 700; text-align: center; margin-bottom: 8px; }
.h5-a-partir { color: var(--muted); font-size: 0.9rem; font-weight: 500; text-align: center; margin-bottom: 2px; }
.h3-price { color: var(--brand-2); font-size: 1.8rem; font-weight: 700; text-align: center; margin-bottom: 24px; }
.div-caract-price { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; width: 100%; align-items: flex-start; }
.div-icon-txt-price { display: flex; align-items: center; gap: 10px; }
.div-icon-txt-price .img-icon-check { width: 16px; height: 16px; flex-shrink: 0; background-color: var(--brand); border-radius: 50%; padding: 3px; }
.h4-price { color: var(--muted); font-size: 0.95rem; font-weight: 400; line-height: 1.5; margin: 0; }
.bt-price { background: var(--brand); color: #ffffff !important; font-weight: 700; border-radius: 999px; padding: 12px 24px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background .3s ease, transform .2s ease; width: 100%; margin-top: auto; }
.bt-price:hover { background: #f78e7e; transform: translateY(-2px); }
.txt-bt-agenda { color: inherit; font-weight: inherit; text-decoration: none; }
.img-icon-seta { width: 16px; transition: transform .2s ease; }
.bt-price:hover .img-icon-seta { transform: translateX(3px); }
.section-faq { background: var(--cinza-1); padding: 60px 0; }
.div-faq { max-width: 1160px; margin-inline: auto; padding-inline: 20px; display: flex; flex-direction: column; gap: 24px; }
.section-faq .h2 { font-family: var(--padrão); font-weight: 600; font-size: clamp(22px, 3.6vw, 34px); color: var(--azul); margin: 0; text-align: center; margin-bottom: 16px; }
.custom-accordion { position: relative; background-color: #D9D9D9; color: #152328; cursor: pointer; padding: 18px 45px 18px 25px; width: 100%; text-align: left; border: none; border-radius: 999px; outline: none; font-size: 1.1rem; font-family: var(--padrão); font-weight: 500; transition: background-color 0.3s ease; margin-bottom: 12px; }
.custom-accordion:hover, .custom-accordion.active { background-color: #ececec; }
.custom-panel { padding: 10px 25px 20px 25px; max-height: 0; overflow: hidden; font-size: 1rem; color: var(--muted); font-family: var(--padrão); line-height: 1.7; transition: max-height 0.3s ease-out, padding 0.3s ease-out; }
.custom-panel p { margin: 0; }
.custom-accordion::after { content: '+'; font-size: 1.5rem; color: var(--muted); position: absolute; top: 50%; right: 25px; transform: translateY(-50%); font-weight: 300; transition: transform 0.3s ease; }
.custom-accordion.active::after { content: "–"; transform: translateY(-50%) rotate(180deg); }
.footer { background: var(--cinza-1); padding: 60px 0 30px 0; color: var(--azul); }
.div-footer { max-width: 1160px; margin-inline: auto; padding-inline: 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; flex-wrap: wrap; margin-bottom: 30px; }
.div-logo img.logo { width: 120px; height: auto; display: block; }
.div-fale-com-vendas { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.h5-footer { font-family: var(--padrão); font-weight: 500; color: var(--muted); font-size: 0.95rem; margin: 0; line-height: 1.5; }
.h5-footer.h5 { font-weight: 600; color: var(--azul); }
.icon-txt-footer { display: flex; align-items: center; gap: 8px; }
.img-icon-whats { width: 18px; height: 18px; }
.h4-footer { font-family: var(--padrão); font-weight: 500; color: var(--azul); font-size: 1rem; margin: 0; }
.div-copyright { margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; }
.h5-copyright { font-family: var(--padrão); font-weight: 400; color: var(--muted); font-size: 0.85rem; margin: 0; }
.h5-copyright a.link { color: var(--muted); text-decoration: underline; }
.h5-copyright a.link:hover { color: var(--azul); }
.site-footer { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; border-top: var(--border); color: var(--muted); }
.back-to-top { position: fixed; right: 20px; bottom: 20px; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 100; }
.back-to-top.visible { opacity: 1; pointer-events: auto; }
.bt-back-top { background-color: var(--brand); color: #fff; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.bt-back-top::before { content: '↑'; font-size: 1.5rem; line-height: 1; }
.bt-back-top:hover { background-color: #e06a5a; }

/* PLANTS SECTION - FIXED: align-items: flex-start for top alignment */
.section-plantas { background: var(--bg); padding: 60px 0; }
.plantas-grid { display: grid; grid-template-columns: 1fr 400px; align-items: flex-start; gap: 40px; }
.plantas-left { display: flex; flex-direction: column; gap: 20px; }
.planta-imagem-wrap { display: flex; justify-content: center; align-items: center; background-color: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; overflow: hidden; }
.planta-imagem-wrap img { max-width: 100%; height: auto; object-fit: contain; max-height: 400px; }
.planta-card { align-self: flex-start; background: #fff; border: 1px solid rgba(21, 35, 40, .1); border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, .06); }
.planta-card .h3 { font-weight: 700; margin-bottom: 8px; }
.planta-disponibilidade { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px; color: var(--brand); font-weight: 600; background-color: rgba(244, 123, 107, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.9rem; }
.planta-disponibilidade span { font-size: 1rem; }
.btn-agendar { width: 100%; justify-content: center; margin-bottom: 20px; margin-top: 10px; }
.planta-card .h4 { font-weight: 700; color: var(--brand-2); margin: 20px 0 8px 0; font-size: 1rem; }
.planta-desc { font-size: 0.95rem; color: var(--muted); line-height: 1.6; }

/* LOCATION SECTION - FIXED: Map height matches text column with flexbox stretch */
.section-local { background-color: var(--cinza-1); padding: 60px 0; }
.div-local { display: flex; justify-content: space-between; align-items: stretch; gap: 40px; max-width: 1160px; margin-inline: auto; padding-inline: 20px; }
.div-txt-local { display: flex; flex-direction: column; gap: 24px; width: 55%; flex-shrink: 0; }
.div-txt-local .h2 { font-family: var(--padrão); font-weight: 600; font-size: clamp(22px, 3.6vw, 34px); color: var(--azul); margin: 0; margin-bottom: 8px; }
.div-txt-local .h4 { font-family: var(--padrão); font-size: 1rem; font-weight: 400; color: var(--muted); line-height: 1.7; margin: 0; }
.div-icon-txt-local { display: flex; align-items: center; gap: 12px; }
.img-icon-local { background-color: var(--branco-lofteria); border-radius: 6px; padding: 6px; width: 32px; height: 32px; flex-shrink: 0; }
.h4-local { color: var(--azul); font-size: 0.95rem; font-weight: 500; margin: 0; }
.div-maps { width: 40%; flex-shrink: 0; display: flex; flex-direction: column; }
.map-embed { overflow: hidden; background: #fff; border: 1px solid #e7e7e7; border-radius: 12px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); position: relative; flex: 1; min-height: 400px; }
.map-embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }

@media (max-width: 1100px) { .gallery-image { width: 240px; height: 160px; } .gallery-arrow-left { left: -50px; } .gallery-arrow-right { right: -50px; } }
@media (max-width: 991px) { .hero.hero-cover { padding: 30px 50px; } .section-local { padding: 30px 50px; } .gallery-arrow-left { left: -30px; } .gallery-arrow-right { right: -30px; } .image-row-2 { display: none !important; } .image-view { display: block; } .gallery-image { width: 200px; height: 140px; } .div-ficha-tecnica { flex-direction: column-reverse; gap: 32px; } .div-txt-ficha, .div-img-ficha { width: 100%; } .h4-infos, .h5-infos { font-size: 1rem; } .div-detalhe { flex-direction: column; align-items: flex-start; gap: 5px; text-align: left; } .h5-infos { text-align: left;} .div-local { flex-direction: column; gap: 32px; } .div-txt-local, .div-maps { width: 100%; } .map-embed { min-height: 300px; } .plantas-grid { grid-template-columns: 1fr; } .planta-card { width: 100%; margin-top: 24px; align-self: stretch; } }
@media (max-width: 880px) { .hero.hero-cover { padding: 30px 40px; } .section-local { padding: 30px 40px; } .grid-2, .hero-grid { grid-template-columns: 1fr; } }
@media (max-width: 768px) { .hero.hero-cover { padding: 35px 45px; } .section-local { padding: 35px 45px; } .div-tabelas { grid-template-columns: 1fr; gap: 25px; } }
@media (max-width: 767px) { .hero.hero-cover { padding: 35px 40px; } .section-local { padding: 35px 40px; } .custom-accordion { font-size: 1rem; padding: 15px 40px 15px 20px; } .custom-panel { font-size: 0.95rem; } .custom-accordion::after { right: 20px; } .div-footer { flex-direction: column; align-items: center; text-align: center; gap: 25px; } .div-fale-com-vendas, .div-social-media { align-items: center; text-align: center; } .div-icons-social-media { justify-content: center; } }
@media (max-width: 640px) { .hero.hero-cover { padding: 30px 40px; } .section-local { padding: 30px 40px; } .nav { display: none; } .cards-3, .cards-4 { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .hero.hero-cover { padding: 25px 30px; } .section-local { padding: 25px 30px; } .gallery-arrow-left, .gallery-arrow-right { display: none; } .gallery-image { width: 80vw; height: auto; } .horizontal-scroll-container { gap: 10px; } }`;
}

// Generate the JavaScript with imgMap injection - FIXED: FAQ accordion with DOMContentLoaded
function generateJS(project: FullProject): string {
  // Get active styles from plants
  const activePlantStyles = getActiveStyles(project.plants);
  const activeTourStyles = getActiveStyles(project.tours);
  
  // Build imgMap from plants - only for active styles
  const imgMap: Record<string, Record<string, string>> = {};
  activePlantStyles.forEach(style => {
    imgMap[style.toLowerCase()] = { standard: '', basic: '', essential: '', design: '' };
  });
  
  project.plants.forEach(plant => {
    const style = plant.style.toLowerCase();
    const pkg = plant.package.toLowerCase();
    if (imgMap[style]) {
      imgMap[style][pkg] = plant.image_url;
    }
  });

  // Build panels object only for active tour styles
  const panelsInit = activeTourStyles
    .map(style => `    ${style.toLowerCase()}: document.getElementById('panel-${style.toLowerCase()}')`)
    .join(',\n');

  return `// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", function() {
  // Tour Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = {
${panelsInit}
  };
  
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active');
    const key = t.dataset.tab;
    Object.values(panels).forEach(p => p && p.classList.remove('is-active'));
    if(panels[key]) panels[key].classList.add('is-active');
    const toursSec = document.getElementById('tours');
    if(toursSec) toursSec.scrollIntoView({behavior:'smooth', block:'start'});
  }));

  // Tour Iframe Switcher
  document.querySelectorAll('.tour-selector').forEach(group => {
    const wrap = group.nextElementSibling?.querySelector('iframe');
    if(!wrap) return;
    group.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const url = btn.dataset.iframe;
        if(url) wrap.src = url;
      });
    });
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });

  // Back to Top
  const backTop = document.querySelector('.back-to-top');
  const onScroll = () => {
    if(!backTop) return;
    if(window.scrollY > 480) backTop.classList.add('visible');
    else backTop.classList.remove('visible');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // FAQ Accordion - FIXED: Proper event delegation after DOM load
  const acc = document.getElementsByClassName("custom-accordion");
  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  // Plantas Logic
  const styleBtns = document.querySelectorAll(".style-tabs .btn");
  const packageBtns = document.querySelectorAll(".package-tabs .btn");
  const img = document.getElementById("planta-img");
  const nome = document.getElementById("planta-nome");
  const desc = document.getElementById("planta-desc");

  let currentStyle = "${activePlantStyles[0]?.toLowerCase() || 'eco'}";
  let currentPackage = "standard";

  const imgMap = ${JSON.stringify(imgMap, null, 2)};

  const infoMap = {
    standard: "Studio Standard - Imóvel entregue padrão",
    basic: "Studio Basic - Solução prática e econômica para investidores que buscam agilidade na venda ou locação anual do imóvel",
    essential: "Studio Essential - Pensado para imóveis de short stay, com foco em performance e controle de custos",
    design: "Studio Design - Projetado para imóveis de estadia premium, com foco em estética refinada e alto valor percebido"
  };

  function updatePlanta() {
    if (!imgMap[currentStyle] || !imgMap[currentStyle][currentPackage]) {
      console.warn("Imagem não encontrada para: " + currentStyle + " " + currentPackage);
      return;
    }
    if (img) img.src = imgMap[currentStyle][currentPackage];
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
    if (nome) nome.textContent = "Studio " + capitalize(currentPackage) + " — " + capitalize(currentStyle);
    if (desc) desc.textContent = infoMap[currentPackage];
  }

  styleBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      styleBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentStyle = btn.dataset.style;
      updatePlanta();
    });
  });

  packageBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      packageBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentPackage = btn.dataset.package;
      updatePlanta();
    });
  });
  
  updatePlanta();

  // Gallery Scroll
  const scrollContainer = document.querySelector(".horizontal-scroll-container");
  const leftArrow = document.querySelector(".gallery-arrow-left");
  const rightArrow = document.querySelector(".gallery-arrow-right");
  if (leftArrow && rightArrow && scrollContainer) {
    leftArrow.addEventListener("click", () => scrollContainer.scrollBy({ left: -scrollContainer.clientWidth * 0.8, behavior: "smooth" }));
    rightArrow.addEventListener("click", () => scrollContainer.scrollBy({ left: scrollContainer.clientWidth * 0.8, behavior: "smooth" }));
  }

  // Modal Lightbox
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-image");
  const closeModal = document.querySelector(".close-modal");
  const modalArrowLeft = document.querySelector(".modal-arrow-left");
  const modalArrowRight = document.querySelector(".modal-arrow-right");
  const galleryImages = document.querySelectorAll(".gallery-image");
  let currentIndex = 0;

  if(galleryImages.length > 0) {
    galleryImages.forEach((img, index) => {
      img.addEventListener("click", () => {
        modal.classList.add("active");
        modalImg.src = img.src;
        currentIndex = index;
      });
    });
    
    const showImage = (index) => {
      if (index < 0) index = galleryImages.length - 1;
      if (index >= galleryImages.length) index = 0;
      currentIndex = index;
      modalImg.src = galleryImages[currentIndex].src;
    };
    
    if (modalArrowLeft) modalArrowLeft.addEventListener("click", () => showImage(currentIndex - 1));
    if (modalArrowRight) modalArrowRight.addEventListener("click", () => showImage(currentIndex + 1));
    if (closeModal) closeModal.addEventListener("click", () => modal.classList.remove("active"));
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });
    
    document.addEventListener("keydown", (e) => {
      if (!modal || !modal.classList.contains("active")) return;
      if (e.key === "ArrowLeft") showImage(currentIndex - 1);
      if (e.key === "ArrowRight") showImage(currentIndex + 1);
      if (e.key === "Escape") modal.classList.remove("active");
    });
  }
});`;
}

// Main export function
export async function exportProjectAsZip(project: FullProject): Promise<void> {
  const zip = new JSZip();
  
  // Add files to zip
  zip.file('index.html', generateHTML(project));
  zip.folder('css')?.file('style.css', generateCSS(project.brand_color));
  zip.folder('js')?.file('script.js', generateJS(project));
  
  // Create images folder with a readme
  zip.folder('images')?.file('README.txt', `Place your images here:

Required icons:
- ${project.favicon_filename || 'favicon.png'}
- ${project.webclip_filename || 'apple-touch-icon.png'}
- icon-chave.svg
- icon-calendario.svg
- icon-regua.svg
- icon-cama.svg
- icon-check.svg
- icon-whats.svg
- icon-seta.svg
- icon-seta-esquerda.png
- icon-seta-direita.png
- ficha-img.png

Hero & content images:
${project.hero_image_url && !project.hero_image_url.startsWith('http') ? `- ${project.hero_image_url}\n` : ''}${project.logo_url && !project.logo_url.startsWith('http') ? `- ${project.logo_url}\n` : ''}
Gallery and plant images are referenced via their configured paths.`);
  
  // Generate zip and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${project.slug || 'hotsite'}.zip`);
}
