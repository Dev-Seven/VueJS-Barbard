export const useFinal = () => {
  const final = useState<boolean>("final", () => false);

  const setFinal = (value: boolean) => {
    final.value = value;
  };

  return { final, setFinal };
};
