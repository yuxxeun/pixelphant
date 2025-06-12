"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Loader2, RefreshCw } from "lucide-react";

interface LocationData {
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
}

interface GeolocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export default function IpLocationDetector() {
    const [ipLocation, setIpLocation] = useState<LocationData | null>(null);
    const [geoLocation, setGeoLocation] = useState<GeolocationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);

    const detectIpLocation = async () => {
        setLoading(true);
        setError(null);

        try {
            const ipResponse = await fetch("/api/get-ip");
            const ipData = await ipResponse.json();

            if (!ipResponse.ok) {
                throw new Error(ipData.error || "Failed to get IP address");
            }
            const locationResponse = await fetch(`/api/get-location?ip=${ipData.ip}`);
            const locationData = await locationResponse.json();

            if (!locationResponse.ok) {
                throw new Error(locationData.error || "Failed to get location data");
            }

            setIpLocation({
                ip: ipData.ip,
                ...locationData,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const detectGeoLocation = () => {
        setGeoLoading(true);
        setGeoError(null);

        if (!navigator.geolocation) {
            setGeoError("Geolocation is not supported by this browser");
            setGeoLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setGeoLoading(false);
            },
            (error) => {
                let errorMessage = "Failed to get location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied by user";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                }
                setGeoError(errorMessage);
                setGeoLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        detectIpLocation();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">IP Address & Location Detector</h1>
                <p className="text-muted-foreground">
                    Detect your IP address and location using different methods
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* IP-based Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            IP-based Location
                        </CardTitle>
                        <CardDescription>
                            Location detected from your IP address
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Detecting location...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-500 mb-4">{error}</p>
                                <Button onClick={detectIpLocation} variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        ) : ipLocation ? (
                            <div className="space-y-3">
                                {ipLocation.ip && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            IP Address
                                        </label>
                                        <p className="font-mono text-lg">{ipLocation.ip}</p>
                                    </div>
                                )}

                                {(ipLocation.city ||
                                    ipLocation.region ||
                                    ipLocation.country) && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Location
                                            </label>
                                            <p className="text-lg">
                                                {[ipLocation.city, ipLocation.region, ipLocation.country]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                        </div>
                                    )}

                                {ipLocation.latitude && ipLocation.longitude && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Coordinates
                                        </label>
                                        <p className="font-mono">
                                            {ipLocation.latitude.toFixed(4)},{" "}
                                            {ipLocation.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                )}

                                {ipLocation.timezone && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Timezone
                                        </label>
                                        <p>{ipLocation.timezone}</p>
                                    </div>
                                )}

                                {ipLocation.isp && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            ISP
                                        </label>
                                        <p>{ipLocation.isp}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={detectIpLocation}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh IP Location
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {/* GPS-based Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            GPS Location
                        </CardTitle>
                        <CardDescription>
                            Precise location from your device&apos;s GPS
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!geoLocation && !geoLoading && !geoError && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    Click to get your precise location using GPS
                                </p>
                                <Button onClick={detectGeoLocation}>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Get GPS Location
                                </Button>
                            </div>
                        )}

                        {geoLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Getting GPS location...</span>
                            </div>
                        )}

                        {geoError && (
                            <div className="text-center py-8">
                                <p className="text-red-500 mb-4">{geoError}</p>
                                <Button onClick={detectGeoLocation} variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {geoLocation && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Coordinates
                                    </label>
                                    <p className="font-mono text-lg">
                                        {geoLocation.latitude.toFixed(6)},{" "}
                                        {geoLocation.longitude.toFixed(6)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Accuracy
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <p>{Math.round(geoLocation.accuracy)} meters</p>
                                        <Badge
                                            variant={
                                                geoLocation.accuracy < 100 ? "default" : "secondary"
                                            }
                                        >
                                            {geoLocation.accuracy < 100 ? "High" : "Low"} Accuracy
                                        </Badge>
                                    </div>
                                </div>

                                <Button
                                    onClick={detectGeoLocation}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh GPS Location
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Comparison */}
            {ipLocation && geoLocation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Location Comparison</CardTitle>
                        <CardDescription>
                            Compare the accuracy of different location detection methods
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="font-medium mb-2">IP-based Location</h4>
                                <p className="text-sm text-muted-foreground">
                                    Approximate location based on your internet connection
                                </p>
                                {ipLocation.latitude && ipLocation.longitude && (
                                    <p className="font-mono text-sm mt-1">
                                        {ipLocation.latitude.toFixed(4)},{" "}
                                        {ipLocation.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">GPS Location</h4>
                                <p className="text-sm text-muted-foreground">
                                    Precise location from device GPS (±
                                    {Math.round(geoLocation.accuracy)}m)
                                </p>
                                <p className="font-mono text-sm mt-1">
                                    {geoLocation.latitude.toFixed(6)},{" "}
                                    {geoLocation.longitude.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
