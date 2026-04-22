const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const ALERT_WINDOW_IN_DAYS = 30;

export const parseDateOnly = (value) => {
    if (!value) return null;

    const normalized = String(value).trim();
    if (!normalized) return null;

    const parsed = new Date(`${normalized}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const startOfToday = (baseDate = new Date()) => {
    const today = new Date(baseDate);
    today.setHours(0, 0, 0, 0);
    return today;
};

export const getDaysUntilDate = (targetDate, baseDate = new Date()) => {
    if (!(targetDate instanceof Date) || Number.isNaN(targetDate.getTime())) return null;
    const today = startOfToday(baseDate);
    return Math.round((targetDate.getTime() - today.getTime()) / ONE_DAY_IN_MS);
};

export const getContratoRenewalAlert = (contrato, baseDate = new Date()) => {
    const validade = parseDateOnly(contrato?.validade_titulo);
    if (!validade) return null;

    const status = String(contrato?.status || "").toLowerCase();
    if (status === "inativo") return null;

    const daysUntilExpiry = getDaysUntilDate(validade, baseDate);
    if (daysUntilExpiry === null || daysUntilExpiry > ALERT_WINDOW_IN_DAYS) return null;

    let type = "upcoming";
    let priority = 2;
    let message = `O titulo vence em ${daysUntilExpiry} dias. Contatar o titular para renovacao.`;

    if (daysUntilExpiry < 0) {
        const overdueDays = Math.abs(daysUntilExpiry);
        type = "overdue";
        priority = 0;
        message = `Titulo vencido ha ${overdueDays} dias. Renovacao pendente e titular deve ser contatado.`;
    } else if (daysUntilExpiry === 0) {
        type = "today";
        priority = 1;
        message = "O titulo vence hoje. Contatar o titular para renovacao imediata.";
    } else if (daysUntilExpiry === 1) {
        message = "O titulo vence amanha. Contatar o titular para renovacao.";
    }

    return {
        ...contrato,
        alertType: type,
        alertPriority: priority,
        daysUntilExpiry,
        validadeDate: validade,
        alertMessage: message,
    };
};

export const getContratoRenewalAlerts = (contratos = [], baseDate = new Date()) => {
    return contratos
        .map((contrato) => getContratoRenewalAlert(contrato, baseDate))
        .filter(Boolean)
        .sort((a, b) => {
            if (a.alertPriority !== b.alertPriority) return a.alertPriority - b.alertPriority;
            if (a.daysUntilExpiry !== b.daysUntilExpiry) return a.daysUntilExpiry - b.daysUntilExpiry;
            return String(a.nome_titular || "").localeCompare(String(b.nome_titular || ""));
        });
};
