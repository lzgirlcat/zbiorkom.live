import { Box, CircularProgress, Divider, InputAdornment, List, ListItemButton, ListItemText, Popover, TextField } from "@mui/material";
import { Place, SportsScore, PushPin, DirectionsBus } from "@mui/icons-material";
import { useQuerySearchPlaces } from "@/hooks/useQueryTripPlanner";
import useTripPlannerStore from "@/hooks/useTripPlannerStore";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "react-router-dom";
import { ESearchPlace, SearchPlace } from "typings";
import { useState } from "react";

export default ({ type }: { type: "from" | "to" }) => {
    const [place, setPlace] = useTripPlannerStore(
        useShallow((state) => [state.places[type], state.setPlace]),
    );
    const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
    const { city } = useParams();

    const { data: searchPlaces, isFetching } = useQuerySearchPlaces(city!, place.input);

    const setSearchPlace = (searchPlace: SearchPlace) => {
        setPlace(type, {
            place: searchPlace,
            label: searchPlace[ESearchPlace.name],
            input: place.input,
        });
        anchorEl?.blur();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                margin: 1,
            }}
        >
            {type === "from" ? <Place /> : <SportsScore />}

            <TextField
                size="small"
                fullWidth
                variant="outlined"
                placeholder={type === "from" ? "Start" : "End"}
                onFocus={({ currentTarget }) => {
                    setAnchorEl(currentTarget as HTMLInputElement);
                }}
                onBlur={() => setAnchorEl(null)}
                value={(!anchorEl && place.label) || place.input}
                onChange={(e) => setPlace(type, { input: e.target.value })}
                slotProps={{
                    input: {
                        autoCapitalize: "none",
                        autoComplete: "off",
                        autoCorrect: "off",
                        endAdornment: isFetching ? (
                            <InputAdornment position="end">
                                <CircularProgress size={20} color={"inherit"}/>
                            </InputAdornment>
                        ) : null,
                    },
                }}
                sx={{
                    "& .MuiInputBase-root": {
                        backgroundColor: "primary.dark",
                        borderRadius: 1,
                    },
                }}
            />
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                disableAutoFocus
                disableEnforceFocus
                slotProps={{
                    paper: { onMouseDown: (e) => e.preventDefault() },
                }}
            >
                <List
                    sx={{
                        padding: 0,
                        "& .MuiListItemButton-root": { borderRadius: 1 },
                        maxHeight: 300,
                    }}
                >
                    <ListItemButton>
                        <ListItemText primary="Twoja lokalizacja" />
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemText primary="Wybierz na mapie" />
                    </ListItemButton>
                    <Divider />
                    {searchPlaces?.map((searchPlace) => (
                        <ListItemButton
                            key={searchPlace[ESearchPlace.id]}
                            onClick={() => setSearchPlace(searchPlace)}
                        >
                            {searchPlace[ESearchPlace.type] === "google" ? <PushPin fontSize="small"/> : <DirectionsBus fontSize="small"/>}
                            <ListItemText
                                primary={searchPlace[ESearchPlace.name]}
                                secondary={searchPlace[ESearchPlace.address]}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Popover>
        </Box>
    );
};
