import React from "react";
import MainLayout from "../../layout/MainLayout";

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

    const [registros, SetRegistros] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        SetRegistros([...registros, form]);
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

    return(
        <MainLayout>
            <h2>Cadastro de Processos</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome completo</label>
                    <input name="nome" value={form.nome} onChange={handleChange} placeholder="Digite o nome do falecido" />

                    <label>Idade</label>
                    <input name="idade" value={form.idade} onChange={handleChange}  />

                    <label>Data de nascimento</label>
                    <input name="data_nasc" value={form.data_nasc} onChange={handleChange}  />

                    <label>Data e hora do falecimento</label>
                    <input name="dh_falec" value={form.dh_falec} onChange={handleChange} />

                    <label>Filiação pai</label>
                    <input name="filiacao_pai" value={form.filiacao_pai} onChange={handleChange} />

                    <label>Filiação mãe</label>
                    <input name="filiacao_mae" value={form.filiacao_mae} onChange={handleChange}  />

                    <label>Sexo</label>
                    <select name="sexo" value={form.sexo} onChange={handleChange}>
                        <option value="">Selecione</option>
                        <option value="">Masculino</option>
                        <option value="">Feminino</option>
                    </select>

                    <label>Profissão</label>
                    <input name="profissao" value={form.profissao} onChange={handleChange}/>
                </div>

                <div>
                    <label>Causa mortis</label>
                    <input name="causa_mortis" value={form.causa_mortis} onChange={handleChange}/>

                    <label>Estado Civil</label>
                    <select name="estado_civil" value={form.estado_civil} onChange={handleChange}/>
                        <option value="">Selecione</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Separado(a)">Separado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a">Viúvo(a)</option>
                    

                    <label>CPF</label>
                    <input name="cpf" value={form.cpf} onChange={handleChange}/>

                    <label>RG</label>
                    <input name="rg" value={form.rg} onChange={handleChange}/>

                    <label>Certidão de óbito</label>
                    <input name="certidao_obito" value={form.certidao_obito} onChange={handleChange}/>

                    <label>Nome do doutor</label>
                    <input name="nome_doutor" value={form.nome_doutor} onChange={handleChange}/>

                    <label>Observações</label>
                    <textarea name="obs" value={form.obs} onChange={handleChange}/>

                    <button type="submit">Salvar</button>
                </div> 
            </form>
        </MainLayout>
    )
}