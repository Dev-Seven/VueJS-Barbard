import firebase from "firebase-admin";

const fetchConfig = (): object => ({
  ...(process.env.FIREBASE_DATABASE_URL && {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  }),
  ...(process.env.FIREBASE_PROJECT_ID && {
    projectId: process.env.FIREBASE_PROJECT_ID,
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

export default state;
