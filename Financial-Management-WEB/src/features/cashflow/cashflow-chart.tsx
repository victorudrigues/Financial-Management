"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { DailyCashFlow } from "@/types/dtos";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function CashFlowChart({ data }: { data: DailyCashFlow[] }) {
  const { resolvedTheme } = useTheme();

  const categories = data.map((d) => new Date(d.date).toLocaleDateString("pt-BR"));

  return (
    <Chart
      type="area"
      height={320}
      series={[
        { name: "Entradas", data: data.map((d) => d.income) },
        { name: "Saídas", data: data.map((d) => d.expense) },
      ]}
      options={{
        chart: { toolbar: { show: false }, background: "transparent" },
        theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
        colors: ["#10b981", "#ef4444"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: { categories },
        legend: { position: "top" },
        fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
      }}
    />
  );
}
