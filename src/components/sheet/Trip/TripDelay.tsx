import { useTranslation } from "react-i18next";
import { DelayType, StatusWpisuKontrolnego, StopTime, EStopTime } from "typings";
import { GpsFixed, GpsOff, DoneAll, Done, WarningAmber } from "@mui/icons-material";
import { getDelay } from "@/util/tools";

export default ({
    delay,
    showGPS,
    stopTimes,
    isLast,
}: {
    delay: DelayType;
    showGPS?: boolean;
    stopTimes?: [StopTime, StopTime];
    isLast?: boolean;
}) => {
    let [delayClass, delayTime] = getDelay(delay);
    const { t } = useTranslation("Vehicle");

    const hasSwk = stopTimes && (stopTimes[0][EStopTime.swk] != null || stopTimes[0][EStopTime.swk] != null);
    const isFirst = hasSwk
        ? stopTimes[0][EStopTime.swk] == null && stopTimes[1][EStopTime.swk] != null && !isLast
        : false;
    delay =
        delay !== "scheduled" &&
        typeof delay === "number" &&
        hasSwk &&
        stopTimes[0][EStopTime.swk] === StatusWpisuKontrolnego.Scheduled &&
        stopTimes[1][EStopTime.swk] === StatusWpisuKontrolnego.Scheduled
            ? "scheduled"
            : delay;

    const showFixedGPS =
        (showGPS !== false && delay === "live") || (showGPS === true && delay !== "scheduled");
    const showOffGPS = delay === "scheduled" || showGPS === false;

    const swkClass = stopTimes
        ? stopTimes[isLast ? 0 : 1][EStopTime.estimated] + 5 * 60 * 1000 < Date.now() &&
          stopTimes[isLast ? 0 : 1][EStopTime.swk] !== StatusWpisuKontrolnego.Confirmed
            ? "delay-warning"
            : "delay-none"
        : "";
    const swkIcon = hasSwk && delay !== "scheduled" ? (
            stopTimes[0][EStopTime.swk] === StatusWpisuKontrolnego.Confirmed || isFirst ? (
                stopTimes[1][EStopTime.swk] === StatusWpisuKontrolnego.Confirmed || isLast ? (
                    <DoneAll fontSize="small" className={swkClass} />
                ) : (
                    <Done fontSize="small" className={swkClass} />
                )
            ) : (
                <WarningAmber fontSize="small" className={swkClass} />
            )
        ) : null;

    return (
        <span className={`delay delay-${delayClass}`}>
            {swkIcon}
            {showFixedGPS && <GpsFixed fontSize="small" />}
            {showOffGPS && <GpsOff fontSize="small" />}

            {delay === "departed"
                ? t("departed")
                : delay === "departure"
                  ? t("departure")
                  : delay === "cancelled"
                    ? t("cancelled")
                    : delay === "live"
                      ? t("live")
                      : delay === "scheduled"
                        ? t("scheduled")
                        : delayTime
                          ? t(delay > 0 ? "delayed" : "early", { time: delayTime })
                          : t("onTime")}
        </span>
    );
};
