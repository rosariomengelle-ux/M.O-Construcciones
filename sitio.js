// Video de portada: se elige un solo archivo según la pantalla (vertical en celular).
// Con "menos movimiento" pedido en el equipo no se descarga y queda la imagen fija;
// si el video no carga, también queda la imagen fija.
(function () {
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const sinVideo = () => {
    v.style.display = 'none';
    v.parentElement.classList.add('sin-video');
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { sinVideo(); return; }
  v.addEventListener('error', sinVideo);
  v.addEventListener('playing', () => v.parentElement.classList.add('reproduciendo'), { once: true });
  v.src = window.matchMedia('(max-width: 767px)').matches ? v.dataset.vertical : v.dataset.horizontal;
  const p = v.play();
  if (p && p.catch) p.catch(() => {});  // si el navegador no deja reproducir solo, queda la imagen fija del video
})();

// ══ Obras y testimonios ══
// Los datos están en datos/obras.json y datos/testimonios.json (cómo cargarlos: LEEME_WEB.md).
// Reglas firmes (Paso 8): la ubicación es siempre "Pilar"; una obra de otro estudio solo se
// muestra con su permiso; un testimonio solo se muestra si es real y tiene permiso.
const MIN_FOTOS = 3;
let obras = {};

function versionChica(foto) {           // fotos/casa/01.jpg → fotos/casa/01-1200.jpg
  return foto.replace(/\.jpg$/i, '-1200.jpg');
}

function obraValida(o) {
  if (!o.publicar) return false;
  if (o.ubicacion && o.ubicacion !== 'Pilar') {
    console.warn(`Obra "${o.nombre_publico}": ubicación "${o.ubicacion}" no permitida, se muestra "Pilar".`);
  }
  if (o.proyecto && !o.permiso_estudio) {
    console.warn(`Obra "${o.nombre_publico}": es de ${o.proyecto} y no tiene permiso_estudio, no se muestra.`);
    return false;
  }
  if (!Array.isArray(o.fotos) || o.fotos.length < MIN_FOTOS) return false;
  return true;
}

function mostrarSeccion(id, visible) {
  document.getElementById(id).hidden = !visible;
  document.querySelectorAll(`[data-seccion="${id}"]`).forEach(a => { a.hidden = !visible; });
  if (id === 'obras' && visible) {          // la flecha de la portada lleva a las obras cuando hay
    const flecha = document.getElementById('heroScroll');
    flecha.href = '#obras';
    flecha.querySelector('span').textContent = 'Ver obras';
  }
}

function tarjetaObra(o) {
  const card = document.createElement('div');
  card.className = 'obra-card reveal';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.onclick = () => abrirObra(o.slug);
  card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirObra(o.slug); } };

  const img = document.createElement('img');
  img.className = 'obra-img';
  img.loading = 'lazy';
  img.src = versionChica(o.fotos[0]);
  img.srcset = `${versionChica(o.fotos[0])} 1200w, ${o.fotos[0]} 2400w`;
  img.sizes = '(max-width: 768px) 100vw, 50vw';
  img.alt = `${o.nombre_publico}, ${o.tipo.toLowerCase()} en Pilar`;
  card.appendChild(img);

  if (o.destacada) {
    const tag = document.createElement('span');
    tag.className = 'obra-tag';
    tag.textContent = 'Destacada';
    card.appendChild(tag);
  }
  const ov = document.createElement('div');
  ov.className = 'obra-overlay';
  const nom = document.createElement('p');
  nom.className = 'obra-nombre';
  nom.textContent = o.nombre_publico;
  const meta = document.createElement('p');
  meta.className = 'obra-meta';
  meta.textContent = ['Pilar', o.anio, o.tipo].filter(Boolean).join(' · ');
  const ver = document.createElement('span');
  ver.className = 'obra-ver';
  ver.innerHTML = 'Ver proyecto <i class="ti ti-arrow-right"></i>';
  ov.append(nom, meta, ver);
  card.appendChild(ov);
  return card;
}

