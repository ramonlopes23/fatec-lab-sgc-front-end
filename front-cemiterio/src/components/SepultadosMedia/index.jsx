import api from "../../services/api";
import {Card,CardBody,CardHeader,DashboardWrapper} from "./styles";
import React,{useMemo, useEffect, useState} from "react";
import {Chart as ChartJs, CategoryScale, LinearScale, BarElement, Tooltip, Legend,} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const periodos =[
    {key:7,label:"Última semana"},
    {key:15,label:"Últimos 15 dias"},
    {key:30,label:"Último mês"},
]

export default function SepultadosMedia(){



    return (
        <DashboardWrapper>
            <Card>
                <CardHeader>
                    <CardBody>
                        
                    </CardBody>
                </CardHeader>
            </Card>
        </DashboardWrapper>
    )
}