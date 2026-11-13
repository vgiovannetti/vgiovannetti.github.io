# Sitio web · Vanesa Mara Giovannetti · Consultora Psicológica

Sitio de una sola página, sin cookies ni analíticas. Se edita desde un **panel web** (Pages CMS) y se publica solo en **GitHub Pages**.

## Cómo funciona

```
Panel (app.pagescms.org) ──guarda──▶ content/*.json en GitHub ──▶ GitHub Actions arma el sitio ──▶ GitHub Pages
                                                                  (build/build.mjs, 1-2 min)
```

- El **contenido** (textos, foto, horarios, WhatsApp) vive en `content/`, un archivo por sección. Es lo único que toca el panel.
- El **diseño** vive en `build/plantilla.mjs` (HTML) y `css/styles.css`. El panel no puede modificarlos.
- El **aviso de crisis** del pie está fijo en la plantilla, así que no se puede editar desde el panel.
- Si se guarda algo inválido, como un número de WhatsApp mal escrito o un campo obligatorio vacío, la publicación se frena y **el sitio sigue mostrando la versión anterior**.
- Si un texto usa términos propios de la psicología o la medicina (terapia, paciente, diagnóstico…), se publica igual, pero queda un aviso en la pestaña *Actions* de GitHub.

## Estructura

```
content/*.json             Contenido editable (una sección por archivo)
.pages.yml                 Formularios del panel (campos, etiquetas, validaciones)
build/build.mjs            Valida, procesa la foto (WebP 480/960) y genera _site/
build/plantilla.mjs        HTML del sitio
build/ajustes.json         url_del_sitio (para Open Graph / canonical)
css/ js/ fonts/ img/       Estilos, menú, tipografías, logo e imágenes fijas
img/subidas/               Fotos subidas desde el panel (los originales no se publican)
.github/workflows/         Publicación automática en GitHub Pages
tools/servir.ps1           Servidor local para previsualizar _site/
tools/generar-imagenes.ps1 Regenera og-image.png y apple-touch-icon.png
```

## Puesta en marcha (se hace una sola vez)

1. **Cuenta de GitHub:** crear una cuenta gratuita en <https://github.com/signup> (sugerido: con el mail de Vanesa).
2. **Repositorio:** crear un repositorio **público** y vacío, sin README. Ejemplo de nombre: `sitio`. En las cuentas gratuitas, GitHub Pages solo funciona con repositorios públicos. Todo lo que contiene ya es público en el sitio.
3. **Subir el código:** pedírselo a Claude pasándole la URL del repositorio, o hacerlo con `git push`.
4. **Activar Pages:** en el repositorio, ir a *Settings → Pages → Build and deployment → Source* y elegir **GitHub Actions**. En 1 o 2 minutos el sitio queda en `https://<usuario>.github.io/<repositorio>/`.
5. **Completar la URL:** poner esa dirección en `build/ajustes.json` (`url_del_sitio`), así la vista previa al compartir por WhatsApp sale bien.
6. **Conectar el panel:**
   1. Entrar a <https://app.pagescms.org>, elegir *Sign in with GitHub* e instalar la GitHub App **solo en ese repositorio**.
   2. Abrir el repositorio: aparecen las secciones del panel.
7. **Acceso de Vanesa:** hay dos opciones.
   - Que entre con la cuenta de GitHub.
   - Invitarla como *collaborator* desde el panel con su email. Así puede editar sin cuenta de GitHub.

## Guía corta para Vanesa

1. Entrá a **app.pagescms.org** e iniciá sesión.
2. Elegí el sitio y, a la izquierda, la sección que querés cambiar (por ejemplo, "7 · Contacto").
3. Cambiá el texto. Lo que dice `[COMPLETAR: …]` es un recordatorio: borralo y escribí el dato real.
4. Tocá **Save** (Guardar). En uno o dos minutos el cambio aparece en la página.
5. **Foto:** "2 · Sobre mí" → *Foto profesional* → subí la imagen. No importa si pesa mucho.
6. **Preguntas frecuentes:** "6 · Preguntas frecuentes" → *Add* para sumar una, o el tacho para quitarla.
7. Si algo no aparece, avisale a [COMPLETAR: quién la ayuda]. Lo anterior sigue publicado, nada se rompe.

## Trabajo local (opcional)

Necesita [Node.js](https://nodejs.org) 24:

```powershell
npm install
npm run build                                              # genera _site/
powershell -ExecutionPolicy Bypass -File tools\servir.ps1  # http://127.0.0.1:8080/
```

## Pendientes de contenido
Se ven en el sitio resaltados en amarillo (`[COMPLETAR: …]`), y Vanesa los puede completar desde el panel:
- **Formación:** título exacto, nombre oficial de la universidad, año de egreso, matrícula y otras formaciones.
- **Sobre mí:** párrafo personal y foto profesional.
- **Encuentros:** plataforma de videollamada, frecuencia, tiempo de respuesta, horarios y condiciones del primer encuentro.

**[REVISAR TÉRMINO]:** la pregunta frecuente sobre la diferencia con la psicoterapia nombra psicoterapia, diagnóstico y tratamiento, en negativo. Conviene validarla con la Asociación Argentina de Counselors.

## Aviso de crisis
Números verificados el 12/11/2026 en fuentes oficiales, citadas en `build/plantilla.mjs`:
- 911
- 107 (SAME)
- 0800-999-0091 (Línea Nacional de Salud Mental)
- 135, 0800 345 1435 y (011) 5275-1135 (Centro de Asistencia al Suicida)

Revisar su vigencia una vez por año.
