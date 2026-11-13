// Genera las tarjetas personales (HTML listo para imprimir a PDF) con los datos del panel.
//   npm run tarjeta   → difusion/tarjeta-imprenta.html y difusion/tarjetas-a4.html
// Después se pasan a PDF con tools/tarjeta/a-pdf.ps1 (Edge headless).
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = async (f) => JSON.parse(await readFile(join(raiz, f), "utf8"));
const general = await leer("content/general.json");
const wa = await leer("content/whatsapp.json");
const ajustes = await leer("build/ajustes.json");

const url = ajustes.url_del_sitio || "https://vgiovannetti.github.io/";
const urlVisible = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const car = String(wa.caracteristica).replace(/\D/g, "").replace(/^0+/, "");
let num = String(wa.numero).replace(/\D/g, "");
if (num.startsWith("15") && (car + num).length === 12) num = num.slice(2);
const telVisible = `${car} ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// QR al sitio, corrección de errores "M", en color tinta sobre blanco (máximo contraste para escanear)
const qrSvg = await QRCode.toString(url, {
  type: "svg", errorCorrectionLevel: "M", margin: 0, color: { dark: "#3A2A24", light: "#FFFFFF" },
});
await mkdir(join(raiz, "difusion"), { recursive: true });
await writeFile(join(raiz, "difusion", "qr-sitio.svg"), qrSvg, "utf8");

const fuente = async (f) => (await readFile(join(raiz, "fonts", f))).toString("base64");
const css = `
@font-face { font-family: "Fraunces"; src: url(data:font/woff2;base64,${await fuente("fraunces-latin-wght.woff2")}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Nunito"; src: url(data:font/woff2;base64,${await fuente("nunito-latin-wght.woff2")}) format("woff2"); font-weight: 200 1000; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Nunito, sans-serif; color: #3A2A24; }
/* --- Tarjeta: 90x50 mm de corte. La variable --s es el sangrado (3 mm imprenta, 0 en A4). --- */
.cara { position: relative; overflow: hidden; width: calc(90mm + 2 * var(--s)); height: calc(50mm + 2 * var(--s)); }
.zona { position: absolute; inset: calc(var(--s) + 4.5mm); } /* zona segura: nada importante fuera de acá */
.frente { background: #FFF8EE; }
.frente .sol { position: absolute; width: 38mm; height: 38mm; border-radius: 50%; background: #F7B538; right: calc(var(--s) - 12mm); top: calc(var(--s) - 13mm); }
.frente .durazno { position: absolute; width: 18mm; height: 18mm; border-radius: 50%; background: #FFE1D1; right: calc(var(--s) + 7mm); bottom: calc(var(--s) - 10mm); }
.frente .menta { position: absolute; width: 15mm; height: 15mm; border-radius: 50%; background: #D8F0E4; right: calc(var(--s) - 4mm); bottom: calc(var(--s) - 5mm); }
.logo { width: 11mm; height: 11mm; }
.frente .zona { display: flex; flex-direction: column; justify-content: space-between; }
.nombre { font-family: Fraunces, serif; font-weight: 600; font-size: 12.5pt; line-height: 1.1; max-width: 58mm; }
.titulo { font-weight: 800; font-size: 6.6pt; letter-spacing: .12em; text-transform: uppercase; color: #B8432A; margin-top: 1.4mm; }
.bajada { font-size: 7pt; color: #6B5148; margin-top: 1.2mm; max-width: 52mm; }
.dorso { background: #FFE1D1; }
.dorso .zona { display: flex; align-items: center; gap: 4.5mm; }
.qr { flex: none; width: 30mm; height: 30mm; background: #fff; border-radius: 2.5mm; padding: 3mm; }
.qr svg { width: 100%; height: 100%; display: block; }
.dorso h2 { font-family: Fraunces, serif; font-weight: 600; font-size: 11pt; line-height: 1.15; }
.dorso .pista { font-size: 6.5pt; color: #6B5148; margin: .8mm 0 2.6mm; }
.dato { display: flex; align-items: center; gap: 1.4mm; font-size: 7.6pt; font-weight: 700; margin-top: 1mm; white-space: nowrap; }
.dato svg { width: 3.2mm; height: 3.2mm; flex: none; }
`;

const logo = `<svg class="logo" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#F7B538"/><circle cx="32" cy="32" r="30" fill="none" stroke="#B8432A" stroke-width="3"/><text x="32" y="41" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="26" fill="#3A2A24">VG</text></svg>`;
const iconoWa = `<svg viewBox="0 0 24 24"><path fill="#1E7D4F" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
const iconoWeb = `<svg viewBox="0 0 24 24" fill="none" stroke="#B8432A" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>`;

const frente = `<div class="cara frente"><span class="sol"></span><span class="durazno"></span><span class="menta"></span>
  <div class="zona">
    ${logo}
    <div>
      <p class="nombre">${esc(general.nombre)}</p>
      <p class="titulo">${esc(general.titulo)}</p>
      <p class="bajada">Counseling · Online y presencial<br>en ${esc(general.zona)}</p>
    </div>
  </div></div>`;
const dorso = `<div class="cara dorso"><div class="zona">
    <div class="qr">${qrSvg}</div>
    <div>
      <h2>Conocé mi espacio</h2>
      <p class="pista">Escaneá el código con la cámara del celular</p>
      <p class="dato">${iconoWeb}${esc(urlVisible)}</p>
      <p class="dato">${iconoWa}${esc(telVisible)}</p>
    </div>
  </div></div>`;

// 1) Para imprenta: 2 páginas (frente y dorso) de 96x56 mm (90x50 + 3 mm de sangrado por lado)
await writeFile(join(raiz, "difusion", "tarjeta-imprenta.html"), `<!doctype html><html lang="es-AR"><head><meta charset="utf-8">
<title>Tarjeta para imprenta</title><style>${css}
:root { --s: 3mm; } @page { size: 96mm 56mm; margin: 0; } .cara { page-break-after: always; }</style></head>
<body>${frente}${dorso}</body></html>`, "utf8");

// 2) Casera: A4 con 10 tarjetas (2x5). Página 2 = dorsos con columnas invertidas para imprimir doble faz (borde largo).
const filas = 5, cols = 2;
const grilla = (cara, espejo) => {
  let celdas = "";
  for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) celdas += cara;
  return `<div class="hoja${espejo ? " espejo" : ""}">${celdas}</div>`;
};
await writeFile(join(raiz, "difusion", "tarjetas-a4.html"), `<!doctype html><html lang="es-AR"><head><meta charset="utf-8">
<title>Tarjetas A4</title><style>${css}
:root { --s: 0mm; } @page { size: A4; margin: 0; }
.hoja { width: 210mm; height: 297mm; padding: 23.5mm 15mm; display: grid; grid-template-columns: repeat(2, 90mm); grid-auto-rows: 50mm; page-break-after: always; position: relative; }
/* marcas de corte */
.hoja::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(#999,#999) 15mm 0/0.2mm 20mm no-repeat, linear-gradient(#999,#999) 105mm 0/0.2mm 20mm no-repeat, linear-gradient(#999,#999) 195mm 0/0.2mm 20mm no-repeat,
    linear-gradient(#999,#999) 15mm 277mm/0.2mm 20mm no-repeat, linear-gradient(#999,#999) 105mm 277mm/0.2mm 20mm no-repeat, linear-gradient(#999,#999) 195mm 277mm/0.2mm 20mm no-repeat,
    linear-gradient(#999,#999) 0 23.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 0 73.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 0 123.5mm/12mm 0.2mm no-repeat,
    linear-gradient(#999,#999) 0 173.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 0 223.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 0 273.5mm/12mm 0.2mm no-repeat,
    linear-gradient(#999,#999) 198mm 23.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 198mm 73.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 198mm 123.5mm/12mm 0.2mm no-repeat,
    linear-gradient(#999,#999) 198mm 173.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 198mm 223.5mm/12mm 0.2mm no-repeat, linear-gradient(#999,#999) 198mm 273.5mm/12mm 0.2mm no-repeat; }
</style></head>
<body>${grilla(frente, false)}${grilla(dorso, true)}</body></html>`, "utf8");

console.log(`Tarjetas generadas en difusion/ · QR → ${url} · Tel: ${telVisible}`);
