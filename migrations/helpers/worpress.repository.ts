import { Connection, Pool } from "mysql2";
import { EventRow, HobUser, MetaRow, UserRow } from "./wordpress.types";
import { chunk } from "lodash";
import { Knex } from "knex";
import { StringMap } from "ts-jest";

export class WordpressRepository {
  constructor(
    private connection: Connection | Pool,
    private knexClient: Knex,
  ) {}

  fetchUsersByIds(ids: number[]) {
    return new Promise<UserRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT * FROM ?? t1 LEFT OUTER JOIN ?? t2 ON t1.ID=t2.wp_user_id where t1.ID in (?)",
          nestTables: false,
        },
        ["hob_users", "hob_bookly_customers", ids],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }

  async *fetchInBatches(ids: number[], batchSize: number) {
    const batchs = chunk(ids, batchSize);
    for (const batch of batchs) {
      const results = await this.fetchUsersByIds(batch);
      yield results;
    }
  }

  async *fetchAllHobUsers(batchSize: number) {
    let offset = 0;
    let results: HobUser[] = [];
    do {
      results = await this.knexClient("hob_users")
        .select("*")
        .orderBy("id", "asc")
        .limit(batchSize)
        .offset(offset);
      yield results;
      offset += batchSize;
    } while (results.length > 0);
  }

  async *fetchAllHobUsersFromId(wpId: number, batchSize: number) {
    let offset = 0;
    let results: HobUser[] = [];
    do {
      results = await this.knexClient("hob_users")
        .select("*")
        .where("id", ">", wpId)
        .limit(batchSize)
        .offset(offset);
      yield results;
      offset += batchSize;
    } while (results.length > 0);
  }

  async fetchUsersMeta(userIds: number[]): Promise<MetaRow[]> {
    return this.knexClient("hob_usermeta")
      .select("*")
      .whereIn("user_id", userIds);
  }

  async fetchEventsByUserId(userIds: number[]) {
    return new Promise<EventRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT ca.id as ca_bookly_id, a.id as appointment_id, ca.status, a.staff_any, a.internal_note, ss.title as service_name, s.id as staff_id, ca.custom_fields, c.wp_user_id, c.id as bookly_user_id, c.phone, s.full_name as staff_name, a.start_date, a.end_date, c.full_name, ca.created_from, a.location_id, a.created_at, a.updated_at, ss.id as service_id FROM hob_bookly_customer_appointments ca, hob_bookly_appointments a, hob_bookly_customers c, hob_bookly_staff s, hob_bookly_services ss WHERE ca.appointment_id = a.id AND ca.customer_id = c.id AND a.location_id AND s.id = a.staff_id AND a.service_id = ss.id AND c.wp_user_id IN (?)",
          nestTables: false,
        },
        [userIds],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }

  async fetchEventsFromDate(date: string) {
    return new Promise<EventRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT ca.id as ca_bookly_id, a.id as appointment_id, ca.status, a.staff_any, a.internal_note, ss.title as service_name, s.id as staff_id, ca.custom_fields, c.wp_user_id, c.id as bookly_user_id, c.phone, s.full_name as staff_name, a.start_date, a.end_date, c.full_name, ca.created_from, a.location_id, a.created_at, a.updated_at, ss.id as service_id FROM hob_bookly_customer_appointments ca, hob_bookly_appointments a, hob_bookly_customers c, hob_bookly_staff s, hob_bookly_services ss WHERE ca.appointment_id = a.id AND ca.customer_id = c.id AND a.location_id AND s.id = a.staff_id AND a.service_id = ss.id AND a.created_at >= ?",
          nestTables: false,
        },
        [date],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }

  async fetchEventsByEventData(
    startDate: string,
    endDate: string,
    userName: string,
    staffName: string,
  ) {
    return new Promise<EventRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT ca.id as ca_bookly_id, a.id as appointment_id, ca.status, a.staff_any, a.internal_note, ss.title as service_name, s.id as staff_id, ca.custom_fields, c.wp_user_id, c.id as bookly_user_id, c.phone, s.full_name as staff_name, a.start_date, a.end_date, c.full_name, ca.created_from, a.location_id, a.created_at, a.updated_at, ss.id as service_id FROM hob_bookly_customer_appointments ca, hob_bookly_appointments a, hob_bookly_customers c, hob_bookly_staff s, hob_bookly_services ss WHERE ca.appointment_id = a.id AND ca.customer_id = c.id AND a.location_id AND s.id = a.staff_id AND a.service_id = ss.id AND a.start_date = ? AND a.end_date = ? AND c.full_name = ? AND s.full_name LIKE ?",
          nestTables: false,
        },
        [startDate, endDate, userName, staffName],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }

  fetchAppointments(ids: number[]) {
    return this.knexClient("hob_bookly_appointments")
      .select("*")
      .whereIn("id", ids);
  }

  fetchCorrectAppointments(ids: number[]) {
    return this.knexClient("hob_bookly_appointments as a")
      .join(
        "hob_bookly_customer_appointments as ca",
        "ca.appointment_id",
        "a.id",
      )
      .select("a.location_id as location_id", "a.id as id", "ca.id as ca_id")
      .whereIn("a.id", ids);
  }

  async countHobUsers() {
    const results = await this.knexClient("hob_users").count().first();
    return results["count(*)"] as number;
  }

  async fetchEventsByIds(ids: number[]) {
    if (ids.length <= 0) return [];
    return new Promise<EventRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT ca.id as ca_bookly_id, a.id as appointment_id, ca.status, ss.title as service_name, c.wp_user_id, c.id as bookly_user_id, c.phone, s.full_name as staff_name, a.start_date, a.end_date, c.full_name, ca.created_from, a.location_id, a.created_at, a.updated_at FROM hob_bookly_customer_appointments ca, hob_bookly_appointments a, hob_bookly_customers c, hob_bookly_staff s, hob_bookly_services ss WHERE ca.appointment_id = a.id AND ca.customer_id = c.id AND a.location_id AND s.id = a.staff_id AND a.service_id = ss.id AND ca.id IN (?)",
          nestTables: false,
        },
        [ids],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }

  async fetchEventsByAppointmentIds(ids: number[]) {
    if (ids.length <= 0) return [];
    return new Promise<EventRow[]>((resolve, reject) => {
      this.connection.query(
        {
          sql: "SELECT ca.id as ca_bookly_id, a.id as appointment_id, ca.status, ss.title as service_name, c.wp_user_id, c.id as bookly_user_id, c.phone, s.full_name as staff_name, a.start_date, a.end_date, c.full_name, ca.created_from, a.location_id, a.created_at, a.updated_at FROM hob_bookly_customer_appointments ca, hob_bookly_appointments a, hob_bookly_customers c, hob_bookly_staff s, hob_bookly_services ss WHERE ca.appointment_id = a.id AND ca.customer_id = c.id AND a.location_id AND s.id = a.staff_id AND a.service_id = ss.id AND ca.appointment_id IN (?)",
          nestTables: false,
        },
        [ids],
        (err, results) => {
          if (err) reject(err);
          resolve(results as any);
        },
      );
    });
  }
}
