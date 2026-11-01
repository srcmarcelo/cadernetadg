import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CopyOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  ShareAltOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Modal, Tabs, message } from 'antd';
import {
  buildDebtorExportFilename,
  buildDebtorMonthlyReport,
  formatDebtorWhatsAppText,
  generateDebtorReportPDF,
  renderDebtorReportCanvas,
} from '../../../utils/debtorExport';

const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ImageFrame = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  background: #F1F5F9;
  padding: 8px;
  display: flex;
  justify-content: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
`;

const TextPreview = styled.pre`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  padding: 14px;
  border-radius: 10px;
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.84rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: #0F172A;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 8px;
  margin-top: 14px;
`;

export default function DebtorExportModal({
  open,
  onClose,
  debtor,
  resolvedDebts = [],
  selectedMonth,
  creditorName = '',
}) {
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [pngBlob, setPngBlob] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const report = useMemo(() => {
    if (!debtor) return null;
    return buildDebtorMonthlyReport({
      debtor,
      resolvedDebts,
      selectedMonth,
      creditorName,
      includeDisabled,
    });
  }, [debtor, resolvedDebts, selectedMonth, creditorName, includeDisabled]);

  const whatsappText = useMemo(
    () => (report ? formatDebtorWhatsAppText(report) : ''),
    [report]
  );

  useEffect(() => {
    let active = true;
    if (!open || !report) return undefined;

    renderDebtorReportCanvas(report)
      .then(({ dataUrl, blob }) => {
        if (active) {
          setPngDataUrl(dataUrl);
          setPngBlob(blob);
        }
      })
      .catch(() => {
        if (active) {
          setPngDataUrl('');
          setPngBlob(null);
        }
      });

    return () => {
      active = false;
    };
  }, [open, report]);

  if (!debtor || !report) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      message.success('Resumo copiado! Agora é só colar no WhatsApp.');
    } catch {
      message.error('Não foi possível copiar automaticamente.');
    }
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = String(debtor.phone || '').replace(/\D/g, '');
    const phoneParam = cleanPhone
      ? cleanPhone.startsWith('55')
        ? cleanPhone
        : `55${cleanPhone}`
      : '';
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(whatsappText)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = buildDebtorExportFilename(debtor.name, selectedMonth, 'png');
    link.click();
    message.success('Imagem do extrato baixada!');
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const { doc } = await generateDebtorReportPDF(report);
      doc.save(buildDebtorExportFilename(debtor.name, selectedMonth, 'pdf'));
      message.success('PDF do extrato baixado!');
    } catch {
      message.error('Erro ao gerar o PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopyText();
      return;
    }
    try {
      if (pngBlob) {
        const file = new File(
          [pngBlob],
          buildDebtorExportFilename(debtor.name, selectedMonth, 'png'),
          { type: 'image/png' }
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Extrato ${debtor.name} - ${report.monthLabel}`,
            text: whatsappText,
            files: [file],
          });
          return;
        }
      }
      await navigator.share({
        title: `Extrato ${debtor.name} - ${report.monthLabel}`,
        text: whatsappText,
      });
    } catch {
      // user cancelled share sheet
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      title={
        <span style={{ paddingRight: 20, display: 'inline-block' }}>
          Extrato • {debtor.name} ({report.monthLabel})
        </span>
      }
    >
      <div style={{ marginBottom: 10 }}>
        <Checkbox
          checked={includeDisabled}
          onChange={(e) => setIncludeDisabled(e.target.checked)}
        >
          Incluir débitos pausados/ignorados neste mês
        </Checkbox>
      </div>

      <Tabs
        defaultActiveKey='card'
        items={[
          {
            key: 'card',
            label: (
              <span>
                <FileImageOutlined /> Imagem / PDF
              </span>
            ),
            children: (
              <PreviewWrapper>
                {pngDataUrl && (
                  <ImageFrame>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pngDataUrl}
                      alt={`Extrato de ${debtor.name}`}
                    />
                  </ImageFrame>
                )}
              </PreviewWrapper>
            ),
          },
          {
            key: 'whatsapp',
            label: (
              <span>
                <WhatsAppOutlined /> Texto WhatsApp
              </span>
            ),
            children: <TextPreview>{whatsappText}</TextPreview>,
          },
        ]}
      />

      <ActionsGrid>
        <Button
          type='primary'
          icon={<WhatsAppOutlined />}
          onClick={handleOpenWhatsApp}
          style={{ background: '#16A34A', borderColor: '#16A34A' }}
        >
          Enviar no WhatsApp
        </Button>

        <Button icon={<CopyOutlined />} onClick={handleCopyText}>
          Copiar Texto
        </Button>

        <Button
          type='primary'
          icon={<FilePdfOutlined />}
          onClick={handleDownloadPdf}
          loading={exportingPdf}
        >
          Baixar PDF
        </Button>

        <Button icon={<DownloadOutlined />} onClick={handleDownloadPng}>
          Baixar Imagem (PNG)
        </Button>

        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button icon={<ShareAltOutlined />} onClick={handleNativeShare}>
            Compartilhar...
          </Button>
        )}
      </ActionsGrid>
    </Modal>
  );
}
