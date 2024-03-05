export interface UserRow {
  ID: number;
  user_login: string;
  user_pass: string;
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: Date;
  user_activation_key: string;
  user_status: number;
  display_name: string;

  // customers
  wp_user_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birthday: Date;
  country: string;
  state: string;
  postcode: string;
  city: string;
  street: string;
  street_number: string;
  additional_address: string;
  notes: string;
  created_at: Date;
}

export interface HobUser {
  ID: number;
  user_login: string;
  user_pass: string;
  user_nicename: string;
  user_email: string;
  user_url: string;
  user_registered: Date;
  user_activation_key: string;
  user_status: number;
  display_name: string;
}

export interface MetaRow {
  umeta_id: number;
  user_id: number;
  meta_key: string;
  meta_value: string;
}

export interface EventRow {
  ca_bookly_id: number;
  appointment_id: number;
  status: string;
  service_name: string;
  service_id: number;
  wp_user_id: number;
  bookly_user_id: number;
  phone: string;
  staff_name: string;
  start_date: Date;
  end_date: Date;
  full_name: string;
  created_from: string;
  location_id: number;
  created_at: Date;
  updated_at: Date;
  custom_fields: string;
  internal_note: string;
  staff_any: boolean;
  staff_id: number;
}

export interface KeyValue {
  key: string;
  value: string;
}

export enum GentlemanAgreementKeys {
  ga_id = "ga_id",
  ga_purchase_date = "ga_purchase_date",
  ga_type = "ga_type",
  ga_service = "ga_service",
  ga_paid = "ga_paid",
  ga_price = "ga_price",
  ga_amount = "ga_amount",
  ga_appointments = "ga_appointments",
  ga_payment_method = "ga_payment_method",
  ga_redeemed = "ga_redeemed",
}
