import * as ort from "onnxruntime-web";

let cachedSession: ort.InferenceSession | null = null;

/**
 * Loads and caches the ONNX model. Only runs once.
 * @param modelUrl URL to the ONNX model
 */
async function loadModel(modelUrl: string): Promise<ort.InferenceSession> {
    if (cachedSession) return cachedSession;

    const response = await fetch(modelUrl);
    const arrayBuffer = await response.arrayBuffer();
    cachedSession = await ort.InferenceSession.create(arrayBuffer);

    return cachedSession;
}

/**
 * Runs inference on a preloaded session.
 * Handles scalar inputs as tensors with empty shape `[]`.
 * @param session ONNX InferenceSession
 * @param inputs Map of input tensors or raw numeric data (number or arrays)
 * @param inputShapes Shape definitions for raw inputs (use [] for scalars)
 */
async function runInference(
    session: ort.InferenceSession,
    inputs: Record<string, ort.Tensor | number | number[]>,
    inputShapes: Record<string, number[]>
): Promise<Record<string, ort.Tensor>> {
    try {
        const feeds: Record<string, ort.Tensor> = {};

        for (const name of session.inputNames) {
            const value = inputs[name];
            if (value === undefined || value === null) {
                throw new Error(`Missing input value for '${name}'`);
            }

            if (value instanceof ort.Tensor) {
                // Input is already a tensor, use as is
                feeds[name] = value;
            } else {
                // Raw data, need shape
                const shape = inputShapes[name];
                if (!shape) {
                    throw new Error(`Shape must be provided for input '${name}' if raw data is used.`);
                }

                let tensorData: Float32Array;

                if (shape.length === 0) {
                    // Scalar input: value must be a single number
                    if (typeof value !== "number") {
                        throw new Error(`Scalar input '${name}' must be a single number`);
                    }
                    tensorData = new Float32Array([value]);
                } else {
                    // For arrays, convert number[] to Float32Array
                    if (Array.isArray(value)) {
                        tensorData = new Float32Array(value);
                    } else {
                        throw new Error(`Input '${name}' must be an array matching shape ${shape}`);
                    }
                }

                feeds[name] = new ort.Tensor("float32", tensorData, shape);
            }
        }

        const results = await session.run(feeds);
        return results;

    } catch (e) {
        console.error("ONNX Runtime error:", e);
        throw e;
    }
}

export { loadModel, runInference };
