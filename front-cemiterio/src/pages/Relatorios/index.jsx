import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { BtnPrimary, BtnPrimaryClose, BtnPrimarySave, ColumnLeft, ColumnRight, Container, Field, FormStyled, Label, ModalContent, ModalGrid, ModalOverlay, SearchBar, SearchIcon, SearchInput, SearchWrapper, SmallInput, SmallSelect, Title, TwoCols, IconBtn, TableWrapper } from "./styles"
import { FaFileCsv, FaFileExcel, FaFilePdf, FaSearch, FaEye } from "react-icons/fa";
import api from "../../services/api";


export default function Relatorios() {

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        quadra: "",
        sepultura: "",
        tipo_sep: "",
        data_inicio: "",
        data_fim: ""
    });
    const [exumacoes, setExumacoes] = useState([]);
    const [page, setPage] = useState(1);
    const [covas, setCovas] = useState([]);
    const [quadras, setQuadras] = useState([])
    const PAGE_SIZE = 10;
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [rExu, rQuadras, rCovas] = await Promise.all([
                api.get("/exumacoes").catch(() => ({ data: [] })),
                api.get("/quadras").catch(() => ({ data: [] })),
                api.get("/covas").catch(() => ({ data: [] })),
            ]);
            setExumacoes(Array.isArray(rExu.data) ? rExu.data : []);
            setQuadras(Array.isArray(rQuadras.data) ? rQuadras.data : []);
            setCovas(Array.isArray(rCovas.data) ? rCovas.data : []);
            setPage(1);
        } catch (err) {
            console.error("Erro ao carregar exumações/quadras/covas", err);

        } finally {
            setIsLoading(false);
        }
    };

    const sepulturasForQuadra = useMemo(() => {
        if (!filters.quadra) return [];
        return covas
            .filter(c => String(c.quadra_cova) === String(filters.quadra))
            .sort((a, b) => (String(a.num_cova || a.num_cova) > String(b.num_cova || b.num_cova) ? 1 : -1));

    }, [covas, filters.quadra]);

    const filtered = useMemo(() => {
        const s = String(search || "").trim().toLowerCase();
        const start = filters.data_inicio ? new Date(filters.data_inicio) : null;
        const end = filters.data_fim ? new Date(filters.data_fim) : null;
        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        return exumacoes.filter(item => {
            const nome = String(item.nome_fal || "").toLowerCase();
            if (s && !nome.includes(s)) return false;

            if (filters.quadra) {
                const q = String(item.quadra_sep ?? "");
                if (q !== String(filters.quadra)) return false;
            }

            if (filters.sepultura) {
                const n = String(item.num_sepultura_sep ?? "");
                if (n !== String(filters.sepultura)) return false;
            }

            if (filters.tipo_sep) {
                const t = String(item.tipo_sep).toLowerCase();
                if (t && !t.includes(String(filters.tipo_sep).toLowerCase())) return false;
            }

            if ((start || end) && item.dh_exu) {
                const d = new Date(item.dh_exu);
                if (start && d < start) return false;
                if (end && d > end) return false
            }

            return true;
        });
    }, [exumacoes, search, filters]);


    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Number(page || 1)), totalPages);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const applyFilters = () => setPage(1);

    const handleView = (item) => {
        setModalForm(item);
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
        setModalForm(null);
    }

    const exportCSV = () => {
        const rows = filtered.map(e => ({
            Nome: e.nome_fal || "",
            "Data exumação": e.dh_exu || "",
            "Quadra": e.quadra_sep ?? "",
            "Sepultura": e.num_sepultura_sep ?? "",
            "Destinação": e.destino || "",
            "Responsável": e.coveiro || ""

        }))

        const keys = Object.keys(rows[0] || { Nome: "" });
        const csv = [
            keys.join(","),
            ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exumacoes_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const newWin = window.open("", "_blank", "width=900, height=700");
        if (!newWin) return;
        const html = `
        <html><head><title>Exumações</title>
        <style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}</style>
        </head><body>
        <h2>Exumações</h2>        
        <p>A Secretaria de Serviços Urbanos, por meio da Administração do Cemitério Municipal, informa que foram realizadas exumações no período de [data/período], em conformidade com as normas sanitárias e regulamentações vigentes.
As exumações têm como objetivo garantir a adequada gestão dos espaços do cemitério, atender solicitações de familiares e cumprir prazos legais para renovação ou liberação de sepulturas.</p>
        <table>
        <thead>
          <tr>
            <th>Nome</th><th>Data exumação</th><th>Quadra</th><th>Sepultura</th><th>Destinação</th>
          </tr>
        </thead>
        <tbody>
        ${filtered.map(e => `<tr>
            <td>${e.nome_sep || ""}</td>
            <td>${e.dh_exu || ""}</td>
            <td>${e.quadra_sep ?? ""}</td>
            <td>${e.num_sepultura_sep ?? ""}</td>
            <td>${e.destino || ""}</td>
            </tr>`).join("")}
        </tbody>
        </table>
        </body><html>
    `;
        newWin.document.write(html);
        newWin.document.close();
        newWin.focus();
        setTimeout(() => newWin.print(), 500);

    }


    return (
        <div>
            <MainLayout>
                <SmallSelect style={{ position: "relative", left: 940, borderRadius: 8 }}>
                    <option value="falecidos">Lista de sepultamentos </option>
                    <option value="exumados">Lista de exumações </option>
                </SmallSelect>
                <Container>
                    <FormStyled>
                        <Title>BUSCAR RELATÓRIOS</Title>

                        <SearchBar>
                            <SearchWrapper>
                                <SearchInput placeholder="Pesquisar por nome do falecido" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); applyFilters(); }} />
                                <SearchIcon>
                                    <FaSearch />
                                </SearchIcon>

                            </SearchWrapper>
                        </SearchBar>

                        <TwoCols style={{ marginTop: 12 }}>
                            <ColumnLeft style={{ flex: 1 }}>
                                <SmallSelect value={filters.quadra} onChange={(e) => setFilters(prev => ({ ...prev, quadra: e.target.value, sepultura: "" }))}>
                                    <option value="">Selecione a quadra</option>
                                    {quadras.map(q => (
                                        <option key={String(q.id)} value={String(q.id)}>{q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`}</option>
                                    ))}

                                </SmallSelect>
                                <SmallSelect value={filters.tipo_sep} onChange={(e) => setFilters(prev => ({ ...prev, tipo_sep: e.target.value }))}>
                                    <option value="">Selecione o tipo de sepultura</option>
                                    <option value="cova">Cova</option>
                                    <option value="gaveta">Gaveta</option>
                                    <option value="nicho">Nicho</option>
                                </SmallSelect>
                            </ColumnLeft>
                        </TwoCols>


                        <TwoCols style={{ marginTop: 12 }}>
                            <Field style={{ display: "flex", gap: 8 }}>
                                <SmallInput style={{ width: 110 }} type="date" value={filters.data_inicio} onChange={(e) => setFilters(prev => ({ ...prev, data_inicio: e.target.value }))} />
                                <SmallInput style={{ width: 110 }} type="date" value={filters.data_fim} onChange={(e) => setFilters(prev => ({ ...prev, data_fim: e.target.value }))} />

                            </Field>
                            <Field
                                style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                                <BtnPrimary type="button" onClick={() => { applyFilters(); setPage(1); }}>
                                    Aplicar filtros
                                </BtnPrimary>
                            </Field>
                        </TwoCols>

                        <TableWrapper>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ background: "#191970", color: "#fff" }}>
                                    <tr>
                                        <th style={{ textAlign: "left", padding: "12px 16px" }}>Falecido</th>
                                        <th style={{ textAlign: "left", padding: "12px 16px" }}>Data da exumação</th>
                                        <th style={{ textAlign: "left", padding: "12px 16px" }}>Quadra/Sepultura</th>
                                        <th style={{ textAlign: "left", padding: "12px 16px" }}>Destinação</th>
                                        <th style={{ textAlign: "left", padding: "12px 16px" }}>Responsável</th>
                                        <th style={{ textAlign: "center", padding: "12px 16px", width: 80 }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (

                                        <tr>
                                            <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#666" }}>
                                                {isLoading ? "Carregando..." : "Nenhuma exumação encontrada."}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((e, i) => (
                                            <tr key={e.id ?? i} style={{ borderBottom: "1px solid #f1f1f1" }}>
                                                <td style={{ padding: "12px 16px" }}>{e.nome_sep || "-"}</td>
                                                <td style={{ padding: "12px 16px" }}>{e.dh_exu ? new Date(e.dh_exu).toLocaleDateString() : "-"}</td>
                                                <td style={{ padding: "12px 16px" }}>{`${e.quadra_sep ?? e.num_quadra ?? "-"} - ${e.num_sepultura_sep ?? ""}`}</td>
                                                <td style={{ padding: "12px 16px" }}>{e.destino || "-"}</td>
                                                <td style={{ padding: "12px 16px" }}>{e.coveiro || "-"}</td>
                                                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                    <IconBtn type="button" onClick={() => handleView(e)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                                                        <FaEye />
                                                    </IconBtn>
                                                </td>
                                            </tr>

                                        ))
                                    )}</tbody>
                            </table>
                        </TableWrapper>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={exportPDF} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#b80000", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFilePdf />Exportar como PDF
                                </button>
                                <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#1D6f42", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFileExcel /> Exportar como Excel
                                </button>
                                <button onClick={exportCSV} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#0b72d2ff", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFileCsv /> Exportar como CSV
                                </button>
                            </div>


                        </div>

                    </FormStyled>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(1)} disabled={currentPage === 1}>«</button>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                        {(() => {
                            const out = [];
                            const maxButtons = 7;
                            let start = Math.max(1, page - 3);
                            let end = Math.min(totalPages, start + maxButtons - 1);
                            if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

                            for (let p = start; p <= end; p++) {
                                out.push(
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        aria-current={p === currentPage ? "page" : undefined}
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: 8,
                                            border: p === currentPage ? "2px solid #1b1464" : "1px solid #ddd",
                                            background: p === currentPage ? "#1b1464" : "#fff",
                                            color: p === currentPage ? "#fff" : "#222",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            return out;
                        })()}
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(Math.max(1, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>»</button>
                    </div>
                </Container>

                {modalOpen && modalForm && (
                    <ModalOverlay>
                        <ModalContent>
                            <Title>
                                DETALHES DA EXUMAÇÃO
                            </Title>
                            <ModalGrid>
                                <Label>Nome: <div>{modalForm.nome_sep || "-"}</div></Label>
                                <Label>Data e hora: <div>{modalForm.dh_exu ? new Date(modalForm.dh_exu).toLocaleString() : "-"}</div></Label>
                                <Label>Quadra: <div>{modalForm.quadra_sep ?? "-"}</div></Label>
                                <Label>Sepultura: <div>{modalForm.num_sepultura_sep || "-"}</div></Label>
                                <Label>Destinação: <div>{modalForm.destino || "-"}</div></Label>
                                <Label>Responsável: <div>{modalForm.coveiro || "-"}</div></Label>
                                <Label>Observações: <div>{modalForm.obs_exu || "-"}</div></Label>
                            </ModalGrid>

                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal}>Fechar</BtnPrimaryClose>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </MainLayout >
            <Footer />
        </div>
    )
}