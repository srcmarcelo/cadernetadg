import { formatBRL, roundMoney } from './currency';
import { formatMonthYear } from './monthUtils';

/**
 * Computes structured export summary for a Debtor in a given month YYYY-MM.
 */
export function buildDebtorMonthlyReport({
  debtor,
  resolvedDebts = [],
  selectedMonth,
  creditorName = '',
  includeDisabled = false,
}) {
  const monthLabel = formatMonthYear(selectedMonth);
  const items = resolvedDebts
    .filter((d) => d.debtor_id === debtor?.id && d.active)
    .filter((d) => (includeDisabled ? true : !d.effectiveDisabled))
    .map((d) => ({
      id: d.id,
      name: (d.name || 'Sem descrição').trim(),
      value: roundMoney(d.effectiveValue || 0),
      currentInstallment: d.currentInstallment || 1,
      totalInstallments: d.totalInstallments || 1,
      paid: Boolean(d.effectivePaid),
      disabled: Boolean(d.effectiveDisabled),
    }));

  const totalAll = roundMoney(items.reduce((acc, it) => acc + it.value, 0));
  const totalPaid = roundMoney(
    items.filter((it) => it.paid).reduce((acc, it) => acc + it.value, 0)
  );
  const totalPending = roundMoney(
    items.filter((it) => !it.paid && !it.disabled).reduce((acc, it) => acc + it.value, 0)
  );

  return {
    debtorName: (debtor?.name || 'Devedor').trim(),
    creditorName: (creditorName || '').trim(),
    selectedMonth,
    monthLabel,
    items,
    totalAll,
    totalPaid,
    totalPending,
    generatedAt: new Date(),
  };
}

/**
 * Generates a clean, ready-to-send WhatsApp message (*bold*, itemized list, installments, totals).
 */
export function formatDebtorWhatsAppText(report) {
  const lines = [];
  lines.push(`*Caderneta Digital — Resumo do Mês*`);
  lines.push(`👤 *Para:* ${report.debtorName}`);
  if (report.creditorName) {
    lines.push(`📌 *Referente a:* ${report.creditorName}`);
  }
  lines.push(`📅 *Mês:* ${report.monthLabel}`);
  lines.push('');

  if (report.items.length === 0) {
    lines.push('_Nenhum débito registrado neste mês._');
  } else {
    lines.push('*Detalhamento:*');
    report.items.forEach((it, idx) => {
      const parcelInfo =
        it.totalInstallments > 1
          ? ` _(Parcela ${it.currentInstallment}/${it.totalInstallments})_`
          : ' _(À vista)_';
      const statusBadge = it.paid ? ' ✅ [Pago]' : '';
      lines.push(
        `${idx + 1}. *${it.name}*${parcelInfo}: ${formatBRL(it.value)}${statusBadge}`
      );
    });
  }

  lines.push('');
  lines.push('────────────────────');
  if (report.totalPaid > 0) {
    lines.push(`Total do mês: ${formatBRL(report.totalAll)}`);
    lines.push(`Já pago: ${formatBRL(report.totalPaid)}`);
    lines.push(`💰 *Falta pagar: ${formatBRL(report.totalPending)}*`);
  } else {
    lines.push(`💰 *Total a pagar: ${formatBRL(report.totalPending)}*`);
  }

  return lines.join('\n');
}

/**
 * Renders a high-resolution (2x Retina) visual extrato card onto an HTML5 Canvas
 * and returns a data URL (`image/png`) + Blob for downloading or sharing via Web Share API.
 */
