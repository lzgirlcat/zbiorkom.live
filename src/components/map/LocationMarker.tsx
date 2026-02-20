import { ArrowDropUp, GpsNotFixed, LocationDisabled, LocationCity } from "@mui/icons-material";
import { memo, useEffect, useState } from "react";
import { Marker, useMap } from "@vis.gl/react-maplibre";
import { Box, Fab } from "@mui/material";
import useLocationStore from "@/hooks/useLocationStore";
import { useShallow } from "zustand/react/shallow";
import { Location } from "typings";
import { useLocation } from "react-router-dom";

export default memo(() => {
    const { pathname } = useLocation();
    const [userLocation, setUserLocation] = useLocationStore(
        useShallow((state) => [state.userLocation, state.setUserLocation]),
    );
    const [userPermitted, setUserPermitted] = useState<boolean>(false);
    const [bearing, setBearing] = useState<number>();
    const map = useMap()?.current;

    useEffect(() => {
        if (!navigator.permissions?.query || !navigator.geolocation) {
            if (userPermitted) {
                alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
            }
            setUserPermitted(false);
            return;
        }

        navigator.permissions
            .query({ name: "geolocation" })
            .then(({ state }) => setUserPermitted(state === "granted"));

        const eventName =
            "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";

        if ("DeviceOrientationEvent" in window) {
            // @ts-ignore
            DeviceOrientationEvent.requestPermission?.();
        }

        window.addEventListener(eventName, handleOrientation, false);

        return () => {
            window.removeEventListener(eventName, handleOrientation);
        };
    }, []);

    useEffect(() => {
        if (userPermitted) {
            return watchPosition();
        }
    }, [userPermitted]);

    const handleLocation = ({ coords }: GeolocationPosition) => {
        const location = [coords.longitude, coords.latitude] as Location;

        setUserLocation(location);
        localStorage.setItem(
            "userLocation",
            JSON.stringify({
                location,
                lastUpdate: Date.now(),
            }),
        );
    };

    const watchPosition = () => {
        navigator.geolocation.getCurrentPosition(handleLocation, undefined, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0,
        });

        const watchId = navigator.geolocation.watchPosition(handleLocation, undefined, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    };

    const handleOrientation = ({ alpha, absolute }: DeviceOrientationEvent) => {
        if (absolute === true && alpha !== null) {
            setBearing(alpha * -1);
        }
    };

    const moveToLocation = (location: Location, zoom: number | undefined) => {
        if (map) {
            const current_zoom = map.getZoom();

            map.easeTo({
                center: location,
                zoom: zoom ? zoom : current_zoom > 14 ? current_zoom : 14,
            });
        }
    };

    const moveToUser = () => {
        if (!userPermitted) {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    const { coords } = location;

                    setUserPermitted(true);
                    handleLocation(location);
                    moveToLocation([coords.longitude, coords.latitude]);
                },
                (e) => {
                    console.error(e);
                    alert("Nie można określić Twojej lokalizacji.");
                },
            );
        } else if (userLocation?.[0]) {
            moveToLocation(userLocation);
        }
    };

    const moveToCity = () => {
        const cityId = pathname.split("/")[1];
        const location = window.Cities[cityId]?.location || window.Cities["warsaw"].location;
        const zoom = window.Cities[cityId]?.zoom || 13.5;
        moveToLocation(location, zoom);
    };

    return (
        <>
            <Fab
                color="primary"
                sx={{ position: "absolute", right: 20, bottom: 72 }}
                size="small"
                onClick={() => moveToCity()}
                id="city"
            >
                <LocationCity />
            </Fab>
            <Fab
                color="primary"
                sx={{ position: "absolute", right: 16, bottom: 16 }}
                size="medium"
                onClick={() => moveToUser()}
                id="gps"
            >
                {userLocation?.[0] ? <GpsNotFixed /> : <LocationDisabled />}
            </Fab>

            {userLocation && (
                <Marker
                    longitude={userLocation[0]}
                    latitude={userLocation[1]}
                    rotation={bearing}
                    style={{ zIndex: 1 }}
                    pitchAlignment="map"
                    rotationAlignment="map"
                >
                    {bearing !== undefined && (
                        <ArrowDropUp
                            sx={{
                                color: "#1da1f2",
                                transform: "translate(-5.5px, -20px)",
                                position: "absolute",
                                fontSize: 30,
                                borderColor: "primary.main",
                            }}
                        />
                    )}
                    <Box
                        sx={{
                            width: 19,
                            height: 19,
                            borderRadius: "50%",
                            backgroundColor: "#1da1f2",
                            border: "3px solid white",
                            boxShadow: "0 0 3px rgba(0,0,0,.35)",
                        }}
                    />
                </Marker>
            )}
        </>
    );
});
