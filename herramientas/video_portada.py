"""
Arma los tres archivos del video de portada a partir del video original.

  video/portada.mp4           horizontal 1920x1080, sin audio  (objetivo: 6 MB o menos)
  video/portada-vertical.mp4  vertical 720x1280 para celular    (objetivo: 4 MB o menos)
  video/portada.jpg           imagen fija que se ve mientras carga el video

Uso (desde la carpeta del repositorio):
  python herramientas/video_portada.py "C:\\ruta\\al\\video original.mp4"
  python herramientas/video_portada.py "original.mp4" --tramos 8.3-13.6 15.75-20.2 35.25-fin --poster 2

--tramos  qué partes del original usar, en segundos ("fin" = hasta el final). Se pegan en orden.
--poster  segundo del video ya armado que se usa como imagen fija (por defecto 2).

Necesita ffmpeg instalado. El original no se toca.
"""
import argparse, subprocess, sys, tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SALIDA = REPO / "video"

# Tramos elegidos el 25-11-2026 sobre M.0.mp4: sin personas y sin la parte de tierra.
TRAMOS_POR_DEFECTO = ["8.3-13.6", "15.75-20.2", "35.25-fin"]

FORMATOS = [
    # nombre, filtro de imagen, objetivo en MB
    ("portada.mp4", "scale=1920:1080:flags=lanczos,setsar=1", 6),
    ("portada-vertical.mp4", "crop=ih*9/16:ih,scale=720:1280:flags=lanczos,setsar=1", 4),
]


def correr(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg falló:\n" + r.stderr[-2000:])


def unir_tramos(original, tramos, destino):
    """Corta los tramos y los pega en un archivo intermedio de buena calidad."""
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for t in tramos:
        ini, fin = t.split("-")
        cmd += ["-ss", ini]
        if fin != "fin":
            cmd += ["-t", f"{float(fin) - float(ini):.3f}"]
        cmd += ["-i", str(original)]
    n = len(tramos)
    partes = "".join(f"[{i}:v]scale=1920:1080:flags=lanczos,setsar=1,fps=30[v{i}];" for i in range(n))
    une = "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[out]"
    cmd += ["-filter_complex", partes + une, "-map", "[out]", "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", str(destino)]
    correr(cmd)


def codificar(intermedio, nombre, filtro, objetivo_mb):
    destino = SALIDA / nombre
    for crf in (26, 28, 30, 32):
        correr(["ffmpeg", "-v", "error", "-y", "-i", str(intermedio), "-vf", filtro, "-an",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf),
                "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", str(destino)])
        mb = destino.stat().st_size / 1_000_000
        if mb <= objetivo_mb:
            break
    estado = "OK" if mb <= objetivo_mb else "SUPERA EL OBJETIVO"
    print(f"  {nombre}: {mb:.1f} MB (crf {crf}, objetivo {objetivo_mb} MB) {estado}")


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
    print("Se van a escribir en", SALIDA, ": portada.mp4, portada-vertical.mp4, portada.jpg")

    with tempfile.TemporaryDirectory() as tmp:
        intermedio = Path(tmp) / "unido.mp4"
        print("Cortando y uniendo tramos...")
        unir_tramos(original, a.tramos, intermedio)
        for nombre, filtro, objetivo in FORMATOS:
            codificar(intermedio, nombre, filtro, objetivo)
        correr(["ffmpeg", "-v", "error", "-y", "-ss", str(a.poster), "-i", str(intermedio),
                "-frames:v", "1", "-q:v", "4", str(SALIDA / "portada.jpg")])  # q 4 ≈ JPG al 80 %
        print(f"  portada.jpg: {(SALIDA / 'portada.jpg').stat().st_size / 1000:.0f} KB (segundo {a.poster})")
    print("Listo.")


if __name__ == "__main__":
    main()
