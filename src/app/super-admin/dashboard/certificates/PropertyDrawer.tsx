"use client";
import React, { useState, useRef, useEffect } from "react";

interface DrawerProps {
  onClose: () => void;
  isOpen: boolean;
}

interface Rule {
  id: string;
  text: string;
  isEditing: boolean;
  isNew?: boolean;
}

const AddPropertyDrawer: React.FC<DrawerProps> = ({ onClose, isOpen }) => {
  const [certificateName, setCertificateName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [validity, setValidity] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      text: "Fire safety equipment (extinguishers, alarms, exit plan)",
      isEditing: false,
    },
    {
      id: "2",
      text: "Waste disposal system compliance",
      isEditing: false,
    },
    {
      id: "3",
      text: "Maintenance/inspection report",
      isEditing: false,
    },
    {
      id: "4",
      text: "Utility bills (electricity/water matching address)",
      isEditing: false,
    },
  ]);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Handle form submission
  const handleAddCertificate = () => {
    const certificateData = {
      certificateName,
      propertyType,
      validity,
      rules: rules.map(rule => rule.text),
    };
    
    console.log("Adding certificate:", certificateData);
    alert("Property Added Successfully!");
    
    // Reset form
    setCertificateName("");
    setPropertyType("");
    setValidity("");
    setRules([
      {
        id: "1",
        text: "Fire safety equipment (extinguishers, alarms, exit plan)",
        isEditing: false,
      },
      {
        id: "2",
        text: "Waste disposal system compliance",
        isEditing: false,
      },
      {
        id: "3",
        text: "Maintenance/inspection report",
        isEditing: false,
      },
      {
        id: "4",
        text: "Utility bills (electricity/water matching address)",
        isEditing: false,
      },
    ]);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Add new rule
  const handleAddRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      text: "",
      isEditing: true,
      isNew: true,
    };
    
    setRules([...rules, newRule]);
  };

  // Start editing a rule
  const handleEditRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isEditing: true } : rule
    ));
  };

  // Save edited rule
  const handleSaveRule = (id: string, newText: string) => {
    if (newText.trim() === "") {
      // If empty text and it's a new rule, remove it
      if (rules.find(rule => rule.id === id)?.isNew) {
        handleDeleteRule(id);
      }
      return;
    }
    
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, text: newText.trim(), isEditing: false, isNew: false } : rule
    ));
  };

  // Delete rule
  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }

    if (isMounted) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMounted, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isMounted) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }

    if (isMounted) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMounted, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleOverlayClick}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] text-white flex flex-col justify-between p-[28px] w-[90vw] sm:w-[608px] z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Heading */}
        <div>
          <h2 className="text-[20px] font-medium mb-3 transition-all duration-300 ease-out">Add New Property Type</h2>
          <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 transition-all duration-300 ease-out">
            Define a property category and set up rules for its certification.
          </p>

          {/* Certificate Name */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
             Property type name
            </label>
            <input
              type="text"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              placeholder="Enter name"
              className="w-full h-[52px] bg-[#1a1a1a] text-white text-sm rounded-md px-3 border border-[#2b2b2b] 
                        focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-gray-500
                        focus:border-[#f8f94d] focus:shadow-[0_0_0_2px_rgba(248,249,77,0.1)] placeholder:text-white/40"
            />
            
            {/* Add Rule Section */}
            <div className="pt-5 pb-3 flex items-center justify-between transition-all duration-300 ease-out">
              <p className="text-[14px] font-medium leading-[18px]">Add compliance rule</p> 
              <button
                onClick={handleAddRule}
                className="text-[16px] font-regular leading-5 cursor-pointer text-[#EFFC76] underline transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80 active:scale-95"
              >
                Add Rule
              </button>
            </div>
            
            {/* Rules List */}
            <div className="flex flex-col gap-[10px] transition-all duration-300 ease-out">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="group relative bg-gradient-to-b from-[#202020] to-[#101010] py-[17px] px-3 border border-[#FFFFFF1F] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-white/30"
                >
                  {rule.isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={rule.text}
                        placeholder="Enter rule text..."
                        onBlur={(e) => handleSaveRule(rule.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRule(rule.id, e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            if (rule.isNew) {
                              handleDeleteRule(rule.id);
                            } else {
                              handleSaveRule(rule.id, rule.text);
                            }
                          }
                        }}
                        className="flex-1 bg-transparent text-white border-b border-[#EFFC76] focus:outline-none placeholder:text-white/60"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(`input[defaultValue="${rule.text}"]`) as HTMLInputElement;
                          handleSaveRule(rule.id, input?.value || rule.text);
                        }}
                        className="text-[#EFFC76] text-sm hover:underline transition-all duration-200"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p 
                        className="font-regular leading-[18px] text-[14px] text-[#FFFFFF] cursor-pointer flex-1"
                        onClick={() => handleEditRule(rule.id)}
                      >
                        {rule.text || <span className="text-white/40">Click to edit rule...</span>}
                      </p>
                      {/* Delete icon that appears on hover */}
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out
                                  text-red-400 hover:text-red-300 p-1 rounded"
                        title="Delete rule"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Property Button */}
        <div className="transition-all duration-300 ease-out">
          <button
            onClick={handleAddCertificate}
            className="w-full h-[52px] py-4 text-[18px] font-semibold rounded-md yellow-btn text-black text-sm 
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      hover:scale-[1.02] active:scale-[0.98]"
          >
            Add Property Type
          </button>
        </div>
      </div>
    </>
  );
};

AddPropertyDrawer.displayName = "AddPropertyDrawer";

export default AddPropertyDrawer;