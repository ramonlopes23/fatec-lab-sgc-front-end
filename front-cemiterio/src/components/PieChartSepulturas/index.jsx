import React, { useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import api from "../../services/api";
import { useState, useRef, useMemo } from "react";


const colors = [
    "#9e9e9e", "#000", "#c55", "#d2b24a", { fill: "#000", stroke: "#d2b24a", strokeWidth: 4 }
];

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default function PieChartSepulturas() {

    const [covas, setCovas] = useState([]);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [animFactor, setAnimFactor] = useState(1);
    const rafRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        Promise.all([
            api.get("/covas"),
            api.get("/sepultamentos"),
        ])
            .then(([rCovas, rSep]) => {
                if (!mounted) return;
                setCovas(Array.isArray(rCovas.data) ? rCovas.data : []);
                setSepultamentos(Array.isArray(rSep.data) ? rSep.data : []);
            })
            .catch((err) => {
                if (!mounted) return;
                console.error("Erro ao carregar dados do gráfico:", err);
                setCovas([]);
                setSepultamentos([]);
            })
            .finally(() => mounted && setLoading(false));

        return () => (mounted = false);
    }, []);

    const data = useMemo(() => {
        const counts = {
            disponivel: 0,
            ocupada: 0,
            indisponivel: 0,
            particular: 0,
            particular_ocupada: 0,
        };

        const sepCountByCova = {};

        const covaMap = new Map();
        (covas || []).forEach(cova => {
            const key = `${cova.quadra_cova || ""}-${cova.num_cova || ""}`;
            covaMap.set(key, cova);
        })
/* 
        const sepMap = new Map(); */
        const visibleSep = (sepultamentos || []).filter(s => !s.foi_exumado);
        visibleSep.forEach(sep => {
            const quadraKey = String(sep.quadra ?? sep.quadra_sep);
            const numero = String(sep.num_sepultura_sep ?? "");
            const key = `${quadraKey}-${numero}`;

            if (!sepCountByCova[key]) {
                sepCountByCova[key] = new Set();
            }
            const sepId = sep.id ?? sep._id ?? null;
            if (sepId != null) {
                sepCountByCova[key].add(String(sepId));
            } else {
                sepCountByCova[key].add(`${quadraKey}-${numero}-${sep.dh_sep ?? ""}`);
            }
        });

        const sepCountNumeric = {};
        Object.keys(sepCountByCova).forEach(key => {
            sepCountNumeric[key] = sepCountByCova[key].size;
        });

        (covas || []).forEach(cova => {
            const quadraKey = String(cova.quadra_cova ?? cova.quadra ?? "");
            const numero = String(cova.num_cova ?? cova.numero ?? "");
            const key = `${quadraKey}-${numero}`;
            const covaStatus = String(cova.status || "").toLowerCase();

            if (covaStatus.includes("indispon")) {
                counts.indisponivel++;
                return;
            }

            const sepCount = sepCountNumeric[key] ?? 0;
            const capacidadeNum = Number(cova.capacidade ?? 0);
            const capacidadeTotal = capacidadeNum + sepCount;

            const sep = visibleSep.find(s =>
                String(s.quadra_sep ?? s.quadra ?? "") === quadraKey &&
                String(s.num_sepultura_sep ?? s.num_sepultura ?? "") === numero
            )
            const hasTitulo = sep && String(sep.titulo_posse ?? "").toLowerCase() === "sim";


            if (capacidadeTotal > 0) {
                if (sepCount >= capacidadeTotal) {
                    counts.ocupada++;
                }
                if (hasTitulo && sepCount >= capacidadeTotal) {
                    counts.particular_ocupada++;
                } else if (hasTitulo) {
                    counts.particular++
                } else {
                    counts.disponivel++
                }
            } else {
                counts.disponivel++
            }
        });

        return [
            { status: "Disponível", value: counts.disponivel },
            { status: "Ocupada", value: counts.ocupada },
            { status: "Indisponivel", value: counts.indisponivel },
            { status: "Particular", value: counts.particular },
            { status: "P/O", value: counts.particular_ocupada },
        ]
    }, [covas, sepultamentos]);

    /* const normalizeStatus = (s) => {
        if (!s) return "disponivel";
        const raw = String(s).toLowerCase();
        if (raw.includes("reserv")) return "reservada";
        if (raw.includes("indispon")) return "indisponivel";
        if (raw.includes("ocup")) return "ocupada";
        if (raw === "livre" || raw === "disponivel" || raw === "disponível") return "disponível";
        return raw;
    }

    const covaMap = new Map();
    (covas || []).forEach(cova => {
        const key = `${cova.quadra_cova || ""}-${cova.num_cova || ""}`;
        const cap = cova.capacidade == null ? null : Number(cova.capacidade);
        const status = cap !== null && !isNaN(cap) && cap <= 0 ? "lotada" : normalizeStatus(cova.status);
        covaMap.set(key, { ...cova, normalizeStatus: status });
    })

    const visibleSep = (sepultamentos || []).filter(s => !s.foi_exumado);
    visibleSep.forEach(sep => {
        const quadraKey = String(sep.quadra_sep ?? "");
        const numero = String(sep.num_sepultura_sep ?? "");
        const key = `${quadraKey}-${numero}`;

        const titulo_posse = String(sep.titulo_posse ?? "").toLowerCase() === "sim";
        const confirmed = sep.confirmado === true || String(sep.confirmado).toLowerCase() === "true";
        const sepIsConcluded = confirmed || String(sep.status ?? "").toLowerCase().includes("concl");

        const existing = covaMap.get(key);
        if (existing) {
            if (sepIsConcluded) {
                existing.normalizedStatus = "ocupada";
            } else if (titulo_posse && existing.normalizedStatus !== "ocupada") {
                existing.normalizedStatus = "reservada";
            }
        } else {
            covaMap.set(key, {
                normalizedStatus: titulo_posse ? "reservada" : (sepIsConcluded ? "ocupada" : "ocupada")
            });
        }
    });
 */
    /*   covaMap.forEach((cova) => {
          const s = String(cova.normalizedStatus || "").toLowerCase();
          const hasTitulo = !!(cova.sep && String(cova.sep.titulo_posse ?? "").toLowerCase() === "sim");
          const isOcupada = s.includes("ocup");
  
          if (isOcupada && hasTitulo) {
              counts.particular_ocupada++;
          } else if (s.includes("ocup")) {
              counts.ocupada++;
          } else if (s.includes("reserv") || s.includes("particular")) {
              counts.particular++;
          } else if (s.includes("indispon")) {
              counts.indisponivel++;
          } else {
              counts.disponivel++;
          }
      });
   */


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

    if (loading) {
        return (
            <div style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#666" }}>Carregando...</p>
            </div>
        );
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

