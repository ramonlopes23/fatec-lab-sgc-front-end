import React, { useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
/* import api from "../../services/api"; */
import { useState, useRef } from "react";

const data = [
    { status: "Disponível", value: 30 },
    { status: "Ocupada", value: 15 },
    { status: "Indisponível", value: 3 },
    { status: "Particular", value: 4 },
    { status: "P/O", value: 30 }
]

const colors = [
    "#9e9e9e", "#000", "#c55", "#d2b24a", { fill: "#000", stroke: "#d2b24a", strokeWidth: 4 }
];

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default function PieChartSepulturas() {

    const [activeIndex, setActiveIndex] = useState(null);
    const [animFactor, setAnimFactor] = useState(1);
    const rafRef = useRef(null);

    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        const from = animFactor;
        const to = activeIndex === null ? 1 : 1.20;
        const duration = 220;
        const startTime = performance.now();

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const v = from + (to - from) * easeOutCubic(t);
            setAnimFactor(v);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        }

        rafRef.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(rafRef.current)
    }, [activeIndex]);

    const total = data.reduce((s, it) => s + (Number(it.value) || 0), 0);

    function renderActiveShape(props) {
        const {
            cx,
            cy,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value,
        } = props;

        const animatedOuter = outerRadius * animFactor;

        return (
            <g>
                <Sector cx={cx} cy={cy} innerRadius={innerRadius + 10} outerRadius={animatedOuter + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />

                <Sector cx={cx} cy={cy} innerRadius={animatedOuter + 6} outerRadius={animatedOuter + 12} startAngle={startAngle} endAngle={endAngle} fill={"rgba(0,0,0,0.06)"} />

                <text x={cx} y={cy - 8} textAnchor="middle" fill="#111" fontSize={12} fontWeight={600}>
                    {payload.status}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#333" fontSize={12}>
                    {value} ({(percent * 100).toFixed(1)}%)
                </text>
            </g>
        )
    }

    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <PieChart width={400} height={400}>
                    <Pie data={data} dataKey="value" nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        innerRadius={40}
                        paddingAngle={2}
                        label={false}
                        activeIndex={activeIndex ?? undefined}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {data.map((entry, index) => {
                            const colorEntry = colors[index % colors.length];
                            if (typeof colorEntry === "string") {
                                return <Cell key={index} fill={colorEntry} />
                            }
                            return <Cell key={index} {...colorEntry} />
                        })}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} (${((value / total) * 100).toFixed(1)}%)`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

