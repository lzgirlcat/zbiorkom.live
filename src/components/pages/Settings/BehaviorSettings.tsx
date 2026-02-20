import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { useTranslation } from "react-i18next";
import { memo, useState } from "react";

export default memo(() => {
    const { t } = useTranslation("Settings");

    const [moveToLastLocation, setMove] = useState<boolean>(
        JSON.parse(localStorage.getItem("moveToLastLocation") || "true"),
    );
    const [useLocationSorting, setSorting] = useState<boolean>(
        JSON.parse(localStorage.getItem("useLocationSorting") || "false"),
    );
    const [rememberLastFocusedLocation, setRememberLastFocusedLocation] = useState<boolean>(
        JSON.parse(localStorage.getItem("rememberLastFocusedLocation") || "false"),
    );
    const [useStopCodeAsIcon, setStopCodeAsIcon] = useState<boolean>(
        JSON.parse(localStorage.getItem("useStopCodeAsIcon") || "false"),
    );
    const [disableLiquidGlass, setDisableLiquidGlass] = useState<boolean>(
        JSON.parse(localStorage.getItem("disableLiquidGlass") || "false"),
    );

    const [useV6, setUseV6] = useState<boolean>(
        JSON.parse(localStorage.getItem("useV6") || "false"),
    );
    const [showScheduledTimes, setShowScheduledTimes] = useState<boolean>(
        JSON.parse(localStorage.getItem("showScheduledTimes") || "true")
    );
    const [mergeArrivalDeparture, setMergeArrivalDeparture] = useState<boolean>(
        JSON.parse(localStorage.getItem("mergeArrivalDeparture") || "true")
    );
    const [showSeconds, setShowSeconds] = useState<boolean>(
        JSON.parse(localStorage.getItem("showSeconds") || "false")
    );
    const [autoScrollToBrigade, setAutoScrollToBrigade] = useState<boolean>(
        JSON.parse(localStorage.getItem("autoScrollToBrigade") || "true"),
    );

    const settings = [
        {
            key: "moveToLastLocation",
            value: moveToLastLocation,
            setValue: setMove,
        },
        {
            key: "useLocationSorting",
            value: useLocationSorting,
            setValue: setSorting,
        },
        {
            key: "rememberLastFocusedLocation",
            value: rememberLastFocusedLocation,
            setValue: setRememberLastFocusedLocation,
        },
        {
            key: "useStopCodeAsIcon",
            value: useStopCodeAsIcon,
            setValue: setStopCodeAsIcon,
        },
        {
            key: "showScheduledTimes",
            value: showScheduledTimes,
            setValue: setShowScheduledTimes,
        },
        {
            key: "mergeArrivalDeparture",
            value: mergeArrivalDeparture,
            setValue: setMergeArrivalDeparture,
        },
        {
            key: "showSeconds",
            value: showSeconds,
            setValue: setShowSeconds,
        },
        {
            key: "autoScrollToBrigade",
            value: autoScrollToBrigade,
            setValue: setAutoScrollToBrigade,
        },
        {
            key: "disableLiquidGlass",
            value: disableLiquidGlass,
            setValue: setDisableLiquidGlass,
            action: (value: boolean) => {
                document.body.classList.toggle("disable-liquid-glass", value);
            },
        },
        {
            key: "useV6",
            value: useV6,
            setValue: setUseV6,
            action: () => {
                location.reload();
            },
        },
    ] as {
        key: string;
        value: boolean;
        setValue: (value: boolean) => void;
        action?: (value: boolean) => void;
    }[];

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 0.4,
                backgroundColor: "background.paper",
                padding: 2,
            }}
        >
            <h2
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {t("behavior")}
            </h2>

            {settings.map(({ key, value, setValue, action }) => (
                <FormControlLabel
                    key={key}
                    control={
                        <Checkbox
                            checked={value}
                            onChange={() => {
                                setValue(!value);
                                localStorage.setItem(key, JSON.stringify(!value));
                                action?.(!value);
                            }}
                        />
                    }
                    label={t(key)}
                />
            ))}
        </Box>
    );
});
