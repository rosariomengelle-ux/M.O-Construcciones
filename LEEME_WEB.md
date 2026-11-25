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
| `sitio.js` | Lo que se mueve: las obras y testimonios (los lee de `datos/`), la ventana de cada obra, el menú del celular, el formulario que abre WhatsApp. |
| `datos/obras.json` | Las obras: nombre, año, tipo, fotos… (punto 4). |
| `datos/testimonios.json` | Los testimonios (punto 5). |
| `fotos/<obra>/` | Las fotos de cada obra, preparadas con `herramientas/preparar_fotos.py`. |
| `img/textura.jpg` | La textura de fondo del encabezado (al bajar) y del pie de página. |
| `video/` | El video de portada: `portada.mp4` (computadora), `portada-vertical.mp4` (celular) y `portada.jpg` (imagen fija). |
| `herramientas/video_portada.py` | El programa que arma esos tres archivos a partir del video original. |
| `img/logo-horizontal.svg` | El logo M.O del encabezado y del pie (copia de `M.O\Logo\Entrega\02 Versiones\horizontal`). El color lo pone la página: blanco sobre el video, grafito sobre fondo claro. |
| `favicon.ico` / `favicon.svg` / `img/apple-touch-icon.png` | El ícono de la pestaña del navegador y del acceso directo en el celular (copias de `M.O\Logo\Entrega\05 Web`). |
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

## 4. Cómo agregar una obra

Las obras están en `datos/obras.json`. **Una obra aparece en la página solo si tiene 3 fotos o más.**
Si ninguna tiene, la sección "Nuestras obras" y su link del menú no se muestran (nunca quedan cuadros vacíos).

1. **Exportá las fotos** desde Lightroom con el ajuste **"MO Web"** (2400 px, sRGB, JPG al 80 %, sin logo) a una carpeta cualquiera.
   El orden de la web es el orden alfabético de los archivos: la primera es la portada de la tarjeta.
2. **Prepará las fotos** (o pedíselo a Claude Code). En la carpeta del repositorio, en una terminal:
   ```
   python herramientas/preparar_fotos.py "C:\carpeta\de las fotos exportadas" casa-tt
   ```
   `casa-tt` es el `slug` de la obra (ver abajo). El programa muestra qué va a hacer y pregunta antes:
   - copia las fotos a `fotos/casa-tt/` como `01.jpg`, `02.jpg`… y una versión chica `01-1200.jpg`… para que la página cargue rápido;
   - **les borra la ubicación GPS y todos los datos de la cámara**, y lo verifica;
   - completa la lista `fotos` de esa obra en `datos/obras.json`.
   Los originales no se tocan. Si lo volvés a correr, reemplaza las fotos de esa obra.
3. **Revisá los datos de la obra** en `datos/obras.json` (se abre con el Bloc de notas):

   | Campo | Qué poner |
   |---|---|
   | `slug` | Nombre de la carpeta de fotos: minúsculas y guiones, sin tildes (`casa-el-cebu`). |
   | `codigo` | El código interno (TT, CB…). No se muestra. |
   | `nombre_publico` | El nombre que se ve en la web (el Nombre público del maestro). Nunca el apellido del cliente. |
   | `anio` | Año de terminación, sin comillas: `2026`. |
   | `tipo` | `"Casa nueva"` o `"Ampliación"`. |
   | `ubicacion` | Siempre `"Pilar"`. Si se pone otra cosa, la web igual muestra "Pilar". |
   | `destacada` | `true` en una sola obra: sale primera y en grande. Las demás, `false`. |
   | `proyecto` | Vacío (`""`) si el proyecto es nuestro. Si es de otro estudio, su nombre: la web muestra "Proyecto: …". |
   | `estudio_instagram` | El usuario de Instagram del estudio (`"@estudio"`), para el link. Opcional. |
   | `permiso_estudio` | Fecha en que el estudio dio permiso (`"DD-MM-AAAA"`). **Si hay `proyecto` y esto está vacío, la obra no se muestra.** |
   | `video` | Ruta a un video de la obra (`"video/obras/casa-tt.mp4"`), o `""`. |
   | `publicar` | `true` para mostrarla, `false` para ocultarla sin borrarla. |

   Cuidado con las comas y las comillas: cada campo termina en coma, salvo el último de la obra.
4. Subí el cambio en una rama, mirá la vista previa y hacé el merge (punto 2).

**Agregar una obra nueva a la lista:** copiá un bloque `{ … }` entero de otra obra, pegalo después de la última
(con una coma entre `}` y `{`) y cambiá los datos.

Reglas firmes: la ubicación es siempre **"Pilar"** (nunca barrio, lote, dirección ni apellido del cliente),
nunca precios ni m² con números, y las obras de otros estudios necesitan crédito y permiso.

---

## 5. Cómo cargar un testimonio

Los testimonios están en `datos/testimonios.json`. Hoy está vacío (`[]`), así que la sección "Testimonios" y su link
del menú no se muestran. Para agregar uno, el archivo queda así:

```
[
  { "texto": "Lo que dijo el cliente, sin comillas adentro.", "nombre": "Familia P.", "tipo": "Casa nueva", "real_con_permiso": true }
]
```

- Solo se muestran los que tienen `"real_con_permiso": true`: tiene que ser real y el cliente tiene que haber dicho que sí.
- `nombre`: solo nombre de pila ("Laura y Martín") o "Familia" + inicial ("Familia P."). **Nunca el apellido completo.**
- **Sin lugar**: no se pone barrio ni localidad.
- Para agregar otro, se separa con una coma: `[ {…}, {…} ]`.

---

## 6. Cómo poner foto o video de fondo en "Quiénes somos"

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

## 7. Cómo crear el Perfil de Empresa en Google (gratis)

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
