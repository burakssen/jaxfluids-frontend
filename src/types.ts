export interface WaveformConfig {
    k: number;
    phi0: number;
    selectedFunction: number;
    animationSpeed: number;
    autoScale: boolean;
    manualYScale: number;
}

export interface FunctionOption {
    value: number;
    label: string;
}

export interface ModelState {
    isLoaded: boolean;
    isRunning: boolean;
    output: number[] | null;
    error: string | null;
}