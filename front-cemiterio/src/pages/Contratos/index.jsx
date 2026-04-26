import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import { BtnPrimaryClose, BtnPrimarySave, Container, FormStyled, SearchBar, SearchIcon, SearchWrapper, TableWrapper, Title, Card, TableScroller, TBody, THead, Table, Td, Th, Tr, ModalOverlay, ModalContent, ModalGrid, Input, Actions, IconBtn } from "./styles";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { AiOutlineUserSwitch } from "react-icons/ai";
import api from "../../services/api";
import React, { useEffect, useMemo, useState } from "react"
import { FaEdit, FaTrash } from "react-icons/fa";

const STATUS_OPTIONS = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
    { value: "vencido", label: "Vencido" }
];

const INITIAL_FORM = {
    nome_titular: "",
    numero_titulo: "",
    status: "ativo",
    validade_titulo: "",
    sepultura: "",
    quadra: "",
    capacidade: "",
};

function formatDateBR(value) {
    if (!value) return "-";
    const [y, m, d] = String(value).split("-");
    if (!y || !m || !d) return value;
    return `${d}/${m}/${y}`;
}

function statusLabel(status) {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.label : status;
}


export default function Contratos() {
    const [query, setQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [titulos, setTitulos] = useState([]);
    const [quadrasDisponiveis, setQuadrasDisponiveis] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);

    const filteredTitulos = useMemo(() => {
        const q = String(query || "").trim().toLowerCase();
        if (!q) return titulos;

        return titulos.filter((item) => {
            const byNumero = String(item.numero_titulo || "").toLowerCase().includes(q);
            const byTitular = String(item.nome_titular || "").toLowerCase().includes(q);
            return byNumero || byTitular;
        })
    }, [query, titulos]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const getQuadraLabel = (quadraValue) => {
        const value = String(quadraValue || "");
        const found = (quadrasDisponiveis || []).find(
            (q) => String(q?.id) === value || String(q?.num_quadra) === value
        );
        if (!found) return quadraValue || "-";
        return found?.num_quadra ? String(found.num_quadra) : String(found.id);
    };

    const openModal = () => {
        setEditingId(null)
        setForm(INITIAL_FORM);
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false)
        setForm(INITIAL_FORM);
        setErrors({});
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!form.nome_titular.trim()) nextErrors.nome_titular = "Informe o nome do titular";
        if (!form.numero_titulo.trim()) nextErrors.numero_titulo = "Informe o número do título";
        if (!form.status.trim()) nextErrors.status = "Informe o status do título";
        if (!form.validade_titulo.trim()) nextErrors.validade_titulo = "Informe a validade do título";
        if (!form.sepultura.trim()) nextErrors.sepultura = "Informe o número da sepultura";
        if (!form.quadra.trim()) nextErrors.quadra = "Informe o número da quadra";
        if (!String(form.capacidade ?? "").trim()) nextErrors.capacidade = "Informe a capacidade da sepultura";

        if (form.validade_titulo) {
            const date = new Date(`${form.validade_titulo}`);
            if (Number.isNaN(date.getTime())) {
                nextErrors.validade_titulo = "Data de validade em formato inválido";
            }
        }

        if (String(form.capacidade || "").trim()) {
            const capacidadeNum = Number(form.capacidade);
            if (Number.isNaN(capacidadeNum) || capacidadeNum <= 0) {
                nextErrors.capacidade = "A capacidade deve ser maior que zero";
            }
        }

        const numeroNormalizado = form.numero_titulo.trim().toLowerCase();
        const isDuplicated = titulos.some(
            (item) => item.id !== editingId && String(item.numero_titulo || "").trim().toLowerCase() === numeroNormalizado
        );
        if (isDuplicated) {
            nextErrors.numero_titulo = "Já existe um título com esse número";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

    const createParticularCovaFromContrato = async () => {
        const quadraInput = String(form.quadra || "").trim();
        const num_cova = String(form.sepultura || "").trim();
        const nomeTitular = String(form.nome_titular || "").trim();
        const numeroTitulo = String(form.numero_titulo || "").trim();
        const capacidadeNum = Number(form.capacidade);

        const { data: quadrasData } = await api.get("/quadras");
        const quadras = Array.isArray(quadrasData) ? quadrasData : [];

        const quadraEncontrada = quadras.find((q) => {
            const byId = String(q?.id ?? "") === quadraInput;
            const byNumero = String(q?.num_quadra ?? "") === quadraInput;
            const byNome = String(q?.nome ?? "").replace("Quadra ", "") === quadraInput;
            return byId || byNumero || byNome;
        });

        if (!quadraEncontrada?.id) {
            throw new Error("Quadra não encontrada. Informe uma quadra já cadastrada.");
        }

        const quadraSelecionada = (quadrasDisponiveis || []).find(
            (q) => String(q?.id) === String(form.quadra)
        )

        if (!quadraSelecionada?.id) {
            throw new Error("Quadra inválida. Selecione uma quadra já cadastrada");
        }

        const quadra_cova = String(quadraSelecionada.id);

        const { data: existingCovas } = await api.get("/covas", {
            params: { quadra_cova, num_cova },
        });

        if (Array.isArray(existingCovas) && existingCovas.length > 0) {
            throw new Error("Já existe uma cova com essa quadra e número");
        }

        const today = new Date().toISOString().slice(0, 10);

        await api.post("/covas", {
            quadra_cova,
            num_cova,
            tipo_cova: "cova",
            status: "reservada",
            capacidade: capacidadeNum,
            concessao: {
                ativa: true,
                responsavel: nomeTitular,
                prazo_anos: 0,
                data_inicio: today,
                data_fim: form.validade_titulo || "",
            },
            obs: `Título ${numeroTitulo}`,
        });
    };

    const handleSaveTitulo = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const now = new Date().toISOString();

            const payload = {
                nome_titular: form.nome_titular.trim(),
                numero_titulo: form.numero_titulo.trim(),
                status: form.status,
                validade_titulo: form.validade_titulo,
                sepultura: form.sepultura.trim(),
                quadra: form.quadra.trim(),
                capacidade: Number(form.capacidade),
                update_at: now,
            }

            if (editingId) {
                await api.put(`/contratos/${editingId}`, {
                    ...payload,
                    id: editingId,
                });
            } else {
                await createParticularCovaFromContrato();
                await api.post("/contratos", {
                    ...payload,
                    created_at: now,
                });
            }

            await loadContratos();
            closeModal();
            setEditingId(null);
        } catch (error) {
            console.error("Erro ao salvar contrato/titulo", error);
            alert(error?.message || "Não foi possivel salvar o título")
        }
    }

    const handleEditTitulo = (item) => {
        setEditingId(item.id);
        setForm({
            nome_titular: item.nome_titular || "",
            numero_titulo: item.numero_titulo || "",
            status: item.status || "ativo",
            validade_titulo: item.validade_titulo || "",
            sepultura: item.sepultura || "",
            quadra: item.quadra || "",
            capacidade: String(item.capacidade || ""),
        });
        setErrors({});
        setModalOpen(true);
    }

    const handleDeleteTitulo = async (id) => {
        const ok = window.confirm("Deseja realmente excluir este título?");
        if (!ok) return;

        try {
            await api.delete(`/contratos/${id}`);
            await loadContratos();
        } catch (error) {
            console.error("Error ao excluir título", error);
            alert("Não foi possível excluiro título");
        }
    }


    useEffect(() => {
        const loadContratos = async () => {
            try {
                const { data } = await api.get("/contratos");
                setTitulos(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erro ao carregar contratos", error);
                setTitulos([]);
            }
        };

        const loadQuadras = async () => {
            try {
                const { data } = await api.get("/quadras");
                const normalized = Array.isArray(data) ? data : [];
                normalized.sort((a, b) => {
                    const av = Number(a?.num_quadra);
                    const bv = Number(b?.num_quadra);
                    if (!Number.isNaN(av) && !Number.isNaN(bv)) return av - bv;
                    return String(a?.num_quadra ?? a?.id ?? "").localeCompare(
                        String(b?.num_quadra ?? b?.id ?? "")
                    );
                });
                setQuadrasDisponiveis(normalized);
            } catch (error) {
                console.error("Erro ao carregar quadras", error);
                setQuadrasDisponiveis([]);
            }
        };

        loadContratos();
        loadQuadras();
    }, []);


    const loadContratos = async () => {
        try {
            const { data } = await api.get("/contratos");
            setTitulos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar contratos", error);
            setTitulos([]);
        }
    };

    return (
        <>
            <MainLayout>
                <Container>
                    <FormStyled >
                        <Title>CONTRATOS / TÍTULOS DE POSSE</Title>
                        <SearchBar />
                        <SearchWrapper>
                            <TextField
                                fullWidth
                                size="small"
                                label="Pesquisar"
                                placeholder="Pesquisar por titular ou Nº do título..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '18px',
                                        paddingRight: '44px'
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        fontSize: '14px'
                                    }
                                }}
                            />
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                        </SearchWrapper>
                    </FormStyled>

                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                        <BtnPrimarySave type="button" onClick={openModal}>
                            <ImProfile />Adicionar contrato/título
                        </BtnPrimarySave>
                        <BtnPrimaryClose type="button" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                            <AiOutlineUserSwitch />Alterar responsável pelo título
                        </BtnPrimaryClose>
                    </div>

                    <Card>
                        <h3 style={{ marginTop: 0, color: "#191970" }}>Títulos cadastrados</h3>
                        <TableWrapper>
                            <TableScroller>
                                <Table>
                                    <THead>
                                        <tr>
                                            <Th>Nº do Título</Th>
                                            <Th>Titular</Th>
                                            <Th>Status</Th>
                                            <Th>Validade</Th>
                                            <Th>Sepultura</Th>
                                            <Th>Quadra</Th>
                                            <Th>Capacidade</Th>
                                            <Th>Ações</Th>
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {filteredTitulos.length > 0 ? (
                                            filteredTitulos.map((item, index) => (
                                                <Tr key={item.id} index={index}>
                                                    <Td>{item.numero_titulo}</Td>
                                                    <Td>{item.nome_titular}</Td>
                                                    <Td>{statusLabel(item.status)}</Td>
                                                    <Td>{formatDateBR(item.validade_titulo)}</Td>
                                                    <Td>{item.sepultura}</Td>
                                                    <Td>{getQuadraLabel(item.quadra)}</Td>
                                                    <Td>{item.capacidade}</Td>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEditTitulo(item)} aria-label="Editar titulo">
                                                                <FaEdit />
                                                            </IconBtn>
                                                            <IconBtn type="button" onClick={() => handleDeleteTitulo(item.id)} aria-label="Excluir titulo" data-danger="true">
                                                                <FaTrash />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <Td colSpan={9}>Nenhum título encontrado.</Td>
                                            </tr>
                                        )}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    </Card>
                </Container>
            </MainLayout>

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#191970" }}>
                            Novo título de posse
                        </h3>

                        <form onSubmit={handleSaveTitulo}>
                            <ModalGrid>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Nome de titular</label>
                                    <Input
                                        value={form.nome_titular}
                                        onChange={(e) => updateField("nome_titular", e.target.value)}
                                        placeholder="Nome completo do titular"
                                    />
                                    {errors.nome_titular ? <p style={errorStyle}>{errors.nome_titular}</p> : null}
                                </div>

                                <div>
                                    <label>Número do título</label>
                                    <Input
                                        value={form.numero_titulo}
                                        onChange={(e) => updateField("numero_titulo", e.target.value)}
                                        placeholder="Ex: 000145"
                                    />
                                    {errors.numero_titulo ? <p style={errorStyle}>{errors.numero_titulo}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.status}
                                        onChange={(e) => updateField("status", e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "18px",
                                            },
                                            "& .MuiOutlinedInput-input": {
                                                fontSize: "14px",
                                            },
                                        }}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {errors.status ? <p style={errorStyle}>{errors.status}</p> : null}
                                </div>

                                <div>
                                    <label>Sepultura</label>
                                    <Input
                                        value={form.sepultura}
                                        onChange={(e) => updateField("sepultura", e.target.value)}
                                        placeholder="Exemplo: 05"
                                    />
                                    {errors.sepultura ? <p style={errorStyle}>{errors.sepultura}</p> : null}
                                </div>

                                <div>
                                    <label>Quadra</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.quadra}
                                        onChange={(e) => updateField("quadra", e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "18px",
                                            },
                                            "& .MuiOutlinedInput-input": {
                                                fontSize: "14px",
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            Selecione uma quadra
                                        </MenuItem>
                                        {quadrasDisponiveis.map((q) => (
                                            <MenuItem key={String(q.id)} value={String(q.id)}>
                                                {q?.num_quadra ? `Quadra ${q.num_quadra}` : `Quadra ${q.id}`}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {errors.quadra ? <p style={errorStyle}>{errors.quadra}</p> : null}
                                </div>

                                <div>
                                    <label>Validade do titulo</label>
                                    <Input
                                        type="date"
                                        value={form.validade_titulo}
                                        onChange={(e) => updateField("validade_titulo", e.target.value)}
                                    />
                                    {errors.validade_titulo ? <p style={errorStyle}>{errors.validade_titulo}</p> : null}
                                </div>

                                <div>
                                    <label>Capacidade</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={form.capacidade}
                                        onChange={(e) => updateField("capacidade", e.target.value)}
                                        placeholder="Exemplo: 3"
                                    />
                                    {errors.capacidade ? <p style={errorStyle}>{errors.capacidade}</p> : null}
                                </div>
                            </ModalGrid>


                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal}>
                                    Cancelar
                                </BtnPrimaryClose>
                                <BtnPrimarySave type="submit">Salvar título</BtnPrimarySave>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay >
            )
            }

            <Footer />
        </>
    )
}
