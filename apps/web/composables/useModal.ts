export const useModal = () => {
  const modal = useState<boolean>("modal", () => false);

  const toggleModal = (value: boolean) => {
    modal.value = value;
  };

  return { modal, toggleModal };
};
