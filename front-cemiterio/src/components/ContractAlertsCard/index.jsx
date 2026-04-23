import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import api from "../../services/api";
import { getContratoRenewalAlerts } from "../../utils/contractAlerts";
import { Card, CardBody, CardHeader, DashboardWrapper, ProcessAction, ProcessInfo, ProcessItem } from "../Dashboard/styles";

export default function ContractAlertsCard() {
    const [contractAlerts, setContractAlerts] = useState([]);
    const [quadras, setQuadras] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    const formatDateBR = (value) => {
        if (!value) return "-";
        const [y, m, d] = String(value).split("-");
        if (!y || !m || !d) return value;
        return `${d}/${m}/${y}`;
    };

    const getAlertAccent = (type) => {
        if (type === "overdue") return "#b42318";
        if (type === "today") return "#b54708";
        return "#1d4ed8";
    };

    const getQuadraLabel = (quadraValue) => {
        const value = String(quadraValue || "");
        const found = (quadras || []).find(
            (q) => String(q?.id) === value || String(q?.num_quadra) === value
        );
        if (!found) return quadraValue || "-";
        return found?.num_quadra ? String(found.num_quadra) : String(found.id);
    };

    useEffect(() => {
        let mounted = true;

        Promise.all([api.get("/contratos"), api.get("/quadras")])
            .then(([contractsRes, quadrasRes]) => {
                if (!mounted) return;
                const contratos = Array.isArray(contractsRes.data) ? contractsRes.data : [];
                const quadrasData = Array.isArray(quadrasRes.data) ? quadrasRes.data : [];
                setQuadras(quadrasData);
                setContractAlerts(getContratoRenewalAlerts(contratos));
            })
            .catch((err) => {
                console.error("Erro ao carregar alertas de contratos", err);
                if (!mounted) return;
                setQuadras([]);
                setContractAlerts([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const contractAlertsSignature = useMemo(() => JSON.stringify(
        (contractAlerts || []).map((item) => ({
            id: item.id,
            validade_titulo: item.validade_titulo,
            alertType: item.alertType,
            daysUntilExpiry: item.daysUntilExpiry,
        }))
    ), [contractAlerts]);

    useEffect(() => {
        if (contractAlerts.length) {
            setIsVisible(true);
        }
    }, [contractAlerts.length, contractAlertsSignature]);

    if (!contractAlerts.length || !isVisible) return null;

    return (
        <DashboardWrapper>
            <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <CardHeader style={{ marginBottom: 0, flex: 1 }}>ALERTAS DE RENOVAÇÃO DE TÍTULOS</CardHeader>
                    <button
                        type="button"
                        onClick={() => setIsVisible(false)}
                        aria-label="Fechar alertas de renovacao"
                        title="Fechar"
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#191970",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            flexShrink: 0,
                        }}
                    >
                        <FaTimes size={16} />
                    </button>
                </div>
                <CardBody style={{ marginTop: 16 }}>
                    {contractAlerts.map((item) => (
                        <ProcessItem key={`contrato-alert-${item.id}`}>
                            <ProcessInfo>
                                <strong>{item.nome_titular || "Titular nao informado"}</strong>
                                <span>Titulo: {item.numero_titulo || "-"}</span>
                                <span>Validade: {formatDateBR(item.validade_titulo)}</span>
                                <span>Sepultura: {item.sepultura || "-"}{item.quadra ? ` - Quadra ${getQuadraLabel(item.quadra)}` : ""}</span>
                                <span style={{ color: getAlertAccent(item.alertType), fontWeight: 600 }}>
                                    {item.alertMessage}
                                </span>
                            </ProcessInfo>
                            <ProcessAction style={{ color: getAlertAccent(item.alertType), minWidth: 180 }}>
                                {item.daysUntilExpiry < 0
                                    ? `Vencido ha ${Math.abs(item.daysUntilExpiry)} dias`
                                    : `Vence em ${item.daysUntilExpiry} dias`}
                            </ProcessAction>
                        </ProcessItem>
                    ))}
                </CardBody>
            </Card>
        </DashboardWrapper>
    );
}
