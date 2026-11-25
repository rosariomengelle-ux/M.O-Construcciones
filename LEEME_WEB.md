# Página web de M.O Construcciones · Cómo se usa

Sitio público: https://m-o-construcciones.vercel.app/

Este archivo explica cómo cambiar cosas de la página sin tener que entender el código.
Se va completando a medida que se suman mejoras.

---

## 1. Qué es cada archivo

| Archivo | Qué tiene |
|---|---|
| `index.html` | Los textos y el orden de las secciones de la página. |
| `estilos.css` | Colores, tipografías, tamaños y espaciados (el diseño). |
| `sitio.js` | Lo que se mueve: la ventana de cada obra, el menú del celular, el formulario que abre WhatsApp. También tiene los datos de las obras (`const obras`). |
| `img/textura.jpg` | La textura de fondo del encabezado (al bajar) y del pie de página. |
| `video/` | El video de portada: `portada.mp4` (computadora), `portada-vertical.mp4` (celular) y `portada.jpg` (imagen fija). |
| `herramientas/video_portada.py` | El programa que arma esos tres archivos a partir del video original. |
| `favicon.png` / `favicon.ico` | El logo M.O que aparece arriba y en la pestaña del navegador. |
| `LEEME_WEB.md` | Este archivo. |

---

## 2. Cómo se aprueba un cambio (nada se publica sin tu OK)

1. Claude Code trabaja siempre en una **rama** aparte (se llama `mejoras-web-<tema>`), nunca en `main`.
2. Cuando termina, sube la rama a GitHub y se abre un **pull request** (un pedido de cambio).
3. Vercel arma solo una **vista previa** con ese cambio. Para verla:
   - Entrá al pull request en GitHub. Abajo aparece un comentario de Vercel con el link "Preview" (o "Visit Preview").
   - Ese link pide iniciar sesión en Vercel: entrá con tu cuenta. **No compartas ese link**: es solo para revisar.
4. Si está todo bien, en el pull request tocá **Merge pull request** y después **Confirm merge**.
   En uno o dos minutos el cambio aparece en la página pública.
5. Si algo no te gusta, no hagas el merge y avisale a Claude Code qué cambiar.

---

## 3. Cómo cambiar el video de portada

El video actual sale de `OneDrive\CONSTRUCCIONES\M.O\WEB\M.0.mp4`, usando solo las partes sin personas y sin tierra
(de 8,3 a 13,6 s; de 15,75 a 20,2 s; y de 35,25 s al final). Dura 27 segundos y se repite.

Para cambiarlo (o pedírselo a Claude Code):

1. En la carpeta del repositorio, abrí una terminal y escribí:
   ```
   python herramientas/video_portada.py "C:\ruta\del\video nuevo.mp4" --tramos 0-25 --poster 2
   ```
   - `--tramos`: qué partes del video usar, en segundos. Podés poner varias: `5-12 20-35 40-fin`.
   - `--poster`: en qué segundo del video ya armado se toma la imagen fija.
2. El programa reemplaza los tres archivos de `video/` con el mismo nombre y muestra cuánto pesa cada uno
   (objetivo: 6 MB el horizontal y 4 MB el vertical; si se pasa, baja la calidad solo).
3. Subí el cambio en una rama, revisá la vista previa y hacé el merge (punto 2).

Qué mostrar (guía de estilo §2.4): obra terminada y limpia, sin personas.

---

## 4. Cómo agregar fotos a una obra (forma provisoria)

> Más adelante las obras van a pasar a un archivo de datos (`datos/obras.json`) y habrá un script que prepara las fotos solo. Hasta entonces, se hace así:

1. Creá una carpeta `fotos` junto a `index.html` y poné ahí las fotos exportadas desde Lightroom con el ajuste **"MO Web"**.
2. **Fotos de la ventana de la obra:** abrí `sitio.js`, buscá la obra en `const obras` (por ejemplo `cebu:`) y completá la lista `fotos`:
   ```
   fotos: ["fotos/casa-el-cebu-1.jpg", "fotos/casa-el-cebu-2.jpg"],
   ```
3. **Video de la obra:** en la misma obra, completá `video` con la ruta del archivo:
   ```
   video: "videos/casa-el-cebu.mp4"
   ```
4. **Foto de la tarjeta (portada de la obra):** en `index.html`, dentro de la tarjeta de esa obra, cambiá la línea
   ```
   <div class="obra-img-placeholder" style="--ph-color:#6B5B46;"></div>
   ```
   por
   ```
   <img class="obra-img" src="fotos/casa-el-cebu-portada.jpg" alt="Casa El Cebú, casa nueva en Pilar">
   ```

Recordá las reglas firmes: la ubicación es siempre **"Pilar"** (nunca barrio, lote ni apellido del cliente), nunca precios ni m² con números, y las obras de otros estudios necesitan crédito y permiso.

---

## 5. Cómo poner foto o video de fondo en "Quiénes somos"

En `index.html`, en la sección `NOSOTROS`, cambiá la línea
```
<div class="nos-bg-placeholder"></div>
```
por una foto:
```
<img class="nos-bg" src="fotos/nosotros.jpg" alt="M.O Construcciones">
```
o por un video:
```
<video class="nos-bg" autoplay muted loop playsinline src="videos/nosotros.mp4"></video>
```

---

## 6. Cómo crear el Perfil de Empresa en Google (gratis)

Sirve para aparecer en Google Maps y en las búsquedas de "construcción de casas en Pilar".

1. Entrá a https://business.google.com con la cuenta de Google de la empresa y tocá **Administrar ahora**.
2. Nombre de la empresa: **M.O Construcciones**.
3. Categoría: **Contratista de obras** (en inglés, "General contractor").
4. Cuando pregunte si tenés un lugar que los clientes pueden visitar, respondé **No**.
   Así la dirección **no** se muestra (es una regla: nunca dirección pública).
5. Área de servicio: **Pilar, Buenos Aires** (podés sumar las localidades vecinas donde trabajan).
6. Teléfono: +54 11 3396-7462. Sitio web: https://m-o-construcciones.vercel.app/
7. Google pide verificar la empresa (por video, llamada o correo postal, según lo que ofrezca). Seguí sus pasos.
8. Ya verificado, completá:
   - **Horario:** lunes a viernes, de 8 a 18 h.
   - **Descripción:** la misma de la página ("Empresa familiar con 30 años construyendo casas…"), sin precios.
   - **Fotos:** las de obras terminadas, exportadas con "MO Web". Sin personas, sin carteles con direcciones.
