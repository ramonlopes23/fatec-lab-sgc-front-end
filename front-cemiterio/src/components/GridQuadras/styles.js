import styled, {css} from "styled-components";

export const GridWrap = styled.div`
  width: 100%;
`;

export const Grid = styled.div`
  --tile-min-width: ${(props) => props.tileMinWidth || "91px"};

  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--tile-min-width), 1fr)
  );
  gap: 10px;
  width: 100%;
  align-items: stretch;

  @media (max-width: 420px) {
    gap: 8px;
  }
`;

const statusStyles = {
  livre: css`
    background: #f4fbf6;
    .badge {
      background: #e7f8ee;
      color: #1b7a3a;
    }
  `,
  ocupado: css`
    background: #fff6f6;
    .badge {
      background: #ffe9e9;
      color: #b91c1c;
    }
  `,
  reservado: css`
    background: #fffaf0;
    .badge {
      background: #fff2d6;
      color: #b45b00;
    }
  `,
  isento: css`
    background: #f2f8ff;
    .badge {
      background: #e8f0ff;
      color: #175fbf;
    }
  `,
};

export const Tile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 64px;
  padding: 10px 8px;

  border-radius: 8px;
  background: #f7f8fb;
  border: 2px solid transparent;
  cursor: pointer;

  transition: transform 0.12s ease,
              box-shadow 0.12s ease,
              background 0.12s;

  box-shadow: 0 2px 6px rgba(7, 17, 27, 0.04);

  &:hover,
  &:focus {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(7, 17, 27, 0.08);
    outline: none;
  }

  &:focus-visible {
    outline: 3px solid rgba(100, 120, 255, 0.18);
    outline-offset: 2px;
  }

  /* Tile selecionado */
  ${(props) =>
    props.selected &&
    css`
      background: linear-gradient(
        180deg,
        rgba(106, 87, 255, 0.12),
        rgba(106, 87, 255, 0.06)
      );
      border-color: #6a57ff;
    `}

  /* Status dinâmico */
  ${(props) => props.status && statusStyles[props.status]}

  @media (max-width: 420px) {
    min-height: 56px;
    padding: 8px 6px;
  }
`;

export const TileLabel = styled.div`
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 14px;
  color: #0f1724;

  @media (max-width: 420px) {
    font-size: 13px;
  }
`;

export const TileBadge = styled.div.attrs({ className: "badge" })`
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.04);
  color: #333;

  @media (max-width: 420px) {
    font-size: 11px;
  }
`;
