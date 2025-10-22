import React, { useState, useRef, useEffect } from 'react';
import BlackButton from "../../shared/BlackButton";
import Image from 'next/image';

// Define type for each FAQ item
interface FAQ {
  question: string;
  answer: string;
}

// Props type for FAQItem
interface FAQItemProps {
  faq: FAQ;
  index: number;
  isLeft?: boolean;
  toggleItem: (index: number) => void;
  openItems: Set<number>;
  leftFAQsLength: number;
}

const FaqSection = () => {
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

  const leftFAQs: FAQ[] = [
    {
      question: "How do I verify this property?",
      answer:
        "Lorem ipsum dolor sit amet consectetur. Eros magna sit aliquet massa enim mauris euismod suscipit. In potenti porta velit molestie fusce mauris molestie risus blandit mauris cursus porttitor in. Vitae purus facilisis.",
    },
    {
      question: "What does the verified badge mean?",
      answer:
        "The verified badge indicates that the property has been authenticated and meets our quality standards. This ensures credibility and trust for potential buyers or renters.",
    },
    {
      question: "Can I trust the QR code?",
      answer:
        "Yes, our QR codes are securely generated and regularly updated. They provide direct access to verified property information and are protected against tampering.",
    },
    {
      question: "How often is verification updated?",
      answer:
        "Property verifications are updated regularly based on market conditions, property changes, and periodic re-assessments to maintain accuracy.",
    },
  ];

  const rightFAQs: FAQ[] = [
    {
      question: "Can I view the property certificate?",
      answer:
        "Yes, verified property certificates are available for viewing. You can access them through your account dashboard or by requesting them from our support team.",
    },
    {
      question: "Is every property on this platform verified?",
      answer:
        "We strive to verify all properties, but the process may vary. Properties with verification badges have completed our full authentication process.",
    },
    {
      question: "Can I share the certificate with others?",
      answer:
        "Property certificates can be shared with authorized parties such as legal advisors, financial institutions, or other stakeholders involved in your transaction.",
    },
    {
      question: "Can I share the certificate with others?",
      answer:
        "Yes, you can share certificates with relevant parties. We provide secure sharing options to maintain privacy while allowing necessary access.",
    },
    {
      question: "Who certifies the properties?",
      answer:
        "Properties are certified by our licensed verification team, including qualified assessors, legal experts, and technical specialists who ensure comprehensive property evaluation.",
    },
  ];

  const FAQItem: React.FC<FAQItemProps> = ({
    faq,
    index,
    isLeft = true,
    toggleItem,
    openItems,
    leftFAQsLength,
  }) => {
    const actualIndex = isLeft ? index : index + leftFAQsLength;
    const isOpen = openItems.has(actualIndex);
    const contentRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!contentRef.current) return;
  const content = contentRef.current;
  const scrollHeight = content.scrollHeight;

  if (isOpen) {
    // OPEN
    content.style.maxHeight = `${scrollHeight}px`;
    content.style.opacity = '1';
  } else {
    // CLOSE
    content.style.maxHeight = '0px';
    content.style.opacity = '0';
  }
}, [isOpen]);

    return (
      <div className="mb-4 border-b border-[#333]">
        <button
          onClick={() => toggleItem(actualIndex)}
          className={`w-full text-left p-0 bg-transparent border-none cursor-pointer transition-colors duration-300 ${
            isOpen ? "text-[#EFFC76]" : "text-white "
          }`}
        >
          <div className="flex items-center justify-between py-4">
            <h3 className="text-[20px] font-medium pr-4 leading-6">
              {faq.question}
            </h3>
            <div className="flex-shrink-0 ml-2">
              {isOpen ? (
                <Image
                  src="/images/multiple-icon.png"
                  alt="Collapse"
                  width={24}
                  height={24}
                  className="transition-all duration-300 opacity-80 hover:opacity-100"
                />
              ) : (
                <Image
                  src="/images/plus-icon.png"
                  alt="Expand"
                  width={24}
                  height={24}
                  className="transition-all duration-300 opacity-80 hover:opacity-100"
                />
              )}
            </div>
          </div>
        </button>

        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            maxHeight: isOpen ? 'none' : '0px',
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="pb-4 pr-8">
            <p className="text-[#D5D5D5] font-medium text-[18px] leading-[22px]">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-class text-white">
      <div className="px-4 md:px-[80px] lg:px-[120px] py-8">
        <div className="sm:pb-[64px] pb-[30px]">
          <div className="flex items-center mb-[40px]">
            <BlackButton
              text="FAQ"
              iconSrc="/images/FAQ.png"
              iconWidth={32}
              iconHeight={32}
              className="max-w-[113px] w-full mb-0 sm:mb-10"
            />
          </div>

          <h1 className="text-[20px] md:text-[30px] lg:text-[48px] sm:leading-[25px] md:leading-[30px] font-medium lg:leading-[56px] w-full">
            What You need to know
          </h1>

          <p className="text-[#FFFFFF99] pt-[24px] font-medium sm:text-[18px] leading-[22px] max-[425px] text-[14px] w-full max-w-[661px]">
            Quick answers to the most common questions about our certifications
            and services.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-16">
          <div className="space-y-0">
            {leftFAQs.map((faq, index) => (
              <FAQItem
                key={`left-${index}`}
                faq={faq}
                index={index}
                isLeft={true}
                toggleItem={toggleItem}
                openItems={openItems}
                leftFAQsLength={leftFAQs.length}
              />
            ))}
          </div>

          <div className="space-y-0">
            {rightFAQs.map((faq, index) => (
              <FAQItem
                key={`right-${index}`}
                faq={faq}
                index={index}
                isLeft={false}
                toggleItem={toggleItem}
                openItems={openItems}
                leftFAQsLength={leftFAQs.length}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;