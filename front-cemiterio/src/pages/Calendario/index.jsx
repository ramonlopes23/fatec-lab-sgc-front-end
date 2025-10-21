import React from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Calendar from "../../components/Calendar";

export default function Calendario() {
    return (
        <div>
            <MainLayout>
                <Calendar />
            </MainLayout>
            <Footer />  
        </div>

    );
}