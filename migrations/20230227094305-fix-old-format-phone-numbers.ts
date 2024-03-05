import { Command } from "commander";

// const { parsePhoneNumber } = require('libphonenumber-js')
// const { isValid } = require('libphonenumber-js/mobile')
// import * as admin from 'firebase-admin';
// import parseMobile from 'libphonenumber-js/mobile'
// const admin = require('firebase-admin');

// var core = require('libphonenumber-js/core')
const mobile = require("libphonenumber-js/mobile");
const fs = require("fs");

// function call(func, _arguments) {
//   var args = Array.prototype.slice.call(_arguments)
//   args.push(metadata)
//   return func.apply(this, args)
// }

// function parsePhoneNumber() {
//   return call(core.default, arguments)
// }

const admin = require("firebase-admin");
// import serviceAccount from './servicekey.json' assert { type: "json" };

// initialize Firebase Admin SDK with service account credentials

// EysJAY0s1UU3mDS2ByD4 -> new user ID
// Xyzwhlv6XYb24TkE8KOIPeNlhlq2 -> old user ID

// initialize Firestore database
// TODO: refactor consuming functions
let db;

const updates = [];
let counter = 0;
let counterValid = 0;
let counterInvalid = 0;
let errorCounter = 0;
const invalidUsers = [];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const execute = async (dryRun) => {
  const serviceAccount = require("./servicekey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();

  const users = await db
    .collection("users")
    .where("phone", ">=", "00")
    .where("phone", "<=", "00\uf8ff")
    .get();
  // .then((querySnapshot) => {
  console.log("got users length: " + users.size);
  users.forEach(async (doc) => {
    const phone = doc.data().phone.trim().split(" ").join("");
    const updatedPhone = "+" + phone.substring(2);
    counter++;

    if (dryRun) {
      return;
    }

    try {
      const phoneNumberParsed = mobile.parsePhoneNumber(updatedPhone);
    } catch (error) {
      errorCounter++;
      invalidUsers.push({
        id: doc.id,
        phone: doc.data().phone,
        fullname: doc.data().fullName,
        error: error.message,
      });
      console.log(
        `Error for user ${doc.id}: ${updatedPhone}: ${error.message}`,
      );
      return;
    }

    try {
      await db.runTransaction(async (t) => {
        console.log("transaction begin for user: ", doc.id);
        if (mobile.isPossiblePhoneNumber(updatedPhone)) {
          counterValid++;
          // console.error(`\tVALID: ${phone} -> ${updatedPhone} USER: ${doc.id}, ${doc.data().fullName}`);
          try {
            await processValidNumber(
              doc.ref,
              mobile.parsePhoneNumber(updatedPhone).number,
              t,
            );
          } catch (error) {
            invalidUsers.push({
              id: doc.id,
              phone: doc.data().phone,
              fullname: doc.data().fullName,
              error: error.message,
            });
          }
        } else {
          counterInvalid++;
          // console.error(`\tINVALID: ${phone} -> ${updatedPhone}`);
          invalidUsers.push({
            id: doc.id,
            phone: doc.data().phone,
            fullname: doc.data().fullName,
            error: "phone is not possible",
          });
        }
      });
      console.log("Transaction finished for user: ", doc.id);
      await sleep(300);
    } catch (e) {
      console.log("Transaction failure:", e);
    }
  });
  await sleep(1000);

  console.log(`Found ${counter} users with old format phone numbers:`);
  console.log(`\t- ${counterValid} valid numbers`);
  console.log(`\t- ${counterInvalid} invalid numbers`);
  console.log(`\t- ${errorCounter} users with wrong phone number format`);
  // console.log(invalidUsers);

  const json = JSON.stringify(invalidUsers);
  fs.writeFileSync("invalidUsers.json", json);
};

async function processEventsByUser(userId, location, agreement, t, mainUser) {
  const events = await db
    .collection(`locations/${location}/events`)
    .where("userId", "==", userId)
    .get();

  if (events.size === 0) {
    console.log(`\t\tNo ${location} events found for user: ${userId}`);
    return true;
  }

  if (events.size > 0 && agreement) {
    events.forEach((eventDoc) => {
      console.log(
        `\t\tneed to fix ${location} event: ${eventDoc.id} with new user: ${userId}`,
      );
    });

    return false;
  } else {
    events.forEach((eventDoc) => {
      console.log(
        `\t\tgoing to up update ${location} event: ${eventDoc.id} with userId: ${userId} -> ${mainUser.id}}`,
      );
      t.update(eventDoc.ref, { userId: mainUser.id });
    });
    return true;
  }
}

async function haveAgreement(userId) {
  const agreements = await db
    .collection(`agreements`)
    .where("userId", "==", userId)
    .get();

  if (agreements.size > 0) {
    agreements.forEach((agreementDoc) => {
      console.log(
        `\t\t- found agreement: ${agreementDoc.id} for user: ${userId}`,
      );
    });
    return true;
  }

  return false;
}

async function processValidNumber(userRef, phone, t) {
  console.log("inside trancaction for user: ", userRef.id);
  // const mainUser = await t.get(userRef);
  // const agreement = await haveAgreement(mainUser.id);

  const parasiticUsers = await db
    .collection("users")
    .where("phone", "==", phone)
    .get();

  if (parasiticUsers.size > 0) {
    const parasiteIds = parasiticUsers.docs.map((doc) => doc.id);
    throw Error(
      `Found ${parasiticUsers.size} parasitic users with ids: ${parasiteIds}`,
    );
    // parasiticUsers.forEach(async (newUserDoc) => {
    //   console.log(`\t- found parasitic user: ${newUserDoc.id} with phone: ${phone}. Agreement: ${agreement}}`);
    //   const hcmcResult = await processEventsByUser(newUserDoc.id, 'hcmc', agreement, t, mainUser);
    //   const hanoiResult = await processEventsByUser(newUserDoc.id, 'hanoi', agreement, t, mainUser);
    //   if (hcmcResult && hanoiResult) {
    //     console.log(`\t\t- updating main user ${mainUser.id} phone: ${mainUser.data().phone}-> ${phone}`);
    //     t.update(userRef, { phone: phone })
    //     console.log(`\t\t- deleting parasitic user: ${newUserDoc.id}`);
    //     t.delete(newUserDoc.ref)
    //   }
    // });
  } else {
    console.log(
      `\t- no parasitic users found for phone: ${phone}. Updating main user account`,
    );
    t.update(userRef, { phone: phone });
  }
}

// try {
//   await db.runTransaction(async (t) => {
//     const doc = await t.get(cityRef);

//     // Add one person to the city population.
//     // Note: this could be done without a transaction
//     //       by updating the population using FieldValue.increment()
//     const newPopulation = doc.data().population + 1;
//     t.update(cityRef, {population: newPopulation});
//   });

//   console.log('Transaction success!');
// } catch (e) {
//   console.log('Transaction failure:', e);
// }
export const formatOldPhoneNumbersCmd = new Command("format-old-phone-numbers");

formatOldPhoneNumbersCmd
  .description("Format old phone numbers")
  .action(async () => {
    await execute(false);
  });
