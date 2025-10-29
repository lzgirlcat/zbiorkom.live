import { Box, IconButton, Skeleton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { AccessTime, Close, Star, StarOutline } from "@mui/icons-material";
import useGoBack from "@/hooks/useGoBack";
import StopTag from "@/ui/StopTag";
import { EStop, EStopDeparture, EStopDepartures } from "typings";
import { useQueryStopDepartures } from "@/hooks/useQueryStops";
import useFavStore from "@/hooks/useFavStore";
import { useShallow } from "zustand/react/shallow";

export default () => {
    const { city, stop } = useParams();
    const navigate = useNavigate();
    const goBack = useGoBack();

    const [favorites, add] = useFavStore(
        useShallow((state) => [state.favorites, state.addFavoriteStop]),
    );

    const isFavorite = favorites.some(e => e.id === stop!);

    const { data } = useQueryStopDepartures({
        city: window.location.pathname.includes("/station") ? "pkp" : city!,
        stop: stop!,
    });

    if (!data?.[EStopDepartures.stop])
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 0.5 }} />
                <Skeleton variant="text" width={160} height={32} />
            </div>
        );

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: -1,
            }}
        >
            <Box sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
                <StopTag stop={data[EStopDepartures.stop]} />
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    marginRight: -0.5,
                    "& .MuiIconButton-root": {
                        backgroundColor: "background.paper",
                        color: "hsla(0, 0%, 100%, 0.87)",
                        width: 35,
                        height: 35,
                        "& svg": {
                            width: 22,
                            height: 22,
                        },
                        "& :focus": {
                            backgroundColor: "background.paper",
                        },
                    },
                }}
            >
                <IconButton size="small" onClick={() => {
                    add(stop!, data[EStopDepartures.stop][EStop.location], data[EStopDepartures.stop][EStop.city] === "pkp");
                    navigate(window.location.pathname + "/addToFav");
                }}>
                    {isFavorite ? <Star />: <StarOutline />}
                </IconButton>

                <IconButton size="small" onClick={() => navigate(window.location.pathname + "/time")}>
                    <AccessTime />
                </IconButton>

                <IconButton size="small" onClick={() => goBack({ home: true })}>
                    <Close />
                </IconButton>
            </Box>
        </Box>
    );
};
