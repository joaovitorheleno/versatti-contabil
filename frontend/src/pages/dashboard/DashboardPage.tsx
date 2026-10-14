import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InsertRowLeftOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Skeleton, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { documentCategoryLabels } from "../../common/enum/document-category.enum";
import EmptyState from "../../components/empty/Empty";
import { maskCnpj } from "../../functions/maskCnpj";
import useDashboard from "../../hooks/dashboard/useDashboard";
import type {
  DashboardResponse,
  DocumentStatus,
} from "../../service/dashboard/types";
import * as S from "./styles";
import { chartTokens } from "./styles";

const { Text } = Typography;

const statusMeta: Record<
  DocumentStatus,
  { label: string; icon: ReactNode }
> = {
  EXPIRED: { label: "Vencidos", icon: <CloseCircleOutlined /> },
  EXPIRING: { label: "Vencem em breve", icon: <ExclamationCircleOutlined /> },
  VALID: { label: "Válidos", icon: <CheckCircleOutlined /> },
  NO_EXPIRATION: { label: "Sem vencimento", icon: <MinusCircleOutlined /> },
};

const formatMonth = (month: string) =>
  dayjs(`${month}-01`).locale("pt-br").format("MMM/YY").replace(".", "");

const formatMonthLong = (month: string) =>
  dayjs(`${month}-01`).locale("pt-br").format("MMMM [de] YYYY");

const axisTick = { fill: chartTokens.textSecondary, fontSize: 12 };

const ChartTooltip = ({
  active,
  payload,
  label,
  formatLabel,
  unit,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  formatLabel?: (label: string) => string;
  unit: string;
}) => {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0].value ?? 0);

  return (
    <S.TooltipBox>
      <div className="label">
        {formatLabel ? formatLabel(String(label)) : label}
      </div>
      <strong>{value}</strong> {value === 1 ? unit : `${unit}s`}
    </S.TooltipBox>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { loading, data, fetchDashboard } = useDashboard();

  const goToDocuments = (params: Record<string, string>) =>
    navigate(`/documents?${new URLSearchParams(params).toString()}`);

  if (loading && !data) {
    return (
      <S.DashboardContainer>
        <Skeleton active paragraph={{ rows: 2 }} />
        <S.TilesGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <S.Tile as="div" key={i}>
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </S.Tile>
          ))}
        </S.TilesGrid>
      </S.DashboardContainer>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const monthDelta = summary.sentThisMonth - summary.sentLastMonth;

  return (
    <S.DashboardContainer>
      <S.PageHeader>
        <div>
          <S.PageTitle>Dashboard</S.PageTitle>
          <S.PageSubtitle>
            Situação dos documentos das empresas em{" "}
            {dayjs().locale("pt-br").format("DD [de] MMMM [de] YYYY")}
          </S.PageSubtitle>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDashboard}
          loading={loading}
        >
          Atualizar
        </Button>
      </S.PageHeader>

      <S.TilesGrid>
        <S.Tile
          $clickable
          onClick={() => goToDocuments({ status: "EXPIRED" })}
          aria-label={`${summary.expired} documentos vencidos. Ver documentos`}
        >
          <S.TileLabel>
            <CloseCircleOutlined style={{ color: chartTokens.status.EXPIRED }} />
            Documentos vencidos
          </S.TileLabel>
          <S.TileValue>{summary.expired}</S.TileValue>
          <S.TileFooter>Clique para ver a lista</S.TileFooter>
        </S.Tile>

        <S.Tile
          $clickable
          onClick={() => goToDocuments({ status: "EXPIRING" })}
          aria-label={`${summary.expiring} documentos vencem em breve. Ver documentos`}
        >
          <S.TileLabel>
            <ExclamationCircleOutlined
              style={{ color: chartTokens.status.EXPIRING }}
            />
            Vencem em breve
          </S.TileLabel>
          <S.TileValue>{summary.expiring}</S.TileValue>
          <S.TileFooter>Dentro do prazo de alerta de cada documento</S.TileFooter>
        </S.Tile>

        <S.Tile
          $clickable
          onClick={() => navigate("/documents")}
          aria-label={`${summary.sentThisMonth} documentos enviados neste mês. Ver documentos`}
        >
          <S.TileLabel>
            <FileTextOutlined />
            Enviados neste mês
          </S.TileLabel>
          <S.TileValue>{summary.sentThisMonth}</S.TileValue>
          <S.TileFooter>
            {monthDelta === 0 ? (
              "Igual ao mês anterior"
            ) : (
              <>
                {monthDelta > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{" "}
                {Math.abs(monthDelta)} {monthDelta > 0 ? "a mais" : "a menos"}{" "}
                que o mês anterior ({summary.sentLastMonth})
              </>
            )}
          </S.TileFooter>
        </S.Tile>

        <S.Tile
          $clickable
          onClick={() => navigate("/clients")}
          aria-label={`${summary.activeClients} empresas ativas. Ver empresas`}
        >
          <S.TileLabel>
            <InsertRowLeftOutlined />
            Empresas ativas
          </S.TileLabel>
          <S.TileValue>{summary.activeClients}</S.TileValue>
          <S.TileFooter>{summary.totalDocuments} documentos no total</S.TileFooter>
        </S.Tile>
      </S.TilesGrid>

      {summary.totalDocuments === 0 ? (
        <S.ChartCard>
          <EmptyState
            title="Ainda não há documentos enviados"
            description="Os gráficos aparecem assim que os primeiros documentos forem enviados."
          />
        </S.ChartCard>
      ) : (
        <>
          <S.ChartsGrid>
            <ExpirationsChart data={data} />
            <StatusChart data={data} onSelect={goToDocuments} />
            <UploadsChart data={data} />
            <CategoryChart data={data} />
          </S.ChartsGrid>

          <PendingClientsTable data={data} onSelect={goToDocuments} />
        </>
      )}
    </S.DashboardContainer>
  );
};

