import * as http from "http";
import { readFileSync, createWriteStream } from "fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, setLogLevel } from "@firebase/firestore";

const PROJECT_ID = "barbaard-dev";
/** @type testing.RulesTestEnvironment */
let testEnv;

//Write function that use setDoc method to create a user with given role
const createUser = async (db, role) => {
  if (role === "pos.admin") {
    await setDoc(doc(db, "/admin/pos.admin"), { roles: ["pos.admin"] });
  } else if (role === "pos.staff") {
    await setDoc(doc(db, "/admin/pos.staff"), { roles: ["pos.staff"] });
  } else {
    return;
  }
};

//Generate function to generate testEnv for roles: anon, non-admin, pos.admin, pos.staff
const testEnvForRole = (role) => {
  if (role === "anon") {
    return testEnv.unauthenticatedContext().firestore();
  } else if (role === "non-admin") {
    return testEnv.authenticatedContext("user1").firestore();
  } else {
    return testEnv.authenticatedContext(role).firestore();
  }
};

//generate Mocha it function for each role
const readTestCase = (collection, scenario) => {
  return it(`should ${scenario.read ? "" : "not "}allow ${
    scenario.role
  } read`, async function () {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await createUser(db, scenario.role);
      await setDoc(doc(db, collection + "/item1"), { foo: "bar" });
    });

    const db = testEnvForRole(scenario.role);

    if (scenario.read) {
      await assertSucceeds(getDoc(doc(db, collection + "/item1")));
    } else {
      await assertFails(getDoc(doc(db, collection + "/item1")));
    }
  });
};

// write function like readTestCase for write
const writeTestCase = (collection, scenario) => {
  return it(`should ${scenario.write ? "" : "not "}allow ${
    scenario.role
  } write`, async function () {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await createUser(db, scenario.role);
      await setDoc(doc(db, collection + "/item1"), { foo: "bar" });
    });

    const db = testEnvForRole(scenario.role);

    if (scenario.write) {
      await assertSucceeds(
        setDoc(doc(db, collection + "/item1"), { foo: "bar" }),
      );
    } else {
      await assertFails(setDoc(doc(db, collection + "/item1"), { foo: "bar" }));
    }
  });
};

