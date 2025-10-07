import React from "react";
import {NavLink} from "react-router-dom";
import {MdDashboard} from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GiArchiveRegister } from "react-icons/gi";
import { FaMap, FaFileAlt, FaCog } from "react-icons/fa";
import {  LogoContainer,LogoImage,NavContainer,NavItem,NavTitle,StyledNavLink, GlobalStyle } from "./styles";
import sgclogo1 from "../../assets/sgclogo1.png";


export default function SidebarMenu(){

    const menuItems = [
        {name:"DASHBOARD", icon:<MdDashboard size={20}/>, path: "/Home"},
        {name:"SEPULTURAS", icon:<BsGrid3X3GapFill size={20}/>,  path: "/VerMapa"},
        {name:"CADASTRAR PROCESSO", icon:<GiArchiveRegister size={25}/>, path: "/Cadastros"},
        {name:"REGISTROS", icon:<FaFileAlt size={20}/>, path: "/Registros"},
        {name:"CONFIGURAR", icon:<FaCog size={20}/>, path: "/Configurar"},
    ];

    return(
        <>
        <GlobalStyle />
            <LogoContainer>
                <LogoImage src={sgclogo1} alt="Logo Memo"/>
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
