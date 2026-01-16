import { DelayType, RawSearchResult, APISearch, ESearchRelation } from "typings";
import cities from "cities";

export const getTime = (time: number) => {
    return new Date(time).toLocaleTimeString("pl", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: JSON.parse(localStorage.getItem("showSeconds") || "false") ? "2-digit" : undefined,
    });
};

export const getSheetHeight = () => window.innerHeight / 3 + 24;

export const getDelay = (delay?: DelayType) => {
    const isNumber = typeof delay === "number";
    const delayTime = msToTime(isNumber ? Math.abs(delay) : 0);

    return [
        isNumber ? (delayTime ? (delay > 0 ? "delayed" : "early") : "none") : "unknown",
        delayTime,
    ] as const;
};

export const msToTime = (ms: number, withSeconds?: boolean) => {
    let formattedTime: string = "";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    if (minutes > 0) formattedTime += `${minutes}`;
    if (minutes > 0) {
        if (!withSeconds) {
            formattedTime += " min";
        } else formattedTime += "m";
    }
    if (withSeconds) formattedTime += `${remainingSeconds} s`;
    return formattedTime;
};

export const polylineToGeoJson = (polyline: string) => {
    const factor = Math.pow(10, +polyline[1]);
    polyline = polyline.slice(3);

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

export const share = (url: string) => {
    if (navigator.share !== undefined) {
        navigator.share({
            url: url,
        });
    } else {
        navigator.clipboard.writeText(url);
    }
};

export const getInitialViewState = (cityId: string) => {
    const lastUserLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");
    const moveToLastLocation = localStorage.getItem("moveToLastLocation") === "true";
    const lfl = JSON.parse(localStorage.getItem(`lastFocusedLocation.${cityId}`) || "null");

    if (moveToLastLocation && lastUserLocation?.lastUpdate > Date.now() - 1000 * 60 * 60 * 24) {
        return {
            longitude: lastUserLocation.location[0],
            latitude: lastUserLocation.location[1],
            zoom: lfl[2],
        };
    } else if (localStorage.getItem("rememberLastFocusedLocation") === "true" && lfl) {
        return {
            longitude: lfl[0],
            latitude: lfl[1],
            zoom: lfl[2],
        };
    } else {
        const location = cities[cityId]?.location || cities["warsaw"].location;
        const zoom = cities[cityId]?.zoom || 13.5;

        return {
            longitude: location[0],
            latitude: location[1],
            zoom,
        };
    }
};

export const buildSearchView = (
    order: (keyof RawSearchResult)[],
    api: RawSearchResult,
    search?: string,
): APISearch => {
    if (api.positions) {
        api.vehicles = api.positions;
        delete api["positions"];
    }
    if (api.relations) {
        const index = api.relations.findIndex(
            (i) =>
                i[ESearchRelation.shortName] === search ||
                i[ESearchRelation.shortName].split(" ")[0] === search,
        );

        if (index > 0) {
            api.relations.unshift(api.relations.splice(index, 1)[0]);
        }
    }
    const finalResults = order.flatMap((type) => {
        const list = api[type] ?? []; // list of results for this type

        return list.map((result, index) => ({
            [type.replace(new RegExp("s" + "$"), "")]: result,
            borderTop: index === 0 || undefined,
            borderBottom: index === list.length - 1 || undefined,
        }));
    });

    return {
        results: finalResults,

        groups: order.map((type) => api[type]?.length ?? 0).filter(Boolean),

        groupNames: order.map((type) => (api[type]?.length ? type : undefined)).filter(Boolean),
    };
};
