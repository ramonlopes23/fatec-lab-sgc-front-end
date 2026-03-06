import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import { BtnPrimaryClose, BtnPrimarySave, Container, FormStyled, SearchBar, SearchIcon, SearchWrapper, Title } from "./styles";
import TextField from "@mui/material/TextField";
import { FaSearch } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { AiOutlineUserSwitch } from "react-icons/ai";
import api from "../../services/api";

export default function Contratos() {

    return (
        <>
            <MainLayout>
                <Container>
                    <FormStyled >
                        <Title>CONTRATOS</Title>
                        <SearchBar></SearchBar>
                        <SearchWrapper>
                            <TextField
                                fullWidth
                                size="small"
                                label="Pesquisar"
                                placeholder="Pesquisar por Nº do título..."                          
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

                    <BtnPrimarySave><ImProfile />Adicionar contrato/título</BtnPrimarySave>
                    <BtnPrimaryClose><AiOutlineUserSwitch />Alterar responsável pelo título</BtnPrimaryClose>
                </Container>
            </MainLayout>
            <Footer />
        </>
    )
}