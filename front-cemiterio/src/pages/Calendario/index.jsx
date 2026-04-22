import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import MainLayout from "../../layout/MainLayout";
import Calendar from "../../components/Calendar";
import api from "../../services/api";

export default function Calendario() {
  const [sepultamentos, setSepultamentos] = useState([]);
  const [exumacoes, setExumacoes] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCalendario = async () => {
      setLoading(true);
      setError(null);

      try {
        const [sepultamentosRes, exumacoesRes, quadrasRes] = await Promise.all([
          api.get("/sepultamentos"),
          api.get("/exumacoes"),
          api.get("/quadras"),
        ]);

        setSepultamentos(Array.isArray(sepultamentosRes.data) ? sepultamentosRes.data : []);
        setExumacoes(Array.isArray(exumacoesRes.data) ? exumacoesRes.data : []);
        setQuadras(Array.isArray(quadrasRes.data) ? quadrasRes.data : []);
      } catch (err) {
        console.warn("Erro ao carregar dados do calendario via API", err);
        setError(err);
        setSepultamentos([]);
        setExumacoes([]);
        setQuadras([]);
      } finally {
        setLoading(false);
      }
    };

    loadCalendario();
  }, []);

  return (
    <div>
      <MainLayout>
        {loading ? (
          <div>Carregando calendário...</div>
        ) : error ? (
          <div>Erro ao carregar dados do calendário.</div>
        ) : (
          <Calendar sepultamentos={sepultamentos} exumacoes={exumacoes} quadras={quadras} />
        )}
      </MainLayout>
      <Footer />
    </div>
  );
}
