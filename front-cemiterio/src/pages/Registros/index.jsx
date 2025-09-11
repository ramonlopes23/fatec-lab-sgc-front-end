import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import {
  FormStyled, Container, Title, SearchBar, SearchInput, SmallSelect,
  BtnPrimary, SmallInput, TwoCols, Field, SearchWrapper, SearchIcon, Label, ModalContent, ModalGrid, ModalOverlay
} from "./styles";
import api from "../../services/api";

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

      const findFalecidoForSep = (sep) =>{
        const fk = sep.falecidoId ?? sep.falecido_id ?? sep.falecido;
        if(fk !==undefined && fk !=null){
          const s = String(fk);
          return falecidosData.find(f=>String(f.id)===s)
        }
        return null;
      };

      const findExuForSep = (sep)=>{
        const fk = sep.sepultamentoId ?? sep.sepultamento_id?? sep.sepultamento;
        if(fk !==undefined && fk !==null){
          const s = String(sep.id);
          return exumacoesData.find(e=>String(e.sepultamentoId??e.sepultamento_id ?? e.sepultamento)===s) || null;
        }
        return exumacoesData.find(e=>String(e.sepultamentoId??e.sepultamentoId??e.sepultamento)===String(sep.id)) || null;
      }

      const enriched = sepultamentosData.map(sep => {
        const fal = findFalecidoForSep(sep) ||{};
        const exu = findExuForSep(sep)||{};

        return {
          ...sep,
          nome_fal: fal.nome || sep.nome_sep || "",
          idade: fal.idade || fal.id || "",
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
          residenciaPreview: fal.residenciaPreview || "",
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

  },[]);

const filteredRegistros = registros.filter((item) => {
  const searchNormalized = String(search || "").trim().toLowerCase();
  const nomeField = String(item?.nome_sep || "");
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
                placeholder="Pesquisar por nome, palavra-chave, termo..."
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon onClick={loadAll}>
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
              <BtnPrimary>Aplicar Filtros</BtnPrimary>
            </Field>
          </TwoCols>
        </FormStyled>

        <table>
          <thead>
            <tr>
              <th>Falecido</th>
              <th>Data do sepultamento</th>
              <th>Data de vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistros.map((registro) => (
              <tr key={registro.id}>
                <td>{registro.nome_sep || "-"}</td>
                <td>{registro.dh_sep ? formatarData(registro.dh_sep) : "-"}</td>
                <td>{registro.dh_sep ? calcularVencimento(registro.dh_sep) : "-"}</td>
                <td>
                  <button onClick={() => handleVisualizar(registro)}>
                    <FaEye />
                  </button>
                  <button onClick={() => handleEditar(registro.id)}>
                    <FaPen />
                  </button>
                  <button onClick={() => handleArquivar(registro.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
