export interface User {
  id: number;
  username: string;
  email: string;
  photo: string | null;
  first_name: string;
  last_name: string;
  patronymic: string;
  position: string;
  department: number | null;
  department_name: string;
  phone: string;
  role: UserRole;
  supervisor: number | null;
  supervisor_name: string;
  is_active: boolean;
  date_joined: string;
  full_name: string;
  short_name: string;
}

export type UserRole =
  | 'ADMIN'
  | 'AHS_WORKER'
  | 'AHS_HEAD'
  | 'MOL_WAREHOUSE'
  | 'MOL_NMA'
  | 'FO_HEAD'
  | 'DEPT_HEAD'
  | 'USER'
  | 'COMMISSION_MEMBER'
  | 'IRD_WORKER';

export type AssetType = 'TMZ' | 'OS' | 'NMA' | 'REPRESENTATIVE_TMZ';

export type RequestStatus =
  | 'DRAFT'
  | 'PENDING_SUPERVISOR'
  | 'APPROVED_SUPERVISOR'
  | 'APPROVED_MOL'
  | 'APPROVED_AHS_HEAD'
  | 'APPROVED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'CANCELLED';

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'PARTIALLY_SIGNED'
  | 'SIGNED'
  | 'SENT_FOR_REVISION'
  | 'CANCELLED';

export interface Department {
  id: number;
  name: string;
  code: string;
  head: number | null;
  head_name: string;
  parent: number | null;
  parent_name: string;
}

export interface Counterparty {
  id: number;
  name: string;
  bin: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
}

export interface Asset {
  id: number;
  name: string;
  code: string;
  asset_type: AssetType;
  asset_type_display: string;
  category: number;
  category_name: string;
  group: number | null;
  group_name: string;
  unit_of_measure: string;
  unit_price: string;
  is_long_term_use: boolean;
  inventory_number: string | null;
  balance_date: string | null;
  useful_life_months: number | null;
  depreciation_rate: string | null;
  stock_quantity: string;
  source_1c_id: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseStock {
  id: number;
  asset: number;
  asset_name: string;
  asset_code: string;
  asset_type: AssetType;
  asset_type_display: string;
  unit_of_measure: string;
  unit_price: string;
  quantity: string;
  total_amount: string;
  location: string;
}

export interface AssetRequest {
  id: number;
  number: string;
  request_type: number;
  request_type_name: string;
  status: RequestStatus;
  status_display: string;
  initiator: number;
  initiator_name: string;
  from_user: number | null;
  to_user: number | null;
  reason: string;
  items: AssetRequestItem[];
  approvals: RequestApproval[];
  created_at: string;
  updated_at: string;
}

export interface AssetRequestItem {
  id: number;
  requested_group: number | null;
  requested_group_name: string;
  asset: number | null;
  asset_name: string;
  asset_code: string;
  issued_asset: number | null;
  issued_asset_name: string;
  issued_asset_code: string;
  unit_of_measure: string;
  unit_price: string | null;
  quantity_requested: string;
  quantity_issued: string | null;
  comment: string;
}

export interface RequestApproval {
  id: number;
  approver: number;
  approver_name: string;
  role_at_approval: string;
  action: string;
  action_display: string;
  signed_at: string | null;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  type_display: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface AssetCategory {
  id: number;
  name: string;
  code: string;
  asset_type: AssetType;
  asset_type_display: string;
  parent: number | null;
  parent_name: string;
  asset_count: number;
  group_total_quantity: string;
}

export interface RequestTypeReference {
  id: number;
  name: string;
  code: string;
  asset_type: AssetType;
  asset_type_display: string;
  requires_long_term_use: boolean;
  description: string;
  is_active: boolean;
}

export interface LimitNorm {
  id: number;
  asset_type: string;
  asset_type_display: string;
  category: string;
  quantity_limit: string;
  period: string;
  period_display: string;
  department: number | null;
  department_name: string;
  valid_from: string;
  valid_to: string;
  created_by: number | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
