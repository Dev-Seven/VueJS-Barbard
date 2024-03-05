export const useBooking = () => {
  const bookingData = useState<any>("bookingData", () => {});
  const userForm = useState<any>("userForm", () => {});

  const setBookingData = (data: { name: string; value: any }) => {
    bookingData.value = {
      ...bookingData.value,
      [data.name]: data.value,
    };
  };

  const setUserForm = (data: any) => {
    userForm.value = data;
  };

  const clearBookingData = () => {
    bookingData.value = {};
  };

  const selectService = (item: any) => {
    if (bookingData.value?.service?.find((prev: any) => prev.id == item.id)) {
      let service = bookingData.value.service.filter(
        (item1: any) => item1.id !== item.id,
      );
      bookingData.value = {
        ...bookingData.value,
        service: service,
      };
    } else {
      let service: any = [];
      if (bookingData.value.service) {
        service = [...bookingData.value?.service, item];
      } else {
        service = [item];
      }
      bookingData.value = {
        ...bookingData.value,
        service: service,
      };
    }
    delete bookingData.value.dateTime;
  };

  const selectUpgrade = (item: any) => {
    if (bookingData.value?.upgrade?.find((prev: any) => prev.id == item.id)) {
      let upgrade = bookingData.value.upgrade.filter(
        (item1: any) => item1.id !== item.id,
      );
      bookingData.value = {
        ...bookingData.value,
        upgrade: upgrade,
      };
    } else {
      let upgrade: any = [];
      if (bookingData.value.upgrade) {
        upgrade = [...bookingData.value?.upgrade, item];
      } else {
        upgrade = [item];
      }
      bookingData.value = {
        ...bookingData.value,
        upgrade: upgrade,
      };
    }
  };

  return {
    bookingData,
    userForm,
    setUserForm,
    setBookingData,
    selectService,
    selectUpgrade,
    clearBookingData,
  };
};
