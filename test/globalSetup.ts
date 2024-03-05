export default function () {
  // TODO: might need to replace localhost for CI enviroments
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8069";
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
  process.env.FIREBASE_DATABASE_URL =
    "http://localhost:9000/?ns=barbaard-dev-default-rtdb";
  process.env.FIREBASE_PROJECT_ID = "test";
}
