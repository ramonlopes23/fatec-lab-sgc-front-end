import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
font-family:"Inter", sans-serif;
}`;




export const LogoContainer = styled.div`
padding:1.5rem;
display:flex;
flex-direction:column;
align-items:center;
border-bottom:1px solid #e5e7eb;
`;

export const LogoImage = styled.img`
width:150px; 
height:auto;
object-fit:contain;
`;


export const NavContainer = styled.nav`
flex:1;
padding:1rem;
`;

export const NavTitle = styled.h2`
text-transform:uppercase;
font-size:0.75rem;
font-family:"Inter", sans-serif;
color:#6b7280;
margin-bottom:0.5rem;
`;


export const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

export const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #1f2937;
  font-weight: 400;

  &:hover {
    background-color: #f3f4f6;
  }

  &.active {
    background-color: #e5e7eb;
    font-weight: 600;
  }
`;