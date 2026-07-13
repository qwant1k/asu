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
  is_staff: boolean;
  is_superuser: boolean;
  effective_permissions: string[];
  date_joined: string;
  last_login: string | null;
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
  | 'SENT_FOR_REVISION'
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
  category: number;
  category_name: string;
  group: number | null;
  group_name: string;
  unit_of_measure: string;
  unit_price: string;
  quantity: string;
  total_amount: string;
  balance_date: string | null;
  location: string;
  updated_at: string;
}

export interface AssetRequest {
  id: number;
  number: string;
  request_type: number;
  request_type_name: string;
  request_type_asset_type: AssetType;
  status: RequestStatus;
  status_display: string;
  initiator: number;
  initiator_name: string;
  from_user: number | null;
  to_user: number | null;
  reason: string;
  items: AssetRequestItem[];
  approvals: RequestApproval[];
  issue_responsibles: number[];
  issue_responsible_names: string[];
  pending_my_approval: boolean;
  pending_my_issue: boolean;
  required_approver_role: UserRole | null;
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

export interface StockMovement {
  id: number;
  asset: number;
  asset_name: string;
  asset_code: string;
  category: number;
  category_name: string;
  group: number | null;
  group_name: string;
  movement_type: string;
  movement_type_display: string;
  quantity: string;
  unit_price: string | null;
  total_amount: string | null;
  from_user: number | null;
  from_user_name: string;
  to_user: number | null;
  to_user_name: string;
  performed_by: number | null;
  performed_by_name: string;
  performed_at: string;
  comment: string;
}

export interface AssetAssignment {
  id: number;
  asset: number;
  asset_name: string;
  asset_code: string;
  asset_type: AssetType;
  asset_type_display: string;
  inventory_number: string;
  category: number;
  category_name: string;
  group: number | null;
  group_name: string;
  user: number;
  user_name: string;
  department_name: string;
  quantity: string;
  assigned_at: string;
  assigned_by: number | null;
  assigned_by_name: string;
  location: string;
  status: string;
  status_display: string;
}

export interface AssetCard extends Asset {
  movements: StockMovement[];
  assignments: AssetAssignment[];
}

export interface Notification {
  id: number;
  notification_type: string;
  type_display: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  related_model: string;
  related_object_id: number | null;
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

export interface ApprovalStep {
  id: number;
  request_type: number;
  order: number;
  approver_role: UserRole;
  approver_role_display: string;
  title: string;
  requires_supervisor: boolean;
  is_active: boolean;
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
  approval_steps: ApprovalStep[];
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

export interface UnitOfMeasure {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  department: number | null;
  department_name: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface AccessPermissionDefinition {
  code: string;
  name: string;
  category: string;
  description: string;
}

export interface AccessDefinitionsResponse {
  permissions: AccessPermissionDefinition[];
  role_defaults: Record<UserRole, string[]>;
}

export interface PositionAccessRule {
  id: number;
  position: string;
  normalized_position: string;
  permission_code: string;
  permission_name: string;
  is_allowed: boolean;
  is_active: boolean;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccessOverride {
  id: number;
  user: number;
  user_name: string;
  username: string;
  permission_code: string;
  permission_name: string;
  mode: 'GRANT' | 'DENY';
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface EffectiveAccessPermission extends AccessPermissionDefinition {
  allowed: boolean;
  source: 'none' | 'role' | 'position_allow' | 'position_deny' | 'user_grant' | 'user_deny';
}

export interface EffectiveUserAccess {
  user: number;
  position: string;
  normalized_position: string;
  permissions: EffectiveAccessPermission[];
}
