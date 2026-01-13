import json
import os


JSON_PATH = os.path.join(os.path.dirname(__file__), "community_data.json")


def load_communities():
    """Carga las comunidades desde el archivo JSON."""
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def add_community(name: str, email: str, portal: str):
    """
    Agrega o actualiza una comunidad en el archivo JSON.
    portal = 'ComunidadFeliz' o 'Edifito'
    """
    data = load_communities()
    data[name] = {"email": email, "portal": portal}

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    return True
