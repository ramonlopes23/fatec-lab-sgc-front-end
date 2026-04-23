import React, { useEffect, useRef, useState } from "react";
import { DashboardWrapper, Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction, Btn } from "./styles";
import { FaCross, FaSkullCrossbones, FaTools } from "react-icons/fa";
import api from "../../services/api";

export default function Dashboard() {
    const [processos, setProcessos] = useState([]);
    const mountedRef = useRef(true);

    const icones = {
        Sepultamento: <FaCross />,
        Exumacao: <FaSkullCrossbones />,
        Manutencao: <FaTools />,
    };

    const normalizeText = (value) =>
        String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const loadProcessos = async () => {
        try {
            const [rFalecidos, rSep, rVel, rExu, rQuadras] = await Promise.all([
                api.get("/falecidos"),
                api.get("/sepultamentos"),
                api.get("/velorios"),
                api.get("/exumacoes"),
                api.get("/quadras"),
            ]);

            const falecidos = rFalecidos.data || [];
            const sep = (rSep.data || []).map((item) => ({ ...item, _type: "Sepultamento" }));
            const vel = (rVel.data || []).map((item) => ({ ...item, _type: "Velorio" }));
            const exu = (rExu.data || []).map((item) => ({ ...item, _type: "Exumacao" }));
            const quadras = rQuadras.data || [];

            const all = [...vel, ...sep, ...exu].map((item) => {
                const fk = item.falecido ?? item.falecido_id ?? item.falecidoId;
                const falecido = falecidos.find((registro) => String(registro.id) === String(fk));

                let quadra_num = null;
                if (item._type === "Sepultamento") {
                    const qKey = item.quadra_sep ?? item.quadra ?? item.quadra_cova ?? null;
                    const qObj = quadras.find((quadra) =>
                        String(quadra.id) === String(qKey)
                        || String(quadra.num_quadra) === String(qKey)
                        || (quadra.nome && String(quadra.nome).endsWith(String(qKey)))
                    );
                    quadra_num = qObj ? (qObj.num_quadra ?? qObj.id) : (qKey ?? null);
                }

                const num_sepultura = item.num_sepultura_sep ?? item.num_sepultura ?? item.numero ?? item.num_cova ?? null;

                return {
                    ...item,
                    nome_fal: item.nome_sep || item.nome_vel || item.nome_exu || (falecido ? (falecido.nome_fal || falecido.nome) : item.nome),
                    falecido: falecido || null,
                    quadra_num,
                    num_sepultura,
                };
            });

            if (!mountedRef.current) return;

            const active = all.filter((item) => {
                const status = normalizeText(item.status);
                const confirmed = item.confirmado === true || item.confirmado === "true";
                return !(status === "concluido" || confirmed);
            });

            setProcessos(
                active.sort((a, b) =>
                    (a.dh_sep || a.data_velorio || a.dh_exu || "").localeCompare(
                        b.dh_sep || b.data_velorio || b.dh_exu || ""
                    )
                )
            );
        } catch (err) {
            console.error("Erro ao carregar dashboard", err);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        window._loadDashboardProcessos = loadProcessos;
        loadProcessos();

        try {
            const saved = JSON.parse(localStorage.getItem("local_processos") || "[]");
            if (Array.isArray(saved) && saved.length) {
                setProcessos((prev) => [...saved, ...prev]);
            }
        } catch (e) {
            console.warn("Erro ao ler local_processos", e);
        }

        const onCreated = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            setProcessos((prev) => [item, ...prev]);
        };

        const onLocal = (ev) => {
            const item = ev?.detail;
            if (!item) return;
            setProcessos((prev) => [item, ...prev]);
        };

        window.addEventListener("processoCriado", onCreated);
        window.addEventListener("processoCriadoLocal", onLocal);

        return () => {
            mountedRef.current = false;
            window.removeEventListener("processoCriado", onCreated);
            window.removeEventListener("processoCriadoLocal", onLocal);
        };
    }, []);

    const getScheduledDate = (item) => {
        const raw = item.dh_sep || item.data_velorio || item.dh_exu || item.data || item.horario || "";
        if (!raw) return null;
        if (typeof raw === "number") return new Date(raw);

        const value = String(raw).trim();

        if (/^\d{4}-\d{2}-\d{2}([T\s].*)?$/.test(value)) {
            const iso = value.includes("T") ? value : `${value}T00:00:00`;
            const parsed = new Date(iso);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?$/);
        if (brMatch) {
            const [, day, month, year, time] = brMatch;
            const timePart = time || "00:00:00";
            const parsed = new Date(`${year}-${month}-${day}T${timePart}`);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const isSameDay = (a, b = new Date()) => {
        if (!a) return false;
        const da = new Date(a);
        const db = new Date(b);
        return da.getFullYear() === db.getFullYear()
            && da.getMonth() === db.getMonth()
            && da.getDate() === db.getDate();
    };

    const processosHoje = processos.filter((item) => {
        const date = getScheduledDate(item);
        return date && isSameDay(date);
    });

    const handleConfirm = async (item) => {
        let sepId = null;

        try {
            setProcessos((prev) => prev.filter((current) => !(current._type === item._type && current.id === item.id)));

            if (item._type === "Velorio") {
                await api.patch(`/velorios/${item.id}`, { status: "Concluido", confirmado: true }).catch(() => { });
            } else if (item._type === "Sepultamento") {
                await api.patch(`/sepultamentos/${item.id}`, { status: "Concluido", confirmado: true }).catch(() => { });
                sepId = item.id;

                try {
                    const rSep = await api.get(`/sepultamentos/${item.id}`).catch(() => null);
                    const sep = rSep?.data ?? null;

                    if (sep) {
                        const quadra = sep.quadra_sep;
                        const num = sep.num_sepultura_sep;

                        if (quadra != null && num != null) {
                            const rc = await api.get("/covas", { params: { quadra_cova: quadra, num_cova: num } }).catch(() => null);
                            const found = rc && Array.isArray(rc.data) && rc.data.length ? rc.data[0] : null;

                            if (found && found.id != null) {
                                const curCap = Number(found.capacidade ?? 0);
                                const newCap = Math.max(0, curCap - 1);
                                let newStatus;

                                try {
                                    const rS = await api.get("/sepultamentos", { params: { quadra_sep: quadra, num_sepultura_sep: num } }).catch(() => null);
                                    const seps = rS?.data ?? [];
                                    const activeSeps = (seps || []).filter((registro) => !(registro.foi_exumado === true || normalizeText(registro.status) === "exumado"));

                                    if (activeSeps.length === 0) {
                                        newStatus = newCap > 0 ? "disponivel" : "lotada";
                                    } else {
                                        newStatus = newCap <= 0 ? "lotada" : "ocupada";
                                    }
                                } catch (e) {
                                    newStatus = newCap <= 0 ? "lotada" : "ocupada";
                                    void e;
                                }

                                await api.patch(`/covas/${found.id}`, { capacidade: newCap, status: newStatus }).catch(() => { });
                                try {
                                    window.dispatchEvent(new CustomEvent("covaCapacidadeAlterada", { detail: { covaId: found.id, capacidade: newCap } }));
                                } catch (e) {
                                    void e;
                                }
                            }
                        }
                    }
                } catch (capErr) {
                    console.warn("Erro ao decrementar capacidade de cova ao confirmar sepultamento:", capErr);
                }
            } else if (item._type === "Exumacao") {
                await api.patch(`/exumacoes/${item.id}`, { status: "Concluido", confirmado: true }).catch(() => { });

                sepId = item.sepultamentoId ?? item.sepultamento ?? item.falecido_id ?? null;
                if (sepId) {
                    try {
                        await api.patch(`/sepultamentos/${sepId}`, { foi_exumado: true }).catch(() => { });
                    } catch (patchErr) {
                        console.warn("Erro ao marcar sepultamento como exumado:", patchErr);
                    }

                    try {
                        const rSep = await api.get(`/sepultamentos/${sepId}`).catch(() => null);
                        const sep = rSep?.data ?? null;

                        if (sep) {
                            const quadra = sep.quadra_sep ?? sep.quadra;
                            const num = sep.num_sepultura_sep ?? sep.num_sepultura ?? sep.numero;

                            if (quadra != null && num != null) {
                                const rc = await api.get("/covas", { params: { quadra_cova: quadra, num_cova: num } }).catch(() => null);
                                const found = rc && Array.isArray(rc.data) && rc.data.length ? rc.data[0] : null;

                                if (found && found.id != null) {
                                    const curCap = Number(found.capacidade ?? 0);
                                    const newCap = curCap + 1;
                                    let newStatus;

                                    try {
                                        const rS = await api.get("/sepultamentos", { params: { quadra_sep: quadra, num_sepultura_sep: num } }).catch(() => null);
                                        const seps = rS?.data ?? [];
                                        const activeSeps = (seps || []).filter((registro) => !(registro.foi_exumado === true || normalizeText(registro.status) === "exumado"));

                                        if (activeSeps.length === 0) {
                                            newStatus = newCap > 0 ? "disponivel" : "lotada";
                                        } else {
                                            newStatus = newCap <= 0 ? "lotada" : "ocupada";
                                        }
                                    } catch (e) {
                                        newStatus = newCap > 0 ? "disponivel" : "lotada";
                                        void e;
                                    }

                                    await api.patch(`/covas/${found.id}`, { capacidade: newCap, status: newStatus }).catch(() => { });
                                    try {
                                        window.dispatchEvent(new CustomEvent("covaCapacidadeAlterada", { detail: { covaId: found.id, capacidade: newCap } }));
                                    } catch (e) {
                                        void e;
                                    }
                                }
                            }
                        }
                    } catch (capErr) {
                        console.warn("Erro ao restaurar capacidade de cova ao confirmar exumacao:", capErr);
                    }
                }
            }

            await loadProcessos();

            try {
                window.dispatchEvent(new CustomEvent("processoConfirmado", { detail: { id: item.id, type: item._type } }));
            } catch (e) {
                console.error("Erro ao dispatch evento processoConfirmado", e);
            }

            alert("Processo confirmado");
        } catch (err) {
            console.error("Erro ao confirmar processo", err);
            alert("Erro ao confirmar processo");
        }
    };

    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>PRÓXIMOS PROCESSOS</CardHeader>
                <CardBody>
                    {processosHoje.length ? processosHoje.map((item) => (
                        <ProcessItem key={`${item._type}-${item.id}`}>
                            <ProcessInfo>
                                <strong>{item.nome_fal || item.nome}</strong>
                                {item._type === "Velorio" && item.data_velorio && <span>Velorio: {item.data_velorio}</span>}
                                {item._type === "Exumacao" && item.dh_exu && <span>Exumacao: {item.dh_exu}</span>}
                                {item._type === "Sepultamento" && item.dh_sep && (
                                    <span>
                                        Sepultamento: {item.dh_sep}
                                        {item.quadra_num ? ` - Quadra: ${item.quadra_num}` : ""}
                                        {item.num_sepultura ? ` - Sepultura: ${item.num_sepultura}` : ""}
                                    </span>
                                )}
                            </ProcessInfo>
                            <ProcessAction>
                                {icones[item._type] || null}
                                <span style={{ marginLeft: 8 }}>{item._type}</span>
                                {item.local && <span> {item.local} </span>}
                                <Btn style={{ marginLeft: 12 }} onClick={() => handleConfirm(item)}>Confirmar conclusao</Btn>
                            </ProcessAction>
                        </ProcessItem>
                    )) : <div style={{ padding: 12 }}>Nenhum evento agendado para hoje.</div>}
                </CardBody>
            </Card>
        </DashboardWrapper>
    );
}
