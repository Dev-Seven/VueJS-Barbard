export const currencyFormat = (value: string | number) => {
  const number = +value;
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(number)
    .replace(/,/g, ".");
  return formattedValue;
};
