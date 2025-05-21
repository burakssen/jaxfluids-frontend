import React from "react";
import { type ModelState } from "../types";

interface DataDisplayProps {
    modelState: ModelState;
}

export const DataDisplay: React.FC<DataDisplayProps> = ({ modelState }) => {
    return (
        <div className="mt-4 text-xs text-gray-400">
            {modelState.output ? (
                `Data points: ${modelState.output.length}, Sample values: [${modelState.output
                    .slice(0, 3)
                    .map(v => v.toFixed(3))
                    .join(', ')}...], 
         Range: [${Math.min(...modelState.output).toFixed(3)}, ${Math.max(...modelState.output).toFixed(3)}]`
            ) : (
                'No data yet. Click "Start Inference".'
            )}
        </div>
    );
};