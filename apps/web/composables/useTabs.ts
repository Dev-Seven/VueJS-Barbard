export const useTabs = () => {
  const activeTab = useState<number>("activeTab", () => 1);

  const setActiveTab = (value: number) => {
    activeTab.value = value;
  };

  return { activeTab, setActiveTab };
};
