import { useTranslation } from "react-i18next";
import { EStopDepartureStatus, EStopTime, StatusWpisuKontrolnego, StopTime } from "typings";
import { Done, DoneAll, GpsFixed, GpsOff, HelpOutline, WarningAmber } from "@mui/icons-material";
import { getDelay } from "@/util/tools";

const getEstimated = (time: StopTime) => time[EStopTime.scheduled] + time[EStopTime.delay];

export default ({
    delay,
    status,
    showGPS,
    stopTime,
    stopTimes,
    isLast,
}: {
    delay: number;
    status: EStopDepartureStatus;
    showGPS?: boolean;
    stopTime?: StopTime;
    stopTimes?: [arrival: StopTime, departure: StopTime];
    isLast?: boolean;
}) => {
    const [delayClass, delayTime] = getDelay(delay);
    const { t } = useTranslation("Vehicle");

    // SWK (control entries) are only sent by some backends
    const hasSwk = !!stopTimes && (stopTimes[0][EStopTime.swk] != null || stopTimes[1][EStopTime.swk] != null);
    const isFirst =
        hasSwk && stopTimes[0][EStopTime.swk] == null && stopTimes[1][EStopTime.swk] != null && !isLast;

    if (
        hasSwk &&
        status !== EStopDepartureStatus.Cancelled &&
        stopTimes[0][EStopTime.swk] === StatusWpisuKontrolnego.Scheduled &&
        stopTimes[1][EStopTime.swk] === StatusWpisuKontrolnego.Scheduled
    ) {
        status = EStopDepartureStatus.Scheduled;
    }

    const isConfirmed = (time: StopTime) => time[EStopTime.swk] === StatusWpisuKontrolnego.Confirmed;

    const swkIcon =
        hasSwk && getEstimated(stopTimes[0]) < Date.now() && status !== EStopDepartureStatus.Scheduled ? (
            isConfirmed(stopTimes[0]) || isFirst ? (
                isConfirmed(stopTimes[1]) || isFirst || isLast ? (
                    <DoneAll fontSize="small" />
                ) : (
                    <Done fontSize="small" />
                )
            ) : getEstimated(stopTimes[isLast ? 0 : 1]) + 5 * 60 * 1000 < Date.now() ? (
                <WarningAmber fontSize="small" />
            ) : (
                <HelpOutline fontSize="small" />
            )
        ) : stopTime && getEstimated(stopTime) < Date.now() && isConfirmed(stopTime) ? (
            <DoneAll fontSize="small" />
        ) : null;

    const showFixedGPS = showGPS === true && status !== EStopDepartureStatus.Scheduled;
    const showOffGPS = status === EStopDepartureStatus.Scheduled;

    const isLiveStatus =
        status !== EStopDepartureStatus.Cancelled && status !== EStopDepartureStatus.Scheduled;
    const visualClass = isLiveStatus ? delayClass : "unknown";

    return (
        <span className={`delay delay-${visualClass}`}>
            {swkIcon}
            {showFixedGPS && <GpsFixed fontSize="small" />}
            {showOffGPS && <GpsOff fontSize="small" />}

            {status === EStopDepartureStatus.Cancelled
                ? t("cancelled")
                : status === EStopDepartureStatus.Scheduled
                  ? t("scheduled")
                  : delayTime
                    ? t(delay > 0 ? "delayed" : "early", { time: delayTime })
                    : t("onTime")}
        </span>
    );
};
