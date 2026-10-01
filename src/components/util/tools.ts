import cities, { DEFAULT_LOCATION, DEFAULT_TIMEZONE } from "cities";
import { ESearchRelation, SearchGroupName, SearchItem, SearchRawResponse, SearchResponse } from "typings";

export const getTime = (time: number) => {
    return new Date(time).toLocaleTimeString("pl", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getSheetHeight = () => window.innerHeight / 3 + 24;

export const getDelay = (delay?: number) => {
    const isNumber = typeof delay === "number";
    const delayTime = msToTime(isNumber ? Math.abs(delay) : 0);

    return [
        isNumber ? (delayTime ? (delay > 0 ? "delayed" : "early") : "none") : "unknown",
        delayTime,
    ] as const;
};

export const msToTime = (ms: number, withSeconds?: boolean) => {
    let formattedTime: string[] = [];

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    if (hours > 0) formattedTime.push(`${hours} h`);
    if (remainingMinutes > 0) formattedTime.push(`${remainingMinutes} min`);
    if (withSeconds) formattedTime.push(`${remainingSeconds} s`);

    return formattedTime.join(" ");
};

// Public transport data is keyed by the agency's local calendar day, which is not
// necessarily the device's one. The backend sends each city's timezone with /api6.
export const getCityTimezone = (city?: string) => cities[city!]?.timezone || DEFAULT_TIMEZONE;

// YYYY-MM-DD of the given instant in the city's timezone — en-CA formats as ISO.
export const getCityDate = (timestamp: number, timezone: string) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(timestamp);

// Days since 2020-01-01, matching the backend `date` encoding for brigades
// (routeBrigades). The backend counts days in the city's timezone, so we derive the
// day index from that calendar day — this makes the value independent of the device's
// own timezone and correct across DST.
export const getDaysSince2020 = (timestamp: number, timezone: string) => {
    const [year, month, day] = getCityDate(timestamp, timezone).split("-").map(Number);

    return Math.floor(Date.UTC(year, month - 1, day) / 86400000) - 18262;
};

export const polylineToGeoJson = (polyline: string) => {
    const factor = 1e6;
    let index = 0;
    let lat = 0;
    let lng = 0;

    const geoJson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [],
        },
        properties: {},
    };

    while (index < polyline.length) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        lat += (result >> 1) ^ -(result & 1);

        shift = 0;
        result = 0;

        do {
            b = polyline.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        lng += (result >> 1) ^ -(result & 1);

        geoJson.geometry.coordinates.push([lng / factor, lat / factor]);
    }

    return geoJson;
};

export const fadeColor = (hex: string, ratio: number, background = "#ffffff") => {
    const color = parseInt(hex.slice(1), 16);
    const bg = parseInt(background.slice(1), 16);

    const mix = (shift: number) => {
        const channel = (value: number) => (value >> shift) & 0xff;
        return Math.round(channel(color) * ratio + channel(bg) * (1 - ratio));
    };

    return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
};

export const parseVehicleId = (id: string) => {
    const colonIdx = id.indexOf(":");
    const underscoreIdx = id.indexOf("_", colonIdx + 1);
    const vehicleType = id.slice(0, colonIdx);

    if (underscoreIdx === -1 || underscoreIdx === colonIdx + 1) {
        return {
            vehicleType,
            agency: "default",
            vehicleNumber: id.slice(colonIdx + 1),
        };
    }

    return {
        vehicleType,
        agency: id.slice(colonIdx + 1, underscoreIdx),
        vehicleNumber: id.slice(underscoreIdx + 1),
    };
};

export const AlightType = {
    Regular: 1 << 0,
    Forbidden: 1 << 1,
    OnDemand: 1 << 2,
    IsLastStop: 1 << 3,
} as const;

export const getCityFromUrl = (routeCity?: string): string => {
    const fromQuery = new URLSearchParams(window.location.search).get("city");
    return fromQuery || routeCity || "";
};

export const buildCitySuffix = (entityCity: string | undefined, routeCity: string | undefined): string => {
    if (!entityCity || entityCity === routeCity) return "";
    return `?city=${encodeURIComponent(entityCity)}`;
};

export const getInitialViewState = (cityId: string) => {
    const lastUserLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");
    const moveToLastLocation = localStorage.getItem("moveToLastLocation") === "true";
    const lastFocusedLocation = JSON.parse(localStorage.getItem(`lastFocusedLocation.${cityId}`) || "null");

    if (moveToLastLocation && lastUserLocation?.lastUpdate > Date.now() - 1000 * 60 * 60 * 24) {
        return {
            longitude: lastUserLocation.location[0],
            latitude: lastUserLocation.location[1],
            zoom: lastFocusedLocation?.[2] ?? 16,
        };
    } else if (localStorage.getItem("rememberLastFocusedLocation") === "true" && lastFocusedLocation) {
        return {
            longitude: lastFocusedLocation[0],
            latitude: lastFocusedLocation[1],
            zoom: lastFocusedLocation[2],
        };
    } else {
        const location = cities[cityId]?.location || cities["warsaw"]?.location || DEFAULT_LOCATION;
        const zoom = cities[cityId]?.zoom || 13.5;

        return {
            longitude: location[0],
            latitude: location[1],
            zoom,
        };
    }
};

const defaultSearchGroupOrdering: SearchGroupName[] = ["vehicles", "stops", "stations", "routes", "relations"];

export const getSearchGroupOrdering = (): SearchGroupName[] =>
    JSON.parse(localStorage.getItem("searchGroupOrdering") || JSON.stringify(defaultSearchGroupOrdering));

const searchItemKeys: Record<SearchGroupName, keyof SearchItem> = {
    vehicles: "vehicle",
    stops: "stop",
    stations: "station",
    routes: "route",
    relations: "relation",
};

export const buildSearchView = (
    order: SearchGroupName[],
    raw: SearchRawResponse,
    search?: string,
): SearchResponse => {
    const groups: Record<SearchGroupName, any[]> = {
        vehicles: raw.positions ?? [],
        stops: raw.stops ?? [],
        stations: raw.stations ?? [],
        routes: raw.routes ?? [],
        relations: [...(raw.relations ?? [])],
    };

    const exactRelation = groups.relations.findIndex(
        (relation) =>
            relation[ESearchRelation.shortName] === search ||
            relation[ESearchRelation.shortName].split(" ")[0] === search,
    );
    if (exactRelation > 0) groups.relations.unshift(groups.relations.splice(exactRelation, 1)[0]);

    const groupNames = order.filter((type) => groups[type]?.length);

    return {
        results: groupNames.flatMap((type) =>
            groups[type].map((result, index) => ({
                [searchItemKeys[type]]: result,
                borderTop: index === 0 || undefined,
                borderBottom: index === groups[type].length - 1 || undefined,
            })),
        ),
        groups: groupNames.map((type) => groups[type].length),
        groupNames,
    };
};

export const share = (url: string) => {
    if (navigator.share !== undefined) {
        navigator.share({
            url: url,
        });
    } else {
        navigator.clipboard.writeText(url);
    }
};

const POLISH_FOLD: Record<string, string> = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
};

export const normalizeSearch = (value: string) =>
    value.toLowerCase().replace(/[ąćęłńóśźż]/g, (char) => POLISH_FOLD[char] ?? char);
