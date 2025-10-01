import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { GiCoffin } from "react-icons/gi";
import { CiCirclePlus } from "react-icons/ci";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { Container, CovaGrid, CovaItem, QuadraTitle, QuadraWrapper, Title, LegendItem, LegendRow, SmallSelect, Button, ThreeCols, BtnAdd } from "./styles"

export default function VerMapa() {

    const [quadras, setQuadras] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);
    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);
    const [modalAddOpen, setModalAddOpen] = useState(false);
    const [formCova, setFormCova] = useState({
        quadra_cova: "",
        num_cova: "",
        status: "livre",
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

    const cova = {

    }

    const handleAddCova = () => {
        setFormCova({
            quadra_cova: "",
            num_cova: "",
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
        setModalAddOpen(true)
    };

    const updateFieldByName = (name,value) =>{
        if(!name.includes(".")){
            setFormCova(prev=>({...prev,[name]:value}));
            return;
        }
        const parts = name.split(".");
        setFormCova(prev=>{
            const clone = {...prev};
            let cur = clone;
            for(let i = 0;i<parts.length - 1;i++){
                const k = parts[i];
                cur[k] = (cur[k] && typeof cur[k]==="object")?{...cur[k]}:{};
                cur = cur[k];
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    };

    const handleCovaChange = (e) =>{
        const {name, value, type ,checked} = e.target;
        const incoming = type ==="checkbox" ? checked : value;
        updateFieldByName(name,incoming);
    };

    const normalizeStatus = (s) =>{
        if(!s) return "livre";
        const raw = String(s).toLowerCase();
        if (raw.includes("reserv")) return "reservada";
        if (raw.includes("indispon")) return "indisponivel";
        if (raw.includes("ocup")) return "ocupada";
        if (raw === "livre" || raw ==="disponivel" || raw=== "disponivel") return "livre";
        return raw;

    };

    const handleCreateCova = async(e) =>{
        if(e && e.preventDefault) e.preventDefault();
        const quadra = String(formCova.quadra_cova || "").trim();
        const num = String(formCova.num_cova || "").trim();
        if(!quadra|| !num){
            alert("Informe quadra e número da cova");
            return;
        }
        const payload ={
            quadra_cova: quadra,
            num_cova: num,
            status: normalizeStatus(formCova.status),
            capacidade: formCova.capacidade || "",
            concessao: {
                ativa: !!(formCova.concessao && formCova.concessao.ativa),
                responsavel: formCova.concessao?.responsavel||"",
                prazo_anos: Number(formCova.concessao?.prazo_anos || 0),
                data_inicio: formCova.concessao?.data_inicio||"",
                data_fim: formCova.concessao?.data_fim||""
            },
            obs: formCova.obs||"",
        };
        try{
            const chk = await api.get("/covas", {params:{quadra_cova:quadra, num_cova:num}})
            if(Array.isArray(chk.data)&&chk.data.length>0){
                alert("Já existe uma cova com essa quadra e número");
                return;
            }

        }catch(e){
            console.warn("Erro ao checar duplicata", e)
        }
        try{
            await api.post("/covas",payload);
            setModalAddOpen(false);
            await loadMapData();
            alert ("Cova criada");
        }catch(err){
            console.error("Erro ao criar cova", err);
            alert("Erro ao criar cova");
        }
    }
    const handleCloseAddModal = () =>{
        setModalAddOpen(false);
    };

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

                    const numero = sep.num_sepultura_sep || sep.num_sepultura || sep.numero || "";
                    const sepStatus = (sep.status === "concluido" || sep.confirmado) ? "ocupada" : "disponivel";

                    const existing = quadraObj.covas.find(c => String(c.numero) === String(numero));
                    if (existing) {

                        if (sepStatus === "ocupada") {
                            existing.status = "ocupada";
                            existing.sep = sep;
                        } else {
                            if (!existing.sep) existing.sep = sep;
                            if (existing.status !== "ocupada") existing.status = sepStatus;
                        }
                    } else {
                        quadraObj.covas.push({
                            id: sep.id,
                            numero,
                            status: sepStatus,
                            sep
                        });
                    }
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
        { key: "reservada", label: "Reservada", color: "#d2b24a" },
    ];


    return (
        <><MainLayout>
            <Container>
                <Title>MAPA DO CEMITÉRIO</Title>

                <ThreeCols>
                    <SmallSelect name="tipo_sep">
                        <option value="">Selecione o tipo de sepultura</option>
                        <option value="Cova">Cova</option>
                        <option value="Gaveta">Gaveta</option>
                    </SmallSelect>
                    <SmallSelect name="quadra_sep">
                        <option value="">Selecione o numero da quadra</option>
                        <option value="quadra_num">1</option>
                        <option value="quadra_num">2</option>
                    </SmallSelect>
                    <SmallSelect name="sepultura_sep">
                        <option value="">Selecione o numero da sepultura</option>
                        <option value="sep_num">1</option>
                        <option value="sep_num">2</option>
                    </SmallSelect>
                </ThreeCols>


                <Button type="button">Aplicar Filtros</Button>



                <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
                    <label style={{ fontWeight: 600, color: "#171770" }}>Quadra: </label>
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

                    <BtnAdd>Adicionar cova <CiCirclePlus size={20} /></BtnAdd>
                </LegendRow>



                {modalOpen && selectedCova && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                    }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setSelectedCova(null); setModalForm(null); } }}>
                        <div style={{ color: "#171770", width: 420, background: "#fff", padding: 18, borderRadius: 8 }}>
                            {modalForm ? (
                                <>
                                    <h3 style={{ marginTop: 0, color: "#171770" }}>{modalForm.nome_sep || modalForm.falecido?.nome_fal || modalForm.falecido?.nome || "Detalhes"}</h3>
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
                                    <h3 style={{ marginTop: 0 }}>Cova {selectedCova.numero}</h3>
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

        </MainLayout><Footer /></>
    )
}
