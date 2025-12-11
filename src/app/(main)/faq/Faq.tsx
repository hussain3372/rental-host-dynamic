"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import HeroSection from "./HeroSection";

// Define type for each FAQ item
interface FAQ {
  question: string;
  answer: string;
}

// Props for FAQItem
interface FAQItemProps {
  faq: FAQ;
  index: number;
  toggleItem: (index: number) => void;
  openItems: Set<number>;
}

// FAQ item component
const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  index,
  toggleItem,
  openItems,
}) => {
  const isOpen = openItems.has(index);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const content = contentRef.current;
    const scrollHeight = content.scrollHeight;

    if (isOpen) {
      content.style.maxHeight = `${scrollHeight}px`;
      content.style.opacity = "1";
    } else {
      content.style.maxHeight = "0px";
      content.style.opacity = "0";
    }
  }, [isOpen]);

  return (
    <div className="mb-0">
      <button
        onClick={() => toggleItem(index)}
        className={`w-full text-left p-0 bg-transparent border-none cursor-pointer transition-colors duration-300 ${
          isOpen ? "text-[#EFFC76]" : "text-white"
        }`}
      >
        <div
          className={`flex items-center justify-between ${
            isOpen ? "pb-[14px]" : "pb-[60px]"
          }`}
        >
          <h3 className="sm:text-[24px] text-[20px] font-medium pr-4 leading-6 sm:leading-8">
            {faq.question}
          </h3>
          <div className="flex-shrink-0 ml-2">
            <Image
              src={
                isOpen ? "/images/multiple-icon.png" : "/images/plus-icon.png"
              }
              alt={isOpen ? "Collapse" : "Expand"}
              width={24}
              height={24}
              className="transition-all duration-300 opacity-80 hover:opacity-100"
            />
          </div>
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isOpen ? "none" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pb-[60px] pr-8">
          <p className="text-[#D5D5D5] font-medium text-[16px] sm:text-[20px] sm:leading-6 leading-5">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Faq component
type FaqProps = {
  heading?: string;
  subtext?: string;
};

const Faq: React.FC<FaqProps> = ({ heading, subtext }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqs: FAQ[] = [
    {
      question: "What is StaySafe Verified?",
      answer:
        "StaySafe Verified is a third-party Safety & Comfort Assessment designed specifically for short-term rentals. It is not a code inspection or government certification. We review things that matter most to guests—fire safety, CO protection, exits, lighting, walkways, and general comfort.",
    },
    {
      question: "What does the Trusted Stay™ Badge mean?",
      answer:
        "The verified badge indicates that the property has been authenticated and meets our quality standards. This ensures credibility and trust for potential buyers or renters.",
    },
    {
      question: "Is this a building code inspection?",
      answer:
        "Yes, our QR codes are securely generated and regularly updated. They provide direct access to verified property information and are protected against tampering.",
    },
    {
      question: "How does the verification process work?",
      answer:
        "Yes, verified property certificates are available for viewing. You can access them through your account dashboard or by requesting them from our support team.",
    },
    {
      question: "Can I display the badge on Airbnb, VRBO, or Booking.com?",
      answer:
        "We strive to verify all properties, but the process may vary. Properties with verification badges have completed our full authentication process.",
    },
    {
      question: "How do guests use the QR code?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "How long is my verification valid?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "What do Red Alerts mean?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "What are Seasonal Safety Reminders?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "What is included in the Monthly Virtual Q&A?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "Are guests safer because a home is StaySafe Verified?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "Who is responsible for maintaining safety at the property?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "What if I have multiple properties?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
    {
      question: "How do I contact support?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
  ];

  return (
    <div>
      <HeroSection
        title="Everything You Need to Know About the StaySafe"
        buttonText="FAQ"
        buttonIcon="/images/value.png"
      />
      <div className="bg-[#121315] container-class text-white py-9 sm:py-[80px] px-[10px] md:px-[23px] lg:px-[120px]">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            faq={faq}
            index={index}
            toggleItem={toggleItem}
            openItems={openItems}
          />
        ))}
      </div>
    </div>
  );
};

export default Faq;
