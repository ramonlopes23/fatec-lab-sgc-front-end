import MainLayout from "../../layout/MainLayout";
import React, { useState } from "react";
import { BtnPrimary, ColumnLeft, ColumnRight, Container, Field, FormActions, FormGrid, FormStyled, FormTop, Select, Input, SelectTop, SmallLabel, Textarea, Title, TwoCols } from "./styles"

export default function Cadastros() {
    const [form, setForm] = useState({
        nome: "",
        idade: "",
        data_nasc: "",
        dh_falec: "",
        filiacao_pai: "",
        filiacao_mae: "",
        sexo: "",
        cpf: "",
        rg: "",
        profissao: "",
        estado_civil: "",
        nacionalidade: "",
        causa_mortis: "",
        nome_doutor: "",
        certidao_obito: "",
        obs: "",
    });

    const [registros, setRegistros] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setRegistros([...registros, form]);
        setForm({
            nome: "",
            idade: "",
            data_nasc: "",
            dh_falec: "",
            filiacao_pai: "",
            filiacao_mae: "",
            sexo: "",
            cpf: "",
            rg: "",
            profissao: "",
            estado_civil: "",
            nacionalidade: "",
            causa_mortis: "",
            nome_doutor: "",
            certidao_obito: "",
            obs: "",
        });
    };

    return (
        <MainLayout>
            <Container>
                <FormStyled onSubmit={handleSubmit}>
                    <Title>CADASTRO DE PROCESSOS</Title>
                    <FormTop>
                        <SmallLabel>Selecione qual processo deseja cadastrar</SmallLabel>
                        <SelectTop name="processo">
                            <option>Cadastro de falecido</option>
                        </SelectTop>
                    </FormTop>

                    <FormGrid>
                        <ColumnLeft>
                            <Field>
                                <label>Nome completo</label>
                                <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Digite o nome do falecido" />
                            </Field>

                            <Field>    
                                <label>Idade</label>
                                <Input name="idade" value={form.idade} onChange={handleChange} />
                            </Field>

                            <TwoCols>
                                <Field>
                                    <label>Data de nascimento</label>
                                    <Input name="data_nasc" value={form.data_nasc} onChange={handleChange} placeholder="DD/MM/AAAA" />
                                </Field>
                                <Field>
                                    <label>Data e hora do falecimento</label>
                                    <Input name="dh_falec" value={form.dh_falec} onChange={handleChange} placeholder="DD/MM/AAAA hh:mm" />
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
                                <label>Sexo</label>
                                <Select name="sexo" value={form.sexo} onChange={handleChange}>
                                    <option value="">Selecione</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                </Select>
                            </Field>

                            <Field>
                                <label>Profissão</label>
                                <Input name="profissao" value={form.profissao} onChange={handleChange} placeholder="Digite a profissão do falecido" />
                            </Field>
                        </ColumnLeft>
   
                        <ColumnRight>
                            <Field>
                                <label>Causa mortis</label>
                                <Input name="causa_mortis" value={form.causa_mortis} onChange={handleChange} placeholder="Digite a causa da morte" />
                            </Field>

                            <Field>
                                <label>Estado civil</label>
                                <Select name="estado_civil" value={form.estado_civil} onChange={handleChange}>
                                    <option value="">Selecione o estado civil</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Separado(a)">Separado(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                </Select>
                            </Field>

                            <Field>
                                <label>CPF</label>
                                <Input name="cpf" value={form.cpf} onChange={handleChange} placeholder="Digite o CPF" />
                            </Field>

                            <Field>
                                <label>RG</label>
                                <Input name="rg" value={form.rg} onChange={handleChange} placeholder="Digite o RG" />
                            </Field>

                            <Field>
                                <label>Certidão de óbito</label>
                                <Input name="certidao_obito" value={form.certidao_obito} onChange={handleChange} placeholder="Digite o número da certidão" />
                            </Field>

                            <Field>
                                <label>Nome do médico responsável</label>
                                <Input name="nome_doutor" value={form.nome_doutor} onChange={handleChange} placeholder="Digite o nome do médico" />
                            </Field>

                            <Field>
                                <label>Observações</label>
                                <Textarea name="obs" value={form.obs} onChange={handleChange} placeholder="Observações..." />
                            </Field>

                            <FormActions>
                                <BtnPrimary type="submit">Salvar</BtnPrimary>
                            </FormActions>
                        </ColumnRight>
                    </FormGrid>
                </FormStyled>
            </Container>
        </MainLayout>
                )
}