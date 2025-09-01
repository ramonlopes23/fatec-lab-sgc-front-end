import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";
import {Content,LayoutContainer,PageContent} from "./styles"
import React, {useState} from "react";

export default function MainLayout ({children }){
    const [isSidebarOpen, setiIsSidebarOpen] = useState (true);

    const toggleSidebarMenu = () => {
        setiIsSidebarOpen((prev) => !prev);
    };

    return(

        <LayoutContainer>
            {isSidebarOpen && <SidebarMenu />}
            <Content>
                <Header userName="Ramon" onMenuClick={toggleSidebarMenu} />
                <PageContent>{children}</PageContent>
            </Content>
        </LayoutContainer>
    );
}