const ExpirationsChart = ({ data }: { data: DashboardResponse }) => {
  const total = data.expirationsByMonth.reduce((sum, m) => sum + m.count, 0);

  return (
    <S.ChartCard>
      <S.ChartTitle>Vencimentos nos próximos 6 meses</S.ChartTitle>
      <S.ChartSubtitle>
        {total} documento(s) vencem até{" "}
        {formatMonthLong(data.expirationsByMonth.at(-1)!.month)}
      </S.ChartSubtitle>

      <S.ChartBody>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.expirationsByMonth}
            margin={{ top: 20, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={chartTokens.grid} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f4f6f5" }}
              content={(props: any) => (
                <ChartTooltip
                  {...props}
                  formatLabel={formatMonthLong}
                  unit="documento"
                />
              )}
            />
            <Bar
              dataKey="count"
              fill={chartTokens.series}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            >
              <LabelList
                dataKey="count"
                position="top"
                fill={chartTokens.textSecondary}
                fontSize={12}
                formatter={(value: any) => (Number(value) > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </S.ChartBody>
    </S.ChartCard>
  );
};

const StatusChart = ({
  data,
  onSelect,
}: {
  data: DashboardResponse;
  onSelect: (params: Record<string, string>) => void;
}) => {
  const total = data.summary.totalDocuments;
  const slices = data.statusDistribution.filter((item) => item.count > 0);

  return (
    <S.ChartCard>
      <S.ChartTitle>Situação dos documentos</S.ChartTitle>
      <S.ChartSubtitle>Clique em uma situação para ver a lista</S.ChartSubtitle>

      <S.DonutLayout>
        <S.DonutWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="status"
                innerRadius={68}
                outerRadius={100}
                stroke={chartTokens.surface}
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
                onClick={(slice: any) =>
                  onSelect({ status: slice.payload?.status ?? slice.status })
                }
                style={{ cursor: "pointer" }}
              >
                {slices.map((item) => (
                  <Cell key={item.status} fill={chartTokens.status[item.status]} />
                ))}
              </Pie>
              <Tooltip
                content={(props: any) => {
                  const item = props.payload?.[0]?.payload;
                  if (!props.active || !item) return null;
                  return (
                    <S.TooltipBox>
                      <div className="label">
                        {statusMeta[item.status as DocumentStatus].label}
                      </div>
                      <strong>{item.count}</strong> (
                      {Math.round((item.count / total) * 100)}%)
                    </S.TooltipBox>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <S.DonutCenter>
            <strong>{total}</strong>
            <span>documentos</span>
          </S.DonutCenter>
        </S.DonutWrapper>

        <S.StatusLegend>
          {data.statusDistribution.map((item) => (
            <S.StatusLegendItem key={item.status}>
              <button
                type="button"
                onClick={() => onSelect({ status: item.status })}
              >
                <span
                  className="swatch"
                  style={{ background: chartTokens.status[item.status] }}
                />
                <span style={{ color: chartTokens.textSecondary }}>
                  {statusMeta[item.status].icon}
                </span>
                <span>{statusMeta[item.status].label}</span>
                <span className="value">
                  {item.count} ·{" "}
                  {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                </span>
              </button>
            </S.StatusLegendItem>
          ))}
        </S.StatusLegend>
      </S.DonutLayout>
    </S.ChartCard>
  );
};

const UploadsChart = ({ data }: { data: DashboardResponse }) => {
  const total = data.uploadsByMonth.reduce((sum, m) => sum + m.count, 0);

  return (
    <S.ChartCard>
      <S.ChartTitle>Documentos enviados por mês</S.ChartTitle>
      <S.ChartSubtitle>{total} envio(s) nos últimos 12 meses</S.ChartSubtitle>

      <S.ChartBody>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.uploadsByMonth}
            margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={chartTokens.grid} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              allowDecimals={false}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: chartTokens.textSecondary, strokeWidth: 1 }}
              content={(props: any) => (
                <ChartTooltip
                  {...props}
                  formatLabel={formatMonthLong}
                  unit="envio"
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={chartTokens.series}
              strokeWidth={2}
              fill={chartTokens.series}
              fillOpacity={0.1}
              dot={false}
              activeDot={{
                r: 5,
                fill: chartTokens.series,
                stroke: chartTokens.surface,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </S.ChartBody>
    </S.ChartCard>
  );
};

const CategoryChart = ({ data }: { data: DashboardResponse }) => {
  const rows = data.byCategory.map((item) => ({
    ...item,
    label: documentCategoryLabels[item.category] ?? item.category,
  }));

  return (
    <S.ChartCard>
      <S.ChartTitle>Documentos por categoria</S.ChartTitle>
      <S.ChartSubtitle>Onde está o volume de trabalho</S.ChartSubtitle>

      <S.ChartBody style={{ height: Math.max(180, rows.length * 36 + 24) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 36, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={chartTokens.grid} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={axisTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ ...axisTick, fill: chartTokens.textPrimary }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f4f6f5" }}
              content={(props: any) => (
                <ChartTooltip {...props} unit="documento" />
              )}
            />
            <Bar
              dataKey="count"
              fill={chartTokens.series}
              radius={[0, 4, 4, 0]}
              maxBarSize={20}
            >
              <LabelList
                dataKey="count"
                position="right"
                fill={chartTokens.textSecondary}
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </S.ChartBody>
    </S.ChartCard>
  );
};

type PendingRow = DashboardResponse["clientsWithPending"][number];

const PendingClientsTable = ({
  data,
  onSelect,
}: {
  data: DashboardResponse;
  onSelect: (params: Record<string, string>) => void;
}) => {
  const columns: ColumnsType<PendingRow> = [
    {
      title: "Empresa",
      key: "name",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {maskCnpj(record.cnpj)}
          </Text>
        </div>
      ),
    },
    {
      title: "Vencidos",
      dataIndex: "expired",
      key: "expired",
      align: "center",
      render: (value: number) =>
        value > 0 ? (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            {value}
          </Tag>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: "Vencem em breve",
      dataIndex: "expiring",
      key: "expiring",
      align: "center",
      render: (value: number) =>
        value > 0 ? (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            {value}
          </Tag>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => onSelect({ clientId: record.clientId })}
        >
          Ver documentos
        </Button>
      ),
    },
  ];

  return (
    <S.ChartCard>
      <S.ChartTitle>Empresas com pendências</S.ChartTitle>
      <S.ChartSubtitle>
        As 10 empresas com mais documentos vencidos ou perto de vencer
      </S.ChartSubtitle>

      <Table
        dataSource={data.clientsWithPending}
        columns={columns}
        rowKey="clientId"
        pagination={false}
        size="small"
        scroll={{ x: 520 }}
        locale={{
          emptyText: (
            <EmptyState
              title="Nenhuma pendência"
              description="Todos os documentos com vencimento estão em dia."
            />
          ),
        }}
      />
    </S.ChartCard>
  );
};

export default DashboardPage;
