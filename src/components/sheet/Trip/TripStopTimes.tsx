import { getTime } from "@/util/tools";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { EStopUpdate, EStopTime, StopUpdate, EStopDepartureStatus, StopTime } from "typings";

type Props = {
    update: StopUpdate;
    hasDeparted: boolean;
};

const getDelayType = (time: StopTime) => {
    const status = time[EStopTime.status];
    const delay = time[EStopTime.delay];

    if (status === EStopDepartureStatus.Cancelled || status === EStopDepartureStatus.Scheduled) return;
    return delay > 60000 ? "delayed" : delay < -60000 ? "early" : undefined;
};

const formatTime = (time: StopTime) =>
    [
        getTime(time[EStopTime.scheduled]),
        getTime(time[EStopTime.scheduled] + time[EStopTime.delay]),
        getDelayType(time),
    ] as const;

export default ({ update, hasDeparted }: Props) => {
    const showSeconds = JSON.parse(localStorage.getItem("showSeconds") || "false");
    const mergeArrivalDeparture = JSON.parse(localStorage.getItem("mergeArrivalDeparture") || "true");
    const showScheduledTimes = JSON.parse(localStorage.getItem("showScheduledTimes") || "true");

    const [arrivalTime, departureTime] = useMemo(
        () => [formatTime(update[EStopUpdate.arrival]), formatTime(update[EStopUpdate.departure])],
        [update],
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: showSeconds ? 49.5 : 33,
                "& .MuiTypography-root": {
                    fontSize: 12,
                    textAlign: "right",
                    fontWeight: "inherit",
                },
                opacity: hasDeparted ? 0.7 : undefined,
            }}
        >
            {!(mergeArrivalDeparture && arrivalTime[1] === departureTime[1]) && (
                <>
                    {showScheduledTimes && arrivalTime[0] !== arrivalTime[1] && arrivalTime[2] && (
                        <Typography sx={{ textDecoration: "line-through" }}>{arrivalTime[0]}</Typography>
                    )}
                    <Typography className={`delay delay-${arrivalTime[2] ?? "unset"}`}>
                        {arrivalTime[2] ? arrivalTime[1] : arrivalTime[0]}
                    </Typography>
                </>
            )}
            {showScheduledTimes && departureTime[0] !== departureTime[1] && departureTime[2] && (
                <Typography sx={{ textDecoration: "line-through" }}>{departureTime[0]}</Typography>
            )}
            <Typography className={`delay delay-${departureTime[2] ?? "unset"}`}>
                {departureTime[2] ? departureTime[1] : departureTime[0]}
            </Typography>
        </Box>
    );
};
