import React from "react";
import { DashboardWrapper, Card, CardHeader, CardBody, ProcessItem, ProcessInfo, ProcessAction } from "./styles";
import {FaCross} from "react-icons/fa"; 

import { FaSkullCrossbones } from "react-icons/fa";
import {FaTools} from "react-icons/fa";

export default function Dashboard() {

    const icones ={
        Sepultamento:<FaCross />,
        Exumação:<FaSkullCrossbones />,
        Manutenção:<FaTools />
    };
    
    const processos = [
        {
            id: 1,
            nome: "PEDRO PASCAL",
            tipo: "Sepultamento",
            velorio: "Sala 1 | 16h - 18h",
            local: "Quadra 1 - Jazigo 3",
            horario: "18h30",
        },

        {
            id: 2,
            nome: "ELON MUSQL",
            tipo: "Sepultamento",
            velorio: "Sala 1 | 18h20 - 20h",
            local: "Quadra 1 - Jazigo 5",
            horario: "18h30",
        },

        {
            id: 3,
            nome: "MARIA QUERY",
            tipo: "Exumação",
            velorio: null,
            local: "Quadra 12 - Jazigo 3",
            horario: "14h",
        },

    ];


    return(
        <DashboardWrapper>
            <Card>
                <CardHeader>PRÓXIMOS PROCESSOS AGENDADOS</CardHeader>
                <CardBody>
                    {processos.map((p)=>(
                        <ProcessItem key={p.id}>
                            <ProcessInfo>
                            <strong>{p.nome}</strong>
                            {p.velorio && <span>Velório: {p.velorio}</span>}
                            
                            </ProcessInfo>
                            <ProcessAction>
                                {icones[p.tipo] || null}
                                <span> {p.tipo}: </span>
                                {p.local && <span> {p.local} </span>}
                                <span>- {p.horario}</span>
                            </ProcessAction>
                        </ProcessItem>
                    ))}
                </CardBody>
            </Card>
        </DashboardWrapper>

    )
}