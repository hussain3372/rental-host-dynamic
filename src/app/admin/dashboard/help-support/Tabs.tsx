import React from "react";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "host", label: "Host Tickets" },
    { id: "my", label: "My Tickets" },
  ];

  return (
    <div className="flex p-[6px] items-center gap-[20px] rounded-[12px] bg-[#121315] w-full max-w-[249px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex px-4 py-2 justify-center items-center rounded-[8px] transition-all duration-200 cursor-pointer ${
            activeTab === tab.id
              ? "bg-[rgba(239,252,118,0.12)] text-[#EFFC76]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <span
            className={`text-[14px] font-medium leading-[18px] ${
              activeTab === tab.id ? "text-[#EFFC76]" : "text-gray-400"
            }`}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
