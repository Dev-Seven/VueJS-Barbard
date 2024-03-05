import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
const stubData = JSON.parse(fs.readFileSync("./stub-data.json"));

import _ from "lodash";

// initialization
// const projectId = "barbaard-dev";
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8069";
// process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
// admin.initializeApp({ projectId });
// admin.initializeApp();

const config = {
  databaseURL: "http://127.0.0.1:9000/?ns=barbaard-dev",
  projectId: "barbaard-dev",
};
const app = initializeApp(config);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth();

const LOCALES = ["en", "vi"];
const TAGS = [
  "new",
  "barbershop",
  "customer lost",
  "generation 1",
  "ex-agreement",
  "app",
  "agreement",
  "generation 2",
];

async function seedPayments() {
  await Promise.all(
    _.entries(stubData.payments).map((u) =>
      db.collection("payments").doc(u[0]).set(u[1]),
    ),
  );
}

async function seedProducts() {
  const fnbItems = stubData.posItems["f&b"].subCollection["posItems/f&b/items"];
  await Promise.all(
    _.entries(fnbItems).map((u) =>
      db.collection("posItems/f&b/items").doc(u[0]).set(u[1]),
    ),
  );

  const products =
    stubData.posItems["products"].subCollection["posItems/products/items"];
  await Promise.all(
    _.entries(products).map((u) =>
      db.collection("posItems/products/items").doc(u[0]).set(u[1]),
    ),
  );

  await Promise.all(
    _.entries(stubData.services).map((u) =>
      db.collection("services").doc(u[0]).set(u[1]),
    ),
  );

  await Promise.all(
    _.entries(stubData.tax).map((u) =>
      db.collection("tax").doc(u[0]).set(u[1]),
    ),
  );

  await Promise.all(
    _.entries(stubData.upgrades).map((u) =>
      db.collection("upgrades").doc(u[0]).set(u[1]),
    ),
  );
}

async function seedUsers(numberofUsers) {
  try {
    const userIds = await Promise.all(
      [...Array(numberofUsers).keys()].map(async () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const user = {
          fullName: firstName + " " + lastName,
          firstName: firstName,
          lastName: lastName,
          phone: faker.phone.number("+84#########"), //todo: introduce different number formats and country codes
          nationality: faker.location.country(),
          booklyUserId: faker.number.int().toString(),
          company: faker.company.name(),
          createdAt: Timestamp.now(),
          email: faker.internet.email({
            firstName: firstName,
            lastName: lastName,
          }),
          kiotvietId: faker.number.int().toString(),
          location: "Saigon",
          preferences: {
            locale: LOCALES[Math.floor(Math.random() * 2)],
          },
          tags: faker.helpers.arrayElements(TAGS),
          wpId: faker.number.int(),
          vendID: faker.string.uuid(),
          loyalty: {
            actualPoints: faker.number.int(),
            lastLoyaltyTransaction: faker.date.between({
              from: "2020-01-01T00:00:00.000Z",
              to: new Date(),
            }),
            loyaltyApp: "Active", //todo: find out which options are available
            memberGroup: "Club Member",
            memberGroupId: faker.string.uuid(),
            memberGroupPoints: faker.number.int(),
            nextMemberGroup: "Silver Member",
            nextMemberGroupId: faker.string.uuid(),
            nextMemberGroupPoints: faker.number.int(),
            totalPoints: faker.number.int(),
          },
          birthday: faker.date.birthdate(),
          comments: faker.number.int().toString(),
          connectaId: faker.string.uuid(),
          babershop: {
            appointmentsLate: faker.number.int({
              max: 10,
            }),
            appointmentsOnTime: faker.number.int({
              max: 10,
            }),
            averageDays: faker.number.int({
              min: 15,
              max: 63,
            }),
            firstAppointment: faker.date.between({
              from: "2020-01-01T00:00:00.000Z",
              to: new Date(),
            }),
            lastAppointment: faker.date.between({
              from: "2020-01-01T00:00:00.000Z",
              to: new Date(),
            }),
            lastBarber: "Mr. Khuyen (The Guardian)",
            totalAppointments: faker.number.int({
              max: 20,
            }),
            totalNoShows: faker.number.int({
              max: 10,
            }),
          },
          memberShipNumber: firstName + "-" + faker.number.int().toString(),
          referredByName: faker.person.fullName(),
          referredById: faker.string.sample(28),
          referredRedeemed: faker.datatype.boolean(),
        };
        const docRef = await db.collection("users").add(user);
        return docRef.id;
      }),
    );
    return userIds;
  } catch (error) {
    console.log(error, "database users seed failed");
  }
}

