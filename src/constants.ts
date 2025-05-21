import { type FunctionOption, type WaveformConfig } from "./types";

export const DEFAULT_CONFIG: WaveformConfig = {
    k: 0.01,
    phi0: 0,
    selectedFunction: 0,
    animationSpeed: 0.05,
    autoScale: true,
    manualYScale: 1.0,
};

export const FUNCTION_OPTIONS: FunctionOption[] = [
    { value: 0, label: "sin(k⋅x + φ₀)" },
    { value: 1, label: "sin²(k⋅x + φ₀)" },
    { value: 2, label: "sin³(k⋅x + φ₀)" },
];

export const CONSTANTS = {
    TWO_PI: Math.PI * 2,
    POINTS_COUNT: 1000,
    MODEL_URL: "https://burakssen.com/jaxfluids-frontend/sin.onnx",
};