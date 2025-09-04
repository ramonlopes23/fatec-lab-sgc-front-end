import styled from "styled-components";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
font-family:"Inter", sans-serif;
}`;

export const HeaderContainer = styled.header`
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #00008B;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 1.5rem;
  }
`;

export const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #000000;
`;