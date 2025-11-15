import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function MaxRedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Выполняем редирект только один раз при первой загрузке
        if (hasRedirected.current) return;

        const WebApp = (window as any).WebApp;
        if (!WebApp) return;

        const startParam = WebApp?.initDataUnsafe?.start_param;
        if (!startParam) {
            WebApp.ready?.();
            return;
        }

        console.log("MAX start_param:", startParam);

        // Определяем целевой путь
        let targetPath = "";
        if (startParam === "applications") {
            targetPath = "/applications";
        } else if (startParam === "create_application") {
            targetPath = "/applications/create";
        } else if (startParam.startsWith("application_")) {
            const id = startParam.replace("application_", "");
            targetPath = `/applications/${id}`;
        } else {
            console.warn("Unknown start_param:", startParam);
            WebApp.ready?.();
            return;
        }

        // Выполняем редирект только если мы не на целевой странице
        if (location.pathname !== targetPath) {
            hasRedirected.current = true;
            navigate(targetPath, { replace: true });
        } else {
            hasRedirected.current = true;
        }

        WebApp.ready?.();
    }, [navigate, location.pathname]);

    return null;
}
