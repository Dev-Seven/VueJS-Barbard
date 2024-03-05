import { Command, Option, OptionValues } from "commander";
import firebase from "firebase-admin";
import mysql, { Connection, Pool } from "mysql2";
import knex, { Knex } from "knex";

export const serviceKeyOption = new Option(
  "-s, --service-key <serviceKey>",
  "path to service account key path",
).makeOptionMandatory();
export const dryRunOption = new Option("--dry-run", "dry run, no writes");

export const wordpressUsername = new Option(
  "--wp-user-name <username>",
  "wordpress user name",
)
  .default("", "defaults to emulator")
  .makeOptionMandatory();
export const wordpressPassword = new Option(
  "--wp-password <password>",
  "wordpress password",
).makeOptionMandatory();
export const wordpressDatabase = new Option(
  "--wp-database <database>",
  "wordpress database",
).makeOptionMandatory();
export const wordpressHost = new Option(
  "--wp-host <host>",
  "wordpress host",
).makeOptionMandatory();
export const wordpressPort = new Option(
  "--wp-port <port>",
  "wordpress port",
).makeOptionMandatory();

export type Action = (...args: any[]) => Promise<void>;

// initializers with dependencies injected
export function runWithFirebase(
  action: (fbApp: firebase.app.App, options: OptionValues) => Promise<void>,
): Action {
  return async (options: OptionValues, command: Command) => {
    const config =
      options.serviceKey === ""
        ? { projectId: "barbaard-dev" }
        : { credential: firebase.credential.cert(require(options.serviceKey)) };
    const firebaseApp = firebase.initializeApp(config);
    firebaseApp.firestore().settings({
      ignoreUndefinedProperties: true,
    });
    return action(firebaseApp, options);
  };
}

export function runWithWordpress(
  action: (
    connection: Connection | Pool,
    knexClient: Knex,
    options: OptionValues,
  ) => Promise<void>,
): Action {
  return async (options: OptionValues, command: Command) => {
    const {
      wpUserName: user,
      wpPassword: password,
      wpDatabase: database,
      wpHost: host,
      wpPort: port,
    } = options;
    const knexClient = knex({
      client: "mysql2",
      connection: {
        host,
        port,
        user,
        password,
        database,
      },
    });
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    conn.connect((err) => {
      if (err) {
        console.log("Error connecting...", err);
        throw err;
      }
      console.log("Connected to wordpress db");
    });

    return action(conn, knexClient, options).then(() => {
      console.log("Closing connection to wordpress db");
      conn.end((err) => {
        if (err) {
          console.log("Error closing connection...", err);
          throw err;
        }
      });
      return knexClient.destroy();
    });
  };
}

export function runWithWordpressAndFirestore(
  action: (
    fbApp: firebase.app.App,
    connection: Connection | Pool,
    knexClient: Knex,
    options: OptionValues,
  ) => Promise<void>,
): Action {
  return async (options: OptionValues, command: Command) => {
    return runWithWordpress(async (conn, knex, options) => {
      return runWithFirebase(async (fbApp, options) => {
        return action(fbApp, conn, knex, options);
      })(options, command);
    })(options, command);
  };
}