async function cargarObras() {
  let lista = [];
  try {
    lista = await (await fetch('datos/obras.json', { cache: 'no-cache' })).json();
  } catch (err) {
    console.warn('No se pudo leer datos/obras.json', err);
  }
  const validas = lista.filter(obraValida)
    .sort((a, b) => (b.destacada === true) - (a.destacada === true));  // la destacada va primero (tarjeta grande)
  obras = Object.fromEntries(validas.map(o => [o.slug, o]));
  const grid = document.getElementById('obrasGrid');
  grid.innerHTML = '';
  validas.forEach(o => grid.appendChild(tarjetaObra(o)));
  mostrarSeccion('obras', validas.length > 0);
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

async function cargarTestimonios() {
  let lista = [];
  try {
    lista = await (await fetch('datos/testimonios.json', { cache: 'no-cache' })).json();
  } catch (err) {
    console.warn('No se pudo leer datos/testimonios.json', err);
  }
  const validos = lista.filter(t => t.real_con_permiso === true && t.texto && t.nombre);
  const grid = document.getElementById('testimoniosGrid');
  grid.innerHTML = '';
  validos.forEach(t => {
    const card = document.createElement('div');
    card.className = 't-card reveal';
    card.innerHTML = '<div class="t-dots"><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div></div>';
    const txt = document.createElement('p');
    txt.className = 't-text';
    txt.textContent = `"${t.texto}"`;
    const nom = document.createElement('p');
    nom.className = 't-nombre';
    nom.textContent = t.nombre;
    card.append(txt, nom);
    if (t.tipo) {                        // sin lugar: solo el tipo de obra
      const tipo = document.createElement('p');
      tipo.className = 't-zona';
      tipo.textContent = t.tipo;
      card.appendChild(tipo);
    }
    grid.appendChild(card);
  });
  mostrarSeccion('testimonios', validos.length > 0);
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function fotoGrande(gp, foto, alt) {
  gp.innerHTML = '';
  const img = document.createElement('img');
  img.src = foto;
  img.alt = alt;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
  gp.appendChild(img);
}

function abrirObra(slug) {
  const o = obras[slug];
  if (!o) return;
  document.getElementById('modal-titulo').textContent = o.nombre_publico;
  document.getElementById('modal-meta').textContent = ['Pilar', o.anio, o.tipo].filter(Boolean).join(' · ');

  // Fotos: la grande en 2400 px, las miniaturas en 1200 px
  const gp = document.getElementById('galeria-principal');
  const gt = document.getElementById('galeria-thumbs');
  gt.innerHTML = '';
  fotoGrande(gp, o.fotos[0], `${o.nombre_publico}, foto 1`);
  o.fotos.forEach((f, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'thumb' + (i === 0 ? ' active' : '');
    t.setAttribute('aria-label', `Ver foto ${i + 1}`);
    const ti = document.createElement('img');
    ti.src = versionChica(f);
    ti.alt = '';
    ti.loading = 'lazy';
    t.appendChild(ti);
    t.onclick = () => {
      fotoGrande(gp, f, `${o.nombre_publico}, foto ${i + 1}`);
      gt.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
    };
    gt.appendChild(t);
  });

  // Video
  const mv = document.getElementById('modal-video');
  if (o.video) {
    document.getElementById('modal-video-src').src = o.video;
    mv.querySelector('video').load();
    mv.style.display = 'block';
  } else {
    mv.style.display = 'none';
  }

  // Ficha
  const mf = document.getElementById('modal-ficha');
  mf.innerHTML = '';
  const ficha = [['Año', o.anio], ['Ubicación', 'Pilar'], ['Tipo', o.tipo]];
  if (o.proyecto) ficha.push(['Proyecto', o.proyecto]);
  ficha.filter(([, v]) => v).forEach(([k, v]) => {
    const item = document.createElement('div');
    item.className = 'ficha-item';
    const l = document.createElement('span');
    l.className = 'ficha-label';
    l.textContent = k;
    const val = document.createElement(k === 'Proyecto' && o.estudio_instagram ? 'a' : 'span');
    val.className = 'ficha-valor';
    val.textContent = v;
    if (val.tagName === 'A') {
      val.href = 'https://www.instagram.com/' + o.estudio_instagram.replace(/^@/, '');
      val.target = '_blank';
      val.rel = 'noopener';
    }
    item.append(l, val);
    mf.appendChild(item);
  });

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

// Botón "Hablemos" de arquitectos: deja elegido "Arquitecto / Estudio" en el formulario
function elegirArquitecto() {
  const b = [...document.querySelectorAll('.tipo-btn')].find(x => x.textContent.trim() === 'Arquitecto / Estudio');
  if (b) selTipo(b);
}

// Tipo de cliente
function selTipo(el) {
  el.closest('.tipo-btns').querySelectorAll('.tipo-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-pressed', 'true');
  document.getElementById('tipo-input').value = el.textContent.trim();
}

// Formulario → WhatsApp
// No se envía nada desde la página: solo se abre WhatsApp con el mensaje armado
// y la persona lo manda desde su teléfono.
function enviarFormulario(e) {
  e.preventDefault();
  const f = e.target;

  const msg = `Hola MO Construcciones! Soy ${f.nombre.value} (${f.tipo.value || document.querySelector('.tipo-btn.active').textContent}). Zona: ${f.zona.value}. Proyecto: ${f.proyecto.value}. ${f.mensaje.value}. Tel: ${f.telefono.value}`;
  const link = 'https://wa.me/5491133967462?text=' + encodeURIComponent(msg);
  const ventana = window.open(link, '_blank');
  if (!ventana) { window.location.href = link; return; } // si el navegador bloquea la ventana nueva

  f.innerHTML = '<div style="text-align:center;padding:2rem 1rem;"><i class="ti ti-brand-whatsapp" style="font-size:36px;color:#7A6A56;"></i><p style="margin-top:1rem;font-size:15px;color:#4A3E30;font-weight:500;">Se abrió WhatsApp con tu mensaje</p><p style="margin-top:0.5rem;font-size:13px;color:#8A7660;">Tocá enviar en WhatsApp para que nos llegue. Te respondemos en menos de 24 horas.</p></div>';
}


function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham = document.getElementById('hamburger');
  menu.classList.toggle('open');
  ham.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

// Nav scroll + active links + back to top + hide on footer
const sections = ['obras', 'como-trabajamos', 'nosotros', 'testimonios', 'contacto'];
const navLinks = document.querySelectorAll('.nav-links a');
const backTop = document.getElementById('backTop');
const nav = document.getElementById('nav');
const footer = document.querySelector('.footer');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Nav background — stay transparent until leaving hero
  const heroH = document.querySelector('.hero') ? document.querySelector('.hero').offsetHeight - 80 : 500;
  nav.classList.toggle('scrolled', scrollY > heroH);

  // Hide nav when footer is visible
  if (footer) {
    const footerTop = footer.getBoundingClientRect().top;
    const navHidden = footerTop < 80;
    nav.style.opacity = navHidden ? '0' : '1';
    nav.style.pointerEvents = navHidden ? 'none' : 'all';
    nav.style.transform = navHidden ? 'translateY(-100%)' : 'translateY(0)';
  }

  // Back to top
  backTop.classList.toggle('visible', scrollY > 400);

  // Active nav link
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.hidden && el.offsetTop - 120 <= scrollY) current = id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === current);
  });
});

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

cargarObras();
cargarTestimonios();
