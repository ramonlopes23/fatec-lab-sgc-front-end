import React from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Dashboard from "../../components/Dashboard";
import SepultadosMedia from "../../components/SepultadosMedia";
import Calendar from "../../components/Calendar";
import SepultadosTotal from "../../components/SepultadosTotal";
import { Row } from "../../components/DashboardRow/styles";
import SepultadosOntem from "../../components/SepultadosOntem";

export default function Home() {
    return (
        <div>
            <MainLayout>
                <Dashboard />
                <Row>
                    <SepultadosOntem />
                    <SepultadosMedia />
                    <SepultadosTotal />                    
                </Row>
            </MainLayout>
            <Footer />
        </div>

    );
}