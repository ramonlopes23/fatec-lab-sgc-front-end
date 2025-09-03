import styled from "styled-components";

export const FooterWrapper = styled.footer`
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  text-align: center;
`;

export const FooterContainer = styled.ul`
  display: flex;
  justify-content: center;
  gap: 1rem;
  list-style: none;
  margin-bottom: 0.5rem;

  a {
    text-decoration: none;
    color: #1f2937;

    &:hover {
      color: #2563eb;
    }
  }
`;

export const SubFooter = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;
