"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Download, Type, ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import confetti from "canvas-confetti"
import Image from "next/image"

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256]
const BACKGROUND_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Green", value: "#10B981" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Red", value: "#EF4444" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Teal", value: "#14B8A6" },
]

function launchConfetti() {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
            return clearInterval(interval)
        }
        const particleCount = 50 * (timeLeft / duration)
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
    }, 250)
}

export default function Generator() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [letter, setLetter] = useState("")
    const [backgroundColor, setBackgroundColor] = useState("#3B82F6")
    const [textColor, setTextColor] = useState("#FFFFFF")
    const [generatedFavicons, setGeneratedFavicons] = useState<{ size: number; url: string }[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [borderRadius, setBorderRadius] = useState(20)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleFileUpload = useCallback((file: File) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) {
                handleFileUpload(files[0])
            }
        },
        [handleFileUpload],
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const generateFaviconFromImage = useCallback(() => {
        if (!uploadedImage || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const favicons: { size: number; url: string }[] = []

            FAVICON_SIZES.forEach((size) => {
                canvas.width = size
                canvas.height = size

                // Clear canvas
                ctx.clearRect(0, 0, size, size)

                // Calculate border radius based on size and slider value
                const radius = (size * borderRadius) / 100

                // Save context for clipping
                ctx.save()

                // Create rounded rectangle path
                ctx.beginPath()
                ctx.roundRect(0, 0, size, size, radius)
                ctx.clip()

                // Draw image
                ctx.drawImage(img, 0, 0, size, size)

                // Restore context
                ctx.restore()

                // Convert to data URL
                const dataUrl = canvas.toDataURL("image/png")
                favicons.push({ size, url: dataUrl })
            })

            setGeneratedFavicons(favicons)
            launchConfetti()
        }
        img.src = uploadedImage
    }, [uploadedImage, borderRadius])

    const generateFaviconFromLetter = useCallback(() => {
        if (!letter || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const favicons: { size: number; url: string }[] = []

        FAVICON_SIZES.forEach((size) => {
            canvas.width = size
            canvas.height = size

            ctx.clearRect(0, 0, size, size)
            ctx.save()

            const radius = (size * borderRadius) / 100

            ctx.beginPath()
            ctx.roundRect(0, 0, size, size, radius)
            ctx.clip()

            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, size, size)

            ctx.fillStyle = textColor
            ctx.font = `bold ${size * 0.6}px Arial, sans-serif`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(letter.toUpperCase(), size / 2, size / 2)

            ctx.restore()

            const dataUrl = canvas.toDataURL("image/png")
            favicons.push({ size, url: dataUrl })
        })

        setGeneratedFavicons(favicons)
        launchConfetti()
    }, [letter, backgroundColor, textColor, borderRadius])

    const downloadFavicon = useCallback((url: string, size: number) => {
        const link = document.createElement("a")
        link.download = `favicon-${size}x${size}.png`
        link.href = url
        link.click()
    }, [])

    const downloadAll = useCallback(() => {
        generatedFavicons.forEach((favicon) => {
            setTimeout(() => downloadFavicon(favicon.url, favicon.size), 100)
        })
    }, [generatedFavicons, downloadFavicon])

    // Effect to update the preview when borderRadius changes
    useEffect(() => {
        if (uploadedImage) {
            const img = new window.Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")
                if (!ctx) return

                const size = 128
                canvas.width = size
                canvas.height = size

                // Clear canvas
                ctx.clearRect(0, 0, size, size)

                // Calculate border radius
                const radius = (size * borderRadius) / 100

                // Create rounded rectangle path
                ctx.save()
                ctx.beginPath()
                ctx.roundRect(0, 0, size, size, radius)
                ctx.clip()

                // Draw image
                ctx.drawImage(img, 0, 0, size, size)
                ctx.restore()

                // Convert to data URL
                setImagePreview(canvas.toDataURL("image/png"))
            }
            img.src = uploadedImage
        }
    }, [uploadedImage, borderRadius])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Favicon Generator
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Create beautiful favicons for your website in seconds. Upload an image or generate from a single letter.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Upload Image
                            </TabsTrigger>
                            <TabsTrigger value="letter" className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Letter Icon
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Upload Your Image
                                    </CardTitle>
                                    <CardDescription>Upload an image to generate favicons in multiple sizes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                    >
                                        {uploadedImage ? (
                                            <div className="space-y-4">
                                                <Image
                                                    src={imagePreview || uploadedImage}
                                                    alt="Uploaded"
                                                    width={128}
                                                    height={128}
                                                    className="mx-auto object-cover border"
                                                    style={{ borderRadius: `${(32 * borderRadius) / 100}px` }}
                                                />
                                                <div className="space-y-2">
                                                    <Button onClick={generateFaviconFromImage} className="w-full">
                                                        Generate Favicons
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setUploadedImage(null)
                                                            setImagePreview(null)
                                                            setGeneratedFavicons([])
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Remove Image
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div>
                                                    <p className="text-lg font-medium">Drop your image here</p>
                                                    <p className="text-sm text-muted-foreground">or click to browse files</p>
                                                </div>
                                                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                                                    Choose File
                                                </Button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleFileUpload(file)
                                                    }}
                                                    className="hidden"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {uploadedImage && (
                                        <div className="mt-4">
                                            <Label htmlFor="borderRadiusUpload">Rounded Corners</Label>
                                            <div className="space-y-2 mt-2">
                                                <Slider
                                                    id="borderRadiusUpload"
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                    value={[borderRadius]}
                                                    onValueChange={(value) => setBorderRadius(value[0])}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
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

                        <TabsContent value="letter" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Type className="h-5 w-5" />
                                        Letter Icon Generator
                                    </CardTitle>
                                    <CardDescription>Create a favicon from a single letter with custom colors</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Input
                                                    value={letter}
                                                    onChange={(e) => setLetter(e.target.value.slice(0, 1))}
                                                    placeholder="Enter initial letter"
                                                    className="text-center text-lg"
                                                    maxLength={1}
                                                />
                                            </div>

                                            <div>
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    {BACKGROUND_COLORS.map((color) => (
                                                        <button
                                                            key={color.value}
                                                            onClick={() => setBackgroundColor(color.value)}
                                                            className={`h-10 rounded-md border-2 transition-all ${backgroundColor === color.value
                                                                ? "border-gray-900 scale-110"
                                                                : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            style={{ backgroundColor: color.value }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="textColor">Text Color</Label>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => setTextColor("#FFFFFF")}
                                                        className={`h-10 w-10 rounded-md border-2 bg-white ${textColor === "#FFFFFF" ? "border-gray-900" : "border-gray-200"
                                                            }`}
                                                        title="White"
                                                    />
                                                    <button
                                                        onClick={() => setTextColor("#000000")}
                                                        className={`h-10 w-10 rounded-md border-2 bg-black ${textColor === "#000000" ? "border-gray-900" : "border-gray-200"
                                                            }`}
                                                        title="Black"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="borderRadius">Rounded Corners</Label>
                                                <div className="space-y-2 mt-2">
                                                    <Slider
                                                        id="borderRadius"
                                                        min={0}
                                                        max={200}
                                                        step={1}
                                                        value={[borderRadius]}
                                                        onValueChange={(value) => setBorderRadius(value[0])}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Square</span>
                                                        <span>{borderRadius}%</span>
                                                        <span>Rounded</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="text-sm font-medium text-muted-foreground">Preview</div>
                                            <div
                                                className="w-24 h-24 font-sans flex items-center justify-center text-3xl font-bold border"
                                                style={{
                                                    backgroundColor,
                                                    color: textColor,
                                                    borderRadius: `${(24 * borderRadius) / 100}px`,
                                                }}
                                            >
                                                {letter.toUpperCase()}
                                            </div>
                                            <Button onClick={generateFaviconFromLetter} disabled={!letter} className="w-full">
                                                Generate Favicons
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {generatedFavicons.length > 0 && (
                        <Card className="mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="h-5 w-5" />
                                            Generated Favicons
                                        </CardTitle>
                                        <CardDescription>
                                            Click on any favicon to download it individually
                                        </CardDescription>
                                    </div>
                                    <Button onClick={downloadAll} className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {generatedFavicons.map((favicon, index) => (
                                        <div
                                            key={favicon.size}
                                            className="flex flex-col items-center space-y-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors animate-in fade-in-0 slide-in-from-bottom-3"
                                            onClick={() => downloadFavicon(favicon.url, favicon.size)}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <picture>
                                                <img
                                                    src={favicon.url}
                                                    alt={`${favicon.size}x${favicon.size}`}
                                                    className="border rounded"
                                                    style={{ width: favicon.size > 64 ? 64 : favicon.size }}
                                                />
                                            </picture>
                                            <Badge variant="secondary" className="font-mono">
                                                {favicon.size}×{favicon.size}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    )
}