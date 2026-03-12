/* Компонент статус-бейджа для заявок и документов */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/primitives';

interface StatusBadgeProps {
  status: string;
  type?: 'request' | 'document';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'request' }) => {
  const { t } = useTranslation();
  const prefix = type === 'document' ? 'documents.status' : 'requests.status';
  const label = t(`${prefix}.${status}`, status);

  return <Badge status={label} />;
};

export default StatusBadge;
