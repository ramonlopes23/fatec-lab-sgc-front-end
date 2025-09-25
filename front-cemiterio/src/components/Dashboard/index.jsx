import React, { useEffect, useState } from "react";
import { DashboardWrapper, Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction, Btn } from "./styles";
import { FaCross } from "react-icons/fa";
import { FaSkullCrossbones } from "react-icons/fa";
import { FaTools } from "react-icons/fa";
import api from "../../services/api";

export default function Dashboard() {

    const [processos, setProcessos] = useState([]);

    const icones = {
        Sepultamento: <FaCross />,
        Exumação: <FaSkullCrossbones />,
        Manutenção: <FaTools />
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [rFalecidos, rSep, rVel, rExu] = await Promise.all([
                    api.get("/falecidos"),
                    api.get("/sepultamentos"),
                    api.get("/velorios"),
                    api.get("/exumacoes"),
                ]);

                const falecidos = rFalecidos.data || [];
                const sep = (rSep.data || []).map(s => ({ ...s, _type: "Sepultamento" }));
                const vel = (rVel.data || []).map(v => ({ ...v, _type: "Velório" }));
                const exu = (rExu.data || []).map(x => ({ ...x, _type: "Exumação" }));

                const all = [...vel, ...sep, ...exu].map(item => {
                    const fk = item.falecido ?? item.falecido_id ?? item.falecidoId;
                    const f = falecidos.find(fr => String(fr.id) === String(fk));
                    return {
                        ...item,
                        nome_fal: item.nome_sep || item.nome_vel || item.nome_exu || (f ? (f.nome_fal || f.nome) : item.nome),
                        falecido: f || null
                    }
                })
                if (!mounted) return;
                setProcessos(all.sort((a, b) => (a.dh_sep || a.data_velorio || a.dh_exu || "").localeCompare(b.dh_sep || b.data_velorio || b.dh_exu || "")));
            } catch (err) {
                console.error("Erro ao carregar dashboard", err);
            }
        };
        load();
        return () => { mounted = false };
    }, []);

    const getScheduledDate = (item) => {
        const raw = item.dh_sep || item.data_velorio || item.dh_exu || item.data || item.horario || "";
        if (!raw) return null;

        if (typeof raw === "number") return new Date(raw);

        const s = String(raw).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            return new Date(`${s}T00:00:00`);
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
            const [day, month, rest] = s.split("/");
            const yearAndMaybeTime = rest;
            const [year, time] = yearAndMaybeTime.includes("") ? yearAndMaybeTime.split("") : [yearAndMaybeTime, "00:00:00"];
            const timePart = time.includes(":") ? time : "00:00:00";
            return new Date(`${year}-${month}-${day}T${timePart}`);
        }

        const parsed = new Date(s);
        return isNaN(parsed) ? null : parsed;
    };

    const isSameDay = (a, b = new Date()) => {
        if (!a) return false;
        const da = new Date(a);
        const db = new Date(b);
        return da.getFullYear() === db.getFullYear()
            && da.getMonth() === db.getMonth()
            && da.getDate() === db.getDate();
    };

    const processosHoje = processos.filter(p => {
        const d = getScheduledDate(p);
        return d && isSameDay(d);
    });

    const handleConfirm = async (item) => {

        try {
            setProcessos(prev => prev.filter(p => !(p._type === item._type && p.id === item.id)));
            if (item._type === "Velório") {
                await api.patch(`/velorios/${item.id}`, { status: "concluido", confirmado: true }).catch(() => { });
            } else if (item._type === "Sepultamento") {
                await api.patch(`/sepultamentos/${item.id}`, { status: "concluido", confirmado: true }).catch(() => { });
            } else if (item._type === "Exumação") {
                await api.patch(`/exumacoes/${item.id}`, { status: "concluido", confirmado: true }).catch(() => { });
            }

            const falId = item.falecido?.id ?? item.falecido ?? item.falecido_id ?? item.falecidoId ?? "";
            const payload = {
                nome_sep: item.nome_fal || item.nome || "",
                falecido: falId || undefined,
                falecido_id: falId || undefined,
                dh_sep: item.dh_sep || item.data_velorio || item.dh_exu || new Date().toISOString(),
                quadra_sep: item.quadra || item.quadra_sep || item.quadraId || "",
                num_sepultura_sep: item.num_sepultura || item.num_sepultura_sep || item.numero || "",
                tipo_sep: item.tipo_sep || item.tipo || "Cova",
                coveiro_sep: item.coveiro || item.funcionario || "",
                obs_sep: item.obs || item.obs_vel || item.obs_exu || ""
            };

            Object.keys(payload).forEach(k => {
                if (payload[k] === undefined || payload[k] === "") delete payload[k]
            });

            const created = await api.post("/sepultamentos", payload);
            console.log("Sepultamento criado: ", created.data);

            setProcessos(prev => prev.filter(p => !(p._type === item._type && p.id === item.id)));
            alert("Processo confirmado e sepultamento criado")
        } catch (err) {
            console.error("Erro ao confirmar processo / criar sepultamento", err);
            alert("Erro ao confirmar processo");
        }

        
    }
    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>PRÓXIMOS PROCESSOS AGENDADOS</CardHeader>
                <CardBody>
                    {processosHoje.length ? processosHoje.map((p) => (
                        <ProcessItem key={`${p._type}-${p.id}`}>
                            <ProcessInfo>
                                <strong>{p.nome_fal || p.nome}</strong>
                                {p._type === "Velório" && p.data_velorio && <span>Velorio:{p.data_velorio}</span>}
                                {p._type === "Exumação" && p.dh_exu && <span>Sepultamento: {p.dh_exu}</span>}
                                {p._type === "Sepultamento" && p.dh_sep && <span>Sepultamento: {p.dh_sep}</span>}
                            </ProcessInfo>
                            <ProcessAction>
                                {icones[p._type] || null}
                                <span style={{ marginLeft: 8 }}>{p._type}</span>
                                {p.local && <span> {p.local} </span>}
                                <Btn style={{ marginLeft: 12 }} onClick={() => handleConfirm(p)}>Confirmar conclusão</Btn>
                            </ProcessAction>
                        </ProcessItem>
                    )) : <div style={{ padding: 12 }}>Nenhum evento agendado para hoje.</div>}                </CardBody>
            </Card>
        </DashboardWrapper>

    )
}