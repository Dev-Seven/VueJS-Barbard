export const useModalState = () => {
  const modalState = useState<number>("modalState", () => 0);
  const isUser = useState<boolean>("isUser", () => false);

  const setModalState = (value: number) => {
    modalState.value = value;
  };

  const setIsUser = (value: boolean) => {
    isUser.value = value;
  };

  return { modalState, setModalState, isUser, setIsUser };
};
