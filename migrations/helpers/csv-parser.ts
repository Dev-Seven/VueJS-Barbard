export interface CsvRow {
  "Missing Wordpress User ID": string;
  "Wordpress ID\n with same phone in firestore": string;
  "Missing User Phone": string;
  "Phone of firestore User": string;
  "Firestore/Auth User ID": string;
  "Main Wordpress ID": string;
  "Bookly Accounts": string;
  "Main Account": string;
}

import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

/**
 * Input: Scenario 4 https://docs.google.com/spreadsheets/d/1_6PGb4BuZB4Uwu2rAUBLrPgzB40sPN-5y7nr3xjozMY/edit#gid=631290301
 * @param csvFile
 */
export const parseScenarioSheet = (path: string) => {
  const csv = readFileSync(path);
  const users: CsvRow[] = parse(csv, { columns: true, skipEmptyLines: true });
  return users;
};

export const mapMissingUserIds = (users: CsvRow[]) =>
  users.map((user) => Number(user["Missing Wordpress User ID"]));
