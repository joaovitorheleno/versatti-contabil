import styled from "styled-components";

export const Logo = styled.div`
  height: 56px;
  margin: 16px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
`;

export const CollapseButton = styled.div`
  font-size: 18px;
  cursor: pointer;
  color: #475569;
  transition: color 0.2s;

  &:hover {
    color: #1677ff;
  }
`;

export const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;