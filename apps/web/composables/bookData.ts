import moment from "moment";

// interface TimeRange {
//   startTime: string;
//   endTime: string;
// }

export const bookData = () => {
  const locations = useState("locations", () => []);
  const setLocations = (data: any) => {
    locations.value = data;
  };

  const services = useState("services", () => []);
  const setServices = (data: any) => {
    services.value = data;
  };

  const upgrades = useState("upgrades", () => []);
  const setUpgrades = (data: any) => {
    upgrades.value = data;
  };

  const lastAppointmentData = useState("lastAppointmentData", () => []);
  const setLastAppointmentData = (data: any) => {
    lastAppointmentData.value = data;
  };

  let userData = ref({});

  return {
    locations,
    setLocations,
    services,
    setServices,
    upgrades,
    setUpgrades,
    userData,
    lastAppointmentData,
    setLastAppointmentData,
  };
};

export const generateTimeSheet = (timeStamps: any, serviceTime: any) => {
  // Convert serviceTime to minutes
  const serviceTimeInMinutes = serviceTime;

  const timeIntervals: string[] = [];
  timeStamps.forEach((timeRange: any) => {
    const startTime = moment(timeRange.startTime, "HH:mm");
    const endTime = moment(timeRange.endTime, "HH:mm");

    while (startTime.isBefore(endTime)) {
      // Check if the current slot can accommodate the service time
      const slotEndTime = moment(startTime).add(
        serviceTimeInMinutes,
        "minutes",
      );
      if (slotEndTime.isSameOrBefore(endTime)) {
        timeIntervals.push(startTime.format("HH:mm"));
      }
      startTime.add(15, "minutes");
    }
  });
  return timeIntervals;
};

export const convertToTimeRanges = (timestamps: string[]) => {
  const timeRanges = [];
  let startTime = null;

  for (let i = 0; i < timestamps.length; i++) {
    if (startTime === null) {
      startTime = timestamps[i];
    }

    if (
      i === timestamps.length - 1 ||
      timestamps[i + 1] !== add15Minutes(timestamps[i])
    ) {
      const currentTimestamp = moment(timestamps[i], "HH:mm");
      timeRanges.push({
        startTime,
        endTime: currentTimestamp.add(15, "minutes").format("HH:mm"),
      });
      startTime = null;
    }
  }

  return timeRanges;
};

const add15Minutes = (time: string) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10) + 15);
  return date.toTimeString().slice(0, 5);
};
