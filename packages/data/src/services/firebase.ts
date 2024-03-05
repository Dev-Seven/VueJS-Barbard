import firebase from "firebase-admin";

const fetchConfig = (): object => ({
  ...(process.env.VITE_FIREBASE_DATABASE_URL && {
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  }),
  ...(process.env.VITE_FIREBASE_PROJECT_ID && {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  }),
});

const configureFirebase = (config: object) => {
  const app = firebase.initializeApp(
    Object.keys(config).length ? config : undefined,
  );
  app.firestore().settings({ ignoreUndefinedProperties: true });
  return app;
};

const state = configureFirebase(fetchConfig());

export const firebaseApp = state;
