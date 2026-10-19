import styled from "styled-components";

export const Logo = styled.div<{ $collapsed?: boolean }>`
  height: ${({ $collapsed }) => ($collapsed ? "40px" : "48px")};
  margin: 16px;
  color: #fff;
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
`;
