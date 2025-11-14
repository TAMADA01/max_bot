import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MaxRedirectHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        const WebApp = (window as any).WebApp;
        if (!WebApp) return;

        const startParam = WebApp?.initDataUnsafe?.start_param;
        if (!startParam) {
            WebApp.ready?.();
            return;
        }

        console.log("MAX start_param:", startParam);


        if (startParam === "applications") {
            navigate("/applications", { replace: true });
        }

        else if (startParam === "create_application") {
            navigate("/applications/create", { replace: true });
        }

        else if (startParam.startsWith("application_")) {
            const id = startParam.replace("application_", "");
            navigate(`/applications/${id}`, { replace: true });
        }

        else {
            console.warn("Unknown start_param:", startParam);
        }

        WebApp.ready?.();

    }, [navigate]);

    return null;
}
