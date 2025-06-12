import React, { useEffect } from 'react';
import { Box, Rating } from '@mui/material';

// SVG personalizzato per cerchi con dimensione progressiva
const CircleIcon = React.forwardRef(function CircleIcon(props, ref) {
    const { value, selectedValue, ownerState, ...other } = props;

    const strokeWidth = 3;
    const size = 15 + (value - 1) * 10;
    const svgSize = size + strokeWidth * 2;
    const isFilled = value <= selectedValue;
    return (
        <div className='rating-span'>
            <span ref={ref} {...other}>
                <svg className='rating' height={svgSize} width={svgSize}>
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={svgSize / 2 - strokeWidth}
                        stroke="#DE7E00"
                        strokeWidth={strokeWidth}
                        fill={isFilled ? '#DE7E00' : 'none'} // solo selezionati sono riempiti
                    />
                </svg>
            </span>
        </div>
    );
});

export default function CircleRating({ storageKey, onChange }) {
    const [value, setValue] = React.useState(() => {
        if (!storageKey) return 0;
        const saved = localStorage.getItem(storageKey);
        return saved !== null ? Number(saved) : 0;
    });
    const maxRating = 6;

    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, value);
            localStorage.setItem("storageKey", storageKey);
        }
        if (onChange) {
            onChange(value);
        }
    }, [value]);

    console.log(value);
    return (
        <Box>
            <Rating
                className="circle-rating"
                value={value}
                max={maxRating}
                onChange={(event, newValue) => setValue(newValue ?? 0)}
                slots={{
                    icon: CircleIcon,
                }}
                slotProps={{
                    icon: {
                        key: value,
                        selectedValue: value,
                    },
                }}
            />
        </Box>
    );
}
