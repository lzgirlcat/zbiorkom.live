#!/usr/bin/env python3

import json
from sys import stderr

import requests

STYLE_URL = "https://openrailwaymap.app/style/standard.json"


def download_style():
    resp = requests.get(STYLE_URL)
    resp.raise_for_status()
    return resp.json()


def remove_hillshade_and_dem(style):
    style["layers"] = [l for l in style["layers"] if l.get("id") != "hillshade"]
    style["sources"].pop("dem", None)


def fix_vector_sources(style):
    for src in style.get("sources", {}).values():
        if src.get("type") == "vector" and isinstance(src.get("url"), str) and src["url"].startswith("/"):
            path = src.pop("url")
            src["tiles"] = [f"https://openrailwaymap.app{path}/{{z}}/{{x}}/{{y}}.pbf"]


def replace_global_state(expr):
    if not isinstance(expr, (list, dict)):
        return expr

    if isinstance(expr, list):
        # case ["==", ["global-state", "theme"], "light"] → light branch
        if (expr[0] == "case"
                and len(expr) >= 4
                and expr[1] == ["==", ["global-state", "theme"], "light"]):
            return replace_global_state(expr[2])

        # ["get", ["global-state", "stationLowZoomLabel"]] → null (show name always)
        if (expr[0] == "get"
                and len(expr) == 2
                and isinstance(expr[1], list)
                and expr[1][0] == "global-state"):
            return None

        # bare ["global-state", …] → null
        if expr[0] == "global-state":
            return None

        return [replace_global_state(e) for e in expr]

    if isinstance(expr, dict):
        return {k: replace_global_state(v) for k, v in expr.items()}

    return expr


def force_light_theme(style):
    for layer in style.get("layers", []):
        if "paint" in layer:
            layer["paint"] = replace_global_state(layer["paint"])
        if "layout" in layer:
            layer["layout"] = replace_global_state(layer["layout"])


def add_osm_background(style):
    style.setdefault("sources", {})["osm-raster"] = {
        "type": "raster",
        "tiles": [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        "tileSize": 256,
        "attribution": "© OpenStreetMap contributors"
    }

    osm_layer = {
        "id": "osm-background",
        "type": "raster",
        "source": "osm-raster",
        "minzoom": 0,
        "maxzoom": 22
    }
    style["layers"].insert(0, osm_layer)


def fix_assets(style):
    style["glyphs"] = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
    style["sprite"] = "https://openrailwaymap.app/sprite/symbols"


def main():
    style = download_style()
    remove_hillshade_and_dem(style)
    fix_vector_sources(style)
    force_light_theme(style)
    add_osm_background(style)
    fix_assets(style)
    print(json.dumps(style, indent=2, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        exit(1)
    except Exception as e:
        print(f"Error: {e}", file=stderr)
        exit(1)