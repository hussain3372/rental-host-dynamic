"use client";
import { property } from "@/app/api/super-admin/property-type";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { PropertyType } from "@/app/api/super-admin/property-type/types";

interface DrawerProps {
  onClose: () => void;
  isOpen: boolean;
  propertyType?: PropertyType | null;
}

interface Rule {
  id: string;
  name: string;
  isNew?: boolean; // Track if it's a newly added rule
}

const AddPropertyDrawer: React.FC<DrawerProps> = ({
  onClose,
  isOpen,
  propertyType,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      name: "Fire safety equipment (extinguishers, alarms, exit plan)",
      isNew: true,
    },
    { id: "2", name: "Waste disposal system compliance", isNew: true },
    { id: "3", name: "Maintenance/inspection report", isNew: true },
    {
      id: "4",
      name: "Utility bills (electricity/water matching address)",
      isNew: true,
    },
  ]);

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingChecklistId, setDeletingChecklistId] = useState<string | null>(
    null
  );
  const drawerRef = useRef<HTMLDivElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (propertyType) {
      setName(propertyType.name);
      setDescription(propertyType.description);
      setRules(
        propertyType.checklists?.map((item) => ({
          id: item.id,
          name: item.name,
          isNew: false, // Existing checklist from backend
        })) || [{ id: "1", name: "", isNew: true }]
      );
    } else {
      // Reset form for create mode
      setName("");
      setDescription("");
      setRules([
        {
          id: "1",
          name: "Fire safety equipment (extinguishers, alarms, exit plan)",
          isNew: true,
        },
        { id: "2", name: "Waste disposal system compliance", isNew: true },
        { id: "3", name: "Maintenance/inspection report", isNew: true },
        {
          id: "4",
          name: "Utility bills (electricity/water matching address)",
          isNew: true,
        },
      ]);
    }
  }, [propertyType]);

  // Drawer animation logic
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Add new compliance rule input
  const handleAddRule = () => {
    setRules([...rules, { id: Date.now().toString(), name: "", isNew: true }]);
  };

  // Update rule text
  const handleChangeRule = (id: string, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, name: value } : r)));
  };

  const handleDeleteRule = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setRules(rules.filter((r) => r.id !== id));
      return;
    }
    try {
      setDeletingChecklistId(id);
      await property.deleteChecklist(id);
      setRules(rules.filter((r) => r.id !== id));
    } catch (error) {
      console.error(" Error deleting checklist:", error);
      toast.error("Failed to delete checklist");
    } finally {
      setDeletingChecklistId(null);
    }
  };

  // Submit form (Create or Update)
  const handleAddProperty = async () => {
    const payload = {
      name,
      description,
      defaultChecklist: rules
        .filter((r) => r.name.trim() !== "")
        .map((r) => ({
          id: r.isNew ? undefined : r.id,
          name: r.name,
        })),
    };

    try {
      setLoading(true);

      if (propertyType) {
        await property.updatePropertyType(propertyType.id, payload);
      } else {
        await property.createPropertyData(payload);
      }

      setName("");
      setDescription("");
      setRules([{ id: "1", name: "", isNew: true }]);
      setIsVisible(false);
      setTimeout(onClose, 300);
    } catch (error) {
      console.error("❌ Error saving property:", error);
      toast.error(
        propertyType
          ? "Failed to update property type"
          : "Failed to add property type"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-500 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-[#0A0C0B] border-l border-[#FFFFFF1F] text-white flex flex-col justify-between p-[28px] w-[90vw] sm:w-[608px] z-50 transform transition-transform duration-500 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Heading */}
        <div>
          <h2 className="text-[20px] font-medium mb-3">
            {propertyType ? "Edit Property Type" : "Add New Property Type"}
          </h2>
          <p className="text-[#FFFFFF99] text-[16px] mb-10">
            {propertyType
              ? "Update the property category and its certification rules."
              : "Define a property category and set up rules for its certification."}
          </p>

          {/* Property Type Name */}
          <div className="mb-5">
            <label className="block text-[14px] mb-2 font-medium">
              Property Type Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter property name"
              className="w-full h-[48px] px-3 bg-[#1a1a1a] border border-[#2b2b2b] rounded-md focus:border-[#EFFC76] outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-[14px] mb-2 font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter property description"
              className="w-full min-h-[100px] p-3 bg-[#1a1a1a] border border-[#2b2b2b] rounded-md focus:border-[#EFFC76] outline-none"
            />
          </div>

          {/* Compliance Rules */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-medium">Add Compliance Rules</p>
            <button
              onClick={handleAddRule}
              className="text-[#EFFC76] underline hover:opacity-80"
            >
              + Add Rule
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 bg-[#101010] p-3 border border-[#FFFFFF1F] rounded-lg"
              >
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => handleChangeRule(rule.id, e.target.value)}
                  placeholder="Enter rule name"
                  className="flex-1 bg-transparent border-b border-[#EFFC76] outline-none text-white placeholder:text-white/50"
                />
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.isNew)}
                  disabled={deletingChecklistId === rule.id}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[20px]"
                >
                  {deletingChecklistId === rule.id ? "..." : "✕"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            onClick={handleAddProperty}
            disabled={loading}
            className="w-full h-[52px] bg-[#EFFC76] text-black font-semibold rounded-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading
              ? propertyType
                ? "Updating..."
                : "Adding..."
              : propertyType
              ? "Update Property Type"
              : "Add Property Type"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddPropertyDrawer;
