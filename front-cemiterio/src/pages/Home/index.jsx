import React from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Dashboard from "../../components/Dashboard";
import Calendar from "../../components/Calendar";

export default function Home() {
    return (
        <div>
            <MainLayout>
                <Dashboard />
                <Calendar />
            </MainLayout>
            <Footer />  
        </div>

    );
}