import React from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { FaSearch } from "react-icons/fa";
import { FormStyled, Container, Title, SearchBar, SearchInput, SmallSelect, BtnPrimary, SmallInput, TwoCols, Field, SearchWrapper, SearchIcon } from "./styles";
import { ColumnLeft } from "../Configurar/styles";



export default function Registros() {









    return (
        <div>
            <MainLayout>
                <Container>
                    <FormStyled>
                        <Title>BUSCAR REGISTROS</Title>
                        <SearchBar>
                            <SearchWrapper>
                                <SearchInput type="text" name="busca" placeholder="Pesquisar por nome, palavra-chave, termo..." />
                                <SearchIcon aria-hidden="true">
                                    <FaSearch />
                                </SearchIcon>
                            </SearchWrapper>
                        </SearchBar>
                        <TwoCols>
                            <SmallSelect name="tipo_sep">
                                <option value="">Selecione o tipo de sepultura </option>
                                <option value="Cova">Cova</option>
                                <option value="Gaveta">Gaveta</option>
                            </SmallSelect>


                            <SmallSelect name="status_sep">
                                <option value="">Selecione o status da sepultura</option>
                                <option value="Cova">Disponível</option>
                                <option value="Gaveta">Ocupado</option>
                                <option value="Gaveta">Indisponível</option>
                                <option value="Gaveta">Particular</option>
                            </SmallSelect   >
                        </TwoCols>

                        <TwoCols>
                            <Field>
                                <SmallInput placeholder="Digite o número da quadra" />
                                <SmallInput placeholder="Digite o número da rua" />


                                <SmallInput placeholder="Digite o numero da sepultura" />

                                
                                <BtnPrimary>Aplicar Filtros</BtnPrimary>

                            </Field>

                        </TwoCols >
                    </FormStyled>

                </Container>
            </MainLayout>
            <Footer />
        </div>

    )
}
