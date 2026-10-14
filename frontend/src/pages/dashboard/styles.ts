import styled from "styled-components";

export const chartTokens = {
  series: "#2a78d6",
  surface: "#ffffff",
  grid: "#eef0ef",
  textPrimary: "#12231c",
  textSecondary: "#6b7a73",
  status: {
    EXPIRED: "#d03b3b",
    EXPIRING: "#fab219",
    VALID: "#0ca30c",
    NO_EXPIRATION: "#c7cdc9",
  },
};

export const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26px;
  font-weight: 600;
  color: ${chartTokens.textPrimary};
  margin: 0 0 4px 0;
`;

export const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${chartTokens.textSecondary};
  margin: 0;
`;

export const TilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Tile = styled.button<{ $clickable?: boolean }>`
  all: unset;
  box-sizing: border-box;
  background: ${chartTokens.surface};
  border: 1px solid #e4e7e5;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ $clickable }) => ($clickable ? "#16302a" : "#e4e7e5")};
  }

  &:focus-visible {
    outline: 2px solid #16302a;
    outline-offset: 2px;
  }
`;

export const TileLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${chartTokens.textSecondary};
`;

export const TileValue = styled.span`
  font-size: 32px;
  line-height: 1.1;
  font-weight: 600;
  color: ${chartTokens.textPrimary};
  font-variant-numeric: tabular-nums;
`;

export const TileFooter = styled.span`
  font-size: 12px;
  color: ${chartTokens.textSecondary};
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ChartCard = styled.section`
  background: ${chartTokens.surface};
  border: 1px solid #e4e7e5;
  border-radius: 12px;
  padding: 18px 20px 12px;
  min-width: 0;
`;

export const ChartTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: ${chartTokens.textPrimary};
  margin: 0;
`;

export const ChartSubtitle = styled.p`
  font-size: 12px;
  color: ${chartTokens.textSecondary};
  margin: 2px 0 12px 0;
`;

export const ChartBody = styled.div`
  width: 100%;
  height: 260px;
`;

export const DonutLayout = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: center;
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const DonutWrapper = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
`;

export const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  strong {
    font-size: 28px;
    color: ${chartTokens.textPrimary};
    font-variant-numeric: tabular-nums;
  }

  span {
    font-size: 12px;
    color: ${chartTokens.textSecondary};
  }
`;

export const StatusLegend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatusLegendItem = styled.li`
  button {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: 12px 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: ${chartTokens.textPrimary};
  }

  button:hover {
    background: #f4f6f5;
  }

  button:focus-visible {
    outline: 2px solid #16302a;
  }

  .swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .value {
    color: ${chartTokens.textSecondary};
    font-variant-numeric: tabular-nums;
  }
`;

export const TooltipBox = styled.div`
  background: ${chartTokens.surface};
  border: 1px solid #e4e7e5;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(18, 35, 28, 0.08);
  font-size: 13px;
  color: ${chartTokens.textPrimary};

  .label {
    color: ${chartTokens.textSecondary};
    font-size: 12px;
    margin-bottom: 2px;
  }

  strong {
    font-variant-numeric: tabular-nums;
  }
`;
