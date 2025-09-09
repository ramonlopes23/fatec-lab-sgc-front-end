import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 18px;
  color: #191970;
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(22,28,70,0.06);
  border: 1px solid #eee;
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  padding-right: 44px;
  &:focus {
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
    border-color: #7b63ff;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #191970;
  cursor:pointer;
  font-size: 18px;
  pointer-events: auto;
`

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

export const SmallInput = styled.input`
  padding: 8px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  font-size: 14px;
  margin-bottom:10px;
  margin-right:10px;
`;

export const BtnPrimary = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.95; }
`;

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const Field = styled.div`
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 12px;
    color: #6b6f85;
    margin-bottom: 6px;
  }
`;

export const ColumnRight = styled.div`
  padding-left: 24px;

  @media (max-width: 880px) {
    padding-left: 0;
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