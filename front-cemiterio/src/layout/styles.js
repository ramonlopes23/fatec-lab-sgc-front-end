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
  width:${({isSidebarOpen}) => (isSidebarOpen? 'calc(100% - 16rem)' : '100%')};
  margin-left:${({isSidebarOpen}) => (isSidebarOpen ? '16rem' : '0')};
  transition:width 0.3s ease, margin-left 0.3s ease;
  height:100vh;
`;

export const PageContent = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: #f8f9f9ff;
  overflow: auto;
`;

export const SidebarContainer = styled.div`
  width:16rem;
  height:100vh;
  background-color:#ffffff;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  display:flex;
  flex-direction:column;
  border-right: 3px solid #031029ff;
  position:fixed;
  transform:${({isOpen})=> (isOpen ?"translate(0)":"translate(-100%)")};
  transition:transform 0.3s ease;
  z-index:1000;
`;

