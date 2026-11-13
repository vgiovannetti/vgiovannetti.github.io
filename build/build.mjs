// Arma el sitio final en _site/ a partir de content/*.json (un archivo por sección).
// Lo corre GitHub Actions cada vez que se guarda algo desde el panel.
// Local (requiere Node):  npm install  y luego  npm run build
import { readFile, writeFile, mkdir, rm, cp, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./plantilla.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const salida = join(raiz, "_site");
const enGitHub = !!process.env.GITHUB_ACTIONS;

const errores = [];
const avisos = [];
const avisar = (msg) => { avisos.push(msg); console.log((enGitHub ? "::warning title=Revisar texto::" : "AVISO: ") + msg); };

// Un archivo por sección (así el panel muestra un formulario corto por sección)
const secciones = ["general", "whatsapp", "inicio", "sobre_mi", "enfoque", "areas", "como_trabajo", "preguntas", "contacto"];
const datos = {};
for (const s of secciones) {
  try {
    datos[s] = JSON.parse(await readFile(join(raiz, "content", `${s}.json`), "utf8"));
  } catch (e) {
    errores.push(`No se pudo leer content/${s}.json (${e.message}).`);
    datos[s] = {};
  }
}
const ajustes = JSON.parse(await readFile(join(raiz, "build", "ajustes.json"), "utf8"));

// ---------- 1. Campos obligatorios ----------
const obligatorios = [
  "general.nombre", "general.titulo", "general.zona", "general.descripcion_buscadores",
  "whatsapp.caracteristica", "whatsapp.numero",
  "inicio.titulo", "inicio.bajada", "sobre_mi.titulo", "sobre_mi.texto",
  "enfoque.titulo", "areas.titulo", "como_trabajo.titulo", "preguntas.titulo", "contacto.titulo",
];
for (const ruta of obligatorios) {
  const valor = ruta.split(".").reduce((o, k) => (o ? o[k] : undefined), datos);
  if (!valor || !String(valor).trim()) errores.push(`Falta completar el campo "${ruta}".`);
}
for (const [ruta, lista] of [["enfoque.pilares", datos.enfoque?.pilares], ["areas.tarjetas", datos.areas?.tarjetas],
  ["como_trabajo.items", datos.como_trabajo?.items], ["preguntas.lista", datos.preguntas?.lista]]) {
  if (!Array.isArray(lista) || lista.length === 0) errores.push(`La lista "${ruta}" no puede quedar vacía.`);
}

// ---------- 2. WhatsApp ----------
let car = String(datos.whatsapp?.caracteristica || "").replace(/\D/g, "").replace(/^0+/, "");
let num = String(datos.whatsapp?.numero || "").replace(/\D/g, "");
if (num.startsWith("15") && (car + num).length === 12) num = num.slice(2); // sacó el 15
const completo = car + num;
if (!/^[1-9]\d{9}$/.test(completo)) {
  errores.push(`El número de WhatsApp no es válido (característica "${datos.whatsapp?.caracteristica}", número "${datos.whatsapp?.numero}"). ` +
    "Entre la característica sin 0 y el número sin 15 tienen que sumar 10 dígitos. Ej.: 11 y 60327560.");
}
const waUrl = `https://wa.me/549${completo}` +
  (datos.whatsapp?.mensaje ? `?text=${encodeURIComponent(datos.whatsapp.mensaje)}` : "");

// ---------- 3. Límite profesional: términos de la psicología/medicina ----------
// No frena la publicación: avisa en GitHub Actions para revisarlo.
const terminos = /(^|[^\p{L}])(psicoterap\p{L}*|terapia\p{L}*|terap[eé]ut\p{L}*|tratamiento\p{L}*|diagn[oó]stic\p{L}*|pacientes?|trastornos?|patolog\p{L}*|psic[oó]log[oa]s?|curar|cura)(?=$|[^\p{L}])/giu;
const recorrer = (v, ruta) => {
  if (typeof v === "string") {
    if (v.includes("[REVISAR TÉRMINO]")) return; // ya marcado para revisión
    const hallados = [...v.matchAll(terminos)].map((m) => m[2]);
    if (hallados.length) avisar(`"${ruta}" usa: ${[...new Set(hallados)].join(", ")}. Una consultora psicológica no debería usar esos términos.`);
  } else if (Array.isArray(v)) v.forEach((x, i) => recorrer(x, `${ruta}[${i + 1}]`));
  else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => recorrer(x, ruta ? `${ruta}.${k}` : k));
};
recorrer(datos, "");

if (errores.length) {
  for (const e of errores) console.error((enGitHub ? "::error title=No se publicó::" : "ERROR: ") + e);
  console.error("\nNo se publicaron los cambios. El sitio sigue mostrando la versión anterior.");
  process.exit(1);
}

// ---------- 4. Copiar archivos estáticos ----------
await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
for (const carpeta of ["css", "js", "fonts"]) await cp(join(raiz, carpeta), join(salida, carpeta), { recursive: true });
// public/: archivos que van tal cual en la raíz del sitio (ej. verificación de Google Search Console)
try { await cp(join(raiz, "public"), salida, { recursive: true }); } catch (e) { if (e.code !== "ENOENT") throw e; }
await cp(join(raiz, "img"), join(salida, "img"), {
  recursive: true,
  filter: (origen) => !origen.includes(join("img", "subidas")), // los originales subidos no se publican
});

// ---------- 5. Foto: convertir a WebP en dos tamaños ----------
let foto = null;
if (datos.sobre_mi?.foto) {
  const origen = join(raiz, datos.sobre_mi.foto.replace(/^\/+/, ""));
  try {
    await access(origen);
    const sharp = (await import("sharp")).default;
    for (const [nombre, ancho] of [["foto-480.webp", 480], ["foto-960.webp", 960]]) {
      await sharp(origen).rotate()
        .resize({ width: ancho, height: Math.round(ancho * 1.25), fit: "cover", position: sharp.strategy.attention })
        .webp({ quality: 80 })
        .toFile(join(salida, "img", nombre));
    }
    foto = { chica: "img/foto-480.webp", grande: "img/foto-960.webp" };
  } catch (e) {
    avisar(`No se pudo procesar la foto "${datos.sobre_mi.foto}" (${e.message}). Se muestra la ilustración provisoria.`);
  }
}

// ---------- 6. Generar el HTML ----------
const urlSitio = ajustes.url_del_sitio || "";
const html = render(datos, {
  waUrl, foto, urlSitio, anio: new Date().getFullYear(),
  verificacionGoogle: ajustes.google_site_verification || "",
});
await writeFile(join(salida, "index.html"), html, "utf8");

// ---------- 7. Buscadores: robots.txt y sitemap.xml ----------
if (urlSitio) {
  const base = urlSitio.replace(/\/?$/, "/");
  const hoy = new Date().toISOString().slice(0, 10);
  await writeFile(join(salida, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`, "utf8");
  await writeFile(join(salida, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n    <loc>${base}</loc>\n    <lastmod>${hoy}</lastmod>\n  </url>\n</urlset>\n`, "utf8");
}

const pendientes = (html.match(/\[COMPLETAR:/g) || []).length;
console.log(`Sitio generado en _site/ · WhatsApp: ${waUrl.split("?")[0]} · Foto: ${foto ? "sí" : "provisoria"} · ` +
  `[COMPLETAR] pendientes: ${pendientes} · Avisos: ${avisos.length}`);
