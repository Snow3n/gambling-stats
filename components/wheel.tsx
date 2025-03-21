"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Settings, Copy } from "lucide-react";
import React from "react";

interface WheelSegment {
  id: string;
  text: string;
  color: string;
  weight: number;
  textColor?: string;
}

const defaultSegments: WheelSegment[] = [
  { id: "1", text: "100x", color: "#FF6B6B", weight: 1, textColor: "#FFFFFF" },
  { id: "2", text: "50x", color: "#4ECDC4", weight: 2, textColor: "#FFFFFF" },
  { id: "3", text: "25x", color: "#45B7D1", weight: 3, textColor: "#FFFFFF" },
  { id: "4", text: "10x", color: "#96CEB4", weight: 4, textColor: "#FFFFFF" },
];

export default function Wheel() {
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    const saved = localStorage.getItem('wheel-segments');
    return saved ? JSON.parse(saved) : defaultSegments;
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [wheelSize, setWheelSize] = useState(() => {
    const saved = localStorage.getItem('wheel-size');
    return saved ? JSON.parse(saved) : { width: 500, height: 500 };
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('wheel-segments', JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem('wheel-size', JSON.stringify(wheelSize));
  }, [wheelSize]);

  React.useLayoutEffect(() => {
    drawWheel();
  }, [segments, rotation, wheelSize]);

  const getSegmentAtAngle = (angle: number) => {
    // 1. Нормализуем угол к диапазону [0, 2π]
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // 2. Смещаем на 90° против часовой стрелки для совмещения с позицией стрелки
    const adjustedAngle = (normalizedAngle + Math.PI / 2) % (2 * Math.PI);

    console.log('Debug angles (degrees):', {
      original: (angle * 180 / Math.PI).toFixed(2),
      normalized: (normalizedAngle * 180 / Math.PI).toFixed(2),
      adjusted: (adjustedAngle * 180 / Math.PI).toFixed(2)
    });

    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    let currentAngle = 0;

    // Проходим по сегментам в прямом порядке
    for (const segment of segments) {
      const segmentAngle = (2 * Math.PI * segment.weight) / totalWeight;
      const nextAngle = currentAngle + segmentAngle;
      
      if (adjustedAngle >= currentAngle && adjustedAngle < nextAngle) {
        console.log('Selected segment:', {
          text: segment.text,
          angleRange: {
            start: (currentAngle * 180 / Math.PI).toFixed(2),
            end: (nextAngle * 180 / Math.PI).toFixed(2)
          }
        });
        return segment;
      }
      currentAngle = nextAngle;
    }

    return segments[0];
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, wheelSize.width, wheelSize.height);
    const centerX = wheelSize.width / 2;
    const centerY = wheelSize.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Начинаем отрисовку с позиции на 90° по часовой стрелке от стрелки
    let startAngle = rotation + Math.PI / 2;
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);

    segments.forEach((segment) => {
      const sliceAngle = (2 * Math.PI * segment.weight) / totalWeight;

      // Рисуем сегмент
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Рисуем текст
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#FFFFFF';
      
      // Корректируем ориентацию текста
      if (startAngle + sliceAngle / 2 > Math.PI / 2 && 
          startAngle + sliceAngle / 2 < 3 * Math.PI / 2) {
        ctx.rotate(Math.PI);
        ctx.textAlign = 'left';
        ctx.fillText(segment.text, -radius + 30, 0);
      } else {
        ctx.fillText(segment.text, radius - 30, 0);
      }
      
      ctx.restore();

      startAngle += sliceAngle;
    });

    // Рисуем стрелку
    drawArrow(ctx, centerX, 40, 20);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, centerX: number, y: number, size: number) => {
    ctx.save();
    
    // Тень для стрелки
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Рисуем стрелку
    ctx.beginPath();
    ctx.moveTo(centerX - size, y);
    ctx.lineTo(centerX, y + size * 1.5);
    ctx.lineTo(centerX + size, y);
    ctx.closePath();

    // Градиент для стрелки
    const gradient = ctx.createLinearGradient(centerX, y, centerX, y + size * 1.5);
    gradient.addColorStop(0, '#FF0000');
    gradient.addColorStop(1, '#CC0000');
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Белая окантовка стрелки
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const spinRotations = 8;
    // Добавляем начальное смещение для компенсации позиции стрелки
    const targetRotation = rotation + (spinRotations * 2 * Math.PI) + Math.random() * 2 * Math.PI;
    
    let currentRotation = rotation;
    let startTime = performance.now();
    const duration = 5000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const rotationProgress = easeOut(progress);

      currentRotation = rotation + (targetRotation - rotation) * rotationProgress;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const winningSegment = getSegmentAtAngle(currentRotation);
        setIsSpinning(false);
        setResult(winningSegment.text);
        
        if (soundEnabled) {
          const winSound = new Audio('/win-sound.mp3');
          winSound.play();
        }
      }
    };

    if (soundEnabled) {
      const spinSound = new Audio('/spin-sound.mp3');
      spinSound.play();
    }

    requestAnimationFrame(animate);
  };

  const addSegment = () => {
    const newSegment: WheelSegment = {
      id: Date.now().toString(),
      text: "New",
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      weight: 1
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, updates: Partial<WheelSegment>) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ));
  };

  const deleteSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const copyToClipboard = () => {
    const browserSourceUrl = `${window.location.origin}/wheel?standalone=true`;
    navigator.clipboard.writeText(browserSourceUrl);
    alert('URL copied to clipboard! Use this as Browser Source in OBS.');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Wheel of Fortune</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy OBS URL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <canvas
              ref={canvasRef}
              width={wheelSize.width}
              height={wheelSize.height}
              className="w-full h-full"
            />
            <Button 
              className="w-full mt-4" 
              onClick={spinWheel}
              disabled={isSpinning}
            >
              {isSpinning ? 'Spinning...' : 'SPIN'}
            </Button>
            {result && (
              <div className="mt-4 text-center text-2xl font-bold">
                Result: {result}
              </div>
            )}
          </CardContent>
        </Card>

        {showSettings && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm">Width</label>
                    <Input
                      type="number"
                      value={wheelSize.width}
                      onChange={(e) => setWheelSize((prev: { width: number; height: number }) => ({
                        ...prev,
                        width: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Height</label>
                    <Input
                      type="number"
                      value={wheelSize.height}
                      onChange={(e) => setWheelSize((prev: { width: number; height: number }) => ({
                        ...prev,
                        height: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {segments.map((segment) => (
                    <div key={segment.id} className="flex gap-2 items-center">
                      <Input
                        value={segment.text}
                        onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={segment.weight}
                        onChange={(e) => updateSegment(segment.id, { weight: parseInt(e.target.value) })}
                        className="w-20"
                      />
                      <Input
                        type="color"
                        value={segment.color}
                        onChange={(e) => updateSegment(segment.id, { color: e.target.value })}
                        className="w-20"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteSegment(segment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={addSegment} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Segment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 