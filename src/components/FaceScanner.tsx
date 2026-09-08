"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Scan, Sparkles, RefreshCw, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { FaceScanResult } from "@/lib/types";

interface FaceScannerProps {
  onScanComplete: (result: FaceScanResult, previewUrl: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const SAMPLE_FACES = [
  {
    id: "sample-1",
    name: "Alex (Tech Lead)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-2",
    name: "Marcus (Researcher)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-3",
    name: "Elena (Developer)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
  },
];

export const FaceScanner: React.FC<FaceScannerProps> = ({
  onScanComplete,
  isScanning,
  setIsScanning,
}) => {
  const [mode, setMode] = useState<"upload" | "webcam" | "sample">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState<string>("");
  const [webcamActive, setWebcamActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera when unmounting or changing modes
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    setErrorMsg(null);
    try {
      setMode("webcam");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("Camera access denied or unavailable. Please use file upload.");
      setMode("upload");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  const captureWebcamSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        stopWebcam();
        setPreviewUrl(dataUrl);
        executeScanPipeline(dataUrl, "webcam-capture.jpg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewUrl(base64);
      executeScanPipeline(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_FACES[0]) => {
    setErrorMsg(null);
    stopWebcam();
    setMode("sample");
    setPreviewUrl(sample.url);

    try {
      const resp = await fetch(sample.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onload = () => {
        executeScanPipeline(reader.result as string, `${sample.name}.jpg`);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      // Direct pass if CORS restrictions
      executeScanPipeline(sample.url, `${sample.name}.jpg`);
    }
  };

  const executeScanPipeline = async (imageData: string, fileName: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStage("Calibrating optical matrix & isolating face...");

    try {
      const timer1 = setTimeout(() => {
        setScanProgress(45);
        setScanStage("Extracting 68-point facial landmarks & geometric ratios...");
      }, 500);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageData, fileName }),
      });

      const data = await res.json();
      clearTimeout(timer1);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Face analysis failed");
      }

      setScanProgress(85);
      setScanStage("Generating deterministic Keccak/SHA biometric hash...");

      setTimeout(() => {
        setScanProgress(100);
        setScanStage("Biometric verification fingerprint ready!");
        setScanResult(data.data);
        setIsScanning(false);
        onScanComplete(data.data, imageData);
      }, 400);
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg(err.message || "Failed to scan image");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-[#0D131F]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background neon ambient blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              1
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Biometric Face Scan &amp; Vectorization
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capture or upload a face image to extract landmarks, geometric ratios, and perceptual hash.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              stopWebcam();
              setMode("upload");
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
              mode === "upload" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          <button
            onClick={startWebcam}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
              mode === "webcam" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Webcam
          </button>
          <button
            onClick={() => {
              stopWebcam();
              setMode("sample");
            }}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
              mode === "sample" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Presets
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Scanner Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Visual Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          
          {/* File Upload Mode */}
          {mode === "upload" && !previewUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-72 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition group p-6"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 mb-4 shadow-lg shadow-blue-500/10">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition">
                Click or Drag &amp; Drop Face Image
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
            </div>
          )}

          {/* Webcam Mode */}
          {mode === "webcam" && (
            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-black border border-blue-500/40 shadow-xl flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute inset-0 scanner-frame pointer-events-none" />
              
              {/* Overlay target frame */}
              <div className="absolute w-44 h-56 border-2 border-cyan-400/80 rounded-3xl pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-300 absolute -top-1 -left-1" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-300 absolute -top-1 -right-1" />
                <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-300 absolute -bottom-1 -left-1" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-300 absolute -bottom-1 -right-1" />
                <span className="text-[10px] font-mono uppercase bg-black/60 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">
                  Align Face
                </span>
              </div>

              {/* Snapshot trigger */}
              <button
                onClick={captureWebcamSnapshot}
                className="absolute bottom-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture &amp; Analyze
              </button>
            </div>
          )}

          {/* Presets Mode */}
          {mode === "sample" && !previewUrl && (
            <div className="w-full">
              <p className="text-xs text-slate-400 mb-3 font-medium">Select a sample identity for instant automated pipeline test:</p>
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_FACES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="cursor-pointer border border-slate-800 hover:border-blue-500 rounded-xl p-2 bg-slate-900/50 hover:bg-slate-900 transition group flex flex-col items-center"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-16 h-16 rounded-lg object-cover mb-2 group-hover:scale-105 transition"
                    />
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-cyan-400 text-center truncate w-full">
                      {sample.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Preview Stage */}
          {previewUrl && mode !== "webcam" && (
            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Face Preview"
                className="w-full h-full object-cover"
              />

              {/* Scanner Grid Overlay */}
              {isScanning && (
                <>
                  <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px]" />
                  <div className="absolute inset-0 scanner-frame" />
                  
                  {/* Simulated Landmark Dots */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-40 h-48 border border-cyan-400/60 rounded-2xl">
                      {/* 68-point landmark dots animation */}
                      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                </>
              )}

              {/* Reset image button */}
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setScanResult(null);
                }}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center gap-1 shadow-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          )}

          {/* Hidden Canvas for Webcam Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Column: Biometric Telemetry HUD */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-cyan-400" />
                Biometric Telemetry
              </span>
              {scanResult && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Face Verified ({(scanResult.confidence * 100).toFixed(0)}%)
                </span>
              )}
            </div>

            {/* Scan Progress Bar */}
            {isScanning && (
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{scanStage}</span>
                  <span className="font-mono text-cyan-400">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Biometric Metrics Display */}
            {scanResult ? (
              <div className="space-y-2.5">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Biometric Perceptual Hash (Keccak Seed)</span>
                  <span className="font-mono text-[11px] text-cyan-400 break-all select-all">
                    {scanResult.faceHash}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Landmark Points</span>
                    <span className="font-mono font-bold text-slate-200">{scanResult.landmarksCount} Keypoints</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Facial Symmetry</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {(scanResult.metrics.symmetryScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Inter-Ocular Ratio</span>
                    <span className="font-mono font-bold text-slate-200">
                      {scanResult.metrics.eyeDistanceRatio}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Jaw-Width Index</span>
                    <span className="font-mono font-bold text-slate-200">
                      {scanResult.metrics.jawWidthRatio}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <UserCheck className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                <p className="text-xs">No active face profile scanned.</p>
                <p className="text-[11px] text-slate-600 mt-1">Upload a photo or select a preset to generate cryptographic facial vectors.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target L2: <strong className="text-blue-400">Base Sepolia</strong></span>
            <span>Security: <strong className="text-slate-300">Deterministic</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
