import React, {useEffect, useState} from "react";
import {HiBars4} from "react-icons/hi2";
import { HeaderContainer, MenuButton, UserAvatar, UserContainer, UserName } from "./styles";
import { FaRegUserCircle } from "react-icons/fa";

    export default function Header ({userName = "Administrador", onMenuClick }){
        const [photo, setPhoto] = useState(null);

        useEffect(() => {
            const load = () => setPhoto(localStorage.getItem("userPhoto"));
            load();
            const onUpdate = () => load();
            window.addEventListener("userPhotoUpdated", onUpdate);
            return () => window.removeEventListener("userPhotoUpdated",onUpdate);
        }, []);


        return(
            <HeaderContainer>
                <MenuButton onClick={onMenuClick}>
                    <HiBars4 />
                </MenuButton>

                <UserContainer>
                    <UserAvatar>
                        
                        {photo ? (
                            <img src={photo} alt="avatar" style={{width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover"}} />
                        ):(
                            <FaRegUserCircle />
                        )}
                    </UserAvatar>
                    <UserName>Bem vindo, {userName}</UserName>
                </UserContainer>
            </HeaderContainer>


        )
    }