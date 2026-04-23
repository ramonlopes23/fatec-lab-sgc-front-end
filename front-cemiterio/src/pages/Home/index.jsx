import React from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Dashboard from "../../components/Dashboard";
import ContractAlertsCard from "../../components/ContractAlertsCard";
import SepultadosMedia from "../../components/SepultadosMedia";
import Calendar from "../../components/Calendar";
import SepultadosTotal from "../../components/SepultadosTotal";
import SepultadosMes from "../../components/SepultadosMes";
import { Row } from "../../components/DashboardRow/styles";


export default function Home() {
    return (
        <div>
            <MainLayout>
                <Dashboard />
                
                <Row>
                    <SepultadosMes />
                    <SepultadosMedia />
                    <SepultadosTotal />  
                                      
                </Row>
                <ContractAlertsCard />
            </MainLayout>
            <Footer />
        </div>

    );
}
