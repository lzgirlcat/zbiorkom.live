import { StyleSpecification } from "maplibre-gl";

export const basicStyle = "/style.json";

const rasterStyle = (tiles: string[]): StyleSpecification => ({
    version: 8,
    name: "Raster Layer",
    sources: {
        raster: {
            type: "raster",
            tiles: tiles,
            tileSize: 256,
        },
    },
    sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    layers: [
        {
            id: "raster-layer",
            type: "raster",
            source: "raster",

        },
    ],
});

export const openStreetMapStyle = rasterStyle([
    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
]);

export const geoportalStandardStyle = rasterStyle(
    ["https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution?service=WMS&request=GetMap&layers=Raster&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"]
)

export const esriSatelliteStyle = rasterStyle(
    ["https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false"]
);

export const geoportalHiResStyle = rasterStyle(
    ["https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution?service=WMS&request=GetMap&layers=Raster&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"]
)

// export const geoportalHiResStyle: StyleSpecification = {
//     version: 8,
//     name: "Raster Layer",
//     sources: {
//         hires: {
//             type: "raster",
//             tiles: ["https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution?service=WMS&request=GetMap&layers=Raster&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"],
//             tileSize: 256,
//         },
//         standard: {
//             type: "raster",
//             tiles: ["https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution?service=WMS&request=GetMap&layers=Raster&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}"],
//             tileSize: 256,
//         }
//     },
//     sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
//     glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
//     layers: [
//         {
//             id: "standard",
//             type: "raster",
//             source: "standard",
//             layout: {
//                 "visibility": "visible"
//             },
//             paint: {
//                 "raster-opacity": 1
//             }
//         },
//         {
//             id: "hires",
//             type: "raster",
//             source: "hires",
//             layout: {
//                 "visibility": "visible"
//             },
//         },
//     ],
// }

export interface MapStyleDefinition {
    name: string;
    style: string | StyleSpecification;
    attribution: string[];
    supportsDark?: boolean;
}

export const mapStyles = {
    basic: {
        name: "Basic",
        style: basicStyle,
        attribution: [
            '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a>',
            '&copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a>',
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        ],
        supportsDark: true,
    },
    openStreetMap: {
        name: "OpenStreetMap",
        style: openStreetMapStyle,
        attribution: [
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        ],
        supportsDark: true,
    },
    googleSatellite: {
        name: "Esri Satellite",
        style: esriSatelliteStyle,
        attribution: ['&copy; <a href="https://www.esri.com" target="_blank">Esri</a>'],
    },
    geoportalStandard: {
        name: "Geoportal",
        style: geoportalStandardStyle,
        attribution: ['&copy; <a href="https://geoportal.gov.pl" target="_blank">Geoportal</a>'],
    },
    geoportalHiRes: {
        name: "Geoportal HiRes",
        style: geoportalHiResStyle,
        attribution: ['&copy; <a href="https://geoportal.gov.pl" target="_blank">Geoportal</a>'],
    },
    openrailwaymapStandard: {
        name: "OpenRailwayMap",
        style: "/openrailwaymap.app.style.json",
        attribution: ['&copy; <a href="https://openrailwaymap.app" target="_blank">openrailwaymap.app</a>'],
    }
} as Record<string, MapStyleDefinition>;
