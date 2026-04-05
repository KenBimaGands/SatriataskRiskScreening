import axios from "axios";
import { useEffect, useState } from "react";

export const api = axios.create({
    baseURL: "https://digdaya-backend-system.vercel.app"
})

export function ErrorHandler(status: number | undefined, defaulterr: string | undefined): string {
    switch (status) {
        case 100:
            return "Continue";
        case 101:
            return "Switching protocols";

        case 200:
            return "[anom]: Request successful";
        case 201:
            return "[anom]: Resource created successfully";
        case 204:
            return "[anom]: No content";
        case 301:
            return "[anom]: Resource moved permanently";
        case 302:
            return "[anom]: Resource temporarily moved";
        case 304:
            return "[anom]: Resource not modified";

        case 400:
            return "Bad request — invalid data sent";
        case 401:
            return "Unauthorized — please login again";
        case 402:
            return "Payment required";
        case 403:
            return "Forbidden — you don't have permission";
        case 404:
            return "Resource not found";
        case 405:
            return "Method not allowed";
        case 406:
            return "Not acceptable";
        case 408:
            return "Request timeout";
        case 409:
            return "Conflict — data already exists";
        case 410:
            return "Resource permanently removed";
        case 413:
            return "Payload too large";
        case 415:
            return "Unsupported media type";
        case 422:
            return "Validation failed";
        case 423:
            return "Resource is locked";
        case 429:
            return "Too many requests — slow down";

        case 500:
            return "Internal server error";
        case 501:
            return "Not implemented";
        case 502:
            return "Bad gateway";
        case 503:
            return "Service unavailable";
        case 504:
            return "Gateway timeout";
        case 507:
            return "Insufficient storage";

        case undefined:
            return "Network error — unable to reach server";
        default:
            return defaulterr ?? "API error";
    }
}

export interface ErrorResponseAPI {
    // fast / flask api default
    detail?: string;

    // usually if you set up
    message?: string;
    msg?: string;
}

export function useFetchData<TResponse>(url: string) {
    const [data, setData] = useState<TResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    console.log(import.meta.env.VITE_PUBLIC_BASE_API_URL)

    useEffect(() => {
        const fetchFunc = async () => {
            setIsLoading(true);
            try {
                const resp = await api.get<TResponse>(url);
                setData(resp.data);
                setErr(null);
            } catch (error) {
                if (axios.isAxiosError<ErrorResponseAPI>(error)) {
                    const status = error.response?.status;
                    setErr(ErrorHandler(status, error.response?.data.message ?? error.response?.data.detail ?? error.response?.data.msg))
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchFunc()
    }, [url])



    return { data, isLoading, err }
}

export interface RecomendationINterface {
    code: string;
    composite_score: number;
    final_label: number;
    label_nb: number;
    label_rbs: number;
    name: string;
    recommendation: string;
    status: string;
    year: number;
}

export interface AnalysisRecomendationAPIInterface {
    code: string;
    recommendations: RecomendationINterface[];
    thresholds: {
        p25: number;
        p50: number;
        p75: number;
    },
    total_years: number;
}