describe("Firestore Rules", () => {
  beforeAll(async () => {
    // Silence expected rules rejections from Firestore SDK. Unexpected rejections
    // will still bubble up and will be thrown as an error (failing the tests).
    setLogLevel("error");

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    // Delete all the FirebaseApp instances created during testing.
    // Note: this does not affect or clear any data.
    await testEnv.cleanup();

    // Write the coverage report to a file
    const coverageFile = "firestore-coverage.html";
    const fstream = createWriteStream(coverageFile);
    await new Promise((resolve, reject) => {
      const { host, port } = testEnv.emulators.firestore;
      const quotedHost = host.includes(":") ? `[${host}]` : host;
      http.get(
        `http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`,
        (res) => {
          res.pipe(fstream, { end: true });

          res.on("end", resolve);
          res.on("error", reject);
        },
      );
    });

    console.log(
      `View firestore rule coverage information at ${coverageFile}\n`,
    );
  });

  beforeEach(async () => {
    // Clear the database between tests
    await testEnv.clearFirestore();
  });

  ["agreements", "giftcheques", "payments", "services"].forEach(
    (collection) => {
      describe("collection: " + collection, function () {
        const scenarios = [
          { role: "anon", write: false, read: false },
          { role: "non-admin", write: false, read: false },
          { role: "pos.staff", write: true, read: true },
          { role: "pos.admin", write: true, read: true },
        ];

        // Write tests according to scenarios using functions: readTestCase, writeTestCase
        scenarios.forEach((scenario) => {
          readTestCase(collection, scenario);
          writeTestCase(collection, scenario);
        });
      });
    },
  );

  ["order_failure_subscribers", "staff"].forEach((collection) => {
    describe("collection: " + collection, function () {
      const scenarios = [
        { role: "anon", write: false, read: false },
        { role: "non-admin", write: false, read: false },
        { role: "pos.staff", write: false, read: false },
        { role: "pos.admin", write: true, read: true },
      ];

      // Write tests according to scenarios using functions: readTestCase, writeTestCase
      scenarios.forEach((scenario) => {
        readTestCase(collection, scenario);
        writeTestCase(collection, scenario);
      });
    });
  });

  ["promotions"].forEach((collection) => {
    describe("collection: " + collection, function () {
      const scenarios = [
        { role: "anon", write: false, read: false },
        { role: "non-admin", write: false, read: false },
        { role: "pos.staff", write: true, read: true },
        { role: "pos.admin", write: true, read: true },
      ];

      // Write tests according to scenarios using functions: readTestCase, writeTestCase
      scenarios.forEach((scenario) => {
        readTestCase(collection, scenario);
        writeTestCase(collection, scenario);
      });
    });
  });

  describe("collection: admin", function () {
    const scenarios = [
      { role: "anon", write: false, read: false },
      { role: "non-admin", write: false, read: false },
      { role: "pos.staff", write: true, read: true },
      { role: "pos.admin", write: true, read: true },
    ];

    // Write tests according to scenarios using functions: readTestCase, writeTestCase
    scenarios.forEach((scenario) => {
      readTestCase("admin", scenario);
      writeTestCase("admin", scenario);
    });
  });

  describe("collection: upgrades", function () {
    const scenarios = [
      { role: "anon", write: false, read: false },
      { role: "non-admin", write: false, read: false },
      { role: "pos.staff", write: false, read: true },
      { role: "pos.admin", write: true, read: true },
    ];

    // Write tests according to scenarios using functions: readTestCase, writeTestCase
    scenarios.forEach((scenario) => {
      readTestCase("upgrades", scenario);
      writeTestCase("upgrades", scenario);
    });
  });

  describe("collection: locations", function () {
    const scenarios = [
      { role: "anon", write: false, read: false },
      { role: "non-admin", write: false, read: false },
      { role: "pos.staff", write: true, read: true },
      { role: "pos.admin", write: true, read: true },
    ];

    scenarios.forEach((scenario) => {
      readTestCase("locations", scenario);
      writeTestCase("locations", scenario);
    });

    [
      "orders",
      "events",
      "ledger",
      "lockerbox",
      "registers",
      "salesCategories",
      "tables",
    ].forEach((subcollection) => {
      describe(`collection: locations/itemId/${subcollection}`, function () {
        const scenarios = [
          { role: "anon", write: false, read: false },
          { role: "non-admin", write: false, read: false },
          { role: "pos.staff", write: true, read: true },
          { role: "pos.admin", write: true, read: true },
        ];

        scenarios.forEach((scenario) => {
          readTestCase(`locations/itemId/${subcollection}`, scenario);
          writeTestCase(`locations/itemId/${subcollection}`, scenario);
        });
      });
    });
  });

  describe("collection: users", function () {
    const scenarios = [
      { role: "anon", write: false, read: true },
      { role: "non-admin", write: false, read: true },
      { role: "pos.staff", write: true, read: true },
      { role: "pos.admin", write: true, read: true },
    ];

    scenarios.forEach((scenario) => {
      readTestCase("users", scenario);
      writeTestCase("users", scenario);
    });

    it("should allow authenticated read if request.auth.token.phone_number == resource.data.phone", async function () {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        await setDoc(doc(db, "/users/user1"), { phone: "+1234567890" });
        await setDoc(doc(db, "/users/user2"), { phone: "+1234567891" });
      });

      const authedDb = testEnv
        .authenticatedContext("user2", { phone_number: "+1234567890" })
        .firestore();

      await assertSucceeds(getDoc(doc(authedDb, "/users/user1")));
    });

    it("should not allow authenticated write if request.auth.token.phone_number == resource.data.phone", async function () {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        await setDoc(doc(db, "/users/user1"), { phone: "+1234567890" });
        await setDoc(doc(db, "/users/user2"), { phone: "+1234567891" });
      });

      const authedDb = testEnv
        .authenticatedContext("user2", { phone_number: "+1234567890" })
        .firestore();

      await assertFails(setDoc(doc(authedDb, "/users/user1"), { foo: "bar" }));
    });

    it("should allow authenticated read if request.auth.uid == userId", async function () {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "/users/user1"), { foo: "bar" });
      });

      const authedDb = testEnv.authenticatedContext("user1").firestore();
      await assertSucceeds(getDoc(doc(authedDb, "/users/user1")));
    });

    it("should allow authenticated write if request.auth.uid == userId", async function () {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), "/users/user1"), { foo: "bar" });
      });

      const authedDb = testEnv.authenticatedContext("user1").firestore();
      await assertSucceeds(
        setDoc(doc(authedDb, "/users/user1"), { foo: "bar" }),
      );
    });
  });

  ["posItems", "tax"].forEach((collection) => {
    describe(`collection: ${collection}`, function () {
      const scenarios = [
        { role: "anon", write: false, read: false },
        { role: "non-admin", write: false, read: false },
        { role: "pos.staff", write: false, read: true },
        { role: "pos.admin", write: false, read: true },
      ];

      scenarios.forEach((scenario) => {
        readTestCase(collection, scenario);
        writeTestCase(collection, scenario);
      });
    });
  });
});
