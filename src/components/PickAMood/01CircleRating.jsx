import React, { useEffect } from "react";
import safeStorage from "../../../safeStorage";

export default function CircleRating({ storageKey, onChange }) {
    
    const [value, setValue] = React.useState(() => {
        if (!storageKey) return 0;
        const saved = safeStorage.getItem(storageKey);
        return saved !== null ? Number(saved) : 0;
    });

    const maxRating = 6;

    useEffect(() => {
        if (storageKey) {
            safeStorage.setItem(storageKey, value.toString());
            safeStorage.setItem("storageKey", storageKey);
        }
        if (onChange) {
            onChange(value);
        }
    }, [value, storageKey, onChange]);

    return (
        <div className="box-rating" /* style={{ display: "flex", gap: "8px", justifyContent: "center" }} */>
            {Array.from({ length: maxRating }, (_, i) => {
                const index = i + 1;
                return (
                    <CircleIcon
                        key={index}
                        iconIndex={index}
                        filled={index <= value}
                        onClick={() => setValue(index)}
                    />
                );
            })}
        </div>
    );
}

const CircleIcon = ({ iconIndex = 1, filled, onClick }) => {
    const strokeWidth = 3;
    const size = 15 + (iconIndex - 1) * 10;
    const svgSize = size + strokeWidth * 2;

    return (
        <div className='rating-span'>
            <svg
                onClick={onClick}
                height={svgSize}
                width={svgSize}
                style={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                }}
            >
                <circle
                    cx={svgSize / 2}
                    cy={svgSize / 2}
                    r={svgSize / 2 - strokeWidth}
                    stroke="#DE7E00"
                    strokeWidth={strokeWidth}
                    fill={filled ? "#DE7E00" : "none"}
                />
            </svg>
        </div>
    );
};
