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
  max-width: 400px;
  height:100px;
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