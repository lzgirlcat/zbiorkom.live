import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

type Props = {
    value: number; // full timestamp
    onChange: (value: number) => void;
    open: boolean;
    close: () => void;
};

const TimeField = ({
    value,
    onChange,
    label,
    min,
    max,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    min: number;
    max: number;
}) => (
    <TextField
        type="number"
        value={value}
        onChange={(e) => {
            const val = e.target.value;
            if (!val) return onChange("");
            if (val.length === 2 || (parseInt(val) >= min && parseInt(val) > max)) {
                onChange(val.padStart(2, "0"));
            } else {
                onChange(val);
            }
        }}
        onFocus={() => onChange("")}
        onBlur={(e) => {
            let val = e.target.value || "00";
            val = Math.max(min, Math.min(max, parseInt(val) || min))
                .toString()
                .padStart(2, "0");
            onChange(val);
        }}
        slotProps={{
            htmlInput: { min, max, step: 1, inputMode: "numeric", pattern: "[0-9]*" },
        }}
        helperText={label}
        sx={{
            width: 72,
            height: 72,
            "& .MuiInputBase-root": {
                borderRadius: 1,
                "& input": { padding: 1, textAlign: "center", fontSize: 24 },
            },
        }}
    />
);

export default ({ value, onChange, open, close }: Props) => {
    const [timestamp, setTimestamp] = useState(value);
    const date = new Date(timestamp);

    const { t } = useTranslation("Time");

    const updateTime = (hours: number, minutes: number) => {
        const newDate = new Date(timestamp);
        newDate.setHours(hours, minutes, 0, 0);
        setTimestamp(newDate.getTime());
    };

    const changeDate = (days: number) => {
        const newDate = new Date(timestamp);
        newDate.setDate(newDate.getDate() + days);

        setTimestamp(newDate.getTime());
    };

    const save = () => {
        onChange(timestamp);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") save();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [timestamp]);

    return (
        <Dialog open={open} fullWidth onClose={close}>
            <DialogTitle sx={{ paddingLeft: 3, paddingTop: 2 }}>{t("enterTime")}</DialogTitle>

            <DialogContent
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 1 }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "& .MuiButton-root": {
                            backgroundColor: "background.paper",
                            color: "text.primary",
                            transition: "opacity 0.2s",
                            "&:hover": { backgroundColor: "background.paper" },
                            "&:disabled": { backgroundColor: "background.paper", opacity: 0.7 },
                        },
                    }}
                >
                    <Button
                        size="small"
                        sx={{
                            "& .MuiButton-root": {
                                backgroundColor: "background.paper",
                                color: "text.primary",
                                transition: "opacity 0.2s",
                                "&:hover": { backgroundColor: "background.paper" },
                                "&:disabled": { backgroundColor: "background.paper", opacity: 0.7 },
                            },
                        }}
                        onClick={() => changeDate(-1)}
                        disabled={((timestamp - Date.now())) / (1000 * 60 * 60 * 24) < -1}
                    >
                        <ArrowBack />
                    </Button>
                    <Typography variant="h6" sx={{ minWidth: 120, textAlign: "center" }}>
                        {date.toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "numeric",
                            day: "numeric"
                        })}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => changeDate(1)}
                        sx={{
                            "& .MuiButton-root": {
                                backgroundColor: "background.paper",
                                color: "text.primary",
                                transition: "opacity 0.2s",
                                "&:hover": { backgroundColor: "background.paper" },
                                "&:disabled": { backgroundColor: "background.paper", opacity: 0.7 },
                            },
                        }}
                        disabled={((timestamp - Date.now())) / (1000 * 60 * 60 * 24) > 6}
                    >
                        <ArrowForward />
                    </Button>
                </Box>

                 <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "& span": {
                            fontSize: 26,
                            fontWeight: "bold",
                            marginTop: -2.5,
                        },
                    }}
                >
                    <TimeField
                        value={date.getHours().toString().padStart(2, "0")}
                        onChange={(h) => updateTime(parseInt(h) || 0, date.getMinutes())}
                        label={t("hour")}
                        min={0}
                        max={23}
                    />
                    <span style={{ fontSize: 26, fontWeight: "bold" }}>:</span>
                    <TimeField
                        value={date.getMinutes().toString().padStart(2, "0")}
                        onChange={(m) => updateTime(date.getHours(), parseInt(m) || 0)}
                        label={t("minute")}
                        min={0}
                        max={59}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                        padding: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "auto",
                        maxWidth: "100%",
                        "& .MuiButton-root": {
                            backgroundColor: "background.paper",
                            color: "text.primary",
                            transition: "opacity 0.2s",
                            "&:hover": { backgroundColor: "background.paper" },
                            "&:disabled": { backgroundColor: "background.paper", opacity: 0.7 },
                        },
                    }}
                >
                    {[
                        {
                            text: "-15 min",
                            onClick: () => {
                                const newMinutes = date.getMinutes() - 15;
                                if (newMinutes < 0) {
                                    updateTime(date.getHours() - 1, 60 + newMinutes);
                                } else {
                                    updateTime(date.getHours(), newMinutes);
                                }
                            },
                        },
                        {
                            text: "- 1h",
                            onClick: () => updateTime(Math.max(0, date.getHours() - 1), date.getMinutes()),
                        },
                        {
                            text: "+ 1h",
                            onClick: () => updateTime(Math.min(23, date.getHours() + 1), date.getMinutes()),
                        },
                        ...["07", "15", "20"].map((hour) => ({
                            text: `${hour}:00`,
                            onClick: () => updateTime(parseInt(hour), 0),
                        })),
                    ].map(({ text, onClick }) => (
                        <Button key={text} variant="contained" onClick={onClick}>
                            {text}
                        </Button>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
                <Button onClick={close}>{t("cancel")}</Button>
                <Button onClick={save}>{t("save")}</Button>
            </DialogActions>
        </Dialog>
    );
};
