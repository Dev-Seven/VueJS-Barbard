import axios from "axios";

export interface CreateContactParams {
  // "channel_id": 912793,
  identifier: string; // string
  name: string; // first name + last name
}

export interface CreateContactResponse {
  id: number;
  name: string;
  full_name: string;
  email: string;
  abbr: string;
  color: string;
  profile_image?: string;
  is_phone: boolean;
  phone?: string;
  formatted_phone?: string;
  avatar: string;
  identifier: string;
  custom_field_data?: null;
  pivot?: null;
  formatted_custom_field_data: [];
  display_name: string;
  is_private: boolean;
  custom_field_values: [];
}

export interface CreateProfileParams {
  name: string;
}

export interface CreateProfileResponse {
  agency_id: number;
  created_by: number;
  name: string;
  color: string;
  updated_at: string;
  created_at: string;
  id: number;
  profile_image: null;
  abbr: string;
}

export interface LinkContactParams {
  contact_id: number;
  type: "EMAIL" | "TELEGRAM" | "WA_BUSINESS";
}

export enum CustomerFieldId {
  memberGroup = 358308,
  lastBarber = 358213,
  lastAppointment = 358288,
  totalAppointments = 358293,
  lastReservation = 358298,
  totalReservation = 358303,
  location = 358433,
  hasAgreement = 358353,
  agreementServicesLeft = 358358,
}

export interface CreateTicketResponse {
  agency_id: number;
  contact_id: number;
  status: string;
  user_id: number;
  assigned_at: string;
  assigned_by: number;
  channel_id: number;
  subject: string;
  updated_at: string;
  created_at: string;
  id: number;
  latest_message: string;
  channel: {
    id: number;
    phone: string;
    name: string;
    title: string;
    username: null;
    password: null;
    status_update: null;
    status: string;
    type: string;
    business_hour_id: 262324;
    is_wa_connector: 0;
    logo_path: null;
    account_type: null;
    last_login_at: null;
    last_activity_at: null;
    expires_at: null;
    telegram_last_update_id: null;
    notification_email: null;
    is_running: 0;
    agency_id: 228168;
    auto_reply: string;
    wa_server_id: null;
    connection_error_notification_email: null;
    price: "15.00";
    color: null;
    show_ticket_fields: 1;
    show_contact_fields: 1;
    can_be_deleted_at: null;
    requested_by: 493303;
    reopen_closed_ticket: 1;
    deleted_at: null;
    created_at: string;
    updated_at: string;
    notification_sound: string;
    formatted_phone: string;
    password_is_null: false;
    reassign_reopened_ticket: false;
    reopen_closed_ticket_time_window_days: 30;
    users: [];
    agency: {
      id: 228168;
      name: "Barbaard";
      slug: "barbaard";
      status: "ACTIVE";
      trial_ends_at: null;
      channel_prefix: "fGhFaMj3FHQyDw1nUFlt9jvhMT7JKjl6SZNVrLEF3eF6yxrkzSBcLq6EBBI28xGFYmTdsqdBrrAvi2o2WIwetpJcdE7HFyzf7wacWUOER0iQziJYkNnURiCJJkwPo";
      plan: null;
      subscription_started_at: null;
      moneybird_is_synced: 0;
      moneybird_contact_id: null;
      is_white_labelled: 0;
      agency_parent_id: null;
      price_package_a: null;
      price_package_b: null;
      price_package_c: null;
      locale_code: "en-GB";
      has_session_limit: 1;
      enable_whatsapp: 0;
      enable_bulk_sms: 0;
      enable_invoicing: 0;
      add_wa_contacts: 0;
      deleted_at: null;
      created_at: "2022-07-04T19:21:34.000000Z";
      updated_at: "2022-07-21T05:04:15.000000Z";
      pricing: {
        A: null;
        B: null;
        C: null;
      };
    };
    meta: [
      {
        id: 928333;
        type: "channel";
        type_id: 912798;
        key: "reassign_reopened_ticket";
        value: "0";
        created_at: "2022-07-04T19:41:39.000000Z";
        updated_at: "2022-07-04T19:41:39.000000Z";
        deleted_at: null;
      },
      {
        id: 928338;
        type: "channel";
        type_id: 912798;
        key: "reopen_closed_ticket_time_window_days";
        value: "30";
        created_at: "2022-07-04T19:41:39.000000Z";
        updated_at: "2022-07-04T19:41:39.000000Z";
        deleted_at: null;
      },
    ];
  };
}

export const emailChannel = 912793; // is for email based contacts

export const phoneChannel = 912798; // is for phone based contacts

export const whatsappChannel = 912803;

export const appointmentReminderLabelId = 1141274;

export class Trengo {
  constructor(private token: string) {}

  async createContactEmail(params: CreateContactParams) {
    const response = await axios.post(
      `https://app.trengo.com/api/v2/channels/${emailChannel}/contacts`,
      {
        channel_id: emailChannel,
        ...params,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data as CreateContactResponse;
  }

  async createContactPhone(params: CreateContactParams) {
    const response = await axios.post(
      `https://app.trengo.com/api/v2/channels/${phoneChannel}/contacts`,
      {
        channel_id: phoneChannel,
        ...params,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data as CreateContactResponse;
  }

  async createProfile(params: CreateProfileParams) {
    const response = await axios.post(
      "https://app.trengo.com/api/v2/profiles",
      params,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data as CreateProfileResponse;
  }

  async linkContact(profileId: number, params: LinkContactParams) {
    console.log({ profileId, params });
    const response = await axios.post(
      `https://app.trengo.com/api/v2/profiles/${profileId}/contacts`,
      params,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async setCustomerField(
    profileId: number,
    custom_field_id: CustomerFieldId,
    value: number | string,
  ) {
    const response = await axios.post(
      `https://app.trengo.com/api/v2/profiles/${profileId}/custom_fields`,
      {
        custom_field_id,
        value,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async createTicket(
    channelId: number,
    contactId: number,
    subject: string,
  ): Promise<CreateTicketResponse> {
    const response = await axios.post(
      "https://app.trengo.com/api/v2/tickets",
      {
        channel_id: channelId,
        contact_id: contactId,
        subject,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async attachLabel(ticketId: number, label_id: number): Promise<void> {
    const response = await axios.post(
      `https://app.trengo.com/api/v2/tickets/${ticketId}/labels`,
      {
        label_id,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async startWhatsAppConversation(
    ticketId: number,
    hsmId: number,
    params: object,
  ) {
    const response = await axios.post(
      "https://app.trengo.com/api/v2/wa_sessions",
      {
        ticket_id: ticketId,
        hsm_id: hsmId,
        params: params,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async closeTicket(ticketId: number) {
    const response = await axios.post(
      `https://app.trengo.com/api/v2/tickets/${ticketId}/close`,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }

  async listContacts() {
    const response = await axios.post(
      "https://app.trengo.com/api/v2/contacts",
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      },
    );
    return response.data;
  }
}