export async function renderDebtorReportCanvas(report) {
  if (typeof document === 'undefined') {
    throw new Error('Canvas export is only available in the browser');
  }

  const scale = 2;
  const width = 640;
  const headerHeight = 148;
  const rowHeight = 52;
  const rowsCount = Math.max(1, report.items.length);
  const summaryHeight = report.totalPaid > 0 ? 156 : 116;
  const footerHeight = 48;
  const height = headerHeight + 50 + rowsCount * rowHeight + summaryHeight + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#F4F6FB';
  ctx.fillRect(0, 0, width, height);

  // Main Card container
  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardH = height - 40;

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.fill();

  // Header Banner
  ctx.fillStyle = '#1E295E';
  roundRectTop(ctx, cardX, cardY, cardW, 118, 16);
  ctx.fill();

  ctx.fillStyle = '#9BB0FF';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CADERNETA DIGITAL • EXTRATO MENSAL', cardX + 28, cardY + 34);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(truncateText(ctx, report.debtorName.toUpperCase(), cardW - 210), cardX + 28, cardY + 68);

  ctx.fillStyle = '#DCE4FF';
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const subtitle = report.creditorName
    ? `${report.monthLabel}  •  Organizado por ${report.creditorName}`
    : report.monthLabel;
  ctx.fillText(truncateText(ctx, subtitle, cardW - 56), cardX + 28, cardY + 95);

  // Table Column Headers
  let y = cardY + 146;
  ctx.fillStyle = '#64748B';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DESCRIÇÃO', cardX + 28, y);
  ctx.fillText('PARCELA', cardX + 340, y);
  ctx.textAlign = 'right';
  ctx.fillText('VALOR', cardX + cardW - 28, y);
  ctx.textAlign = 'left';

  y += 12;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 28, y);
  ctx.lineTo(cardX + cardW - 28, y);
  ctx.stroke();

  // Items
  if (report.items.length === 0) {
    y += 34;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Nenhum débito ativo neste mês.', cardX + 28, y);
    y += 18;
  } else {
    report.items.forEach((it, index) => {
      const rowTop = y + index * rowHeight;
      if (index % 2 === 1) {
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(cardX + 16, rowTop + 2, cardW - 32, rowHeight - 4);
      }

      const textY = rowTop + 31;
      ctx.fillStyle = it.paid ? '#64748B' : '#0F172A';
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const titleStr = it.paid ? `${it.name} (Pago)` : it.name;
      ctx.fillText(truncateText(ctx, titleStr, 295), cardX + 28, textY);

      // Parcel badge
      const parcelStr =
        it.totalInstallments > 1
          ? `${it.currentInstallment}/${it.totalInstallments}`
          : 'À vista';
      ctx.fillStyle = it.totalInstallments > 1 ? '#EEF2FF' : '#F1F5F9';
      roundRect(ctx, cardX + 336, rowTop + 14, 72, 24, 12);
      ctx.fill();
      ctx.fillStyle = it.totalInstallments > 1 ? '#3730A3' : '#475569';
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(parcelStr, cardX + 372, rowTop + 30);

      // Value
      ctx.textAlign = 'right';
      ctx.fillStyle = it.paid ? '#16A34A' : '#0F172A';
      ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(formatBRL(it.value), cardX + cardW - 28, textY);
      ctx.textAlign = 'left';
    });
    y += report.items.length * rowHeight;
  }

  // Summary Box
  y += 18;
  const boxH = report.totalPaid > 0 ? 116 : 76;
  ctx.fillStyle = '#F0FDF4';
  roundRect(ctx, cardX + 24, y, cardW - 48, boxH, 12);
  ctx.fill();
  ctx.strokeStyle = '#BBF7D0';
  ctx.stroke();

  let sumY = y + 28;
  if (report.totalPaid > 0) {
    ctx.fillStyle = '#475569';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Total do mês:', cardX + 44, sumY);
    ctx.textAlign = 'right';
    ctx.fillText(formatBRL(report.totalAll), cardX + cardW - 44, sumY);
    ctx.textAlign = 'left';

    sumY += 24;
    ctx.fillStyle = '#16A34A';
    ctx.fillText('Já pago:', cardX + 44, sumY);
    ctx.textAlign = 'right';
    ctx.fillText(formatBRL(report.totalPaid), cardX + cardW - 44, sumY);
    ctx.textAlign = 'left';

    sumY += 34;
  } else {
    sumY = y + 45;
  }

  ctx.fillStyle = '#14532D';
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TOTAL A PAGAR', cardX + 44, sumY);
  ctx.textAlign = 'right';
  ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(formatBRL(report.totalPending), cardX + cardW - 44, sumY + 2);
  ctx.textAlign = 'left';

  // Footer
  const genDate = report.generatedAt.toLocaleDateString('pt-BR');
  ctx.fillStyle = '#94A3B8';
  ctx.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Gerado em ${genDate} via Caderneta Digital`, width / 2, cardY + cardH - 16);
  ctx.textAlign = 'left';

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { dataUrl, blob, width, height };
}

/**
 * Generates a clean multi-page capable PDF document for the Debtor Monthly Report using jsPDF.
 */
export async function generateDebtorReportPDF(report) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;

  // Header Banner
  doc.setFillColor(30, 41, 94);
  doc.roundedRect(margin, 14, pageWidth - margin * 2, 34, 3, 3, 'F');

  doc.setTextColor(175, 195, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CADERNETA DIGITAL - EXTRATO MENSAL DE DEBITOS', margin + 8, 23);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text(report.debtorName.toUpperCase(), margin + 8, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const sub = report.creditorName
    ? `Referencia: ${report.monthLabel}  |  Titular: ${report.creditorName}`
    : `Referencia: ${report.monthLabel}`;
  doc.text(sub, margin + 8, 42);

  let y = 58;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRICAO', margin + 4, y + 6);
  doc.text('PARCELA', pageWidth - margin - 68, y + 6);
  doc.text('STATUS', pageWidth - margin - 40, y + 6);
  doc.text('VALOR', pageWidth - margin - 4, y + 6, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (report.items.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhum debito registrado para este mes.', margin + 4, y + 4);
    y += 12;
  } else {
    report.items.forEach((it, idx) => {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 4, pageWidth - margin * 2, 9, 'F');
      }
      doc.setTextColor(15, 23, 42);
      const safeName = it.name.length > 44 ? `${it.name.slice(0, 41)}...` : it.name;
      doc.text(safeName, margin + 4, y + 2);

      const parcelStr =
        it.totalInstallments > 1
          ? `${it.currentInstallment} de ${it.totalInstallments}`
          : 'A vista';
      doc.setTextColor(71, 85, 105);
      doc.text(parcelStr, pageWidth - margin - 68, y + 2);

      doc.setTextColor(it.paid ? 22 : 180, it.paid ? 163 : 83, it.paid ? 74 : 9);
      doc.text(it.paid ? 'Pago' : 'Pendente', pageWidth - margin - 40, y + 2);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(formatBRL(it.value), pageWidth - margin - 4, y + 2, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += 9;
    });
  }

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  if (report.totalPaid > 0) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.text('Total do mes:', pageWidth - margin - 65, y);
    doc.text(formatBRL(report.totalAll), pageWidth - margin - 4, y, { align: 'right' });
    y += 6;

    doc.setTextColor(22, 163, 74);
    doc.text('Ja pago:', pageWidth - margin - 65, y);
    doc.text(formatBRL(report.totalPaid), pageWidth - margin - 4, y, { align: 'right' });
    y += 8;
  }

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(pageWidth - margin - 85, y - 5, 85, 14, 2, 2, 'F');
  doc.setTextColor(20, 83, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL A PAGAR:', pageWidth - margin - 81, y + 4);
  doc.text(formatBRL(report.totalPending), pageWidth - margin - 4, y + 4, {
    align: 'right',
  });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Documento gerado em ${report.generatedAt.toLocaleDateString('pt-BR')} via Caderneta Digital`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  const blob = doc.output('blob');
  return { doc, blob };
}

export function buildDebtorExportFilename(debtorName, selectedMonth, ext) {
  const slug = String(debtorName || 'devedor')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `extrato-${slug || 'devedor'}-${selectedMonth}.${ext}`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 0 && ctx.measureText(`${str}…`).width > maxWidth) {
    str = str.slice(0, -1);
  }
  return `${str}…`;
}
