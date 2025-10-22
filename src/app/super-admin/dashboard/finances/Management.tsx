'use client'
import Image from 'next/image'
import React, { useState, useMemo } from 'react'
import Dropdown from '@/app/shared/Dropdown'

export default function Management() {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<number, string>>({
    1: "Today",
    2: "Today",
    3: "Today",
    4: "Today",
  });

  // Data for different time periods
  // const dataByPeriod = {
  //   1: { // Total Revenue
  //     "Today": "$125,430",
  //     "Last week": "$876,250",
  //     "Last month": "$3,450,680"
  //   },
  //   2: { // Refunds Issued
  //     "Today": "$4,230",
  //     "Last week": "$28,540",
  //     "Last month": "$95,320"
  //   },
  //   3: { // Pending Transactions
  //     "Today": "340",
  //     "Last week": "2,156",
  //     "Last month": "8,742"
  //   },
  //   4: { // Total Subscriptions
  //     "Today": "8k",
  //     "Last week": "7.8k",
  //     "Last month": "7.2k"
  //   },
  // };

const Credentials = useMemo(() => {
  const dataByPeriod = {
   1: { // Total Revenue
      "Today": "$125,430",
      "Last week": "$876,250",
      "Last month": "$3,450,680"
    },
    2: { // Refunds Issued
      "Today": "$4,230",
      "Last week": "$28,540",
      "Last month": "$95,320"
    },
    3: { // Pending Transactions
      "Today": "340",
      "Last week": "2,156",
      "Last month": "8,742"
    },
    4: { // Total Subscriptions
      "Today": "8k",
      "Last week": "7.8k",
      "Last month": "7.2k"
    },
  };

  return [
    {
      id: 1,
      img: "/images/ravanue.svg",
      val: dataByPeriod[1][selectedPeriods[1] as keyof typeof dataByPeriod[1]],
      title: "Total Revenue"
    },
    {
      id: 2,
      img: "/images/refunds.svg",
      val: dataByPeriod[2][selectedPeriods[2] as keyof typeof dataByPeriod[2]],
      title: "Refunds Issued"
    },
    {
      id: 3,
      img: "/images/p-app.svg",
      val: dataByPeriod[3][selectedPeriods[3] as keyof typeof dataByPeriod[3]],
      title: "Pending Transactions"
    },
    {
      id: 4,
      img: "/images/subscription.svg",
      val: dataByPeriod[4][selectedPeriods[4] as keyof typeof dataByPeriod[4]],
      title: "Total Subscriptions"
    },
  ];
}, [selectedPeriods]);

  const handlePeriodChange = (id: number, period: string) => {
    setSelectedPeriods(prev => ({
      ...prev,
      [id]: period
    }));
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className='mb-10'>
      <h2 className='text-[16px] sm:text-[20px] font-semibold leading-6 mb-2'>Financial Management</h2>
      <p className='font-regular text-[12px] sm:text-[16px] leading-5 text-[#FFFFFF99]'>
        Track, review, and manage all financial transactions including charges, refunds, and host payments in one place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-[22px]">
        {Credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div className="flex-1 min-w-0">
                <div className="flex w-full items-center justify-between">
                  <h2 className="font-medium text-[18px] leading-[22px] text-white whitespace-nowrap truncate mr-3">
                    {item.val}
                  </h2>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className="text-[12px] cursor-pointer font-regular px-2 py-1 flex items-center gap-1 hover:bg-white/5 rounded transition-colors"
                    >
                      <span className='font-regular text-[12px] leading-4 text-[#FFFFFF99]'>{selectedPeriods[item.id]}</span>
                      <Image src="/images/down.svg" alt='Dropdown' height={12} width={12} />
                    </button>
                    <div className='absolute left-40 top-40'>
                    <Dropdown
                      items={[
                        {
                          label: "Today",
                          onClick: () => handlePeriodChange(item.id, "Today")
                        },
                        {
                          label: "Last week",
                          onClick: () => handlePeriodChange(item.id, "Last week")
                        },
                        {
                          label: "Last month",
                          onClick: () => handlePeriodChange(item.id, "Last month")
                        },
                      ]}
                      isOpen={openDropdownId === item.id}
                      onClose={() => setOpenDropdownId(null)}
                    />
                    </div>
                  </div>
                </div>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}