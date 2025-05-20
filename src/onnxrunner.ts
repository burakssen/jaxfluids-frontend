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
 * @param session ONNX InferenceSession
 * @param inputs Map of input tensors or raw arrays
 * @param inputShapes Shape definitions for raw inputs
 */
async function runInference(
    session: ort.InferenceSession,
    inputs: Record<string, ort.Tensor | ort.Tensor.DataType>,
    inputShapes: Record<string, number[]>
): Promise<Record<string, ort.Tensor>> {
    try {
        const feeds: Record<string, ort.Tensor> = {};

        for (const name of session.inputNames) {
            const value = inputs[name];
            if (!value) throw new Error(`Missing input value for '${name}'`);

            if (value instanceof ort.Tensor) {
                feeds[name] = value;
            } else {
                const shape = inputShapes[name];
                if (!shape) throw new Error(`Shape must be provided for input '${name}' if raw data is used.`);
                feeds[name] = new ort.Tensor("float32", value as ort.Tensor.DataType, shape);
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
