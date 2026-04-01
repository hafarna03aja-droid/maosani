/**
 * Custom Hook: useCanvas
 * Manages HTML5 Canvas for Digital Tracing of Hijaiyah letters
 */
import { useRef, useEffect, useState, useCallback } from 'react';

export default function useCanvas(options = {}) {
  const {
    width = 300,
    height = 300,
    lineColor = '#FFFFFF',
    lineWidth = 4,
    guideLetter = null,
    guideColor = 'rgba(0, 112, 224, 0.15)',
    guideFontSize = 180,
  } = options;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution for HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    // Draw guide letter
    drawGuide(ctx);
  }, [width, height, guideLetter]);

  const drawGuide = useCallback((ctx) => {
    if (!ctx || !guideLetter) return;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = 'rgba(10, 22, 40, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Guide letter (semi-transparent)
    ctx.fillStyle = guideColor;
    ctx.font = `${guideFontSize}px Amiri, 'Noto Naskh Arabic', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(guideLetter, width / 2, height / 2);

    // Redraw existing strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  }, [guideLetter, guideColor, guideFontSize, width, height, strokes]);

  const drawStroke = (ctx, points) => {
    if (points.length < 2) return;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const midX = (points[i - 1].x + points[i].x) / 2;
      const midY = (points[i - 1].y + points[i].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, midX, midY);
    }
    ctx.stroke();
  };

  // Get coordinates from event (mouse or touch)
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const point = getCoords(e);
    lastPointRef.current = point;
    setCurrentStroke([point]);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const ctx = ctxRef.current;
    const point = getCoords(e);
    const lastPoint = lastPointRef.current;

    // Draw smooth line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    setCurrentStroke(prev => [...prev, point]);
  }, [lineColor, lineWidth]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    setCurrentStroke(prev => {
      if (prev.length > 0) {
        setStrokes(s => [...s, prev]);
      }
      return [];
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setStrokes([]);
    setCurrentStroke([]);
    drawGuide(ctx);
  }, [drawGuide]);

  const undoLastStroke = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setStrokes(prev => {
      const newStrokes = prev.slice(0, -1);
      // Redraw everything
      ctx.clearRect(0, 0, width, height);
      drawGuide(ctx);
      newStrokes.forEach(stroke => drawStroke(ctx, stroke));
      return newStrokes;
    });
  }, [drawGuide, width, height]);

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const calculateScore = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Dapatkan area bounding aktual
    const w = canvas.width;
    const h = canvas.height;

    // 1. Buat offscreen canvas untuk Guide (Template)
    const offGuide = document.createElement('canvas');
    offGuide.width = w; offGuide.height = h;
    const gCtx = offGuide.getContext('2d', { willReadFrequently: true });
    
    // Gambar text guide, warna solid
    gCtx.fillStyle = '#000000';
    gCtx.font = `${guideFontSize * (window.devicePixelRatio || 1)}px Amiri, 'Noto Naskh Arabic', serif`;
    gCtx.textAlign = 'center';
    gCtx.textBaseline = 'middle';
    gCtx.fillText(guideLetter, w / 2, h / 2);
    const guideData = gCtx.getImageData(0, 0, w, h).data;

    // 2. Buat offscreen canvas untuk Tulisan User
    const offUser = document.createElement('canvas');
    offUser.width = w; offUser.height = h;
    const uCtx = offUser.getContext('2d', { willReadFrequently: true });
    
    // Draw user strokes
    uCtx.lineCap = 'round';
    uCtx.lineJoin = 'round';
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      uCtx.strokeStyle = '#000000';
      // Pertebal garis user saat valuasi agar lebih toleran
      uCtx.lineWidth = lineWidth * (window.devicePixelRatio || 1) * 3; 
      uCtx.beginPath();
      uCtx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        const p1 = stroke[i - 1];
        const p2 = stroke[i];
        uCtx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      }
      uCtx.stroke();
    });
    const userData = uCtx.getImageData(0, 0, w, h).data;

    // 3. Bandingkan Pixel
    let totalGuidePixels = 0;
    let matchedPixels = 0;
    
    // ImageData is flat array [r, g, b, a, r, g, b, a, ...]
    for (let i = 3; i < guideData.length; i += 4) {
      if (guideData[i] > 50) { // Pixel guide tidak transparan
        totalGuidePixels++;
        if (userData[i] > 50) { // Pixel user di titik ini tidak transparan
          matchedPixels++;
        }
      }
    }

    if (totalGuidePixels === 0) return 100; // Mencegah NaN
    
    const accuracy = Math.round((matchedPixels / totalGuidePixels) * 100);
    return Math.min(100, Math.max(0, accuracy));
  }, [strokes, guideLetter, guideFontSize, lineWidth]);

  return {
    canvasRef,
    clearCanvas,
    undoLastStroke,
    calculateScore,
    strokeCount: strokes.length,
  };
}
