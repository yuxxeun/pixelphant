"use client";

import { Site } from "@/lib/constant";
import { Globe2Icon } from "lucide-react";
import Link from "next/link";
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
        <Globe2Icon className="h-3 w-3 animate-spin" />
        {loading ? "Get ip..." : `${ip}`} –
        <Link
          className="decoration-wavy underline"
          href={Site.github}
          target="_blank"
        >
          GitHub
        </Link>
      </div>
    </footer>
  );
}
