/* Кликабельная ссылка на карточку позиции (ОС/НМА/ТМЗ). Используется везде,
   где показывается наименование/код актива: заявки, документы, отчёты, склад. */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../ui/primitives';

interface AssetLinkProps {
  assetId?: number | null;
  children: React.ReactNode;
  muted?: boolean;
  style?: React.CSSProperties;
}

const AssetLink: React.FC<AssetLinkProps> = ({ assetId, children, muted, style }) => {
  const navigate = useNavigate();
  if (!assetId) {
    return <span style={{ color: muted ? C.muted : C.text, ...style }}>{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); navigate(`/assets/${assetId}`); }}
      title="Открыть карточку позиции"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        color: C.accent,
        fontSize: 'inherit',
        fontWeight: 600,
        textAlign: 'left',
        textDecoration: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default AssetLink;
