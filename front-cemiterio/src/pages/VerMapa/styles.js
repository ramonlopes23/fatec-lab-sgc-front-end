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
  height: 44px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-weight: 700;
  background-color: ${({ status }) => statusColors[status] || statusColors.default};
  box-shadow: 0 2px 0 rgba(0,0,0,0.12);
  transition: transform 120ms ease, box-shadow 120ms ease;
  position:relative;


  &:hover { transform: translateY(-2px); }
  &:focus { outline: 2px solid #222; }

  /* small number badge*/
  &::after{
    content: "";
    display:block;
  }
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
  color:#222;

  & > span.color {
    width:18px;
    height:18px;
    border-radius:4px;
    background: ${({ color }) => color || "#ccc"};
    border: 1px solid rgba(0,0,0,0.06);
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

