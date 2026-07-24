import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
  InboxOutlined,
  LeftOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import { C, PageHeader, Btn, Panel, InputField, SelectField, Badge } from '../../shared/ui/primitives';
import { toLocalDateInputValue } from '../../shared/utils/date';
import type { PaginatedResponse, Warehouse } from '../../shared/types';

interface UploadResult {
  success: boolean;
  asset_type: string;
  balance_date: string;
  processed: number;
  created_assets: number;
  updated_assets: number;
  created_stock: number;
  updated_stock: number;
  errors: { row: number; detail: string }[];
}

const typeOptions = [
  { value: 'TMZ', label: 'TMZ' },
  { value: 'OS', label: 'OS' },
];

const metricStyle: React.CSSProperties = {
  borderTop: `1px solid ${C.rowBorder}`,
  padding: '12px 0 0',
  minWidth: 0,
};

const StockUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assetType, setAssetType] = useState<'TMZ' | 'OS'>('TMZ');
  const [balanceDate, setBalanceDate] = useState<string>(() => toLocalDateInputValue());
  const [warehouse, setWarehouse] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');

  const fileMeta = useMemo(() => {
    if (!file) return '';
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    return `${file.name} · ${sizeKb} KB`;
  }, [file]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<Warehouse>>('/references/warehouses/', {
          params: { page_size: 500, is_active: true, ordering: 'name' },
        });
        setWarehouses(res.data.results || []);
        if (!warehouse && res.data.results?.length) setWarehouse(String(res.data.results[0].id));
      } catch { setWarehouses([]); }
    })();
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('balance_date', balanceDate);
      if (warehouse) formData.append('warehouse', warehouse);

      const res = await api.post<UploadResult>(
        `/assets/upload-stock/?asset_type=${assetType}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const resultMetrics = result ? [
    { label: t('warehouse.processedRows'), value: result.processed },
    { label: t('warehouse.createdAssets'), value: result.created_assets },
    { label: t('warehouse.updatedAssets'), value: result.updated_assets },
    { label: t('warehouse.createdStock'), value: result.created_stock },
    { label: t('warehouse.updatedStock'), value: result.updated_stock },
  ] : [];

  return (
    <div>
      <PageHeader
        title={t('warehouse.uploadTitle')}
        right={(
          <Btn variant="secondary" onClick={() => navigate('/warehouse/stock')}>
            <LeftOutlined /> {t('common.back')}
          </Btn>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 18, alignItems: 'start' }}>
        <Panel title={t('common.importExcel')}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              <SelectField
                label={t('warehouse.assetType')}
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as 'TMZ' | 'OS')}
                options={typeOptions}
              />
              <InputField
                label={t('warehouse.balanceDate')}
                type="date"
                value={balanceDate}
                onChange={(e) => setBalanceDate(e.target.value)}
              />
              <SelectField
                label={t('nav.warehouses')}
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                options={[{ value: '', label: '— из Excel —' }, ...warehouses.map((w) => ({ value: w.id, label: w.name }))]}
              />
            </div>

            <label
              className="ui-card"
              style={{
                border: `1px dashed ${file ? C.accent : C.inputBorder}`,
                borderRadius: C.radiusLg,
                background: file ? C.accentSubtle : C.surfaceSoft,
                padding: 24,
                minHeight: 168,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.16s ease, background 0.16s ease, transform 0.16s ease',
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: C.radiusMd,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: file ? C.white : C.accentLight,
                  color: C.accent,
                  fontSize: 22,
                }}
              >
                {file ? <FileExcelOutlined /> : <InboxOutlined />}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.heading }}>
                {file ? fileMeta : t('warehouse.excelFile')}
              </span>
              <span style={{ fontSize: 12, color: C.secondary, maxWidth: 420, lineHeight: 1.45 }}>
                {t('warehouse.columnsHint')}
              </span>
            </label>

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: C.danger, fontSize: 13, background: C.dangerBg, borderRadius: C.radiusSm, padding: 12 }}>
                <CloseCircleOutlined style={{ marginTop: 1 }} /> <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Btn variant="ghost" type="button" onClick={() => navigate('/warehouse/stock')}>
                {t('common.cancel')}
              </Btn>
              <Btn disabled={!file || loading} loading={loading}>
                <UploadOutlined /> {t('warehouse.uploadBtn')}
              </Btn>
            </div>
          </form>
        </Panel>

        <Panel title={result ? t('warehouse.uploadResult') : t('warehouse.requiredColumns')}>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: C.success, fontSize: 21 }}><CheckCircleOutlined /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: C.heading, fontWeight: 750 }}>{t('common.success')}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                    <Badge status={result.asset_type} />
                    <Badge status={result.balance_date} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                {resultMetrics.map((metric) => (
                  <div key={metric.label} style={metricStyle}>
                    <div style={{ fontSize: 22, fontWeight: 780, color: C.heading, lineHeight: 1 }}>{metric.value}</div>
                    <div style={{ fontSize: 12, color: C.secondary, marginTop: 5, lineHeight: 1.35 }}>{metric.label}</div>
                  </div>
                ))}
              </div>

              {result.errors.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.rowBorder}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 8 }}>{t('warehouse.uploadErrors')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.errors.map((item) => (
                      <div key={`${item.row}-${item.detail}`} style={{ fontSize: 12, color: C.danger }}>
                        {t('warehouse.row')} {item.row}: {item.detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                t('common.code'),
                t('common.name'),
                t('references.unitOfMeasure'),
                t('common.quantity'),
                t('common.price'),
                t('common.amount'),
                t('references.category'),
                t('references.location'),
              ].map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: index === 7 ? 'none' : `1px solid ${C.rowBorder}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: C.text }}>{label}</span>
                  <Badge status={index < 4 ? t('common.active') : t('common.all')} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default StockUploadPage;
