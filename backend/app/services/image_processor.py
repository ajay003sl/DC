import io
from typing import Tuple
from PIL import Image, ImageOps

MAX_DIMENSION = 1600
WEBP_QUALITY = 82

def optimize_image_to_webp(image_bytes: bytes) -> Tuple[bytes, str, int, int]:
    """
    Opens raw image bytes, auto-orients from EXIF (so phone camera pictures are upright),
    resizes to max 1600px maintaining aspect ratio,
    and converts to highly optimized WebP format.
    Returns: (webp_bytes, content_type, width, height)
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Auto-orient based on EXIF tag (critical for iPhone/Android camera uploads)
    img = ImageOps.exif_transpose(img)

    # Convert to RGB (or RGBA if transparency is present)
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    # Downscale if larger than MAX_DIMENSION (1600px is crisp on retina screens while tiny in file size)
    w, h = img.size
    if max(w, h) > MAX_DIMENSION:
        if w > h:
            new_w = MAX_DIMENSION
            new_h = int(h * (MAX_DIMENSION / w))
        else:
            new_h = MAX_DIMENSION
            new_w = int(w * (MAX_DIMENSION / h))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        w, h = new_w, new_h

    out_buffer = io.BytesIO()
    img.save(out_buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
    webp_bytes = out_buffer.getvalue()

    return webp_bytes, "image/webp", w, h
