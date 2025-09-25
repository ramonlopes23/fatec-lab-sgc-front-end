import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { GiCoffin } from "react-icons/gi";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { Container, CovaGrid, CovaItem, QuadraTitle, QuadraWrapper, Title, LegendItem, LegendRow, SmallSelect, Button } from "./styles"

export default function VerMapa() {

    const [quadras, setQuadras] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);
    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);

    const location = useLocation();

    useEffect(() => {

        let mounted = true;

        (async () => {
            try {
                const [rSep] = await Promise.all([
                    api.get("/sepultamentos"),
                ]);
                if (!mounted) return;
                const sepData = Array.isArray(rSep.data) ? rSep.data : [];

                const quadraMap = new Map();
                sepData.forEach(sep => {
                    const qKey = sep.quadra_sep ?? sep.quadra ?? "0";
                    const qId = /^\d+$/.test(String(qKey)) ? Number(qKey) : String(qKey);
                    if (!quadraMap.has(qId)) quadraMap.set(qId, { id: qId, nome: `Quadra ${qId}`, covas: [] });
                    const quadraObj = quadraMap.get(qId);
                    quadraObj.covas.push({
                        id: sep.id,
                        numero: sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "",
                        status: sep.status === "concluido" ? "ocupada" : "disponivel",
                        sep
                    });
                });

                const quadrasArr = Array.from(quadraMap.values()).sort((a, b) => String(a.id).localeCompare(String(b.id)));
                setQuadras(quadrasArr);
                if (quadrasArr.length) setSelectedQuadraId(quadrasArr[0].id);

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
                                console.error("Erro ao buscar falecido", e);
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
                console.error("Erro ao carregar sepultamentos/quadras", err);
            }
        })();
        return () => { mounted = false; };
    }, [location.search]);


    const quadraSelecionada = quadras.find(q => q.id === Number(selectedQuadraId)) || quadras[0] || { covas: [] };

    const handleSelectQuadra = (e) => {
        setSelectedQuadraId(Number(e.target.value));
    };

    const handleClickCova = (cova) => {
        setSelectedCova(cova);
        if (cova.sep) {
            (async () => {
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
                setModalForm({ ...cova.sep, falecido: fal || null });
            })();
        } else {
            setModalForm(null);
        }
        setModalOpen(true)
    }

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
                    console.warn("ERro ao carregar falecido vinculado", err);
                }
            }

            setModalForm({ ...sep, falecido: fal || null });
            setModalOpen(true);
        } catch (err) {
            console.error("Erro ao carregar detalhes do sepultamento", err)
            alert("Erro ao carregar detalhes ");
        }
    }

    const statusList = [
        { key: "ocupada", label: "Ocupado", color: "#000" },
        { key: "disponível", label: "Disponível", color: "#9e9e9e" },
        { key: "indisponível", label: "Indisponível", color: "#c55" },
        { key: "reservada", label: "Reservada", color: "#d2b24a" },
    ];


    return (
        <MainLayout>
            <Container>
                <Title>MAPA DO CEMITÉRIO</Title>

                <SmallSelect name="tipo_sep" >
                    <option value="">Selecione o tipo de sepultura</option>
                    <option value="Cova">Cova</option>
                    <option value="Gaveta">Gaveta</option>
                </SmallSelect>
                <SmallSelect name="quadra_sep" >
                    <option value="">Selecione o numero da quadra</option>
                    <option value="quadra_num">1</option>
                    <option value="quadra_num">2</option>
                </SmallSelect>
                <SmallSelect name="sepultura_sep" >
                    <option value="">Selecione o numero da sepultura</option>
                    <option value="sep_num">1</option>
                    <option value="sep_num">2</option>
                </SmallSelect>



                <Button type="button">Aplicar Filtros</Button>



                <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
                    <label style={{ fontWeight: 600 }}>Quadra: </label>
                    <select value={selectedQuadraId ?? ""} onChange={handleSelectQuadra}>
                        {quadras.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
                    </select>
                </div>

                <QuadraWrapper key={quadraSelecionada.id || "preview"}>
                    <QuadraTitle>{quadraSelecionada.nome || "Preview de quadra"}</QuadraTitle>
                    <CovaGrid>
                        {quadraSelecionada.covas.map((cova) => (
                            <CovaItem key={cova.id} status={cova.status} onClick={() => handleClickCova(cova)} title={`Cova ${cova.numero} - ${cova.status}`}>
                                <GiCoffin aria-hidden="true" />
                                <span className="cova-number" aria-hidden="true">{cova.numero}  </span>
                            </CovaItem>
                        ))}
                    </CovaGrid>
                </QuadraWrapper>

                <LegendRow>
                    {statusList.map(s => (
                        <LegendItem key={s.key} color={s.color}>
                            <span className="color" />
                            <span>{s.label}</span>
                        </LegendItem>
                    ))}
                </LegendRow>

                {modalOpen && selectedCova && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                    }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setSelectedCova(null); setModalForm(null); } }}>
                        <div style={{ width: 420, background: "#fff", padding: 18, borderRadius: 8 }}>
                            {modalForm ? (
                                <>
                                    <h3 style={{ marginTop: 0 }}>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "Detalhes"}</h3>
                                    <p><strong>Quadra:</strong> {modalForm.quadra_sep || modalForm.quadra || "-"}</p>
                                    <p><strong>Nº da sepultura:</strong> {modalForm.num_sepultura_sep || modalForm.num_sepultura || modalForm.numero || "-"}</p>
                                    <p><strong>Tipo:</strong> {modalForm.tipo_sep || "-"}</p>
                                    <p><strong>Data/Hora sepultamento:</strong> {modalForm.dh_sep || modalForm.data_obito_sep || "-"}</p>
                                    <p><strong>Data do óbito:</strong> {modalForm.data_obito || modalForm.data_obito_sep || modalForm.falecido?.data_nasc || modalForm.falecido?.dh_falec || "-"}</p>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                        <button onClick={() => { setModalOpen(false); setSelectedCova(null); setModalForm(null); }} style={{ padding: "8px 10px" }}>Fechar</button>
                                    </div>
                                </>
                            ) : selectedCova ? (
                                <>
                                    <h3 style={{ marginTop: 0}}>Cova {selectedCova.numero}</h3>
                                    <p><strong>Status:</strong>{selectedCova.status}</p>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                        <button onClick={handleOpenDetails} style={{ padding: "8px 10px" }}>Ver detalhes</button>
                                        <button onClick={() => { setModalOpen(false); setSelectedCova(null); }} style={{ padding: "8px 10px" }}>Fechar</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>Nenhuma cova selecionada.</div>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                        <Button onClick={() => { setModalOpen(false); setSelectedCova(null); }} style={{ padding: "8px 10px" }}>Fechar</Button>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )}
            </Container>
        </MainLayout >
    )
}
