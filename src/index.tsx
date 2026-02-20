import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/pages/ErrorBoundary";
import { CssBaseline } from "@mui/material";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./components/util/register";
import "./components/sheet/sheet.css";
import "./index.css";
import { getV6Cities } from "@/util/tools";


window.historyLength = window.history.length;

async function bootstrap() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnReconnect: false,
                refetchOnMount: false,
                refetchOnWindowFocus: false,
                retry: false,
            },
        },
    });

    if (localStorage.getItem("useV6") === "true") {
        window.Cities = await getV6Cities();
    }

    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <CssBaseline />
                <App />
            </ErrorBoundary>
        </QueryClientProvider>,
    );
}


bootstrap();