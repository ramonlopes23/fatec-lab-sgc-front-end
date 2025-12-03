import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";


const data = [
    { status: "Disponível", value: 30 },
    { status: "Ocupada", value: 15 },
    { status: "Indisponível", value: 3 },
    { status: "Particular", value: 4 },
    { status: "Particular e ocupada", value: 30 }
]

const colors = [
    "#9e9e9e", "#000", "#c55", "#d2b24a", { fill: "#000", stroke: "#d2b24a", strokeWidth: 3 }
]

function PieChartSepulturas() {
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
                        label
                    >
                        {data.map((entry, index) => {
                            const colorEntry = colors[index % colors.length];
                            if (typeof colorEntry === "string") {
                                return <Cell key={index} fill={colorEntry} />
                            }
                            return <Cell key={index} {...colorEntry} />
                        })}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PieChartSepulturas;