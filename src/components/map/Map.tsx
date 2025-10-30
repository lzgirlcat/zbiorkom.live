import { memo, ReactElement, useMemo, useState } from "react";
import { Map } from "@vis.gl/react-maplibre";
import { useLocation } from "react-router-dom";
import Error from "@/pages/Error";
import mapStyle from "./mapStyle";
import cities from "cities";

import "maplibre-gl/dist/maplibre-gl.css";
import { getInitialViewState } from "@/util/tools";

export default memo(({ children }: { children: ReactElement[] }) => {
    const [error, setError] = useState("");
    const { pathname } = useLocation();

    const initialViewState = useMemo(() => {
        const cityId = pathname.split("/")[1];
        return getInitialViewState(cityId);
    }, []);

    if (error) return <Error message={error} />;

    return (
        <Map
            mapStyle={mapStyle}
            onMoveStart={() => document.getElementById("root")?.classList.add("moving")}
            onMoveEnd={(e) => {
                document.getElementById("root")?.classList.remove("moving");
                const cityId = pathname.split("/")[1];
                if (cityId in cities && localStorage.getItem("rememberLastFocusedLocation") === "true") {
                    localStorage.setItem(`lastFocusedLocation.${cityId}`, JSON.stringify([e.viewState.longitude, e.viewState.latitude, e.viewState.zoom]));
                }
            }}
            onLoad={({ target }: { target: any }) => {
                target.touchZoomRotate.disableRotation();

                target.getCanvas().addEventListener("webglcontextlost", () => {
                    if (!document.hidden) {
                        window.location.reload();
                    } else {
                        window.addEventListener("focus", () => {
                            window.location.reload();
                        });
                    }
                });
            }}
            onError={(e) => setError(e.error.message)}
            style={{ position: "absolute" }}
            initialViewState={initialViewState}
            dragRotate={false}
            minZoom={5}
            maxPitch={0}
            reuseMaps
        >
            {children}
        </Map>
    );
});
