import styled from "styled-components";

export const DashboardWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

export const Card = styled.div`
  background-color: #fff;
  border: 1px solid rgba(25,25,112,0.2);
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  color:#191970;
  padding-bottom: 0.5rem;
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ProcessItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
`;

export const ProcessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    font-size: 1rem;
    color: #191970;
  }

  span {
    font-size: 0.875rem;
    color: #191970;
  }
`;

export const ProcessAction = styled.div`
  font-weight: bold;
  color: #191970
`;


export const Btn = styled.button`
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

