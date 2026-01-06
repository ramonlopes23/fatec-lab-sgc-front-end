export const cpfMask = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

export const rgMask = (value) => {
  const cleaned = String(value || "").replace(/[^0-9A-Za-z]/g, "");
  let letter = "", core = cleaned;
  if (/[A-Za-z]$/.test(core)) {
    letter = core.slice(-1).toUpperCase();
    core = core.slice(0, -1);
  }
  const digits = core.replace(/\D/g, "").slice(0, 9);
  let out = digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  return letter ? (out.includes("-") ? out + letter : out + "-" + letter) : out;
};

export const phoneMask = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
};

export const cepMask = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
};

export const applyMaskByFieldName = (fieldName, value) => {
  switch (fieldName) {
    case "cpf":
    case "doc_resp":
      return cpfMask(value);
    case "rg":
      return rgMask(value);
    case "tel_resp":
      return phoneMask(value);
    case "cep_resp":
    case "cepResp":
      return cepMask(value);
    default:
      return value;
  }
};