"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import type { AdminStudentRow } from "@/components/admin/admin-students-table";

type ExportFormat = "csv" | "excel" | "pdf";

const HEADERS = [
  "Name",
  "Email",
  "Mobile",
  "College",
  "City",
  "Target Role",
  "Readiness",
  "Mentor",
  "Status",
  "Registered On",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toRow(s: AdminStudentRow): string[] {
  return [
    s.name,
    s.email,
    s.mobile ?? "",
    s.college ?? "",
    s.city ?? "",
    s.targetRole ?? "",
    `${s.readinessScore}/100`,
    s.mentorName ?? "Unassigned",
    s.onboardedAt ? "Onboarded" : "Pending",
    new Date(s.createdAt).toLocaleDateString("en-IN"),
  ];
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function buildCsv(rows: string[][]): string {
  const lines = [HEADERS, ...rows].map((r) => r.map(escapeCsv).join(","));
  // BOM so Excel renders UTF-8 characters correctly
  return "\uFEFF" + lines.join("\r\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildExcel(rows: string[][], title: string): string {
  const head = HEADERS.map((h) => `<th style="background:#4f46e5;color:#ffffff;font-weight:bold;">${escapeHtml(h)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${r
          .map((c) => `<td style="mso-number-format:'\\@';">${escapeHtml(c)}</td>`)
          .join("")}</tr>`
    )
    .join("");
  return `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Registrations</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body><h3>${escapeHtml(title)}</h3>
<table border="1" cellspacing="0" cellpadding="4"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`;
}

function buildPdf(rows: string[][], title: string): jsPDF {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("Career OS — Student Registrations", 14, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(title, 14, 23);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, pageWidth - 14, 23, { align: "right" });

  const colWidths = [38, 55, 26, 55, 28, 32, 20, 34, 22, 24];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = Math.min(1, (pageWidth - 28) / tableWidth);
  const widths = colWidths.map((w) => w * scale);

  const drawRow = (cells: string[], y: number, isHeader: boolean) => {
    let x = 14;
    doc.setFont("Helvetica", isHeader ? "bold" : "normal");
    doc.setFontSize(isHeader ? 8.5 : 8);
    if (isHeader) {
      doc.setFillColor(79, 70, 229);
      doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, "F");
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(51, 65, 85);
    }
    cells.forEach((cell, i) => {
      const text = doc.splitTextToSize(cell || "", widths[i] - 3)[0] ?? "";
      doc.text(text, x + 1.5, y);
      x += widths[i];
    });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(14, y + 2, 14 + widths.reduce((a, b) => a + b, 0), y + 2);
  };

  let y = 36;
  drawRow(HEADERS, y, true);
  y += 10;

  rows.forEach((row, idx) => {
    if (y > pageHeight - 16) {
      doc.addPage();
      y = 20;
      drawRow(HEADERS, y, true);
      y += 10;
    }
    if (idx % 2 === 1 && row.length) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, "F");
    }
    drawRow(row, y, false);
    y += 9;
  });

  return doc;
}

function triggerDownload(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function RegistrationExport({ students }: { students: AdminStudentRow[] }) {
  const now = new Date();
  const [month, setMonth] = useState<string>("all");

  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const s of students) {
      const d = new Date(s.createdAt);
      keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    keys.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    return [...keys].sort().reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  const filtered = useMemo(() => {
    if (month === "all") return students;
    return students.filter((s) => {
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === month;
    });
  }, [students, month]);

  const monthLabel =
    month === "all"
      ? "All time"
      : (() => {
          const [y, m] = month.split("-").map(Number);
          return `${MONTH_NAMES[m - 1]} ${y}`;
        })();

  const title = `Registrations — ${monthLabel} (${filtered.length} student${filtered.length === 1 ? "" : "s"})`;

  const handleDownload = (format: ExportFormat) => {
    const rows = filtered.map(toRow);
    const stamp = month === "all" ? "all-time" : month;
    if (format === "csv") {
      triggerDownload(buildCsv(rows), `registrations-${stamp}.csv`, "text/csv;charset=utf-8;");
    } else if (format === "excel") {
      triggerDownload(buildExcel(rows, title), `registrations-${stamp}.xls`, "application/vnd.ms-excel");
    } else {
      buildPdf(rows, title).save(`registrations-${stamp}.pdf`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <Label htmlFor="reg-month">Registration month</Label>
          <Select id="reg-month" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">All time</option>
            {monthOptions.map((key) => {
              const [y, m] = key.split("-").map(Number);
              return (
                <option key={key} value={key}>
                  {MONTH_NAMES[m - 1]} {y}
                </option>
              );
            })}
          </Select>
        </div>

        <p className="text-sm text-slate-500 pb-2.5">
          <span className="font-semibold text-slate-700">{filtered.length}</span> registration
          {filtered.length === 1 ? "" : "s"} in <span className="font-medium">{monthLabel}</span>
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => handleDownload("csv")} disabled={filtered.length === 0}>
            <FileText className="mr-1 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => handleDownload("excel")} disabled={filtered.length === 0}>
            <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" onClick={() => handleDownload("pdf")} disabled={filtered.length === 0}>
            <Download className="mr-1 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
