import React from "react";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "tickets", label: "Tickets" },
    { id: "announcements", label: "Announcements" },
  ];

  return (
    <div className="flex p-[6px] items-center gap-[20px] rounded-[12px]  w-full max-w-[270px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex px-4 py-2 cursor-pointer justify-center items-center rounded-[8px] transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-[rgba(239,252,118,0.12)] text-[#EFFC76]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