async function seedLocations() {
  try {
    const hcmcLocation = {
      addressFirst: "17 Le Duan, Ben Nghe",
      addressSecond: "Quan 1, Ho Chi Minh City",
      code: "HCMC",
      connectaIdHob: faker.string.uuid(),
      connectaIdMom: faker.string.uuid(),
      connectaBranchCodeHob: "SGN_HOB",
      connectaBranchCodeMom: "SGN_MOM",
      marketman: faker.string.uuid(),
      name: "Ho Chi Minh City",
      phone: "1800 7040",
    };

    const hanoiLocation = {
      addressFirst: "36 Hang Chao, Cat Linh",
      addressSecond: "Dong Da, Ha noi",
      code: "HN",
      connectaIdHob: faker.string.uuid(),
      connectaBranchCodeHob: "HAN_HOB",
      marketman: faker.string.uuid(),
      name: "Hanoi",
      phone: "1800 7040",
    };
    await db.collection("locations").doc("hcmc").set(hcmcLocation);
    await db.collection("locations").doc("hanoi").set(hanoiLocation);
    await Promise.all([
      seedRegister("hanoi", "bar"),
      seedRegister("hanoi", "barbershop"),
      seedRegister("hcmc", "bar"),
      seedRegister("hcmc", "barbershop"),
    ]);
  } catch (error) {
    console.log(error, "database locations seed failed");
  }
}

async function seedRegister(location, register) {
  try {
    const properties = {
      location,
      name: register,
    };

    await db
      .collection(`locations/${location}/registers`)
      .doc(register)
      .set(properties);
  } catch (error) {
    console.log(error, "database locations seed failed");
  }
}

async function seedOrders(numberofOrders, users) {
  try {
    const orderIds = await Promise.all(
      [...Array(numberofOrders).keys()].map(async () => {
        const user = await db
          .collection("users")
          .doc(faker.helpers.arrayElement(users))
          .get();
        const locationCode = faker.helpers.arrayElement(["HN", "HCMC"]);
        const order = {
          _id: "",
          active: faker.datatype.boolean(),
          agreementTotal: faker.number.int({
            max: 10,
          }),
          amountOfGuest: faker.number.int({
            min: 1,
            max: 8,
          }),
          averageSpending: faker.number.int({
            min: 100000,
            max: 2000000,
          }),
          closedAt: faker.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          completed: true,
          createdAt: faker.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          customBill: "Mr. Tuan (Mr. Parker)",
          department: faker.helpers.arrayElement(["bar", "barbershop"]),
          discount: {
            amount: faker.number.int({
              min: 10000,
              max: 100000,
            }),
            percentage: faker.number.int({
              min: 0,
              max: 100,
            }),
            type: "percentage",
          },
          isCustomBill: faker.datatype.boolean(),
          isPushedToConnecta: faker.datatype.boolean(),
          memberGroup: "",
          openRegisterEntryId: "",
          orderId: locationCode + "-" + faker.number.int().toString(),
          orderNote: faker.lorem.sentence(),
          orderNumber: "",
          paid: true,
          parkedSale: faker.datatype.boolean(),
          payment: {
            paymentStatus: faker.datatype.boolean(),
            receivedCash: faker.number.int({
              min: 100000,
              max: 2000000,
            }),
          },
          userEmail: user.data().email,
          userId: user.id,
          userName: user.data().fullName,
          userPhone: user.data().phone,
          userTags: user.data().tags,
        };
        const locationId = locationCode === "HN" ? "hanoi" : "hcmc";
        const collection = "locations/" + locationId + "/orders";
        const docRef = await db.collection(collection).add(order);
        return docRef.id;
      }),
    );
    return orderIds;
  } catch (error) {
    console.log(error, "database orders seed failed");
  }
}

