import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import { BtnPrimaryClose, BtnPrimarySave, Container, FormStyled, SearchBar, SearchIcon, SearchWrapper, TableWrapper, Title, Card, TableScroller,TBody,THead,Table,Td,Th,Tr } from "./styles";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { AiOutlineUserSwitch } from "react-icons/ai";
import api from "../../services/api";
import React, { useMemo, useState } from "react"

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
    const [titulos, setTitulos] = useState("");
    const [form, setForm] = useState(INITIAL_FORM);
    const [erros, setErrors] = useState({});

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

    const openModal = () => {
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

        if (form.validade_titulo) {
            const date = new Date(`${form.validade_titulo}`);
            if (Number.isNaN(date.getTime())) {
                nextErrors.validade_titulo = "Data de validade em formato inválido";
            }
        }

        const numeroNormalizado = form.numero_titulo.trim().toLowerCase();
        const isDuplicated = titulos.some(
            (item) => String(item.numero_titulo || "").trim().toLowerCase() === numeroNormalizado
        );
        if (isDuplicated) {
            nextErrors.numero_titulo = "Já existe um título com esse número";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleCreateTitulo = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const novoTitulo = {
            id: `t-${Date.now()}`,
            nomeTitular: form.nomeTitular.trim(),
            numeroTitulo: form.numeroTitulo.trim(),
            status: form.status,
            validadeTitulo: form.validadeTitulo,
            sepultura: form.sepultura.trim(),
            quadra: form.quadra.trim(),
        };

        setTitulos((prev) => [novoTitulo, ...prev]);
        closeModal();
    };

    const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

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
                        <BtnPrimaryClose type="button" disabled style={{opacity:0.6, cursor:"not-allowed"}}>
                            <AiOutlineUserSwitch />Alterar responsável pelo título
                        </BtnPrimaryClose>
                    </div>

                    <Card>
                        <h3 style={{marginTop:0, color:"#191970"}}>Títulos cadastrados</h3>
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
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {filteredTitulos.length > 0?(
                                            filteredTitulos.map((item, index)=>(
                                                <Tr key={item.id} index={index}>
                                                    <Td>{item.numero_titulo}</Td>
                                                    <Td>{item.nome_titular}</Td>
                                                    <Td>{statusLabel(item.status)}</Td>
                                                    <Td>{formatDateBR(item.validade_titulo)}</Td>
                                                    <Td>{item.sepultura}</Td>
                                                    <Td>{item.quadra}</Td>
                                                </Tr>
                                            ))
                                        ):(
                                            <tr>
                                                <Td colSpan={6}>Nenhum título encontrado.</Td>
                                            </tr>
                                        )}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    </Card>


                </Container>
            </MainLayout>
            <Footer />
        </>
    )
}