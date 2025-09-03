import React from "react";
import {NavLink} from "react-router-dom";
import {MdDashboard} from "react-icons/md";
import {GiGraveFlowers} from 'react-icons/gi';
import { FaMap, FaFileAlt, FaCog } from "react-icons/fa";
import {  LogoContainer,LogoImage,NavContainer,NavItem,NavTitle,StyledNavLink, GlobalStyle } from "./styles";
import sgclogo from "../../assets/sgclogo.png";


export default function SidebarMenu(){

    const menuItems = [
        {name:"DASHBOARD", icon:<MdDashboard/>, path: "/Home"},
        {name:"VER MAPA", icon:<FaMap/>, path: "/VerMapa"},
        {name:"CADASTRAR PROCESSO", icon:<GiGraveFlowers />, path: "/Cadastros"},
        {name:"REGISTROS", icon:<FaFileAlt/>, path: "/Registros"},
        {name:"CONFIGURAR", icon:<FaCog/>, path: "/Configurar"},
    ];

    return(
        <>
        <GlobalStyle />
            <LogoContainer>
                <LogoImage src={sgclogo} alt="Logo Memo"/>
            </LogoContainer>

            <NavContainer>
                <NavTitle>Menu</NavTitle>
                <ul style={{listStyle:"none"}}>
                    {menuItems.map(item=>(
                        <NavItem key={item.name}>
                            <StyledNavLink to={item.path}>
                                {item.icon} {item.name}
                            </StyledNavLink>
                        </NavItem>
                    ))}
                </ul>
            </NavContainer>
         </>
    )
} 
