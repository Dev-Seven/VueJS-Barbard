export const useFooterSize = () => {
  const size = useState<number>("size", () => 110);

  const setSize = (value: number) => {
    size.value = value;
  };

  return { size, setSize };
};
