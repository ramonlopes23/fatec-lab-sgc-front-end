// ...existing code...
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardBody, CalendarGrid, DayCell, DayButton, Legend } from "./styles";
import { Btn } from "../Dashboard/styles";

export default function Calendar({ processos = [] }) {
  const hoje = new Date();
  const [anoMes, setAnoMes] = useState({ year: hoje.getFullYear(), month: hoje.getMonth() });
  const [open, setOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [sepultamentosDia, setSepultamentosDia] = useState([]);

  const eventosFonte = useMemo(() => {
    if (!processos || processos.length === 0) return [];
    return processos
      .map(p => {
        const dataRaw = p.dh_sep || p.data || p.dataSepultamento || "";
        const parseDateKey = (d) => {
          if (!d) return null;
          if (/^\d{4}-\d{2}-\d{2}/.test(String(d))) return String(d).slice(0,10);
          const parsed = new Date(d);
          if (isNaN(parsed)) return null;
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth()+1).padStart(2,'0');
          const day = String(parsed.getDate()).padStart(2,'0');
          return `${y}-${m}-${day}`;
        };
        const dataKey = parseDateKey(dataRaw);
        return {
          id: `${p._type ?? "proc"}-${p.id ?? p._id ?? Math.random().toString(36).slice(2,9)}`,
          nomeFalecido: p.nome_fal || p.nome || p.falecido?.nome || "—",
          data: dataKey,
          horario: p.horario || "",
          quadra: p.quadra_num ?? p.quadra_sep ?? p.quadra ?? "",
          cova: p.num_sepultura ?? p.num_cova ?? p.numero ?? "",
          status: p.status ?? "",
          reservada: !!(p.concessao && p.concessao.ativa) || false,
        };
      })
      .filter(e => !!e.data);
  }, [processos]);

  const corPorStatus = (status, reservada) => {
    const s = String(status || "").toLowerCase();
    if (reservada && s.includes("ocup")) return "#000000";
    if (reservada) return "#FFD700";
    if (s.includes("ocup")) return "#1C1C1C";
    if (s.includes("indispon")) return "#B22222";
    return "#A9A9A9";
  };

  const formatDateKey = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

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
  const nomesMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>CALENDÁRIO</CardHeader>
      <CardBody>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn onClick={voltarMes} aria-label="Mês anterior">◀</Btn>
            <div style={{ fontWeight: 600 }}>{nomesMes[anoMes.month]} {anoMes.year}</div>
            <Btn onClick={avancarMes} aria-label="Próximo mês">▶</Btn>
          </div>

          <Legend>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 12, height: 12, background: '#A9A9A9' }} /> <small>Disponível</small>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 12, height: 12, background: '#1C1C1C' }} /> <small>Ocupado</small>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 12, height: 12, background: '#FFD700' }} /> <small>Reservada</small>
            </div>
          </Legend>
        </div>

        <CalendarGrid>
          {nomesSemana.map(n => <div key={n} style={{ textAlign: "center", fontWeight: 600 }}>{n}</div>)}
          {semanasDoMes.map((sem, i) => (
            <React.Fragment key={i}>
              {sem.map((dia, idx) => {
                const key = formatDateKey(dia);
                const eventos = key ? (eventosPorData[key] || []) : [];
                const cor = eventos.length ? corPorStatus(eventos[0].status, eventos[0].reservada) : '#fff';
                return (
                  <DayCell key={idx} isCurrentMonth={!!dia}>
                    {dia ? (
                      <DayButton onClick={() => abrirDia(dia)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 600 }}>{dia.getDate()}</div>
                          <div style={{ width: 14, height: 14, borderRadius: 3, background: eventos.length ? cor : 'transparent', border: eventos.length ? '1px solid #ccc' : 'none' }} />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                          {eventos.slice(0,2).map(e => <div key={e.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nomeFalecido}</div>)}
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
                <h3 style={{ margin: 0 }}>Sepultamentos em {dataSelecionada}</h3>
                <button onClick={() => setOpen(false)}>Fechar</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {sepultamentosDia.length === 0 ? (
                  <div style={{ color: '#666' }}>Nenhum sepultamento registrado neste dia.</div>
                ) : sepultamentosDia.map(s => (
                  <div key={s.id} style={{ borderLeft: `4px solid ${corPorStatus(s.status, s.reservada)}`, padding: 10, marginBottom: 8, borderRadius: 4 }}>
                    <div style={{ fontWeight: 700 }}>{s.nomeFalecido}</div>
                    {s.horario ? <div style={{ color: '#555' }}>Horário: {s.horario}</div> : null}
                    <div style={{ color: '#555' }}>Quadra: {s.quadra} • Cova: {s.cova}</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#333' }}>{String(s.status)}{s.reservada ? ' • Reservada' : ''}</div>
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
// ...existing code...