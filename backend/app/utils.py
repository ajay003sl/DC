import re
import random
import string
from datetime import datetime

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text

def generate_sku(category_name: str = "DRS") -> str:
    prefix = "".join([c for c in category_name.upper() if c.isalnum()])[:3] or "AURA"
    random_digits = "".join(random.choices(string.digits, k=4))
    timestamp = datetime.now().strftime("%y%m")
    return f"{prefix}-{timestamp}-{random_digits}"

