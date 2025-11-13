import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { BtnPrimary, BtnPrimaryClose, BtnPrimarySave, ColumnLeft, ColumnRight, Container, Field, FormStyled, SearchBar, SearchIcon, SearchInput, SearchWrapper, SmallInput, SmallSelect, Title, TwoCols } from "./styles"
import { FaSearch } from "react-icons/fa";


export default function Exumacoes() {


    return (
        <div>
            <MainLayout />
            <Container>
                <FormStyled>
                    <Title>BUSCAR EXUMAÇÕES</Title>
                    <SearchBar>
                        <SearchWrapper>
                            <SearchInput />
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>

                        </SearchWrapper>
                    </SearchBar>


                    <TwoCols>
                        <Field>
                            <SmallInput />
                            <BtnPrimary />
                        </Field>
                    </TwoCols>


                </FormStyled>
            </Container>
            <Footer />
        </div>
    )
}