import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { BtnPrimary, BtnPrimaryClose, BtnPrimarySave, ColumnLeft, ColumnRight, Container, Field, FormStyled, SearchBar, SearchIcon, SearchInput, SearchWrapper, SmallInput, SmallSelect, Title, TwoCols } from "./styles"
import { FaFileExcel, FaFilePdf, FaSearch } from "react-icons/fa";


export default function Exumacoes() {

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        quadra: "",
        tipo_sep: "",
        data_inicio: "",
        data_fim: ""
    });
    const [exumacoes, setExumacoes] = useState([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {

    }, []);

    const filtered = exumacoes.filter(() => true);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Number(page || 1)), totalPages);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);



    return (
        <div>
            <MainLayout>
            <Container>
                <FormStyled>
                    <Title>BUSCAR EXUMAÇÕES</Title>
                    <SearchBar>
                        <SearchWrapper>
                            <SearchInput placeholder="Pesquisar por nome do falecido" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }} />
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>

                        </SearchWrapper>
                    </SearchBar>

                    <TwoCols style={{ marginTop: 12 }}>
                        <ColumnLeft style={{ flex: 1 }}>
                            <SmallSelect value={filters.quadra} onChange={(e) => setFilters(prev => ({ ...prev, quadra: e.target.value }))}>
                                <option value="">Selecione a quadra</option>
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
                            <SmallInput style={{width:110}} type="date" value={filters.data_inicio} onChange={(e) => setFilters(prev => ({ ...prev, data_inicio: e.target.value }))} />
                            <SmallInput style={{width:110}} type="date" value={filters.data_fim} onChange={(e) => setFilters(prev => ({ ...prev, data_fim: e.target.value }))} />

                        </Field>
                        <Field
                            style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                            <BtnPrimary type="button" onClick={() => { }}>
                                Aplicar filtros
                            </BtnPrimary>
                        </Field>
                    </TwoCols>

                    <div style={{ marginTop: 20, borderRadius: 8, background: "#fff", padding: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
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
                                            Nenhuma exumação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((e, i) => (
                                        <tr key={e.id ?? i} style={{ borderBottom: "1px solid #f1f1f1" }}>
                                            <td style={{ padding: "12px 16px" }}>{e.nome_fal || "-"}</td>
                                            <td style={{ padding: "12px 16px" }}>{e.dh_exu ? new Date(e.dh_exu).toLocaleDateString() : "-"}</td>
                                            <td style={{ padding: "12px 16px" }}>{`${e.quadra_sep ?? e.num_quadra ?? "-"} - ${e.num_sepultura_sep ?? ""}`}</td>
                                            <td style={{ padding: "12px 16px" }}>{e.destino || "-"}</td>
                                            <td style={{ padding: "12px 16px" }}>{e.coveiro || "-"}</td>
                                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                <button><FaSearch /></button>
                                            </td>
                                        </tr>

                                    ))
                                )}</tbody>
                        </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button type="button" style={{display:"inline-flex", alignItems:"center", gap:8, padding: "10px 14px", borderRadius:8, background:"#b80000", color:"#fff", border:"none", cursor:"pointer"}}>
                                <FaFilePdf/>Exportar como PDF
                            </button>
                            <button type="button" style={{display:"inline-flex", alignItems:"center", gap:8, padding: "10px 14px", borderRadius:8, background:"#1D6f42", color:"#fff", border:"none", cursor:"pointer"}}>
                                <FaFileExcel /> Exportar como Excel
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button type="button" onClick={()=>setPage(1)} disabled={currentPage===1}>«</button>
                            <button type="button" onClick={()=>setPage(Math.max(1,currentPage - 1))} disabled={currentPage===1}>‹</button>
                            <span style={{ minWidth: 40, textAlign: "center" }}>{currentPage}/{totalPages}</span>
                            <button type="button" onClick={()=>setPage(Math.max(1,currentPage +1))} disabled={currentPage===totalPages}>›</button>
                            <button type="button" onClick={()=>setPage(totalPages)} disabled={currentPage===totalPages}>»</button>
                        </div>
                    </div>

                </FormStyled>
            </Container>
            </MainLayout >
            <Footer />
        </div>
    )
}