import React from "react";

export const Legend: React.FC = () => {
    return (
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center">
                <div className="w-4 h-1 bg-blue-400 mr-2 rounded-sm"></div>
                <span>Model Output</span>
            </div>
            <div className="flex items-center">
                <div className="w-4 h-1 bg-emerald-500 mr-2 rounded-sm"></div>
                <span>Reference Lines (±1)</span>
            </div>
        </div>
    );
};