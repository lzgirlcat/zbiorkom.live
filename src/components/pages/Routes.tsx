import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Chip,
    Stack,
} from "@mui/material";
import { forwardRef, ReactElement, useMemo, useState } from "react";
import { Cancel, Menu, Search } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";
import RouteChip from "@/ui/RouteChip";
import Helm from "@/util/Helm";
import { ERoute, Route, VehicleType } from "typings";
import { useQueryRoutes } from "@/hooks/useQueryRoutes";
import { buildCitySuffix } from "@/util/tools";
import Icon from "@/ui/Icon";
import cities from "cities";

const GridList = forwardRef(({ style, children, ...props }: any, ref: any) => (
    <div
        {...props}
        ref={ref}
        style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginLeft: 8,
            marginRight: 8,
            gap: 8,
            ...style,
        }}
    >
        {children}
    </div>
));

const VirtuosoComponents = {
    List: GridList,
};

const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

type FilterChipProps = {
    color?: string;
    selected: boolean;
    onToggle: () => void;
    icon?: ReactElement;
    label?: string;
};

const FilterChip = ({ color, selected, onToggle, icon, label }: FilterChipProps) => (
    <Chip
        component="div"
        style={{
            backgroundColor: color,
            color: "hsla(0, 0%, 100%, 0.8)",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "17px",
            padding: "10px",
            margin: "2px",
        }}
        sx={{
            "&:hover .MuiChip-label": {
                textDecoration: "none",
            },
        }}
        onClick={onToggle}
        onDelete={selected ? onToggle : undefined}
        deleteIcon={
            <Cancel
                sx={{
                    "&&": {
                        color: "hsla(0, 0%, 100%, 1)",
                        opacity: 1,
                        "&:hover": {
                            color: "hsla(0, 0%, 100%, 0.8)",
                            opacity: 1,
                        },
                    },
                }}
            />
        }
        avatar={
            icon && (
                <svg
                    viewBox="0 0 24 24"
                    width="1.1em"
                    fill="currentColor"
                    style={{ marginLeft: label ? undefined : "22px" }}
                >
                    {icon}
                </svg>
            )
        }
        label={label}
    />
);

// routes without an agency are grouped under their city
const getAgencyKey = (route: Route) => `${route[ERoute.city]}:${route[ERoute.agency] || ""}`;

export default () => {
    const { t } = useTranslation("Schedules");
    const [search, setSearch] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
    const navigate = useNavigate();
    const { city } = useParams();

    const { data } = useQueryRoutes({
        city: city!,
    });

    const routes = data?.filter(
        (route) =>
            route[ERoute.name].toLowerCase().includes(search.toLowerCase()) &&
            (!selectedAgencies.length || selectedAgencies.includes(getAgencyKey(route))) &&
            (!selectedTypes.length || selectedTypes.includes(route[ERoute.type])),
    );

    // first route of each agency / type provides the chip color
    const [availableAgencies, availableTypes] = useMemo(() => {
        const agencies = new Map<string, Route>();
        const types = new Map<VehicleType, Route>();

        data?.forEach((route) => {
            if (!agencies.has(getAgencyKey(route))) agencies.set(getAgencyKey(route), route);
            if (!types.has(route[ERoute.type])) types.set(route[ERoute.type], route);
        });

        return [[...agencies], [...types]] as const;
    }, [data]);

    return (
        <>
            <Helm variable="schedules" />

            <Dialog open fullScreen>
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <IconButton onClick={() => navigate(window.location.pathname, { state: "menu" })}>
                        <Menu />
                    </IconButton>
                    {t("schedules")}
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {routes ? (
                        <>
                            <TextField
                                size="small"
                                placeholder={t("search")}
                                fullWidth
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{
                                    px: 2,
                                    pb: 1,
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                        autoComplete: "off",
                                    },
                                }}
                            />

                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    py: 1,
                                    mx: 2,
                                    my: 1,
                                    minWidth: 0,
                                }}
                            >
                                {(availableAgencies.length > 1 || selectedAgencies.length > 0) &&
                                    availableAgencies.map(([key, route]) => {
                                        const routeCity = route[ERoute.city];
                                        const agency = route[ERoute.agency];
                                        const agencyInfo = cities[routeCity]?.agencies?.[agency];

                                        return (
                                            <FilterChip
                                                key={key}
                                                color={route[ERoute.color]}
                                                selected={selectedAgencies.includes(key)}
                                                onToggle={() => setSelectedAgencies((prev) => toggle(prev, key))}
                                                icon={
                                                    agencyInfo?.icon ? (
                                                        <Icon city={routeCity} agency={agency} />
                                                    ) : undefined
                                                }
                                                label={
                                                    agencyInfo?.icon
                                                        ? undefined
                                                        : agencyInfo?.name ||
                                                          (agency || routeCity).toLowerCase().replace("_", "")
                                                }
                                            />
                                        );
                                    })}
                                {(availableTypes.length > 1 || selectedTypes.length > 0) &&
                                    availableTypes.map(([type, route]) => (
                                        <FilterChip
                                            key={type}
                                            color={route[ERoute.color]}
                                            selected={selectedTypes.includes(type)}
                                            onToggle={() => setSelectedTypes((prev) => toggle(prev, type))}
                                            icon={<Icon type={type} />}
                                        />
                                    ))}
                            </Stack>

                            <VirtuosoGrid
                                data={routes || []}
                                computeItemKey={(_, route) => `${route[ERoute.city]}:${route[ERoute.id]}`}
                                itemContent={(_, route) => (
                                    <RouteChip
                                        route={route}
                                        onClick={() =>
                                            navigate(
                                                `/${city}/route/${route[ERoute.id]}` +
                                                    buildCitySuffix(route[ERoute.city], city),
                                                { state: -3 },
                                            )
                                        }
                                    />
                                )}
                                style={{ height: "calc(100% - 48px)" }}
                                components={VirtuosoComponents}
                            />
                        </>
                    ) : (
                        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
                            <CircularProgress />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
