import React, { useState, useEffect, useRef } from "react";
import { loadModel, runInference as runOnnx } from "./onnxrunner";
import * as ort from "onnxruntime-web";

const App: React.FC = () => {
  const [model, setModel] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<ort.InferenceSession | null>(null);
  const phaseRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef<boolean>(false);

  // Constants
  const TWO_PI = Math.PI * 2;
  const POINTS_COUNT = 1000;

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Load the ONNX model
  useEffect(() => {
    const fetchModel = async () => {
      try {
        modelRef.current = await loadModel("http://localhost:8000/sin.onnx");
        setModel(true);
      } catch (e) {
        setError(`Failed to load model: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    if (!modelRef.current) fetchModel();
  }, []);


  // Drawing function for visualizing the waveform
  const drawWaveform = (values: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw reference lines
    ctx.beginPath();
    ctx.strokeStyle = "#10b981"; // Emerald-400
    ctx.setLineDash([5, 3]);

    // +1 line (at 25% from top)
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width, height * 0.25);
    ctx.stroke();

    // -1 line (at 75% from top)
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();

    // Center line (0)
    ctx.beginPath();
    ctx.strokeStyle = "#9ca3af"; // Gray-400
    ctx.setLineDash([]);
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "#34d399"; // Light green for +1/-1
    ctx.font = "12px sans-serif";
    ctx.fillText("+1", 5, height * 0.25 - 5);
    ctx.fillText("-1", 5, height * 0.75 - 5);
    ctx.fillStyle = "#d1d5db"; // Light gray for "0"
    ctx.fillText("0", 5, height * 0.5 - 5);

    // Draw waveform
    if (values && values.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#60a5fa"; // Blue-400
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // Start at the first point
      const stepSize = width / (values.length - 1);
      const firstY = height * 0.5 - values[0] * height * 0.25; // Scale by 25% of height
      ctx.moveTo(0, firstY);

      // Draw the rest of the points
      for (let i = 1; i < values.length; i++) {
        const x = i * stepSize;
        const y = height * 0.5 - values[i] * height * 0.25; // Scale by 25% of height
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    }
  };

  // Run inference with animation frame
  useEffect(() => {
    if (!model || !running) return;

    let animationFrameId: number;

    const runInference = async () => {
      if (!runningRef.current) return; // <- Stop early if not running

      try {
        // Increment phase for animation
        phaseRef.current = (phaseRef.current + 0.05) % TWO_PI;

        // Create input data - sine wave pattern with shifting phase
        const inputValues = Array.from(
          { length: POINTS_COUNT },
          (_, i) => (phaseRef.current + i * 0.05) % TWO_PI
        );

        // Run ONNX model
        if (modelRef.current) {
          const result = await runOnnx(
            modelRef.current,
            { var_0: new Float32Array(inputValues) },
            { var_0: [POINTS_COUNT, 1] }
          );

          // Extract tensor data
          const tensor = result.var_1 ?? result.var_0;
          const tensorData = tensor?.data as Float32Array;

          if (tensorData) {
            const outputArray = Array.from(tensorData);
            setOutput(outputArray);
            drawWaveform(outputArray);
          }
        }




      } catch (e) {
        console.error("Inference error:", e);
        setError(`Inference failed: ${e instanceof Error ? e.message : String(e)}`);
        setRunning(false);
        runningRef.current = false; // sync ref immediately
        return;
      }



      if (runningRef.current) {
        animationFrameId = requestAnimationFrame(runInference);
      }
    };

    animationFrameId = requestAnimationFrame(runInference);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [model, running, POINTS_COUNT]);

  // Initialize canvas size on mount
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get the size of the parent element
      const parent = canvas.parentElement;
      if (!parent) return;

      // Set canvas dimensions to match parent, with device pixel ratio for sharpness
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // If we have output data, redraw the waveform
      if (output) {
        drawWaveform(output);
      } else {
        // Draw just the reference lines
        drawWaveform([]);
      }
    };

    // Initial size
    resizeCanvas();

    // Listen for window resize
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [output]);

  // (No changes to imports or function/component logic)

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-white">ONNX Visualizer</h1>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <button
            className={`px-4 py-2 rounded ${running ? "bg-red-500" : "bg-blue-600"} text-white`}
            onClick={() => setRunning(prev => !prev)}
            disabled={!model}
          >
            {running ? "Stop" : "Start"} Inference
          </button>
          <div className="text-sm text-gray-300">
            Status: {model ? (running ? "Running" : "Ready") : "Loading"}
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>

        {/* Chart area */}
        <div className="h-64 w-full border border-gray-700 p-4 bg-gray-900">
          <div className="relative h-full w-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />
            {(!model || (!running && !output)) && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                {model ? "Click `Start Inference` to see output" : "Loading model..."}
              </div>
            )}
          </div>
        </div>

        {/* Data points debug */}
        <div className="mt-2 text-xs text-gray-400">
          {output ?
            `Data points: ${output.length}, Sample values: [${output.slice(0, 3).map(v => v.toFixed(2)).join(', ')}...]` :
            'No data yet'}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-blue-400 mr-2"></div>
            <span>Model Output</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-green-400 mr-2"></div>
            <span>Reference Lines (±1)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;