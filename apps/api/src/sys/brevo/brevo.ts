import { defineSecret } from "firebase-functions/params";
import {
  Api,
  type CreateSmtpEmail,
  type CreateUpdateContactModel,
  type ErrorModel,
  type GetExtendedContactDetails,
  type HttpResponse,
  type SendSmtpEmail,
} from "./types.js";
export * from "./types.js";

export const brevoAPISecret = defineSecret("BREVO_API_KEY");

let state: Api<unknown> | null = null;

const brevo = () => {
  if (state) return state;
  state = new Api({
    baseApiParams: {
      headers: { "api-key": brevoAPISecret.value() },
    },
  });
  return state;
};
async function create(
  email: string,
  payload: object,
  grpIds: number[],
): Promise<HttpResponse<CreateUpdateContactModel, ErrorModel>> {
  return brevo().contacts.createContact({
    attributes: payload,
    listIds: grpIds,
    updateEnabled: true,
    email: email,
  });
}

async function update(
  payload: object,
  email: string,
  grpIds: number[],
): Promise<HttpResponse<void, ErrorModel>> {
  return brevo().contacts.updateContact(email, {
    attributes: payload,
    listIds: grpIds,
  });
}

async function get(
  email: string,
): Promise<HttpResponse<GetExtendedContactDetails, ErrorModel>> {
  return brevo().contacts.getContactInfo(email);
}

async function send(
  payload: SendSmtpEmail,
): Promise<HttpResponse<CreateSmtpEmail, ErrorModel>> {
  return brevo().smtp.sendTransacEmail(payload);
}

export default {
  send,
  get,
  update,
  create,
};
