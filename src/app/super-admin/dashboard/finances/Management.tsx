'use client';
import { payment } from '@/app/api/super-admin/payment';
import { PaymentStatsResponse } from '@/app/api/super-admin/payment/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Management() {
  const [stats, setStats] = useState<PaymentStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch payment stats from API
  const fetchPaymentStats = async () => {
    try {
      setIsLoading(true);
      const response = await payment.paymentStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error('Failed to fetch payment stats');
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  // ✅ Show loading state
  if (isLoading || !stats) {
    return (
      <div className="text-center text-white py-10">
        Loading financial data...
      </div>
    );
  }

  const credentials = [
    {
      id: 1,
      img: '/images/ravanue.svg',
      val: `$${stats.totalRevenue.toLocaleString()}`,
      title: 'Total Revenue',
    },
    {
      id: 2,
      img: '/images/refunds.svg',
      val: `$${stats.refundedAmount.toLocaleString()}`,
      title: 'Refunded Amount',
    },
    {
      id: 3,
      img: '/images/p-app.svg',
      val: stats.pendingPayments.toLocaleString(),
      title: 'Pending Payments',
    },
    {
      id: 4,
      img: '/images/subscription.svg',
      val: stats.successfulPayments.toLocaleString(),
      title: 'Successful Payments',
    },
  ];

  return (
    <div className="mb-10">
      <h2 className="text-[16px] sm:text-[20px] font-semibold leading-6 mb-2">
        Financial Management
      </h2>
      <p className="font-regular text-[12px] sm:text-[16px] leading-5 text-[#FFFFFF99]">
        Track, review, and manage all financial transactions including charges,
        refunds, and host payments in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-[22px]">
        {credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-[18px] leading-[22px] text-white whitespace-nowrap truncate mr-3">
                  {item.val}
                </h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
