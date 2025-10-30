import React, { useEffect, useState, useCallback, useMemo } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { GiCoffin } from "react-icons/gi";
import { CiCirclePlus } from "react-icons/ci";
import { Form, useLocation } from "react-router-dom";
import api from "../../services/api";
import { Container, CovaGrid, CovaItem, QuadraTitle, QuadraWrapper, QuadraInfo, InfoPill, Title, LegendItem, LegendRow, SmallSelect, Button, ThreeCols, BtnAdd, BtnClose, BtnPrimaryClose, Input, Label, ModalOverlay, FormGrid, Textarea, Field, FormStyled, ColumnLeft, ColumnRight, ButtonsRow, TwoCols, ModalContent, ModalButtonsRow, SepDivider, SepHeader, SepItemButton, SepItemDate, SepItemName, SepList, SepItemRow, SepToggle } from "./styles"


export default function VerMapa() {

    const [quadras, setQuadras] = useState([]);
    const [sepultamentosAll, setSepultamentosAll] = useState([]);
    const [sepCountsByQuadra, setSepCountsByQuadra] = useState({});
    const [modalSepList, setModalSepList] = useState([]);
    const [modalExpandedIndex, setModalExpandedIndex] = useState(null);
    const quadrasDesc = useMemo(() => {
        return [...quadras].sort((a, b) => {
            const av = Number(a?.num_quadra);
            const bv = Number(b?.num_quadra);
            if (!Number.isNaN(av) && !Number.isNaN(bv)) return av - bv;
        })
    }, [quadras]);

    const [selectedQuadraId, setSelectedQuadraId] = useState(null);
    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);
    const [modalAddQuadraOpen, setModalAddQuadraOpen] = useState(false);
    const [formQuadra, setFormQuadra] = useState({
        num_quadra: "",
        max_covas: 0,
        status: "ativa",
    });

    const [modalAddCovaOpen, setModalAddCovaOpen] = useState(false);
    const [formCova, setFormCova] = useState({
        quadra_cova: "",
        num_cova: "",
        tipo_cova: "cova",
        status: "",
        capacidade: "",
        concessao: {
            ativa: false,
            responsavel: "",
            prazo_anos: 0,
            data_inicio: "",
            data_fim: ""
        },
        obs: "",
    });


    const location = useLocation();


    const handleAddQuadra = () => {
        setFormQuadra({
            num_quadra: "",
            max_covas: 0,
            covas_atual: 0,
            status: "ativo",
        });
        setModalAddQuadraOpen(true)
    };

    const getCovasCount = (quadraNum) => {
        if (!quadraNum) return 0;
        const q = quadras.find(qt => String(qt.id) === String(quadraNum) || String(qt.nome) === `Quadra ${quadraNum}` || String(qt.nome).endsWith(String(quadraNum)));
        return q && Array.isArray(q.covas) ? q.covas.length : 0;
    }

    /* const getSepultamentosCount = (quadraNum) =>{
        if(!quadraNum) return 0;
        const s = sepultamentosAll.find(sq =>String(sq.id) === String(quadraNum));
        return s && Array.isArray(s.sepultamentos) ? s.sepultamentos.length : 0;
    } */

    const getSepultadosCount = (quadraOrId) => {
        const quadraNum = (quadraOrId && typeof quadraOrId === "object") ? (quadraOrId.num_quadra ?? quadraOrId.id) : quadraOrId;
        if (quadraNum === null || quadraNum === undefined || quadraNum === "") return 0;
        const qStr = String(quadraNum);

        if (sepCountsByQuadra && Object.prototype.hasOwnProperty.call(sepCountsByQuadra, qStr)) {
            return Number(sepCountsByQuadra[qStr] || 0);
        }

        const ids = new Set();
        (sepultamentosAll || []).forEach(s => {
            const sQ = s.quadra_sep ?? s.quadra ?? "";
            if (String(sQ) === qStr) {
                const id = s.id ?? s._id ?? null;
                if (id != null) ids.add(String(id));
                else ids.add(`${qStr}-${s.num_sepultura_sep ?? s.num_sepultura ?? ""}-${s.dh_sep ?? s.data_obito_sep ?? ""}`);
            }
        });
        return ids.size;
    }

    const handleAddCova = () => {
        setFormCova({
            quadra_cova: "",
            num_cova: "",
            tipo_cova: "cova",
            status: "disponivel",
            capacidade: "",
            concessao: {
                ativa: false,
                responsavel: "",
                prazo_anos: 0,
                data_inicio: "",
                data_fim: ""
            },
            obs: "",
        });
        setModalAddCovaOpen(true)
    };

    const updateQuadraFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setFormQuadra(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setFormQuadra(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i];
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    }

    const updateFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setFormCova(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setFormCova(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i];
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    };

    const handleQuadraChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : (type === "number" ? (value === "" ? "" : Number(value)) : value);
        updateQuadraFieldByName(name, incoming);
    }

    const handleCovaChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;
        updateFieldByName(name, incoming);
    };

    const normalizeQuadraStatus = (s) => {
        if (!s) return "ativa";
        const raw = String(s).toLowerCase();
        if (raw.includes("desat") || raw.includes("inativa")) return "desativada";
        return raw.includes("ativa") ? "ativa" : raw;
    };

    const normalizeStatus = (s) => {
        if (!s) return "livre";
        const raw = String(s).toLowerCase();
        if (raw.includes("reserv")) return "reservada";
        if (raw.includes("indispon")) return "indisponivel";
        if (raw.includes("ocup")) return "ocupada";
        if (raw === "livre" || raw === "disponivel" || raw === "disponivel") return "livre";
        return raw;

    };

    const handleCreateQuadra = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const num = String(formQuadra.num_quadra || "").trim();
        if (!num) {
            alert("Informe o número da quadra");
            return;
        }
        const payload = {
            num_quadra: num,
            max_covas: Number(formQuadra.max_covas || 0),
            status: normalizeQuadraStatus(formQuadra.status)

        };
        try {
            const chk = await api.get("/quadras", { params: { num_quadra: num } });
            if (Array.isArray(chk.data) && chk.data.length > 0) {
                alert("Já existe uma quadra com esse numero.");
                return;
            }
        } catch (err) {
            console.warn("Erro ao checar duplicata de quadra (continuando):", err)
        }

        try {
            const res = await api.post("/quadras", payload);
            const created = res && res.data ? res.data : null;

            setQuadras(prev => {
                const entry = {
                    id: created?.id ?? num,
                    num_quadra: String(created?.num_quadra ?? num),
                    nome: `Quadra ${num}`,
                    max_covas: Number(created?.max_covas ?? payload.max_covas ?? 0),
                    covas: []
                };

                if (prev.find(p => String(p.id) === String(entry.id) || String(p.nome) === String(entry.nome))) return prev;
                return [...prev, entry];
            });
            setSelectedQuadraId(created?.id ?? num);
            setModalAddQuadraOpen(false);
            alert("Quadra criada");
        } catch (err) {
            console.error("Erro ao criar quadra", err);
            alert("Erro ao criar quadra")
        }
    }

    const handleCreateCova = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const quadra = String(formCova.quadra_cova || "").trim();
        const num = String(formCova.num_cova || "").trim();
        const tipo = String(formCova.tipo_cova || "").trim();
        if (!quadra || !num) {
            alert("Informe quadra e número da cova");
            return;
        }

        /* const qObj = quadras.find(q => String(q.id) === String(quadra) || String(q.num_quadra) === String(quadra) || String(q.nome).endsWith(String(quadra)));
        if (qObj) {
            const used = Array.isArray(qObj.covas) ? qObj.covas.length : getCovasCount(qObj.num_quadra ?? qObj.id);
            const max = Number(qObj.max_covas || 0);
            if (max > 0 && used >= max) {
                alert(`Não é possivel criar cova: quadra ${qObj.num_quadra} atingiu o limite de ${max} covas. `);
                return;
            }
        } */

        const payload = {
            quadra_cova: quadra,
            num_cova: num,
            tipo_cova: tipo || "cova",
            status: normalizeStatus(formCova.status),
            capacidade: formCova.capacidade || "",
            concessao: {
                ativa: !!(formCova.concessao && formCova.concessao.ativa),
                responsavel: formCova.concessao?.responsavel || "",
                prazo_anos: Number(formCova.concessao?.prazo_anos || 0),
                data_inicio: formCova.concessao?.data_inicio || "",
                data_fim: formCova.concessao?.data_fim || ""
            },
            obs: formCova.obs || "",
        };
        try {
            const chk = await api.get("/covas", { params: { quadra_cova: quadra, num_cova: num } })
            if (Array.isArray(chk.data) && chk.data.length > 0) {
                alert("Já existe uma cova com essa quadra e número");
                return;
            }

        } catch (e) {
            console.warn("Erro ao checar duplicata", e)
        }
        try {
            await api.post("/covas", payload);
            setModalAddCovaOpen(false);
            await loadMapData();
            alert("Sepultura criada");
        } catch (err) {
            console.error("Erro ao criar cova", err);
            alert("Erro ao criar cova");
        }
    }

    const handleCloseAddCovaModal = () => {
        setModalAddCovaOpen(false);
    };

    const handleCloseAddQuadraModal = () => {
        setModalAddQuadraOpen(false);
    }

    const loadMapData = useCallback(async () => {
        try {
            const [rCovas, rSep, rQuadras] = await Promise.all([api.get("/covas"), api.get("/sepultamentos"), api.get("/quadras")]);
            const covasData = Array.isArray(rCovas.data) ? rCovas.data : [];
            const sepData = Array.isArray(rSep.data) ? rSep.data : [];
            setSepultamentosAll(sepData);
            const covaIdToQuadra = Object.fromEntries((covasData || []).map(c => [String(c.id), String(c.quadra_cova ?? c.quadra ?? "")]));
            const tmp = {};
            const quadrasData = Array.isArray(rQuadras.data) ? rQuadras.data : [];
            const quadraMap = new Map();

            (sepData || []).forEach(sep => {
                const sepId = sep.id ?? sep._id ?? null;
                const quadraKey = String(sep.quadra_sep ?? sep.quadra ?? covaIdToQuadra[String(sep.covaId ?? sep.cova_id ?? sep.cova ?? "")] ?? "0");
                if (!tmp[quadraKey]) tmp[quadraKey] = new Set();
                if (sepId != null) tmp[quadraKey].add(String(sepId));
                else {
                    tmp[quadraKey].add(`${quadraKey}-${sep.num_sepultura_sep ?? sep.num_sepultura ?? ""}-${sep.dh_sep ?? sep.data_obito_sep ?? ""}`);
                }
            })
            const countsObj = {};
            Object.keys(tmp).forEach(k => countsObj[k] = tmp[k].size);
            setSepCountsByQuadra(countsObj);


            const normalizeCovaStatus = (s) => {
                if (!s) return "disponível";
                const raw = String(s).toLowerCase();
                if (raw.includes("reserv")) return "reservada";
                if (raw.includes("indispon")) return "indisponível";
                if (raw.includes("ocup")) return "ocupada";
                if (raw === "livre" || raw === "disponivel" || raw === "disponível") return "disponível";
                return raw;

            };

            quadrasData.forEach(q => {
                const qKey = q.id ?? q.num_quadra ?? q.nome ?? q;
                const qId = /^\d+$/.test(String(qKey)) ? Number(qKey) : String(qKey);
                if (!quadraMap.has(qId)) {
                    quadraMap.set(qId, {
                        id: qId,
                        num_quadra: q.num_quadra ?? "",
                        nome: q.nome || `Quadra ${q.num_quadra || q.id}`,
                        max_covas: q.max_covas ?? 0,
                        status: q.status ?? "ativa",
                        covas: Array.isArray(q.covas) ? q.covas.slice() : []
                    });
                }
            });


            covasData.forEach(cova => {
                const qKey = cova.quadra_cova ?? cova.quadra ?? "0";
                const qId = /^\d+$/.test(String(qKey)) ? Number(qKey) : String(qKey);
                if (!quadraMap.has(qId)) quadraMap.set(qId, { id: qId, nome: `Quadra ${qId}`, covas: [] });
                const quadraObj = quadraMap.get(qId);
                const numero = cova.num_cova ?? cova.num_sepultura ?? cova.numero ?? "";
                quadraObj.covas.push({
                    id: cova.id ?? `${qId}-${numero}`,
                    numero,
                    status: normalizeCovaStatus(cova.status),
                    cova
                });
            });

            sepData.forEach(sep => {
                const qKey = sep.quadra_sep ?? sep.quadra ?? "0";
                const qId = /^\d+$/.test(String(qKey)) ? Number(qKey) : String(qKey);
                if (!quadraMap.has(qId)) quadraMap.set(qId, { id: qId, nome: `Quadra ${qId}`, covas: [] });
                const quadraObj = quadraMap.get(qId);

                const numero = sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "";
                const titulo_posse = String(sep.titulo_posse ?? "").toLowerCase() === "sim";
                const confirmed = sep.confirmado === true || String(sep.confirmado).toLowerCase() === "true";
                const sepIsConcluded = confirmed || String(sep.status ?? "").toLowerCase().includes("concl");

                const existing = quadraObj.covas.find(c => String(c.numero) === String(numero));
                if (existing) {
                    if (sepIsConcluded) {
                        existing.status = "ocupada";
                        existing.sep = sep;
                    } else if (titulo_posse && existing.status !== "ocupada") {
                        existing.status = "reservada";
                        existing.sep = existing.sep || sep;
                    } else {
                        existing.sep = existing.sep || sep;
                    }

                } else {
                    quadraObj.covas.push({
                        id: sep.id ?? `${qId}-${numero}`,
                        numero,
                        status: titulo_posse ? "reservada" : (sepIsConcluded ? "ocupada" : "ocupada"),
                        sep
                    });
                }
            })

            const quadrasArr = Array.from(quadraMap.values()).sort((a, b) => String(a.id).localeCompare(String(b.id)));
            setQuadras(quadrasArr);
            if (quadrasArr.length) setSelectedQuadraId(null);

            const qs = new URLSearchParams(location.search);
            const sepId = qs.get("sepId") || qs.get("sepultamentoId");
            if (sepId) {
                const sep = sepData.find(s => String(s.id) === String(sepId));
                if (sep) {
                    const falId = sep?.falecido ?? sep?.falecido_id ?? sep?.falecidoId;
                    let fal = null;
                    if (falId) {
                        try {
                            const rf = await api.get(`/falecidos/${falId}`);
                            fal = rf.data;
                        } catch (e) {
                            console.error("Erro ao buscar falecido", e)
                        }

                    }
                    const qid = Number(sep.quadra_sep ?? sep.quadra);
                    if (!Number.isNaN(qid)) setSelectedQuadraId(qid);
                    setSelectedCova({ id: sep.id, numero: sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "", sep });
                    setModalForm({ ...sep, falecido: fal || null });
                    setModalOpen(true);
                }
            }

        } catch (err) {
            console.error("Erro ao carregar sepultamento/quadras", err);
        }
    }, [location.search]);

    useEffect(() => {
        loadMapData();
    }, [loadMapData]);


    const quadraSelecionada = quadras.find(q => String(q.id) === String(selectedQuadraId)) || { covas: [] };

    const handleSelectQuadra = (e) => {
        const v = e?.target?.value;
        if (v === "" || v === null) {
            setSelectedQuadraId(null);
            return;
        }
        const parsed = /^\d+$/.test(String(v)) ? Number(v) : v;
        setSelectedQuadraId(parsed);
    };

    const handleClickCova = (cova) => {
        setSelectedCova(cova);
        const quadraKey = String(selectedQuadraId ?? cova.cova?.quadra_cova ?? cova.quadra_cova ?? cova.quadra_sep ?? cova.sep?.quadra_sep ?? "");
        const numero = String(cova.numero ?? cova.num_cova ?? cova.num_sepultura_sep ?? "");
        const list = (sepultamentosAll || []).filter(s => {
            const sQuadra = String(s.quadra_sep ?? s.quadra ?? "");
            const sNum = String(s.num_sepultura_sep ?? s.num_sepultura ?? s.numero ?? "");
            return sQuadra === quadraKey && sNum === numero;
        });

        if (cova.sep && !list.find(s => String(s.id) === String(cova.sep.id))) list.unshift(cova.sep);
        setModalSepList(list);
        setModalExpandedIndex(0);
        (async () => {
            const first = list[0] ?? cova.sep ?? null;
            if (first) {
                const falId = cova.sep?.falecido ?? cova.sep?.falecido_id ?? cova.sep?.falecidoId;
                let fal = null;
                if (falId) {
                    try {
                        const rf = await api.get(`/falecidos/${falId}`);
                        fal = rf.data;
                    } catch (e) {
                        console.error("Erro", e)
                    };
                }
                setModalForm({ ...first, falecido: fal || null });
            } else {
                setModalForm(null);
            }
            setModalOpen(true);
        })();

    };

    const handleOpenDetails = async () => {
        if (!selectedCova) return alert("Selecione uma cova")
        try {
            const params = {};
            if (selectedQuadraId !== null && selectedQuadraId !== undefined) params.quadra_sep = String(selectedQuadraId);
            params.num_sepultura_sep = String(selectedCova.numero || selectedCova);

            const res = await api.get("/sepultamentos", { params });
            const results = Array.isArray(res.data) ? res.data : [];
            const sep = results[0] || null;
            if (!sep) {
                alert("Nenhum sepultamento cadastrado")
                return;
            }

            const falId = sep?.falecido ?? sep?.falecidoId ?? sep?.falecido_id;
            let fal = null;
            if (falId) {
                try {
                    const rf = await api.get(`/falecidos/${falId}`);
                    fal = rf.data;
                } catch (err) {
                    console.warn("Erro ao carregar falecido vinculado", err);
                }
            }

            setModalForm({ ...sep, falecido: fal || null });
            setModalOpen(true);
        } catch (err) {
            console.error("Erro ao carregar detalhes do sepultamento", err)
            alert("Erro ao carregar detalhes ");
        }
    };

    const statusList = [
        { key: "ocupada", label: "Ocupada", color: "#000" },
        { key: "disponível", label: "Disponível", color: "#9e9e9e" },
        { key: "indisponível", label: "Indisponível", color: "#c55" },
        { key: "particular", label: "Particular", color: "#d2b24a" },
        { key: "particular_ocupada", label: "Particular e ocupada", color: "#000", borderColor: "#d2b24a", borderWidth: 3 }
    ];

    const sepDataForModal = modalForm ?? selectedCova?.sep ?? null;
    const isOccupiedForModal = String(selectedCova?.status || "").toLowerCase().includes("ocup") || !!sepDataForModal;
    const tipoForModal = selectedCova?.tipo_cova ?? selectedCova?.cova?.tipo_cova ?? sepDataForModal?.tipo_cova ?? sepDataForModal?.tipo_sep ?? "-";
    const capacidadeForModal = selectedCova?.capacidade ?? selectedCova?.cova?.capacidade ?? selectedCova?.sep?.capacidade ?? sepDataForModal?.capacidade ?? "-";
    const observacoesForModal = selectedCova?.obs ?? selectedCova?.cova?.obs ?? "-";
    const numeroForModal = sepDataForModal?.num_sepultura_sep ?? sepDataForModal?.num_sepultura ?? sepDataForModal?.numero ?? selectedCova?.numero ?? "-";
    /* const nomeSepForModal = sepDataForModal?.nome_sep ?? sepDataForModal?.falecido?.nome_fal ?? sepDataForModal?.falecido?.nome ?? null; */


    return (
        <><MainLayout>
            <Container>
                <Title>CONTROLE DE SEPULTURAS</Title>


                <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
                    <label style={{ fontWeight: 600, color: "#171770" }}>Quadra: </label>

                    <SmallSelect value={selectedQuadraId != null ? String(selectedQuadraId) : ""} onChange={handleSelectQuadra}>
                        <option value="">Selecione o número da quadra </option>
                        {quadrasDesc.map(q => (
                            <option key={String(q.id)} value={String(q.id)}>
                                {q.num_quadra ? `${q.num_quadra}` : q.nome || `${q.id}`}
                            </option>
                        ))}
                    </SmallSelect>
                </div>

                <QuadraWrapper key={quadraSelecionada.id || "preview"}>
                    <QuadraInfo key={String(quadraSelecionada.id)}>
                        <InfoPill>Capacidade máxima de sepulturas: {quadraSelecionada.max_covas > 0 ? quadraSelecionada.max_covas : "-"}</InfoPill>
                        <InfoPill>Número atual de sepulturas: {Array.isArray(quadraSelecionada.covas) ? quadraSelecionada.covas.length : getCovasCount?.(quadraSelecionada.num_quadra ?? quadraSelecionada.id) ?? 0}</InfoPill>
                        <InfoPill>Número atual de sepultados: {getSepultadosCount(quadraSelecionada.id ?? quadraSelecionada.num_quadra ?? selectedQuadraId)}</InfoPill>

                    </QuadraInfo>
                    <QuadraTitle>{quadraSelecionada.nome || "Preview de quadra"}</QuadraTitle>
                    <CovaGrid>
                        {quadraSelecionada.covas.map((cova) => {
                            const s = String(cova.status || "").toLowerCase();
                            const isOcupada = s.includes("ocup");
                            const hasTitulo = !!(cova.sep && String(cova.sep.titulo_posse ?? "").toLowerCase() === "sim");
                            const displayStatus = (isOcupada && hasTitulo) ? "reservada_ocupada" : cova.status;

                            return (
                                <CovaItem
                                    key={cova.id}
                                    status={displayStatus}
                                    borderColor={displayStatus === "reservada_ocupada" ? "#d2b24a" : undefined}
                                    borderWidth={displayStatus === "reservada_ocupada" ? 5 : undefined}
                                    onClick={() => handleClickCova(cova)}
                                    title={`Cova ${cova.numero} - ${displayStatus}`}
                                >
                                    <GiCoffin aria-hidden="true" />
                                    <span className="cova-number" aria-hidden="true">{cova.numero}  </span>
                                </CovaItem>
                            )
                        })}
                    </CovaGrid>
                </QuadraWrapper>


                <LegendRow>
                    {statusList.map(s => (
                        <LegendItem key={s.key} color={s.color} borderColor={s.borderColor} borderWidth={s.borderWidth}>
                            <span className="color" />
                            <span>{s.label}</span>
                        </LegendItem>
                    ))}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <BtnAdd onClick={handleAddQuadra}>Quadra<CiCirclePlus size={20} /></BtnAdd>
                        <BtnAdd onClick={handleAddCova}>Sepultura<CiCirclePlus size={20} /></BtnAdd>
                    </div>

                </LegendRow>

                {modalAddQuadraOpen && (
                    <ModalOverlay>
                        <div style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                        }} onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseAddQuadraModal(); }}>
                            <form onSubmit={handleCreateQuadra} style={{ color: "#171770", width: 400, background: "#fff", padding: 18, borderRadius: 8 }}>
                                <h3 style={{ marginTop: 0 }}>Criar quadra</h3>
                                <div style={{ display: "flex", gap: 12 }}>

                                    <Field>
                                        <Label>Nº da quadra: </Label>
                                        <Input name="num_quadra" value={formQuadra.num_quadra} onChange={handleQuadraChange} />
                                    </Field>

                                    <Field>
                                        <Label>Máximo de covas: </Label>
                                        <Input type="number" name="max_covas" value={formQuadra.max_covas} onChange={handleQuadraChange} />
                                    </Field>
                                </div>
                                <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <Field>
                                            <Label>Status: </Label>
                                            <SmallSelect name="status" value={formQuadra.status} onChange={handleQuadraChange}>
                                                <option value="ativa">Ativa</option>
                                                <option value="desativada">Desativada</option>
                                            </SmallSelect>
                                        </Field>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                    <BtnClose type="button" onClick={handleCloseAddQuadraModal} style={{ padding: "8px 10px" }}>Cancelar</BtnClose>
                                    <BtnAdd type="submit" style={{ padding: "8px 10px" }}>Criar</BtnAdd>

                                </div>

                            </form>
                        </div>
                    </ModalOverlay>
                )}


                {modalAddCovaOpen && (
                    <ModalOverlay>
                        <FormStyled onSubmit={handleCreateCova} style={{ color: "#171770", width: 520, background: "#fff", padding: 18, borderRadius: 8 }}>
                            <h3 style={{ marginTop: 0 }} >Criar sepultura</h3>

                            <FormGrid >
                                <ColumnLeft>
                                    <Field>
                                        <Label>Quadra: </Label>
                                        <SmallSelect style={{ width: 200 }} name="quadra_cova" value={formCova.quadra_cova} onChange={handleCovaChange}>
                                            <option value="">Selecione a quadra</option>
                                            {quadrasDesc.map(q => {
                                                const used = Array.isArray(q.covas) ? q.covas.length : getCovasCount(q.num_quadra ?? q.id);
                                                const max = Number(q.max_covas || 0);
                                                const full = max > 0 && used >= max;
                                                return (
                                                    <option key={String(q.id)} value={String(q.id)} disabled={full}>
                                                        {q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`} {full ? `(lotada)` : ''}
                                                    </option>
                                                )
                                            })}
                                        </SmallSelect>
                                    </Field>

                                    <Field>
                                        <Label>Status: </Label>
                                        <SmallSelect style={{ width: 200 }} name="status" value={formCova.status} onChange={handleCovaChange}>
                                            <option value="livre">Disponível</option>
                                            <option value="reservada">Particular</option>
                                            <option value="indisponível">Indisponível</option>
                                        </SmallSelect>
                                    </Field>

                                    <TwoCols>
                                        <Field>
                                            <Label>Número: </Label>
                                            <Input style={{ width: 70 }} name="num_cova" value={formCova.num_cova} onChange={handleCovaChange} />
                                        </Field>

                                        <Field>
                                            <Label>Tipo: </Label>
                                            <SmallSelect style={{ width: 80 }} name="tipo_cova" value={formCova.tipo_cova} onChange={handleCovaChange}>
                                                <option value="cova">Cova</option>
                                                <option value="gaveta">Gaveta</option>
                                                <option value="nicho">Nicho</option>
                                            </SmallSelect>
                                        </Field>
                                    </TwoCols>

                                    <Field>
                                        <Label>Capacidade: </Label>
                                        <Input style={{ width: 200 }} type="number" name="capacidade" value={formCova.capacidade} onChange={handleCovaChange} />
                                    </Field>


                                </ColumnLeft>

                                <ColumnRight>

                                    <Field>
                                        <Label>
                                            Possui título de posse?<input type="checkbox" name="concessao.ativa" checked={!!formCova.concessao?.ativa} onChange={handleCovaChange} />
                                        </Label>
                                    </Field>

                                    {formCova.concessao?.ativa ? (
                                        <>
                                            <Field>
                                                <Label>Responsável: </Label>
                                                <Input name="concessao.responsavel" value={formCova.concessao?.responsavel || ""} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Prazo (anos): </Label>
                                                <Input type="number" name="concessao.prazo_anos" value={formCova.concessao?.prazo_anos || 0} onChange={handleCovaChange} />
                                            </Field>
                                            <Field>
                                                <Label>Data Início: </Label>
                                                <Input type="date" name="concessao.data_inicio" value={formCova.concessao?.data_inicio || ""} onChange={handleCovaChange} />
                                            </Field>

                                            <Field>
                                                <Label>Data Fim: </Label>
                                                <Input type="date" name="concessao.data_fim" value={formCova.concessao?.data_fim || ""} onChange={handleCovaChange} />
                                            </Field>
                                        </>
                                    ) : null}

                                    <Field>
                                        <Label>Observações: </Label>
                                        <Textarea name="obs" value={formCova.obs || ""} onChange={handleCovaChange}></Textarea>
                                    </Field>
                                </ColumnRight>


                            </FormGrid>
                            <ButtonsRow>
                                <BtnClose type="button" onClick={handleCloseAddCovaModal} style={{ padding: "8px 10px" }}>Cancelar</BtnClose>
                                <BtnAdd type="submit" style={{ padding: "8px 10px" }}>Criar</BtnAdd>
                            </ButtonsRow>
                        </FormStyled>
                    </ModalOverlay>
                )}

                {modalOpen && selectedCova && (

                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                    }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setSelectedCova(null); setModalForm(null); } }}>
                        <ModalContent>

                            <p><strong>Nº da sepultura:</strong> {numeroForModal}</p>
                            <p><strong>Status:</strong> {selectedCova.status ?? (isOccupiedForModal ? "ocupada" : "-")}</p>
                            <p><strong>Tipo:</strong> {tipoForModal}</p>
                            <p><strong>Capacidade da sepultura:</strong> {capacidadeForModal}</p>
                            <p><strong>Observações:</strong> {observacoesForModal}</p>

                            {(modalSepList && modalSepList.length > 0) ? (
                                <>
                                    <SepDivider />
                                    <SepHeader>
                                        <strong>Sepultamentos({modalSepList.length})</strong>
                                    </SepHeader>
                                    <SepList>
                                        {modalSepList.map((s, idx) => {
                                            const expanded = modalExpandedIndex === idx;
                                            return (
                                                <div key={s.id ?? idx}>
                                                    <SepItemRow>
                                                        <SepItemButton
                                                            type="button"
                                                            onClick={() => {
                                                                setModalExpandedIndex(expanded ? null : idx);
                                                                if (!expanded) {
                                                                    (async () => {
                                                                        const falId = s?.falecido ?? s?.falecido_id ?? s?.falecidoId;
                                                                        let fall = null;
                                                                        if (falId) {
                                                                            try {
                                                                                const rf = await api.get(`/falecidos/${falId}`);
                                                                                fall = rf.data;
                                                                            } catch (e) {
                                                                                console.error("Erro ", e)
                                                                            }
                                                                        }
                                                                        setModalForm({ ...s, falecido: fall || null });
                                                                    })();
                                                                }
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                                <SepItemName>{s.nome_sep || s.falecido || "-"}</SepItemName>
                                                            </div>
                                                        </SepItemButton>
                                                        <SepToggle
                                                            aria-expanded={expanded}
                                                            onClick={() => {
                                                                const willExpand = !expanded;
                                                                setModalExpandedIndex(willExpand ? idx : null);
                                                                if (willExpand) {
                                                                    (async () => {
                                                                        const falId = s?.falecido ?? s?.falecido_id ?? s?.falecidoId;
                                                                        let fall = null;
                                                                        if (falId) {
                                                                            try {
                                                                                const rf = await api.get(`/falecidos/${falId}`);
                                                                                fall = rf.data;
                                                                            } catch (e) {
                                                                                console.error("Erro ", e)
                                                                            }
                                                                        }
                                                                        setModalForm({ ...s, falecido: fall || null });
                                                                    })();
                                                                }
                                                            }}
                                                        >
                                                            {expanded ? "▾" : "▸"}
                                                        </SepToggle>
                                                    </SepItemRow>
                                                    {expanded && modalForm && modalForm.id === (s.id ?? modalForm.id) ? (
                                                        <div style={{ padding: "8px 12px 12px", borderLeft: "3px solid #eef0ff", background: "#fff" }}>
                                                            <p style={{ margin: "6px 0" }}><strong>Nome do sepultado: </strong>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</p>
                                                            <p style={{ margin: "6px 0" }}><strong>Data e hora do sepultamento: </strong>{modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</p>
                                                            <p style={{ margin: "6px 0" }}><strong>Data do óbito: </strong>{modalForm.data_obito || modalForm.data_obito_sep || "-"}</p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </SepList>
                                </>
                            ) : (
                                sepDataForModal ? (
                                    <>
                                        <p><strong>Nome do sepultado: </strong> {modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "-"}</p>
                                        <p><strong>Data e hora do sepultamento: </strong> {modalForm.dh_sep || modalForm.data_hora || modalForm.data_obito_sep || "-"}</p>
                                        <p><strong>Data do óbito: </strong> {modalForm.data_obito || modalForm.data_obito_sep || "-"}</p>
                                    </>
                                ) : null

                            )}

                            <ModalButtonsRow>
                                {sepDataForModal ? <Button onClick={handleOpenDetails} style={{ padding: "8px 10px" }}>Ver Detalhes</Button> : null}
                                <BtnPrimaryClose onClick={() => { setModalOpen(false); setSelectedCova(null); setModalForm(null); }} style={{ padding: "8px 10px" }}>Fechar</BtnPrimaryClose>
                            </ModalButtonsRow>

                        </ModalContent>
                    </div>
                )}

            </Container >

        </MainLayout > <Footer /></>
    )
}
