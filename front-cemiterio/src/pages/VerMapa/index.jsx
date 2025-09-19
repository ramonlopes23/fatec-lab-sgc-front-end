import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { GiCoffin } from "react-icons/gi";
import { Container, CovaGrid, CovaItem, QuadraTitle, QuadraWrapper, Title, LegendItem, LegendRow } from "./styles"

export default function VerMapa() {

    const [quadras, setQuadras] = useState([]);
    const [selectedQuadraId, setSelectedQuadraId] = useState(null);
    const [selectedCova, setSelectedCova] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const dadosSimulados = [
            {
                id: 1,
                nome: "Quadra 1",
                covas: [
                    { id: 1, numero: "A1", status: "ocupada" },
                    { id: 2, numero: "A2", status: "disponível" },
                    { id: 3, numero: "A3", status: "reservada" },
                    { id: 4, numero: "A4", status: "indisponível" },
                ]

            },
            {
                id: 2,
                nome: "Quadra 2",
                covas: [
                    { id: 5, numero: "B1", status: "disponível" },
                    { id: 6, numero: "B2", status: "disponível" },
                    { id: 7, numero: "B3", status: "reservada" },
                    { id: 8, numero: "B4", status: "indisponível" },
                ]
            }
        ];
        setQuadras(dadosSimulados);
        if (dadosSimulados.length) setSelectedQuadraId(dadosSimulados[0].id);
    }, []);

    const quadraSelecionada = quadras.find(q => q.id === Number(selectedQuadraId)) || quadras[0] || { covas: [] };

    const handleSelectQuadra = (e) => {
        setSelectedQuadraId(Number(e.target.value));
    };

    const handleClickCova = (cova) => {
        setSelectedCova(cova);
        setModalOpen(true);
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
                    }}>
                        <div style={{ width: 360, background: "#fff", padding: 18, borderRadius: 8 }}>
                            <h3 style={{ marginTop: 0 }}>Cova {selectedCova.numero}</h3>
                            <p><strong>Status:</strong>{selectedCova.status}</p>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                <button onClick={() => { /* futuro: abrir modal com dados do falecido */ }} style={{ padding: "8px 10px" }}>Ver detalhes</button>
                                <button onClick={() => { setModalOpen(false); setSelectedCova(null); }} style={{ padding: "8px 10px" }}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

            </Container>
        </MainLayout >
    )
}
