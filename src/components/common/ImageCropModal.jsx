import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Sparkles,
  Move,
  Maximize2
} from 'lucide-react';
import { Button } from './Button';

export function ImageCropModal({ isOpen, imageSrc, onClose, onCropComplete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state whenever a new image is loaded
  useEffect(() => {
    if (imageSrc && isOpen) {
      setZoom(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen]);

  // Redraw canvas whenever zoom, rotation, or offset changes
  useEffect(() => {
    if (imageRef.current && isOpen) {
      drawCanvas();
    }
  }, [zoom, rotation, offsetX, offsetY, isOpen]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Translate to center of canvas
    ctx.translate(size / 2 + offsetX, size / 2 + offsetY);

    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.width / img.height;
    let drawW, drawH;
    if (aspect >= 1) {
      drawH = size;
      drawW = size * aspect;
    } else {
      drawW = size;
      drawH = size / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    // Restore context
    ctx.restore();
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offsetX,
        y: e.touches[0].clientY - offsetY,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate clean high-res 300x300 circular crop output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = 300;
    outputCanvas.height = 300;
    const outCtx = outputCanvas.getContext('2d');

    // Draw the image from current visible state
    outCtx.drawImage(canvas, 0, 0);

    // Convert to web-friendly JPEG data url
    const croppedUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Crop & Adjust Profile Photo</h3>
              <p className="text-[11px] text-slate-500">Drag to reposition and zoom to fit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900">
          <div
            className="relative w-[260px] h-[260px] rounded-full overflow-hidden shadow-2xl ring-4 ring-indigo-500/80 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
            {/* Crosshair Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/30 rounded-full" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/15 pointer-events-none -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none -translate-x-1/2" />
          </div>

          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <Move className="w-3 h-3 text-indigo-400" />
            Click and drag photo to adjust position
          </p>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4 bg-white">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                Zoom Level
              </span>
              <span className="font-mono text-indigo-600">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rotate & Reset Button Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
              Rotate 90°
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              Reset Position
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cancel
          </button>
          <Button
            size="sm"
            onClick={handleApplyCrop}
            className="text-xs px-5 py-2"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Apply Cropped Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
