import { format } from "date-fns";
import { getZoneTime } from "../time.js";
import type { BarbaardUser } from "@barbaard/types";
import brevo, { type SendSmtpEmail } from "../sys/brevo/brevo.js";
import core from "../internal/core/core.js";

const barbaardGrpIds = [12];
import * as firestore from "firebase-admin/firestore";

const userCore = core.userCore();

export class BrevoService {
  private async normalizeUserData(
    id: string,
    u: BarbaardUser,
  ): Promise<BarbaardUser> {
    const dob = u.birthday;
    if (dob) {
      if (typeof dob == "string") {
        const dobDate = new Date(dob);
        if (isNaN(+dobDate)) {
          console.error(
            "brevoservice/nomalizeUserData: birthday field for uid",
            id,
            "is not parseable",
          );
          return { ...u, birthday: undefined };
        }
        console.log(
          "brevoservice/normaizeUserData: fixing the date for uid",
          id,
        );
        const actualDob = firestore.Timestamp.fromDate(dobDate);
        const res = await userCore.update(id, { birthday: actualDob });
        const ok = res.getOrNull();
        if (!ok) {
          return { ...u, birthday: undefined };
        }
        return { ...u, birthday: actualDob };
      }

      if (dob instanceof firestore.Timestamp) {
        return u;
      }
      console.error(
        "brevoservice/normalizeUserData invalid birthday field for uid",
        id,
      );
      return { ...u, birthday: undefined };
    }
    return u;
  }

  async createContact(id: string, user: BarbaardUser) {
    const u = await this.normalizeUserData(id, user);

    if (u.email) {
      const payload = {
        attributes: {
          firstname: u.firstName,
          lastname: u.lastName,
          SMS: u.phone,
          LANGUAGE: u.preferences?.locale,
          NATIONALITY: u.nationality,
          SOURCE: "Barbaard",
          ORGANIZATION: u.company,
          BIRTHDAY: u.birthday
            ? format(getZoneTime(u.birthday.toDate()), "yyyy-MM-dd")
            : undefined,
          LAST_APPOINTMENT: u.barbershop?.lastAppointment
            ? format(
                getZoneTime(u.barbershop?.lastAppointment.toDate()),
                "yyyy-MM-dd",
              )
            : undefined,
          LAST_BARBER: u.barbershop?.lastBarber,
          LOCATION: u.location,
          TOTAL_APPOINTMENTS: u.barbershop?.totalAppointments,
        },
        listIds: barbaardGrpIds,
        LAST_SERVICE: u.barbershop?.lastService,
        updateEnabled: true,
        email: u.email,
      };

      return brevo.create(u.email, payload, barbaardGrpIds).then(
        function (data) {
          if (data.data) {
            return data.data;
          }
          console.error("Brevo create contact", data.error.code);
        },
        function (err) {
          console.log("Brevo Error", {
            statusCode: err.response?.statusCode,
            body: err.response?.body,
          });
          throw err;
        },
      );
    }
    console.warn(`brevoService/createContact user does not have an email ${u}`);
  }

  async updateContact(id: string, user: BarbaardUser) {
    const u = await this.normalizeUserData(id, user);

    if (u.email) {
      const payload = {
        firstname: u.firstName,
        lastname: u.lastName,
        SMS: u.phone,
        LANGUAGE: u.preferences?.locale,
        NATIONALITY: u.nationality,
        SOURCE: "Barbaard",
        ORGANIZATION: u.company,
        BIRTHDAY: u.birthday
          ? format(getZoneTime(u.birthday.toDate()), "yyyy-MM-dd")
          : undefined,
        LAST_APPOINTMENT: u.barbershop?.lastAppointment
          ? format(
              getZoneTime(u.barbershop?.lastAppointment.toDate()),
              "yyyy-MM-dd",
            )
          : undefined,
        LAST_SERVICE: u.barbershop?.lastService,
        LAST_BARBER: u.barbershop?.lastBarber,
        LOCATION: u.location,
        TOTAL_APPOINTMENTS: u.barbershop?.totalAppointments,
      };

      return brevo.update(payload, u.email, barbaardGrpIds).then(
        function (data) {
          return data;
        },
        function (err) {
          console.log("Brevo Error", {
            statusCode: err.response?.statusCode,
            body: err.response?.body,
          });
          throw err;
        },
      );
    }
    console.warn(`brevoService/updateContact user does not have an email ${u}`);
  }

  getContact(email: string) {
    return brevo.get(email).then(
      function (data) {
        if (data.data) {
          return data.data;
        }
        console.error("Brevo error getContact", data.error.code);
      },
      function (err) {
        console.log("Brevo Error", {
          statusCode: err.response?.statusCode,
          body: err.response?.body,
        });
        throw err;
      },
    );
  }

  sendEmail(email: SendSmtpEmail) {
    return brevo.send(email);
  }
}
