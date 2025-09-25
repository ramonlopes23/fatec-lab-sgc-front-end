import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import api from "../../services/api";
import React, { useState, useMemo, useEffect } from "react";
import { BtnPrimary, ColumnLeft, ColumnRight, Container, Field, FormActions, FormGrid, FormStyled, FormTop, Select, Input, SelectTop, SmallLabel, Textarea, Title, TwoCols } from "./styles"

export default function Cadastros() {

    const velorio = {
        nome_vel: "",
        data_velorio: "",
        hora_inicio: "",
        hora_fim: "",
        sala: "",
        responsavel_familia: "",
        funeraria: "",
        funcionario: "",
        servico_religioso: false,
        ornamentacao: false,
        musica: false,
        obs_vel: "",
    }

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
        nacionalidade: "",
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

    const exumacao = {
        nome_exu: "",
        data_obito: "",
        data_sepultamento: "",
        quadra: "",
        num_sepultura: "",
        tipo: "",
        dh_exu: "",
        motivo_exu: "",
        destino: "",
        coveiro_exu: "",
        obs_exu: "",
    }

    const sepultamento = {
        nome_sep: "",
        data_obito_sep: "",
        dh_sep: "",
        titulo_posse: "",
        quadra_sep: "",
        num_sepultura_sep: "",
        tipo_sep: "",
        coveiro_sep: "",
        obs_sep: "",
    }

    const cpfMask = value => {
        return String(value || '')
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d?$/, '$1')
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



    const [form, setForm] = useState(falecido);
    const [processType, setProcessType] = useState("Cadastro de falecido");
    const [registros, setRegistros] = useState([]);
    const [falecidos, setFalecidos] = useState([]);

    useEffect(() => {
        let mounted = true;
        api.get("/falecidos").then(res => {
            if (!mounted) return;
            setFalecidos(res.data || []);
        }).catch(() => { if (mounted) setFalecidos([]); })
        return () => { mounted = false; };
    }, []);


    const handleProcessChange = (e) => {
        const val = e.target.value;
        setProcessType(val);
        if (val === "Cadastro de velório") setForm(velorio);
        else if (val === "Cadastro de exumação") setForm(exumacao);
        else if (val === "Cadastro de sepultamento") setForm(sepultamento)
        else setForm(falecido)
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const incoming = type === "checkbox" ? checked : value;

        if (name === "cpf") {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
            setForm(prev => ({ ...prev, cpf: digitsOnly }));
            return;
        }
        if (name === "rg") {
            const masked = rgMask(value);
            setForm(prev => ({ ...prev, rg: masked }));
            return;
        }


        setForm(prev => ({ ...prev, [name]: incoming }));
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



    const handleSubmit = async (e) => {
        e.preventDefault();

        const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

        let requiredTemplate = {};
        if (processType === "Cadastro de falecido") requiredTemplate = falecido;
        else if (processType === "Cadastro de velório") requiredTemplate = velorio;
        else if (processType === "Cadastro de exumação") requiredTemplate = exumacao;
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

                await api.post("/falecidos", form);

                alert("Falecido cadastrado");
                setForm(falecido);

            }
            else if (processType === "Cadastro de velório") {

                await api.post("/velorios", form);

                alert("Velorio cadastrado");
                setForm(velorio);
            }
            else if (processType === "Cadastro de exumação") {

                await api.post("/exumacoes", form);

                alert("Exumação cadastrada");
                setForm(exumacao);
            }
            else if (processType === "Cadastro de sepultamento") {

                const payload = { ...form };
                if (!payload.nome_sep && payload.falecido) {
                    const f = falecidos.find(x => Number(x.id) === Number(payload.falecido));
                    if (f) payload.nome_sep = f.nome_fal || f.nome;
                }
                await api.post("/sepultamentos", payload);
                alert("Sepultamento cadastrado");
                setForm(sepultamento)
            }
            else {
                alert("Tipo de processo inválido")
            }

            setRegistros(prev => ([...prev, { processType, data: form }]));
        }
        catch (err) {
            console.error(err);
            alert(`Erro ao cadastrar processo ${processType}`);
        }

    };

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
        reader.readAsDataURL(file)
    };


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
                                <option>Cadastro de velório</option>
                                <option>Cadastro de exumação</option>
                                <option>Cadastro de sepultamento</option>
                            </SelectTop>
                        </FormTop>

                        <FormGrid>
                            {processType === "Cadastro de velório" ? (
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
                                </>
                            ) : processType === "Cadastro de exumação" ? (<>
                                <ColumnLeft>
                                    <Field>
                                        <label>Nome do falecido</label>
                                        <Input name="nome_exu" value={form.nome_exu} onChange={handleChange} placeholder="Nome do falecido" />
                                    </Field>

                                    <TwoCols>
                                        <Field>
                                            <label>Data do óbito</label>
                                            <Input type="date" name="data_obito" value={form.data_obito} onChange={handleChange} />
                                        </Field>
                                        <Field>
                                            <label>Data do sepultamento</label>
                                            <Input type="date" name="data_sepultamento" value={form.data_sepultamento} onChange={handleChange} />
                                        </Field>
                                    </TwoCols>

                                    <Field>
                                        <label>Quadra</label>
                                        <Input name="quadra" value={form.quadra} onChange={handleChange} placeholder="Quadra" />
                                    </Field>

                                    <Field>
                                        <label>Nº da sepultura</label>
                                        <Input name="num_sepultura" value={form.num_sepultura} onChange={handleChange} placeholder="Número da sepultura" />
                                    </Field>
                                </ColumnLeft>

                                <ColumnRight>
                                    <Field>
                                        <label>Tipo</label>
                                        <Input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Ex.: simples / coletiva" />
                                    </Field>

                                    <Field>
                                        <label>Data/Hora exumação</label>
                                        <Input type="datetime-local" name="dh_exu" value={form.dh_exu} onChange={handleChange} />
                                    </Field>

                                    <Field>
                                        <label>Motivo da exumação</label>
                                        <Input name="motivo_exu" value={form.motivo_exu} onChange={handleChange} placeholder="Motivo" />
                                    </Field>

                                    <Field>
                                        <label>Destino</label>
                                        <Input name="destino" value={form.destino} onChange={handleChange} placeholder="Destino do material" />
                                    </Field>

                                    <Field>
                                        <label>Coveiro responsável</label>
                                        <Input name="coveiro_exu" value={form.coveiro_exu} onChange={handleChange} placeholder="Nome do coveiro" />
                                    </Field>

                                    <Field>
                                        <label>Observações</label>
                                        <Textarea name="obs_exu" value={form.obs_exu} onChange={handleChange} placeholder="Observações..." />
                                    </Field>

                                    <FormActions>
                                        <BtnPrimary type="submit">Salvar</BtnPrimary>
                                    </FormActions>
                                </ColumnRight>
                            </>

                            ) : processType === "Cadastro de sepultamento" ? (
                                <>
                                    <ColumnLeft>
                                        <Field>
                                            <label>Nome do falecido</label>
                                            <Select name="falecido_id" value={form.falecido_id ?? ""} onChange={(e) => handleSelectFalecido(e.target.value)}>
                                                <option value="">Selecione o falecido</option>
                                                {falecidos.map(f => (
                                                    <option key={f.id} value={f.id}>{f.nome_fal || f.nome}</option>
                                                ))}
                                            </Select>
                                        </Field>

                                        <TwoCols>
                                            <Field>
                                                <label>Data do óbito</label>
                                                <Input type="date" name="data_obito_sep" value={form.data_obito_sep} onChange={handleChange} />
                                            </Field>
                                            <Field>
                                                <label>Data e hora de sepultamento</label>
                                                <Input type="datetime-local" name="dh_sep" value={form.dh_sep} onChange={handleChange} placeholder="Sala" />
                                            </Field>
                                        </TwoCols>


                                        <TwoCols>
                                            <Field>
                                                <label>Possui título de posse?</label>
                                                <Select name="titulo_posse" value={form.titulo_posse} onChange={handleChange}>
                                                    <option value="">Selecione o tipo de sepultura </option>
                                                    <option value="Sim">Sim</option>
                                                    <option value="Não">Não</option>
                                                </Select>
                                            </Field>

                                            <Field>
                                                <label>Tipo de sepultura</label>
                                                <Select name="tipo_sep" value={form.tipo_sep} onChange={handleChange}>
                                                    <option value="">Selecione o tipo de sepultura </option>
                                                    <option value="Cova">Cova</option>
                                                    <option value="Gaveta">Gaveta</option>
                                                </Select>
                                            </Field>


                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <label>Quadra</label>
                                                <Input name="quadra_sep" value={form.quadra_sep} onChange={handleChange} />
                                            </Field>
                                            <Field>
                                                <label>Nº da sepultura</label>
                                                <Input name="num_sepultura_sep" value={form.num_sepultura_sep} onChange={handleChange} />
                                            </Field>

                                        </TwoCols>

                                    </ColumnLeft>

                                    <ColumnRight>

                                        <Field>
                                            <label>Funcionário designado</label>
                                            <Input name="coveiro_sep" value={form.coveiro_sep} onChange={handleChange} placeholder="Digite o nome do funcionário" />
                                        </Field>

                                        <Field>
                                            <label>Observações</label>
                                            <Textarea name="obs_sep" value={form.obs_sep} onChange={handleChange} placeholder="Observações..." />
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
                                            <label>Nome completo</label>
                                            <Input name="nome_fal" value={form.nome_fal} onChange={handleChange} placeholder="Digite o nome do falecido" />
                                        </Field>


                                        <TwoCols>
                                            <Field>
                                                <label>Idade</label>
                                                <Input name="idade" value={form.idade} onChange={handleChange} />
                                            </Field>

                                            <Field>
                                                <label>Sexo</label>
                                                <Select name="sexo" value={form.sexo} onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="masculino">Masculino</option>
                                                    <option value="feminino">Feminino</option>
                                                </Select>
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <label>Estado civil</label>
                                                <Select name="estado_civil" value={form.estado_civil} onChange={handleChange}>
                                                    <option value="">Selecione o estado civil</option>
                                                    <option value="Solteiro">Solteiro(a)</option>
                                                    <option value="Casado">Casado(a)</option>
                                                    <option value="Separado">Separado(a)</option>
                                                    <option value="Divorciado">Divorciado(a)</option>
                                                    <option value="Viúvo">Viúvo(a)</option>
                                                </Select>
                                            </Field>
                                            <Field>
                                                <label>Cor</label>
                                                <Select name="cor" value={form.cor} onChange={handleChange}>
                                                    <option value="">Selecione a cor</option>
                                                    <option value="Branca">Branca</option>
                                                    <option value="Preta">Preta</option>
                                                    <option value="Parda">Parda</option>
                                                    <option value="Amarela">Amarela</option>
                                                    <option value="Indígena">Indígena</option>
                                                </Select>
                                            </Field>
                                        </TwoCols>

                                        <TwoCols>
                                            <Field>
                                                <label>Data de nascimento</label>
                                                <Input type="date" name="data_nasc" value={form.data_nasc} onChange={handleChange} placeholder="DD/MM/AAAA" />
                                            </Field>
                                            <Field>
                                                <label>Data e hora do falecimento</label>
                                                <Input type="datetime-local" name="dh_falec" value={form.dh_falec} onChange={handleChange} placeholder="DD/MM/AAAA hh:mm" />
                                            </Field>
                                        </TwoCols>

                                        <Field>
                                            <label>Filiação pai</label>
                                            <Input name="filiacao_pai" value={form.filiacao_pai} onChange={handleChange} placeholder="Digite o nome do pai" />
                                        </Field>

                                        <Field>
                                            <label>Filiação mãe</label>
                                            <Input name="filiacao_mae" value={form.filiacao_mae} onChange={handleChange} placeholder="Digite o nome da mãe" />
                                        </Field>

                                        <Field>
                                            <label>Profissão</label>
                                            <Input name="profissao" value={form.profissao} onChange={handleChange} placeholder="Digite a profissão do falecido" />
                                        </Field>

                                        <Field>
                                            <label>Nacionalidade</label>
                                            <Input name="nacionalidade" value={form.nacionalidade} onChange={handleChange} placeholder="Digite a nacionalidade do falecido" />
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

                                    </ColumnLeft>

                                    <ColumnRight>



                                        <Field>
                                            <label>Causa mortis</label>
                                            <Input name="causa_mortis" value={form.causa_mortis} onChange={handleChange} placeholder="Digite a causa da morte" />
                                        </Field>

                                        <Field>
                                            <label>CPF do falecido</label>
                                            <Input name="cpf" value={cpfMask(form.cpf)} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                                        </Field>

                                        <Field>
                                            <label>RG do falecido</label>
                                            <Input name="rg" value={form.rg} onChange={handleChange} placeholder="00.000.000-0" maxLength={12} />
                                        </Field>

                                        <Field>
                                            <label>Certidão de óbito</label>
                                            <Input name="certidao_obito" value={form.certidao_obito} onChange={handleChange} placeholder="Digite o número da certidão" maxLength={32} />
                                        </Field>

                                        <Field>
                                            <label>Nome do médico responsável</label>
                                            <Input name="nome_doutor" value={form.nome_doutor} onChange={handleChange} placeholder="Digite o nome do médico" />
                                        </Field>

                                        <Field>
                                            <label>Nome do familiar ou responsável</label>
                                            <Input name="nome_resp" value={form.nome_resp} onChange={handleChange} placeholder="Digite o nome do responsável" />
                                        </Field>

                                        <Field>
                                            <label>CPF do responsável</label>
                                            <Input name="doc_resp" value={cpfMask(form.doc_resp)} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} />
                                        </Field>

                                        <Field>
                                            <label>Contato do responsável</label>
                                            <Input name="tel_resp" value={form.tel_resp} onChange={handleChange} placeholder="(XX)XXXXX-XXXX" maxLength={14} />
                                        </Field>

                                        <Field>
                                            <label>Endereço do responsável</label>
                                            <Input name="endereco_resp" value={form.endereco_resp} onChange={handleChange} placeholder="Digite o endereço do responsável" />
                                        </Field>


                                        <Field>
                                            <label>Observações</label>
                                            <Textarea name="obs_fal" value={form.obs_fal} onChange={handleChange} placeholder="Observações..." />
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
            </MainLayout >
            <Footer />
        </div>

    )
}