// Datos de obras (cómo cargarlas: ver LEEME_WEB.md)
const obras = {
  tt: {
    nombre: "Casa TT",
    meta: "Pilar · 2025 · Casa nueva",
    ficha: { Año: "2025", Ubicación: "Pilar", Tipo: "Casa nueva" },
    fotos: [],
    video: ""
  },
  cebu: {
    nombre: "Casa El Cebú",
    meta: "Pilar · 2026 · Casa nueva",
    ficha: { Año: "2026", Ubicación: "Pilar", Tipo: "Casa nueva" },
    fotos: [],
    video: ""
  },
  sj: {
    nombre: "Casa SJ",
    meta: "Pilar · 2026 · Casa nueva",
    ficha: { Año: "2026", Ubicación: "Pilar", Tipo: "Casa nueva" },
    fotos: [],
    video: ""
  },
  bc: {
    nombre: "Casa BC",
    meta: "Pilar · 2026 · Casa nueva",
    ficha: { Año: "2026", Ubicación: "Pilar", Tipo: "Casa nueva" },
    fotos: [],
    video: ""
  },
  jp: {
    nombre: "Casa JP",
    meta: "Pilar · 2026 · Casa nueva",
    ficha: { Año: "2026", Ubicación: "Pilar", Tipo: "Casa nueva" },
    fotos: [],
    video: ""
  },
  cm: {
    nombre: "Ampliación CM",
    meta: "Pilar · 2025 · Ampliación",
    ficha: { Año: "2025", Ubicación: "Pilar", Tipo: "Ampliación" },
    fotos: [],
    video: ""
  }
};

function abrirObra(id) {
  const o = obras[id];
  document.getElementById('modal-titulo').textContent = o.nombre;
  document.getElementById('modal-meta').textContent = o.meta;

  // Fotos
  const gp = document.getElementById('galeria-principal');
  const gt = document.getElementById('galeria-thumbs');
  gp.innerHTML = '';
  gt.innerHTML = '';

  if (o.fotos && o.fotos.length > 0) {
    const img = document.createElement('img');
    img.src = o.fotos[0]; img.alt = o.nombre;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    gp.appendChild(img);
    o.fotos.forEach((f, i) => {
      const t = document.createElement('div');
      t.className = 'thumb' + (i === 0 ? ' active' : '');
      const ti = document.createElement('img');
      ti.src = f; ti.alt = o.nombre + ' ' + (i+1);
      t.appendChild(ti);
      t.onclick = () => {
        gp.innerHTML = '';
        const ni = document.createElement('img');
        ni.src = f; ni.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        gp.appendChild(ni);
        gt.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      };
      gt.appendChild(t);
    });
  } else {
    gp.innerHTML = '<div class="galeria-placeholder"><i class="ti ti-photo"></i><span>Fotos de la obra</span></div>';
  }

  // Video
  const mv = document.getElementById('modal-video');
  if (o.video) {
    document.getElementById('modal-video-src').src = o.video;
    mv.style.display = 'block';
  } else {
    mv.style.display = 'none';
  }

  // Ficha
  const mf = document.getElementById('modal-ficha');
  mf.innerHTML = Object.entries(o.ficha).map(([k,v]) =>
    `<div class="ficha-item"><span class="ficha-label">${k}</span><span class="ficha-valor">${v}</span></div>`
  ).join('');

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

// Tipo de cliente
function selTipo(el) {
  el.closest('.tipo-btns').querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tipo-input').value = el.textContent;
}

// Formulario → WhatsApp
async function enviarFormulario(e) {
  e.preventDefault();
  const f = e.target;

  // Send to Formspree
  try {
    await fetch('https://formspree.io/f/mppzvyvw', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(f)
    });
  } catch(err) {
    console.error('Formspree error:', err);
  }

  // Also open WhatsApp
  const msg = `Hola MO Construcciones! Soy ${f.nombre.value} (${f.tipo.value || document.querySelector('.tipo-btn.active').textContent}). Zona: ${f.zona.value}. Proyecto: ${f.proyecto.value}. ${f.mensaje.value}. Tel: ${f.telefono.value}`;
  window.open('https://wa.me/5491133967462?text=' + encodeURIComponent(msg), '_blank');

  // Show confirmation
  f.innerHTML = '<div style="text-align:center;padding:2rem 1rem;"><i class="ti ti-circle-check" style="font-size:36px;color:#7A6A56;"></i><p style="margin-top:1rem;font-size:15px;color:#4A3E30;font-weight:500;">¡Mensaje enviado!</p><p style="margin-top:0.5rem;font-size:13px;color:#8A7660;">Te contactamos en menos de 24 horas.</p></div>';
}


function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham = document.getElementById('hamburger');
  menu.classList.toggle('open');
  ham.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

// Nav scroll + active links + back to top + hide on footer
const sections = ['obras', 'nosotros', 'testimonios', 'contacto'];
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
    if (el && el.offsetTop - 120 <= scrollY) current = id;
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