async function seedStaff(numberOfStaff) {
  try {
    const staffIds = await Promise.all(
      [...Array(numberOfStaff).keys()].map(async () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const staff = {
          active: true,
          address: faker.location.streetAddress(),
          department: "House of Barbaard",
          email: faker.internet.email(),
          fullName: firstName + " " + lastName,
          insurance: faker.datatype.boolean(),
          image: faker.image.avatar(),
          locations: ["hcmc", "hanoi"],
          nickName: faker.person.firstName(),
          pinCode: faker.number.int({
            min: 1000,
            max: 9999,
          }),
          roles: ["pos.staff"],
          startDate: faker.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          status: "full-time",
          title: "Senior Barber",
          type: "barber",
          wpId: faker.number.int(),
        };
        const docRef = await db.collection("staff").add(staff);
        return docRef.id;
      }),
    );
    return staffIds;
  } catch (error) {
    console.log(error, "database staff seed failed");
  }
}

//TODO: seed RTDB orders

async function seedAdmin(email, password) {
  try {
    const displayName = email.split("@")[0];
    const admin = {
      email: email,
      password: password,
      uid: displayName,
      displayName: displayName,
    };
    await auth.createUser(admin);

    const adminDoc = {
      active: true,
      email: admin.email,
      locations: ["hcmc", "hanoi"],
      name: admin.uid,
      roles: ["pos.admin", "pos.staff"],
    };
    await rtdb.ref("admins").set(adminDoc);
    await db.collection("admin").doc(admin.uid).set(adminDoc);
  } catch (error) {
    console.log(error, "database admin seed failed");
  }
}

async function seedEvents(numberofEvents, users, staffIds) {
  try {
    const eventIds = await Promise.all(
      [...Array(numberofEvents).keys()].map(async () => {
        const user = await db
          .collection("users")
          .doc(faker.helpers.arrayElement(users))
          .get();
        const locationCode = faker.helpers.arrayElement(["hanoi", "hcmc"]);

        const startDate = faker.date.between({
          from: "2020-01-01T00:00:00.000Z",
          to: new Date(),
        });
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const reminderDate = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
        const service = await db
          .collection("services")
          .doc("Ghbd4ZcsANLEzFpmXFPt")
          .get();
        const staff = await db
          .collection("staff")
          .doc(faker.helpers.arrayElement(staffIds))
          .get();

        const event = {
          booklyId: faker.number.int(10000),
          chainId: "NaN",
          createdAt: faker.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          createdFrom: faker.helpers.arrayElement(["backend", "frontend"]),
          startDate: startDate,
          endDate: endDate,
          firstVisit: true,
          internalNote: faker.lorem.sentence(),
          reminderDate: reminderDate,
          serviceName: service.data().name,
          services: [
            {
              duration: service.data().duration,
              id: service.id,
              name: service.data().name,
              price: service.data().price,
              staff: staff.data().fullName,
              staffId: staff.id,
            },
          ],
          staffAny: true,
          staffName: staff.data().fullName,
          status: "approved",
          type: "appointment",
          updatedAt: faker.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          upgrades: [],
          userId: user.id,
          userName: user.data().fullName,
        };
        const collection = "locations/" + locationCode + "/events";
        const docRef = await db.collection(collection).add(event);
        return docRef.id;
      }),
    );
    return eventIds;
  } catch (error) {
    console.log(error, "database events seed failed");
  }
}

async function seedDevices() {
  try {
    await db.collection("devices").doc("1").set({
      uid: "test",
      displayName: "test",
    });
  } catch (error) {
    console.log(error, "database devices seed failed");
  }
}

(async function () {
  try {
    await seedLocations();
    await seedPayments();
    await seedProducts();
    const staffIds = await seedStaff(5);
    await seedAdmin("admin@barbaard.com", "123123");
    const users = await seedUsers(10);
    await seedEvents(10, users, staffIds);
    const orders = await seedOrders(20, users);
    await seedDevices();
    console.log(orders);
    console.log(staffIds);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(); // Terminate the Node.js process
  }
})();
