import styled from "styled-components";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
font-family:"Inter", sans-serif;
}`;

export const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden; 
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const PageContent = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: #f9fafb;
  overflow-y: auto;
`;