"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Type,
  ImageIcon,
  Sparkles,
  X,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import confetti from "canvas-confetti";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Site } from "@/lib/constant";

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
const BACKGROUND_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#666666" },
  { name: "Blue", value: "#0070f3" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Green", value: "#00d9ff" },
  { name: "Orange", value: "#ff6154" },
  { name: "Pink", value: "#ff0080" },
  { name: "Yellow", value: "#f5a623" },
];

function launchConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 20, spread: 360, ticks: 40, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 30 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 },
    });
  }, 200);
}

export default function Generator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [letter, setLetter] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [generatedFavicons, setGeneratedFavicons] = useState<
    { size: number; url: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [borderRadius, setBorderRadius] = useState(20);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const generateFaviconFromImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const favicons: { size: number; url: string }[] = [];

      FAVICON_SIZES.forEach((size) => {
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        const radius = (size * borderRadius) / 100;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();

        const dataUrl = canvas.toDataURL("image/png");
        favicons.push({ size, url: dataUrl });
      });

      setGeneratedFavicons(favicons);
      launchConfetti();
    };
    img.src = uploadedImage;
  }, [uploadedImage, borderRadius]);

  const generateFaviconFromLetter = useCallback(() => {
    if (!letter || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const favicons: { size: number; url: string }[] = [];

    FAVICON_SIZES.forEach((size) => {
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      ctx.save();

      const radius = (size * borderRadius) / 100;

      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radius);
      ctx.clip();

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = textColor;
      ctx.font = `600 ${size * 0.55}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter.toUpperCase(), size / 2, size / 2);

      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      favicons.push({ size, url: dataUrl });
    });

    setGeneratedFavicons(favicons);
    launchConfetti();
  }, [letter, backgroundColor, textColor, borderRadius]);

  const downloadFavicon = useCallback((url: string, size: number) => {
    const link = document.createElement("a");
    link.download = `favicon-${size}x${size}.png`;
    link.href = url;
    link.click();
  }, []);

  const downloadAll = useCallback(() => {
    generatedFavicons.forEach((favicon, index) => {
      setTimeout(() => downloadFavicon(favicon.url, favicon.size), index * 100);
    });
  }, [generatedFavicons, downloadFavicon]);

  useEffect(() => {
    if (uploadedImage) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 80;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        const radius = (size * borderRadius) / 100;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();

        setImagePreview(canvas.toDataURL("image/png"));
      };
      img.src = uploadedImage;
    }
  }, [uploadedImage, borderRadius]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Sparkles className="animate-pulse h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white">{Site.title}</h1>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
            Generate high-quality favicons for your website.
            <br />
            Upload an image or create from a letter with precise control over
            styling.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Tabs defaultValue="upload" className="w-full">
            <div className="flex justify-center mb-2">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl px-4 py-2 gap-2 bg-white/5 backdrop-blur-sm border border-white/10">
                <TabsTrigger
                  value="upload"
                  className="relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-sm font-medium text-gray-300 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10 hover:text-white gap-2"
                >
                  <ImageIcon className="h-4 w-4 transition-transform duration-300 ease-in-out" />
                  Upload Image
                </TabsTrigger>
                <TabsTrigger
                  value="letter"
                  className="relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-sm font-medium text-gray-300 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10 hover:text-white gap-2"
                >
                  <Type className="h-4 w-4 transition-transform duration-300 ease-in-out" />
                  Letter Icon
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="upload"
              className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-white">
                    Upload Image
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-300">
                    Upload an image to generate favicons in multiple sizes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging
                        ? "border-white/40 bg-white/10"
                        : "border-white/20 hover:border-white/30 hover:bg-white/5"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {uploadedImage ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative inline-block">
                          <Image
                            src={imagePreview || uploadedImage}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="object-cover"
                            style={{
                              borderRadius: `${(8 * borderRadius) / 100}px`,
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white/90 border-white/20 hover:bg-white"
                            onClick={() => {
                              setUploadedImage(null);
                              setImagePreview(null);
                              setGeneratedFavicons([]);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Drop your image here
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            or click to browse files
                          </p>
                        </div>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="h-9 px-4 text-sm font-medium bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  {uploadedImage && (
                    <div className="flex justify-center">
                      <Button
                        onClick={generateFaviconFromImage}
                        className="h-9 px-6 text-sm font-medium bg-white text-gray-900 hover:bg-gray-100"
                      >
                        Generate Favicons
                      </Button>
                    </div>
                  )}

                  {uploadedImage && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={50}
                          step={1}
                          value={[borderRadius]}
                          onValueChange={(value) => setBorderRadius(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 font-mono">
                          <span>Square</span>
                          <span>{borderRadius}%</span>
                          <span>Rounded</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="letter"
              className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-white">
                    Letter Icon
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-300">
                    Create a favicon from a single letter with custom styling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">
                          Letter
                        </Label>
                        <Input
                          value={letter}
                          onChange={(e) =>
                            setLetter(e.target.value.slice(0, 1))
                          }
                          placeholder="A"
                          className="text-center text-lg font-medium h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          required
                          maxLength={1}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-white">
                          Background Color
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {BACKGROUND_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setBackgroundColor(color.value)}
                              className={`h-10 rounded-md border transition-all ${
                                backgroundColor === color.value
                                  ? "border-white ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-white">
                          Text Color
                        </Label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setTextColor("#FFFFFF")}
                            className={`h-10 w-10 rounded-md border bg-white ${
                              textColor === "#FFFFFF"
                                ? "border-white ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
                                : "border-white/20 hover:border-white/40"
                            }`}
                            title="White"
                          />
                          <button
                            onClick={() => setTextColor("#000000")}
                            className={`h-10 w-10 rounded-md border bg-black ${
                              textColor === "#000000"
                                ? "border-white ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
                                : "border-white/20 hover:border-white/40"
                            }`}
                            title="Black"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Slider
                            min={0}
                            max={200}
                            step={1}
                            value={[borderRadius]}
                            onValueChange={(value) => setBorderRadius(value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-400 font-mono">
                            <span>Square</span>
                            <span>{borderRadius}%</span>
                            <span>Rounded</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Preview
                      </div>
                      <div
                        className="w-20 h-20 flex items-center justify-center text-2xl font-semibold border-2 border-white/60"
                        style={{
                          backgroundColor,
                          color: textColor,
                          borderRadius: `${(20 * borderRadius) / 100}px`,
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                      >
                        {letter.toUpperCase()}
                      </div>

                      <Alert
                        variant="default"
                        className="bg-white/5 border-white/10"
                      >
                        <AlertCircleIcon className="text-white" />
                        <AlertTitle className="text-white">
                          Hey please notice!
                        </AlertTitle>
                        <AlertDescription className="text-gray-300">
                          The icon result will not include with border.
                          <br />
                          The border is just for preview purpose.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={generateFaviconFromLetter}
                        disabled={!letter}
                        className="bg-white text-gray-900 hover:bg-gray-100 h-9 px-4 text-sm font-medium w-full disabled:opacity-50"
                      >
                        Generate Favicons
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {generatedFavicons.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium text-white">
                      Generated Favicons
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      Click any favicon to download individually
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {generatedFavicons.map((favicon, index) => (
                    <div
                      key={favicon.size}
                      className="flex flex-col items-center space-y-3 p-4 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-all animate-in fade-in-0 slide-in-from-bottom-3"
                      onClick={() => downloadFavicon(favicon.url, favicon.size)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <picture>
                        <img
                          src={favicon.url || "/placeholder.svg"}
                          alt={`${favicon.size}x${favicon.size}`}
                          className=""
                          style={{
                            width: favicon.size > 48 ? 48 : favicon.size,
                            height: favicon.size > 48 ? 48 : favicon.size,
                          }}
                        />
                      </picture>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-white/10 text-gray-300 hover:bg-white/20"
                      >
                        {favicon.size}×{favicon.size}
                      </Badge>
                    </div>
                  ))}
                </div>
                <CardFooter className="mt-8 w-full">
                  <Button
                    onClick={downloadAll}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 h-9 px-4 text-sm font-medium flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                </CardFooter>
              </CardContent>
            </Card>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
