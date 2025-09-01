import React from "react";
import {HiBars4} from "react-icons/hi2";
import { HeaderContainer, MenuButton, UserAvatar, UserContainer, UserName } from "./styles";
import { FaRegUserCircle } from "react-icons/fa";

    export default function Header ({userName = "Ramon", onMenuClick }){
        return(
            <HeaderContainer>
                <MenuButton onClick={onMenuClick}>
                    <HiBars4 />
                </MenuButton>

                <UserContainer>
                    <UserAvatar>
                        <FaRegUserCircle />
                    </UserAvatar>
                    <UserName>Bem vindo, {userName}</UserName>
                </UserContainer>
            </HeaderContainer>


        )
    }