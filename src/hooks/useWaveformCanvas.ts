import { useRef, useEffect } from "react";
import { type WaveformConfig } from "../types";

export const useWaveformCanvas = (config: WaveformConfig) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawWaveform = (values: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate scale factor
        let yScaleFactor = config.manualYScale;
        if (config.autoScale && values && values.length > 0) {
            const maxAbsValue = Math.max(...values.map(v => Math.abs(v)));
            yScaleFactor = maxAbsValue > 0 ? 1 / (maxAbsValue * 1.1) : 1.0;
        }

        // Draw reference lines
        drawReferenceLines(ctx, width, height, yScaleFactor, config.autoScale, values);

        // Draw waveform
        if (values && values.length > 0) {
            drawWaveformPath(ctx, values, width, height, yScaleFactor);
        }
    };

    const drawReferenceLines = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        yScaleFactor: number,
        autoScale: boolean,
        values: number[]
    ) => {
        // +1 and -1 lines
        ctx.beginPath();
        ctx.strokeStyle = "#10b981";
        ctx.setLineDash([5, 3]);
        ctx.moveTo(0, height * 0.25);
        ctx.lineTo(width, height * 0.25);
        ctx.moveTo(0, height * 0.75);
        ctx.lineTo(width, height * 0.75);
        ctx.stroke();

        // Center line (0)
        ctx.beginPath();
        ctx.strokeStyle = "#9ca3af";
        ctx.setLineDash([]);
        ctx.moveTo(0, height * 0.5);
        ctx.lineTo(width, height * 0.5);
        ctx.stroke();

        // Labels
        ctx.fillStyle = "#34d399";
        ctx.font = "12px sans-serif";
        ctx.fillText("+1", 5, height * 0.25 - 5);
        ctx.fillText("-1", 5, height * 0.75 - 5);
        ctx.fillStyle = "#d1d5db";
        ctx.fillText("0", 5, height * 0.5 - 5);

        // Scale indicator
        if (autoScale && values && values.length > 0) {
            ctx.fillStyle = "#f59e0b";
            ctx.font = "10px sans-serif";
            ctx.fillText(`Scale: ${(1 / yScaleFactor).toFixed(2)}x`, width - 80, 15);
        }
    };

    const drawWaveformPath = (
        ctx: CanvasRenderingContext2D,
        values: number[],
        width: number,
        height: number,
        yScaleFactor: number
    ) => {
        ctx.beginPath();
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        const stepSize = width / values.length;

        const valueToY = (value: number) => {
            const scaledValue = value * yScaleFactor;
            const clampedValue = Math.max(-1, Math.min(1, scaledValue));
            return height * 0.5 - clampedValue * height * 0.25;
        };

        ctx.moveTo(0, valueToY(values[0]));

        for (let i = 1; i < values.length; i++) {
            const x = i * stepSize;
            const y = valueToY(values[i]);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
    };

    // Handle canvas resizing
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const parent = canvas.parentElement;
            if (!parent) return;

            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            // Redraw with empty data to show reference lines
            drawWaveform([]);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return { canvasRef, drawWaveform };
};