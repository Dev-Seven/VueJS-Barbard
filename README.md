# Barbaard Monorepo

This is Barbaard Monorepo with turborepo inside.

## What's inside?

This monorepo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps

- `api`: cloud functions
- `pos`: vue2 (soon to be vue3) app
- `cheque`: PWA to be used on tablets to show cheques for guests

### Packages

- `barbaard`: collection of types for interconnectivity
- `pos-order-util`: utility package

### Migrations

We conserve all migrations for historical purposes under `/migrations` folder:

- to generate new migration run `date +%Y%m%d%H%M%S` to generate timestamp and then add name of your migration

### Emulators

The whole development should be done locally with help of emulators.
Seed is under `/seed` folder. To start emulators run `yarn emulators` from root.
To save firestore data wich you create or modify and see it after each emulators start use next command from root: `yarn emulators --import=./firestore-data --export-on-exit=./firestore-data`.
Then use command `node dbseed.js`.

### Running tests outside of dev containers

1. Build firebase emulator image: barbaard/firebase-emulator
2. Run tests: `docker run -v $(pwd):/app barbaard/firebase-emulator firebase emulators:exec --only firestore './node_modules/.bin/jest'`

### Develop

_coming soon_

To develop all apps and packages, run the following command:

```
yarn run dev
```

### Remote Caching

_coming soon_
