import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";

export const getLocations = async (db: any) => {
  const locationQuery = query(collection(db, "locations"));
  const locationSnapshot = await getDocs(locationQuery);

  const locationPromises = locationSnapshot.docs.map(async (item, i) => {
    const serviceArray: any = [];

    const serviceQuery = query(
      collection(db, "services"),
      where("active", "==", true),
      where("locations", "array-contains", item.id),
    );

    const querySnapshot = await getDocs(serviceQuery);
    querySnapshot.forEach((item1) => {
      let cat = item1.data().category;
      if (cat && !serviceArray.includes(cat)) serviceArray.push(cat);
    });

    return {
      ...item.data(),
      id: item.id,
      category: serviceArray,
    };
  });

  try {
    const locationResults = await Promise.all(locationPromises);
    return locationResults;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getUpgrades = async (db: any) => {
  const upgradeQuery = query(collection(db, "upgrades"));
  const upgradeSnapshot = await getDocs(upgradeQuery);

  let upgradeArray: any = [];
  const promises = upgradeSnapshot.docs.map((item) => {
    upgradeArray.push({
      ...item.data(),
      id: item.id,
    });
  });

  await Promise.all(promises);
  return upgradeArray;
};

export const getServices = async (db: any, locationId: string) => {
  // ------- Fetch Category From Firebase -------
  // const categoryQuery = query(
  //   collection(db, "services"),
  //   where("active", "==", true),
  //   where("locations", "array-contains", locationId)
  // );
  // let categories: Array<string> = [];

  // const querySnapshot = await getDocs(categoryQuery);
  // querySnapshot.forEach((item) => {
  //   if (item.data().category && !categories.includes(item.data().category)) {
  //     categories.push(item.data().category);
  //   }
  // });

  // --------- Static Categories ------------
  const categories = [
    "Head & Hair",
    "Beard & Shaving",
    "Anti Aging",
    "Wellness",
  ];

  if (categories.length) {
    const promises = categories.map(async (item) => {
      let serviceArray: any = [];
      const serviceQuery = query(
        collection(db, "services"),
        where("active", "==", true),
        where("category", "==", item),
        where("locations", "array-contains", locationId),
      );
      const serviceSnapshot = await getDocs(serviceQuery);
      if (serviceSnapshot.size > 0) {
        serviceSnapshot.forEach((item1) => {
          serviceArray.push({
            ...item1.data(),
            id: item1.id,
            duration: item1.data().duration / 60,
          });
        });
        return {
          name: item,
          services: serviceArray,
        };
      }
      return null;
    });

    // Return the result from Promise.all
    return Promise.all(promises)
      .then((results) => {
        return results.filter((item) => item !== null);
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
  } else {
    return [];
  }
};

//-------------- Available Time Function -----------------
const isTimeAvailable = (time: any, services: any) => {
  let mins: any = [];
  time.forEach((item: any) => {
    const moment1 = moment(item.startTime, "HH:mm");
    const moment2 = moment(item.endTime, "HH:mm");
    const differenceInMinutes = moment2.diff(moment1, "minutes");
    mins.push(differenceInMinutes);
  });

  let serviceTime = 0;
  services.forEach((item: any) => {
    serviceTime += item.duration;
  });

  return {
    availableTime: mins,
    serviceTime,
  };
};

//----------- Barber with Timesheet Data --------------
export const getTimesheet = async (db: any, date: string, key?: number) => {
  const { bookingData } = useBooking();
  const location = bookingData.value.location.id;

  const services = bookingData.value?.service?.filter((item: any) => {
    if (
      !key &&
      (item.category == "Head & Hair" || item.category == "Beard & Shaving")
    ) {
      return item;
    } else if (
      key &&
      (item.category == "Anti Aging" || item.category == "Wellness")
    ) {
      return item;
    }
  });
  const timeSheetQuery = query(collection(db, "timesheet", date, "barbers"));

  const timeSheet: any[] = [];
  const timesheetSnapshot = await getDocs(timeSheetQuery);

  for (const barberItem of timesheetSnapshot.docs) {
    const docRef = doc(db, "staff", barberItem.data().staffId);
    const docSnap = await getDoc(docRef);

    const staffData = docSnap.data();

    //------- Count Service Total & Available Total -------------
    const { availableTime, serviceTime } = isTimeAvailable(
      barberItem.data().time,
      services,
    );
    if (
      staffData?.locations.includes(location) &&
      availableTime.find((item: any) => serviceTime <= item)
    ) {
      timeSheet.push({
        id: barberItem.id,
        fullName: staffData.fullName,
        nickName: staffData.nickName,
        staffId: docSnap.id,
        time: barberItem.data().time,
        // ---------- Generate Time Slots -------------------
        timesheet: generateTimeSheet(barberItem.data().time, serviceTime),
        timeData: {
          availableTime,
          serviceTime,
        },
      });
    }
  }

  return timeSheet;
};

//---------- If User data in Users Collection ---------------
export const checkUserData = async (db: any, user: any) => {
  if (user.value?.email) {
    const userQuery: any = query(
      collection(db, "users"),
      where("email", "==", user.value?.email),
    );
    const userSnapshot = await getDocs(userQuery);
    return userSnapshot.size;
  }
  return 0;
};

//---------- Last Appointment Data of user -------------
export const checkLastAppointment = async (db: any, user: any) => {
  if (user?.email) {
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", user.email),
    );

    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.size > 0) {
      const userId = userSnapshot.docs[0].id;

      const locationsQuery = query(collection(db, "locations"));
      const locationsSnapshot = await getDocs(locationsQuery);

      const eventsData: any = [];
      for (const locationDoc of locationsSnapshot.docs) {
        const eventsRef = collection(locationDoc.ref, "events");
        const eventsQuery = query(
          eventsRef,
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
        );

        const eventsSnapshot = await getDocs(eventsQuery);

        eventsSnapshot.forEach((eventDoc) => {
          eventsData.push({
            ...eventDoc.data(),
            id: eventDoc.id,
            location: locationDoc.data(),
          });
        });
      }

      let sortedEvents = eventsData.sort((a: any, b: any) => {
        if (a.updatedAt.seconds === b.updatedAt.seconds) {
          return b.updatedAt.nanoseconds - a.updatedAt.nanoseconds;
        } else {
          return b.updatedAt.seconds - a.updatedAt.seconds;
        }
      });
      return sortedEvents;
    }
  }
  return [];
};

//---------- Create Event Data ----------------
export const createAppointment = async (
  db: any,
  location: string,
  data: any,
) => {
  const docRef = await addDoc(
    collection(db, `locations/${location}/events`),
    data,
  );
  if (docRef.id) {
    return docRef.id;
  }
};

//----------- Create User in user Collection ------------
export const createUserWithDetails = async (db: any, data: any) => {
  const docRef = await addDoc(collection(db, `users`), data);
  if (docRef.id) {
    return docRef.id;
  }
};

//------------ Fetch User Data -------------------
export const getUserData = async (db: any, email: string) => {
  if (email) {
    const locationQuery = query(
      collection(db, "users"),
      where("email", "==", email),
    );
    const locationSnapshot = await getDocs(locationQuery);

    let user: any = [];
    locationSnapshot.forEach((item) =>
      user.push({ ...item.data(), id: item.id }),
    );

    return user[0];
  }
  return {};
};

//------------ Update Time Slots -------------------
const generateSlots = (time: any) => {
  const timeSlots: any = [];

  time.forEach((slot: any) => {
    const startTime = moment(slot.startTime, "HH:mm");
    const endTime = moment(slot.endTime, "HH:mm");

    while (startTime.isSameOrBefore(endTime)) {
      timeSlots.push(startTime.format("HH:mm"));
      startTime.add(15, "minutes");
    }
  });
  return timeSlots;
};

const generateTimeArray = (timeSlots: any) => {
  const result = [];
  let currentRange = { startTime: "", endTime: "" };

  for (const time of timeSlots) {
    if (!currentRange.startTime) {
      currentRange.startTime = time;
    } else {
      const currentTime = moment(time, "HH:mm");
      const previousTime = moment(currentRange.endTime, "HH:mm");

      if (currentTime.diff(previousTime, "minutes") !== 15) {
        result.push({
          startTime: currentRange.startTime,
          endTime: currentRange.endTime,
        });
        currentRange = { startTime: time, endTime: "" };
      }
    }
    currentRange.endTime = time;
  }

  if (currentRange.startTime) {
    result.push({
      startTime: currentRange.startTime,
      endTime: currentRange.endTime,
    });
  }

  // Format the output using Moment.js
  const formattedResult = result.map((range) => ({
    startTime: moment(range.startTime, "HH:mm").format("HH:mm"),
    endTime: moment(range.endTime, "HH:mm").format("HH:mm"),
  }));
  return formattedResult;
};

export const updateTimeSheet = async (db: any, data: any) => {
  let time = data.value.dateTime.barber.time;

  let slotStart = moment(data.value.dateTime.slot, "HH:mm").format("HH:mm");
  let serviceTime = data.value.dateTime.barber.timeData.serviceTime;

  let slotEnd = moment(slotStart, "HH:mm")
    .add("minutes", serviceTime)
    .format("HH:mm");

  let totalSlots = generateSlots(time);
  let selectedSlots = generateSlots([
    {
      startTime: slotStart,
      endTime: slotEnd,
    },
  ]);

  let remainingSlots: any = [];
  totalSlots.forEach((item: any) => {
    if (!selectedSlots.includes(item)) {
      remainingSlots.push(item);
    }
  });

  let finalArray = generateTimeArray(remainingSlots);
  const date = `${data.value.dateTime?.day?.date}-${data.value.dateTime?.data?.monthNum}-${data.value.dateTime?.data?.year}`;
  const barberId = data.value.dateTime.barber.id;

  await updateDoc(doc(db, `timesheet/${date}/barbers/${barberId}`), {
    time: finalArray,
  });
};
