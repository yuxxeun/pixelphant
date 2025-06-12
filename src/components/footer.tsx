"use client";

import { Globe2Icon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
    const [ip, setIp] = useState<string>("");
    const [loc, setLoc] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await fetch("/api/get-ip");
                const data = await response.json();
                setIp(data.ip || "Unknown");
            } catch (error) {
                console.error("Failed to fetch IP:", error);
                setIp("Unknown");
            } finally {
                setLoading(false);
            }
        };

        fetchIp();
    }, []);

    useEffect(() => {
        const fetchLoc = async () => {
            try {
                const response = await fetch("/api/get-location");
                const data = await response.json();
                setLoc(data.loc || "Unknown");
            } catch (error) {
                console.error("Failed to fetch Location:", error);
                setLoc("Unknown");
            } finally {
                setLoading(false);
            }
        };

        fetchLoc();
    }, []);

    return (
        <footer className="py-4 flex justify-center text-sm text-muted-foreground border-t">
            <div className="flex items-center gap-2 font-mono">
                <Globe2Icon className="h-4 w-4 animate-spin" />
                {loading ? "Getting your ip number..." : `${ip}`} —{" "}
                {loading ? "Getting your ip number..." : `${loc}`}
            </div>
        </footer>
    );
}
