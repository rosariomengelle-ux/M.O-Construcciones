"""
Prepara las fotos de una obra para la web.

Uso (desde la carpeta del repositorio):
  python herramientas/preparar_fotos.py "C:\\carpeta\\con las fotos exportadas" casa-tt

- Toma las fotos JPG de la carpeta (exportadas desde Lightroom con el ajuste "MO Web"),
  en orden alfabético.
- Las copia a fotos/<obra>/ como 01.jpg, 02.jpg… (2400 px como máximo)
  y arma la versión chica 01-1200.jpg, 02-1200.jpg… (1200 px) para que la página cargue rápido.
- Les borra TODOS los datos EXIF, incluida la ubicación GPS (regla: nunca mostrar dónde está la obra).
- Si la obra está en datos/obras.json, le completa la lista de fotos.
- Antes de hacer nada muestra qué va a hacer y pregunta. Los originales no se tocan.

--si  no pregunta (hace todo directamente).
"""
import argparse, json, sys
from pathlib import Path
from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
DATOS = REPO / "datos" / "obras.json"
GRANDE, CHICA, CALIDAD = 2400, 1200, 80
GPS = 0x8825


def guardar(img, destino, lado, icc):
    copia = img.copy()
    copia.thumbnail((lado, lado), Image.LANCZOS)  # solo achica, nunca agranda
    extra = {"icc_profile": icc} if icc else {}
    copia.save(destino, "JPEG", quality=CALIDAD, optimize=True, progressive=True, **extra)  # sin exif


def sin_gps(archivo):
    with Image.open(archivo) as im:
        exif = im.getexif()
        return GPS not in exif and not exif.get_ifd(GPS)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # para que se vean bien las tildes en la terminal
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta", help="carpeta con las fotos exportadas")
    ap.add_argument("obra", help="slug de la obra, igual que en datos/obras.json (ej.: casa-tt)")
    ap.add_argument("--si", action="store_true", help="no preguntar")
    a = ap.parse_args()

    origen = Path(a.carpeta)
    fotos = sorted(p for p in origen.iterdir() if p.suffix.lower() in (".jpg", ".jpeg")) if origen.is_dir() else []
    if not fotos:
        sys.exit(f"No encontré fotos JPG en: {origen}")

    destino = REPO / "fotos" / a.obra
    obras = json.loads(DATOS.read_text(encoding="utf-8")) if DATOS.exists() else []
    obra = next((o for o in obras if o.get("slug") == a.obra), None)

    print(f"Obra: {a.obra}" + ("" if obra else "  (no está en datos/obras.json: después agregala a mano)"))
    print(f"Desde: {origen}")
    print(f"Hacia: {destino}")
    viejas = sorted(destino.glob("*.jpg")) if destino.exists() else []
    if viejas:
        print(f"  Se reemplazan las {len(viejas)} fotos que ya hay en esa carpeta.")
    for i, f in enumerate(fotos, 1):
        print(f"  {f.name}  ->  {i:02d}.jpg + {i:02d}-1200.jpg")
    if len(fotos) < 3:
        print("  Ojo: la web muestra una obra solo si tiene 3 fotos o más.")
    if not a.si and input("¿Sigo? (s/n) ").strip().lower() not in ("s", "si", "sí"):
        sys.exit("No se hizo nada.")

    destino.mkdir(parents=True, exist_ok=True)
    for v in viejas:
        v.unlink()
    rutas = []
    for i, f in enumerate(fotos, 1):
        with Image.open(f) as im:
            icc = im.info.get("icc_profile")
            im = ImageOps.exif_transpose(im).convert("RGB")  # endereza según la cámara y después se descarta el EXIF
            g, c = destino / f"{i:02d}.jpg", destino / f"{i:02d}-1200.jpg"
            guardar(im, g, GRANDE, icc)
            guardar(im, c, CHICA, icc)
        if not (sin_gps(g) and sin_gps(c)):
            sys.exit(f"Error: {g.name} quedó con datos de ubicación. No subas estas fotos.")
        rutas.append(f"fotos/{a.obra}/{i:02d}.jpg")
        print(f"  listo {g.name} ({g.stat().st_size // 1024} KB) y {c.name} ({c.stat().st_size // 1024} KB)")

    if obra is not None:
        obra["fotos"] = rutas
        DATOS.write_text(json.dumps(obras, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Actualicé las fotos de '{a.obra}' en datos/obras.json.")
    else:
        print('Pegá esto en "fotos" de la obra en datos/obras.json:')
        print(json.dumps(rutas, ensure_ascii=False))
    print("Fotos sin datos de ubicación (GPS): verificado.")


if __name__ == "__main__":
    main()
