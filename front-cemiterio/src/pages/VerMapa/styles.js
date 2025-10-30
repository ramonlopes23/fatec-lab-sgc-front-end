import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 18px;
  color: #191970;
`;

export const QuadraWrapper = styled.div`
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 14px;
  margin-top: 8px;
  background: #fff;
  position:relative;
`;

export const QuadraTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
  color:#191970;
`;

export const QuadraInfo = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 2;
`;

export const InfoPill = styled.span`
  background: #f1f3ff;
  color: #191970;
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid rgba(0,0,0,0.06);
`;

export const CovaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 12px;
  align-items: center;
`;

const statusColors = {
  ocupada: "#000",
  "disponível": "#9e9e9e",
  "indisponível": "#c55",
  reservada: "#d2b24a",
  default: "#ccc"
};

export const CovaItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;

  background: ${p => {
    const s = String(p.status || "").toLowerCase();
    if (s === "reservada") return "#d2b24a";
    if (s === "ocupada") return "#000";
    if (s === "indisponível") return "#c55";
    if (s === "reservada_ocupada") return "#000";
    if (s === "disponível" || s === "livre" || s === "livre") return "#9e9e9e";
    return "#fff";
  }};

  color: ${p => {
    const s = String(p.status || "").toLowerCase();
    return (s === "reservada" ? "#000" : "#fff");
  }};

  border: ${p => (p.borderColor ? `${p.borderWidth ?? 2}px solid ${p.borderColor}` : "none")};
  svg { width: 22px; height: 22px; }
  & .cova-number {
    margin-left: 6px;
    font-weight: 600;
    font-size: 12px;
  }

  &:hover { transform: translateY(-2px); transition: .12s; }
`;

export const LegendRow = styled.div`
  display:flex;
  gap:18px;
  align-items:center;
  margin-top:12px;
  flex-wrap:wrap;
`;

export const LegendItem = styled.div`
  display:flex;
  gap:8px;
  align-items:center;
  font-size:13px;
  background:transparent;
  box-sizing:border-box;

  & > span.color {
    width:18px;
    height:18px;
    border-radius:4px;
    background: ${({ color }) => color || "#ccc"};
    border: ${({ borderColor, borderWidth }) => borderColor ? `${borderWidth ?? 2}px solid ${borderColor}` : "none"};
    box-sizing: border-box;
  }
`;


export const SmallSelect = styled.select`
  padding: 8px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  font-size: 14px;
  outline: none;
  margin-right:10px;
  margin-bottom:10px;
`;

export const ThreeCols = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Button = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  margin-right:10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const BtnAdd = styled.button`
  display:flex;
  gap:8px;
  font-size:15px;
  align-items:center;
  margin-left: auto; 
  background: #191970;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  position: static; 
  right: auto;
  &:hover { opacity: 0.7; transform: translateY(-1px); }
`;

export const BtnClose = styled.button`
  gap:8px;
  font-size:15px;
  background: #e6e6f1ff;
  margin-left:370px;
  color: #191970;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  &:hover { opacity: 0.7; transform: translateY(-1px); }
`;

export const ButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const BtnPrimaryClose = styled.button`
  background: #e6e6f1ff;
  color: #191970;
  border-color:#191970;
  border: 2px;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index: 1000;
`;

const baseInput = `
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;

export const Input = styled.input`
  ${baseInput}
  &:focus {
    border-color: #7b63ff;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const Label = styled.label`
  font-weight: normal;
  margin-left: 5px;
`;

export const Textarea = styled.textarea`
  ${baseInput}
  min-height: 82px;
  border-radius: 12px;
  resize: vertical;
  padding-top: 10px;
  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(22,28,70,0.06);
  border: 1px solid #eee;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

export const ColumnLeft = styled.div`
  padding-right: 24px;
  border-right: 1px solid #e6e8f2;

  @media (max-width: 880px) {
    padding-right: 0;
    border-right: none;
  }
`;

export const ColumnRight = styled.div`
  padding-left: 24px;

  @media (max-width: 880px) {
    padding-left: 0;
  }
`;

export const Field = styled.div`
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 14px;
    color: #6b6f85;
    margin-bottom: 6px;
  }
`;

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const ModalContent = styled.div`
  color: #171770;
  width: 420px;
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-sizing: border-box;
`;

export const SepDivider = styled.hr`
  border: 0;
  border-top: 1px solid #eee;
  margin: 12px 0;
`;

export const SepHeader = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
`;

export const SepList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

export const SepItemButton = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  border: ${p => (p.active ? "2px solid #27348E" : "1px solid #ddd")};
  background: ${p => (p.active ? "#f4f7ff" : "#fff")};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const SepItemName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #171770;
`;

export const SepItemDate = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
`;

export const SepItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  &:not(:last-child) { margin-bottom: 6px; }
`;

export const SepToggle = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #27348E;
  font-size: 14px;
`;

export const ModalButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;