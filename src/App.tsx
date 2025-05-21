import React, { useState } from "react";
import { type WaveformConfig } from "./types";
import { DEFAULT_CONFIG } from "./constants";
import { useOnnxModel } from "./hooks/useOnnxModel";
import { ControlPanel } from "./components/ControlPanel";
import { WaveformCanvas } from "./components/WaveformCanvas";
import { DataDisplay } from "./components/DataDisplay";
import { Legend } from "./components/Legend";

const App: React.FC = () => {
  const [config, setConfig] = useState<WaveformConfig>(DEFAULT_CONFIG);
  const { modelState, startInference, stopInference, resetModel } = useOnnxModel(config);

  const handleConfigChange = (newConfig: Partial<WaveformConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    resetModel();
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-900 text-white font-sans">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">
          ONNX Waveform Visualizer
        </h1>

        <ControlPanel
          config={config}
          modelState={modelState}
          onConfigChange={handleConfigChange}
          onStart={startInference}
          onStop={stopInference}
          onReset={handleReset}
        />

        <WaveformCanvas config={config} modelState={modelState} />

        <DataDisplay modelState={modelState} />

        <Legend />
      </div>

      <footer className="text-center py-4 mt-auto">
        <p className="text-xs text-gray-500">ONNX Runtime Web Visualizer</p>
      </footer>
    </div>
  );
};

export default App;