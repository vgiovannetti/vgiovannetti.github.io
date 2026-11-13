// Plantilla del sitio. Recibe el contenido (content/*.json, editado desde el panel)
// y devuelve el HTML final. Todo el texto se escapa: desde el panel no se puede romper el diseño.
// El AVISO DE CRISIS del pie está fijo acá a propósito (no es editable desde el panel).

const escapar = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Texto visible: escapa y resalta los marcadores [COMPLETAR: …] y [REVISAR TÉRMINO]
const t = (s = "") =>
  escapar(s)
    .replace(/\[COMPLETAR:[^\]]*\]/g, (m) => `<span class="completar">${m}</span>`)
    .replace(/\[REVISAR TÉRMINO\]/g, (m) => `<mark class="revisar">${m}</mark>`);

// Texto largo: cada renglón en blanco separa un párrafo
const parrafos = (s = "") =>
  String(s).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${t(p).replace(/\n/g, "<br>")}</p>`).join("\n            ");

const iconoWa = `<svg class="icono" aria-hidden="true" focusable="false"><use href="#icono-whatsapp"/></svg>`;
const coloresPilar = ["sol", "durazno", "menta", "coral"];
const coloresTarjeta = ["manteca", "durazno", "menta"];

export function render(d, { waUrl, foto, urlSitio, anio, verificacionGoogle }) {
  const g = d.general;
  const abs = (ruta) => (urlSitio ? urlSitio.replace(/\/$/, "") + "/" + ruta : ruta);
  const botonWa = (clase) =>
    `<a class="boton ${clase}" href="${escapar(waUrl)}" target="_blank" rel="noopener">
              ${iconoWa}
              Escribime por WhatsApp
            </a>`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${g.nombre} · ${g.titulo}`,
    description: g.descripcion_buscadores,
    image: abs("img/og-image.png"),
    ...(urlSitio ? { url: urlSitio } : {}),
    areaServed: [g.zona, "Online"],
    address: { "@type": "PostalAddress", addressLocality: g.zona, addressCountry: "AR" },
    founder: {
      "@type": "Person",
      name: g.nombre,
      jobTitle: g.titulo,
      memberOf: { "@type": "Organization", name: "Asociación Argentina de Counselors" },
    },
  }, null, 2).replace(/</g, "\\u003c");

  const imgFoto = foto
    ? `<img src="${foto.chica}" srcset="${foto.chica} 480w, ${foto.grande} 960w" sizes="(min-width: 48em) 40vw, 20rem"
               width="480" height="600" loading="lazy" decoding="async" alt="${escapar(g.nombre)}, ${escapar(g.titulo.toLowerCase())}">`
    : `<img src="img/foto-provisoria.svg" width="480" height="600" loading="lazy" decoding="async"
               alt="Ilustración provisoria en lugar de la foto profesional de ${escapar(g.nombre)}">`;

  return `<!doctype html>
<!-- ARCHIVO GENERADO por build/build.mjs: no editar a mano. Contenido en content/*.json, diseño en build/plantilla.mjs -->
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapar(g.nombre)} · ${escapar(g.titulo)} | Counseling online y en ${escapar(g.zona)}</title>
  <meta name="description" content="${escapar(g.descripcion_buscadores)}">
  <meta name="theme-color" content="#FFF8EE">
  ${verificacionGoogle ? `<meta name="google-site-verification" content="${escapar(verificacionGoogle)}">` : "<!-- google-site-verification: se completa en build/ajustes.json -->"}

  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_AR">
  <meta property="og:title" content="${escapar(g.nombre)} · ${escapar(g.titulo)}">
  <meta property="og:description" content="${escapar(g.descripcion_buscadores)}">
  <meta property="og:image" content="${escapar(abs("img/og-image.png"))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Logo VG de ${escapar(g.nombre)}, ${escapar(g.titulo)}">
  ${urlSitio ? `<meta property="og:url" content="${escapar(urlSitio)}">\n  <link rel="canonical" href="${escapar(urlSitio)}">` : "<!-- og:url: se completa al definir url_del_sitio en build/ajustes.json -->"}

  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <link rel="preload" href="fonts/nunito-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/fraunces-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/styles.css">
  <script src="js/main.js" defer></script>
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <!-- Sprite de íconos. Ícono de WhatsApp: Simple Icons (CC0), simpleicons.org -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="icono-whatsapp" viewBox="0 0 24 24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></symbol>
  </svg>

  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <!-- ============ 1. ENCABEZADO ============ -->
  <header class="encabezado">
    <div class="contenedor encabezado__fila">
      <a class="marca" href="#inicio" aria-label="${escapar(g.nombre)}, ${escapar(g.titulo)} — ir al inicio">
        <svg class="marca__logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <circle cx="32" cy="32" r="30" fill="var(--c-sol)"/>
          <circle cx="32" cy="32" r="30" fill="none" stroke="var(--c-coral)" stroke-width="3"/>
          <text x="32" y="41" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="26" fill="var(--c-tinta)">VG</text>
        </svg>
        <span class="marca__texto">
          <span class="marca__nombre">${escapar(g.nombre)}</span>
          <span class="marca__titulo">${escapar(g.titulo)}</span>
        </span>
      </a>

      <nav class="nav" aria-label="Principal">
        <button class="nav__boton" type="button" aria-expanded="false" aria-controls="nav-menu" hidden>
          <span class="nav__hamburguesa" aria-hidden="true"></span>
          <span class="nav__boton-texto">Menú</span>
        </button>
        <ul class="nav__menu" id="nav-menu">
          <li><a href="#sobre-mi">Sobre mí</a></li>
          <li><a href="#enfoque">Enfoque</a></li>
          <li><a href="#areas">Acompañamiento</a></li>
          <li><a href="#como-trabajo">Cómo trabajo</a></li>
          <li><a href="#preguntas">Preguntas</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li class="nav__cta">
            ${botonWa("boton--chico")}
          </li>
        </ul>
      </nav>

      ${botonWa("boton--chico encabezado__cta")}
    </div>
  </header>

  <main id="contenido">

    <!-- ============ 2. INICIO ============ -->
    <section class="hero" id="inicio" aria-labelledby="hero-titulo">
      <div class="contenedor hero__grilla">
        <div class="hero__texto">
          <p class="antetitulo">${t(d.inicio.antetitulo)}</p>
          <h1 id="hero-titulo">${t(d.inicio.titulo)}</h1>
          <p class="hero__bajada">${t(d.inicio.bajada)}</p>
          <div class="hero__acciones">
            ${botonWa("boton--grande")}
            <a class="enlace-flecha" href="#como-trabajo">Conocé cómo trabajo</a>
          </div>
        </div>
        <div class="hero__ilustracion" aria-hidden="true">
          <span class="burbuja burbuja--sol"></span>
          <span class="burbuja burbuja--durazno"></span>
          <span class="burbuja burbuja--menta"></span>
          <span class="burbuja burbuja--chica"></span>
        </div>
      </div>
    </section>

    <!-- ============ 3. SOBRE MÍ ============ -->
    <section class="seccion" id="sobre-mi" aria-labelledby="sobre-mi-titulo">
      <div class="contenedor sobre-mi">
        <figure class="sobre-mi__foto">
          ${imgFoto}
        </figure>
        <div class="sobre-mi__texto">
          <p class="antetitulo">Sobre mí</p>
          <h2 id="sobre-mi-titulo">${t(d.sobre_mi.titulo)}</h2>
          <div>
            ${parrafos(d.sobre_mi.texto)}
          </div>
          ${(d.sobre_mi.formacion || []).length ? `
          <h3 class="subtitulo">Formación</h3>
          <ul class="lista-formacion">
            ${d.sobre_mi.formacion.map((f) => `<li>${t(f)}</li>`).join("\n            ")}
          </ul>` : ""}
        </div>
      </div>
    </section>

    <!-- ============ 4. ENFOQUE ============ -->
    <section class="seccion seccion--suave" id="enfoque" aria-labelledby="enfoque-titulo">
      <div class="contenedor">
        <div class="encabezado-seccion">
          <p class="antetitulo">Mi enfoque</p>
          <h2 id="enfoque-titulo">${t(d.enfoque.titulo)}</h2>
          ${parrafos(d.enfoque.introduccion)}
        </div>
        <ul class="pilares">
          ${d.enfoque.pilares.map((p, i) => `<li class="pilar">
            <span class="pilar__marca pilar__marca--${coloresPilar[i % coloresPilar.length]}" aria-hidden="true"></span>
            <h3>${t(p.titulo)}</h3>
            <p>${t(p.texto)}</p>
          </li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <!-- ============ 5. ÁREAS DE ACOMPAÑAMIENTO ============ -->
    <section class="seccion" id="areas" aria-labelledby="areas-titulo">
      <div class="contenedor">
        <div class="encabezado-seccion">
          <p class="antetitulo">Áreas de acompañamiento</p>
          <h2 id="areas-titulo">${t(d.areas.titulo)}</h2>
        </div>
        <div class="tarjetas">
          ${d.areas.tarjetas.map((c, i) => `<article class="tarjeta tarjeta--${coloresTarjeta[i % coloresTarjeta.length]}">
            <h3>${t(c.titulo)}</h3>
            <p>${t(c.descripcion)}</p>
            <ul>
              ${(c.ejemplos || []).map((e) => `<li>${t(e)}</li>`).join("\n              ")}
            </ul>
          </article>`).join("\n          ")}
        </div>
      </div>
    </section>

    <!-- ============ 6. CÓMO TRABAJO ============ -->
    <section class="seccion seccion--suave" id="como-trabajo" aria-labelledby="como-trabajo-titulo">
      <div class="contenedor">
        <div class="encabezado-seccion">
          <p class="antetitulo">Cómo trabajo</p>
          <h2 id="como-trabajo-titulo">${t(d.como_trabajo.titulo)}</h2>
        </div>
        <dl class="datos">
          ${d.como_trabajo.items.map((x) => `<div class="dato">
            <dt>${t(x.titulo)}</dt>
            <dd>${t(x.texto)}</dd>
          </div>`).join("\n          ")}
        </dl>
      </div>
    </section>

    <!-- ============ 7. PREGUNTAS FRECUENTES ============ -->
    <section class="seccion" id="preguntas" aria-labelledby="preguntas-titulo">
      <div class="contenedor contenedor--angosto">
        <div class="encabezado-seccion">
          <p class="antetitulo">Preguntas frecuentes</p>
          <h2 id="preguntas-titulo">${t(d.preguntas.titulo)}</h2>
        </div>
        <div class="faq">
          ${d.preguntas.lista.map((q) => `<details>
            <summary>${t(q.pregunta)}</summary>
            ${parrafos(q.respuesta)}
          </details>`).join("\n          ")}
        </div>
      </div>
    </section>

    <!-- ============ 8. CONTACTO ============ -->
    <section class="seccion contacto" id="contacto" aria-labelledby="contacto-titulo">
      <div class="contenedor contacto__caja">
        <div>
          <p class="antetitulo">Contacto</p>
          <h2 id="contacto-titulo">${t(d.contacto.titulo)}</h2>
          ${parrafos(d.contacto.texto)}
        </div>
        ${botonWa("boton--grande")}
        <ul class="contacto__info">
          <li><strong>Modalidad:</strong> ${t(d.contacto.modalidad)}</li>
          <li><strong>Zona:</strong> ${t(g.zona)}</li>
          ${d.contacto.horarios ? `<li><strong>Horarios:</strong> ${t(d.contacto.horarios)}</li>` : ""}
        </ul>
      </div>
    </section>
  </main>

  <!-- ============ 9. PIE ============ -->
  <footer class="pie">
    <div class="contenedor pie__grilla">
      <div>
        <p class="pie__nombre">${escapar(g.nombre)}</p>
        <p>${escapar(g.titulo)} · Counseling</p>
        <p>Online y presencial en ${escapar(g.zona)}</p>
      </div>

      <nav aria-label="Secundaria">
        <ul class="pie__enlaces">
          <li><a href="#sobre-mi">Sobre mí</a></li>
          <li><a href="#enfoque">Enfoque</a></li>
          <li><a href="#areas">Acompañamiento</a></li>
          <li><a href="#como-trabajo">Cómo trabajo</a></li>
          <li><a href="#preguntas">Preguntas frecuentes</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      <!--
        AVISO DE CRISIS (fijo, no editable desde el panel) — números verificados el 12/11/2026 en fuentes oficiales:
        · 0800-999-0091, Línea Nacional de Orientación y Apoyo en la Urgencia de Salud Mental, 24 h los 365 días:
          https://www.argentina.gob.ar/dispositivo-0800 (Ministerio de Salud de la Nación)
        · 135 (gratuita desde CABA y GBA), (011) 5275-1135 o 0800 345 1435 desde todo el país:
          https://www.asistenciaalsuicida.org.ar/ (Centro de Asistencia al Suicida)
        · 107 SAME y 911: https://buenosaires.gob.ar/gcaba_historico/salud/salud-mental/atencion-telefonica (GCBA)
        Revisar vigencia periódicamente (sugerido: una vez por año).
      -->
      <aside class="pie__aviso" aria-labelledby="aviso-titulo">
        <p id="aviso-titulo"><strong>Este espacio no es un servicio de urgencias.</strong>
          Si vos o alguien cercano está en riesgo, comunicate de inmediato con:</p>
        <ul>
          <li>Emergencias: <a href="tel:911">911</a> · SAME (CABA): <a href="tel:107">107</a></li>
          <li>Línea Nacional de Salud Mental: <a href="tel:08009990091">0800-999-0091</a> (gratuita, las 24 h, todos los días)</li>
          <li>Centro de Asistencia al Suicida: <a href="tel:135">135</a> (gratuita desde CABA y GBA) o
            <a href="tel:08003451435">0800 345 1435</a> / <a href="tel:+541152751135">(011) 5275-1135</a> desde todo el país</li>
        </ul>
      </aside>
    </div>
    <div class="contenedor pie__legal">
      <p>© <span data-anio>${anio}</span> ${escapar(g.nombre)}. Todos los derechos reservados.</p>
    </div>
  </footer>

  <!-- Botón flotante (solo en celular) -->
  <a class="wa-flotante" href="${escapar(waUrl)}" target="_blank" rel="noopener" aria-label="Escribime por WhatsApp">
    ${iconoWa}
  </a>
</body>
</html>
`;
}
