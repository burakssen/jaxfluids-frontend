import { useState, useEffect, useRef } from "react";
import { loadModel, runInference as runOnnx } from "../onnxrunner";
import * as ort from "onnxruntime-web";
import { type ModelState, type WaveformConfig } from "../types";
import { CONSTANTS } from "../constants";

export const useOnnxModel = (config: WaveformConfig) => {
    const [modelState, setModelState] = useState<ModelState>({
        isLoaded: false,
        isRunning: false,
        output: null,
        error: null,
    });

    const modelRef = useRef<ort.InferenceSession | null>(null);
    const phaseRef = useRef<number>(0);
    const runningRef = useRef<boolean>(false);

    // Load model
    useEffect(() => {
        const fetchModel = async () => {
            try {
                modelRef.current = await loadModel(CONSTANTS.MODEL_URL);
                setModelState(prev => ({ ...prev, isLoaded: true, error: null }));
            } catch (e) {
                setModelState(prev => ({
                    ...prev,
                    error: `Failed to load model: ${e instanceof Error ? e.message : String(e)}`
                }));
            }
        };

        if (!modelRef.current) fetchModel();
    }, []);

    // Sync running state
    useEffect(() => {
        runningRef.current = modelState.isRunning;
    }, [modelState.isRunning]);

    // Animation loop
    useEffect(() => {
        if (!modelState.isLoaded || !modelState.isRunning) return;

        let animationFrameId: number;

        const runInference = async () => {
            if (!runningRef.current) return;

            try {
                // Increment phase for animation
                phaseRef.current = (phaseRef.current + config.animationSpeed) % CONSTANTS.TWO_PI;

                // Generate seamless input data
                const inputValues = Array.from(
                    { length: CONSTANTS.POINTS_COUNT },
                    (_, i) => {
                        const basePosition = (i / CONSTANTS.POINTS_COUNT) * CONSTANTS.TWO_PI;
                        return (basePosition + phaseRef.current) % CONSTANTS.TWO_PI;
                    }
                );

                // Run ONNX model
                if (modelRef.current) {
                    const result = await runOnnx(
                        modelRef.current,
                        {
                            var_0: inputValues,
                            var_1: config.k,
                            var_2: config.phi0,
                            var_3: config.selectedFunction
                        },
                        { var_0: [CONSTANTS.POINTS_COUNT, 1], var_1: [], var_2: [], var_3: [] }
                    );

                    const tensor = result.var_4 ?? result.var_0;
                    const tensorData = tensor?.data as Float32Array;

                    if (tensorData) {
                        const outputArray = Array.from(tensorData);
                        setModelState(prev => ({ ...prev, output: outputArray, error: null }));
                    }
                }
            } catch (e) {
                console.error("Inference error:", e);
                setModelState(prev => ({
                    ...prev,
                    error: `Inference failed: ${e instanceof Error ? e.message : String(e)}`,
                    isRunning: false
                }));
                runningRef.current = false;
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
    }, [modelState.isLoaded, modelState.isRunning, config]);

    const startInference = () => {
        setModelState(prev => ({ ...prev, isRunning: true }));
    };

    const stopInference = () => {
        setModelState(prev => ({ ...prev, isRunning: false }));
        runningRef.current = false;
    };

    const resetModel = () => {
        stopInference();
        phaseRef.current = 0;
        setModelState(prev => ({ ...prev, output: null, error: null }));
    };

    return {
        modelState,
        startInference,
        stopInference,
        resetModel,
    };
};