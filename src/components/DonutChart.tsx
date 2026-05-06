import React from 'react';

interface Segment {
    value: number;
    color: string;
    label: string;
}

interface DonutChartProps {
    segments: Segment[];
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
    centerValue?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
    segments,
    size = 180,
    strokeWidth = 18,
    centerLabel,
    centerValue,
}) => {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) {
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={cx} cy={cy} r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
                {centerValue && (
                    <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9"
                        fontSize={size * 0.14} fontWeight="700" fontFamily="Outfit, sans-serif">
                        {centerValue}
                    </text>
                )}
                {centerLabel && (
                    <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8"
                        fontSize={size * 0.075} fontFamily="Outfit, sans-serif">
                        {centerLabel}
                    </text>
                )}
            </svg>
        );
    }

    let offset = 0;
    const gap = 3; // small gap between segments in degrees

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none"
                stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />

            {segments.map((seg, i) => {
                const pct = seg.value / total;
                const dashLen = Math.max(0, pct * circumference - gap);
                const dashGap = circumference - dashLen;
                const strokeDasharray = `${dashLen} ${dashGap}`;
                const strokeDashoffset = -offset;
                offset += pct * circumference;

                return (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dasharray 0.6s ease',
                            filter: `drop-shadow(0 0 6px ${seg.color}60)`
                        }}
                    />
                );
            })}

            {/* Center text — counter-rotate */}
            <g style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
                {centerValue && (
                    <text x={cx} y={cy - (centerLabel ? 8 : 0)} textAnchor="middle"
                        fill="#f1f5f9" fontSize={size * 0.12} fontWeight="700"
                        fontFamily="Outfit, sans-serif">
                        {centerValue}
                    </text>
                )}
                {centerLabel && (
                    <text x={cx} y={cy + (centerValue ? 16 : 0)} textAnchor="middle"
                        fill="#94a3b8" fontSize={size * 0.07}
                        fontFamily="Outfit, sans-serif">
                        {centerLabel}
                    </text>
                )}
            </g>
        </svg>
    );
};

export default DonutChart;
