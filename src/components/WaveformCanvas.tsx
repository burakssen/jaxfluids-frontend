import React, { useEffect } from "react";
import { type WaveformConfig, type ModelState } from "../types";
import { useWaveformCanvas } from "../hooks/useWaveformCanvas";

interface WaveformCanvasProps {
    config: WaveformConfig;
    modelState: ModelState;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({ config, modelState }) => {
    const { canvasRef, drawWaveform } = useWaveformCanvas(config);

    // Redraw when output changes
    useEffect(() => {
        if (modelState.output) {
            drawWaveform(modelState.output);
        } else {
            drawWaveform([]);
        }
    }, [modelState.output, config.autoScale, config.manualYScale]);

    return (
        <div className="h-80 w-full border border-gray-700 p-1 bg-gray-900 rounded-lg shadow-inner">
            <div className="relative h-full w-full">
                <canvas
                    ref={canvasRef}
                    className="bg-gray-800 rounded-md"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                />
                {(!modelState.isLoaded || (!modelState.isRunning && !modelState.output)) && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
                        {modelState.isLoaded ? "Click `Start Inference` to see output" : "Loading model..."}
                    </div>
                )}
            </div>
        </div>
    );
};