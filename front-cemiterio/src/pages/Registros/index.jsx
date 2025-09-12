import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import {
  Card, TableWrapper, Table, THead, Th, TBody, Tr, Td, Actions, IconBtn, TableScroller, FormStyled, Container, Title, SearchBar, SearchInput, SmallSelect,
  BtnPrimary, SmallInput, TwoCols, Field, SearchWrapper, SearchIcon, Label, ModalContent, ModalGrid, ModalOverlay
} from "./styles";
import api from "../../services/api";
/* import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack'; */

export default function Registros() {
  const [modalOpen, setModalOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [falecidos, setFalecidos] = useState([]);
  const [exumacoes, setExumacoes] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    status: "",
    quadra: "",
    rua: "",
    sepultura: ""
  });

  const loadAll = async () => {
    try {
      const [resFalecidos, resExumacoes, resSepultamentos] = await Promise.all([
        api.get("/falecidos"),
        api.get("/exumacoes"),
        api.get("/sepultamentos"),

      ]);

      const falecidosData = resFalecidos.data || [];
      const exumacoesData = resExumacoes.data || [];
      const sepultamentosData = resSepultamentos.data || [];

      const findFalecidoForSep = (sep) => {
        const fk = sep.falecidoId ?? sep.falecido_id ?? sep.falecido;
        if (fk !== undefined && fk != null) {
          const s = String(fk);
          return falecidosData.find(f => String(f.id) === s)
        }
        return null;
      };

      const findExuForSep = (sep) => {
        const sepId = String(sep.id);
        return exumacoesData.find(e => String(e.sepultamentoId ?? e.sepultamento_id ?? e.sepultamento) === sepId) || null;
      };

      const enriched = sepultamentosData.map(sep => {
        const fal = findFalecidoForSep(sep) || {};
        const exu = findExuForSep(sep) || {};
        return {
          ...sep,
          nome_fal: fal.nome_fal || fal.nome || sep.nome_sep || "",
          idade: fal.idade || "",
          cpf: fal.cpf || "",
          rg: fal.rg || "",
          data_nasc: fal.data_nasc || "",
          dh_falec: fal.dh_falec || "",
          filiacao_pai: fal.filiacao_pai || "",
          filiacao_mae: fal.filiacao_mae || "",
          profissao: fal.profissao || "",
          estado_civil: fal.estado_civil || "",
          nacionalidade: fal.nacionalidade || "",
          causa_mortis: fal.causa_mortis || "",
          nome_doutor: fal.nome_doutor || "",
          certidao_obito: fal.certidao_obito || "",
          residenciaPreview: fal.residenciaPreview || fal.residencia_preview || "",
          nome_resp: fal.nome_resp || "",
          tel_resp: fal.tel_resp || "",
          endereco_resp: fal.endereco_resp || "",
          doc_resp: fal.doc_resp || "",
          cor: fal.cor || "",
          exumacao: exu,
          dh_exu: exu.dh_exu || "",
          motivo_exu: exu.motivo_exu || "",

        };
      });

      setFalecidos(falecidosData);
      setExumacoes(exumacoesData);
      setRegistros(enriched);

    } catch (error) {
      console.error("Erro ao carregar registros", error);
    }
  };

  useEffect(() => {
    loadAll();

  }, []);

  const filteredRegistros = registros.filter((item) => {
    const searchNormalized = String(search || "").trim().toLowerCase();
    const nomeField = String(item?.nome_fal || item?.nome_sep || "");
    const searchMatch = !searchNormalized || nomeField.toLowerCase().includes(searchNormalized);

    const tipoMatch = filters.tipo ? item.tipo === filters.tipo : true;
    const quadraMatch = filters.quadra ? item.quadra?.toString() === filters.quadra : true;
    const ruaMatch = filters.rua ? item.rua?.toString() === filters.rua : true;
    const sepulturaMatch = filters.sepultura ? item.sepultura?.toString() === filters.sepultura : true;

    return searchMatch && tipoMatch && quadraMatch && ruaMatch && sepulturaMatch;
  });

  const handleVisualizar = (registro) => {

    setRegistroSelecionado(registro)
    setModalOpen(true);
  };

  const handleEditar = (id) => {
    window.location.href = `/editar/${id}`;
  };

  const handleArquivar = async (id) => {
    try {
      await api.patch(`/sepultamentos/${id}`, { arquivado: true });
      loadAll();
    } catch (error) {
      console.error("Erro ao arquivar", error);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const normalizado = data.length === 16 ? data + ":00" : data;
    return new Date(normalizado).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const calcularVencimento = (dh_sep) => {
    if (!dh_sep) return "-";
    const data = new Date(dh_sep);
    data.setFullYear(data.getFullYear() + 3);
    return data.toLocaleDateString("pt-BR");
  };

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const currentPage = Number(page) || 1;
  const totalPages = Math.max(1, Math.ceil(filteredRegistros.length / PAGE_SIZE));
  const paginatedRegistros = filteredRegistros.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => {
    console.log({ currentPage, PAGE_SIZE, totalPages, totalItems: filteredRegistros.length, pageSlice: paginatedRegistros.length });
  }, [currentPage, PAGE_SIZE, totalPages, filteredRegistros.length]);

  const goToPrev = () => setPage(prev => {
    const num = Number(prev) || 1;
    return Math.max(1, num - 1);
  });

  const goToNext = () => setPage(prev => {
    const num = Number(prev) || 1;
    return Math.min(totalPages, num + 1);
  });

  const goToPage = (n) => {
    const num = Number(n) || 1;
    setPage(Math.min(Math.max(1, num), totalPages));
  };



  return (
    <div>
      <MainLayout>
        <Container>
          <FormStyled>
            <Title>BUSCAR REGISTROS</Title>
            <SearchBar>
              <SearchWrapper>
                <SearchInput
                  type="text"
                  name="busca"
                  placeholder="Pesquisar por nome"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <SearchIcon type="button" onClick={loadAll}>
                  <FaSearch />
                </SearchIcon>
              </SearchWrapper>
            </SearchBar>

            <TwoCols>
              <SmallSelect name="tipo_sep">
                <option value="">Selecione o tipo de sepultura</option>
                <option value="Cova">Cova</option>
                <option value="Gaveta">Gaveta</option>
              </SmallSelect>
            </TwoCols>

            <TwoCols>
              <Field>
                <SmallInput placeholder="Digite o número da quadra" />
                <SmallInput placeholder="Digite o número da rua" />
                <SmallInput placeholder="Digite o número da sepultura" />
                <BtnPrimary type="button">Aplicar Filtros</BtnPrimary>
              </Field>
            </TwoCols>

            <TableWrapper>
              <TableScroller>
                <Table>
                  <THead>
                    <tr>
                      <Th>Falecido</Th>
                      <Th>Data do sepultamento</Th>
                      <Th>Data de vencimento</Th>
                      <Th style={{ width: 160 }}>Ações</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {paginatedRegistros.map((registro, index) => (

                      <Tr key={`${registro.id}-${(currentPage - 1) * PAGE_SIZE + index}`}>
                        <Td style={{ maxWidth: 320 }}>{registro.nome_sep || "-"}</Td>
                        <Td>{registro.dh_sep ? formatarData(registro.dh_sep) : "-"}</Td>
                        <Td>{registro.dh_sep ? calcularVencimento(registro.dh_sep) : "-"}</Td>
                        <Td>
                          <Actions>
                            <IconBtn type="button" onClick={() => handleVisualizar(registro)}>
                              <FaEye />
                            </IconBtn>
                            <IconBtn type="button" onClick={() => handleEditar(registro.id)}>
                              <FaPen />
                            </IconBtn>
                            <IconBtn type="button" onClick={() => handleArquivar(registro.id)}>
                              <FaTrash />
                            </IconBtn>
                          </Actions>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableScroller>
            </TableWrapper>

          </FormStyled>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 16, gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              aria-label="Primeira página"
            >
              «
            </button>

            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              aria-label="Página anterior"
            >
              ‹
            </button>

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
                    onClick={() => goToPage(p)}
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

            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              aria-label="Próxima página"
            >
              ›
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              aria-label="Última página"
            >
              »
            </button>

          </div>

          {modalOpen && registroSelecionado && (
            <ModalOverlay>
              <ModalContent>
                <Title>INFORMAÇÕES DO FALECIDO</Title>
                <ModalGrid>
                  <Label>Nome: <span>{registroSelecionado.nome_fal || "-"}</span></Label>
                  <Label>Idade: <span>{registroSelecionado.idade || "-"}</span></Label>
                  <Label>Sexo: <span>{registroSelecionado.sexo || "-"}</span></Label>
                  <Label>Cor: <span>{registroSelecionado.cor || "-"}</span></Label>
                  <Label>Data de nascimento: <span>{registroSelecionado.data_nasc || "-"}</span></Label>
                  <Label>Data e hora de falecimento: <span>{registroSelecionado.dh_falec || "-"}</span></Label>
                  <Label>Data de sepultamento: <span>{registroSelecionado.dh_sep || "-"}</span></Label>
                  <Label>Filiação pai: <span>{registroSelecionado.filiacao_pai || "-"}</span></Label>
                  <Label>Filiação mãe: <span>{registroSelecionado.filiacao_mae || "-"}</span></Label>
                  <Label>CPF: <span>{registroSelecionado.cpf || "-"}</span></Label>
                  <Label>Profissão: <span>{registroSelecionado.profissao || "-"}</span></Label>
                  <Label>Estado civil: <span>{registroSelecionado.estado_civil || "-"}</span></Label>
                  <Label>Nacionalidade: <span>{registroSelecionado.nacionalidade || "-"}</span></Label>
                  <Label>Causa mortis: <span>{registroSelecionado.causa_mortis || "-"}</span></Label>
                  <Label>Nome do doutor: <span>{registroSelecionado.nome_doutor || "-"}</span></Label>
                  <Label>Certidão de óbito: <span>{registroSelecionado.certidao_obito || "-"}</span></Label>
                  <Label>Comprovante de residência: <span>{registroSelecionado.residenciaPreview || "-"}</span></Label>
                  <Label>Responsável: <span>{registroSelecionado.nome_resp || "-"}</span></Label>
                  <Label>Contato do responsável: <span>{registroSelecionado.tel_resp || "-"}</span></Label>
                  <Label>Endereço do responsável <span>{registroSelecionado.endereco_resp || "-"}</span></Label>
                  <Label>CPF do responsável: <span>{registroSelecionado.doc_resp || "-"}</span></Label>
                  <Label>Quadra: <span>{registroSelecionado.quadra_sep || "-"}</span></Label>
                  <Label>Rua: <span>{registroSelecionado.rua_sep || "-"}</span></Label>
                  <Label>Nº da sepultura: <span>{registroSelecionado.num_sepultura_sep || "-"}</span></Label>
                  <Label>Tipo de sepultura: <span>{registroSelecionado.tipo_sep || "-"}</span></Label>
                </ModalGrid>
                <BtnPrimary onClick={() => setModalOpen(false)}>Fechar</BtnPrimary>
              </ModalContent>
            </ModalOverlay>
          )}
        </Container>
      </MainLayout>
      <Footer />
    </div>

  );
}
