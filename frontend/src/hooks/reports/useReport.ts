import { useCallback, useEffect, useState } from "react";
import { openErrorNotification } from "../../components/notification/error";
import type { ReportFilters } from "../../service/reports/types";

// Hook genérico: cada relatório passa sua função de busca e os filtros iniciais
const useReport = <T>(
  fetcher: (filters: ReportFilters) => Promise<T>,
  initialFilters: ReportFilters,
) => {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generate = useCallback(
    async (nextFilters: ReportFilters) => {
      try {
        setLoading(true);
        setData(await fetcher(nextFilters));
      } catch (e: any) {
        const backendMessage = e?.response?.data?.message;
        openErrorNotification({
          title: "Falha ao gerar relatório",
          description: Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || e?.message || String(e),
        });
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  // Gera com os filtros padrão ao abrir a aba
  useEffect(() => {
    generate(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilters = (partial: Partial<ReportFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  return {
    filters,
    updateFilters,
    data,
    loading,
    generate: () => generate(filters),
  };
};

export default useReport;
