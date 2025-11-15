import { mapStyles } from "./mapStyle";
import { memo, ReactElement, useEffect, useMemo } from "react";
import { Map } from "@vis.gl/react-maplibre";
import { useLocation } from "react-router-dom";
import cities from "cities";
import { useMapStyleStore } from "@/hooks/useMapStyleStore";
import { useShallow } from "zustand/react/shallow";

import "maplibre-gl/dist/maplibre-gl.css";
import { getInitialViewState } from "@/util/tools";

export default memo(({ children }: { children: ReactElement[] }) => {
    const { pathname } = useLocation();
    const [selectedStyle, basicAppearance] = useMapStyleStore(
        useShallow((state) => [state.selectedStyle, state.basicAppearance]),
    );

    useEffect(() => {
        const className = "map-dark";
        const shouldEnable = basicAppearance === "dark";

        if (shouldEnable) {
            document.body.classList.add(className);
        }
        return () => {
            document.body.classList.remove(className);
        };
    }, [selectedStyle, basicAppearance]);

    const initialViewState = useMemo(() => {
        const cityId = pathname.split("/")[1];
        return getInitialViewState(cityId);
    }, []);

    return (
        <Map
            mapStyle={(mapStyles[selectedStyle] || mapStyles.basic).style}
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
                        document.addEventListener("focus", () => window.location.reload(), {
                            once: true,
                        });
                    }
                });
            }}
            style={{ position: "absolute" }}
            initialViewState={initialViewState}
            attributionControl={false}
            dragRotate={false}
            minZoom={5}
            maxPitch={0}
            reuseMaps
        >
            {children}
        </Map>
    );
});
