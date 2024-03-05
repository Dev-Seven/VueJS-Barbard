export const useBarberInfo = () => {
  const info = useState<boolean>("info", () => false);

  const setInfo = (value: boolean) => {
    info.value = value;
  };

  return { info, setInfo };
};
