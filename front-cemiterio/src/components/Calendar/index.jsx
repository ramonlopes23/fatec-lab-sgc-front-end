import React, { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardBody, CalendarGrid, DayCell, DayButton, Btn, Title } from "./styles";


export default function Calendar({ sepultamentos = [], quadras = [] }) {
    const hoje = new Date();
    const [anoMes, setAnoMes] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
    const [open, setOpen] = useState(false);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [sepultamentosDia, setSepultamentosDia] = useState([]);

    const formatDateKey = (date) => {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const parseToDateKey = (raw) => {
        if (!raw) return null;
        const s = String(raw).trim()
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
        if (/\d{2}\/\d{2}\/\d{4}/.test(s)) {
            const datePart = s.split(' ')[0];
            const [dd, mm, yyyy] = datePart.split('/');
            if (dd && mm && yyyy) return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }

        const parsed = new Date(s);
        if (!isNaN(parsed)) return formatDateKey(parsed);
        return null;
    }


    const quadraMap = useMemo(() => {
        const m = {};
        (quadras || []).forEach(q => {
            const id = q.id ?? q._id ?? q.codigo ?? q.key;
            if (id != null) m[String(id)] = q.num_quadra ?? q.numero ?? q.nome ?? String(id);
        });
        return m;
    }, [quadras]);


    const eventosFonte = useMemo(() => {
        const sources = [
            ...(sepultamentos || []),
            ...(quadras || []),
        ];

        return sources
            .map((s) => {
                const dataKey = parseToDateKey(s.dh_sep || s.data_sep || s.data || "");
                const horario = (() => {
                    const raw = s.dh_sep || "";
                    if (!raw) return "";
                    const parts = String(raw).split(" ");
                    if (parts.length === 1 && raw.includes("T")) {
                        return raw.split("T")[1].slice(0, 5);
                    }
                    return parts[1] || "";
                })();

                return {
                    id: `evt-${s.id ?? s._id ?? Math.random().toString(36).slice(2, 9)}`,
                    nomeFalecido: s.nome_sep || s.nome || s.falecido?.nome || "—",
                    data: dataKey,
                    horario,
                    quadra: (() => {
                        let candidate = s.num_quadra ?? s.quadra_sep ?? s.quadra ?? s.quadra_num ?? s.quadraId ?? s.quadra_id ?? "";
                        if (candidate && typeof candidate === "object") {
                            candidate = candidate.num_quadra ?? candidate.id ?? candidate._id ?? candidate.codigo ?? candidate.key ?? "";
                        }
                        const candidateStr = candidate != null ? String(candidate) : "";
                        return quadraMap[candidateStr] ?? candidateStr;
                    })(),
                    cova: s.num_sepultura_sep ?? s.num_sepultura ?? s.num_cova ?? "",
                    status: s.status ?? "",
                };
            })
            .filter((e) => !!e.data);
    }, [sepultamentos, quadras, quadraMap])

  /*   useEffect(()=>{
        console.log("quadraMap", quadraMap);
        console.log("sepultamentos", sepultamentos);
        console.log("eventosFonte", eventosFonte.slice(0,10));
    }, [quadraMap, sepultamentos, eventosFonte]); */

    const eventosPorData = useMemo(() => {
        const map = {};
        eventosFonte.forEach((s) => {
            map[s.data] = map[s.data] || [];
            map[s.data].push(s);
        });
        return map;
    }, [eventosFonte]);

    const semanasDoMes = useMemo(() => {
        const { year, month } = anoMes;
        const primeiro = new Date(year, month, 1);
        const ultimo = new Date(year, month + 1, 0);
        const primeiraSemanaDia = primeiro.getDay();
        const totalDias = ultimo.getDate();
        const dias = [];
        for (let i = 0; i < primeiraSemanaDia; i++) dias.push(null);
        for (let d = 1; d <= totalDias; d++) dias.push(new Date(year, month, d));
        while (dias.length % 7 !== 0) dias.push(null);
        const semanas = [];
        for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));
        return semanas;
    }, [anoMes]);

    const abrirDia = (date) => {
        const key = formatDateKey(date);
        setDataSelecionada(key);
        setSepultamentosDia(eventosPorData[key] || []);
        setOpen(true);
    };

    const voltarMes = () => setAnoMes(s => {
        const m = s.month - 1;
        if (m < 0) return { year: s.year - 1, month: 11 };
        return { year: s.year, month: m };
    });
    const avancarMes = () => setAnoMes(s => {
        const m = s.month + 1;
        if (m > 11) return { year: s.year + 1, month: 0 };
        return { year: s.year, month: m };
    });

    useEffect(() => {
        if (!open) {
            setDataSelecionada(null);
            setSepultamentosDia([]);
        }
    }, [open]);

    const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const nomesMes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <Card style={{ marginTop: 16 }}>
            <CardHeader>CALENDÁRIO DE SEPULTAMENTOS</CardHeader>
            <CardBody>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 600 }}>{nomesMes[anoMes.month]} {anoMes.year}</div>
                        <Btn onClick={voltarMes} aria-label="Mês anterior">◀</Btn>
                        <Btn onClick={avancarMes} aria-label="Próximo mês">▶</Btn>
                    </div>
                </div>

                <CalendarGrid>
                    {nomesSemana.map((n) => (<div key={n} style={{ textAlign: "center", fontWeight: 600 }}>{n}</div>))}
                    {semanasDoMes.map((sem, i) => (
                        <React.Fragment key={i}>
                            {sem.map((dia, idx) => {
                                const key = formatDateKey(dia);
                                const eventos = key ? eventosPorData[key] || [] : [];
                                return (
                                    <DayCell key={key ?? `${i}-${idx}`} isCurrentMonth={!!dia}>
                                        {dia ? (
                                            <DayButton onClick={() => abrirDia(dia)} aria-label={`Abrir ${key ?? `${i}-${idx}`}`}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontWeight: 600 }}>{dia.getDate()}</div>
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                                    {eventos.slice(0, 2).map(e => <div key={e.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nomeFalecido}</div>)}
                                                </div>
                                            </DayButton>
                                        ) : null}
                                    </DayCell>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </CalendarGrid>

                {open && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                        <div style={{ width: 560, maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: 8, padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Title style={{ margin: 0 }}>Sepultamentos em {dataSelecionada}</Title>
                                <Btn onClick={() => setOpen(false)}>Fechar</Btn>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                {sepultamentosDia.length === 0 ? (
                                    <div style={{ color: '#666' }}>Nenhum sepultamento registrado neste dia.</div>
                                ) : sepultamentosDia.map(s => (
                                    <div key={s.id ?? s._id ?? `${dataSelecionada}-${s.quadra}-${s.cova}`} style={{ marginBottom: 12 }}>
                                        <div style={{ fontWeight: 700 }}>{s.nomeFalecido}</div>
                                        {s.horario ? <div style={{ color: '#555' }}>Horário: {s.horario}</div> : null}
                                        <div style={{ color: '#555' }}>Quadra: {s.quadra} • Cova: {s.cova}</div>
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#333' }}>{String(s.status)}{s.reservada ? ' • Particular' : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}