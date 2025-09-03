import React from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Dashboard from "../../components/Dashboard";

export default function Home() {
    return (
        <div>
            <MainLayout>
                <Dashboard />
            </MainLayout>
            <Footer />  
        </div>

    );
}