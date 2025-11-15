import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
} from "@mui/material";
import { forwardRef, useState } from "react";
import { Menu, Search } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";
import RouteChip from "@/ui/RouteChip";
import Helm from "@/util/Helm";
import { ERoute, VehicleType, Route } from "typings";
import { useQueryRoutes } from "@/hooks/useQueryRoutes";
import Icon from "@/ui/Icon";
import { agencyIcons } from "@/ui/Icon";

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

    const routes = data?.filter((route) => {
        const matchesSearch = route[ERoute.name].toLowerCase().includes(search.toLowerCase());

        const matchesAgency =
            selectedAgencies.length === 0 ||
            selectedAgencies.includes(route[ERoute.agency]) ||
            (selectedAgencies.includes(city!) && route[ERoute.agency] === null);

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(route[ERoute.type]);

        return matchesSearch && matchesAgency && matchesType;
    });

    const available_agencies = Array.from(
        new Set(routes?.toReversed().map((route) => route[ERoute.agency] || city!)),
    ).map((agency) => {
        const route = routes?.find(
            (r) => r[ERoute.agency] === agency || (!r[ERoute.agency] && agency === city),
        );
        return [route?.[ERoute.agency] || city!, route?.[ERoute.color]];
    });
    const available_types = Array.from(new Set(routes?.toReversed().map((route) => route[ERoute.type]))).map(
        (type) => {
            const route = routes?.find((r) => r[ERoute.type] === type);
            return [type, route?.[ERoute.color]];
        },
    );
    const combinedItems = [
    ...available_agencies.map((agency) => ({ type: 'agency', data: agency })),
    ...available_types.map((type) => ({ type: 'type', data: type })),
    ];

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
                            <VirtuosoGrid
  totalCount={combinedItems.length}
  itemContent={(index) => {
    const item = combinedItems[index];

    if (item.type === 'agency') {
      const agency = item.data;
      return (
        <div
          className="routeChip"
          style={{ backgroundColor: agency[1] }}
          onClick={() =>
            setSelectedAgencies((prev) =>
              prev.includes(agency[0])
                ? prev.filter((a) => a !== agency[0])
                : [...prev, agency[0]],
            )
          }
        >
          {agency[0] && agencyIcons[agency[0]] ? (
            <svg viewBox="0 0 24 24" width="1.1em" fill="currentColor">
              <Icon agency={agency[0]} />
            </svg>
          ) : (
            agency[0].toLowerCase().replace("_", "")
          )}
        </div>
      );
    } else {
      const type = item.data;
      return (
        <div
          className="routeChip"
          style={{ backgroundColor: type[1] }}
          onClick={() =>
            setSelectedTypes((prev) =>
              prev.includes(type[0])
                ? prev.filter((t) => t !== type[0])
                : [...prev, type[0]],
            )
          }
        >
          <svg viewBox="0 0 24 24" width="1.1em" fill="currentColor">
            <Icon type={type[0]} />
          </svg>
        </div>
      );
    }
  }}
//   components={{
//     List: (props) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }} {...props} />,
//     Item: (props) => <div {...props} />,
//   }}
/>
                            {/* <Paper
                                sx={{
                                    display: "grid", // use CSS Grid
                                    gridAutoFlow: "column",
                                    gap: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    py: 1,
                                    mx: 2,
                                    my: 1,
                                }}
                            >
                                {(available_agencies.length > 1 || selectedAgencies.length > 0) &&
                                    available_agencies.map((agency) => (
                                        <div
                                            className="routeChip"
                                            style={{ backgroundColor: agency[1] }}
                                            onClick={() =>
                                                setSelectedAgencies(
                                                    (prev) =>
                                                        prev.includes(agency[0]!)
                                                            ? prev.filter((a) => a !== agency[0]) // Deselect if already selected
                                                            : [...prev, agency[0]!], // Select if not selected
                                                )
                                            }
                                        >
                                            {agency[0] && agencyIcons[agency[0]] ? (
                                                <svg viewBox="0 0 24 24" width="1.1em" fill="currentColor">
                                                    <Icon agency={agency[0]} />
                                                </svg>
                                            ) : (
                                                agency[0]!.toLowerCase().replace("_", "")
                                            )}
                                        </div>
                                    ))}
                                {(available_types.length > 1 || selectedTypes.length > 0) &&
                                    available_types.map((type) => (
                                        <div
                                            className="routeChip"
                                            style={{ backgroundColor: type[1] }}
                                            onClick={() =>
                                                setSelectedTypes((prev) =>
                                                    prev.includes(type[0]!)
                                                        ? prev.filter((t) => t !== type[0]!)
                                                        : [...prev, type[0]!],
                                                )
                                            }
                                        >
                                            <svg viewBox="0 0 24 24" width="1.1em" fill="currentColor">
                                                <Icon type={type[0]!} />
                                            </svg>
                                        </div>
                                    ))}
                            </Paper> */}
                            <VirtuosoGrid
                                data={routes || []}
                                itemContent={(i, route) => (
                                    <RouteChip
                                        route={route}
                                        onClick={() =>
                                            navigate(`/${city}/route/${route[ERoute.id]}`, { state: -3 })
                                        }
                                    />
                                )}
                                style={{ height: "calc(100% - 48px)" }}
                                components={{
                                    //@ts-ignore
                                    List: forwardRef(({ style, children, ...props }, ref) => (
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
                                    )),
                                }}
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
