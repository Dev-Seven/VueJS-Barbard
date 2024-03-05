import lodash from "lodash";
const { isString } = lodash;

export const parseStaffAny = (staffAny: string | boolean) => {
  if (isString(staffAny)) {
    return staffAny === "true";
  }
  return Boolean(staffAny);
};
