--
-- PostgreSQL database dump
--

\restrict PRvga8iAyyppvoauhd9v5mnueTxliop5RfQmftzwsR0lde8tmpV3SbmhryvQYGh

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 15.18 (Debian 15.18-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users_useraccessoverride DROP CONSTRAINT IF EXISTS users_useraccessoverride_user_id_9fdf9aba_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.users_user_user_permissions DROP CONSTRAINT IF EXISTS users_user_user_permissions_user_id_20aca447_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.users_user_user_permissions DROP CONSTRAINT IF EXISTS users_user_user_perm_permission_id_0b93982e_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.users_user DROP CONSTRAINT IF EXISTS users_user_supervisor_id_5f1670ee_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.users_user DROP CONSTRAINT IF EXISTS users_user_position_ref_id_909c7217_fk_references_position_id;
ALTER TABLE IF EXISTS ONLY public.users_user_groups DROP CONSTRAINT IF EXISTS users_user_groups_user_id_5f6f5a90_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.users_user_groups DROP CONSTRAINT IF EXISTS users_user_groups_group_id_9afc8d0e_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.users_user DROP CONSTRAINT IF EXISTS users_user_department_id_626c0154_fk_users_department_id;
ALTER TABLE IF EXISTS ONLY public.users_department DROP CONSTRAINT IF EXISTS users_department_parent_id_0661c5e5_fk_users_department_id;
ALTER TABLE IF EXISTS ONLY public.users_department DROP CONSTRAINT IF EXISTS users_department_head_id_290f19f8_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_outstandingtoken DROP CONSTRAINT IF EXISTS token_blacklist_outs_user_id_83bc629a_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_blacklistedtoken DROP CONSTRAINT IF EXISTS token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk;
ALTER TABLE IF EXISTS ONLY public.requests_requestapproval DROP CONSTRAINT IF EXISTS requests_requestapproval_approver_id_7d8df8d1_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.requests_requestapproval DROP CONSTRAINT IF EXISTS requests_requestappr_request_id_2272a898_fk_requests_;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetrequest_to_user_id_f450525d_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetrequest_initiator_id_97efd73d_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetrequest_from_user_id_d4365c3a_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest_issue_responsibles DROP CONSTRAINT IF EXISTS requests_assetreques_user_id_3b5aba38_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequestitem DROP CONSTRAINT IF EXISTS requests_assetreques_requested_group_id_734aa812_fk_reference;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetreques_request_type_id_5693fe20_fk_reference;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequestitem DROP CONSTRAINT IF EXISTS requests_assetreques_request_id_60859336_fk_requests_;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequestitem DROP CONSTRAINT IF EXISTS requests_assetreques_issued_asset_id_205dc5c9_fk_reference;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetreques_deletion_requested_b_d12a071c_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest_issue_responsibles DROP CONSTRAINT IF EXISTS requests_assetreques_assetrequest_id_25cacbcb_fk_requests_;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequestitem DROP CONSTRAINT IF EXISTS requests_assetreques_asset_id_678b1be0_fk_reference;
ALTER TABLE IF EXISTS ONLY public.requests_approvalstep DROP CONSTRAINT IF EXISTS requests_approvalste_request_type_id_b029632c_fk_reference;
ALTER TABLE IF EXISTS ONLY public.references_warehouse DROP CONSTRAINT IF EXISTS references_warehouse_department_id_b5ea45dc_fk_users_dep;
ALTER TABLE IF EXISTS ONLY public.references_limitnorm DROP CONSTRAINT IF EXISTS references_limitnorm_department_id_b1e481a7_fk_users_dep;
ALTER TABLE IF EXISTS ONLY public.references_limitnorm DROP CONSTRAINT IF EXISTS references_limitnorm_created_by_id_c9827e13_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.references_contract DROP CONSTRAINT IF EXISTS references_contract_counterparty_id_c4163b49_fk_reference;
ALTER TABLE IF EXISTS ONLY public.references_assetcategory DROP CONSTRAINT IF EXISTS references_assetcate_parent_id_08f6fec0_fk_reference;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_unit_of_measure_ref__eb07ddaf_fk_reference;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_group_id_dd0819d3_fk_reference;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_category_id_6445b1aa_fk_reference;
ALTER TABLE IF EXISTS ONLY public.notifications_notification DROP CONSTRAINT IF EXISTS notifications_notifi_related_content_type_d51effd3_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.notifications_notification DROP CONSTRAINT IF EXISTS notifications_notifi_recipient_id_d055f3f0_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.notifications_emaillog DROP CONSTRAINT IF EXISTS notifications_emaill_related_notification_9c077fa5_fk_notificat;
ALTER TABLE IF EXISTS ONLY public.documents_writeoffact DROP CONSTRAINT IF EXISTS documents_writeoffact_created_by_id_d2b26093_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.documents_writeoffactitem DROP CONSTRAINT IF EXISTS documents_writeoffac_asset_id_cece78e8_fk_reference;
ALTER TABLE IF EXISTS ONLY public.documents_writeoffactitem DROP CONSTRAINT IF EXISTS documents_writeoffac_act_id_a87feaed_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_protocolitem DROP CONSTRAINT IF EXISTS documents_protocolitem_asset_id_2d8bb274_fk_references_asset_id;
ALTER TABLE IF EXISTS ONLY public.documents_protocolitem DROP CONSTRAINT IF EXISTS documents_protocolit_protocol_id_01593093_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_petitionitem DROP CONSTRAINT IF EXISTS documents_petitionitem_asset_id_100577e9_fk_references_asset_id;
ALTER TABLE IF EXISTS ONLY public.documents_petitionitem DROP CONSTRAINT IF EXISTS documents_petitionit_petition_id_7eba5fa4_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_petition DROP CONSTRAINT IF EXISTS documents_petition_created_by_id_79f55fd5_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferinvoice DROP CONSTRAINT IF EXISTS documents_internaltr_to_user_id_8faec796_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferitem DROP CONSTRAINT IF EXISTS documents_internaltr_invoice_id_f371b33c_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferinvoice DROP CONSTRAINT IF EXISTS documents_internaltr_from_user_id_c363f3cb_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferinvoice DROP CONSTRAINT IF EXISTS documents_internaltr_created_by_id_8047983b_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferitem DROP CONSTRAINT IF EXISTS documents_internaltr_asset_id_7ea705f6_fk_reference;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoice DROP CONSTRAINT IF EXISTS documents_incomingin_warehouse_id_8805499f_fk_reference;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoice DROP CONSTRAINT IF EXISTS documents_incomingin_mol_warehouse_id_9538b023_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoiceitem DROP CONSTRAINT IF EXISTS documents_incomingin_invoice_id_bc1b135e_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoice DROP CONSTRAINT IF EXISTS documents_incomingin_created_by_id_5c740962_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoice DROP CONSTRAINT IF EXISTS documents_incomingin_counterparty_id_6a4d728f_fk_reference;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoiceitem DROP CONSTRAINT IF EXISTS documents_incomingin_asset_id_f76411ff_fk_reference;
ALTER TABLE IF EXISTS ONLY public.documents_documentsignature DROP CONSTRAINT IF EXISTS documents_documentsignature_signer_id_0a6e9cfd_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.documents_documentsignature DROP CONSTRAINT IF EXISTS documents_documentsi_document_type_id_2c267eed_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.documents_commissionmember DROP CONSTRAINT IF EXISTS documents_commissionmember_user_id_ef777457_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.documents_commissionmember DROP CONSTRAINT IF EXISTS documents_commission_write_off_act_id_3f40f36d_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_commissionmember DROP CONSTRAINT IF EXISTS documents_commission_protocol_id_d1bd2fc2_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_commissionprotocol DROP CONSTRAINT IF EXISTS documents_commission_petition_id_7b06fe66_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_commissionmember DROP CONSTRAINT IF EXISTS documents_commission_petition_id_12956dc4_fk_documents;
ALTER TABLE IF EXISTS ONLY public.documents_commissionprotocol DROP CONSTRAINT IF EXISTS documents_commission_created_by_id_1b9c6002_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_p_solar_id_a87ce72c_fk_django_ce;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_p_interval_id_a8ca27da_fk_django_ce;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_p_crontab_id_d3cba168_fk_django_ce;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_p_clocked_id_47a69f82_fk_django_ce;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_user_id_c564eba6_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_content_type_id_c4bce8eb_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_2f476e4b_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_b120cbf9_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissio_permission_id_84c5c92e_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.assets_warehousestock DROP CONSTRAINT IF EXISTS assets_warehousestock_asset_id_fa6a5900_fk_references_asset_id;
ALTER TABLE IF EXISTS ONLY public.assets_warehousestock DROP CONSTRAINT IF EXISTS assets_warehousestoc_warehouse_id_eaedc727_fk_reference;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_warehouse_id_c29b5a62_fk_reference;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_to_user_id_15a52994_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_performed_by_id_2b4775ac_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_from_user_id_c20ca967_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_document_type_id_1fba41fd_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_asset_id_f742357c_fk_references_asset_id;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertstate DROP CONSTRAINT IF EXISTS assets_stockalertsta_stock_id_e3cebe55_fk_assets_wa;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertstate DROP CONSTRAINT IF EXISTS assets_stockalertsta_rule_id_ee995b39_fk_assets_st;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_warehouses DROP CONSTRAINT IF EXISTS assets_stockalertrul_warehouse_id_2cf77b6c_fk_reference;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_recipients DROP CONSTRAINT IF EXISTS assets_stockalertrul_user_id_9be618f4_fk_users_use;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_recipients DROP CONSTRAINT IF EXISTS assets_stockalertrul_stockalertrule_id_e94de6b7_fk_assets_st;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_assets DROP CONSTRAINT IF EXISTS assets_stockalertrul_stockalertrule_id_77324f68_fk_assets_st;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_groups DROP CONSTRAINT IF EXISTS assets_stockalertrul_stockalertrule_id_28edd9a3_fk_assets_st;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_warehouses DROP CONSTRAINT IF EXISTS assets_stockalertrul_stockalertrule_id_1f2f6b87_fk_assets_st;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_groups DROP CONSTRAINT IF EXISTS assets_stockalertrul_assetcategory_id_d83dba17_fk_reference;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_assets DROP CONSTRAINT IF EXISTS assets_stockalertrul_asset_id_64278e7d_fk_reference;
ALTER TABLE IF EXISTS ONLY public.assets_assetassignment DROP CONSTRAINT IF EXISTS assets_assetassignment_user_id_1613d84a_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.assets_assetassignment DROP CONSTRAINT IF EXISTS assets_assetassignment_assigned_by_id_de4248ee_fk_users_user_id;
ALTER TABLE IF EXISTS ONLY public.assets_assetassignment DROP CONSTRAINT IF EXISTS assets_assetassignment_asset_id_dc1a4798_fk_references_asset_id;
ALTER TABLE IF EXISTS ONLY public.assets_assetassignment DROP CONSTRAINT IF EXISTS assets_assetassignme_warehouse_id_2b2922ae_fk_reference;
DROP INDEX IF EXISTS public.users_useraccessoverride_user_id_9fdf9aba;
DROP INDEX IF EXISTS public.users_user_username_06e46fe6_like;
DROP INDEX IF EXISTS public.users_user_user_permissions_user_id_20aca447;
DROP INDEX IF EXISTS public.users_user_user_permissions_permission_id_0b93982e;
DROP INDEX IF EXISTS public.users_user_supervisor_id_5f1670ee;
DROP INDEX IF EXISTS public.users_user_position_ref_id_909c7217;
DROP INDEX IF EXISTS public.users_user_groups_user_id_5f6f5a90;
DROP INDEX IF EXISTS public.users_user_groups_group_id_9afc8d0e;
DROP INDEX IF EXISTS public.users_user_department_id_626c0154;
DROP INDEX IF EXISTS public.users_positionaccessrule_normalized_position_cc09794a_like;
DROP INDEX IF EXISTS public.users_positionaccessrule_normalized_position_cc09794a;
DROP INDEX IF EXISTS public.users_department_parent_id_0661c5e5;
DROP INDEX IF EXISTS public.users_department_head_id_290f19f8;
DROP INDEX IF EXISTS public.users_department_code_57e93280_like;
DROP INDEX IF EXISTS public.token_blacklist_outstandingtoken_user_id_83bc629a;
DROP INDEX IF EXISTS public.token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_like;
DROP INDEX IF EXISTS public.requests_requestapproval_request_id_2272a898;
DROP INDEX IF EXISTS public.requests_requestapproval_approver_id_7d8df8d1;
DROP INDEX IF EXISTS public.requests_assetrequestitem_requested_group_id_734aa812;
DROP INDEX IF EXISTS public.requests_assetrequestitem_request_id_60859336;
DROP INDEX IF EXISTS public.requests_assetrequestitem_issued_asset_id_205dc5c9;
DROP INDEX IF EXISTS public.requests_assetrequestitem_asset_id_678b1be0;
DROP INDEX IF EXISTS public.requests_assetrequest_to_user_id_f450525d;
DROP INDEX IF EXISTS public.requests_assetrequest_request_type_id_5693fe20;
DROP INDEX IF EXISTS public.requests_assetrequest_number_a3011084_like;
DROP INDEX IF EXISTS public.requests_assetrequest_issue_responsibles_user_id_3b5aba38;
DROP INDEX IF EXISTS public.requests_assetrequest_issu_assetrequest_id_25cacbcb;
DROP INDEX IF EXISTS public.requests_assetrequest_initiator_id_97efd73d;
DROP INDEX IF EXISTS public.requests_assetrequest_from_user_id_d4365c3a;
DROP INDEX IF EXISTS public.requests_assetrequest_deletion_requested_by_id_d12a071c;
DROP INDEX IF EXISTS public.requests_approvalstep_request_type_id_b029632c;
DROP INDEX IF EXISTS public.references_warehouse_department_id_b5ea45dc;
DROP INDEX IF EXISTS public.references_warehouse_code_2b4791c0_like;
DROP INDEX IF EXISTS public.references_unitofmeasure_name_d8edd0a3_like;
DROP INDEX IF EXISTS public.references_unitofmeasure_code_4b324c2b_like;
DROP INDEX IF EXISTS public.references_requesttype_code_61369e20_like;
DROP INDEX IF EXISTS public.references_position_name_802643f9_like;
DROP INDEX IF EXISTS public.references_position_code_a2bb180d_like;
DROP INDEX IF EXISTS public.references_limitnorm_department_id_b1e481a7;
DROP INDEX IF EXISTS public.references_limitnorm_created_by_id_c9827e13;
DROP INDEX IF EXISTS public.references_counterparty_bin_6c0799d2_like;
DROP INDEX IF EXISTS public.references_contract_counterparty_id_c4163b49;
DROP INDEX IF EXISTS public.references_assetcategory_parent_id_08f6fec0;
DROP INDEX IF EXISTS public.references_assetcategory_code_5258a137_like;
DROP INDEX IF EXISTS public.references_asset_unit_of_measure_ref_id_eb07ddaf;
DROP INDEX IF EXISTS public.references_asset_source_1c_id_611416c1_like;
DROP INDEX IF EXISTS public.references_asset_group_id_dd0819d3;
DROP INDEX IF EXISTS public.references_asset_code_99663318_like;
DROP INDEX IF EXISTS public.references_asset_category_id_6445b1aa;
DROP INDEX IF EXISTS public.notifications_notification_related_content_type_id_d51effd3;
DROP INDEX IF EXISTS public.notifications_notification_recipient_id_d055f3f0;
DROP INDEX IF EXISTS public.notifications_emaillog_related_notification_id_9c077fa5;
DROP INDEX IF EXISTS public.documents_writeoffactitem_asset_id_cece78e8;
DROP INDEX IF EXISTS public.documents_writeoffactitem_act_id_a87feaed;
DROP INDEX IF EXISTS public.documents_writeoffact_created_by_id_d2b26093;
DROP INDEX IF EXISTS public.documents_protocolitem_protocol_id_01593093;
DROP INDEX IF EXISTS public.documents_protocolitem_asset_id_2d8bb274;
DROP INDEX IF EXISTS public.documents_petitionitem_petition_id_7eba5fa4;
DROP INDEX IF EXISTS public.documents_petitionitem_asset_id_100577e9;
DROP INDEX IF EXISTS public.documents_petition_created_by_id_79f55fd5;
DROP INDEX IF EXISTS public.documents_internaltransferitem_invoice_id_f371b33c;
DROP INDEX IF EXISTS public.documents_internaltransferitem_asset_id_7ea705f6;
DROP INDEX IF EXISTS public.documents_internaltransferinvoice_to_user_id_8faec796;
DROP INDEX IF EXISTS public.documents_internaltransferinvoice_from_user_id_c363f3cb;
DROP INDEX IF EXISTS public.documents_internaltransferinvoice_created_by_id_8047983b;
DROP INDEX IF EXISTS public.documents_incominginvoiceitem_invoice_id_bc1b135e;
DROP INDEX IF EXISTS public.documents_incominginvoiceitem_asset_id_f76411ff;
DROP INDEX IF EXISTS public.documents_incominginvoice_warehouse_id_8805499f;
DROP INDEX IF EXISTS public.documents_incominginvoice_mol_warehouse_id_9538b023;
DROP INDEX IF EXISTS public.documents_incominginvoice_created_by_id_5c740962;
DROP INDEX IF EXISTS public.documents_incominginvoice_counterparty_id_6a4d728f;
DROP INDEX IF EXISTS public.documents_documentsignature_signer_id_0a6e9cfd;
DROP INDEX IF EXISTS public.documents_documentsignature_document_type_id_2c267eed;
DROP INDEX IF EXISTS public.documents_commissionprotocol_petition_id_7b06fe66;
DROP INDEX IF EXISTS public.documents_commissionprotocol_created_by_id_1b9c6002;
DROP INDEX IF EXISTS public.documents_commissionmember_write_off_act_id_3f40f36d;
DROP INDEX IF EXISTS public.documents_commissionmember_user_id_ef777457;
DROP INDEX IF EXISTS public.documents_commissionmember_protocol_id_d1bd2fc2;
DROP INDEX IF EXISTS public.documents_commissionmember_petition_id_12956dc4;
DROP INDEX IF EXISTS public.django_session_session_key_c0390e0f_like;
DROP INDEX IF EXISTS public.django_session_expire_date_a5c62663;
DROP INDEX IF EXISTS public.django_celery_beat_periodictask_solar_id_a87ce72c;
DROP INDEX IF EXISTS public.django_celery_beat_periodictask_name_265a36b7_like;
DROP INDEX IF EXISTS public.django_celery_beat_periodictask_interval_id_a8ca27da;
DROP INDEX IF EXISTS public.django_celery_beat_periodictask_crontab_id_d3cba168;
DROP INDEX IF EXISTS public.django_celery_beat_periodictask_clocked_id_47a69f82;
DROP INDEX IF EXISTS public.django_admin_log_user_id_c564eba6;
DROP INDEX IF EXISTS public.django_admin_log_content_type_id_c4bce8eb;
DROP INDEX IF EXISTS public.auth_permission_content_type_id_2f476e4b;
DROP INDEX IF EXISTS public.auth_group_permissions_permission_id_84c5c92e;
DROP INDEX IF EXISTS public.auth_group_permissions_group_id_b120cbf9;
DROP INDEX IF EXISTS public.auth_group_name_a6ea08ec_like;
DROP INDEX IF EXISTS public.assets_warehousestock_warehouse_id_eaedc727;
DROP INDEX IF EXISTS public.assets_stockmovement_warehouse_id_c29b5a62;
DROP INDEX IF EXISTS public.assets_stockmovement_to_user_id_15a52994;
DROP INDEX IF EXISTS public.assets_stockmovement_performed_by_id_2b4775ac;
DROP INDEX IF EXISTS public.assets_stockmovement_from_user_id_c20ca967;
DROP INDEX IF EXISTS public.assets_stockmovement_document_type_id_1fba41fd;
DROP INDEX IF EXISTS public.assets_stockmovement_asset_id_f742357c;
DROP INDEX IF EXISTS public.assets_stockalertstate_stock_id_e3cebe55;
DROP INDEX IF EXISTS public.assets_stockalertstate_rule_id_ee995b39;
DROP INDEX IF EXISTS public.assets_stockalertrule_warehouses_warehouse_id_2cf77b6c;
DROP INDEX IF EXISTS public.assets_stockalertrule_warehouses_stockalertrule_id_1f2f6b87;
DROP INDEX IF EXISTS public.assets_stockalertrule_recipients_user_id_9be618f4;
DROP INDEX IF EXISTS public.assets_stockalertrule_recipients_stockalertrule_id_e94de6b7;
DROP INDEX IF EXISTS public.assets_stockalertrule_groups_stockalertrule_id_28edd9a3;
DROP INDEX IF EXISTS public.assets_stockalertrule_groups_assetcategory_id_d83dba17;
DROP INDEX IF EXISTS public.assets_stockalertrule_assets_stockalertrule_id_77324f68;
DROP INDEX IF EXISTS public.assets_stockalertrule_assets_asset_id_64278e7d;
DROP INDEX IF EXISTS public.assets_assetassignment_warehouse_id_2b2922ae;
DROP INDEX IF EXISTS public.assets_assetassignment_user_id_1613d84a;
DROP INDEX IF EXISTS public.assets_assetassignment_assigned_by_id_de4248ee;
DROP INDEX IF EXISTS public.assets_assetassignment_asset_id_dc1a4798;
ALTER TABLE IF EXISTS ONLY public.users_useraccessoverride DROP CONSTRAINT IF EXISTS users_useraccessoverride_pkey;
ALTER TABLE IF EXISTS ONLY public.users_user DROP CONSTRAINT IF EXISTS users_user_username_key;
ALTER TABLE IF EXISTS ONLY public.users_user_user_permissions DROP CONSTRAINT IF EXISTS users_user_user_permissions_user_id_permission_id_43338c45_uniq;
ALTER TABLE IF EXISTS ONLY public.users_user_user_permissions DROP CONSTRAINT IF EXISTS users_user_user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.users_user DROP CONSTRAINT IF EXISTS users_user_pkey;
ALTER TABLE IF EXISTS ONLY public.users_user_groups DROP CONSTRAINT IF EXISTS users_user_groups_user_id_group_id_b88eab82_uniq;
ALTER TABLE IF EXISTS ONLY public.users_user_groups DROP CONSTRAINT IF EXISTS users_user_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.users_positionaccessrule DROP CONSTRAINT IF EXISTS users_positionaccessrule_pkey;
ALTER TABLE IF EXISTS ONLY public.users_department DROP CONSTRAINT IF EXISTS users_department_pkey;
ALTER TABLE IF EXISTS ONLY public.users_department DROP CONSTRAINT IF EXISTS users_department_code_key;
ALTER TABLE IF EXISTS ONLY public.users_useraccessoverride DROP CONSTRAINT IF EXISTS unique_user_access_override;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertstate DROP CONSTRAINT IF EXISTS unique_stock_alert_rule_state;
ALTER TABLE IF EXISTS ONLY public.users_positionaccessrule DROP CONSTRAINT IF EXISTS unique_position_access_rule;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_outstandingtoken DROP CONSTRAINT IF EXISTS token_blacklist_outstandingtoken_pkey;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_outstandingtoken DROP CONSTRAINT IF EXISTS token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_blacklistedtoken DROP CONSTRAINT IF EXISTS token_blacklist_blacklistedtoken_token_id_key;
ALTER TABLE IF EXISTS ONLY public.token_blacklist_blacklistedtoken DROP CONSTRAINT IF EXISTS token_blacklist_blacklistedtoken_pkey;
ALTER TABLE IF EXISTS ONLY public.requests_requestapproval DROP CONSTRAINT IF EXISTS requests_requestapproval_pkey;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequestitem DROP CONSTRAINT IF EXISTS requests_assetrequestitem_pkey;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetrequest_pkey;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest DROP CONSTRAINT IF EXISTS requests_assetrequest_number_key;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest_issue_responsibles DROP CONSTRAINT IF EXISTS requests_assetrequest_issue_responsibles_pkey;
ALTER TABLE IF EXISTS ONLY public.requests_assetrequest_issue_responsibles DROP CONSTRAINT IF EXISTS requests_assetrequest_is_assetrequest_id_user_id_4d6c5610_uniq;
ALTER TABLE IF EXISTS ONLY public.requests_approvalstep DROP CONSTRAINT IF EXISTS requests_approvalstep_request_type_id_order_0940bf13_uniq;
ALTER TABLE IF EXISTS ONLY public.requests_approvalstep DROP CONSTRAINT IF EXISTS requests_approvalstep_pkey;
ALTER TABLE IF EXISTS ONLY public.references_warehouse DROP CONSTRAINT IF EXISTS references_warehouse_pkey;
ALTER TABLE IF EXISTS ONLY public.references_warehouse DROP CONSTRAINT IF EXISTS references_warehouse_code_key;
ALTER TABLE IF EXISTS ONLY public.references_unitofmeasure DROP CONSTRAINT IF EXISTS references_unitofmeasure_pkey;
ALTER TABLE IF EXISTS ONLY public.references_unitofmeasure DROP CONSTRAINT IF EXISTS references_unitofmeasure_name_key;
ALTER TABLE IF EXISTS ONLY public.references_unitofmeasure DROP CONSTRAINT IF EXISTS references_unitofmeasure_code_key;
ALTER TABLE IF EXISTS ONLY public.references_requesttype DROP CONSTRAINT IF EXISTS references_requesttype_pkey;
ALTER TABLE IF EXISTS ONLY public.references_requesttype DROP CONSTRAINT IF EXISTS references_requesttype_code_key;
ALTER TABLE IF EXISTS ONLY public.references_position DROP CONSTRAINT IF EXISTS references_position_pkey;
ALTER TABLE IF EXISTS ONLY public.references_position DROP CONSTRAINT IF EXISTS references_position_name_key;
ALTER TABLE IF EXISTS ONLY public.references_position DROP CONSTRAINT IF EXISTS references_position_code_key;
ALTER TABLE IF EXISTS ONLY public.references_limitnorm DROP CONSTRAINT IF EXISTS references_limitnorm_pkey;
ALTER TABLE IF EXISTS ONLY public.references_counterparty DROP CONSTRAINT IF EXISTS references_counterparty_pkey;
ALTER TABLE IF EXISTS ONLY public.references_counterparty DROP CONSTRAINT IF EXISTS references_counterparty_bin_key;
ALTER TABLE IF EXISTS ONLY public.references_contract DROP CONSTRAINT IF EXISTS references_contract_pkey;
ALTER TABLE IF EXISTS ONLY public.references_assetcategory DROP CONSTRAINT IF EXISTS references_assetcategory_pkey;
ALTER TABLE IF EXISTS ONLY public.references_assetcategory DROP CONSTRAINT IF EXISTS references_assetcategory_code_key;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_source_1c_id_key;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_pkey;
ALTER TABLE IF EXISTS ONLY public.references_asset DROP CONSTRAINT IF EXISTS references_asset_code_key;
ALTER TABLE IF EXISTS ONLY public.notifications_notification DROP CONSTRAINT IF EXISTS notifications_notification_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications_emaillog DROP CONSTRAINT IF EXISTS notifications_emaillog_pkey;
ALTER TABLE IF EXISTS ONLY public.integrations_synclog DROP CONSTRAINT IF EXISTS integrations_synclog_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_writeoffactitem DROP CONSTRAINT IF EXISTS documents_writeoffactitem_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_writeoffact DROP CONSTRAINT IF EXISTS documents_writeoffact_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_protocolitem DROP CONSTRAINT IF EXISTS documents_protocolitem_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_petitionitem DROP CONSTRAINT IF EXISTS documents_petitionitem_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_petition DROP CONSTRAINT IF EXISTS documents_petition_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferitem DROP CONSTRAINT IF EXISTS documents_internaltransferitem_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_internaltransferinvoice DROP CONSTRAINT IF EXISTS documents_internaltransferinvoice_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoiceitem DROP CONSTRAINT IF EXISTS documents_incominginvoiceitem_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_incominginvoice DROP CONSTRAINT IF EXISTS documents_incominginvoice_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_documentsignature DROP CONSTRAINT IF EXISTS documents_documentsignature_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_commissionprotocol DROP CONSTRAINT IF EXISTS documents_commissionprotocol_pkey;
ALTER TABLE IF EXISTS ONLY public.documents_commissionmember DROP CONSTRAINT IF EXISTS documents_commissionmember_pkey;
ALTER TABLE IF EXISTS ONLY public.django_session DROP CONSTRAINT IF EXISTS django_session_pkey;
ALTER TABLE IF EXISTS ONLY public.django_migrations DROP CONSTRAINT IF EXISTS django_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_app_label_model_76bd3d3b_uniq;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_solarschedule DROP CONSTRAINT IF EXISTS django_celery_beat_solarschedule_pkey;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_solarschedule DROP CONSTRAINT IF EXISTS django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictasks DROP CONSTRAINT IF EXISTS django_celery_beat_periodictasks_pkey;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_periodictask_pkey;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_periodictask DROP CONSTRAINT IF EXISTS django_celery_beat_periodictask_name_key;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_intervalschedule DROP CONSTRAINT IF EXISTS django_celery_beat_intervalschedule_pkey;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_crontabschedule DROP CONSTRAINT IF EXISTS django_celery_beat_crontabschedule_pkey;
ALTER TABLE IF EXISTS ONLY public.django_celery_beat_clockedschedule DROP CONSTRAINT IF EXISTS django_celery_beat_clockedschedule_pkey;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_codename_01ab375a_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_permission_id_0cd325b0_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_name_key;
ALTER TABLE IF EXISTS ONLY public.assets_warehousestock DROP CONSTRAINT IF EXISTS assets_warehousestock_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_warehousestock DROP CONSTRAINT IF EXISTS assets_warehousestock_asset_id_key;
ALTER TABLE IF EXISTS ONLY public.assets_stockmovement DROP CONSTRAINT IF EXISTS assets_stockmovement_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertstate DROP CONSTRAINT IF EXISTS assets_stockalertstate_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_warehouses DROP CONSTRAINT IF EXISTS assets_stockalertrule_warehouses_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_warehouses DROP CONSTRAINT IF EXISTS assets_stockalertrule_wa_stockalertrule_id_wareho_41651be0_uniq;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_recipients DROP CONSTRAINT IF EXISTS assets_stockalertrule_recipients_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_recipients DROP CONSTRAINT IF EXISTS assets_stockalertrule_re_stockalertrule_id_user_i_49640c59_uniq;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule DROP CONSTRAINT IF EXISTS assets_stockalertrule_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_groups DROP CONSTRAINT IF EXISTS assets_stockalertrule_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_groups DROP CONSTRAINT IF EXISTS assets_stockalertrule_gr_stockalertrule_id_assetc_9ddc6026_uniq;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_assets DROP CONSTRAINT IF EXISTS assets_stockalertrule_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.assets_stockalertrule_assets DROP CONSTRAINT IF EXISTS assets_stockalertrule_as_stockalertrule_id_asset__bb7a808c_uniq;
ALTER TABLE IF EXISTS ONLY public.assets_assetassignment DROP CONSTRAINT IF EXISTS assets_assetassignment_pkey;
DROP TABLE IF EXISTS public.users_useraccessoverride;
DROP TABLE IF EXISTS public.users_user_user_permissions;
DROP TABLE IF EXISTS public.users_user_groups;
DROP TABLE IF EXISTS public.users_user;
DROP TABLE IF EXISTS public.users_positionaccessrule;
DROP TABLE IF EXISTS public.users_department;
DROP TABLE IF EXISTS public.token_blacklist_outstandingtoken;
DROP TABLE IF EXISTS public.token_blacklist_blacklistedtoken;
DROP TABLE IF EXISTS public.requests_requestapproval;
DROP TABLE IF EXISTS public.requests_assetrequestitem;
DROP TABLE IF EXISTS public.requests_assetrequest_issue_responsibles;
DROP TABLE IF EXISTS public.requests_assetrequest;
DROP TABLE IF EXISTS public.requests_approvalstep;
DROP TABLE IF EXISTS public.references_warehouse;
DROP TABLE IF EXISTS public.references_unitofmeasure;
DROP TABLE IF EXISTS public.references_requesttype;
DROP TABLE IF EXISTS public.references_position;
DROP TABLE IF EXISTS public.references_limitnorm;
DROP TABLE IF EXISTS public.references_counterparty;
DROP TABLE IF EXISTS public.references_contract;
DROP TABLE IF EXISTS public.references_assetcategory;
DROP TABLE IF EXISTS public.references_asset;
DROP TABLE IF EXISTS public.notifications_notification;
DROP TABLE IF EXISTS public.notifications_emaillog;
DROP TABLE IF EXISTS public.integrations_synclog;
DROP TABLE IF EXISTS public.documents_writeoffactitem;
DROP TABLE IF EXISTS public.documents_writeoffact;
DROP TABLE IF EXISTS public.documents_protocolitem;
DROP TABLE IF EXISTS public.documents_petitionitem;
DROP TABLE IF EXISTS public.documents_petition;
DROP TABLE IF EXISTS public.documents_internaltransferitem;
DROP TABLE IF EXISTS public.documents_internaltransferinvoice;
DROP TABLE IF EXISTS public.documents_incominginvoiceitem;
DROP TABLE IF EXISTS public.documents_incominginvoice;
DROP TABLE IF EXISTS public.documents_documentsignature;
DROP TABLE IF EXISTS public.documents_commissionprotocol;
DROP TABLE IF EXISTS public.documents_commissionmember;
DROP TABLE IF EXISTS public.django_session;
DROP TABLE IF EXISTS public.django_migrations;
DROP TABLE IF EXISTS public.django_content_type;
DROP TABLE IF EXISTS public.django_celery_beat_solarschedule;
DROP TABLE IF EXISTS public.django_celery_beat_periodictasks;
DROP TABLE IF EXISTS public.django_celery_beat_periodictask;
DROP TABLE IF EXISTS public.django_celery_beat_intervalschedule;
DROP TABLE IF EXISTS public.django_celery_beat_crontabschedule;
DROP TABLE IF EXISTS public.django_celery_beat_clockedschedule;
DROP TABLE IF EXISTS public.django_admin_log;
DROP TABLE IF EXISTS public.auth_permission;
DROP TABLE IF EXISTS public.auth_group_permissions;
DROP TABLE IF EXISTS public.auth_group;
DROP TABLE IF EXISTS public.assets_warehousestock;
DROP TABLE IF EXISTS public.assets_stockmovement;
DROP TABLE IF EXISTS public.assets_stockalertstate;
DROP TABLE IF EXISTS public.assets_stockalertrule_warehouses;
DROP TABLE IF EXISTS public.assets_stockalertrule_recipients;
DROP TABLE IF EXISTS public.assets_stockalertrule_groups;
DROP TABLE IF EXISTS public.assets_stockalertrule_assets;
DROP TABLE IF EXISTS public.assets_stockalertrule;
DROP TABLE IF EXISTS public.assets_assetassignment;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assets_assetassignment; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_assetassignment (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    assigned_at timestamp with time zone NOT NULL,
    location character varying(255) NOT NULL,
    status character varying(20) NOT NULL,
    asset_id bigint NOT NULL,
    assigned_by_id bigint,
    user_id bigint NOT NULL,
    warehouse_id bigint
);


ALTER TABLE public.assets_assetassignment OWNER TO asu_user;

--
-- Name: assets_assetassignment_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_assetassignment ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_assetassignment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertrule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertrule (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    threshold_quantity numeric(12,2) NOT NULL,
    message_template character varying(500) NOT NULL
);


ALTER TABLE public.assets_stockalertrule OWNER TO asu_user;

--
-- Name: assets_stockalertrule_assets; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertrule_assets (
    id bigint NOT NULL,
    stockalertrule_id bigint NOT NULL,
    asset_id bigint NOT NULL
);


ALTER TABLE public.assets_stockalertrule_assets OWNER TO asu_user;

--
-- Name: assets_stockalertrule_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertrule_assets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertrule_assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertrule_groups; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertrule_groups (
    id bigint NOT NULL,
    stockalertrule_id bigint NOT NULL,
    assetcategory_id bigint NOT NULL
);


ALTER TABLE public.assets_stockalertrule_groups OWNER TO asu_user;

--
-- Name: assets_stockalertrule_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertrule_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertrule_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertrule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertrule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertrule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertrule_recipients; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertrule_recipients (
    id bigint NOT NULL,
    stockalertrule_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.assets_stockalertrule_recipients OWNER TO asu_user;

--
-- Name: assets_stockalertrule_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertrule_recipients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertrule_recipients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertrule_warehouses; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertrule_warehouses (
    id bigint NOT NULL,
    stockalertrule_id bigint NOT NULL,
    warehouse_id bigint NOT NULL
);


ALTER TABLE public.assets_stockalertrule_warehouses OWNER TO asu_user;

--
-- Name: assets_stockalertrule_warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertrule_warehouses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertrule_warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockalertstate; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockalertstate (
    id bigint NOT NULL,
    is_active boolean NOT NULL,
    current_quantity numeric(12,2) NOT NULL,
    message text NOT NULL,
    triggered_at timestamp with time zone NOT NULL,
    last_notified_at timestamp with time zone,
    resolved_at timestamp with time zone,
    rule_id bigint NOT NULL,
    stock_id bigint NOT NULL
);


ALTER TABLE public.assets_stockalertstate OWNER TO asu_user;

--
-- Name: assets_stockalertstate_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockalertstate ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockalertstate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_stockmovement; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_stockmovement (
    id bigint NOT NULL,
    movement_type character varying(30) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    document_id integer,
    performed_at timestamp with time zone NOT NULL,
    comment text NOT NULL,
    asset_id bigint NOT NULL,
    document_type_id integer,
    from_user_id bigint,
    performed_by_id bigint,
    to_user_id bigint,
    warehouse_id bigint,
    CONSTRAINT assets_stockmovement_document_id_check CHECK ((document_id >= 0))
);


ALTER TABLE public.assets_stockmovement OWNER TO asu_user;

--
-- Name: assets_stockmovement_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_stockmovement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_stockmovement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assets_warehousestock; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.assets_warehousestock (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    quantity numeric(12,2) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    location character varying(255) NOT NULL,
    asset_id bigint NOT NULL,
    balance_date date,
    warehouse_id bigint
);


ALTER TABLE public.assets_warehousestock OWNER TO asu_user;

--
-- Name: assets_warehousestock_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.assets_warehousestock ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assets_warehousestock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO asu_user;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO asu_user;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO asu_user;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO asu_user;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_clockedschedule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_clockedschedule (
    id integer NOT NULL,
    clocked_time timestamp with time zone NOT NULL
);


ALTER TABLE public.django_celery_beat_clockedschedule OWNER TO asu_user;

--
-- Name: django_celery_beat_clockedschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_celery_beat_clockedschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_clockedschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_crontabschedule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_crontabschedule (
    id integer NOT NULL,
    minute character varying(240) NOT NULL,
    hour character varying(96) NOT NULL,
    day_of_week character varying(64) NOT NULL,
    day_of_month character varying(124) NOT NULL,
    month_of_year character varying(64) NOT NULL,
    timezone character varying(63) NOT NULL
);


ALTER TABLE public.django_celery_beat_crontabschedule OWNER TO asu_user;

--
-- Name: django_celery_beat_crontabschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_celery_beat_crontabschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_crontabschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_intervalschedule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_intervalschedule (
    id integer NOT NULL,
    every integer NOT NULL,
    period character varying(24) NOT NULL
);


ALTER TABLE public.django_celery_beat_intervalschedule OWNER TO asu_user;

--
-- Name: django_celery_beat_intervalschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_celery_beat_intervalschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_intervalschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_periodictask; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_periodictask (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    task character varying(200) NOT NULL,
    args text NOT NULL,
    kwargs text NOT NULL,
    queue character varying(200),
    exchange character varying(200),
    routing_key character varying(200),
    expires timestamp with time zone,
    enabled boolean NOT NULL,
    last_run_at timestamp with time zone,
    total_run_count integer NOT NULL,
    date_changed timestamp with time zone NOT NULL,
    description text NOT NULL,
    crontab_id integer,
    interval_id integer,
    solar_id integer,
    one_off boolean NOT NULL,
    start_time timestamp with time zone,
    priority integer,
    headers text NOT NULL,
    clocked_id integer,
    expire_seconds integer,
    CONSTRAINT django_celery_beat_periodictask_expire_seconds_check CHECK ((expire_seconds >= 0)),
    CONSTRAINT django_celery_beat_periodictask_priority_check CHECK ((priority >= 0)),
    CONSTRAINT django_celery_beat_periodictask_total_run_count_check CHECK ((total_run_count >= 0))
);


ALTER TABLE public.django_celery_beat_periodictask OWNER TO asu_user;

--
-- Name: django_celery_beat_periodictask_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_celery_beat_periodictask ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_periodictask_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_periodictasks; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_periodictasks (
    ident smallint NOT NULL,
    last_update timestamp with time zone NOT NULL
);


ALTER TABLE public.django_celery_beat_periodictasks OWNER TO asu_user;

--
-- Name: django_celery_beat_solarschedule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_celery_beat_solarschedule (
    id integer NOT NULL,
    event character varying(24) NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL
);


ALTER TABLE public.django_celery_beat_solarschedule OWNER TO asu_user;

--
-- Name: django_celery_beat_solarschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_celery_beat_solarschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_solarschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO asu_user;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO asu_user;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO asu_user;

--
-- Name: documents_commissionmember; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_commissionmember (
    id bigint NOT NULL,
    role_label character varying(100) NOT NULL,
    petition_id bigint,
    protocol_id bigint,
    user_id bigint NOT NULL,
    write_off_act_id bigint
);


ALTER TABLE public.documents_commissionmember OWNER TO asu_user;

--
-- Name: documents_commissionmember_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_commissionmember ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_commissionmember_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_commissionprotocol; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_commissionprotocol (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    date date,
    status character varying(30) NOT NULL,
    agenda_item text NOT NULL,
    commission_order_number character varying(50) NOT NULL,
    commission_order_date date,
    decision_text text NOT NULL,
    created_by_id bigint,
    petition_id bigint
);


ALTER TABLE public.documents_commissionprotocol OWNER TO asu_user;

--
-- Name: documents_commissionprotocol_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_commissionprotocol ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_commissionprotocol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_documentsignature; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_documentsignature (
    id bigint NOT NULL,
    document_id integer NOT NULL,
    role_label character varying(100) NOT NULL,
    signed_at timestamp with time zone,
    is_acting_chairman boolean NOT NULL,
    sent_for_revision_at timestamp with time zone,
    revision_reason text NOT NULL,
    document_type_id integer NOT NULL,
    signer_id bigint NOT NULL,
    CONSTRAINT documents_documentsignature_document_id_check CHECK ((document_id >= 0))
);


ALTER TABLE public.documents_documentsignature OWNER TO asu_user;

--
-- Name: documents_documentsignature_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_documentsignature ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_documentsignature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_incominginvoice; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_incominginvoice (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    date date,
    status character varying(30) NOT NULL,
    asset_type character varying(20) NOT NULL,
    counterparty_id bigint NOT NULL,
    created_by_id bigint,
    mol_warehouse_id bigint,
    warehouse_id bigint
);


ALTER TABLE public.documents_incominginvoice OWNER TO asu_user;

--
-- Name: documents_incominginvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_incominginvoice ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_incominginvoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_incominginvoiceitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_incominginvoiceitem (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    asset_id bigint NOT NULL,
    invoice_id bigint NOT NULL
);


ALTER TABLE public.documents_incominginvoiceitem OWNER TO asu_user;

--
-- Name: documents_incominginvoiceitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_incominginvoiceitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_incominginvoiceitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_internaltransferinvoice; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_internaltransferinvoice (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    date date,
    status character varying(30) NOT NULL,
    asset_type character varying(20) NOT NULL,
    created_by_id bigint,
    from_user_id bigint,
    to_user_id bigint
);


ALTER TABLE public.documents_internaltransferinvoice OWNER TO asu_user;

--
-- Name: documents_internaltransferinvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_internaltransferinvoice ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_internaltransferinvoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_internaltransferitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_internaltransferitem (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    asset_id bigint NOT NULL,
    invoice_id bigint NOT NULL
);


ALTER TABLE public.documents_internaltransferitem OWNER TO asu_user;

--
-- Name: documents_internaltransferitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_internaltransferitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_internaltransferitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_petition; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_petition (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    date date,
    status character varying(30) NOT NULL,
    legal_basis text NOT NULL,
    created_by_id bigint
);


ALTER TABLE public.documents_petition OWNER TO asu_user;

--
-- Name: documents_petition_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_petition ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_petition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_petitionitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_petitionitem (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    asset_id bigint NOT NULL,
    petition_id bigint NOT NULL
);


ALTER TABLE public.documents_petitionitem OWNER TO asu_user;

--
-- Name: documents_petitionitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_petitionitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_petitionitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_protocolitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_protocolitem (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    asset_id bigint NOT NULL,
    protocol_id bigint NOT NULL
);


ALTER TABLE public.documents_protocolitem OWNER TO asu_user;

--
-- Name: documents_protocolitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_protocolitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_protocolitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_writeoffact; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_writeoffact (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    date date,
    status character varying(30) NOT NULL,
    act_type character varying(30) NOT NULL,
    commission_order_number character varying(50) NOT NULL,
    commission_order_date date,
    is_representative boolean NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    created_by_id bigint
);


ALTER TABLE public.documents_writeoffact OWNER TO asu_user;

--
-- Name: documents_writeoffact_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_writeoffact ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_writeoffact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents_writeoffactitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.documents_writeoffactitem (
    id bigint NOT NULL,
    quantity numeric(12,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    act_id bigint NOT NULL,
    asset_id bigint NOT NULL
);


ALTER TABLE public.documents_writeoffactitem OWNER TO asu_user;

--
-- Name: documents_writeoffactitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.documents_writeoffactitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_writeoffactitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: integrations_synclog; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.integrations_synclog (
    id bigint NOT NULL,
    sync_type character varying(50) NOT NULL,
    started_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    status character varying(20) NOT NULL,
    created_count integer NOT NULL,
    updated_count integer NOT NULL,
    error_message text NOT NULL,
    is_stub boolean NOT NULL
);


ALTER TABLE public.integrations_synclog OWNER TO asu_user;

--
-- Name: integrations_synclog_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.integrations_synclog ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.integrations_synclog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications_emaillog; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.notifications_emaillog (
    id bigint NOT NULL,
    recipient_email character varying(254) NOT NULL,
    subject character varying(255) NOT NULL,
    body_preview text NOT NULL,
    status character varying(10) NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    error_message text NOT NULL,
    related_notification_id bigint
);


ALTER TABLE public.notifications_emaillog OWNER TO asu_user;

--
-- Name: notifications_emaillog_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.notifications_emaillog ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_emaillog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications_notification; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.notifications_notification (
    id bigint NOT NULL,
    notification_type character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    related_object_id integer,
    is_read boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    recipient_id bigint NOT NULL,
    related_content_type_id integer,
    CONSTRAINT notifications_notification_related_object_id_check CHECK ((related_object_id >= 0))
);


ALTER TABLE public.notifications_notification OWNER TO asu_user;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.notifications_notification ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_asset; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_asset (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(100) NOT NULL,
    asset_type character varying(20) NOT NULL,
    unit_of_measure character varying(50) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    is_long_term_use boolean NOT NULL,
    inventory_number character varying(100),
    balance_date date,
    useful_life_months integer,
    depreciation_rate numeric(5,2),
    source_1c_id character varying(100),
    last_sync_at timestamp with time zone,
    category_id bigint NOT NULL,
    group_id bigint,
    unit_of_measure_ref_id bigint,
    CONSTRAINT references_asset_useful_life_months_check CHECK ((useful_life_months >= 0))
);


ALTER TABLE public.references_asset OWNER TO asu_user;

--
-- Name: references_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_asset ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_asset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_assetcategory; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_assetcategory (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    asset_type character varying(20) NOT NULL,
    parent_id bigint
);


ALTER TABLE public.references_assetcategory OWNER TO asu_user;

--
-- Name: references_assetcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_assetcategory ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_assetcategory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_contract; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_contract (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    contract_date date NOT NULL,
    valid_until date NOT NULL,
    pdf_file character varying(100),
    counterparty_id bigint NOT NULL
);


ALTER TABLE public.references_contract OWNER TO asu_user;

--
-- Name: references_contract_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_contract ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_contract_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_counterparty; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_counterparty (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    bin character varying(12) NOT NULL,
    address text NOT NULL,
    contact_person character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(254) NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.references_counterparty OWNER TO asu_user;

--
-- Name: references_counterparty_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_counterparty ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_counterparty_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_limitnorm; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_limitnorm (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    asset_type character varying(20) NOT NULL,
    category character varying(255) NOT NULL,
    quantity_limit numeric(12,2) NOT NULL,
    period character varying(20) NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    created_by_id bigint,
    department_id bigint
);


ALTER TABLE public.references_limitnorm OWNER TO asu_user;

--
-- Name: references_limitnorm_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_limitnorm ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_limitnorm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_position; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_position (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.references_position OWNER TO asu_user;

--
-- Name: references_position_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_position ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_position_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_requesttype; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_requesttype (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    asset_type character varying(20) NOT NULL,
    description text NOT NULL,
    is_active boolean NOT NULL,
    requires_long_term_use boolean NOT NULL
);


ALTER TABLE public.references_requesttype OWNER TO asu_user;

--
-- Name: references_requesttype_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_requesttype ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_requesttype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_unitofmeasure; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_unitofmeasure (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.references_unitofmeasure OWNER TO asu_user;

--
-- Name: references_unitofmeasure_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_unitofmeasure ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_unitofmeasure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_warehouse; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.references_warehouse (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    address character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    department_id bigint
);


ALTER TABLE public.references_warehouse OWNER TO asu_user;

--
-- Name: references_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.references_warehouse ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_warehouse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requests_approvalstep; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.requests_approvalstep (
    id bigint NOT NULL,
    "order" integer NOT NULL,
    approver_role character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    requires_supervisor boolean NOT NULL,
    is_active boolean NOT NULL,
    request_type_id bigint NOT NULL,
    CONSTRAINT requests_approvalstep_order_check CHECK (("order" >= 0))
);


ALTER TABLE public.requests_approvalstep OWNER TO asu_user;

--
-- Name: requests_approvalstep_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.requests_approvalstep ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.requests_approvalstep_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requests_assetrequest; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.requests_assetrequest (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    number character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    reason text NOT NULL,
    from_user_id bigint,
    initiator_id bigint NOT NULL,
    request_type_id bigint NOT NULL,
    to_user_id bigint,
    deletion_requested_at timestamp with time zone,
    deletion_requested_by_id bigint
);


ALTER TABLE public.requests_assetrequest OWNER TO asu_user;

--
-- Name: requests_assetrequest_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.requests_assetrequest ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.requests_assetrequest_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requests_assetrequest_issue_responsibles; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.requests_assetrequest_issue_responsibles (
    id bigint NOT NULL,
    assetrequest_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.requests_assetrequest_issue_responsibles OWNER TO asu_user;

--
-- Name: requests_assetrequest_issue_responsibles_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.requests_assetrequest_issue_responsibles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.requests_assetrequest_issue_responsibles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requests_assetrequestitem; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.requests_assetrequestitem (
    id bigint NOT NULL,
    quantity_requested numeric(12,2) NOT NULL,
    quantity_issued numeric(12,2),
    comment text NOT NULL,
    asset_id bigint,
    request_id bigint NOT NULL,
    issued_asset_id bigint,
    requested_group_id bigint
);


ALTER TABLE public.requests_assetrequestitem OWNER TO asu_user;

--
-- Name: requests_assetrequestitem_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.requests_assetrequestitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.requests_assetrequestitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: requests_requestapproval; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.requests_requestapproval (
    id bigint NOT NULL,
    role_at_approval character varying(30) NOT NULL,
    action character varying(20) NOT NULL,
    signed_at timestamp with time zone,
    comment text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    approver_id bigint NOT NULL,
    request_id bigint NOT NULL
);


ALTER TABLE public.requests_requestapproval OWNER TO asu_user;

--
-- Name: requests_requestapproval_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.requests_requestapproval ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.requests_requestapproval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: token_blacklist_blacklistedtoken; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.token_blacklist_blacklistedtoken (
    id bigint NOT NULL,
    blacklisted_at timestamp with time zone NOT NULL,
    token_id bigint NOT NULL
);


ALTER TABLE public.token_blacklist_blacklistedtoken OWNER TO asu_user;

--
-- Name: token_blacklist_blacklistedtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.token_blacklist_blacklistedtoken ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.token_blacklist_blacklistedtoken_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: token_blacklist_outstandingtoken; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.token_blacklist_outstandingtoken (
    id bigint NOT NULL,
    token text NOT NULL,
    created_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    user_id bigint,
    jti character varying(255) NOT NULL
);


ALTER TABLE public.token_blacklist_outstandingtoken OWNER TO asu_user;

--
-- Name: token_blacklist_outstandingtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.token_blacklist_outstandingtoken ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.token_blacklist_outstandingtoken_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_department; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_department (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    head_id bigint,
    parent_id bigint
);


ALTER TABLE public.users_department OWNER TO asu_user;

--
-- Name: users_department_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_department ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_positionaccessrule; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_positionaccessrule (
    id bigint NOT NULL,
    "position" character varying(255) NOT NULL,
    normalized_position character varying(255) NOT NULL,
    permission_code character varying(80) NOT NULL,
    is_allowed boolean NOT NULL,
    is_active boolean NOT NULL,
    comment character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users_positionaccessrule OWNER TO asu_user;

--
-- Name: users_positionaccessrule_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_positionaccessrule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_positionaccessrule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_user; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_user (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL,
    patronymic character varying(150) NOT NULL,
    "position" character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    role character varying(30) NOT NULL,
    department_id bigint,
    supervisor_id bigint,
    photo character varying(100),
    position_ref_id bigint
);


ALTER TABLE public.users_user OWNER TO asu_user;

--
-- Name: users_user_groups; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_user_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.users_user_groups OWNER TO asu_user;

--
-- Name: users_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_user_user_permissions; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_user_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.users_user_user_permissions OWNER TO asu_user;

--
-- Name: users_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_useraccessoverride; Type: TABLE; Schema: public; Owner: asu_user
--

CREATE TABLE public.users_useraccessoverride (
    id bigint NOT NULL,
    permission_code character varying(80) NOT NULL,
    mode character varying(10) NOT NULL,
    comment character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.users_useraccessoverride OWNER TO asu_user;

--
-- Name: users_useraccessoverride_id_seq; Type: SEQUENCE; Schema: public; Owner: asu_user
--

ALTER TABLE public.users_useraccessoverride ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_useraccessoverride_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: assets_assetassignment; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_assetassignment (id, quantity, assigned_at, location, status, asset_id, assigned_by_id, user_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: assets_stockalertrule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertrule (id, created_at, updated_at, name, is_active, threshold_quantity, message_template) FROM stdin;
2	2026-07-15 12:10:09.212979+00	2026-07-15 12:16:08.704209+00	123	t	10.00	{asset_name} на исходе, требуется срочное пополнение склада. Остаток: {quantity} {unit}.
\.


--
-- Data for Name: assets_stockalertrule_assets; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertrule_assets (id, stockalertrule_id, asset_id) FROM stdin;
\.


--
-- Data for Name: assets_stockalertrule_groups; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertrule_groups (id, stockalertrule_id, assetcategory_id) FROM stdin;
1	2	1
\.


--
-- Data for Name: assets_stockalertrule_recipients; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertrule_recipients (id, stockalertrule_id, user_id) FROM stdin;
2	2	1
\.


--
-- Data for Name: assets_stockalertrule_warehouses; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertrule_warehouses (id, stockalertrule_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: assets_stockalertstate; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockalertstate (id, is_active, current_quantity, message, triggered_at, last_notified_at, resolved_at, rule_id, stock_id) FROM stdin;
2	f	20.00	Бумага А4 (пачка 500 л.) на исходе, требуется срочное пополнение склада. Остаток: 8.00 пачка.	2026-07-15 12:16:55.020357+00	2026-07-15 12:16:55.026018+00	2026-07-16 04:08:34.836769+00	2	1
\.


--
-- Data for Name: assets_stockmovement; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_stockmovement (id, movement_type, quantity, unit_price, total_amount, document_id, performed_at, comment, asset_id, document_type_id, from_user_id, performed_by_id, to_user_id, warehouse_id) FROM stdin;
3	ISSUE	1.00	1200.00	1200.00	8	2026-07-13 07:54:13.595709+00		1	24	\N	1	1	1
2	ISSUE	1.00	1200.00	1200.00	7	2026-07-13 07:17:56.124589+00		1	24	\N	4	1	1
1	INVENTORY_ADJUSTMENT	7.00	123.45	864.15	\N	2026-07-01 09:23:40.975068+00	Корректировка остатка по загрузке Excel	126	\N	\N	1	\N	6
4	ISSUE	190.00	1200.00	228000.00	20	2026-07-15 12:16:55.027199+00		1	24	\N	1	1	1
8	WRITE_OFF	1.00	123.45	123.45	2	2026-07-16 04:08:21.610964+00		126	37	\N	1	\N	6
9	RECEIPT	12.00	1200.00	14400.00	3	2026-07-16 04:08:34.83766+00		1	30	\N	1	\N	1
10	RECEIPT	1.00	123.44	123.44	3	2026-07-16 04:08:34.843893+00		126	30	\N	1	\N	1
\.


--
-- Data for Name: assets_warehousestock; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.assets_warehousestock (id, created_at, updated_at, quantity, total_amount, location, asset_id, balance_date, warehouse_id) FROM stdin;
2	2026-07-01 07:46:43.935893+00	2026-07-14 04:18:20.495976+00	500.00	75000.00	Основной склад	2	\N	1
3	2026-07-01 07:46:43.936505+00	2026-07-14 04:18:20.496953+00	100.00	30000.00	Основной склад	3	\N	1
4	2026-07-01 07:46:43.937617+00	2026-07-14 04:18:20.498008+00	80.00	64000.00	Основной склад	4	\N	1
5	2026-07-01 07:46:43.93849+00	2026-07-14 04:18:20.498629+00	60.00	27000.00	Основной склад	5	\N	1
6	2026-07-01 07:46:43.939374+00	2026-07-14 04:18:20.499217+00	30.00	45000.00	Основной склад	6	\N	1
7	2026-07-01 07:46:43.940025+00	2026-07-14 04:18:20.499818+00	150.00	30000.00	Основной склад	7	\N	1
8	2026-07-01 07:46:43.940719+00	2026-07-14 04:18:20.500471+00	20.00	250000.00	Основной склад	8	\N	1
9	2026-07-01 07:46:43.941305+00	2026-07-14 04:18:20.501149+00	15.00	133500.00	Основной склад	9	\N	1
10	2026-07-01 07:46:43.941893+00	2026-07-14 04:18:20.501809+00	50.00	30000.00	Основной склад	10	\N	1
11	2026-07-01 07:46:43.942467+00	2026-07-14 04:18:20.502469+00	40.00	20000.00	Основной склад	11	\N	1
12	2026-07-01 07:46:43.943053+00	2026-07-14 04:18:20.503085+00	30.00	10500.00	Основной склад	12	\N	1
13	2026-07-01 07:46:43.943608+00	2026-07-14 04:18:20.503767+00	25.00	45000.00	Основной склад	13	\N	1
14	2026-07-01 07:46:43.944171+00	2026-07-14 04:18:20.50456+00	20.00	50000.00	Основной склад	14	\N	1
15	2026-07-01 07:46:43.944721+00	2026-07-14 04:18:20.505656+00	50.00	20000.00	Основной склад	15	\N	1
16	2026-07-01 07:46:43.945288+00	2026-07-14 04:18:20.506347+00	1.00	450000.00	Основной склад	16	\N	1
17	2026-07-01 07:46:43.945821+00	2026-07-14 04:18:20.506981+00	1.00	450000.00	Основной склад	17	\N	1
18	2026-07-01 07:46:43.946348+00	2026-07-14 04:18:20.507557+00	1.00	450000.00	Основной склад	18	\N	1
19	2026-07-01 07:46:43.946877+00	2026-07-14 04:18:20.508319+00	1.00	450000.00	Основной склад	19	\N	1
20	2026-07-01 07:46:43.947422+00	2026-07-14 04:18:20.509123+00	1.00	450000.00	Основной склад	20	\N	1
21	2026-07-01 07:46:43.948347+00	2026-07-14 04:18:20.51007+00	1.00	450000.00	Основной склад	21	\N	1
22	2026-07-01 07:46:43.948891+00	2026-07-14 04:18:20.511625+00	1.00	450000.00	Основной склад	22	\N	1
23	2026-07-01 07:46:43.949426+00	2026-07-14 04:18:20.512384+00	1.00	450000.00	Основной склад	23	\N	1
24	2026-07-01 07:46:43.94994+00	2026-07-14 04:18:20.51308+00	1.00	450000.00	Основной склад	24	\N	1
25	2026-07-01 07:46:43.950451+00	2026-07-14 04:18:20.513834+00	1.00	450000.00	Основной склад	25	\N	1
26	2026-07-01 07:46:43.951147+00	2026-07-14 04:18:20.514593+00	1.00	450000.00	Основной склад	26	\N	1
27	2026-07-01 07:46:43.952278+00	2026-07-14 04:18:20.51533+00	1.00	450000.00	Основной склад	27	\N	1
28	2026-07-01 07:46:43.953383+00	2026-07-14 04:18:20.516018+00	1.00	450000.00	Основной склад	28	\N	1
29	2026-07-01 07:46:43.954235+00	2026-07-14 04:18:20.516808+00	1.00	450000.00	Основной склад	29	\N	1
30	2026-07-01 07:46:43.954889+00	2026-07-14 04:18:20.517549+00	1.00	450000.00	Основной склад	30	\N	1
31	2026-07-01 07:46:43.955522+00	2026-07-14 04:18:20.518272+00	1.00	95000.00	Основной склад	31	\N	1
32	2026-07-01 07:46:43.956315+00	2026-07-14 04:18:20.519007+00	1.00	95000.00	Основной склад	32	\N	1
33	2026-07-01 07:46:43.957236+00	2026-07-14 04:18:20.520044+00	1.00	95000.00	Основной склад	33	\N	1
34	2026-07-01 07:46:43.957891+00	2026-07-14 04:18:20.521414+00	1.00	95000.00	Основной склад	34	\N	1
35	2026-07-01 07:46:43.958469+00	2026-07-14 04:18:20.522305+00	1.00	95000.00	Основной склад	35	\N	1
36	2026-07-01 07:46:43.959209+00	2026-07-14 04:18:20.523146+00	1.00	95000.00	Основной склад	36	\N	1
37	2026-07-01 07:46:43.95984+00	2026-07-14 04:18:20.523842+00	1.00	95000.00	Основной склад	37	\N	1
38	2026-07-01 07:46:43.960539+00	2026-07-14 04:18:20.524597+00	1.00	95000.00	Основной склад	38	\N	1
39	2026-07-01 07:46:43.961251+00	2026-07-14 04:18:20.525405+00	1.00	95000.00	Основной склад	39	\N	1
40	2026-07-01 07:46:43.961872+00	2026-07-14 04:18:20.526195+00	1.00	95000.00	Основной склад	40	\N	1
41	2026-07-01 07:46:43.962496+00	2026-07-14 04:18:20.526899+00	1.00	185000.00	Основной склад	41	\N	1
42	2026-07-01 07:46:43.963332+00	2026-07-14 04:18:20.527625+00	1.00	185000.00	Основной склад	42	\N	1
43	2026-07-01 07:46:43.964028+00	2026-07-14 04:18:20.5283+00	1.00	185000.00	Основной склад	43	\N	1
44	2026-07-01 07:46:43.964851+00	2026-07-14 04:18:20.528993+00	1.00	185000.00	Основной склад	44	\N	1
45	2026-07-01 07:46:43.96579+00	2026-07-14 04:18:20.529718+00	1.00	185000.00	Основной склад	45	\N	1
46	2026-07-01 07:46:43.966625+00	2026-07-14 04:18:20.530445+00	1.00	65000.00	Основной склад	46	\N	1
47	2026-07-01 07:46:43.967359+00	2026-07-14 04:18:20.531163+00	1.00	65000.00	Основной склад	47	\N	1
48	2026-07-01 07:46:43.968217+00	2026-07-14 04:18:20.531876+00	1.00	65000.00	Основной склад	48	\N	1
49	2026-07-01 07:46:43.969113+00	2026-07-14 04:18:20.532606+00	1.00	65000.00	Основной склад	49	\N	1
50	2026-07-01 07:46:43.970007+00	2026-07-14 04:18:20.53331+00	1.00	65000.00	Основной склад	50	\N	1
51	2026-07-01 07:46:43.970615+00	2026-07-14 04:18:20.534065+00	1.00	65000.00	Основной склад	51	\N	1
52	2026-07-01 07:46:43.971179+00	2026-07-14 04:18:20.534748+00	1.00	65000.00	Основной склад	52	\N	1
53	2026-07-01 07:46:43.971735+00	2026-07-14 04:18:20.535457+00	1.00	65000.00	Основной склад	53	\N	1
54	2026-07-01 07:46:43.972277+00	2026-07-14 04:18:20.536273+00	1.00	65000.00	Основной склад	54	\N	1
55	2026-07-01 07:46:43.97284+00	2026-07-14 04:18:20.53696+00	1.00	65000.00	Основной склад	55	\N	1
56	2026-07-01 07:46:43.973374+00	2026-07-14 04:18:20.537659+00	1.00	65000.00	Основной склад	56	\N	1
57	2026-07-01 07:46:43.973923+00	2026-07-14 04:18:20.53837+00	1.00	65000.00	Основной склад	57	\N	1
58	2026-07-01 07:46:43.974497+00	2026-07-14 04:18:20.539081+00	1.00	65000.00	Основной склад	58	\N	1
59	2026-07-01 07:46:43.975064+00	2026-07-14 04:18:20.539829+00	1.00	65000.00	Основной склад	59	\N	1
60	2026-07-01 07:46:43.975641+00	2026-07-14 04:18:20.540528+00	1.00	65000.00	Основной склад	60	\N	1
61	2026-07-01 07:46:43.976199+00	2026-07-14 04:18:20.541397+00	1.00	65000.00	Основной склад	61	\N	1
62	2026-07-01 07:46:43.976762+00	2026-07-14 04:18:20.542146+00	1.00	65000.00	Основной склад	62	\N	1
63	2026-07-01 07:46:43.977321+00	2026-07-14 04:18:20.542821+00	1.00	65000.00	Основной склад	63	\N	1
64	2026-07-01 07:46:43.97841+00	2026-07-14 04:18:20.543471+00	1.00	65000.00	Основной склад	64	\N	1
65	2026-07-01 07:46:43.979624+00	2026-07-14 04:18:20.544177+00	1.00	65000.00	Основной склад	65	\N	1
66	2026-07-01 07:46:43.980352+00	2026-07-14 04:18:20.544907+00	1.00	45000.00	Основной склад	66	\N	1
67	2026-07-01 07:46:43.981277+00	2026-07-14 04:18:20.545648+00	1.00	45000.00	Основной склад	67	\N	1
68	2026-07-01 07:46:43.982346+00	2026-07-14 04:18:20.546389+00	1.00	45000.00	Основной склад	68	\N	1
69	2026-07-01 07:46:43.983428+00	2026-07-14 04:18:20.54726+00	1.00	45000.00	Основной склад	69	\N	1
70	2026-07-01 07:46:43.984477+00	2026-07-14 04:18:20.548096+00	1.00	45000.00	Основной склад	70	\N	1
71	2026-07-01 07:46:43.985528+00	2026-07-14 04:18:20.548754+00	1.00	45000.00	Основной склад	71	\N	1
72	2026-07-01 07:46:43.98639+00	2026-07-14 04:18:20.549355+00	1.00	45000.00	Основной склад	72	\N	1
73	2026-07-01 07:46:43.98723+00	2026-07-14 04:18:20.549999+00	1.00	45000.00	Основной склад	73	\N	1
74	2026-07-01 07:46:43.98812+00	2026-07-14 04:18:20.551123+00	1.00	45000.00	Основной склад	74	\N	1
75	2026-07-01 07:46:43.989079+00	2026-07-14 04:18:20.552158+00	1.00	45000.00	Основной склад	75	\N	1
76	2026-07-01 07:46:43.989779+00	2026-07-14 04:18:20.55301+00	1.00	45000.00	Основной склад	76	\N	1
77	2026-07-01 07:46:43.990471+00	2026-07-14 04:18:20.553804+00	1.00	45000.00	Основной склад	77	\N	1
78	2026-07-01 07:46:43.991508+00	2026-07-14 04:18:20.554614+00	1.00	45000.00	Основной склад	78	\N	1
79	2026-07-01 07:46:43.992737+00	2026-07-14 04:18:20.555368+00	1.00	45000.00	Основной склад	79	\N	1
80	2026-07-01 07:46:43.993582+00	2026-07-14 04:18:20.556381+00	1.00	45000.00	Основной склад	80	\N	1
81	2026-07-01 07:46:43.994339+00	2026-07-14 04:18:20.557294+00	1.00	45000.00	Основной склад	81	\N	1
82	2026-07-01 07:46:43.995125+00	2026-07-14 04:18:20.558067+00	1.00	45000.00	Основной склад	82	\N	1
83	2026-07-01 07:46:43.99604+00	2026-07-14 04:18:20.5589+00	1.00	45000.00	Основной склад	83	\N	1
84	2026-07-01 07:46:43.996783+00	2026-07-14 04:18:20.559583+00	1.00	45000.00	Основной склад	84	\N	1
85	2026-07-01 07:46:43.997489+00	2026-07-14 04:18:20.560232+00	1.00	45000.00	Основной склад	85	\N	1
86	2026-07-01 07:46:43.998553+00	2026-07-14 04:18:20.560952+00	1.00	45000.00	Основной склад	86	\N	1
87	2026-07-01 07:46:43.999461+00	2026-07-14 04:18:20.561691+00	1.00	45000.00	Основной склад	87	\N	1
88	2026-07-01 07:46:44.00035+00	2026-07-14 04:18:20.562437+00	1.00	45000.00	Основной склад	88	\N	1
89	2026-07-01 07:46:44.001209+00	2026-07-14 04:18:20.563373+00	1.00	45000.00	Основной склад	89	\N	1
90	2026-07-01 07:46:44.002079+00	2026-07-14 04:18:20.564054+00	1.00	45000.00	Основной склад	90	\N	1
91	2026-07-01 07:46:44.002976+00	2026-07-14 04:18:20.565034+00	1.00	45000.00	Основной склад	91	\N	1
92	2026-07-01 07:46:44.003863+00	2026-07-14 04:18:20.565792+00	1.00	45000.00	Основной склад	92	\N	1
93	2026-07-01 07:46:44.004775+00	2026-07-14 04:18:20.566405+00	1.00	45000.00	Основной склад	93	\N	1
94	2026-07-01 07:46:44.005655+00	2026-07-14 04:18:20.56697+00	1.00	45000.00	Основной склад	94	\N	1
95	2026-07-01 07:46:44.006583+00	2026-07-14 04:18:20.567618+00	1.00	45000.00	Основной склад	95	\N	1
96	2026-07-01 07:46:44.007479+00	2026-07-14 04:18:20.568322+00	1.00	15000.00	Основной склад	96	\N	1
97	2026-07-01 07:46:44.008355+00	2026-07-14 04:18:20.569009+00	1.00	15000.00	Основной склад	97	\N	1
98	2026-07-01 07:46:44.009101+00	2026-07-14 04:18:20.569793+00	1.00	15000.00	Основной склад	98	\N	1
99	2026-07-01 07:46:44.009919+00	2026-07-14 04:18:20.570562+00	1.00	15000.00	Основной склад	99	\N	1
100	2026-07-01 07:46:44.010593+00	2026-07-14 04:18:20.571243+00	1.00	15000.00	Основной склад	100	\N	1
101	2026-07-01 07:46:44.011343+00	2026-07-14 04:18:20.57195+00	1.00	15000.00	Основной склад	101	\N	1
102	2026-07-01 07:46:44.012112+00	2026-07-14 04:18:20.572681+00	1.00	15000.00	Основной склад	102	\N	1
103	2026-07-01 07:46:44.012744+00	2026-07-14 04:18:20.573361+00	1.00	15000.00	Основной склад	103	\N	1
104	2026-07-01 07:46:44.01343+00	2026-07-14 04:18:20.574341+00	1.00	15000.00	Основной склад	104	\N	1
105	2026-07-01 07:46:44.014603+00	2026-07-14 04:18:20.575062+00	1.00	15000.00	Основной склад	105	\N	1
106	2026-07-01 07:46:44.015584+00	2026-07-14 04:18:20.575744+00	1.00	120000.00	Основной склад	106	\N	1
107	2026-07-01 07:46:44.016329+00	2026-07-14 04:18:20.576381+00	1.00	120000.00	Основной склад	107	\N	1
108	2026-07-01 07:46:44.016915+00	2026-07-14 04:18:20.576998+00	1.00	120000.00	Основной склад	108	\N	1
109	2026-07-01 07:46:44.017537+00	2026-07-14 04:18:20.577681+00	1.00	120000.00	Основной склад	109	\N	1
110	2026-07-01 07:46:44.018084+00	2026-07-14 04:18:20.578531+00	1.00	120000.00	Основной склад	110	\N	1
111	2026-07-01 07:46:44.018844+00	2026-07-14 04:18:20.57915+00	1.00	95000.00	Основной склад	111	\N	1
112	2026-07-01 07:46:44.01964+00	2026-07-14 04:18:20.579776+00	1.00	95000.00	Основной склад	112	\N	1
113	2026-07-01 07:46:44.020481+00	2026-07-14 04:18:20.580433+00	1.00	95000.00	Основной склад	113	\N	1
114	2026-07-01 07:46:44.021235+00	2026-07-14 04:18:20.581142+00	1.00	250000.00	Основной склад	114	\N	1
115	2026-07-01 07:46:44.021923+00	2026-07-14 04:18:20.581751+00	1.00	250000.00	Основной склад	115	\N	1
116	2026-07-01 07:46:44.022548+00	2026-07-14 04:18:20.582399+00	10.00	850000.00	Серверное хранилище	116	\N	5
117	2026-07-01 07:46:44.023213+00	2026-07-14 04:18:20.583009+00	10.00	1200000.00	Серверное хранилище	117	\N	5
118	2026-07-01 07:46:44.023776+00	2026-07-14 04:18:20.583882+00	10.00	150000.00	Серверное хранилище	118	\N	5
119	2026-07-01 07:46:44.024325+00	2026-07-14 04:18:20.584722+00	10.00	650000.00	Серверное хранилище	119	\N	5
120	2026-07-01 07:46:44.024876+00	2026-07-14 04:18:20.58537+00	10.00	3500000.00	Серверное хранилище	120	\N	5
121	2026-07-01 07:46:44.025456+00	2026-07-14 04:18:20.586214+00	10.00	450000.00	Серверное хранилище	121	\N	5
122	2026-07-01 07:46:44.026025+00	2026-07-14 04:18:20.586893+00	10.00	550000.00	Серверное хранилище	122	\N	5
123	2026-07-01 07:46:44.026609+00	2026-07-14 04:18:20.58757+00	10.00	120000.00	Серверное хранилище	123	\N	5
124	2026-07-01 07:46:44.027209+00	2026-07-14 04:18:20.588287+00	10.00	2000000.00	Серверное хранилище	124	\N	5
125	2026-07-01 07:46:44.027787+00	2026-07-14 04:18:20.588978+00	10.00	350000.00	Серверное хранилище	125	\N	5
1	2026-07-01 07:46:43.935057+00	2026-07-16 04:08:34.830583+00	20.00	24000.00	Основной склад	1	\N	1
126	2026-07-01 09:23:40.974592+00	2026-07-16 04:08:34.838892+00	7.00	864.15	Основной склад	126	2026-07-01	1
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add content type	4	add_contenttype
14	Can change content type	4	change_contenttype
15	Can delete content type	4	delete_contenttype
16	Can view content type	4	view_contenttype
17	Can add session	5	add_session
18	Can change session	5	change_session
19	Can delete session	5	delete_session
20	Can view session	5	view_session
21	Can add blacklisted token	6	add_blacklistedtoken
22	Can change blacklisted token	6	change_blacklistedtoken
23	Can delete blacklisted token	6	delete_blacklistedtoken
24	Can view blacklisted token	6	view_blacklistedtoken
25	Can add outstanding token	7	add_outstandingtoken
26	Can change outstanding token	7	change_outstandingtoken
27	Can delete outstanding token	7	delete_outstandingtoken
28	Can view outstanding token	7	view_outstandingtoken
29	Can add crontab	8	add_crontabschedule
30	Can change crontab	8	change_crontabschedule
31	Can delete crontab	8	delete_crontabschedule
32	Can view crontab	8	view_crontabschedule
33	Can add interval	9	add_intervalschedule
34	Can change interval	9	change_intervalschedule
35	Can delete interval	9	delete_intervalschedule
36	Can view interval	9	view_intervalschedule
37	Can add periodic task	10	add_periodictask
38	Can change periodic task	10	change_periodictask
39	Can delete periodic task	10	delete_periodictask
40	Can view periodic task	10	view_periodictask
41	Can add periodic tasks	11	add_periodictasks
42	Can change periodic tasks	11	change_periodictasks
43	Can delete periodic tasks	11	delete_periodictasks
44	Can view periodic tasks	11	view_periodictasks
45	Can add solar event	12	add_solarschedule
46	Can change solar event	12	change_solarschedule
47	Can delete solar event	12	delete_solarschedule
48	Can view solar event	12	view_solarschedule
49	Can add clocked	13	add_clockedschedule
50	Can change clocked	13	change_clockedschedule
51	Can delete clocked	13	delete_clockedschedule
52	Can view clocked	13	view_clockedschedule
53	Can add Пользователь	14	add_user
54	Can change Пользователь	14	change_user
55	Can delete Пользователь	14	delete_user
56	Can view Пользователь	14	view_user
57	Can add Подразделение	15	add_department
58	Can change Подразделение	15	change_department
59	Can delete Подразделение	15	delete_department
60	Can view Подразделение	15	view_department
61	Can add Актив	16	add_asset
62	Can change Актив	16	change_asset
63	Can delete Актив	16	delete_asset
64	Can view Актив	16	view_asset
65	Can add Категория актива	17	add_assetcategory
66	Can change Категория актива	17	change_assetcategory
67	Can delete Категория актива	17	delete_assetcategory
68	Can view Категория актива	17	view_assetcategory
69	Can add Контрагент	18	add_counterparty
70	Can change Контрагент	18	change_counterparty
71	Can delete Контрагент	18	delete_counterparty
72	Can view Контрагент	18	view_counterparty
73	Can add Лимит/норматив	19	add_limitnorm
74	Can change Лимит/норматив	19	change_limitnorm
75	Can delete Лимит/норматив	19	delete_limitnorm
76	Can view Лимит/норматив	19	view_limitnorm
77	Can add Вид заявки	20	add_requesttype
78	Can change Вид заявки	20	change_requesttype
79	Can delete Вид заявки	20	delete_requesttype
80	Can view Вид заявки	20	view_requesttype
81	Can add Закрепление актива	21	add_assetassignment
82	Can change Закрепление актива	21	change_assetassignment
83	Can delete Закрепление актива	21	delete_assetassignment
84	Can view Закрепление актива	21	view_assetassignment
85	Can add Движение актива	22	add_stockmovement
86	Can change Движение актива	22	change_stockmovement
87	Can delete Движение актива	22	delete_stockmovement
88	Can view Движение актива	22	view_stockmovement
89	Can add Остаток на складе	23	add_warehousestock
90	Can change Остаток на складе	23	change_warehousestock
91	Can delete Остаток на складе	23	delete_warehousestock
92	Can view Остаток на складе	23	view_warehousestock
93	Can add Заявка	24	add_assetrequest
94	Can change Заявка	24	change_assetrequest
95	Can delete Заявка	24	delete_assetrequest
96	Can view Заявка	24	view_assetrequest
97	Can add Позиция заявки	25	add_assetrequestitem
98	Can change Позиция заявки	25	change_assetrequestitem
99	Can delete Позиция заявки	25	delete_assetrequestitem
100	Can view Позиция заявки	25	view_assetrequestitem
101	Can add Согласование заявки	26	add_requestapproval
102	Can change Согласование заявки	26	change_requestapproval
103	Can delete Согласование заявки	26	delete_requestapproval
104	Can view Согласование заявки	26	view_requestapproval
105	Can add Член комиссии	27	add_commissionmember
106	Can change Член комиссии	27	change_commissionmember
107	Can delete Член комиссии	27	delete_commissionmember
108	Can view Член комиссии	27	view_commissionmember
109	Can add Протокол заседания	28	add_commissionprotocol
110	Can change Протокол заседания	28	change_commissionprotocol
111	Can delete Протокол заседания	28	delete_commissionprotocol
112	Can view Протокол заседания	28	view_commissionprotocol
113	Can add Подпись документа	29	add_documentsignature
114	Can change Подпись документа	29	change_documentsignature
115	Can delete Подпись документа	29	delete_documentsignature
116	Can view Подпись документа	29	view_documentsignature
117	Can add Приходная накладная	30	add_incominginvoice
118	Can change Приходная накладная	30	change_incominginvoice
119	Can delete Приходная накладная	30	delete_incominginvoice
120	Can view Приходная накладная	30	view_incominginvoice
121	Can add Позиция накладной	31	add_incominginvoiceitem
122	Can change Позиция накладной	31	change_incominginvoiceitem
123	Can delete Позиция накладной	31	delete_incominginvoiceitem
124	Can view Позиция накладной	31	view_incominginvoiceitem
125	Can add Накладная на внутреннее перемещение	32	add_internaltransferinvoice
126	Can change Накладная на внутреннее перемещение	32	change_internaltransferinvoice
127	Can delete Накладная на внутреннее перемещение	32	delete_internaltransferinvoice
128	Can view Накладная на внутреннее перемещение	32	view_internaltransferinvoice
129	Can add Позиция накладной перемещения	33	add_internaltransferitem
130	Can change Позиция накладной перемещения	33	change_internaltransferitem
131	Can delete Позиция накладной перемещения	33	delete_internaltransferitem
132	Can view Позиция накладной перемещения	33	view_internaltransferitem
133	Can add Ходатайство	34	add_petition
134	Can change Ходатайство	34	change_petition
135	Can delete Ходатайство	34	delete_petition
136	Can view Ходатайство	34	view_petition
137	Can add Позиция ходатайства	35	add_petitionitem
138	Can change Позиция ходатайства	35	change_petitionitem
139	Can delete Позиция ходатайства	35	delete_petitionitem
140	Can view Позиция ходатайства	35	view_petitionitem
141	Can add Позиция приложения к протоколу	36	add_protocolitem
142	Can change Позиция приложения к протоколу	36	change_protocolitem
143	Can delete Позиция приложения к протоколу	36	delete_protocolitem
144	Can view Позиция приложения к протоколу	36	view_protocolitem
145	Can add Акт на списание	37	add_writeoffact
146	Can change Акт на списание	37	change_writeoffact
147	Can delete Акт на списание	37	delete_writeoffact
148	Can view Акт на списание	37	view_writeoffact
149	Can add Позиция акта списания	38	add_writeoffactitem
150	Can change Позиция акта списания	38	change_writeoffactitem
151	Can delete Позиция акта списания	38	delete_writeoffactitem
152	Can view Позиция акта списания	38	view_writeoffactitem
153	Can add Журнал email	39	add_emaillog
154	Can change Журнал email	39	change_emaillog
155	Can delete Журнал email	39	delete_emaillog
156	Can view Журнал email	39	view_emaillog
157	Can add Уведомление	40	add_notification
158	Can change Уведомление	40	change_notification
159	Can delete Уведомление	40	delete_notification
160	Can view Уведомление	40	view_notification
161	Can add Журнал синхронизации	41	add_synclog
162	Can change Журнал синхронизации	41	change_synclog
163	Can delete Журнал синхронизации	41	delete_synclog
164	Can view Журнал синхронизации	41	view_synclog
165	Can add Этап согласования	42	add_approvalstep
166	Can change Этап согласования	42	change_approvalstep
167	Can delete Этап согласования	42	delete_approvalstep
168	Can view Этап согласования	42	view_approvalstep
169	Can add Право по должности	43	add_positionaccessrule
170	Can change Право по должности	43	change_positionaccessrule
171	Can delete Право по должности	43	delete_positionaccessrule
172	Can view Право по должности	43	view_positionaccessrule
173	Can add Индивидуальное право	44	add_useraccessoverride
174	Can change Индивидуальное право	44	change_useraccessoverride
175	Can delete Индивидуальное право	44	delete_useraccessoverride
176	Can view Индивидуальное право	44	view_useraccessoverride
177	Can add Единица измерения	45	add_unitofmeasure
178	Can change Единица измерения	45	change_unitofmeasure
179	Can delete Единица измерения	45	delete_unitofmeasure
180	Can view Единица измерения	45	view_unitofmeasure
181	Can add Склад	46	add_warehouse
182	Can change Склад	46	change_warehouse
183	Can delete Склад	46	delete_warehouse
184	Can view Склад	46	view_warehouse
185	Can add Должность	47	add_position
186	Can change Должность	47	change_position
187	Can delete Должность	47	delete_position
188	Can view Должность	47	view_position
189	Can add Договор	48	add_contract
190	Can change Договор	48	change_contract
191	Can delete Договор	48	delete_contract
192	Can view Договор	48	view_contract
193	Can add Настройка аларма остатка	49	add_stockalertrule
194	Can change Настройка аларма остатка	49	change_stockalertrule
195	Can delete Настройка аларма остатка	49	delete_stockalertrule
196	Can view Настройка аларма остатка	49	view_stockalertrule
197	Can add Срабатывание аларма остатка	50	add_stockalertstate
198	Can change Срабатывание аларма остатка	50	change_stockalertstate
199	Can delete Срабатывание аларма остатка	50	delete_stockalertstate
200	Can view Срабатывание аларма остатка	50	view_stockalertstate
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- Data for Name: django_celery_beat_clockedschedule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_clockedschedule (id, clocked_time) FROM stdin;
\.


--
-- Data for Name: django_celery_beat_crontabschedule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_crontabschedule (id, minute, hour, day_of_week, day_of_month, month_of_year, timezone) FROM stdin;
1	0	4	*	*	*	Asia/Almaty
\.


--
-- Data for Name: django_celery_beat_intervalschedule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_intervalschedule (id, every, period) FROM stdin;
\.


--
-- Data for Name: django_celery_beat_periodictask; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_periodictask (id, name, task, args, kwargs, queue, exchange, routing_key, expires, enabled, last_run_at, total_run_count, date_changed, description, crontab_id, interval_id, solar_id, one_off, start_time, priority, headers, clocked_id, expire_seconds) FROM stdin;
1	celery.backend_cleanup	celery.backend_cleanup	[]	{}	\N	\N	\N	\N	t	2026-07-15 23:00:00.001116+00	10	2026-07-15 23:00:15.050893+00		1	\N	\N	f	\N	\N	{}	\N	43200
\.


--
-- Data for Name: django_celery_beat_periodictasks; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_periodictasks (ident, last_update) FROM stdin;
1	2026-07-14 04:30:16.687812+00
\.


--
-- Data for Name: django_celery_beat_solarschedule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_celery_beat_solarschedule (id, event, latitude, longitude) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	contenttypes	contenttype
5	sessions	session
6	token_blacklist	blacklistedtoken
7	token_blacklist	outstandingtoken
8	django_celery_beat	crontabschedule
9	django_celery_beat	intervalschedule
10	django_celery_beat	periodictask
11	django_celery_beat	periodictasks
12	django_celery_beat	solarschedule
13	django_celery_beat	clockedschedule
14	users	user
15	users	department
16	references	asset
17	references	assetcategory
18	references	counterparty
19	references	limitnorm
20	references	requesttype
21	assets	assetassignment
22	assets	stockmovement
23	assets	warehousestock
24	requests	assetrequest
25	requests	assetrequestitem
26	requests	requestapproval
27	documents	commissionmember
28	documents	commissionprotocol
29	documents	documentsignature
30	documents	incominginvoice
31	documents	incominginvoiceitem
32	documents	internaltransferinvoice
33	documents	internaltransferitem
34	documents	petition
35	documents	petitionitem
36	documents	protocolitem
37	documents	writeoffact
38	documents	writeoffactitem
39	notifications	emaillog
40	notifications	notification
41	integrations	synclog
42	requests	approvalstep
43	users	positionaccessrule
44	users	useraccessoverride
45	references	unitofmeasure
46	references	warehouse
47	references	position
48	references	contract
49	assets	stockalertrule
50	assets	stockalertstate
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-07-01 07:45:58.003065+00
2	contenttypes	0002_remove_content_type_name	2026-07-01 07:45:58.006365+00
3	auth	0001_initial	2026-07-01 07:45:58.030546+00
4	auth	0002_alter_permission_name_max_length	2026-07-01 07:45:58.033184+00
5	auth	0003_alter_user_email_max_length	2026-07-01 07:45:58.035898+00
6	auth	0004_alter_user_username_opts	2026-07-01 07:45:58.038423+00
7	auth	0005_alter_user_last_login_null	2026-07-01 07:45:58.042193+00
8	auth	0006_require_contenttypes_0002	2026-07-01 07:45:58.044022+00
9	auth	0007_alter_validators_add_error_messages	2026-07-01 07:45:58.047372+00
10	auth	0008_alter_user_username_max_length	2026-07-01 07:45:58.049638+00
11	auth	0009_alter_user_last_name_max_length	2026-07-01 07:45:58.068704+00
12	auth	0010_alter_group_name_max_length	2026-07-01 07:45:58.072409+00
13	auth	0011_update_proxy_permissions	2026-07-01 07:45:58.076338+00
14	auth	0012_alter_user_first_name_max_length	2026-07-01 07:45:58.078929+00
15	users	0001_initial	2026-07-01 07:45:58.127319+00
16	admin	0001_initial	2026-07-01 07:45:58.142366+00
17	admin	0002_logentry_remove_auto_add	2026-07-01 07:45:58.147433+00
18	admin	0003_logentry_add_action_flag_choices	2026-07-01 07:45:58.151427+00
19	references	0001_initial	2026-07-01 07:45:58.187788+00
20	assets	0001_initial	2026-07-01 07:45:58.200166+00
21	assets	0002_initial	2026-07-01 07:45:58.214178+00
22	assets	0003_initial	2026-07-01 07:45:58.252831+00
23	assets	0004_warehousestock_balance_date	2026-07-01 07:45:58.257044+00
24	django_celery_beat	0001_initial	2026-07-01 07:45:58.277684+00
25	django_celery_beat	0002_auto_20161118_0346	2026-07-01 07:45:58.286464+00
26	django_celery_beat	0003_auto_20161209_0049	2026-07-01 07:45:58.292434+00
27	django_celery_beat	0004_auto_20170221_0000	2026-07-01 07:45:58.295746+00
28	django_celery_beat	0005_add_solarschedule_events_choices	2026-07-01 07:45:58.298073+00
29	django_celery_beat	0006_auto_20180322_0932	2026-07-01 07:45:58.310764+00
30	django_celery_beat	0007_auto_20180521_0826	2026-07-01 07:45:58.317005+00
31	django_celery_beat	0008_auto_20180914_1922	2026-07-01 07:45:58.327021+00
32	django_celery_beat	0006_auto_20180210_1226	2026-07-01 07:45:58.334184+00
33	django_celery_beat	0006_periodictask_priority	2026-07-01 07:45:58.338411+00
34	django_celery_beat	0009_periodictask_headers	2026-07-01 07:45:58.342391+00
35	django_celery_beat	0010_auto_20190429_0326	2026-07-01 07:45:58.398401+00
36	django_celery_beat	0011_auto_20190508_0153	2026-07-01 07:45:58.410843+00
37	django_celery_beat	0012_periodictask_expire_seconds	2026-07-01 07:45:58.4151+00
38	django_celery_beat	0013_auto_20200609_0727	2026-07-01 07:45:58.419078+00
39	django_celery_beat	0014_remove_clockedschedule_enabled	2026-07-01 07:45:58.421616+00
40	django_celery_beat	0015_edit_solarschedule_events_choices	2026-07-01 07:45:58.423844+00
41	django_celery_beat	0016_alter_crontabschedule_timezone	2026-07-01 07:45:58.429036+00
42	django_celery_beat	0017_alter_crontabschedule_month_of_year	2026-07-01 07:45:58.432589+00
43	django_celery_beat	0018_improve_crontab_helptext	2026-07-01 07:45:58.436349+00
44	references	0002_initial	2026-07-01 07:45:58.458969+00
45	documents	0001_initial	2026-07-01 07:45:58.497113+00
46	documents	0002_initial	2026-07-01 07:45:58.506504+00
47	documents	0003_initial	2026-07-01 07:45:58.727376+00
48	integrations	0001_initial	2026-07-01 07:45:58.735504+00
49	notifications	0001_initial	2026-07-01 07:45:58.745435+00
50	notifications	0002_initial	2026-07-01 07:45:58.780507+00
51	references	0003_requesttype_requires_long_term_use	2026-07-01 07:45:58.78407+00
52	references	0004_asset_group	2026-07-01 07:45:58.799571+00
53	requests	0001_initial	2026-07-01 07:45:58.816085+00
54	requests	0002_initial	2026-07-01 07:45:58.938659+00
55	requests	0003_request_item_group_and_issue_asset	2026-07-01 07:45:58.978291+00
56	sessions	0001_initial	2026-07-01 07:45:58.988381+00
57	token_blacklist	0001_initial	2026-07-01 07:45:59.022051+00
58	token_blacklist	0002_outstandingtoken_jti_hex	2026-07-01 07:45:59.032305+00
59	token_blacklist	0003_auto_20171017_2007	2026-07-01 07:45:59.049215+00
60	token_blacklist	0004_auto_20171017_2013	2026-07-01 07:45:59.063575+00
61	token_blacklist	0005_remove_outstandingtoken_jti	2026-07-01 07:45:59.073539+00
62	token_blacklist	0006_auto_20171017_2113	2026-07-01 07:45:59.082987+00
63	token_blacklist	0007_auto_20171017_2214	2026-07-01 07:45:59.103815+00
64	token_blacklist	0008_migrate_to_bigautofield	2026-07-01 07:45:59.139164+00
65	token_blacklist	0010_fix_migrate_to_bigautofield	2026-07-01 07:45:59.153377+00
66	token_blacklist	0011_linearizes_history	2026-07-01 07:45:59.155492+00
67	token_blacklist	0012_alter_outstandingtoken_user	2026-07-01 07:45:59.166506+00
68	users	0002_user_photo	2026-07-01 07:45:59.175674+00
69	requests	0004_approvalstep	2026-07-02 10:53:44.447052+00
70	documents	0004_remove_documentsignature_otp_code_hash_and_more	2026-07-02 13:09:36.864438+00
71	requests	0005_remove_requestapproval_otp_code_and_more	2026-07-02 13:09:36.88401+00
72	notifications	0003_notification_type_choices	2026-07-13 07:02:26.363676+00
73	requests	0006_issue_responsibles_and_workflow_choices	2026-07-13 07:02:26.424567+00
74	users	0003_positionaccessrule_useraccessoverride_and_more	2026-07-13 08:56:40.998593+00
75	references	0005_unitofmeasure_warehouse_position	2026-07-13 12:48:49.691868+00
76	references	0006_asset_unit_of_measure_ref	2026-07-14 04:18:20.300428+00
77	references	0007_seed_unit_links	2026-07-14 04:18:20.426949+00
78	assets	0005_assetassignment_warehouse_stockmovement_warehouse_and_more	2026-07-14 04:18:20.483119+00
79	assets	0006_seed_warehouse_links	2026-07-14 04:18:20.59755+00
80	users	0004_user_position_ref	2026-07-14 04:18:20.622612+00
81	users	0005_seed_position_links	2026-07-14 04:18:20.663118+00
82	references	0008_contract	2026-07-14 07:36:28.078006+00
83	users	0006_alter_positionaccessrule_permission_code_and_more	2026-07-14 08:20:17.985894+00
84	requests	0007_assetrequest_deletion_requested_at_and_more	2026-07-14 09:42:59.562633+00
85	assets	0007_stockalertrule_stockalertstate_and_more	2026-07-15 12:02:28.438542+00
86	notifications	0004_alter_notification_notification_type	2026-07-15 12:02:28.450856+00
87	documents	0005_alter_commissionprotocol_status_and_more	2026-07-15 12:28:56.529253+00
88	documents	0006_incominginvoice_warehouse_and_more	2026-07-15 12:36:01.21188+00
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
\.


--
-- Data for Name: documents_commissionmember; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_commissionmember (id, role_label, petition_id, protocol_id, user_id, write_off_act_id) FROM stdin;
4	Член комиссии	\N	\N	1	2
\.


--
-- Data for Name: documents_commissionprotocol; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_commissionprotocol (id, created_at, updated_at, number, date, status, agenda_item, commission_order_number, commission_order_date, decision_text, created_by_id, petition_id) FROM stdin;
\.


--
-- Data for Name: documents_documentsignature; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_documentsignature (id, document_id, role_label, signed_at, is_acting_chairman, sent_for_revision_at, revision_reason, document_type_id, signer_id) FROM stdin;
2	4	Руководитель АХС	\N	f	\N		30	4
3	5	Руководитель АХС	2026-07-15 12:29:56.30205+00	f	\N	ok	30	4
4	6	Руководитель АХС	2026-07-15 12:36:23.482241+00	f	\N	first	30	4
5	6	Запрос на изменение	\N	f	2026-07-15 12:36:23.506486+00	Нужно увеличить количество	30	1
6	6	Согласование изменения	2026-07-15 12:36:23.520552+00	f	\N	ok	30	4
7	6	Руководитель АХС	2026-07-15 12:36:23.554333+00	f	\N	second	30	4
8	2	Руководитель АХС	\N	f	\N		37	4
9	2	Руководитель АХС	2026-07-16 04:08:21.599033+00	f	\N		37	1
10	3	Руководитель АХС	\N	f	\N		30	4
11	3	Руководитель АХС	2026-07-16 04:08:34.826684+00	f	\N		30	1
\.


--
-- Data for Name: documents_incominginvoice; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_incominginvoice (id, created_at, updated_at, number, date, status, asset_type, counterparty_id, created_by_id, mol_warehouse_id, warehouse_id) FROM stdin;
3	2026-07-15 12:18:09.334502+00	2026-07-16 04:08:34.827103+00	001/2026	2026-07-16	SIGNED	TMZ	1	1	3	1
\.


--
-- Data for Name: documents_incominginvoiceitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_incominginvoiceitem (id, quantity, unit_price, total, asset_id, invoice_id) FROM stdin;
8	12.00	1200.00	14400.00	1	3
9	1.00	123.44	123.44	126	3
\.


--
-- Data for Name: documents_internaltransferinvoice; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_internaltransferinvoice (id, created_at, updated_at, number, date, status, asset_type, created_by_id, from_user_id, to_user_id) FROM stdin;
\.


--
-- Data for Name: documents_internaltransferitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_internaltransferitem (id, quantity, asset_id, invoice_id) FROM stdin;
\.


--
-- Data for Name: documents_petition; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_petition (id, created_at, updated_at, number, date, status, legal_basis, created_by_id) FROM stdin;
\.


--
-- Data for Name: documents_petitionitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_petitionitem (id, quantity, unit_price, total, asset_id, petition_id) FROM stdin;
\.


--
-- Data for Name: documents_protocolitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_protocolitem (id, quantity, unit_price, total, asset_id, protocol_id) FROM stdin;
\.


--
-- Data for Name: documents_writeoffact; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_writeoffact (id, created_at, updated_at, number, date, status, act_type, commission_order_number, commission_order_date, is_representative, total_amount, created_by_id) FROM stdin;
2	2026-07-16 04:08:00.562811+00	2026-07-16 04:08:21.599491+00	001/2026	2026-07-16	SIGNED	TMZ	123	2026-07-16	f	123.45	1
\.


--
-- Data for Name: documents_writeoffactitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.documents_writeoffactitem (id, quantity, unit_price, total, act_id, asset_id) FROM stdin;
2	1.00	123.45	123.45	2	126
\.


--
-- Data for Name: integrations_synclog; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.integrations_synclog (id, sync_type, started_at, finished_at, status, created_count, updated_count, error_message, is_stub) FROM stdin;
1	assets_all	2026-07-01 07:49:53.456681+00	2026-07-01 07:49:53.460631+00	SUCCESS	0	0		t
\.


--
-- Data for Name: notifications_emaillog; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.notifications_emaillog (id, recipient_email, subject, body_preview, status, sent_at, error_message, related_notification_id) FROM stdin;
1	dit_head@kfgd.kz	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-13 07:16:29.23803+00		1
2	mol_wh@kfgd.kz	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-13 07:17:11.054266+00		2
3	ahs_head@kfgd.kz	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-13 07:17:25.254003+00		3
4	ahs_head@kfgd.kz	Заявка №003/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	SENT	2026-07-13 07:17:38.761541+00		4
5	admin@kfgd.kz	Заявка №003/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	SENT	2026-07-13 07:17:38.762892+00		5
6	admin@kfgd.kz	Заявка №003/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	SENT	2026-07-13 07:17:56.129777+00		6
7	admin@kfgd.kz	Заявка №001/2026 отклонена	123	SENT	2026-07-13 07:47:12.472332+00		7
8	dit_head@kfgd.kz	Заявка №004/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-13 07:47:46.410111+00		8
9	ahs_head@kfgd.kz	Заявка №004/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-13 07:47:51.786535+00		9
10	ahs_head@kfgd.kz	Заявка №004/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	SENT	2026-07-13 07:48:09.631119+00		10
11	admin@kfgd.kz	Заявка №004/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	SENT	2026-07-13 07:48:09.632256+00		11
12	admin@kfgd.kz	Заявка №004/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	SENT	2026-07-13 07:54:13.599462+00		12
13	ahs_head@kfgd.kz	Заявка №005/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	SENT	2026-07-14 08:32:26.333068+00		13
14	ahs_head@kfgd.kz	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	SENT	2026-07-14 09:18:02.923055+00		14
15	ahs_head@kfgd.kz	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	SENT	2026-07-14 09:18:42.359801+00		15
16	admin@kfgd.kz	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	SENT	2026-07-14 09:18:42.361141+00		16
17	mol_nma@kfgd.kz	Критический остаток на складе	Smoke ?????? ?4 ?? ??????, ????????? ??????? ?????????? ??????.	SENT	2026-07-15 12:06:30.308926+00		\N
18	dit_head@kfgd.kz	Заявка №007/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-15 12:16:41.800125+00		18
19	ahs_head@kfgd.kz	Заявка №007/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	SENT	2026-07-15 12:16:45.639399+00		19
20	ahs2@kfgd.kz	Заявка №007/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	SENT	2026-07-15 12:16:51.140229+00		20
21	admin@kfgd.kz	Заявка №007/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	SENT	2026-07-15 12:16:51.141462+00		21
22	admin@kfgd.kz	Критический остаток на складе	Бумага А4 (пачка 500 л.) на исходе, требуется срочное пополнение склада. Остаток: 8.00 пачка.	SENT	2026-07-15 12:16:55.025187+00		22
23	admin@kfgd.kz	Заявка №007/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	SENT	2026-07-15 12:16:55.030811+00		23
24	ahs_head@kfgd.kz	Документ на согласование АХС	Приходная накладная №б/н ожидает согласования.	SENT	2026-07-15 12:29:15.056401+00		\N
25	ahs_head@kfgd.kz	Документ на согласование АХС	Приходная накладная №б/н ожидает согласования.	SENT	2026-07-15 12:29:56.289697+00		\N
26	ahs_head@kfgd.kz	Документ на согласование АХС	Приходная накладная №б/н ожидает согласования.	SENT	2026-07-15 12:36:23.469455+00		\N
27	ahs_head@kfgd.kz	Запрос на изменение документа	Приходная накладная №001/2026 ожидает решения по изменению. Нужно увеличить количество	SENT	2026-07-15 12:36:23.50939+00		\N
28	ahs_head@kfgd.kz	Документ на согласование АХС	Приходная накладная №001/2026 ожидает согласования.	SENT	2026-07-15 12:36:23.54197+00		\N
29	ahs_head@kfgd.kz	Документ на согласование АХС	Акт на списание №б/н ожидает согласования.	SENT	2026-07-16 04:08:16.937623+00		29
30	ahs_head@kfgd.kz	Документ на согласование АХС	Приходная накладная №б/н ожидает согласования.	SENT	2026-07-16 04:08:32.368147+00		30
\.


--
-- Data for Name: notifications_notification; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.notifications_notification (id, notification_type, title, body, related_object_id, is_read, created_at, recipient_id, related_content_type_id) FROM stdin;
1	REQUEST_TO_APPROVE	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	7	f	2026-07-13 07:16:29.233996+00	8	24
2	REQUEST_TO_APPROVE	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	7	f	2026-07-13 07:17:11.053163+00	5	24
8	REQUEST_TO_APPROVE	Заявка №004/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	8	f	2026-07-13 07:47:46.408936+00	8	24
3	REQUEST_TO_APPROVE	Заявка №003/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	7	t	2026-07-13 07:17:25.252926+00	4	24
4	REQUEST_TO_ISSUE	Заявка №003/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	7	t	2026-07-13 07:17:38.760019+00	4	24
9	REQUEST_TO_APPROVE	Заявка №004/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	8	t	2026-07-13 07:47:51.785427+00	4	24
10	REQUEST_TO_ISSUE	Заявка №004/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	8	t	2026-07-13 07:48:09.629844+00	4	24
11	REQUEST_STATUS	Заявка №004/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	8	t	2026-07-13 07:48:09.631519+00	1	24
7	REQUEST_STATUS	Заявка №001/2026 отклонена	123	2	t	2026-07-13 07:47:12.468308+00	1	24
6	REQUEST_STATUS	Заявка №003/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	7	t	2026-07-13 07:17:56.12867+00	1	24
5	REQUEST_STATUS	Заявка №003/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	7	t	2026-07-13 07:17:38.762+00	1	24
12	REQUEST_STATUS	Заявка №004/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	8	t	2026-07-13 07:54:13.598167+00	1	24
13	REQUEST_TO_APPROVE	Заявка №005/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	9	f	2026-07-14 08:32:26.329346+00	4	24
14	REQUEST_TO_APPROVE	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	16	f	2026-07-14 09:18:02.917853+00	4	24
15	REQUEST_TO_APPROVE	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	16	f	2026-07-14 09:18:42.358522+00	4	24
16	REQUEST_TO_APPROVE	Заявка №007/2026 ожидает согласования	Бекмуратов Арман Талгатович отправил(а) заявку на согласование.	16	t	2026-07-14 09:18:42.360236+00	1	24
18	REQUEST_TO_APPROVE	Заявка №007/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	20	f	2026-07-15 12:16:41.797261+00	8	24
19	REQUEST_TO_APPROVE	Заявка №007/2026 ожидает согласования	Системный Администратор отправил(а) заявку на согласование.	20	f	2026-07-15 12:16:45.637658+00	4	24
20	REQUEST_TO_ISSUE	Заявка №007/2026 готова к выдаче	Заявка согласована. Необходимо выполнить выдачу товаров сотруднику Системный Администратор.	20	f	2026-07-15 12:16:51.138894+00	3	24
23	REQUEST_STATUS	Заявка №007/2026 выдана	Товары по заявке выданы ответственным сотрудником АХС.	20	t	2026-07-15 12:16:55.029846+00	1	24
22	STOCK_ALERT	Критический остаток на складе	Бумага А4 (пачка 500 л.) на исходе, требуется срочное пополнение склада. Остаток: 8.00 пачка.	1	t	2026-07-15 12:16:55.021529+00	1	23
21	REQUEST_STATUS	Заявка №007/2026 согласована	Заявка согласована и передана ответственным АХС на выдачу.	20	t	2026-07-15 12:16:51.140625+00	1	24
29	DOCUMENT_TO_SIGN	Документ на согласование АХС	Акт на списание №б/н ожидает согласования.	2	f	2026-07-16 04:08:16.933064+00	4	37
30	DOCUMENT_TO_SIGN	Документ на согласование АХС	Приходная накладная №б/н ожидает согласования.	3	f	2026-07-16 04:08:32.366989+00	4	30
\.


--
-- Data for Name: references_asset; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_asset (id, created_at, updated_at, name, code, asset_type, unit_of_measure, unit_price, is_long_term_use, inventory_number, balance_date, useful_life_months, depreciation_rate, source_1c_id, last_sync_at, category_id, group_id, unit_of_measure_ref_id) FROM stdin;
8	2026-07-01 07:46:43.841687+00	2026-07-14 04:18:20.340416+00	Картридж HP LaserJet	TMZ-008	TMZ	шт.	12500.00	f	\N	\N	\N	\N	\N	\N	3	\N	14
11	2026-07-01 07:46:43.844007+00	2026-07-14 04:18:20.379515+00	Мыло жидкое	TMZ-011	TMZ	л	500.00	f	\N	\N	\N	\N	\N	\N	2	\N	5
126	2026-07-01 09:23:40.972581+00	2026-07-14 05:13:41.806655+00	Smoke upload item	TEST-UPLOAD-1782897709	TMZ	??&.	123.45	f	\N	2026-07-01	\N	\N	\N	\N	14	14	11
117	2026-07-01 07:46:43.918621+00	2026-07-14 04:18:20.326975+00	1С:Бухгалтерия 8	NMA-002	NMA	лицензия	120000.00	f	НМА-002	2026-01-02	60	\N	\N	\N	11	\N	10
119	2026-07-01 07:46:43.920012+00	2026-07-14 04:18:20.329303+00	Adobe Acrobat Pro	NMA-004	NMA	лицензия	65000.00	f	НМА-004	2026-01-02	12	\N	\N	\N	12	\N	10
120	2026-07-01 07:46:43.920626+00	2026-07-14 04:18:20.330032+00	AutoCAD 2024	NMA-005	NMA	лицензия	350000.00	f	НМА-005	2026-01-02	12	\N	\N	\N	12	\N	10
116	2026-07-01 07:46:43.918017+00	2026-07-14 04:18:20.330711+00	Microsoft Office 2021	NMA-001	NMA	лицензия	85000.00	f	НМА-001	2026-01-02	36	\N	\N	\N	11	\N	10
125	2026-07-01 07:46:43.924104+00	2026-07-14 04:18:20.33332+00	VPN-сервис корпоративный	NMA-010	NMA	лицензия	35000.00	f	НМА-010	2026-01-02	12	\N	\N	\N	12	\N	10
121	2026-07-01 07:46:43.921226+00	2026-07-14 04:18:20.334192+00	Zoom Business (1 год)	NMA-006	NMA	лицензия	45000.00	f	НМА-006	2026-01-02	12	\N	\N	\N	12	\N	10
123	2026-07-01 07:46:43.922795+00	2026-07-14 04:18:20.334824+00	Антивирус ESET (1 год)	NMA-008	NMA	лицензия	12000.00	f	НМА-008	2026-01-02	12	\N	\N	\N	12	\N	10
118	2026-07-01 07:46:43.919427+00	2026-07-14 04:18:20.335469+00	Антивирус Kaspersky (1 год)	NMA-003	NMA	лицензия	15000.00	f	НМА-003	2026-01-02	12	\N	\N	\N	12	\N	10
122	2026-07-01 07:46:43.921884+00	2026-07-14 04:18:20.337272+00	База данных НПА РК	NMA-007	NMA	годовая подписка	55000.00	f	НМА-007	2026-01-02	12	\N	\N	\N	13	\N	12
1	2026-07-01 07:46:43.836617+00	2026-07-14 04:18:20.338799+00	Бумага А4 (пачка 500 л.)	TMZ-001	TMZ	пачка	1200.00	f	\N	\N	\N	\N	\N	\N	1	1	13
115	2026-07-01 07:46:43.917418+00	2026-07-14 04:18:20.341127+00	Кофемашина #100	OS-100	OS	шт.	250000.00	f	ОС-100	2025-07-01	60	\N	\N	\N	7	\N	14
114	2026-07-01 07:46:43.916779+00	2026-07-14 04:18:20.342278+00	Кофемашина #99	OS-099	OS	шт.	250000.00	f	ОС-099	2025-07-01	60	\N	\N	\N	7	\N	14
14	2026-07-01 07:46:43.846349+00	2026-07-14 04:18:20.343212+00	Кофе растворимый 200 г	TMZ-014	TMZ	шт.	2500.00	f	\N	\N	\N	\N	\N	\N	5	\N	14
66	2026-07-01 07:46:43.883848+00	2026-07-14 04:18:20.344367+00	Кресло офисное #51	OS-051	OS	шт.	45000.00	f	ОС-051	2025-07-01	60	\N	\N	\N	8	\N	14
67	2026-07-01 07:46:43.88445+00	2026-07-14 04:18:20.345001+00	Кресло офисное #52	OS-052	OS	шт.	45000.00	f	ОС-052	2025-07-01	60	\N	\N	\N	8	\N	14
68	2026-07-01 07:46:43.885029+00	2026-07-14 04:18:20.345711+00	Кресло офисное #53	OS-053	OS	шт.	45000.00	f	ОС-053	2025-07-01	60	\N	\N	\N	8	\N	14
69	2026-07-01 07:46:43.885612+00	2026-07-14 04:18:20.346404+00	Кресло офисное #54	OS-054	OS	шт.	45000.00	f	ОС-054	2025-07-01	60	\N	\N	\N	8	\N	14
70	2026-07-01 07:46:43.886195+00	2026-07-14 04:18:20.347138+00	Кресло офисное #55	OS-055	OS	шт.	45000.00	f	ОС-055	2025-07-01	60	\N	\N	\N	8	\N	14
71	2026-07-01 07:46:43.886767+00	2026-07-14 04:18:20.347906+00	Кресло офисное #56	OS-056	OS	шт.	45000.00	f	ОС-056	2025-07-01	60	\N	\N	\N	8	\N	14
72	2026-07-01 07:46:43.887346+00	2026-07-14 04:18:20.34878+00	Кресло офисное #57	OS-057	OS	шт.	45000.00	f	ОС-057	2025-07-01	60	\N	\N	\N	8	\N	14
73	2026-07-01 07:46:43.888216+00	2026-07-14 04:18:20.349918+00	Кресло офисное #58	OS-058	OS	шт.	45000.00	f	ОС-058	2025-07-01	60	\N	\N	\N	8	\N	14
74	2026-07-01 07:46:43.88916+00	2026-07-14 04:18:20.350692+00	Кресло офисное #59	OS-059	OS	шт.	45000.00	f	ОС-059	2025-07-01	60	\N	\N	\N	8	\N	14
75	2026-07-01 07:46:43.889958+00	2026-07-14 04:18:20.351422+00	Кресло офисное #60	OS-060	OS	шт.	45000.00	f	ОС-060	2025-07-01	60	\N	\N	\N	8	\N	14
76	2026-07-01 07:46:43.890621+00	2026-07-14 04:18:20.352347+00	Кресло офисное #61	OS-061	OS	шт.	45000.00	f	ОС-061	2025-07-01	60	\N	\N	\N	8	\N	14
77	2026-07-01 07:46:43.891244+00	2026-07-14 04:18:20.353204+00	Кресло офисное #62	OS-062	OS	шт.	45000.00	f	ОС-062	2025-07-01	60	\N	\N	\N	8	\N	14
78	2026-07-01 07:46:43.891845+00	2026-07-14 04:18:20.353961+00	Кресло офисное #63	OS-063	OS	шт.	45000.00	f	ОС-063	2025-07-01	60	\N	\N	\N	8	\N	14
79	2026-07-01 07:46:43.892471+00	2026-07-14 04:18:20.354696+00	Кресло офисное #64	OS-064	OS	шт.	45000.00	f	ОС-064	2025-07-01	60	\N	\N	\N	8	\N	14
80	2026-07-01 07:46:43.893113+00	2026-07-14 04:18:20.355363+00	Кресло офисное #65	OS-065	OS	шт.	45000.00	f	ОС-065	2025-07-01	60	\N	\N	\N	8	\N	14
81	2026-07-01 07:46:43.893731+00	2026-07-14 04:18:20.356032+00	Кресло офисное #66	OS-066	OS	шт.	45000.00	f	ОС-066	2025-07-01	60	\N	\N	\N	8	\N	14
82	2026-07-01 07:46:43.894343+00	2026-07-14 04:18:20.357106+00	Кресло офисное #67	OS-067	OS	шт.	45000.00	f	ОС-067	2025-07-01	60	\N	\N	\N	8	\N	14
83	2026-07-01 07:46:43.894953+00	2026-07-14 04:18:20.358043+00	Кресло офисное #68	OS-068	OS	шт.	45000.00	f	ОС-068	2025-07-01	60	\N	\N	\N	8	\N	14
84	2026-07-01 07:46:43.895535+00	2026-07-14 04:18:20.359127+00	Кресло офисное #69	OS-069	OS	шт.	45000.00	f	ОС-069	2025-07-01	60	\N	\N	\N	8	\N	14
85	2026-07-01 07:46:43.896103+00	2026-07-14 04:18:20.359979+00	Кресло офисное #70	OS-070	OS	шт.	45000.00	f	ОС-070	2025-07-01	60	\N	\N	\N	8	\N	14
86	2026-07-01 07:46:43.896763+00	2026-07-14 04:18:20.360614+00	Кресло офисное #71	OS-071	OS	шт.	45000.00	f	ОС-071	2025-07-01	60	\N	\N	\N	8	\N	14
87	2026-07-01 07:46:43.897958+00	2026-07-14 04:18:20.36125+00	Кресло офисное #72	OS-072	OS	шт.	45000.00	f	ОС-072	2025-07-01	60	\N	\N	\N	8	\N	14
88	2026-07-01 07:46:43.898837+00	2026-07-14 04:18:20.362323+00	Кресло офисное #73	OS-073	OS	шт.	45000.00	f	ОС-073	2025-07-01	60	\N	\N	\N	8	\N	14
89	2026-07-01 07:46:43.899551+00	2026-07-14 04:18:20.363081+00	Кресло офисное #74	OS-074	OS	шт.	45000.00	f	ОС-074	2025-07-01	60	\N	\N	\N	8	\N	14
90	2026-07-01 07:46:43.900368+00	2026-07-14 04:18:20.363842+00	Кресло офисное #75	OS-075	OS	шт.	45000.00	f	ОС-075	2025-07-01	60	\N	\N	\N	8	\N	14
91	2026-07-01 07:46:43.901083+00	2026-07-14 04:18:20.364548+00	Кресло офисное #76	OS-076	OS	шт.	45000.00	f	ОС-076	2025-07-01	60	\N	\N	\N	8	\N	14
92	2026-07-01 07:46:43.901843+00	2026-07-14 04:18:20.365251+00	Кресло офисное #77	OS-077	OS	шт.	45000.00	f	ОС-077	2025-07-01	60	\N	\N	\N	8	\N	14
93	2026-07-01 07:46:43.902486+00	2026-07-14 04:18:20.365872+00	Кресло офисное #78	OS-078	OS	шт.	45000.00	f	ОС-078	2025-07-01	60	\N	\N	\N	8	\N	14
94	2026-07-01 07:46:43.903108+00	2026-07-14 04:18:20.366499+00	Кресло офисное #79	OS-079	OS	шт.	45000.00	f	ОС-079	2025-07-01	60	\N	\N	\N	8	\N	14
95	2026-07-01 07:46:43.904009+00	2026-07-14 04:18:20.367206+00	Кресло офисное #80	OS-080	OS	шт.	45000.00	f	ОС-080	2025-07-01	60	\N	\N	\N	8	\N	14
5	2026-07-01 07:46:43.839425+00	2026-07-14 04:18:20.367917+00	Маркер перманентный	TMZ-005	TMZ	шт.	450.00	f	\N	\N	\N	\N	\N	\N	1	\N	14
31	2026-07-01 07:46:43.858599+00	2026-07-14 04:18:20.36862+00	Монитор LG 24" #16	OS-016	OS	шт.	95000.00	f	ОС-016	2025-07-01	60	\N	\N	\N	6	\N	14
32	2026-07-01 07:46:43.859364+00	2026-07-14 04:18:20.369342+00	Монитор LG 24" #17	OS-017	OS	шт.	95000.00	f	ОС-017	2025-07-01	60	\N	\N	\N	6	\N	14
33	2026-07-01 07:46:43.859999+00	2026-07-14 04:18:20.370032+00	Монитор LG 24" #18	OS-018	OS	шт.	95000.00	f	ОС-018	2025-07-01	60	\N	\N	\N	6	\N	14
34	2026-07-01 07:46:43.860594+00	2026-07-14 04:18:20.370673+00	Монитор LG 24" #19	OS-019	OS	шт.	95000.00	f	ОС-019	2025-07-01	60	\N	\N	\N	6	\N	14
35	2026-07-01 07:46:43.861189+00	2026-07-14 04:18:20.37134+00	Монитор LG 24" #20	OS-020	OS	шт.	95000.00	f	ОС-020	2025-07-01	60	\N	\N	\N	6	\N	14
36	2026-07-01 07:46:43.8618+00	2026-07-14 04:18:20.371998+00	Монитор LG 24" #21	OS-021	OS	шт.	95000.00	f	ОС-021	2025-07-01	60	\N	\N	\N	6	\N	14
37	2026-07-01 07:46:43.862478+00	2026-07-14 04:18:20.372631+00	Монитор LG 24" #22	OS-022	OS	шт.	95000.00	f	ОС-022	2025-07-01	60	\N	\N	\N	6	\N	14
38	2026-07-01 07:46:43.863119+00	2026-07-14 04:18:20.373313+00	Монитор LG 24" #23	OS-023	OS	шт.	95000.00	f	ОС-023	2025-07-01	60	\N	\N	\N	6	\N	14
39	2026-07-01 07:46:43.863729+00	2026-07-14 04:18:20.374004+00	Монитор LG 24" #24	OS-024	OS	шт.	95000.00	f	ОС-024	2025-07-01	60	\N	\N	\N	6	\N	14
40	2026-07-01 07:46:43.864658+00	2026-07-14 04:18:20.374724+00	Монитор LG 24" #25	OS-025	OS	шт.	95000.00	f	ОС-025	2025-07-01	60	\N	\N	\N	6	\N	14
12	2026-07-01 07:46:43.844773+00	2026-07-14 04:18:20.37542+00	Моющее средство для пола	TMZ-012	TMZ	л	350.00	f	\N	\N	\N	\N	\N	\N	2	\N	5
41	2026-07-01 07:46:43.865487+00	2026-07-14 04:18:20.376051+00	МФУ HP LaserJet Pro #26	OS-026	OS	шт.	185000.00	f	ОС-026	2025-07-01	84	\N	\N	\N	7	\N	14
42	2026-07-01 07:46:43.866157+00	2026-07-14 04:18:20.376671+00	МФУ HP LaserJet Pro #27	OS-027	OS	шт.	185000.00	f	ОС-027	2025-07-01	84	\N	\N	\N	7	\N	14
43	2026-07-01 07:46:43.866818+00	2026-07-14 04:18:20.377318+00	МФУ HP LaserJet Pro #28	OS-028	OS	шт.	185000.00	f	ОС-028	2025-07-01	84	\N	\N	\N	7	\N	14
44	2026-07-01 07:46:43.867434+00	2026-07-14 04:18:20.378107+00	МФУ HP LaserJet Pro #29	OS-029	OS	шт.	185000.00	f	ОС-029	2025-07-01	84	\N	\N	\N	7	\N	14
45	2026-07-01 07:46:43.86799+00	2026-07-14 04:18:20.378823+00	МФУ HP LaserJet Pro #30	OS-030	OS	шт.	185000.00	f	ОС-030	2025-07-01	84	\N	\N	\N	7	\N	14
16	2026-07-01 07:46:43.848041+00	2026-07-14 04:18:20.380091+00	Ноутбук Dell Latitude 5540 #1	OS-001	OS	шт.	450000.00	f	ОС-001	2025-07-01	60	\N	\N	\N	6	\N	14
25	2026-07-01 07:46:43.854135+00	2026-07-14 04:18:20.380902+00	Ноутбук Dell Latitude 5540 #10	OS-010	OS	шт.	450000.00	f	ОС-010	2025-07-01	60	\N	\N	\N	6	\N	14
26	2026-07-01 07:46:43.854938+00	2026-07-14 04:18:20.38174+00	Ноутбук Dell Latitude 5540 #11	OS-011	OS	шт.	450000.00	f	ОС-011	2025-07-01	60	\N	\N	\N	6	\N	14
27	2026-07-01 07:46:43.855576+00	2026-07-14 04:18:20.382408+00	Ноутбук Dell Latitude 5540 #12	OS-012	OS	шт.	450000.00	f	ОС-012	2025-07-01	60	\N	\N	\N	6	\N	14
28	2026-07-01 07:46:43.856223+00	2026-07-14 04:18:20.383031+00	Ноутбук Dell Latitude 5540 #13	OS-013	OS	шт.	450000.00	f	ОС-013	2025-07-01	60	\N	\N	\N	6	\N	14
29	2026-07-01 07:46:43.857283+00	2026-07-14 04:18:20.383738+00	Ноутбук Dell Latitude 5540 #14	OS-014	OS	шт.	450000.00	f	ОС-014	2025-07-01	60	\N	\N	\N	6	\N	14
30	2026-07-01 07:46:43.857949+00	2026-07-14 04:18:20.384502+00	Ноутбук Dell Latitude 5540 #15	OS-015	OS	шт.	450000.00	f	ОС-015	2025-07-01	60	\N	\N	\N	6	\N	14
17	2026-07-01 07:46:43.848852+00	2026-07-14 04:18:20.385152+00	Ноутбук Dell Latitude 5540 #2	OS-002	OS	шт.	450000.00	f	ОС-002	2025-07-01	60	\N	\N	\N	6	\N	14
18	2026-07-01 07:46:43.849502+00	2026-07-14 04:18:20.385756+00	Ноутбук Dell Latitude 5540 #3	OS-003	OS	шт.	450000.00	f	ОС-003	2025-07-01	60	\N	\N	\N	6	\N	14
19	2026-07-01 07:46:43.850134+00	2026-07-14 04:18:20.3864+00	Ноутбук Dell Latitude 5540 #4	OS-004	OS	шт.	450000.00	f	ОС-004	2025-07-01	60	\N	\N	\N	6	\N	14
20	2026-07-01 07:46:43.850754+00	2026-07-14 04:18:20.387084+00	Ноутбук Dell Latitude 5540 #5	OS-005	OS	шт.	450000.00	f	ОС-005	2025-07-01	60	\N	\N	\N	6	\N	14
21	2026-07-01 07:46:43.851388+00	2026-07-14 04:18:20.38776+00	Ноутбук Dell Latitude 5540 #6	OS-006	OS	шт.	450000.00	f	ОС-006	2025-07-01	60	\N	\N	\N	6	\N	14
22	2026-07-01 07:46:43.852007+00	2026-07-14 04:18:20.388349+00	Ноутбук Dell Latitude 5540 #7	OS-007	OS	шт.	450000.00	f	ОС-007	2025-07-01	60	\N	\N	\N	6	\N	14
23	2026-07-01 07:46:43.852605+00	2026-07-14 04:18:20.388997+00	Ноутбук Dell Latitude 5540 #8	OS-008	OS	шт.	450000.00	f	ОС-008	2025-07-01	60	\N	\N	\N	6	\N	14
24	2026-07-01 07:46:43.853373+00	2026-07-14 04:18:20.389643+00	Ноутбук Dell Latitude 5540 #9	OS-009	OS	шт.	450000.00	f	ОС-009	2025-07-01	60	\N	\N	\N	6	\N	14
4	2026-07-01 07:46:43.838816+00	2026-07-14 04:18:20.390346+00	Папка-регистратор А4	TMZ-004	TMZ	шт.	800.00	f	\N	\N	\N	\N	\N	\N	1	\N	14
46	2026-07-01 07:46:43.868559+00	2026-07-14 04:18:20.391037+00	Рабочий стол офисный #31	OS-031	OS	шт.	65000.00	f	ОС-031	2025-07-01	120	\N	\N	\N	8	\N	14
47	2026-07-01 07:46:43.869148+00	2026-07-14 04:18:20.391632+00	Рабочий стол офисный #32	OS-032	OS	шт.	65000.00	f	ОС-032	2025-07-01	120	\N	\N	\N	8	\N	14
48	2026-07-01 07:46:43.869736+00	2026-07-14 04:18:20.392362+00	Рабочий стол офисный #33	OS-033	OS	шт.	65000.00	f	ОС-033	2025-07-01	120	\N	\N	\N	8	\N	14
49	2026-07-01 07:46:43.870395+00	2026-07-14 04:18:20.393076+00	Рабочий стол офисный #34	OS-034	OS	шт.	65000.00	f	ОС-034	2025-07-01	120	\N	\N	\N	8	\N	14
50	2026-07-01 07:46:43.871025+00	2026-07-14 04:18:20.393814+00	Рабочий стол офисный #35	OS-035	OS	шт.	65000.00	f	ОС-035	2025-07-01	120	\N	\N	\N	8	\N	14
51	2026-07-01 07:46:43.871628+00	2026-07-14 04:18:20.394477+00	Рабочий стол офисный #36	OS-036	OS	шт.	65000.00	f	ОС-036	2025-07-01	120	\N	\N	\N	8	\N	14
52	2026-07-01 07:46:43.872873+00	2026-07-14 04:18:20.395133+00	Рабочий стол офисный #37	OS-037	OS	шт.	65000.00	f	ОС-037	2025-07-01	120	\N	\N	\N	8	\N	14
53	2026-07-01 07:46:43.874211+00	2026-07-14 04:18:20.395798+00	Рабочий стол офисный #38	OS-038	OS	шт.	65000.00	f	ОС-038	2025-07-01	120	\N	\N	\N	8	\N	14
54	2026-07-01 07:46:43.875341+00	2026-07-14 04:18:20.396494+00	Рабочий стол офисный #39	OS-039	OS	шт.	65000.00	f	ОС-039	2025-07-01	120	\N	\N	\N	8	\N	14
55	2026-07-01 07:46:43.876319+00	2026-07-14 04:18:20.397147+00	Рабочий стол офисный #40	OS-040	OS	шт.	65000.00	f	ОС-040	2025-07-01	120	\N	\N	\N	8	\N	14
56	2026-07-01 07:46:43.877174+00	2026-07-14 04:18:20.397778+00	Рабочий стол офисный #41	OS-041	OS	шт.	65000.00	f	ОС-041	2025-07-01	120	\N	\N	\N	8	\N	14
57	2026-07-01 07:46:43.877877+00	2026-07-14 04:18:20.398597+00	Рабочий стол офисный #42	OS-042	OS	шт.	65000.00	f	ОС-042	2025-07-01	120	\N	\N	\N	8	\N	14
58	2026-07-01 07:46:43.878739+00	2026-07-14 04:18:20.399524+00	Рабочий стол офисный #43	OS-043	OS	шт.	65000.00	f	ОС-043	2025-07-01	120	\N	\N	\N	8	\N	14
59	2026-07-01 07:46:43.879398+00	2026-07-14 04:18:20.400183+00	Рабочий стол офисный #44	OS-044	OS	шт.	65000.00	f	ОС-044	2025-07-01	120	\N	\N	\N	8	\N	14
60	2026-07-01 07:46:43.879976+00	2026-07-14 04:18:20.400797+00	Рабочий стол офисный #45	OS-045	OS	шт.	65000.00	f	ОС-045	2025-07-01	120	\N	\N	\N	8	\N	14
61	2026-07-01 07:46:43.880631+00	2026-07-14 04:18:20.401432+00	Рабочий стол офисный #46	OS-046	OS	шт.	65000.00	f	ОС-046	2025-07-01	120	\N	\N	\N	8	\N	14
62	2026-07-01 07:46:43.88138+00	2026-07-14 04:18:20.40214+00	Рабочий стол офисный #47	OS-047	OS	шт.	65000.00	f	ОС-047	2025-07-01	120	\N	\N	\N	8	\N	14
63	2026-07-01 07:46:43.882049+00	2026-07-14 04:18:20.402817+00	Рабочий стол офисный #48	OS-048	OS	шт.	65000.00	f	ОС-048	2025-07-01	120	\N	\N	\N	8	\N	14
64	2026-07-01 07:46:43.882647+00	2026-07-14 04:18:20.403491+00	Рабочий стол офисный #49	OS-049	OS	шт.	65000.00	f	ОС-049	2025-07-01	120	\N	\N	\N	8	\N	14
65	2026-07-01 07:46:43.883264+00	2026-07-14 04:18:20.404155+00	Рабочий стол офисный #50	OS-050	OS	шт.	65000.00	f	ОС-050	2025-07-01	120	\N	\N	\N	8	\N	14
2	2026-07-01 07:46:43.837591+00	2026-07-14 04:18:20.404824+00	Ручка шариковая синяя	TMZ-002	TMZ	шт.	150.00	f	\N	\N	\N	\N	\N	\N	1	\N	14
15	2026-07-01 07:46:43.847053+00	2026-07-14 04:18:20.405426+00	Сахар	TMZ-015	TMZ	кг	400.00	f	\N	\N	\N	\N	\N	\N	5	\N	4
106	2026-07-01 07:46:43.911732+00	2026-07-14 04:18:20.406057+00	Сейф офисный #91	OS-091	OS	шт.	120000.00	f	ОС-091	2025-07-01	120	\N	\N	\N	8	\N	14
107	2026-07-01 07:46:43.912401+00	2026-07-14 04:18:20.406872+00	Сейф офисный #92	OS-092	OS	шт.	120000.00	f	ОС-092	2025-07-01	120	\N	\N	\N	8	\N	14
108	2026-07-01 07:46:43.913013+00	2026-07-14 04:18:20.407529+00	Сейф офисный #93	OS-093	OS	шт.	120000.00	f	ОС-093	2025-07-01	120	\N	\N	\N	8	\N	14
109	2026-07-01 07:46:43.913636+00	2026-07-14 04:18:20.408146+00	Сейф офисный #94	OS-094	OS	шт.	120000.00	f	ОС-094	2025-07-01	120	\N	\N	\N	8	\N	14
110	2026-07-01 07:46:43.914206+00	2026-07-14 04:18:20.408749+00	Сейф офисный #95	OS-095	OS	шт.	120000.00	f	ОС-095	2025-07-01	120	\N	\N	\N	8	\N	14
7	2026-07-01 07:46:43.840834+00	2026-07-14 04:18:20.410321+00	Скобы для степлера №24/6	TMZ-007	TMZ	коробка	200.00	f	\N	\N	\N	\N	\N	\N	1	\N	15
3	2026-07-01 07:46:43.838207+00	2026-07-14 04:18:20.411078+00	Скрепки 100 шт.	TMZ-003	TMZ	коробка	300.00	f	\N	\N	\N	\N	\N	\N	1	\N	15
6	2026-07-01 07:46:43.839984+00	2026-07-14 04:18:20.411792+00	Степлер офисный	TMZ-006	TMZ	шт.	1500.00	f	\N	\N	\N	\N	\N	\N	1	\N	14
124	2026-07-01 07:46:43.923508+00	2026-07-14 04:18:20.412458+00	СЭД eDOC	NMA-009	NMA	лицензия	200000.00	f	НМА-009	2026-01-02	36	\N	\N	\N	11	\N	10
96	2026-07-01 07:46:43.904705+00	2026-07-14 04:18:20.413022+00	Телефонный аппарат #81	OS-081	OS	шт.	15000.00	f	ОС-081	2025-07-01	60	\N	\N	\N	9	\N	14
97	2026-07-01 07:46:43.905629+00	2026-07-14 04:18:20.413813+00	Телефонный аппарат #82	OS-082	OS	шт.	15000.00	f	ОС-082	2025-07-01	60	\N	\N	\N	9	\N	14
98	2026-07-01 07:46:43.906504+00	2026-07-14 04:18:20.414417+00	Телефонный аппарат #83	OS-083	OS	шт.	15000.00	f	ОС-083	2025-07-01	60	\N	\N	\N	9	\N	14
99	2026-07-01 07:46:43.907222+00	2026-07-14 04:18:20.415024+00	Телефонный аппарат #84	OS-084	OS	шт.	15000.00	f	ОС-084	2025-07-01	60	\N	\N	\N	9	\N	14
100	2026-07-01 07:46:43.907955+00	2026-07-14 04:18:20.41571+00	Телефонный аппарат #85	OS-085	OS	шт.	15000.00	f	ОС-085	2025-07-01	60	\N	\N	\N	9	\N	14
101	2026-07-01 07:46:43.908571+00	2026-07-14 04:18:20.416299+00	Телефонный аппарат #86	OS-086	OS	шт.	15000.00	f	ОС-086	2025-07-01	60	\N	\N	\N	9	\N	14
102	2026-07-01 07:46:43.909185+00	2026-07-14 04:18:20.416861+00	Телефонный аппарат #87	OS-087	OS	шт.	15000.00	f	ОС-087	2025-07-01	60	\N	\N	\N	9	\N	14
103	2026-07-01 07:46:43.909778+00	2026-07-14 04:18:20.417544+00	Телефонный аппарат #88	OS-088	OS	шт.	15000.00	f	ОС-088	2025-07-01	60	\N	\N	\N	9	\N	14
104	2026-07-01 07:46:43.910439+00	2026-07-14 04:18:20.418561+00	Телефонный аппарат #89	OS-089	OS	шт.	15000.00	f	ОС-089	2025-07-01	60	\N	\N	\N	9	\N	14
105	2026-07-01 07:46:43.911069+00	2026-07-14 04:18:20.419232+00	Телефонный аппарат #90	OS-090	OS	шт.	15000.00	f	ОС-090	2025-07-01	60	\N	\N	\N	9	\N	14
9	2026-07-01 07:46:43.842534+00	2026-07-14 04:18:20.41986+00	Тонер для принтера Samsung	TMZ-009	TMZ	шт.	8900.00	f	\N	\N	\N	\N	\N	\N	3	\N	14
111	2026-07-01 07:46:43.914974+00	2026-07-14 04:18:20.420526+00	Холодильник офисный #96	OS-096	OS	шт.	95000.00	f	ОС-096	2025-07-01	84	\N	\N	\N	7	\N	14
112	2026-07-01 07:46:43.915624+00	2026-07-14 04:18:20.421297+00	Холодильник офисный #97	OS-097	OS	шт.	95000.00	f	ОС-097	2025-07-01	84	\N	\N	\N	7	\N	14
113	2026-07-01 07:46:43.916196+00	2026-07-14 04:18:20.42232+00	Холодильник офисный #98	OS-098	OS	шт.	95000.00	f	ОС-098	2025-07-01	84	\N	\N	\N	7	\N	14
13	2026-07-01 07:46:43.845652+00	2026-07-14 04:18:20.424047+00	Чай пакетированный	TMZ-013	TMZ	уп. 100 пак.	1800.00	f	\N	\N	\N	\N	\N	\N	5	\N	16
10	2026-07-01 07:46:43.843282+00	2026-07-14 04:18:20.425736+00	Чистящие салфетки для экрана	TMZ-010	TMZ	уп. 100 шт.	600.00	f	\N	\N	\N	\N	\N	\N	2	\N	17
\.


--
-- Data for Name: references_assetcategory; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_assetcategory (id, name, code, asset_type, parent_id) FROM stdin;
1	Канцелярские товары	TMZ_CANC	TMZ	\N
2	Хозяйственные товары	TMZ_HOZ	TMZ	\N
3	Расходные материалы для оргтехники	TMZ_RASH	TMZ	\N
4	Представительские товары	TMZ_PRED	TMZ	\N
5	Продукты питания	TMZ_FOOD	TMZ	\N
6	Компьютерная техника	OS_COMP	OS	\N
7	Оргтехника	OS_ORG	OS	\N
8	Мебель офисная	OS_MEBL	OS	\N
9	Средства связи	OS_SVYAZ	OS	\N
10	Транспортные средства	OS_TRANS	OS	\N
11	Программное обеспечение	NMA_SOFT	NMA	\N
12	Лицензии	NMA_LIC	NMA	\N
13	Базы данных	NMA_DB	NMA	\N
14	Загружено из Excel (TMZ)	UPLOAD_TMZ	TMZ	\N
\.


--
-- Data for Name: references_contract; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_contract (id, created_at, updated_at, name, contract_date, valid_until, pdf_file, counterparty_id) FROM stdin;
1	2026-07-14 07:40:16.667111+00	2026-07-14 07:40:16.667125+00	123	2026-06-01	2026-07-14	contracts/pdfs/p2300000349.03-05-2023.rus.pdf	3
\.


--
-- Data for Name: references_counterparty; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_counterparty (id, created_at, updated_at, name, bin, address, contact_person, phone, email, is_active) FROM stdin;
1	2026-07-01 07:46:43.819215+00	2026-07-01 07:46:43.819228+00	ТОО «Офис Маркет»	070140012345	г. Алматы, ул. Абая 15	Иванов И.И.	+7 727 123 4567	office@officemarket.kz	t
2	2026-07-01 07:46:43.82002+00	2026-07-01 07:46:43.820025+00	ТОО «ТехноСклад»	080240023456	г. Алматы, пр. Достык 85	Петров П.П.	+7 727 234 5678	info@tehnosklad.kz	t
3	2026-07-01 07:46:43.82062+00	2026-07-01 07:46:43.820625+00	АО «КазМебель»	050340034567	г. Астана, ул. Кунаева 10	Сидоров С.С.	+7 717 345 6789	sales@kazmebel.kz	t
4	2026-07-01 07:46:43.821122+00	2026-07-01 07:46:43.821126+00	ТОО «СофтПро»	100440045678	г. Алматы, ул. Тимирязева 42	Ким А.В.	+7 727 456 7890	sales@softpro.kz	t
5	2026-07-01 07:46:43.821615+00	2026-07-01 07:46:43.821619+00	ТОО «Хозснаб»	090540056789	г. Алматы, ул. Толе Би 59	Нуржанов К.Б.	+7 727 567 8901	info@hozsnab.kz	t
6	2026-07-01 07:46:43.822114+00	2026-07-01 07:46:43.822118+00	ИП Сейткали	750640067890	г. Алматы, ул. Жандосова 15	Сейткали Б.М.	+7 777 678 9012	seitkali@mail.kz	t
7	2026-07-01 07:46:43.822612+00	2026-07-01 07:46:43.822615+00	ТОО «Принт-Сервис»	110740078901	г. Алматы, ул. Гагарина 74	Ли В.С.	+7 727 789 0123	print@printservice.kz	t
8	2026-07-01 07:46:43.823324+00	2026-07-01 07:46:43.823329+00	ТОО «МебельПлюс»	120840089012	г. Астана, пр. Республики 21	Токаев Н.К.	+7 717 890 1234	info@mebelplus.kz	t
9	2026-07-01 07:46:43.82386+00	2026-07-01 07:46:43.823864+00	ТОО «АйТиСолюшнс»	130940090123	г. Алматы, пр. Аль-Фараби 77	Жумагалиев Д.А.	+7 727 901 2345	sales@itsolutions.kz	t
10	2026-07-01 07:46:43.824352+00	2026-07-01 07:46:43.824356+00	ТОО «КлинСервис»	141040001234	г. Алматы, ул. Байтурсынова 3	Омарова Г.Н.	+7 727 012 3456	info@cleanservice.kz	t
\.


--
-- Data for Name: references_limitnorm; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_limitnorm (id, created_at, updated_at, asset_type, category, quantity_limit, period, valid_from, valid_to, created_by_id, department_id) FROM stdin;
1	2026-07-01 07:46:43.930567+00	2026-07-01 07:46:43.930575+00	TMZ	Бумага А4	5.00	MONTHLY	2026-01-01	2026-12-31	1	\N
2	2026-07-01 07:46:43.931648+00	2026-07-01 07:46:43.931653+00	TMZ	Ручка шариковая	2.00	QUARTERLY	2026-01-01	2026-12-31	1	\N
3	2026-07-01 07:46:43.932635+00	2026-07-01 07:46:43.93264+00	TMZ	Картридж HP LaserJet	1.00	QUARTERLY	2026-01-01	2026-12-31	1	\N
4	2026-07-01 07:46:43.933349+00	2026-07-01 07:46:43.933354+00	TMZ	Чай пакетированный	2.00	MONTHLY	2026-01-01	2026-12-31	1	1
5	2026-07-01 07:46:43.934001+00	2026-07-01 07:46:43.934006+00	TMZ	Кофе растворимый	1.00	MONTHLY	2026-01-01	2026-12-31	1	1
\.


--
-- Data for Name: references_position; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_position (id, created_at, updated_at, name, code, is_active) FROM stdin;
1	2026-07-14 04:18:20.626983+00	2026-07-14 04:18:20.626989+00	Системный администратор	POS-0001	t
2	2026-07-14 04:18:20.628545+00	2026-07-14 04:18:20.62855+00	Руководитель АХС	POS-0002	t
3	2026-07-14 04:18:20.630094+00	2026-07-14 04:18:20.6301+00	Специалист АХС	POS-0003	t
4	2026-07-14 04:18:20.631553+00	2026-07-14 04:18:20.631558+00	МОЛ по складу	POS-0004	t
5	2026-07-14 04:18:20.632953+00	2026-07-14 04:18:20.632958+00	МОЛ по НМА	POS-0005	t
6	2026-07-14 04:18:20.634268+00	2026-07-14 04:18:20.634273+00	Руководитель ФО	POS-0006	t
7	2026-07-14 04:18:20.635544+00	2026-07-14 04:18:20.635549+00	Директор ДИТ	POS-0007	t
8	2026-07-14 04:18:20.636803+00	2026-07-14 04:18:20.636808+00	Директор ЮД	POS-0008	t
9	2026-07-14 04:18:20.638001+00	2026-07-14 04:18:20.638005+00	Директор ИРД	POS-0009	t
10	2026-07-14 04:18:20.639272+00	2026-07-14 04:18:20.639277+00	Ведущий разработчик	POS-0010	t
12	2026-07-14 04:18:20.641864+00	2026-07-14 04:18:20.641869+00	Юрист	POS-0012	t
13	2026-07-14 04:18:20.64312+00	2026-07-14 04:18:20.643125+00	Специалист СБ	POS-0013	t
14	2026-07-14 04:18:20.644981+00	2026-07-14 04:18:20.644986+00	Член Рабочей комиссии	POS-0014	t
15	2026-07-14 04:18:20.646248+00	2026-07-14 04:18:20.646254+00	Специалист ИРД	POS-0015	t
11	2026-07-14 04:18:20.640571+00	2026-07-14 08:11:13.405274+00	Бухгалтер	POS-0011	t
\.


--
-- Data for Name: references_requesttype; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_requesttype (id, name, code, asset_type, description, is_active, requires_long_term_use) FROM stdin;
1	Выдача ТМЗ со склада	TMZ_ISSUE	TMZ	Заявка на выдачу товарно-материальных запасов со склада	t	f
2	Выдача ТМЗ (представительские)	TMZ_REPRESENTATIVE	REPRESENTATIVE_TMZ	Заявка на выдачу представительских ТМЗ	t	f
3	Выдача ОС со склада	OS_ISSUE	OS	Заявка на выдачу основных средств со склада	t	f
4	Перемещение ОС	OS_TRANSFER	OS	Заявка на перемещение ОС между сотрудниками	t	f
5	Выдача ОС новому работнику	OS_NEW_EMPLOYEE	OS	Заявка на выдачу ОС новому сотруднику при трудоустройстве	t	f
6	Перемещение ОС увольняющегося	OS_DISMISSAL	OS	Заявка на перемещение ОС увольняющегося сотрудника	t	f
7	Выдача НМА со склада	NMA_ISSUE	NMA	Заявка на выдачу нематериальных активов	t	f
8	Изменение пользователя НМА	NMA_CHANGE_USER	NMA	Заявка на смену пользователя НМА	t	f
9	1	123	TMZ		t	f
10	1	1234567	TMZ		t	f
\.


--
-- Data for Name: references_unitofmeasure; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_unitofmeasure (id, created_at, updated_at, name, code, is_active) FROM stdin;
1	2026-07-14 04:18:20.309281+00	2026-07-14 04:18:20.309291+00	шт	UOM-0001	t
2	2026-07-14 04:18:20.312761+00	2026-07-14 04:18:20.312768+00	комплект	UOM-0002	t
3	2026-07-14 04:18:20.314572+00	2026-07-14 04:18:20.314577+00	упаковка	UOM-0003	t
4	2026-07-14 04:18:20.315915+00	2026-07-14 04:18:20.315922+00	кг	UOM-0004	t
5	2026-07-14 04:18:20.317252+00	2026-07-14 04:18:20.317257+00	л	UOM-0005	t
6	2026-07-14 04:18:20.318706+00	2026-07-14 04:18:20.318711+00	м	UOM-0006	t
7	2026-07-14 04:18:20.320135+00	2026-07-14 04:18:20.32014+00	м2	UOM-0007	t
8	2026-07-14 04:18:20.32171+00	2026-07-14 04:18:20.321716+00	м3	UOM-0008	t
9	2026-07-14 04:18:20.322968+00	2026-07-14 04:18:20.322974+00	рулон	UOM-0009	t
10	2026-07-14 04:18:20.326679+00	2026-07-14 04:18:20.326685+00	лицензия	UOM-0010	t
12	2026-07-14 04:18:20.337013+00	2026-07-14 04:18:20.337031+00	годовая подписка	UOM-0012	t
13	2026-07-14 04:18:20.338611+00	2026-07-14 04:18:20.338617+00	пачка	UOM-0013	t
14	2026-07-14 04:18:20.340142+00	2026-07-14 04:18:20.340147+00	шт.	UOM-0014	t
15	2026-07-14 04:18:20.410052+00	2026-07-14 04:18:20.410058+00	коробка	UOM-0015	t
16	2026-07-14 04:18:20.423826+00	2026-07-14 04:18:20.423831+00	уп. 100 пак.	UOM-0016	t
17	2026-07-14 04:18:20.425533+00	2026-07-14 04:18:20.425538+00	уп. 100 шт.	UOM-0017	t
11	2026-07-14 04:18:20.332114+00	2026-07-14 04:26:50.215333+00	??&.	UOM-0011	t
18	2026-07-14 08:10:50.602596+00	2026-07-14 08:10:50.602611+00	литр	UOM-0018	t
\.


--
-- Data for Name: references_warehouse; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.references_warehouse (id, created_at, updated_at, name, code, address, is_active, department_id) FROM stdin;
1	2026-07-14 04:18:20.487418+00	2026-07-14 04:18:20.487425+00	Основной склад	WH-0001		t	\N
2	2026-07-14 04:18:20.489063+00	2026-07-14 04:18:20.48907+00	Склад ТМЗ	WH-0002		t	\N
3	2026-07-14 04:18:20.490519+00	2026-07-14 04:18:20.490525+00	Склад ОС	WH-0003		t	\N
4	2026-07-14 04:18:20.491893+00	2026-07-14 04:18:20.491898+00	Склад НМА	WH-0004		t	\N
5	2026-07-14 04:18:20.493532+00	2026-07-14 04:18:20.493537+00	Серверное хранилище	WH-0005		t	\N
6	2026-07-14 04:18:20.590283+00	2026-07-14 04:18:20.590289+00	Smoke warehouse	WH-0006		t	\N
\.


--
-- Data for Name: requests_approvalstep; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.requests_approvalstep (id, "order", approver_role, title, requires_supervisor, is_active, request_type_id) FROM stdin;
\.


--
-- Data for Name: requests_assetrequest; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.requests_assetrequest (id, created_at, updated_at, number, status, reason, from_user_id, initiator_id, request_type_id, to_user_id, deletion_requested_at, deletion_requested_by_id) FROM stdin;
6	2026-07-13 06:47:27.227279+00	2026-07-13 06:47:27.227293+00	002/2026	DRAFT		\N	1	10	\N	\N	\N
7	2026-07-13 06:52:47.787206+00	2026-07-13 07:17:56.12823+00	003/2026	EXECUTED		\N	1	9	\N	\N	\N
2	2026-07-02 10:56:04.138121+00	2026-07-13 07:47:12.463224+00	001/2026	REJECTED		\N	1	1	\N	\N	\N
8	2026-07-13 07:47:36.490605+00	2026-07-13 07:54:13.597629+00	004/2026	EXECUTED	123	\N	1	9	\N	\N	\N
9	2026-07-14 08:32:16.861697+00	2026-07-14 08:32:30.429661+00	005/2026	DRAFT		\N	14	9	\N	\N	\N
13	2026-07-14 09:00:29.895+00	2026-07-14 09:00:52.29414+00	006/2026	DRAFT		\N	14	10	\N	\N	\N
20	2026-07-15 12:16:38.463+00	2026-07-15 12:16:55.029269+00	007/2026	EXECUTED		\N	1	10	\N	\N	\N
\.


--
-- Data for Name: requests_assetrequest_issue_responsibles; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.requests_assetrequest_issue_responsibles (id, assetrequest_id, user_id) FROM stdin;
1	7	4
2	8	4
3	20	3
\.


--
-- Data for Name: requests_assetrequestitem; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.requests_assetrequestitem (id, quantity_requested, quantity_issued, comment, asset_id, request_id, issued_asset_id, requested_group_id) FROM stdin;
2	3.00	\N		1	2	\N	1
6	1.00	\N		1	6	\N	1
7	1.00	1.00		1	7	1	1
8	1.00	1.00		1	8	1	1
9	2.00	\N		5	9	\N	\N
10	1.00	\N		4	9	\N	\N
11	1.00	\N		3	9	\N	\N
12	1.00	\N		7	9	\N	\N
14	1.00	\N		1	13	\N	1
18	190.00	190.00		1	20	1	1
\.


--
-- Data for Name: requests_requestapproval; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.requests_requestapproval (id, role_at_approval, action, signed_at, comment, created_at, approver_id, request_id) FROM stdin;
1	ADMIN	APPROVED	\N		2026-07-02 10:56:12.207457+00	1	2
4	ADMIN	APPROVED	2026-07-13 05:48:07.072036+00		2026-07-13 05:48:07.072193+00	1	2
5	ADMIN	SUBMITTED	2026-07-13 07:16:29.213528+00		2026-07-13 07:16:29.213664+00	1	7
6	ADMIN	APPROVED	2026-07-13 07:17:11.048554+00		2026-07-13 07:17:11.048677+00	1	7
7	ADMIN	APPROVED	2026-07-13 07:17:25.248353+00		2026-07-13 07:17:25.248464+00	1	7
8	ADMIN	APPROVED	2026-07-13 07:17:38.754947+00		2026-07-13 07:17:38.755127+00	1	7
9	ADMIN	REJECTED	2026-07-13 07:47:12.462394+00	123	2026-07-13 07:47:12.462763+00	1	2
10	ADMIN	SUBMITTED	2026-07-13 07:47:46.407447+00		2026-07-13 07:47:46.407549+00	1	8
11	ADMIN	APPROVED	2026-07-13 07:47:51.782011+00		2026-07-13 07:47:51.782117+00	1	8
12	AHS_HEAD	APPROVED	2026-07-13 07:48:09.626691+00		2026-07-13 07:48:09.62679+00	4	8
13	USER	SUBMITTED	2026-07-14 08:32:26.319231+00		2026-07-14 08:32:26.319345+00	14	9
14	USER	WITHDRAWN	2026-07-14 08:32:30.429147+00		2026-07-14 08:32:30.42925+00	14	9
17	ADMIN	SUBMITTED	2026-07-15 12:16:41.787706+00		2026-07-15 12:16:41.787839+00	1	20
18	ADMIN	APPROVED	2026-07-15 12:16:45.613475+00		2026-07-15 12:16:45.613586+00	1	20
19	ADMIN	APPROVED	2026-07-15 12:16:51.134886+00		2026-07-15 12:16:51.134994+00	1	20
\.


--
-- Data for Name: token_blacklist_blacklistedtoken; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.token_blacklist_blacklistedtoken (id, blacklisted_at, token_id) FROM stdin;
1	2026-07-01 08:00:47.696234+00	5
2	2026-07-01 09:12:23.846048+00	6
6	2026-07-02 04:09:50.19555+00	7
7	2026-07-02 10:33:37.702218+00	19
8	2026-07-13 05:52:06.449929+00	26
9	2026-07-13 06:22:11.557827+00	27
10	2026-07-13 06:44:09.310765+00	28
11	2026-07-13 07:46:55.607163+00	29
13	2026-07-13 07:48:23.30893+00	30
14	2026-07-13 08:47:19.528018+00	31
15	2026-07-13 10:22:54.84013+00	33
18	2026-07-13 14:02:19.61227+00	35
20	2026-07-14 04:58:19.655332+00	36
23	2026-07-14 06:00:19.662764+00	37
24	2026-07-14 08:16:32.210819+00	38
26	2026-07-14 08:30:48.363318+00	32
28	2026-07-14 09:31:33.234825+00	39
30	2026-07-14 10:17:19.710432+00	40
33	2026-07-15 07:43:19.851738+00	41
34	2026-07-15 12:50:19.860927+00	42
36	2026-07-16 05:00:19.958801+00	43
\.


--
-- Data for Name: token_blacklist_outstandingtoken; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.token_blacklist_outstandingtoken (id, token, created_at, expires_at, user_id, jti) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5Njg1MiwiaWF0IjoxNzgyODkyMDUyLCJqdGkiOiI3OGZjMjE5NjFmYTk0NzJlODVhOTVjYmVjZWMwNjU0OCIsInVzZXJfaWQiOjF9._rQntWvvaaLBJYwHbxbXVr-Gl3pLm9GTp3AM8agd-2o	2026-07-01 07:47:32.198612+00	2026-07-08 07:47:32+00	1	78fc21961fa9472e85a95cbecec06548
2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5Njk3OSwiaWF0IjoxNzgyODkyMTc5LCJqdGkiOiI5ZmNiYTc1YzVlMGU0ZmVlOWFiNDA5NGQwNmUyNzNlOCIsInVzZXJfaWQiOjF9.bXPbkz6kP4lMlwM4Me3rOMsiah_jhsUe65TiLuKdbSU	2026-07-01 07:49:39.134208+00	2026-07-08 07:49:39+00	1	9fcba75c5e0e4fee9ab4094d06e273e8
3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5Njk3OSwiaWF0IjoxNzgyODkyMTc5LCJqdGkiOiIwMTkxNGFjZjE4NDk0ODkzYjZlNjAyYTJkYjljMjUzMyIsInVzZXJfaWQiOjF9.jbGnxhR4985EMzjALn9iu1JMcO0QGL7FuXH3I_m-Wpo	2026-07-01 07:49:39.134522+00	2026-07-08 07:49:39+00	1	01914acf18494893b6e602a2db9c2533
4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5Njk5MywiaWF0IjoxNzgyODkyMTkzLCJqdGkiOiIxZmE0Yjk5NDM2ZGE0NDEzOWNiMDlhODIxZjljNTI1NiIsInVzZXJfaWQiOjF9.meLkqPlsKsfKDRZ1JkAa3NWe6OD4rSugG6ddJ96kdLE	2026-07-01 07:49:53.286058+00	2026-07-08 07:49:53+00	1	1fa4b99436da44139cb09a821f9c5256
5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5NzA2MSwiaWF0IjoxNzgyODkyMjYxLCJqdGkiOiI5MWE0YTU5NDNiNWY0NmRhOGIxYzQxNDZjMDRhOTg5MyIsInVzZXJfaWQiOjF9.q4SuRARAIjAA161OVvs7LcOL_QNDG3dgOtwA6ANPnhk	2026-07-01 07:51:01.559291+00	2026-07-08 07:51:01+00	1	91a4a5943b5f46da8b1c4146c04a9893
6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzQ5NzY0OCwiaWF0IjoxNzgyODkyODQ4LCJqdGkiOiI0NzBiYjdjYTM2NjI0MmNkYjdlOTE3ZGI2NmM5M2IyNiIsInVzZXJfaWQiOjF9.MfEX9RK_oR7ukRICxiLue54t-z6TxfhmXXhHrvPCOJA	2026-07-01 08:00:48.87283+00	2026-07-08 08:00:48+00	1	470bb7ca366242cdb7e917db66c93b26
7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMTk0NiwiaWF0IjoxNzgyODk3MTQ2LCJqdGkiOiI5ZTNmMDk0NDUxYzQ0MmYxOTA3Nzc3Mzk1MTNlZmVjNiIsInVzZXJfaWQiOjF9.tBFdbhwQUzT05jZWw4CjcBw7KbOj9rTcYj5_Dc_B8K0	2026-07-01 09:12:26.364093+00	2026-07-08 09:12:26+00	1	9e3f094451c442f190777739513efec6
8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjM5MiwiaWF0IjoxNzgyODk3NTkyLCJqdGkiOiI5ZTFiNmQzZjJkY2U0MjMzOGE2ZTBjOTcwODc0ZmYxZSIsInVzZXJfaWQiOjF9.c-NQl1X_DQBQUp9sf2hYiXJvxGUngw2T3D7cOhrIQZg	2026-07-01 09:19:52.300883+00	2026-07-08 09:19:52+00	1	9e1b6d3f2dce42338a6e0c970874ff1e
9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjM5MiwiaWF0IjoxNzgyODk3NTkyLCJqdGkiOiI0Y2NjNGI4MDQ5MzM0ODRmODM1MTZlNzQyZTM5YWZhNiIsInVzZXJfaWQiOjF9.-3xPt9pIq34IA6c2B9Hty_ogDsU600TqGUOxLIiHOwE	2026-07-01 09:19:52.315384+00	2026-07-08 09:19:52+00	1	4ccc4b804933484f83516e742e39afa6
10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjM5MiwiaWF0IjoxNzgyODk3NTkyLCJqdGkiOiI4YzFkZjgwOTM4OTc0MzZlOGRkNzRhMDZiN2JkZjgwNSIsInVzZXJfaWQiOjF9.chjhiyFnVIp7IQcuytZg5qCLQWH_jaeS_kyAuK5JOVw	2026-07-01 09:19:52.567201+00	2026-07-08 09:19:52+00	1	8c1df8093897436e8dd74a06b7bdf805
11	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjQ2MywiaWF0IjoxNzgyODk3NjYzLCJqdGkiOiJmYTI3Y2I1MjRiNGU0NzNlOWJjNGQwZjM0NWQ0ZWYxYSIsInVzZXJfaWQiOjF9.NjWJaXt7LZjcge5h00_FPFega0ujq343bhO-acMQMKk	2026-07-01 09:21:03.386805+00	2026-07-08 09:21:03+00	1	fa27cb524b4e473e9bc4d0f345d4ef1a
12	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjQ2MywiaWF0IjoxNzgyODk3NjYzLCJqdGkiOiI4NTU2ZjVkZWI1NTc0YjU0YjI5YmViNDg4NjhmYTg3YiIsInVzZXJfaWQiOjF9.bHQqRn_fr80-hEhAPuQOJD1DAx19WRfGNQT1Hv9wZm0	2026-07-01 09:21:03.414111+00	2026-07-08 09:21:03+00	1	8556f5deb5574b54b29beb48868fa87b
13	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjUyMSwiaWF0IjoxNzgyODk3NzIxLCJqdGkiOiIzYmFiYWQ5ODI3N2I0Zjk3YTBkYjA1YjNjOGMyMWVlOCIsInVzZXJfaWQiOjF9.sWJ52aM_8eaPIIvs0tEtHf6vBsIVPh2SMfC3YUMvucw	2026-07-01 09:22:01.928056+00	2026-07-08 09:22:01+00	1	3babad98277b4f97a0db05b3c8c21ee8
14	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjU0MywiaWF0IjoxNzgyODk3NzQzLCJqdGkiOiJjOTM4MjhhY2I4MWE0NzdiOTZlZWFkOTkwZDM0MGI2NCIsInVzZXJfaWQiOjF9.LUvEWQZI7-jAIbhxaykIl-1rv4rwupDFppGkZTEc_jc	2026-07-01 09:22:23.683939+00	2026-07-08 09:22:23+00	1	c93828acb81a477b96eead990d340b64
15	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjU5MCwiaWF0IjoxNzgyODk3NzkwLCJqdGkiOiJiNjczMGVjMDJiMDI0YWVmYjY3MmI2MzVmNzA2OTdlMiIsInVzZXJfaWQiOjF9.BBeen3RzRD43KupDVWumWd5jvyQSWT6w5RNZmfHBqWo	2026-07-01 09:23:10.746328+00	2026-07-08 09:23:10+00	1	b6730ec02b024aefb672b635f70697e2
16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjYyMCwiaWF0IjoxNzgyODk3ODIwLCJqdGkiOiJlYzUwMDY3YjkwZTg0MjZjYjRmYTM4YTFhYzdlNDU0MiIsInVzZXJfaWQiOjF9.MS_GrjeeMTWM2NYspop5rMlDIigBCpURZSwNEx_K0Pc	2026-07-01 09:23:40.837563+00	2026-07-08 09:23:40+00	1	ec50067b90e8426cb4fa38a1ac7e4542
17	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjY4MCwiaWF0IjoxNzgyODk3ODgwLCJqdGkiOiJlNmQyZmYxMjIwZGM0M2I3YTFkMzk1NzlmMzFjOGQ4OSIsInVzZXJfaWQiOjF9.L8Z7u7MnTEHfZWZjTsbki-N05UxnPNC_l_2byFTyM5k	2026-07-01 09:24:40.467888+00	2026-07-08 09:24:40+00	1	e6d2ff1220dc43b7a1d39579f31c8d89
18	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzUwMjgwNSwiaWF0IjoxNzgyODk4MDA1LCJqdGkiOiJiYTMzZGEwMzE1OWI0YmYyODM1OTM0MDVlYTRkNmI3MCIsInVzZXJfaWQiOjF9.hX3uBdDzodLCA0HoPOoAMXw-NylIZPCq9AEmWJg64bY	2026-07-01 09:26:45.109074+00	2026-07-08 09:26:45+00	1	ba33da03159b4bf283593405ea4d6b70
19	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU3MDE5MSwiaWF0IjoxNzgyOTY1MzkxLCJqdGkiOiI2ZWQ1ZDYzOWNiZjY0NzZkOTE1MmFhMmE2NjZhOWM1ZSIsInVzZXJfaWQiOjF9.YrED3zalE_6gVlkAKl5HgsBKw4_WntZxBTIX-qSQYgc	2026-07-02 04:09:51.642347+00	2026-07-09 04:09:51+00	1	6ed5d639cbf6476d9152aa2a666a9c5e
20	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5MzIxOSwiaWF0IjoxNzgyOTg4NDE5LCJqdGkiOiJmMDVjZDI1MDdmOGE0MTFkYjdiYTNkNmU5MTM4NDk3YSIsInVzZXJfaWQiOjF9.oLoGIrK6ld_pFbKFUh-b1JSH8rutvRpr3ziSb4kw9iA	2026-07-02 10:33:39.421974+00	2026-07-09 10:33:39+00	1	f05cd2507f8a411db7ba3d6e9138497a
21	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5NDQzOCwiaWF0IjoxNzgyOTg5NjM4LCJqdGkiOiJjZTZmNjY0NGQwYTA0NzEzODBmMDdiZGZkZmI5MzI0OSIsInVzZXJfaWQiOjF9.kVxlUG6G7FrFjjGrR-laPR761bG87Ll6TzmzbTlsrr0	2026-07-02 10:53:58.397158+00	2026-07-09 10:53:58+00	1	ce6f6644d0a0471380f07bdfdfb93249
22	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5NDQ1MSwiaWF0IjoxNzgyOTg5NjUxLCJqdGkiOiIxZDIyZTE1YzY5YTU0YzljYjg2MGViYjYwNDM4YjcwZCIsInVzZXJfaWQiOjF9.XN63SgCKKur8CjVVBSyPvPtDbXwX95o7Tefg2sQkH-8	2026-07-02 10:54:11.014979+00	2026-07-09 10:54:11+00	1	1d22e15c69a54c9cb860ebb60438b70d
23	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5NTEwMSwiaWF0IjoxNzgyOTkwMzAxLCJqdGkiOiJiZWExNjY5ZTI3YzM0ZjVjYWVhMDYzMGQ4Njg0MGE2NSIsInVzZXJfaWQiOjF9.tdjmtBi4Tbmfj78T8iETRpYTL7MbiuaNZy4fw1Pw_FI	2026-07-02 11:05:01.249997+00	2026-07-09 11:05:01+00	1	bea1669e27c34f5caea0630d86840a65
24	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5NTM4NywiaWF0IjoxNzgyOTkwNTg3LCJqdGkiOiJmNDllZGEzMGQ0Nzk0NTU1OWQ1NjFhMjg5YjJmNzgwYSIsInVzZXJfaWQiOjF9.Kxe0bg5eZHzJQpU1euzSuErEKzfxrnCf11yKK9RdJXI	2026-07-02 11:09:47.782905+00	2026-07-09 11:09:47+00	1	f49eda30d47945559d561a289b2f780a
25	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzU5NTM4OCwiaWF0IjoxNzgyOTkwNTg4LCJqdGkiOiJiNThmMjVmZjFjMjA0OTUwYjdhYzQ5YTEzOWRiNjRiMiIsInVzZXJfaWQiOjIyfQ.kZt6UK61UJU7-AjuJhYNf57EEwngZc6w_9KPkse7_Oo	2026-07-02 11:09:48.137367+00	2026-07-09 11:09:48+00	\N	b58f25ff1c204950b7ac49a139db64b2
26	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUyNjQ2NSwiaWF0IjoxNzgzOTIxNjY1LCJqdGkiOiJlOWI3Yjg4OTc5MDM0NzFlYTFiNjM2ZDI2ZWU0ZjAwOCIsInVzZXJfaWQiOjF9.W29dO1-aLQRisvMPnFQeSllO7Uuvw2Uqq7orQNrUJUM	2026-07-13 05:47:45.968608+00	2026-07-20 05:47:45+00	1	e9b7b8897903471ea1b636d26ee4f008
27	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUyODUxNSwiaWF0IjoxNzgzOTIzNzE1LCJqdGkiOiI4M2NmNWUxNmE2N2E0NjgxOGIxMmE5ODJhZTliYThkNyIsInVzZXJfaWQiOjF9.uKJ01lFSx4LVnJk1ju18xGaatpNN-VQsuV7yWh-NAf0	2026-07-13 06:21:55.583878+00	2026-07-20 06:21:55+00	1	83cf5e16a67a46818b12a982ae9ba8d7
28	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUyODU0MCwiaWF0IjoxNzgzOTIzNzQwLCJqdGkiOiJkZWNlMDdmODg4ZWQ0MjMxYTA1Mjg2OGNiY2FkNDdmNCIsInVzZXJfaWQiOjR9.-MvS62MY3-tKXfwth-OmXw8--dJBHlTEE0jFXZYqYno	2026-07-13 06:22:20.894925+00	2026-07-20 06:22:20+00	4	dece07f888ed4231a052868cbcad47f4
29	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUyOTg2MiwiaWF0IjoxNzgzOTI1MDYyLCJqdGkiOiJiNDBkYjc3N2Q1NzM0ZDVmOTJmNjcwNTRlYTNkN2EyMCIsInVzZXJfaWQiOjF9.YH15eT01SHXt3P6ANLDfbj5DWP496iD4UEpRKCZnEYU	2026-07-13 06:44:22.577242+00	2026-07-20 06:44:22+00	1	b40db777d5734d5f92f67054ea3d7a20
30	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUzMDA5OCwiaWF0IjoxNzgzOTI1Mjk4LCJqdGkiOiI0MjI1ZjYwZDM4M2I0YjA1OGY5ODA0YmM0NTQ2YWQxNiIsInVzZXJfaWQiOjR9.317W8Q-BCdBS7MHg1Dtj5oX7R6tdLTFNjCNB7me0lFU	2026-07-13 06:48:18.869651+00	2026-07-20 06:48:18+00	4	4225f60d383b4b058f9804bc4546ad16
31	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUzMzYxNywiaWF0IjoxNzgzOTI4ODE3LCJqdGkiOiI2ZTcxOGNjMmZkNzM0MjYyYjE5YjE4YjU3MzhmNWEyYyIsInVzZXJfaWQiOjF9.l6Ma0kfPDxJQu83NlSKQzZjve-ROqVaZ7V5yO7hxt50	2026-07-13 07:46:57.709543+00	2026-07-20 07:46:57+00	1	6e718cc2fd734262b19b18b5738f5a2c
32	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUzMzcwNSwiaWF0IjoxNzgzOTI4OTA1LCJqdGkiOiI0ODAwZjE2YjJjYjM0MDQwOWM5MGQ5YWY5YWE2ZjI1NCIsInVzZXJfaWQiOjR9.eqnTeYhFtiGVTBEsxzqr5br2VC_q5PXCBCnWRGZEi10	2026-07-13 07:48:25.286147+00	2026-07-20 07:48:25+00	4	4800f16b2cb340409c90d9af9aa6f254
33	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDUzOTM0OSwiaWF0IjoxNzgzOTM0NTQ5LCJqdGkiOiJmNzU4OTJlZGQ2YTY0NmIzOWFiYThkOGRkMTA1ZGNiMiIsInVzZXJfaWQiOjF9.hbUWepKk4nruhlljZLkzSYx2v-rnHtMlEYE3MG1Fxj4	2026-07-13 09:22:29.975614+00	2026-07-20 09:22:29+00	1	f75892edd6a646b39aba8d8dd105dcb2
34	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDU1MjQ3NiwiaWF0IjoxNzgzOTQ3Njc2LCJqdGkiOiI0MGJlMzU2OTM3MjU0ZDE0YWM5ZTA2NTViMGI3OWQyYyIsInVzZXJfaWQiOjF9.Wd9tuX1ERDNLsc4HLhENa4NPehANorQciY0AqqX7ZLM	2026-07-13 13:01:16.337411+00	2026-07-20 13:01:16+00	1	40be356937254d14ac9e0655b0b79d2c
35	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDU1MjQ5OCwiaWF0IjoxNzgzOTQ3Njk4LCJqdGkiOiIwNzM2NjcwNTQ0MTQ0N2E0YmRiNWM3MTNmY2UxYTU1OSIsInVzZXJfaWQiOjF9.Fms0ZEEcVjKnlPl7WTfYAI074GrSsHw-5D6MZtZI28Y	2026-07-13 13:01:38.802804+00	2026-07-20 13:01:38+00	1	07366705441447a4bdb5c713fce1a559
36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDYwNjI5OSwiaWF0IjoxNzg0MDAxNDk5LCJqdGkiOiI4ZTVmYzMzOTE3MDc0ZDExYmVmZGNlN2I5NmZmMmY1MyIsInVzZXJfaWQiOjF9.WfXi3bJh9Zo73XiL4-ZCQKNd8NZUHMwcTRTxeCSYKiQ	2026-07-14 03:58:19.102237+00	2026-07-21 03:58:19+00	1	8e5fc33917074d11befdce7b96ff2f53
37	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDYwOTk4MiwiaWF0IjoxNzg0MDA1MTgyLCJqdGkiOiJjMWExZTU3MTY3YTk0YzlhYjVmMWUyN2VkODkxMWEzMiIsInVzZXJfaWQiOjF9.CcwuvAONyKhwbTjYl3Us3_ZgBJJx6LEXZPmrMg0eCk4	2026-07-14 04:59:42.58546+00	2026-07-21 04:59:42+00	1	c1a1e57167a94c9ab5f1e27ed8911a32
38	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDYxODEzNywiaWF0IjoxNzg0MDEzMzM3LCJqdGkiOiJkMzRlYThkNGFiNTY0YTYxOGI2NTJlMDFmOWM4ZjNkYiIsInVzZXJfaWQiOjF9.1Kz76jph6k0QD3-7-lu1PFgSVC3pRC3Mc_Q72MXDPCA	2026-07-14 07:15:37.586907+00	2026-07-21 07:15:37+00	1	d34ea8d4ab564a618b652e01f9c8f3db
39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDYyMjY5MSwiaWF0IjoxNzg0MDE3ODkxLCJqdGkiOiI1YmNjNjdjMzJlNGY0ZjY5OGNkMzE5YWIzN2U0MjM2ZSIsInVzZXJfaWQiOjE0fQ.ZHqkusL-MzIxeN-sMCEuRPP1NWhExpXHzqT8zzfMI4c	2026-07-14 08:31:31.579652+00	2026-07-21 08:31:31+00	14	5bcc67c32e4f4f698cd319ab37e4236e
40	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDYyNTM5NywiaWF0IjoxNzg0MDIwNTk3LCJqdGkiOiIzNmU5MGYwMWY4NjI0NzQyOGQzYTJmODRhZjQwZmI5MiIsInVzZXJfaWQiOjF9.KkIfjDZ74elNA-J4_LKq4JbJhyopQjcJeq3uxAFyeJY	2026-07-14 09:16:37.570085+00	2026-07-21 09:16:37+00	1	36e90f01f86247428d3a2f84af40fb92
41	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDcwMjU1MywiaWF0IjoxNzg0MDk3NzUzLCJqdGkiOiI2NzZkNWY4ZDJjOGQ0M2ZlYmY2NDBmZmNlYjczYjFkNiIsInVzZXJfaWQiOjF9.rfgiT4DGPRqp_PByy_S40Fk0FYAgT_CKn_-0YbKlhZ8	2026-07-15 06:42:33.577141+00	2026-07-22 06:42:33+00	1	676d5f8d2c8d43febf640ffceb73b1d6
42	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDcyMTAwNiwiaWF0IjoxNzg0MTE2MjA2LCJqdGkiOiI0M2NiNTYxN2FlYzk0Y2U4YmNkNTM5NzJmYjY1MDRlNCIsInVzZXJfaWQiOjF9.Qk92HWk7vRePglXpxIcm7b2yBZx6sV2BbF9RrkrUFEY	2026-07-15 11:50:06.031777+00	2026-07-22 11:50:06+00	1	43cb5617aec94ce8bcd53972fb6504e4
43	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDc3OTE4OCwiaWF0IjoxNzg0MTc0Mzg4LCJqdGkiOiJiYWZkMmNhODlhNzE0ZTAzYWQzMzYyOTNmMzBlN2Y5ZCIsInVzZXJfaWQiOjF9._vT-NHdeg1hLLh0tME_SNaMYdqhuGyzHbCKtJ1O9n48	2026-07-16 03:59:48.341911+00	2026-07-23 03:59:48+00	1	bafd2ca89a714e03ad336293f30e7f9d
44	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NDgwMDY2NSwiaWF0IjoxNzg0MTk1ODY1LCJqdGkiOiI3MTUzNTBiZDNkOGU0M2U4OTMxMTczNTc5NGUzOThhMCIsInVzZXJfaWQiOjF9.2476mO7P5T_9CrI218AlbSLiy_TNMRQqFPEqI07JlEI	2026-07-16 09:57:45.41469+00	2026-07-23 09:57:45+00	1	715350bd3d8e43e89311735794e398a0
\.


--
-- Data for Name: users_department; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_department (id, name, code, head_id, parent_id) FROM stdin;
5	Отдел по связям с общественностью	ОСМР	\N	\N
7	Отдел внутреннего аудита	ОВА	\N	\N
8	Служба безопасности	СБ	\N	\N
9	Бухгалтерия	БУХ	\N	\N
10	Канцелярия	КАНЦ	\N	\N
1	Административно-хозяйственная служба	АХС	4	\N
2	Финансовый отдел	ФО	7	\N
3	Департамент информационных технологий	ДИТ	8	\N
4	Юридический департамент	ЮД	9	\N
6	Инвестиционно-ресурсный департамент	ИРД	10	\N
\.


--
-- Data for Name: users_positionaccessrule; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_positionaccessrule (id, "position", normalized_position, permission_code, is_allowed, is_active, comment, created_at, updated_at) FROM stdin;
1	Системный администратор	системный администратор	system.admin	t	t		2026-07-14 08:22:32.434991+00	2026-07-14 08:22:32.435002+00
3	Системный администратор	системный администратор	users.manage	t	t		2026-07-14 08:22:32.472779+00	2026-07-14 08:22:32.472789+00
4	Системный администратор	системный администратор	access.manage	t	t		2026-07-14 08:22:32.473736+00	2026-07-14 08:22:32.473744+00
5	Системный администратор	системный администратор	system.manager	t	t		2026-07-14 08:22:32.476949+00	2026-07-14 08:22:32.476955+00
6	Системный администратор	системный администратор	requests.create	t	t		2026-07-14 08:22:32.479771+00	2026-07-14 08:22:32.479776+00
7	Системный администратор	системный администратор	requests.approve_department	t	t		2026-07-14 08:22:32.48812+00	2026-07-14 08:22:32.488128+00
8	Системный администратор	системный администратор	requests.view_all	t	t		2026-07-14 08:22:32.488877+00	2026-07-14 08:22:32.488882+00
9	Системный администратор	системный администратор	requests.approve_ahs	t	t		2026-07-14 08:22:32.526021+00	2026-07-14 08:22:32.52603+00
10	Системный администратор	системный администратор	requests.issue	t	t		2026-07-14 08:22:32.529149+00	2026-07-14 08:22:32.529156+00
11	Системный администратор	системный администратор	warehouse.view	t	t		2026-07-14 08:22:32.52983+00	2026-07-14 08:22:32.529835+00
12	Системный администратор	системный администратор	warehouse.upload	t	t		2026-07-14 08:22:32.531658+00	2026-07-14 08:22:32.531663+00
13	Системный администратор	системный администратор	inventory.view_all	t	t		2026-07-14 08:22:32.540028+00	2026-07-14 08:22:32.540036+00
14	Системный администратор	системный администратор	documents.manage	t	t		2026-07-14 08:22:32.541285+00	2026-07-14 08:22:32.54129+00
15	Системный администратор	системный администратор	reports.view	t	t		2026-07-14 08:22:32.577059+00	2026-07-14 08:22:32.577069+00
16	Системный администратор	системный администратор	integrations.sync	t	t		2026-07-14 08:22:32.580549+00	2026-07-14 08:22:32.580557+00
2	Системный администратор	системный администратор	references.manage	t	t		2026-07-14 08:22:32.435674+00	2026-07-14 08:22:32.43568+00
\.


--
-- Data for Name: users_user; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined, patronymic, "position", phone, role, department_id, supervisor_id, photo, position_ref_id) FROM stdin;
11	pbkdf2_sha256$600000$5WRrHepsgEOoc9G7FXGc3o$VB4FREtR8CVsHIjCwJOZgY5gCUUxURPsUELy/7Yun68=	\N	f	user_dit1	Асем	Жанибекова	user1@kfgd.kz	f	t	2026-07-01 07:46:43.475041+00	Ерболатовна	Ведущий разработчик		USER	3	8		10
4	pbkdf2_sha256$600000$PwED8m51EAhS2ysN7CvEiJ$Wlsbol744iWoB8X4MBCyA6BILf+DlmvebpwljJOVHTo=	\N	f	ahs_head	Марат	Жумабеков	ahs_head@kfgd.kz	f	t	2026-07-01 07:46:43.07572+00	Канатович	Руководитель АХС		AHS_HEAD	1	\N		2
7	pbkdf2_sha256$600000$ShmM5Qr8VjeFWUhHAnrx3a$HdnX1m06d/A471PRrorKk7mQfpS2fQt1G7qapQVY54Q=	\N	f	fo_head	Алия	Касымова	fo_head@kfgd.kz	f	t	2026-07-01 07:46:43.246143+00	Нурлановна	Руководитель ФО		FO_HEAD	2	\N		6
9	pbkdf2_sha256$600000$k6cFV9YvmrTECwWEe3UUhK$MfR/vlVcXPpT+KFuPGX+CW73d7apbsUByWJUDbLDxgs=	\N	f	dept_head_yud	Динара	Мусина	yud_head@kfgd.kz	f	t	2026-07-01 07:46:43.35963+00	Асхатовна	Директор ЮД		DEPT_HEAD	4	\N		8
15	pbkdf2_sha256$600000$va74wollCtwMZB5HqFANdo$nAbBQakKeU8FX7nVPe3tThzRw19vUXeCOp+fQijvn4A=	\N	f	commission1	Сауле	Оразбаева	commission@kfgd.kz	f	t	2026-07-01 07:46:43.700291+00	Мухтаровна	Член Рабочей комиссии		COMMISSION_MEMBER	9	\N		14
1	pbkdf2_sha256$600000$3cUBcwOxlhlwWLBinEYsyN$7Fiu9/hA5hr8CKFVenedAnQc32j4DcfEbDMNoPqZyHA=	\N	t	admin	Администратор	Системный	admin@kfgd.kz	t	t	2026-07-01 07:46:42.898675+00		Системный администратор		ADMIN	3	\N		1
8	pbkdf2_sha256$600000$OMTeP5kQckmqJKg90J7RoZ$2GeVx7fjRCZZkCnWxWuemgMUBuHj60SDwQnJkfWWSN0=	\N	f	dept_head_dit	Ерлан	Тасмагамбетов	dit_head@kfgd.kz	f	t	2026-07-01 07:46:43.303069+00	Бакытович	Директор ДИТ		DEPT_HEAD	3	\N		7
10	pbkdf2_sha256$600000$pdiSfWrTQgmJJvtyWfb8Z9$n4sOD4TRh+FjlvsJyOTmeWDnGjinHOEsLtNWMIcOBl0=	\N	f	dept_head_ird	Нурлан	Сагинтаев	ird_head@kfgd.kz	f	t	2026-07-01 07:46:43.419582+00	Кайратович	Директор ИРД		DEPT_HEAD	6	\N		9
6	pbkdf2_sha256$600000$oSfWLoGdNn0iFKbCJnSJKK$tt0E+9D5IF5l1euoDO2cN4Yms+zt0Y/HABm9Gn65w6w=	\N	f	mol_nma	Гульнара	Абдуллина	mol_nma@kfgd.kz	f	t	2026-07-01 07:46:43.189451+00	Тимуровна	МОЛ по НМА		MOL_NMA	3	8		5
13	pbkdf2_sha256$600000$8SXYLArnULGZqcErI37YRQ$+v9nyzq+kS0e9rLD9zVZOcTXZx1A6SzK6sFX8vErwDg=	\N	f	user_yud1	Камила	Ахметова	user3@kfgd.kz	f	t	2026-07-01 07:46:43.586289+00	Данияровна	Юрист		USER	4	9		12
5	pbkdf2_sha256$600000$WKUZjtMD98A9CIOIKgYN9Y$iv0HAEU5S02SWOfm8ZFb9BYYFy0SHO4jaMxPVrvycTw=	\N	f	mol_warehouse	Бауыржан	Каримов	mol_wh@kfgd.kz	f	t	2026-07-01 07:46:43.134196+00	Серикович	МОЛ по складу		MOL_WAREHOUSE	1	4		4
16	pbkdf2_sha256$600000$QBqmWl79p0V7XCyZY1LMHp$vNpCbnnB1CuTH6uQdAAgSoqRT1el7W5Tfr2XjKiViJ0=	\N	f	ird_worker1	Данияр	Кенжебаев	ird_w@kfgd.kz	f	t	2026-07-01 07:46:43.756803+00	Нурланович	Специалист ИРД		IRD_WORKER	6	10		15
3	pbkdf2_sha256$600000$ZqncMYogBUV9e6sOcwiRNj$ufylnPHkBaFBGeilnd+g1Tjk49DA5Dqcu7qvqVcUnMw=	\N	f	ahs_worker2	Дамир	Нурланов	ahs2@kfgd.kz	f	t	2026-07-01 07:46:43.019045+00	Ерланович	Специалист АХС		AHS_WORKER	1	4		3
2	pbkdf2_sha256$600000$qZQqxJk5HRppcW4fQNnZ3b$AFDsvwJv4J7mSIRZ6G+GvNLzDkA81Xyx8Ip82MR5FUg=	\N	f	ahs_worker1	Айгерим	Сатпаева	ahs1@kfgd.kz	f	t	2026-07-01 07:46:42.961878+00	Бахытовна	Специалист АХС		AHS_WORKER	1	4		3
12	pbkdf2_sha256$600000$XiBe7w7M8nfyaznpiJIURs$52FnMbQ0EaJf3Gt4/CCeu3bs3GPx5DbfALjThY8bjxA=	\N	f	user_fo1	Тимур	Искаков	user2@kfgd.kz	f	t	2026-07-01 07:46:43.529769+00	Маратович	Бухгалтер		USER	2	7		11
14	pbkdf2_sha256$600000$OrFN3ASCZw02riY1u9lAt6$z6+6UG7JxcIMBrcT4+vf1lap5k3MEsPpT7akTh5Nzro=	\N	f	user_sb1	Арман	Бекмуратов	user4@kfgd.kz	f	t	2026-07-01 07:46:43.643948+00	Талгатович	Специалист СБ		USER	8	4		13
\.


--
-- Data for Name: users_user_groups; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: users_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: users_useraccessoverride; Type: TABLE DATA; Schema: public; Owner: asu_user
--

COPY public.users_useraccessoverride (id, permission_code, mode, comment, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Name: assets_assetassignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_assetassignment_id_seq', 1, false);


--
-- Name: assets_stockalertrule_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertrule_assets_id_seq', 1, true);


--
-- Name: assets_stockalertrule_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertrule_groups_id_seq', 1, true);


--
-- Name: assets_stockalertrule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertrule_id_seq', 3, true);


--
-- Name: assets_stockalertrule_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertrule_recipients_id_seq', 3, true);


--
-- Name: assets_stockalertrule_warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertrule_warehouses_id_seq', 1, true);


--
-- Name: assets_stockalertstate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockalertstate_id_seq', 2, true);


--
-- Name: assets_stockmovement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_stockmovement_id_seq', 10, true);


--
-- Name: assets_warehousestock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.assets_warehousestock_id_seq', 129, true);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 200, true);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- Name: django_celery_beat_clockedschedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_celery_beat_clockedschedule_id_seq', 1, false);


--
-- Name: django_celery_beat_crontabschedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_celery_beat_crontabschedule_id_seq', 1, true);


--
-- Name: django_celery_beat_intervalschedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_celery_beat_intervalschedule_id_seq', 1, false);


--
-- Name: django_celery_beat_periodictask_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_celery_beat_periodictask_id_seq', 1, true);


--
-- Name: django_celery_beat_solarschedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_celery_beat_solarschedule_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 50, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 88, true);


--
-- Name: documents_commissionmember_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_commissionmember_id_seq', 4, true);


--
-- Name: documents_commissionprotocol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_commissionprotocol_id_seq', 1, true);


--
-- Name: documents_documentsignature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_documentsignature_id_seq', 11, true);


--
-- Name: documents_incominginvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_incominginvoice_id_seq', 6, true);


--
-- Name: documents_incominginvoiceitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_incominginvoiceitem_id_seq', 9, true);


--
-- Name: documents_internaltransferinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_internaltransferinvoice_id_seq', 1, true);


--
-- Name: documents_internaltransferitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_internaltransferitem_id_seq', 1, true);


--
-- Name: documents_petition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_petition_id_seq', 1, true);


--
-- Name: documents_petitionitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_petitionitem_id_seq', 1, true);


--
-- Name: documents_protocolitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_protocolitem_id_seq', 1, true);


--
-- Name: documents_writeoffact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_writeoffact_id_seq', 2, true);


--
-- Name: documents_writeoffactitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.documents_writeoffactitem_id_seq', 2, true);


--
-- Name: integrations_synclog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.integrations_synclog_id_seq', 1, true);


--
-- Name: notifications_emaillog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.notifications_emaillog_id_seq', 30, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 30, true);


--
-- Name: references_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_asset_id_seq', 131, true);


--
-- Name: references_assetcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_assetcategory_id_seq', 23, true);


--
-- Name: references_contract_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_contract_id_seq', 1, true);


--
-- Name: references_counterparty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_counterparty_id_seq', 15, true);


--
-- Name: references_limitnorm_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_limitnorm_id_seq', 5, true);


--
-- Name: references_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_position_id_seq', 15, true);


--
-- Name: references_requesttype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_requesttype_id_seq', 15, true);


--
-- Name: references_unitofmeasure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_unitofmeasure_id_seq', 18, true);


--
-- Name: references_warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.references_warehouse_id_seq', 6, true);


--
-- Name: requests_approvalstep_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.requests_approvalstep_id_seq', 5, true);


--
-- Name: requests_assetrequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.requests_assetrequest_id_seq', 20, true);


--
-- Name: requests_assetrequest_issue_responsibles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.requests_assetrequest_issue_responsibles_id_seq', 3, true);


--
-- Name: requests_assetrequestitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.requests_assetrequestitem_id_seq', 18, true);


--
-- Name: requests_requestapproval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.requests_requestapproval_id_seq', 19, true);


--
-- Name: token_blacklist_blacklistedtoken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.token_blacklist_blacklistedtoken_id_seq', 38, true);


--
-- Name: token_blacklist_outstandingtoken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.token_blacklist_outstandingtoken_id_seq', 44, true);


--
-- Name: users_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_department_id_seq', 15, true);


--
-- Name: users_positionaccessrule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_positionaccessrule_id_seq', 16, true);


--
-- Name: users_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_user_groups_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_user_id_seq', 31, true);


--
-- Name: users_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_user_user_permissions_id_seq', 1, false);


--
-- Name: users_useraccessoverride_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asu_user
--

SELECT pg_catalog.setval('public.users_useraccessoverride_id_seq', 1, false);


--
-- Name: assets_assetassignment assets_assetassignment_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_assetassignment
    ADD CONSTRAINT assets_assetassignment_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertrule_assets assets_stockalertrule_as_stockalertrule_id_asset__bb7a808c_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_assets
    ADD CONSTRAINT assets_stockalertrule_as_stockalertrule_id_asset__bb7a808c_uniq UNIQUE (stockalertrule_id, asset_id);


--
-- Name: assets_stockalertrule_assets assets_stockalertrule_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_assets
    ADD CONSTRAINT assets_stockalertrule_assets_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertrule_groups assets_stockalertrule_gr_stockalertrule_id_assetc_9ddc6026_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_groups
    ADD CONSTRAINT assets_stockalertrule_gr_stockalertrule_id_assetc_9ddc6026_uniq UNIQUE (stockalertrule_id, assetcategory_id);


--
-- Name: assets_stockalertrule_groups assets_stockalertrule_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_groups
    ADD CONSTRAINT assets_stockalertrule_groups_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertrule assets_stockalertrule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule
    ADD CONSTRAINT assets_stockalertrule_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertrule_recipients assets_stockalertrule_re_stockalertrule_id_user_i_49640c59_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_recipients
    ADD CONSTRAINT assets_stockalertrule_re_stockalertrule_id_user_i_49640c59_uniq UNIQUE (stockalertrule_id, user_id);


--
-- Name: assets_stockalertrule_recipients assets_stockalertrule_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_recipients
    ADD CONSTRAINT assets_stockalertrule_recipients_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertrule_warehouses assets_stockalertrule_wa_stockalertrule_id_wareho_41651be0_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_warehouses
    ADD CONSTRAINT assets_stockalertrule_wa_stockalertrule_id_wareho_41651be0_uniq UNIQUE (stockalertrule_id, warehouse_id);


--
-- Name: assets_stockalertrule_warehouses assets_stockalertrule_warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_warehouses
    ADD CONSTRAINT assets_stockalertrule_warehouses_pkey PRIMARY KEY (id);


--
-- Name: assets_stockalertstate assets_stockalertstate_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertstate
    ADD CONSTRAINT assets_stockalertstate_pkey PRIMARY KEY (id);


--
-- Name: assets_stockmovement assets_stockmovement_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_pkey PRIMARY KEY (id);


--
-- Name: assets_warehousestock assets_warehousestock_asset_id_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_warehousestock
    ADD CONSTRAINT assets_warehousestock_asset_id_key UNIQUE (asset_id);


--
-- Name: assets_warehousestock assets_warehousestock_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_warehousestock
    ADD CONSTRAINT assets_warehousestock_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_clockedschedule django_celery_beat_clockedschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_clockedschedule
    ADD CONSTRAINT django_celery_beat_clockedschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_crontabschedule django_celery_beat_crontabschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_crontabschedule
    ADD CONSTRAINT django_celery_beat_crontabschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_intervalschedule django_celery_beat_intervalschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_intervalschedule
    ADD CONSTRAINT django_celery_beat_intervalschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_periodictask django_celery_beat_periodictask_name_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_periodictask_name_key UNIQUE (name);


--
-- Name: django_celery_beat_periodictask django_celery_beat_periodictask_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_periodictask_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_periodictasks django_celery_beat_periodictasks_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictasks
    ADD CONSTRAINT django_celery_beat_periodictasks_pkey PRIMARY KEY (ident);


--
-- Name: django_celery_beat_solarschedule django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_solarschedule
    ADD CONSTRAINT django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq UNIQUE (event, latitude, longitude);


--
-- Name: django_celery_beat_solarschedule django_celery_beat_solarschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_solarschedule
    ADD CONSTRAINT django_celery_beat_solarschedule_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: documents_commissionmember documents_commissionmember_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionmember
    ADD CONSTRAINT documents_commissionmember_pkey PRIMARY KEY (id);


--
-- Name: documents_commissionprotocol documents_commissionprotocol_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionprotocol
    ADD CONSTRAINT documents_commissionprotocol_pkey PRIMARY KEY (id);


--
-- Name: documents_documentsignature documents_documentsignature_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_documentsignature
    ADD CONSTRAINT documents_documentsignature_pkey PRIMARY KEY (id);


--
-- Name: documents_incominginvoice documents_incominginvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoice
    ADD CONSTRAINT documents_incominginvoice_pkey PRIMARY KEY (id);


--
-- Name: documents_incominginvoiceitem documents_incominginvoiceitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoiceitem
    ADD CONSTRAINT documents_incominginvoiceitem_pkey PRIMARY KEY (id);


--
-- Name: documents_internaltransferinvoice documents_internaltransferinvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferinvoice
    ADD CONSTRAINT documents_internaltransferinvoice_pkey PRIMARY KEY (id);


--
-- Name: documents_internaltransferitem documents_internaltransferitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferitem
    ADD CONSTRAINT documents_internaltransferitem_pkey PRIMARY KEY (id);


--
-- Name: documents_petition documents_petition_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_petition
    ADD CONSTRAINT documents_petition_pkey PRIMARY KEY (id);


--
-- Name: documents_petitionitem documents_petitionitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_petitionitem
    ADD CONSTRAINT documents_petitionitem_pkey PRIMARY KEY (id);


--
-- Name: documents_protocolitem documents_protocolitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_protocolitem
    ADD CONSTRAINT documents_protocolitem_pkey PRIMARY KEY (id);


--
-- Name: documents_writeoffact documents_writeoffact_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_writeoffact
    ADD CONSTRAINT documents_writeoffact_pkey PRIMARY KEY (id);


--
-- Name: documents_writeoffactitem documents_writeoffactitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_writeoffactitem
    ADD CONSTRAINT documents_writeoffactitem_pkey PRIMARY KEY (id);


--
-- Name: integrations_synclog integrations_synclog_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.integrations_synclog
    ADD CONSTRAINT integrations_synclog_pkey PRIMARY KEY (id);


--
-- Name: notifications_emaillog notifications_emaillog_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.notifications_emaillog
    ADD CONSTRAINT notifications_emaillog_pkey PRIMARY KEY (id);


--
-- Name: notifications_notification notifications_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.notifications_notification
    ADD CONSTRAINT notifications_notification_pkey PRIMARY KEY (id);


--
-- Name: references_asset references_asset_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_code_key UNIQUE (code);


--
-- Name: references_asset references_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_pkey PRIMARY KEY (id);


--
-- Name: references_asset references_asset_source_1c_id_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_source_1c_id_key UNIQUE (source_1c_id);


--
-- Name: references_assetcategory references_assetcategory_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_assetcategory
    ADD CONSTRAINT references_assetcategory_code_key UNIQUE (code);


--
-- Name: references_assetcategory references_assetcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_assetcategory
    ADD CONSTRAINT references_assetcategory_pkey PRIMARY KEY (id);


--
-- Name: references_contract references_contract_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_contract
    ADD CONSTRAINT references_contract_pkey PRIMARY KEY (id);


--
-- Name: references_counterparty references_counterparty_bin_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_counterparty
    ADD CONSTRAINT references_counterparty_bin_key UNIQUE (bin);


--
-- Name: references_counterparty references_counterparty_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_counterparty
    ADD CONSTRAINT references_counterparty_pkey PRIMARY KEY (id);


--
-- Name: references_limitnorm references_limitnorm_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_limitnorm
    ADD CONSTRAINT references_limitnorm_pkey PRIMARY KEY (id);


--
-- Name: references_position references_position_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_position
    ADD CONSTRAINT references_position_code_key UNIQUE (code);


--
-- Name: references_position references_position_name_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_position
    ADD CONSTRAINT references_position_name_key UNIQUE (name);


--
-- Name: references_position references_position_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_position
    ADD CONSTRAINT references_position_pkey PRIMARY KEY (id);


--
-- Name: references_requesttype references_requesttype_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_requesttype
    ADD CONSTRAINT references_requesttype_code_key UNIQUE (code);


--
-- Name: references_requesttype references_requesttype_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_requesttype
    ADD CONSTRAINT references_requesttype_pkey PRIMARY KEY (id);


--
-- Name: references_unitofmeasure references_unitofmeasure_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_unitofmeasure
    ADD CONSTRAINT references_unitofmeasure_code_key UNIQUE (code);


--
-- Name: references_unitofmeasure references_unitofmeasure_name_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_unitofmeasure
    ADD CONSTRAINT references_unitofmeasure_name_key UNIQUE (name);


--
-- Name: references_unitofmeasure references_unitofmeasure_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_unitofmeasure
    ADD CONSTRAINT references_unitofmeasure_pkey PRIMARY KEY (id);


--
-- Name: references_warehouse references_warehouse_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_warehouse
    ADD CONSTRAINT references_warehouse_code_key UNIQUE (code);


--
-- Name: references_warehouse references_warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_warehouse
    ADD CONSTRAINT references_warehouse_pkey PRIMARY KEY (id);


--
-- Name: requests_approvalstep requests_approvalstep_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_approvalstep
    ADD CONSTRAINT requests_approvalstep_pkey PRIMARY KEY (id);


--
-- Name: requests_approvalstep requests_approvalstep_request_type_id_order_0940bf13_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_approvalstep
    ADD CONSTRAINT requests_approvalstep_request_type_id_order_0940bf13_uniq UNIQUE (request_type_id, "order");


--
-- Name: requests_assetrequest_issue_responsibles requests_assetrequest_is_assetrequest_id_user_id_4d6c5610_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest_issue_responsibles
    ADD CONSTRAINT requests_assetrequest_is_assetrequest_id_user_id_4d6c5610_uniq UNIQUE (assetrequest_id, user_id);


--
-- Name: requests_assetrequest_issue_responsibles requests_assetrequest_issue_responsibles_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest_issue_responsibles
    ADD CONSTRAINT requests_assetrequest_issue_responsibles_pkey PRIMARY KEY (id);


--
-- Name: requests_assetrequest requests_assetrequest_number_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetrequest_number_key UNIQUE (number);


--
-- Name: requests_assetrequest requests_assetrequest_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetrequest_pkey PRIMARY KEY (id);


--
-- Name: requests_assetrequestitem requests_assetrequestitem_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequestitem
    ADD CONSTRAINT requests_assetrequestitem_pkey PRIMARY KEY (id);


--
-- Name: requests_requestapproval requests_requestapproval_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_requestapproval
    ADD CONSTRAINT requests_requestapproval_pkey PRIMARY KEY (id);


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_pkey PRIMARY KEY (id);


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_token_id_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_token_id_key UNIQUE (token_id);


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq UNIQUE (jti);


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outstandingtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outstandingtoken_pkey PRIMARY KEY (id);


--
-- Name: users_positionaccessrule unique_position_access_rule; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_positionaccessrule
    ADD CONSTRAINT unique_position_access_rule UNIQUE (normalized_position, permission_code);


--
-- Name: assets_stockalertstate unique_stock_alert_rule_state; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertstate
    ADD CONSTRAINT unique_stock_alert_rule_state UNIQUE (rule_id, stock_id);


--
-- Name: users_useraccessoverride unique_user_access_override; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_useraccessoverride
    ADD CONSTRAINT unique_user_access_override UNIQUE (user_id, permission_code);


--
-- Name: users_department users_department_code_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_department
    ADD CONSTRAINT users_department_code_key UNIQUE (code);


--
-- Name: users_department users_department_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_department
    ADD CONSTRAINT users_department_pkey PRIMARY KEY (id);


--
-- Name: users_positionaccessrule users_positionaccessrule_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_positionaccessrule
    ADD CONSTRAINT users_positionaccessrule_pkey PRIMARY KEY (id);


--
-- Name: users_user_groups users_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_groups
    ADD CONSTRAINT users_user_groups_pkey PRIMARY KEY (id);


--
-- Name: users_user_groups users_user_groups_user_id_group_id_b88eab82_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_groups
    ADD CONSTRAINT users_user_groups_user_id_group_id_b88eab82_uniq UNIQUE (user_id, group_id);


--
-- Name: users_user users_user_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user
    ADD CONSTRAINT users_user_pkey PRIMARY KEY (id);


--
-- Name: users_user_user_permissions users_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_user_permissions
    ADD CONSTRAINT users_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users_user_user_permissions users_user_user_permissions_user_id_permission_id_43338c45_uniq; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_user_permissions
    ADD CONSTRAINT users_user_user_permissions_user_id_permission_id_43338c45_uniq UNIQUE (user_id, permission_id);


--
-- Name: users_user users_user_username_key; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user
    ADD CONSTRAINT users_user_username_key UNIQUE (username);


--
-- Name: users_useraccessoverride users_useraccessoverride_pkey; Type: CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_useraccessoverride
    ADD CONSTRAINT users_useraccessoverride_pkey PRIMARY KEY (id);


--
-- Name: assets_assetassignment_asset_id_dc1a4798; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_assetassignment_asset_id_dc1a4798 ON public.assets_assetassignment USING btree (asset_id);


--
-- Name: assets_assetassignment_assigned_by_id_de4248ee; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_assetassignment_assigned_by_id_de4248ee ON public.assets_assetassignment USING btree (assigned_by_id);


--
-- Name: assets_assetassignment_user_id_1613d84a; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_assetassignment_user_id_1613d84a ON public.assets_assetassignment USING btree (user_id);


--
-- Name: assets_assetassignment_warehouse_id_2b2922ae; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_assetassignment_warehouse_id_2b2922ae ON public.assets_assetassignment USING btree (warehouse_id);


--
-- Name: assets_stockalertrule_assets_asset_id_64278e7d; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_assets_asset_id_64278e7d ON public.assets_stockalertrule_assets USING btree (asset_id);


--
-- Name: assets_stockalertrule_assets_stockalertrule_id_77324f68; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_assets_stockalertrule_id_77324f68 ON public.assets_stockalertrule_assets USING btree (stockalertrule_id);


--
-- Name: assets_stockalertrule_groups_assetcategory_id_d83dba17; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_groups_assetcategory_id_d83dba17 ON public.assets_stockalertrule_groups USING btree (assetcategory_id);


--
-- Name: assets_stockalertrule_groups_stockalertrule_id_28edd9a3; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_groups_stockalertrule_id_28edd9a3 ON public.assets_stockalertrule_groups USING btree (stockalertrule_id);


--
-- Name: assets_stockalertrule_recipients_stockalertrule_id_e94de6b7; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_recipients_stockalertrule_id_e94de6b7 ON public.assets_stockalertrule_recipients USING btree (stockalertrule_id);


--
-- Name: assets_stockalertrule_recipients_user_id_9be618f4; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_recipients_user_id_9be618f4 ON public.assets_stockalertrule_recipients USING btree (user_id);


--
-- Name: assets_stockalertrule_warehouses_stockalertrule_id_1f2f6b87; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_warehouses_stockalertrule_id_1f2f6b87 ON public.assets_stockalertrule_warehouses USING btree (stockalertrule_id);


--
-- Name: assets_stockalertrule_warehouses_warehouse_id_2cf77b6c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertrule_warehouses_warehouse_id_2cf77b6c ON public.assets_stockalertrule_warehouses USING btree (warehouse_id);


--
-- Name: assets_stockalertstate_rule_id_ee995b39; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertstate_rule_id_ee995b39 ON public.assets_stockalertstate USING btree (rule_id);


--
-- Name: assets_stockalertstate_stock_id_e3cebe55; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockalertstate_stock_id_e3cebe55 ON public.assets_stockalertstate USING btree (stock_id);


--
-- Name: assets_stockmovement_asset_id_f742357c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_asset_id_f742357c ON public.assets_stockmovement USING btree (asset_id);


--
-- Name: assets_stockmovement_document_type_id_1fba41fd; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_document_type_id_1fba41fd ON public.assets_stockmovement USING btree (document_type_id);


--
-- Name: assets_stockmovement_from_user_id_c20ca967; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_from_user_id_c20ca967 ON public.assets_stockmovement USING btree (from_user_id);


--
-- Name: assets_stockmovement_performed_by_id_2b4775ac; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_performed_by_id_2b4775ac ON public.assets_stockmovement USING btree (performed_by_id);


--
-- Name: assets_stockmovement_to_user_id_15a52994; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_to_user_id_15a52994 ON public.assets_stockmovement USING btree (to_user_id);


--
-- Name: assets_stockmovement_warehouse_id_c29b5a62; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_stockmovement_warehouse_id_c29b5a62 ON public.assets_stockmovement USING btree (warehouse_id);


--
-- Name: assets_warehousestock_warehouse_id_eaedc727; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX assets_warehousestock_warehouse_id_eaedc727 ON public.assets_warehousestock USING btree (warehouse_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_celery_beat_periodictask_clocked_id_47a69f82; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_celery_beat_periodictask_clocked_id_47a69f82 ON public.django_celery_beat_periodictask USING btree (clocked_id);


--
-- Name: django_celery_beat_periodictask_crontab_id_d3cba168; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_celery_beat_periodictask_crontab_id_d3cba168 ON public.django_celery_beat_periodictask USING btree (crontab_id);


--
-- Name: django_celery_beat_periodictask_interval_id_a8ca27da; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_celery_beat_periodictask_interval_id_a8ca27da ON public.django_celery_beat_periodictask USING btree (interval_id);


--
-- Name: django_celery_beat_periodictask_name_265a36b7_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_celery_beat_periodictask_name_265a36b7_like ON public.django_celery_beat_periodictask USING btree (name varchar_pattern_ops);


--
-- Name: django_celery_beat_periodictask_solar_id_a87ce72c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_celery_beat_periodictask_solar_id_a87ce72c ON public.django_celery_beat_periodictask USING btree (solar_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: documents_commissionmember_petition_id_12956dc4; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionmember_petition_id_12956dc4 ON public.documents_commissionmember USING btree (petition_id);


--
-- Name: documents_commissionmember_protocol_id_d1bd2fc2; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionmember_protocol_id_d1bd2fc2 ON public.documents_commissionmember USING btree (protocol_id);


--
-- Name: documents_commissionmember_user_id_ef777457; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionmember_user_id_ef777457 ON public.documents_commissionmember USING btree (user_id);


--
-- Name: documents_commissionmember_write_off_act_id_3f40f36d; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionmember_write_off_act_id_3f40f36d ON public.documents_commissionmember USING btree (write_off_act_id);


--
-- Name: documents_commissionprotocol_created_by_id_1b9c6002; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionprotocol_created_by_id_1b9c6002 ON public.documents_commissionprotocol USING btree (created_by_id);


--
-- Name: documents_commissionprotocol_petition_id_7b06fe66; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_commissionprotocol_petition_id_7b06fe66 ON public.documents_commissionprotocol USING btree (petition_id);


--
-- Name: documents_documentsignature_document_type_id_2c267eed; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_documentsignature_document_type_id_2c267eed ON public.documents_documentsignature USING btree (document_type_id);


--
-- Name: documents_documentsignature_signer_id_0a6e9cfd; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_documentsignature_signer_id_0a6e9cfd ON public.documents_documentsignature USING btree (signer_id);


--
-- Name: documents_incominginvoice_counterparty_id_6a4d728f; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoice_counterparty_id_6a4d728f ON public.documents_incominginvoice USING btree (counterparty_id);


--
-- Name: documents_incominginvoice_created_by_id_5c740962; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoice_created_by_id_5c740962 ON public.documents_incominginvoice USING btree (created_by_id);


--
-- Name: documents_incominginvoice_mol_warehouse_id_9538b023; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoice_mol_warehouse_id_9538b023 ON public.documents_incominginvoice USING btree (mol_warehouse_id);


--
-- Name: documents_incominginvoice_warehouse_id_8805499f; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoice_warehouse_id_8805499f ON public.documents_incominginvoice USING btree (warehouse_id);


--
-- Name: documents_incominginvoiceitem_asset_id_f76411ff; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoiceitem_asset_id_f76411ff ON public.documents_incominginvoiceitem USING btree (asset_id);


--
-- Name: documents_incominginvoiceitem_invoice_id_bc1b135e; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_incominginvoiceitem_invoice_id_bc1b135e ON public.documents_incominginvoiceitem USING btree (invoice_id);


--
-- Name: documents_internaltransferinvoice_created_by_id_8047983b; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_internaltransferinvoice_created_by_id_8047983b ON public.documents_internaltransferinvoice USING btree (created_by_id);


--
-- Name: documents_internaltransferinvoice_from_user_id_c363f3cb; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_internaltransferinvoice_from_user_id_c363f3cb ON public.documents_internaltransferinvoice USING btree (from_user_id);


--
-- Name: documents_internaltransferinvoice_to_user_id_8faec796; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_internaltransferinvoice_to_user_id_8faec796 ON public.documents_internaltransferinvoice USING btree (to_user_id);


--
-- Name: documents_internaltransferitem_asset_id_7ea705f6; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_internaltransferitem_asset_id_7ea705f6 ON public.documents_internaltransferitem USING btree (asset_id);


--
-- Name: documents_internaltransferitem_invoice_id_f371b33c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_internaltransferitem_invoice_id_f371b33c ON public.documents_internaltransferitem USING btree (invoice_id);


--
-- Name: documents_petition_created_by_id_79f55fd5; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_petition_created_by_id_79f55fd5 ON public.documents_petition USING btree (created_by_id);


--
-- Name: documents_petitionitem_asset_id_100577e9; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_petitionitem_asset_id_100577e9 ON public.documents_petitionitem USING btree (asset_id);


--
-- Name: documents_petitionitem_petition_id_7eba5fa4; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_petitionitem_petition_id_7eba5fa4 ON public.documents_petitionitem USING btree (petition_id);


--
-- Name: documents_protocolitem_asset_id_2d8bb274; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_protocolitem_asset_id_2d8bb274 ON public.documents_protocolitem USING btree (asset_id);


--
-- Name: documents_protocolitem_protocol_id_01593093; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_protocolitem_protocol_id_01593093 ON public.documents_protocolitem USING btree (protocol_id);


--
-- Name: documents_writeoffact_created_by_id_d2b26093; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_writeoffact_created_by_id_d2b26093 ON public.documents_writeoffact USING btree (created_by_id);


--
-- Name: documents_writeoffactitem_act_id_a87feaed; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_writeoffactitem_act_id_a87feaed ON public.documents_writeoffactitem USING btree (act_id);


--
-- Name: documents_writeoffactitem_asset_id_cece78e8; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX documents_writeoffactitem_asset_id_cece78e8 ON public.documents_writeoffactitem USING btree (asset_id);


--
-- Name: notifications_emaillog_related_notification_id_9c077fa5; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX notifications_emaillog_related_notification_id_9c077fa5 ON public.notifications_emaillog USING btree (related_notification_id);


--
-- Name: notifications_notification_recipient_id_d055f3f0; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX notifications_notification_recipient_id_d055f3f0 ON public.notifications_notification USING btree (recipient_id);


--
-- Name: notifications_notification_related_content_type_id_d51effd3; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX notifications_notification_related_content_type_id_d51effd3 ON public.notifications_notification USING btree (related_content_type_id);


--
-- Name: references_asset_category_id_6445b1aa; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_asset_category_id_6445b1aa ON public.references_asset USING btree (category_id);


--
-- Name: references_asset_code_99663318_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_asset_code_99663318_like ON public.references_asset USING btree (code varchar_pattern_ops);


--
-- Name: references_asset_group_id_dd0819d3; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_asset_group_id_dd0819d3 ON public.references_asset USING btree (group_id);


--
-- Name: references_asset_source_1c_id_611416c1_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_asset_source_1c_id_611416c1_like ON public.references_asset USING btree (source_1c_id varchar_pattern_ops);


--
-- Name: references_asset_unit_of_measure_ref_id_eb07ddaf; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_asset_unit_of_measure_ref_id_eb07ddaf ON public.references_asset USING btree (unit_of_measure_ref_id);


--
-- Name: references_assetcategory_code_5258a137_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_assetcategory_code_5258a137_like ON public.references_assetcategory USING btree (code varchar_pattern_ops);


--
-- Name: references_assetcategory_parent_id_08f6fec0; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_assetcategory_parent_id_08f6fec0 ON public.references_assetcategory USING btree (parent_id);


--
-- Name: references_contract_counterparty_id_c4163b49; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_contract_counterparty_id_c4163b49 ON public.references_contract USING btree (counterparty_id);


--
-- Name: references_counterparty_bin_6c0799d2_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_counterparty_bin_6c0799d2_like ON public.references_counterparty USING btree (bin varchar_pattern_ops);


--
-- Name: references_limitnorm_created_by_id_c9827e13; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_limitnorm_created_by_id_c9827e13 ON public.references_limitnorm USING btree (created_by_id);


--
-- Name: references_limitnorm_department_id_b1e481a7; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_limitnorm_department_id_b1e481a7 ON public.references_limitnorm USING btree (department_id);


--
-- Name: references_position_code_a2bb180d_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_position_code_a2bb180d_like ON public.references_position USING btree (code varchar_pattern_ops);


--
-- Name: references_position_name_802643f9_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_position_name_802643f9_like ON public.references_position USING btree (name varchar_pattern_ops);


--
-- Name: references_requesttype_code_61369e20_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_requesttype_code_61369e20_like ON public.references_requesttype USING btree (code varchar_pattern_ops);


--
-- Name: references_unitofmeasure_code_4b324c2b_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_unitofmeasure_code_4b324c2b_like ON public.references_unitofmeasure USING btree (code varchar_pattern_ops);


--
-- Name: references_unitofmeasure_name_d8edd0a3_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_unitofmeasure_name_d8edd0a3_like ON public.references_unitofmeasure USING btree (name varchar_pattern_ops);


--
-- Name: references_warehouse_code_2b4791c0_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_warehouse_code_2b4791c0_like ON public.references_warehouse USING btree (code varchar_pattern_ops);


--
-- Name: references_warehouse_department_id_b5ea45dc; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX references_warehouse_department_id_b5ea45dc ON public.references_warehouse USING btree (department_id);


--
-- Name: requests_approvalstep_request_type_id_b029632c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_approvalstep_request_type_id_b029632c ON public.requests_approvalstep USING btree (request_type_id);


--
-- Name: requests_assetrequest_deletion_requested_by_id_d12a071c; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_deletion_requested_by_id_d12a071c ON public.requests_assetrequest USING btree (deletion_requested_by_id);


--
-- Name: requests_assetrequest_from_user_id_d4365c3a; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_from_user_id_d4365c3a ON public.requests_assetrequest USING btree (from_user_id);


--
-- Name: requests_assetrequest_initiator_id_97efd73d; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_initiator_id_97efd73d ON public.requests_assetrequest USING btree (initiator_id);


--
-- Name: requests_assetrequest_issu_assetrequest_id_25cacbcb; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_issu_assetrequest_id_25cacbcb ON public.requests_assetrequest_issue_responsibles USING btree (assetrequest_id);


--
-- Name: requests_assetrequest_issue_responsibles_user_id_3b5aba38; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_issue_responsibles_user_id_3b5aba38 ON public.requests_assetrequest_issue_responsibles USING btree (user_id);


--
-- Name: requests_assetrequest_number_a3011084_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_number_a3011084_like ON public.requests_assetrequest USING btree (number varchar_pattern_ops);


--
-- Name: requests_assetrequest_request_type_id_5693fe20; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_request_type_id_5693fe20 ON public.requests_assetrequest USING btree (request_type_id);


--
-- Name: requests_assetrequest_to_user_id_f450525d; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequest_to_user_id_f450525d ON public.requests_assetrequest USING btree (to_user_id);


--
-- Name: requests_assetrequestitem_asset_id_678b1be0; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequestitem_asset_id_678b1be0 ON public.requests_assetrequestitem USING btree (asset_id);


--
-- Name: requests_assetrequestitem_issued_asset_id_205dc5c9; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequestitem_issued_asset_id_205dc5c9 ON public.requests_assetrequestitem USING btree (issued_asset_id);


--
-- Name: requests_assetrequestitem_request_id_60859336; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequestitem_request_id_60859336 ON public.requests_assetrequestitem USING btree (request_id);


--
-- Name: requests_assetrequestitem_requested_group_id_734aa812; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_assetrequestitem_requested_group_id_734aa812 ON public.requests_assetrequestitem USING btree (requested_group_id);


--
-- Name: requests_requestapproval_approver_id_7d8df8d1; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_requestapproval_approver_id_7d8df8d1 ON public.requests_requestapproval USING btree (approver_id);


--
-- Name: requests_requestapproval_request_id_2272a898; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX requests_requestapproval_request_id_2272a898 ON public.requests_requestapproval USING btree (request_id);


--
-- Name: token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_like ON public.token_blacklist_outstandingtoken USING btree (jti varchar_pattern_ops);


--
-- Name: token_blacklist_outstandingtoken_user_id_83bc629a; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX token_blacklist_outstandingtoken_user_id_83bc629a ON public.token_blacklist_outstandingtoken USING btree (user_id);


--
-- Name: users_department_code_57e93280_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_department_code_57e93280_like ON public.users_department USING btree (code varchar_pattern_ops);


--
-- Name: users_department_head_id_290f19f8; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_department_head_id_290f19f8 ON public.users_department USING btree (head_id);


--
-- Name: users_department_parent_id_0661c5e5; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_department_parent_id_0661c5e5 ON public.users_department USING btree (parent_id);


--
-- Name: users_positionaccessrule_normalized_position_cc09794a; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_positionaccessrule_normalized_position_cc09794a ON public.users_positionaccessrule USING btree (normalized_position);


--
-- Name: users_positionaccessrule_normalized_position_cc09794a_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_positionaccessrule_normalized_position_cc09794a_like ON public.users_positionaccessrule USING btree (normalized_position varchar_pattern_ops);


--
-- Name: users_user_department_id_626c0154; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_department_id_626c0154 ON public.users_user USING btree (department_id);


--
-- Name: users_user_groups_group_id_9afc8d0e; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_groups_group_id_9afc8d0e ON public.users_user_groups USING btree (group_id);


--
-- Name: users_user_groups_user_id_5f6f5a90; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_groups_user_id_5f6f5a90 ON public.users_user_groups USING btree (user_id);


--
-- Name: users_user_position_ref_id_909c7217; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_position_ref_id_909c7217 ON public.users_user USING btree (position_ref_id);


--
-- Name: users_user_supervisor_id_5f1670ee; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_supervisor_id_5f1670ee ON public.users_user USING btree (supervisor_id);


--
-- Name: users_user_user_permissions_permission_id_0b93982e; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_user_permissions_permission_id_0b93982e ON public.users_user_user_permissions USING btree (permission_id);


--
-- Name: users_user_user_permissions_user_id_20aca447; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_user_permissions_user_id_20aca447 ON public.users_user_user_permissions USING btree (user_id);


--
-- Name: users_user_username_06e46fe6_like; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_user_username_06e46fe6_like ON public.users_user USING btree (username varchar_pattern_ops);


--
-- Name: users_useraccessoverride_user_id_9fdf9aba; Type: INDEX; Schema: public; Owner: asu_user
--

CREATE INDEX users_useraccessoverride_user_id_9fdf9aba ON public.users_useraccessoverride USING btree (user_id);


--
-- Name: assets_assetassignment assets_assetassignme_warehouse_id_2b2922ae_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_assetassignment
    ADD CONSTRAINT assets_assetassignme_warehouse_id_2b2922ae_fk_reference FOREIGN KEY (warehouse_id) REFERENCES public.references_warehouse(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_assetassignment assets_assetassignment_asset_id_dc1a4798_fk_references_asset_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_assetassignment
    ADD CONSTRAINT assets_assetassignment_asset_id_dc1a4798_fk_references_asset_id FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_assetassignment assets_assetassignment_assigned_by_id_de4248ee_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_assetassignment
    ADD CONSTRAINT assets_assetassignment_assigned_by_id_de4248ee_fk_users_user_id FOREIGN KEY (assigned_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_assetassignment assets_assetassignment_user_id_1613d84a_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_assetassignment
    ADD CONSTRAINT assets_assetassignment_user_id_1613d84a_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_assets assets_stockalertrul_asset_id_64278e7d_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_assets
    ADD CONSTRAINT assets_stockalertrul_asset_id_64278e7d_fk_reference FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_groups assets_stockalertrul_assetcategory_id_d83dba17_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_groups
    ADD CONSTRAINT assets_stockalertrul_assetcategory_id_d83dba17_fk_reference FOREIGN KEY (assetcategory_id) REFERENCES public.references_assetcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_warehouses assets_stockalertrul_stockalertrule_id_1f2f6b87_fk_assets_st; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_warehouses
    ADD CONSTRAINT assets_stockalertrul_stockalertrule_id_1f2f6b87_fk_assets_st FOREIGN KEY (stockalertrule_id) REFERENCES public.assets_stockalertrule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_groups assets_stockalertrul_stockalertrule_id_28edd9a3_fk_assets_st; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_groups
    ADD CONSTRAINT assets_stockalertrul_stockalertrule_id_28edd9a3_fk_assets_st FOREIGN KEY (stockalertrule_id) REFERENCES public.assets_stockalertrule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_assets assets_stockalertrul_stockalertrule_id_77324f68_fk_assets_st; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_assets
    ADD CONSTRAINT assets_stockalertrul_stockalertrule_id_77324f68_fk_assets_st FOREIGN KEY (stockalertrule_id) REFERENCES public.assets_stockalertrule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_recipients assets_stockalertrul_stockalertrule_id_e94de6b7_fk_assets_st; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_recipients
    ADD CONSTRAINT assets_stockalertrul_stockalertrule_id_e94de6b7_fk_assets_st FOREIGN KEY (stockalertrule_id) REFERENCES public.assets_stockalertrule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_recipients assets_stockalertrul_user_id_9be618f4_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_recipients
    ADD CONSTRAINT assets_stockalertrul_user_id_9be618f4_fk_users_use FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertrule_warehouses assets_stockalertrul_warehouse_id_2cf77b6c_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertrule_warehouses
    ADD CONSTRAINT assets_stockalertrul_warehouse_id_2cf77b6c_fk_reference FOREIGN KEY (warehouse_id) REFERENCES public.references_warehouse(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertstate assets_stockalertsta_rule_id_ee995b39_fk_assets_st; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertstate
    ADD CONSTRAINT assets_stockalertsta_rule_id_ee995b39_fk_assets_st FOREIGN KEY (rule_id) REFERENCES public.assets_stockalertrule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockalertstate assets_stockalertsta_stock_id_e3cebe55_fk_assets_wa; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockalertstate
    ADD CONSTRAINT assets_stockalertsta_stock_id_e3cebe55_fk_assets_wa FOREIGN KEY (stock_id) REFERENCES public.assets_warehousestock(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_asset_id_f742357c_fk_references_asset_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_asset_id_f742357c_fk_references_asset_id FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_document_type_id_1fba41fd_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_document_type_id_1fba41fd_fk_django_co FOREIGN KEY (document_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_from_user_id_c20ca967_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_from_user_id_c20ca967_fk_users_user_id FOREIGN KEY (from_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_performed_by_id_2b4775ac_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_performed_by_id_2b4775ac_fk_users_user_id FOREIGN KEY (performed_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_to_user_id_15a52994_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_to_user_id_15a52994_fk_users_user_id FOREIGN KEY (to_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_stockmovement assets_stockmovement_warehouse_id_c29b5a62_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_stockmovement
    ADD CONSTRAINT assets_stockmovement_warehouse_id_c29b5a62_fk_reference FOREIGN KEY (warehouse_id) REFERENCES public.references_warehouse(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_warehousestock assets_warehousestoc_warehouse_id_eaedc727_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_warehousestock
    ADD CONSTRAINT assets_warehousestoc_warehouse_id_eaedc727_fk_reference FOREIGN KEY (warehouse_id) REFERENCES public.references_warehouse(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assets_warehousestock assets_warehousestock_asset_id_fa6a5900_fk_references_asset_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.assets_warehousestock
    ADD CONSTRAINT assets_warehousestock_asset_id_fa6a5900_fk_references_asset_id FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_clocked_id_47a69f82_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_clocked_id_47a69f82_fk_django_ce FOREIGN KEY (clocked_id) REFERENCES public.django_celery_beat_clockedschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_crontab_id_d3cba168_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_crontab_id_d3cba168_fk_django_ce FOREIGN KEY (crontab_id) REFERENCES public.django_celery_beat_crontabschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_interval_id_a8ca27da_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_interval_id_a8ca27da_fk_django_ce FOREIGN KEY (interval_id) REFERENCES public.django_celery_beat_intervalschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_solar_id_a87ce72c_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_solar_id_a87ce72c_fk_django_ce FOREIGN KEY (solar_id) REFERENCES public.django_celery_beat_solarschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionprotocol documents_commission_created_by_id_1b9c6002_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionprotocol
    ADD CONSTRAINT documents_commission_created_by_id_1b9c6002_fk_users_use FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionmember documents_commission_petition_id_12956dc4_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionmember
    ADD CONSTRAINT documents_commission_petition_id_12956dc4_fk_documents FOREIGN KEY (petition_id) REFERENCES public.documents_petition(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionprotocol documents_commission_petition_id_7b06fe66_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionprotocol
    ADD CONSTRAINT documents_commission_petition_id_7b06fe66_fk_documents FOREIGN KEY (petition_id) REFERENCES public.documents_petition(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionmember documents_commission_protocol_id_d1bd2fc2_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionmember
    ADD CONSTRAINT documents_commission_protocol_id_d1bd2fc2_fk_documents FOREIGN KEY (protocol_id) REFERENCES public.documents_commissionprotocol(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionmember documents_commission_write_off_act_id_3f40f36d_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionmember
    ADD CONSTRAINT documents_commission_write_off_act_id_3f40f36d_fk_documents FOREIGN KEY (write_off_act_id) REFERENCES public.documents_writeoffact(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_commissionmember documents_commissionmember_user_id_ef777457_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_commissionmember
    ADD CONSTRAINT documents_commissionmember_user_id_ef777457_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_documentsignature documents_documentsi_document_type_id_2c267eed_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_documentsignature
    ADD CONSTRAINT documents_documentsi_document_type_id_2c267eed_fk_django_co FOREIGN KEY (document_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_documentsignature documents_documentsignature_signer_id_0a6e9cfd_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_documentsignature
    ADD CONSTRAINT documents_documentsignature_signer_id_0a6e9cfd_fk_users_user_id FOREIGN KEY (signer_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoiceitem documents_incomingin_asset_id_f76411ff_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoiceitem
    ADD CONSTRAINT documents_incomingin_asset_id_f76411ff_fk_reference FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoice documents_incomingin_counterparty_id_6a4d728f_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoice
    ADD CONSTRAINT documents_incomingin_counterparty_id_6a4d728f_fk_reference FOREIGN KEY (counterparty_id) REFERENCES public.references_counterparty(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoice documents_incomingin_created_by_id_5c740962_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoice
    ADD CONSTRAINT documents_incomingin_created_by_id_5c740962_fk_users_use FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoiceitem documents_incomingin_invoice_id_bc1b135e_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoiceitem
    ADD CONSTRAINT documents_incomingin_invoice_id_bc1b135e_fk_documents FOREIGN KEY (invoice_id) REFERENCES public.documents_incominginvoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoice documents_incomingin_mol_warehouse_id_9538b023_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoice
    ADD CONSTRAINT documents_incomingin_mol_warehouse_id_9538b023_fk_users_use FOREIGN KEY (mol_warehouse_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_incominginvoice documents_incomingin_warehouse_id_8805499f_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_incominginvoice
    ADD CONSTRAINT documents_incomingin_warehouse_id_8805499f_fk_reference FOREIGN KEY (warehouse_id) REFERENCES public.references_warehouse(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_internaltransferitem documents_internaltr_asset_id_7ea705f6_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferitem
    ADD CONSTRAINT documents_internaltr_asset_id_7ea705f6_fk_reference FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_internaltransferinvoice documents_internaltr_created_by_id_8047983b_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferinvoice
    ADD CONSTRAINT documents_internaltr_created_by_id_8047983b_fk_users_use FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_internaltransferinvoice documents_internaltr_from_user_id_c363f3cb_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferinvoice
    ADD CONSTRAINT documents_internaltr_from_user_id_c363f3cb_fk_users_use FOREIGN KEY (from_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_internaltransferitem documents_internaltr_invoice_id_f371b33c_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferitem
    ADD CONSTRAINT documents_internaltr_invoice_id_f371b33c_fk_documents FOREIGN KEY (invoice_id) REFERENCES public.documents_internaltransferinvoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_internaltransferinvoice documents_internaltr_to_user_id_8faec796_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_internaltransferinvoice
    ADD CONSTRAINT documents_internaltr_to_user_id_8faec796_fk_users_use FOREIGN KEY (to_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_petition documents_petition_created_by_id_79f55fd5_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_petition
    ADD CONSTRAINT documents_petition_created_by_id_79f55fd5_fk_users_user_id FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_petitionitem documents_petitionit_petition_id_7eba5fa4_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_petitionitem
    ADD CONSTRAINT documents_petitionit_petition_id_7eba5fa4_fk_documents FOREIGN KEY (petition_id) REFERENCES public.documents_petition(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_petitionitem documents_petitionitem_asset_id_100577e9_fk_references_asset_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_petitionitem
    ADD CONSTRAINT documents_petitionitem_asset_id_100577e9_fk_references_asset_id FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_protocolitem documents_protocolit_protocol_id_01593093_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_protocolitem
    ADD CONSTRAINT documents_protocolit_protocol_id_01593093_fk_documents FOREIGN KEY (protocol_id) REFERENCES public.documents_commissionprotocol(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_protocolitem documents_protocolitem_asset_id_2d8bb274_fk_references_asset_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_protocolitem
    ADD CONSTRAINT documents_protocolitem_asset_id_2d8bb274_fk_references_asset_id FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_writeoffactitem documents_writeoffac_act_id_a87feaed_fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_writeoffactitem
    ADD CONSTRAINT documents_writeoffac_act_id_a87feaed_fk_documents FOREIGN KEY (act_id) REFERENCES public.documents_writeoffact(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_writeoffactitem documents_writeoffac_asset_id_cece78e8_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_writeoffactitem
    ADD CONSTRAINT documents_writeoffac_asset_id_cece78e8_fk_reference FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents_writeoffact documents_writeoffact_created_by_id_d2b26093_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.documents_writeoffact
    ADD CONSTRAINT documents_writeoffact_created_by_id_d2b26093_fk_users_user_id FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notifications_emaillog notifications_emaill_related_notification_9c077fa5_fk_notificat; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.notifications_emaillog
    ADD CONSTRAINT notifications_emaill_related_notification_9c077fa5_fk_notificat FOREIGN KEY (related_notification_id) REFERENCES public.notifications_notification(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notifications_notification notifications_notifi_recipient_id_d055f3f0_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.notifications_notification
    ADD CONSTRAINT notifications_notifi_recipient_id_d055f3f0_fk_users_use FOREIGN KEY (recipient_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notifications_notification notifications_notifi_related_content_type_d51effd3_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.notifications_notification
    ADD CONSTRAINT notifications_notifi_related_content_type_d51effd3_fk_django_co FOREIGN KEY (related_content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_asset references_asset_category_id_6445b1aa_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_category_id_6445b1aa_fk_reference FOREIGN KEY (category_id) REFERENCES public.references_assetcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_asset references_asset_group_id_dd0819d3_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_group_id_dd0819d3_fk_reference FOREIGN KEY (group_id) REFERENCES public.references_assetcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_asset references_asset_unit_of_measure_ref__eb07ddaf_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_asset
    ADD CONSTRAINT references_asset_unit_of_measure_ref__eb07ddaf_fk_reference FOREIGN KEY (unit_of_measure_ref_id) REFERENCES public.references_unitofmeasure(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_assetcategory references_assetcate_parent_id_08f6fec0_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_assetcategory
    ADD CONSTRAINT references_assetcate_parent_id_08f6fec0_fk_reference FOREIGN KEY (parent_id) REFERENCES public.references_assetcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_contract references_contract_counterparty_id_c4163b49_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_contract
    ADD CONSTRAINT references_contract_counterparty_id_c4163b49_fk_reference FOREIGN KEY (counterparty_id) REFERENCES public.references_counterparty(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_limitnorm references_limitnorm_created_by_id_c9827e13_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_limitnorm
    ADD CONSTRAINT references_limitnorm_created_by_id_c9827e13_fk_users_user_id FOREIGN KEY (created_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_limitnorm references_limitnorm_department_id_b1e481a7_fk_users_dep; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_limitnorm
    ADD CONSTRAINT references_limitnorm_department_id_b1e481a7_fk_users_dep FOREIGN KEY (department_id) REFERENCES public.users_department(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: references_warehouse references_warehouse_department_id_b5ea45dc_fk_users_dep; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.references_warehouse
    ADD CONSTRAINT references_warehouse_department_id_b5ea45dc_fk_users_dep FOREIGN KEY (department_id) REFERENCES public.users_department(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_approvalstep requests_approvalste_request_type_id_b029632c_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_approvalstep
    ADD CONSTRAINT requests_approvalste_request_type_id_b029632c_fk_reference FOREIGN KEY (request_type_id) REFERENCES public.references_requesttype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequestitem requests_assetreques_asset_id_678b1be0_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequestitem
    ADD CONSTRAINT requests_assetreques_asset_id_678b1be0_fk_reference FOREIGN KEY (asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest_issue_responsibles requests_assetreques_assetrequest_id_25cacbcb_fk_requests_; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest_issue_responsibles
    ADD CONSTRAINT requests_assetreques_assetrequest_id_25cacbcb_fk_requests_ FOREIGN KEY (assetrequest_id) REFERENCES public.requests_assetrequest(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest requests_assetreques_deletion_requested_b_d12a071c_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetreques_deletion_requested_b_d12a071c_fk_users_use FOREIGN KEY (deletion_requested_by_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequestitem requests_assetreques_issued_asset_id_205dc5c9_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequestitem
    ADD CONSTRAINT requests_assetreques_issued_asset_id_205dc5c9_fk_reference FOREIGN KEY (issued_asset_id) REFERENCES public.references_asset(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequestitem requests_assetreques_request_id_60859336_fk_requests_; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequestitem
    ADD CONSTRAINT requests_assetreques_request_id_60859336_fk_requests_ FOREIGN KEY (request_id) REFERENCES public.requests_assetrequest(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest requests_assetreques_request_type_id_5693fe20_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetreques_request_type_id_5693fe20_fk_reference FOREIGN KEY (request_type_id) REFERENCES public.references_requesttype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequestitem requests_assetreques_requested_group_id_734aa812_fk_reference; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequestitem
    ADD CONSTRAINT requests_assetreques_requested_group_id_734aa812_fk_reference FOREIGN KEY (requested_group_id) REFERENCES public.references_assetcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest_issue_responsibles requests_assetreques_user_id_3b5aba38_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest_issue_responsibles
    ADD CONSTRAINT requests_assetreques_user_id_3b5aba38_fk_users_use FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest requests_assetrequest_from_user_id_d4365c3a_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetrequest_from_user_id_d4365c3a_fk_users_user_id FOREIGN KEY (from_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest requests_assetrequest_initiator_id_97efd73d_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetrequest_initiator_id_97efd73d_fk_users_user_id FOREIGN KEY (initiator_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_assetrequest requests_assetrequest_to_user_id_f450525d_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_assetrequest
    ADD CONSTRAINT requests_assetrequest_to_user_id_f450525d_fk_users_user_id FOREIGN KEY (to_user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_requestapproval requests_requestappr_request_id_2272a898_fk_requests_; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_requestapproval
    ADD CONSTRAINT requests_requestappr_request_id_2272a898_fk_requests_ FOREIGN KEY (request_id) REFERENCES public.requests_assetrequest(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: requests_requestapproval requests_requestapproval_approver_id_7d8df8d1_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.requests_requestapproval
    ADD CONSTRAINT requests_requestapproval_approver_id_7d8df8d1_fk_users_user_id FOREIGN KEY (approver_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: token_blacklist_blacklistedtoken token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_blacklistedtoken
    ADD CONSTRAINT token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk FOREIGN KEY (token_id) REFERENCES public.token_blacklist_outstandingtoken(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: token_blacklist_outstandingtoken token_blacklist_outs_user_id_83bc629a_fk_users_use; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.token_blacklist_outstandingtoken
    ADD CONSTRAINT token_blacklist_outs_user_id_83bc629a_fk_users_use FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_department users_department_head_id_290f19f8_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_department
    ADD CONSTRAINT users_department_head_id_290f19f8_fk_users_user_id FOREIGN KEY (head_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_department users_department_parent_id_0661c5e5_fk_users_department_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_department
    ADD CONSTRAINT users_department_parent_id_0661c5e5_fk_users_department_id FOREIGN KEY (parent_id) REFERENCES public.users_department(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user users_user_department_id_626c0154_fk_users_department_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user
    ADD CONSTRAINT users_user_department_id_626c0154_fk_users_department_id FOREIGN KEY (department_id) REFERENCES public.users_department(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_groups users_user_groups_group_id_9afc8d0e_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_groups
    ADD CONSTRAINT users_user_groups_group_id_9afc8d0e_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_groups users_user_groups_user_id_5f6f5a90_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_groups
    ADD CONSTRAINT users_user_groups_user_id_5f6f5a90_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user users_user_position_ref_id_909c7217_fk_references_position_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user
    ADD CONSTRAINT users_user_position_ref_id_909c7217_fk_references_position_id FOREIGN KEY (position_ref_id) REFERENCES public.references_position(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user users_user_supervisor_id_5f1670ee_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user
    ADD CONSTRAINT users_user_supervisor_id_5f1670ee_fk_users_user_id FOREIGN KEY (supervisor_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_user_permissions users_user_user_perm_permission_id_0b93982e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_user_permissions
    ADD CONSTRAINT users_user_user_perm_permission_id_0b93982e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_user_permissions users_user_user_permissions_user_id_20aca447_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_user_user_permissions
    ADD CONSTRAINT users_user_user_permissions_user_id_20aca447_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_useraccessoverride users_useraccessoverride_user_id_9fdf9aba_fk_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: asu_user
--

ALTER TABLE ONLY public.users_useraccessoverride
    ADD CONSTRAINT users_useraccessoverride_user_id_9fdf9aba_fk_users_user_id FOREIGN KEY (user_id) REFERENCES public.users_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

\unrestrict PRvga8iAyyppvoauhd9v5mnueTxliop5RfQmftzwsR0lde8tmpV3SbmhryvQYGh

