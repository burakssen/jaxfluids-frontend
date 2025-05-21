import React from "react";
import { type WaveformConfig, type ModelState } from "../types";
import { FUNCTION_OPTIONS } from "../constants";

interface ControlPanelProps {
    config: WaveformConfig;
    modelState: ModelState;
    onConfigChange: (config: Partial<WaveformConfig>) => void;
    onStart: () => void;
    onStop: () => void;
    onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    config,
    modelState,
    onConfigChange,
    onStart,
    onStop,
    onReset,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column: Main Controls & Status */}
            <div className="space-y-4 p-4 bg-gray-700 rounded-md">
                <div className="flex gap-2">
                    <button
                        className={`flex-1 px-4 py-2.5 rounded-md font-semibold transition-colors duration-150 ease-in-out
                        ${modelState.isRunning ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        ${!modelState.isLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={modelState.isRunning ? onStop : onStart}
                        disabled={!modelState.isLoaded}
                    >
                        {modelState.isRunning ? "Stop Inference" : "Start Inference"}
                    </button>
                    <button
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold transition-colors duration-150 ease-in-out"
                        onClick={onReset}
                        title="Reset all parameters to defaults"
                    >
                        Reset
                    </button>
                </div>

                <div className="text-sm text-gray-300">
                    Status: {modelState.isLoaded ? (modelState.isRunning ? "Running..." : "Ready") : "Loading model..."}
                </div>

                {modelState.error && (
                    <div className="text-red-400 text-sm p-2 bg-red-900 bg-opacity-30 rounded-md">
                        {modelState.error}
                    </div>
                )}

                {/* Animation Speed */}
                <div>
                    <label htmlFor="speed_slider" className="block text-sm font-medium text-gray-300">
                        Animation Speed: {config.animationSpeed.toFixed(2)}
                    </label>
                    <input
                        id="speed_slider"
                        type="range"
                        min={0.01}
                        max={0.2}
                        step="0.01"
                        value={config.animationSpeed}
                        onChange={(e) => onConfigChange({ animationSpeed: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={!modelState.isLoaded}
                    />
                </div>

                {/* Scaling Controls */}
                <div className="pt-1 border-t border-gray-600">
                    <div className="flex items-center mb-2">
                        <input
                            id="auto_scale"
                            type="checkbox"
                            checked={config.autoScale}
                            onChange={(e) => onConfigChange({ autoScale: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="auto_scale" className="ml-2 text-sm font-medium text-gray-300">
                            Auto-scale Y axis
                        </label>
                    </div>
                    {!config.autoScale && (
                        <div>
                            <label htmlFor="scale_slider" className="block text-sm font-medium text-gray-300">
                                Y Scale: {config.manualYScale.toFixed(2)}x
                            </label>
                            <input
                                id="scale_slider"
                                type="range"
                                min={0.1}
                                max={5.0}
                                step="0.1"
                                value={config.manualYScale}
                                onChange={(e) => onConfigChange({ manualYScale: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Parameter Controls */}
            <div className="space-y-4 p-4 bg-gray-700 rounded-md">
                {/* k Slider */}
                <div>
                    <label htmlFor="k_slider" className="block text-sm font-medium text-gray-300">
                        k: {(config.k / Math.PI).toFixed(2)} π (Frequency Factor)
                    </label>
                    <input
                        id="k_slider"
                        type="range"
                        min={2 * Math.PI}
                        max={8 * Math.PI}
                        step={0.01}
                        value={config.k}
                        onChange={(e) => onConfigChange({ k: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={!modelState.isLoaded}
                    />
                </div>

                {/* phi_0 Slider */}
                <div>
                    <label htmlFor="phi0_slider" className="block text-sm font-medium text-gray-300">
                        φ₀: {(config.phi0 / Math.PI).toFixed(2)} π (Phase Shift)
                    </label>
                    <input
                        id="phi0_slider"
                        type="range"
                        min={0}
                        max={8 * Math.PI}
                        step={0.01}
                        value={config.phi0}
                        onChange={(e) => onConfigChange({ phi0: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={!modelState.isLoaded}
                    />
                </div>

                {/* Function Select */}
                <div>
                    <label htmlFor="function_select" className="block text-sm font-medium text-gray-300">
                        Function:
                    </label>
                    <select
                        id="function_select"
                        value={config.selectedFunction}
                        onChange={(e) => onConfigChange({ selectedFunction: parseInt(e.target.value) })}
                        className="w-full p-2 mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                        disabled={!modelState.isLoaded}
                    >
                        {FUNCTION_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-gray-700 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};