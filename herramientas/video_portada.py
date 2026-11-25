"""
Arma los tres archivos del video de portada a partir del video original.

  video/portada.mp4           horizontal 1920x1080, sin audio  (objetivo: 10 MB o menos)
  video/portada-vertical.mp4  vertical 720x1280 para celular    (objetivo: 4 MB o menos)
  video/portada.jpg           imagen fija que se ve mientras carga el video (computadora)
  video/portada-vertical.jpg  imagen fija para celular

Uso (desde la carpeta del repositorio):
  python herramientas/video_portada.py "C:\\ruta\\al\\video original.mp4"
  python herramientas/video_portada.py "original.mp4" --tramos 0-fin --poster 2

--tramos  qué partes del original usar, en segundos ("fin" = hasta el final). Por defecto, el video entero.
          Si se ponen varias, se pegan en orden con un fundido corto.
--poster  segundo del video ya armado que se usa como imagen fija (por defecto 2).

Necesita ffmpeg instalado. El original no se toca.
"""
import argparse, subprocess, sys, tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SALIDA = REPO / "video"

# Por defecto se usa el video entero, tal cual está editado (decisión de Rosario, 25-11-2026).
TRAMOS_POR_DEFECTO = ["0-fin"]

FORMATOS = [
    # nombre, filtro de imagen, objetivo en MB
    ("portada.mp4", "scale=1920:1080:flags=lanczos,setsar=1", 10),
    ("portada-vertical.mp4", "crop=ih*9/16:ih,scale=720:1280:flags=lanczos,setsar=1", 4),
]


def correr(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg falló:\n" + r.stderr[-2000:])


FUNDIDO = 0.8  # segundos de fundido entre un tramo y el siguiente (en vez de un corte seco)


def duracion(archivo):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(archivo)], capture_output=True, text=True)
    return float(r.stdout.strip())


def unir_tramos(original, tramos, destino):
    """Corta los tramos y los une con un fundido corto, en un archivo intermedio de buena calidad."""
    total = duracion(original)
    cmd = ["ffmpeg", "-v", "error", "-y"]
    durs = []
    for t in tramos:
        ini, fin = t.split("-")
        fin = total if fin == "fin" else float(fin)
        durs.append(fin - float(ini))
        cmd += ["-ss", ini, "-t", f"{durs[-1]:.3f}", "-i", str(original)]
    n = len(tramos)
    filtro = "".join(f"[{i}:v]scale=1920:1080:flags=lanczos,setsar=1,fps=30,format=yuv420p[v{i}];"
                     for i in range(n))
    previo, acumulado = "v0", durs[0]
    for i in range(1, n):
        offset = acumulado - FUNDIDO
        filtro += f"[{previo}][v{i}]xfade=transition=fade:duration={FUNDIDO}:offset={offset:.3f}[x{i}];"
        previo, acumulado = f"x{i}", offset + durs[i]
    filtro += f"[{previo}]null[out]"
    cmd += ["-filter_complex", filtro, "-map", "[out]", "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", str(destino)]
    correr(cmd)


def codificar(intermedio, nombre, filtro, objetivo_mb):
    """Calidad alta (crf 24) con un tope de bitrate calculado para no pasar el peso objetivo."""
    destino = SALIDA / nombre
    tope = int(objetivo_mb * 8_000_000 / duracion(intermedio) * 0.92)  # bits por segundo
    correr(["ffmpeg", "-v", "error", "-y", "-i", str(intermedio), "-vf", filtro, "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", "24",
            "-maxrate", str(tope), "-bufsize", str(tope * 2),
            "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", str(destino)])
    mb = destino.stat().st_size / 1_000_000
    estado = "OK" if mb <= objetivo_mb else "SUPERA EL OBJETIVO"
    print(f"  {nombre}: {mb:.1f} MB (objetivo {objetivo_mb} MB) {estado}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("original")
    ap.add_argument("--tramos", nargs="+", default=TRAMOS_POR_DEFECTO)
    ap.add_argument("--poster", type=float, default=2.0)
    a = ap.parse_args()

    original = Path(a.original)
    if not original.exists():
        sys.exit(f"No encuentro el video: {original}")
    SALIDA.mkdir(exist_ok=True)

    print("Original:", original)
    print("Tramos:", ", ".join(a.tramos))
    print("Se van a escribir en", SALIDA, ": portada.mp4, portada-vertical.mp4 y sus imágenes fijas")

    with tempfile.TemporaryDirectory() as tmp:
        intermedio = Path(tmp) / "unido.mp4"
        print("Cortando y uniendo tramos...")
        unir_tramos(original, a.tramos, intermedio)
        for nombre, filtro, objetivo in FORMATOS:
            codificar(intermedio, nombre, filtro, objetivo)
        # Imágenes fijas: se ven solo unos segundos mientras carga el video, así que van livianas.
        for origen, nombre, tam in [(SALIDA / "portada.mp4", "portada.jpg", "1280:720"),
                                    (SALIDA / "portada-vertical.mp4", "portada-vertical.jpg", "540:960")]:
            correr(["ffmpeg", "-v", "error", "-y", "-ss", str(a.poster), "-i", str(origen),
                    "-frames:v", "1", "-vf", f"scale={tam}:flags=lanczos", "-q:v", "5", str(SALIDA / nombre)])
            print(f"  {nombre}: {(SALIDA / nombre).stat().st_size / 1000:.0f} KB (segundo {a.poster})")
    print("Listo.")


if __name__ == "__main__":
    main()
