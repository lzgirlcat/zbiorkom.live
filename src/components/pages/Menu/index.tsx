import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, List, SwipeableDrawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import MenuItem from "./MenuItem";
import { DiscordIcon, Logo } from "@/ui/Icon";
import cities from "cities";
import useThemeStore from "@/hooks/useThemeStore";
import { CSSProperties } from "react";
import {
    EventNote,
    EventNoteOutlined,
    Facebook,
    GitHub,
    History,
    Instagram,
    KeyboardArrowDown,
    Newspaper,
    Place,
    PlaceOutlined,
    Settings,
    SettingsOutlined,
} from "@mui/icons-material";

const fadeOut = "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0))";

// picture shown at the bottom of the menu for some theme colors
const themeImages: Record<string, { src: string; style?: CSSProperties }> = {
    "#720546": { src: "/zandbi.jpg" },
    "#3662ff": { src: "/zandbi-blue-dabadeeba-daba.webp" },
    "#ffffff": { src: "/frolicking.gif" },
    "#e9c171": { src: "/arson.png", style: { bottom: 100, maskImage: "none", WebkitMaskImage: "none" } },
};

export default ({
    open,
    setOpen,
    setClose,
}: {
    open: boolean;
    setOpen: () => void;
    setClose: () => void;
}) => {
    const { t } = useTranslation("Menu");
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { city } = useParams();

    const path = pathname.split("/")[2];
    const themeImage = themeImages[useThemeStore((state) => state.color)];

    return (
        <SwipeableDrawer
            anchor="left"
            open={open}
            onOpen={setOpen}
            onClose={setClose}
            sx={{
                "& .MuiDrawer-paper": {
                    borderRadius: "0 16px 16px 0",
                    minWidth: 240,
                },
                zIndex: 1400,
            }}
            disableSwipeToOpen
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    paddingRight: 2,
                    color: "hsla(0, 0%, 100%, 0.9)",
                    cursor: "pointer",
                }}
                onClick={() => navigate("/cities")}
            >
                <Logo sx={{ width: 72, height: 72, fill: "hsla(0, 0%, 100%, 0.9)" }} />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <b>zbiorkom.girlc.at</b>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        {cities[city!]?.name}
                        <KeyboardArrowDown />
                    </span>
                </Box>
            </Box>

            <List
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mx: 1,
                }}
            >
                <MenuItem
                    icon={<Place />}
                    outlinedIcon={<PlaceOutlined />}
                    name={t("map")}
                    active={!path}
                    onClick={() => navigate(`/${city}`, { state: undefined })}
                />
                <MenuItem
                    icon={<EventNote />}
                    outlinedIcon={<EventNoteOutlined />}
                    name={t("schedules")}
                    active={path === "routes"}
                    onClick={() => navigate(`/${city}/routes`, { state: undefined })}
                />
                <MenuItem
                    icon={<Newspaper />}
                    outlinedIcon={<Newspaper />}
                    name={t("blog")}
                    active={path === "blog"}
                    onClick={() => navigate(`/${city}/blog`, { state: undefined })}
                />
                <MenuItem
                    icon={<History />}
                    outlinedIcon={<History />}
                    name={t("executions")}
                    active={path === "executions"}
                    onClick={() => navigate(`/${city}/executions`, { state: undefined })}
                />
                <MenuItem
                    icon={<Settings />}
                    outlinedIcon={<SettingsOutlined />}
                    name={t("settings")}
                    active={path === "settings"}
                    onClick={() => navigate(`/${city}/settings`, { state: undefined })}
                />
            </List>

            {themeImage && (
                <img
                    src={themeImage.src}
                    style={{
                        width: "100%",
                        height: "auto",
                        position: "absolute",
                        bottom: 0,
                        opacity: 0.7,
                        pointerEvents: "none",
                        touchAction: "none",
                        maskImage: fadeOut,
                        WebkitMaskImage: fadeOut,
                        ...themeImage.style,
                    }}
                />
            )}

            <div
                style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    color: "hsla(0, 0%, 100%, 0.6)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box>
                    <IconButton href="https://girlc.at/assets/redirect.html" target="_blank">
                        <Facebook htmlColor="hsla(0, 0%, 100%, 0.6)" />
                    </IconButton>
                    <IconButton href="https://girlc.at/assets/redirect.html" target="_blank">
                        <Instagram htmlColor="hsla(0, 0%, 100%, 0.6)" />
                    </IconButton>
                    <IconButton href="https://github.com/lzgirlcat/zbiorkom.live" target="_blank">
                        <GitHub htmlColor="hsla(0, 0%, 100%, 0.6)" />
                    </IconButton>
                    <IconButton href="https://discord.gg/gUhMz2Wckf" target="_blank">
                        <DiscordIcon htmlColor="hsla(0, 0%, 100%, 0.6)" />
                    </IconButton>
                </Box>

                <a
                    style={{
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                    href="https://girlc.at/assets/redirect.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("privacyPolicy")}
                </a>
                <span
                    style={{ fontSize: "0.75rem", cursor: "pointer" }}
                    onClick={() => window.open("https://www.openstreetmap.org/copyright", "_blank")}
                >
                    &copy; OpenStreetMap contributors
                </span>
            </div>
        </SwipeableDrawer>
    );
};
