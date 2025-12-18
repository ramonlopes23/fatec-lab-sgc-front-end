import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import api from "../../services/api";
import React, { useState, useMemo, useEffect } from "react";
import { BtnPrimary, ColumnLeft, ColumnRight, Container, Field, FormActions, FormGrid, FormStyled, FormTop, Input, SelectTop, SmallLabel, Textarea, Title, TwoCols, InputCova } from "./styles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

export default function Cadastros() {

    const falecido = {
        nome_fal: "",
        idade: "",
        data_nasc: "",
        dh_falec: "",
        filiacao_pai: "",
        filiacao_mae: "",
        sexo: "",
        cor: "",
        cpf: "",
        rg: "",
        profissao: "",
        estado_civil: "",
        naturalidade: "",
        causa_mortis: "",
        nome_doutor: "",
        certidao_obito: "",
        obs_fal: "",
        residencia: "",
        residenciaPreview: "",
        nome_resp: "",
        doc_resp: "",
        tel_resp: "",
        endereco_resp: "",
    };

    const sepultamento = {
        nome_sep: "",
        data_obito_sep: "",
        dh_sep: "",
        titulo_posse: "",
        quadra_sep: "",
        num_sepultura_sep: "",
        coveiro_sep: "",
        obs_sep: "",
        taxa: "",
        taxa_valor: 0,
        foi_exumado: false
    }

    const taxa_map = {
        crianca: 56.12,
        crianca_fora: 224.54,
        adulto_terra: 112.27,
        adulto_fora: 430.42,
        adulto_laje: 280.71,
        indigente: 0
    }

    const taxa_label = {
        crianca: "CRIANÇA - R$56,12",
        crianca_fora: "CRIANÇA (FORA DO MUNICÍPIO) - R$224,54",
        adulto_terra: "ADULTO (TERRA) - R$112,27",
        adulto_fora: "ADULTO (FORA DO MUNICÍPIO) - R$430,42",
        adulto_laje: "ADULTO LAJE - R$280,71",
        indigente: "ISENÇÃO POR INDIGÊNCIA"
    }

    /* const formatCurrency = (v) => {
        if (v == null) return "-";
        return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
 */
    const STORAGE_KEY = "cadastro_form_state";

    const fieldSxStyle = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "24px"
        },
        "& .MuiOutlinedInput-input": {
            fontSize: "14px"
        },
        "& .MuiInputBase-input::placeholder": {
            opacity: 1
        }
    };

    const labelSxStyle = {
        fontSize: "14px"
    };

    const selectSxStyle = {
        borderRadius:"24px",
        fontSize:"14px"
    }

    const loadSavedState = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed;
            }
        } catch (err) {
            console.error("Erro ao carregar estado salvo:", err);
        }
        return null;
    }

    const saveState = (state) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error("Erro ao salvar estado:", err);
        }
    }

    const [form, setForm] = useState(() => {
        const saved = loadSavedState();
        return saved?.form || falecido;
    });
    const [processType, setProcessType] = useState(() => {
        const saved = loadSavedState();
        return saved?.processType || "Cadastro de falecido"
    });
    const [registros, setRegistros] = useState([]);
    const [falecidos, setFalecidos] = useState([]);
    /* const [cpf, setCpf] = useState(value || "");
    const [erro, setErro] = useState(""); */
    const [searchFal, setSearchFal] = useState(() => {
        const saved = loadSavedState();
        return saved?.searchFal || "";
    });

    const [filteredFalecidos, setFilteredFalecidos] = useState([]);
    const [showFalList, setShowFalList] = useState(false);
    const [busca, setBusca] = useState('');
    const [cidades, setCidades] = useState([]);
    const [cepResp, setCepResp] = useState(() => {
        const saved = loadSavedState();
        return saved?.cepResp || "";
    });
    const [loadingCep, setLoadingCep] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveState({
                form,
                processType,
                cepResp,
                searchFal
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [form, processType, cepResp, searchFal]);

    const clearSavedState = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error("Erro ao limpar o estado salvo", err)
        }
    }



    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
            .then(res => res.json())
            .then(data => setCidades(data));
    }, [])

    const fetchViaCep = async (cepDigits) => {
        if (!cepDigits || cepDigits.length !== 8) return null;
        try {
            setLoadingCep(true);
            const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
            const data = await res.json();
            setLoadingCep(false);
            if (!data || data.erro) {
                return null;
            }

            const formatted = `${data.logradouro || ""}${data.logradouro ? " - " : ""}${data.bairro || ""}${(data.bairro && data.localidade) ? " - " : ""}${data.localidade || ""}${data.uf ? " - " + data.uf : ""}`.trim();
            return { raw: data, formatted };
        } catch (err) {
            setLoadingCep(false);
            console.error("Erro fetch ViaCEP", err);
            return null;
        }
    };


    const resultados = cidades.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase())
    )


    const cpfMask = value => {
        const cpf = String(value || '').replace(/\D/g, '');

        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf[i]) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== parseInt(cpf[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf[i]) * (11 - i);
        }
        resto = (soma * 10) % 11
        if (resto === 10) resto = 0;
        if (resto !== parseInt(cpf[10])) return false;

        return true;

    };

    const rgMask = value => {
        const cleaned = String(value || '').replace(/[^0-9A-Za-z]/g, '');
        let letter = '';
        let core = cleaned;
        if (/[A-Za-z]$/.test(core)) {
            letter = core.slice(-1).toUpperCase();
            core = core.slice(0, -1);
        }
        const digits = core.replace(/\D/g, '').slice(0, 9);
        let out = digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2');

        if (letter) {
            if (!out) return letter;
            return out.includes('-') ? out + letter : out + '-' + letter;
        }
        return out;
    };

    const phoneMask = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 11)

        if (digits.length <= 10) {
            return digits
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2")
        } else {
            return digits
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace()
        }
    }

    useEffect(() => {
        if (!searchFal) {
            setFilteredFalecidos([]);
            setForm(prev => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }
        const s = String(searchFal).toLowerCase();
        setFilteredFalecidos((falecidos || []).filter(f => ((f.nome_fal || f.nome) || "").toLowerCase().includes(s)).slice(0, 10));
    }, [searchFal, falecidos])


    const [quadras, setQuadras] = useState([]);
    const [covas, setCovas] = useState([]);
    const [availableCovas, setAvailableCovas] = useState([]);

    const isCovaAvailable = (c, tituloPosse = "") => {
        const cap = Number(c?.capacidade ?? 0);
        if (cap <= 0) return false;
        const s = String(c?.status ?? "").toLowerCase();

        const tp = String(tituloPosse ?? "").toLowerCase();
        if (tp === "sim") {
            return (c.concessao && c.concessao.ativa === true) &&
                !s.includes("lotad") && !s.includes("indispon");
        }
        if (s.includes("lotad") || s.includes("indispon") || s.includes("reserv") || s.includes("particular")) {
            return false;
        }
        return true
    };

    useEffect(() => {
        let mounted = true;
        Promise.all([api.get("/quadras"), api.get("/covas")]).then(([rq, rc]) => {
            if (!mounted) return;
            setQuadras(Array.isArray(rq.data) ? rq.data : []);
            setCovas(Array.isArray(rc.data) ? rc.data : []);
        }).catch(() => { if (mounted) { setQuadras([]); setCovas([]); } });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get("/falecidos").then(res => {
            if (!mounted) return;
            setFalecidos(res.data || []);
        }).catch(() => { if (mounted) setFalecidos([]); })
        return () => { mounted = false; };
    }, []);

    const handleQuadraSepChange = (val) => {
        setForm(prev => ({ ...prev, quadra_sep: val, num_sepultura_sep: "" }));
        setAvailableCovas(computeAvailableCovas(val, form.titulo_posse));
    };


    const handleProcessChange = (e) => {
        const val = e.target.value;
        setProcessType(val);
        if (val === "Cadastro de sepultamento") setForm(sepultamento);
        else setForm(falecido)
    };

    const updateFieldByName = (name, value) => {
        if (!name.includes(".")) {
            setForm(prev => ({ ...prev, [name]: value }));
            return;
        }
        const parts = name.split(".");
        setForm(prev => {
            const clone = { ...prev };
            let cur = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                const k = parts[i]
                cur[k] = (cur[k] && typeof cur[k] === "object") ? { ...cur[k] } : {};
                cur = cur[k]
            }
            cur[parts[parts.length - 1]] = value;
            return clone;
        });
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;

        if (name === "data_nasc" || name === "dh_falec") {
            const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

            if (name === "data_nasc") {
                const newDataNasc = value;
                if (!isEmpty(newDataNasc) && !isEmpty(form.dh_falec)) {
                    const dataNasc = new Date(newDataNasc);
                    const dhFalec = new Date(dhFalec);

                    if (dhFalec < dataNasc) {
                        console.warn("Data de falecimento é anterior a data de nascimento.")
                    }
                }
            }

            if (name === "data_nasc") {
                const newDhFalec = value;
                if (!isEmpty(newDhFalec) && !isEmpty(form.dh_falec)) {
                    const dataNasc = new Date(form.data_nasc);
                    const dhFalec = new Date(newDhFalec);

                    if (dhFalec < dataNasc) {
                        console.warn("Data de falecimento é anterior a data de nascimento.")
                    }
                }
            }
        }

        const cpfFields = ["cpf", "doc_resp"];

        if (cpfFields.includes(name)) {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

            const maskedCpf = digitsOnly
                .replace(/^(\d{3})(\d)/, "$1.$2")
                .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1-$2");
            updateFieldByName(name, maskedCpf);
            return;
        }

        if (name === "taxa") {
            const valor = taxa_map[value] ?? 0;
            updateFieldByName("taxa", value);
            updateFieldByName("taxa_valor", valor);
            return;
        }

        const phoneFields = ["tel_resp"];
        if (phoneFields.includes(name)) {
            const masked = phoneMask(value);
            updateFieldByName(name, masked);
            return
        }

        if (name === "rg") {
            const masked = rgMask(value);
            updateFieldByName("rg", masked)
            return;
        }


        updateFieldByName(name, incoming)
    };

    const handleSelectFalecido = (val) => {
        const raw = val === undefined || val === null ? "" : String(val).trim();
        if (raw === "") {
            setForm(prev => ({ ...prev, falecido_id: "", falecido: "", nome_sep: "" }));
            return;
        }
        const byStringId = falecidos.find(x => String(x.id) === raw);
        let f = byStringId;
        if (!f) {
            const pid = parseInt(raw, 10);
            if (!Number.isNaN(pid)) {
                f = falecidos.find(x => Number(x.id) === pid);
            }
        }
        if (!f) {
            console.warn("Falecido não encontrado para o valor selecionado:", raw);
        }
        const id = f ? f.id : (Number.isNaN(parseInt(raw, 10)) ? "" : parseInt(raw, 10));
        setForm(prev => ({ ...prev, falecido_id: id, falecido: id, nome_sep: f ? (f.nome_fal || f.nome) : "" }));
    };



    const validateDates = () => {
        if (processType !== "Cadastro de falecido") return true;

        const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
        if (!isEmpty(form.data_nasc) && !isEmpty(form.dh_falec)) {
            const dataNasc = new Date(form.data_nasc);
            const dhFalec = new Date(form.dh_falec);

            if (isNaN(dataNasc.getTime())) {
                alert("Data de nascimento inválida");
                return false;
            }

            if (isNaN(dhFalec.getTime())) {
                alert("Data e hora de falecimento inválida");
                return false;
            }

            if (dhFalec < dataNasc) {
                alert("A data de falecimento não pode ser anterior a data de nascimento");
                return false;
            }


        }
        return true;

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) {
            return;
        }

        const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

        let requiredTemplate = {};
        if (processType === "Cadastro de falecido") requiredTemplate = falecido;
        else if (processType === "Cadastro de sepultamento") requiredTemplate = sepultamento;


        const requiredKeys = Object.keys(requiredTemplate);
        const missing = requiredKeys.filter((k) => {
            if (typeof requiredTemplate[k] === "boolean") return false;
            return isEmpty(form[k])
        });

        if (missing.length) {
            console.group("%cValidação de cadastro falhou", "color: #b00; font-weight:700");
            console.log("processType:", processType);
            console.log("requiredKeys:", requiredKeys);
            console.log("form (valores):", form);
            console.log("missing keys:", missing);
            missing.forEach(k => console.log(`-> '${k}':`, form[k]));
            console.groupEnd();
            alert("Preencha todos os campos obrigatórios antes de salvar");
            return;
        }

        try {

            if (processType === "Cadastro de falecido") {

                const payload = {
                    ...form,
                    data_nasc: form.data_nasc ? new Date(form.data_nasc).toISOString().split('T')[0] : "",
                    dh_falec: form.dh_falec ? new Date(form.dh_falec).toISOString() : ""
                };

                await api.post("/falecidos", payload);
                alert("Falecido cadastrado");
                clearSavedState();
                setForm(falecido);

            }

            else if (processType === "Cadastro de sepultamento") {

                const payload = { ...form };
                if (!payload.nome_sep && payload.falecido) {
                    const f = falecidos.find(x => Number(x.id) === Number(payload.falecido));
                    if (f) payload.nome_sep = f.nome_fal || f.nome;
                }

                payload.taxa_valor = Number(payload.taxa_valor ?? taxa_map[payload.taxa] ?? 0);
                payload.taxa_label = taxa_label[payload.taxa] ?? "";

                payload.foi_exumado = false;


                try {

                    const paramsCheck = { params: { quadra_cova: payload.quadra_sep, num_cova: payload.num_sepultura_sep } }
                    const rCheck = await api.get("/covas", paramsCheck).catch(() => null);
                    const foundCheck = rCheck && Array.isArray(rCheck.data) && rCheck.data.length ? rCheck.data[0] : null;
                    if (foundCheck && foundCheck.id != null) {
                        const cap = Number(foundCheck.capacidade ?? 0);
                        if (cap > 0) {
                            try {
                                const res = await api.post("/sepultamentos", payload);
                                const created = res?.data ?? null;

                                try {
                                    if (created)
                                        window.dispatchEvent(new CustomEvent("processoCriado", { detail: created }));

                                } catch (e) {
                                    { e }
                                }
                                setRegistros(prev => ([...prev, { processType, data: payload }]));
                                alert("Sepultamento cadastrado (pendente). Confirme na Dashboard para concluir.");
                                clearSavedState();
                                setForm(sepultamento);

                            } catch (err) {
                                console.warn("Erro ao salvar sepultamento", err)
                                alert("Erro ao salvar sepultamento")
                            }

                        }
                        else {
                            alert("Tipo de processo inválido")
                        }
                    }

                    setRegistros(prev => ([...prev, { processType, data: form }]));
                }
                catch (err) {
                    console.error(err);
                    alert(`Erro ao cadastrar processo ${processType}`);

                }
            }
        }
        catch (e) {
            e
        }
    }

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            setForm(prev => ({ ...prev, [fieldName]: null, [`${fieldName}Preview`]: "" }))
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm(prev => ({ ...prev, [fieldName]: file, [`${fieldName}Preview`]: reader.result }))
        };
        reader.readAsDataURL(file);

    };

    const computeAvailableCovas = (quadraId, tituloPosse) => {
        if (!quadraId) return [];
        const list = covas.filter(c => {
            const key = String(c.quadra_cova ?? c.quadra ?? c.quadra_sep ?? "");
            return String(key) === String(quadraId);
        });

        const tp = String(tituloPosse ?? "").toLowerCase();
        let out = list;

        if (tp === "sim") {
            out = list.filter(c => !!(c.concessao && c.concessao.ativa));
        }
        else if (tp === "não" || tp === "nao" || tp === "Não") {
            out = list.filter(c => !String(c.status ?? "").toLowerCase().includes("reserv"));
        } else {
            out = list;
        }
        out = out.filter(c => isCovaAvailable(c, tituloPosse));
        return out;
    };

    const normalizeCep = (v) => (String(v || "").replace(/\D/g, "").slice(0, 8));


    const handleCepChange = async (ev) => {
        const raw = ev.target.value || "";
        const digits = normalizeCep(raw);
        setCepResp(digits);

        /*         const display = digits.length > 5 ? digits.replace(/^(\d{5})(\d{1,3})/, "$1-$2") : digits;
         */
        if (digits.length === 8) {
            const found = await fetchViaCep(digits);
            if (found) {
                setForm(prev => ({ ...prev, endereco_resp: found.formatted }));
            } else {
                alert("CEP não encontrado. Verifique e tente novamente.");
            }
        }
    };

    const handleCepBlur = async () => {
        const digits = normalizeCep(cepResp);
        if (!digits || digits.length !== 8) return;
        const found = await fetchViaCep(digits);
        if (found) {
            setForm(prev => ({ ...prev, endereco_resp: found.formatted }));
        }
    };

    useEffect(() => {
        setAvailableCovas(computeAvailableCovas(form.quadra_sep, form.titulo_posse));
    }, [form.quadra_sep, form.titulo_posse, covas]);

    const tipoCovaSelecionada = useMemo(() => {
        if (!form.quadra_sep || !form.num_sepultura_sep) return "";
        const target = String(form.num_sepultura_sep);
        const byNumber = (list) => list.find(c =>
            String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "") === String(form.num_sepultura_sep)
        );
        let found = byNumber(availableCovas);
        if (!found) {
            found = covas.find(c =>
                String(c.quadra_cova ?? c.quadra ?? c.quadra_sep ?? "") === String(form.quadra_sep) &&
                String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "") === target
            );
        }
        return found?.tipo_cova ?? "";

    }, [form.quadra_sep, form.num_sepultura_sep, form.num_sepultura, covas, availableCovas]);

    return (
        <div>
            <MainLayout>
                <Container>
                    <FormStyled onSubmit={handleSubmit}>
                        <Title>CADASTRO DE PROCESSOS</Title>
                        <FormTop>
                            <SmallLabel>Selecione qual processo deseja cadastrar</SmallLabel>
                            <SelectTop name="processo" value={processType} onChange={handleProcessChange}>
                                <option>Cadastro de falecido</option>
                                <option>Cadastro de sepultamento</option>
                            </SelectTop>
                        </FormTop>

                        <FormGrid>
                            {/* {processType === "Cadastro de velório" ? (
                                <>
                                    <ColumnLeft>
                                        <Field>
                                            <label>Nome do falecido</label>
                                            <Input name="nome_vel" value={form.nome_vel} onChange={handleChange} placeholder="Digite o nome do falecido" />
                                        </Field>
                                        <TwoCols>
                                            <Field>
                                                <label>Data do velório</label>
                                                <Input type="date" name="data_velorio" value={form.data_velorio} onChange={handleChange} />
                                            </Field>
                                            <Field>
                                                <label>Sala</label>
                                                <Input name="sala" value={form.sala} onChange={handleChange} placeholder="Sala" />
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <label>Hora início</label>
                                                <Input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} />
                                            </Field>
                                            <Field>
                                                <label>Hora fim</label>
                                                <Input type="time" name="hora_fim" value={form.hora_fim} onChange={handleChange} />
                                            </Field>
                                        </TwoCols>

                                        <Field>
                                            <label>Responsável da família</label>
                                            <Input name="responsavel_familia" value={form.responsavel_familia} onChange={handleChange} placeholder="Digite o nome do responsável" />
                                        </Field>

                                        <Field>
                                            <label>Funerária responsável</label>
                                            <Input name="funeraria" value={form.funeraria} onChange={handleChange} placeholder="Digite o nome da funerária" />
                                        </Field>
                                    </ColumnLeft>

                                    <ColumnRight>
                                        <Field>
                                            <label>Funcionário designado</label>
                                            <Input name="funcionario" value={form.funcionario} onChange={handleChange} placeholder="Digite o nome do funcionário" />
                                        </Field>

                                        <Field>
                                            <label>
                                                <input type="checkbox" name="servico_religioso" checked={!!form.servico_religioso} onChange={handleChange} />
                                                {" "}Serviço religioso
                                            </label>
                                        </Field>

                                        <Field>
                                            <label>
                                                <input type="checkbox" name="ornamentacao" checked={!!form.ornamentacao} onChange={handleChange} />
                                                {" "}Ornamentação
                                            </label>
                                        </Field>

                                        <Field>
                                            <label>
                                                <input type="checkbox" name="musica" checked={!!form.musica} onChange={handleChange} />
                                                {" "}Música / Homenagem
                                            </label>
                                        </Field>

                                        <Field>
                                            <label>Observações</label>
                                            <Textarea name="obs_vel" value={form.obs_vel} onChange={handleChange} placeholder="Observações..." />
                                        </Field>

                                        <FormActions>
                                            <BtnPrimary type="submit">Salvar</BtnPrimary>
                                        </FormActions>
                                    </ColumnRight>
                                </> */}
                            {processType === "Cadastro de sepultamento" ? (
                                <>
                                    <ColumnLeft>
                                        <Field>
                                            <div style={{ position: "relative" }}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Nome do falecido"
                                                    type="text"
                                                    placeholder="Digite o nome do falecido..."
                                                    value={searchFal}
                                                    onChange={(e) => { setSearchFal(e.target.value); setShowFalList(true); }}
                                                    onFocus={() => setShowFalList(true)}
                                                    onBlur={() => setTimeout(() => setShowFalList(false), 150)}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                                {showFalList && filteredFalecidos.length > 0 && (
                                                    <ul style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 50, background: "#fff", borderRadius: "16px", border: "1px solid #191970", maxHeight: 220, overflow: "auto", margin: 0, padding: 0, listStyle: "none" }}>
                                                        {filteredFalecidos.map((f) => (
                                                            <li key={f.id} style={{
                                                                padding: 8, cursor: "pointer", borderBottom: "1px solid #f1f1f1",
                                                            }}
                                                                onMouseDown={(ev) => {
                                                                    ev.preventDefault();
                                                                    handleSelectFalecido(String(f.id));
                                                                    setSearchFal(f.nome_fal || f.nome || "");
                                                                    setShowFalList(false);
                                                                }}>
                                                                {f.nome_fal || f.nome}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </Field>

                                        <TwoCols>
                                            <Field>
                                                <label>Data do óbito</label>
                                                <TextField fullWidth variant="outlined" type="date" name="data_obito_sep" value={form.data_obito_sep} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                                            </Field>

                                            <Field>
                                                <label>Data e hora do sepultamento</label>
                                                <TextField fullWidth variant="outlined" type="datetime-local" name="dh_sep" value={form.dh_sep} onChange={handleChange} placeholder="Sala" InputLabelProps={{ shrink: true }} sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                                            </Field>
                                        </TwoCols>


                                        <TwoCols>
                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Possui título de posse?</InputLabel>
                                                    <Select label="Possui título de posse?" name="titulo_posse" value={form.titulo_posse} onChange={handleChange} sx={selectSxStyle}>
                                                        <MenuItem value="">Selecione a opção</MenuItem>
                                                        <MenuItem value="Sim">Sim</MenuItem>
                                                        <MenuItem value="Não">Não</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Quadra</InputLabel>
                                                    <Select
                                                        label="Quadra"
                                                        name="quadra_sep"
                                                        value={form.quadra_sep ?? ""}
                                                        onChange={(e) => handleQuadraSepChange(e.target.value)}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a quadra</MenuItem>
                                                        {quadras.map(q => (
                                                            <MenuItem key={String(q.id)} value={String(q.id)}>
                                                                {q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Field>

                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Nº da sepultura</InputLabel>
                                                    <Select
                                                        label="Nº da sepultura"
                                                        name="num_sepultura_sep"
                                                        value={form.num_sepultura_sep ?? ""}
                                                        onChange={handleChange}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a sepultura</MenuItem>
                                                        {availableCovas.map(c => {
                                                            const val = String(c.num_cova ?? c.numero ?? c.num_sepultura ?? "");
                                                            const isReserved = String(c.status ?? "").toLowerCase().includes("reserv");
                                                            return (
                                                                <MenuItem key={String(c.id ?? `${c.quadra_cova}-${c.num_cova}`)} value={val}>
                                                                    {val}{isReserved ? "(Particular)" : ""}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Field>

                                            <Field>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Tipo de sepultura"
                                                    value={tipoCovaSelecionada || "-"}
                                                    disabled
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Field>

                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Taxa de sepultamento</InputLabel>
                                                    <Select
                                                        label="Taxa de sepultamento"
                                                        name="taxa"
                                                        value={form.taxa}
                                                        onChange={handleChange}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione o tipo de taxa</MenuItem>
                                                        <MenuItem value="crianca">CRIANÇA - R$56,12</MenuItem>
                                                        <MenuItem value="crianca_fora">CRIANÇA (FORA DO MUNICÍPIO) - R$224,54</MenuItem>
                                                        <MenuItem value="adulto_terra">ADULTO (TERRA) - R$112,27</MenuItem>
                                                        <MenuItem value="adulto_fora">ADULTO (FORA DO MUNICÍPIO) - R$430,42</MenuItem>
                                                        <MenuItem value="adulto_laje">ADULTO LAJE - R$280,71</MenuItem>
                                                        <MenuItem value="indigente">ISENÇÃO POR INDIGÊNCIA</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Field>
                                        </TwoCols>
                                    </ColumnLeft>

                                    <ColumnRight>
                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Funcionário designado"
                                                name="coveiro_sep"
                                                value={form.coveiro_sep}
                                                onChange={handleChange}
                                                placeholder="Digite o nome do funcionário"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Observações"
                                                name="obs_sep"
                                                value={form.obs_sep}
                                                onChange={handleChange}
                                                placeholder="Observações..."
                                                multiline
                                                rows={4}
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <FormActions>
                                            <BtnPrimary type="submit">Salvar</BtnPrimary>
                                        </FormActions>
                                    </ColumnRight>
                                </>
                            ) : (
                                <>
                                    <ColumnLeft>
                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Nome completo"
                                                name="nome_fal"
                                                value={form.nome_fal}
                                                onChange={handleChange}
                                                placeholder="Digite o nome do falecido"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <TwoCols>
                                            <Field>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Idade"
                                                    name="idade"
                                                    value={form.idade}
                                                    onChange={handleChange}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Field>

                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Sexo</InputLabel>
                                                    <Select
                                                        label="Sexo"
                                                        name="sexo"
                                                        value={form.sexo}
                                                        onChange={handleChange}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione</MenuItem>
                                                        <MenuItem value="masculino">Masculino</MenuItem>
                                                        <MenuItem value="feminino">Feminino</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Estado civil</InputLabel>
                                                    <Select
                                                        label="Estado civil"
                                                        name="estado_civil"
                                                        value={form.estado_civil}
                                                        onChange={handleChange}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione o estado civil</MenuItem>
                                                        <MenuItem value="Solteiro">Solteiro(a)</MenuItem>
                                                        <MenuItem value="Casado">Casado(a)</MenuItem>
                                                        <MenuItem value="Separado">Separado(a)</MenuItem>
                                                        <MenuItem value="Divorciado">Divorciado(a)</MenuItem>
                                                        <MenuItem value="Viúvo">Viúvo(a)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Field>
                                            <Field>
                                                <FormControl fullWidth>
                                                    <InputLabel sx={labelSxStyle}>Cor</InputLabel>
                                                    <Select
                                                        label="Cor"
                                                        name="cor"
                                                        value={form.cor}
                                                        onChange={handleChange}
                                                        sx={selectSxStyle}
                                                    >
                                                        <MenuItem value="">Selecione a cor</MenuItem>
                                                        <MenuItem value="Branca">Branca</MenuItem>
                                                        <MenuItem value="Preta">Preta</MenuItem>
                                                        <MenuItem value="Parda">Parda</MenuItem>
                                                        <MenuItem value="Amarela">Amarela</MenuItem>
                                                        <MenuItem value="Indígena">Indígena</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <label>Data de nascimento</label>
                                                <Input
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Data de nascimento"
                                                    type="date"
                                                    name="data_nasc"
                                                    value={form.data_nasc}
                                                    onChange={handleChange}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Field>
                                            <Field>
                                                <label>Data e hora de falecimento</label>
                                                <Input
                                                    fullWidth
                                                    variant="outlined"
                                                    label="Data e hora do falecimento"
                                                    type="datetime-local"
                                                    name="dh_falec"
                                                    value={form.dh_falec}
                                                    onChange={handleChange}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={fieldSxStyle}
                                                    slotProps={{
                                                        inputLabel: { sx: labelSxStyle }
                                                    }}
                                                />
                                            </Field>
                                        </TwoCols>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Filiação pai"
                                                name="filiacao_pai"
                                                value={form.filiacao_pai}
                                                onChange={handleChange}
                                                placeholder="Digite o nome do pai"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Filiação mãe"
                                                name="filiacao_mae"
                                                value={form.filiacao_mae}
                                                onChange={handleChange}
                                                placeholder="Digite o nome da mãe"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Profissão"
                                                name="profissao"
                                                value={form.profissao}
                                                onChange={handleChange}
                                                placeholder="Digite a profissão do falecido"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Naturalidade"
                                                name="naturalidade"
                                                value={busca}
                                                onChange={e => setBusca(e.target.value)}
                                                list="lista-cidades"
                                                placeholder="Digite a naturalidade do falecido"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                            <datalist id="lista-cidades">
                                                {resultados.map(c => (
                                                    <option key={c.id} value={`${c.nome} - ${c?.microrregiao?.mesorregiao?.UF?.sigla || ''}`} />
                                                ))}
                                            </datalist>
                                        </Field>

                                        <Field>
                                            <label>Comprovante de residencia</label>
                                        </Field>
                                        <Field>
                                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, "residencia")} />
                                            {form.residenciaPreview && (
                                                <img src={form.residenciaPreview} alt="preview comprovante" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, borderRadius: 6 }} />
                                            )}
                                        </Field>

                                        <Field>
                                            <label>Declaração de óbito</label>
                                            <input name="dec_obito" type="file" accept="image/*" onChange={e => handleFileChange(e, "dec_obito")} />
                                            {form.dec_obito && (
                                                <img src={form.dec_obito} alt="preview comprovante" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, borderRadius: 6 }} />
                                            )}
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Causa mortis"
                                                name="causa_mortis"
                                                value={form.causa_mortis}
                                                onChange={handleChange}
                                                placeholder="Digite a causa da morte"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>
                                    </ColumnLeft>

                                    <ColumnRight>
                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="CPF do falecido"
                                                name="cpf"
                                                value={form.cpf || ""}
                                                onChange={handleChange}
                                                onBlur={() => {
                                                    const cpfLimpo = form.cpf.replace(/\D/g, '');
                                                    if (!cpfMask(cpfLimpo)) alert("CPF do falecido inválido")
                                                }}
                                                placeholder="000.000.000-00"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="RG do falecido"
                                                name="rg"
                                                value={form.rg}
                                                onChange={handleChange}
                                                placeholder="00.000.000-0"
                                                maxLength={12}
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Certidão de óbito"
                                                name="certidao_obito"
                                                value={form.certidao_obito}
                                                onChange={handleChange}
                                                placeholder="Digite o número da certidão"
                                                maxLength={32}
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Nome do médico responsável"
                                                name="nome_doutor"
                                                value={form.nome_doutor}
                                                onChange={handleChange}
                                                placeholder="Digite o nome do médico"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Nome do familiar ou responsável"
                                                name="nome_resp"
                                                value={form.nome_resp}
                                                onChange={handleChange}
                                                placeholder="Digite o nome do responsável"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="CPF do responsável"
                                                name="doc_resp"
                                                value={form.doc_resp || ""}
                                                onChange={handleChange}
                                                onBlur={() => {
                                                    const cpfLimpo = form.doc_resp.replace(/\D/g, '');
                                                    if (!cpfMask(cpfLimpo)) alert("CPF do responsável inválido")
                                                }}
                                                placeholder="000.000.000-00"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Contato do responsável"
                                                name="tel_resp"
                                                value={form.tel_resp}
                                                onChange={handleChange}
                                                placeholder="(XX)XXXXX-XXXX"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="CEP"
                                                name="cepResp"
                                                value={cepResp ? (cepResp.length > 5 ? cepResp.replace(/^(\d{5})(\d{1,3})/, "$1-$2") : cepResp) : ""}
                                                onChange={handleCepChange}
                                                onBlur={handleCepBlur}
                                                placeholder="00000-000"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                            {loadingCep && <small style={{ color: "#666" }}>Buscando...</small>}
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Endereço do responsável"
                                                name="endereco_resp"
                                                value={form.endereco_resp}
                                                onChange={handleChange}
                                                placeholder="Rua, bairro, cidade - UF"
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <Field>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                label="Observações"
                                                name="obs_fal"
                                                value={form.obs_fal}
                                                onChange={handleChange}
                                                placeholder="Observações..."
                                                multiline
                                                rows={4}
                                                sx={fieldSxStyle}
                                                slotProps={{
                                                    inputLabel: { sx: labelSxStyle }
                                                }}
                                            />
                                        </Field>

                                        <FormActions>
                                            <BtnPrimary type="submit">Salvar</BtnPrimary>
                                        </FormActions>
                                    </ColumnRight>
                                </>
                            )}
                        </FormGrid>
                    </FormStyled>
                </Container>
            </MainLayout>
            <Footer />
        </div>
    )
}