import { useState, useEffect } from "react";
// import React, { useRef } from 'react';
import VendorHandleInput from "./VendorHandleInput"; // Adjust the path as needed
// import BrandSettings from "@/features/auth/sign-up/onboarding/components/BrandSettings"
import { useNavigate } from "@tanstack/react-router";
import ChatwootWidget from '@/components/ChatwootWidget'
import { Link } from "@tanstack/react-router";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Button 
} from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconDeviceFloppy,
  IconArrowRight,
  IconUser,
  IconInfoCircle,
  IconMail,
  IconBuilding,
  IconCreditCard,
  IconFileText,
  IconCheckbox,
  IconChevronRight,
  IconHelpCircle,
  IconX,
  IconAward,
  IconBookmark,
  IconCalendar,
  IconGift,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ApiVendorResponse {
  vendor: VendorData;
}

// Type for the vendor data (same as your original)
interface VendorData {
  id: string;
  handle: string;
  name: string;
  logo: string | null;
  coverphoto: string | null;
  youtube: string | null;
  instagram: string | null;
  xtwitter: string | null;
  othersocial: string | null;
  phonenumber: string | null;
  GSTIN: string | null;
  gst_verification_status: "pending" | "verified" | "failed";
  companyname: string | null;
  pan_number: string | null;
  city: string | null;
  pincode: string | null;
  state: string | null;
  address: string | null;
  tan_number: string | null;
  bank_account_holder_name: string | null;
  bank_account_number: string | null;
  bank_account_ifsc_code: string | null;
  bank_name: string | null;
  bank_account_type: "Saving" | "Current";
  cancelled_checkque: string | null;
  creator_bio: string | null;
  creator_title: string | null;
  creator_category: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
   // Add the admins property to match API response
    // Add the admins property to match API response
  admin: {
    email: string,
    first_name: string,
    last_name: string
  }[]
}

// Enhanced steps with more information and visual elements
const STEPS = [
  { 
    id: "welcome", 
    title: "Welcome", 
    description: "Start your creator journey", 
    icon: IconAward,
    isSkippable: false,
    requiredFields: [],
  },
  { 
    id: "basic-info", 
    title: "Basic Information", 
    description: "Brand profile and contact details", 
    icon: IconUser,
    isSkippable: false,
    requiredFields: ["name", "phonenumber"],
    estimatedTime: "3 min",
  },
  { 
    id: "business-details", 
    title: "Business Details", 
    description: "Company and tax information", 
    icon: IconBuilding,
    isSkippable: true,
    requiredFields: ["GSTIN", "companyname", "pan_number"],
    estimatedTime: "5 min",
  },
  { 
    id: "banking-info", 
    title: "Banking Information", 
    description: "Payment account details", 
    icon: IconCreditCard,
    isSkippable: false,
    requiredFields: ["bank_account_holder_name", "bank_account_number", "bank_account_ifsc_code"],
    estimatedTime: "4 min",
  },
  { 
    id: "creator-profile", 
    title: "Creator Profile", 
    description: "Bio and category", 
    icon: IconFileText,
    isSkippable: true,
    requiredFields: ["creator_bio", "creator_category"],
    estimatedTime: "5 min",
  },
  { 
    id: "final-review", 
    title: "Final Review", 
    description: "Review and submit", 
    icon: IconCheckbox,
    isSkippable: false,
    requiredFields: [],
    estimatedTime: "2 min",
  }
];

// Junooni brand colors (same as your original)
const BRAND = {
  primary: "#e65100", 
  secondary: "#ac1900", 
  accent: "#581845", 
  light: "#FFC300",
  background: "#FFEFD5", 
  success: "#2ECC71",
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999"
};

// Field explanations to provide context in tooltips
const FIELD_EXPLANATIONS = {
  GSTIN: "Your Goods and Services Tax Identification Number issued by the Indian government.",
  pan_number: "Permanent Account Number (PAN) is a 10-character alphanumeric identifier issued by the Income Tax Department.",
  bank_account_ifsc_code: "11-character code that uniquely identifies a bank branch participating in electronic funds transfer systems.",
  creator_category: "Select the category that best describes your creative work to help buyers find you."
};

// Creator success stories for motivation
const CREATOR_STORIES = [
  {
    name: "Priya Sharma",
    category: "Handcrafted Jewelry",
    image: "http://localhost:9000/static/creator-priya.webp",
    quote: "Completing my profile helped buyers discover my unique designs. My sales increased by 70% in just two months!",
    joined: "3 months ago"
  },
  {
    name: "Rajiv Mehta",
    category: "Digital Art",
    image: "http://localhost:9000/static/creator-rajiv.webp",
    quote: "The onboarding process was smooth and the support team was always available to help with any questions.",
    joined: "6 months ago"
  },
  {
    name: "Ananya Patel",
    category: "Sustainable Fashion",
    image: "http://localhost:9000/static/creator-ananya.webp",
    quote: "Junooni's platform helped me connect with customers who share my values. It's been incredible.",
    joined: "1 year ago"
  }
];

// Mock component for the forms - in reality these would be your actual form components
const FormComponent = ({ stepId, vendorData, updateVendorData, brandColors, toast, setVendorData, stepCompletion ,setCurrentStep, handleFileUpload, isUploading,  uploadType,  termsAgreed, setTermsAgreed  }) => {
  
  const renderFormFields = () => {
    switch (stepId) {
      case "welcome":
        return (
          <div className="py-6 space-y-6">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)` }}>
                <IconAward className="w-12 h-12 text-white" />
              </div>
              <h1 className="mb-2 text-3xl font-bold" style={{ color: brandColors.primary }}>Welcome to Junooni!</h1>
              <p className="max-w-xl mx-auto text-lg" style={{ color: brandColors.textSecondary }}>
                You're about to join a thriving community of creative entrepreneurs. Let's set up your profile together.
              </p>
            </div>
            {/* <div className="mb-8 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)` }}>
                <IconUser className="w-12 h-12 text-white" />
              </div>
              <h1 className="mb-2 text-3xl font-bold" style={{ color: brandColors.primary }}>Welcome to Junooni!</h1>
              <p className="max-w-xl mx-auto text-lg" style={{ color: brandColors.textSecondary }}>
                Let's get started by setting up your admin profile.
              </p>
            </div> */}
            
            {/* New Admin Information Form
      <div className="max-w-md p-6 mx-auto bg-white shadow-lg rounded-xl">
        <h3 className="mb-4 text-xl font-bold" style={{ color: brandColors.secondary }}>Admin Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email Address</label>
            <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
              <IconMail className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700">
                {localStorage.getItem('vendorEmail') || "vendor@example.com"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">This email will be used for account notifications</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium">First Name <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400">Required</span>
            </div>
            <input
              id="admin-first-name"
              type="text"
              value={adminFirstName}
              onChange={(e) => setAdminFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{
                borderColor: adminFirstName ? 'rgb(229, 231, 235)' : brandColors.error,
                focusRing: brandColors.primary
              }}
              placeholder="Enter your first name"
            />
            {!adminFirstName && (
              <p className="mt-1 text-sm" style={{ color: brandColors.error }}>First name is required</p>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400">Required</span>
            </div>
            <input
              id="admin-last-name"
              type="text"
              value={adminLastName}
              onChange={(e) => setAdminLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{
                borderColor: adminLastName ? 'rgb(229, 231, 235)' : brandColors.error,
                focusRing: brandColors.primary
              }}
              placeholder="Enter your last name"
            />
            {!adminLastName && (
              <p className="mt-1 text-sm" style={{ color: brandColors.error }}>Last name is required</p>
            )}
          </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              // First update the local state to vendorData
              const updatedVendorData = { ...vendorData };
              const userEmail = localStorage.getItem('vendorEmail') || 'vendor@example.com';
              
              if (!updatedVendorData.vendor.admin || !Array.isArray(updatedVendorData.vendor.admin) || updatedVendorData.vendor.admin.length === 0) {
                updatedVendorData.vendor.admin = [{
                  email: userEmail,
                  first_name: adminFirstName,
                  last_name: adminLastName
                }];
              } else {
                updatedVendorData.vendor.admin[0] = {
                  ...updatedVendorData.vendor.admin[0],
                  email: userEmail,
                  first_name: adminFirstName,
                  last_name: adminLastName
                };
              }
              
              // Update parent state
              setVendorData(updatedVendorData);
              
              // Then call the API
              saveAdminData(adminFirstName, adminLastName);
            }}
            className="px-4 py-2 text-white rounded-md"
            style={{ 
              background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
            }}
            disabled={!adminFirstName || !adminLastName}
          >
            Save Admin Information
          </button>
        </div>
      </div>
        
        <div className="p-3 mt-4 border border-blue-100 rounded-md bg-blue-50">
          <div className="flex items-start">
            <IconInfoCircle className="w-5 h-5 mt-0.5 mr-2 text-blue-500" />
            <p className="text-sm text-blue-700">
              This information will be used for all official communications and documents.
            </p>
          </div>
        </div>
      </div> */}

            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              <div className="flex flex-col items-center p-4 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: `${brandColors.primary}22` }}>
                  <IconUser className="w-6 h-6" style={{ color: brandColors.primary }} />
                </div>
                <h3 className="mb-2 font-semibold">Complete Your Profile</h3>
                <p className="text-sm" style={{ color: brandColors.textSecondary }}>Add your brand details to make your shop stand out</p>
              </div>
              
              <div className="flex flex-col items-center p-4 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: `${brandColors.primary}22` }}>
                  <IconCreditCard className="w-6 h-6" style={{ color: brandColors.primary }} />
                </div>
                <h3 className="mb-2 font-semibold">Set Up Payments</h3>
                <p className="text-sm" style={{ color: brandColors.textSecondary }}>Add your banking details to receive payments from your sales</p>
              </div>
              
              <div className="flex flex-col items-center p-4 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: `${brandColors.primary}22` }}>
                  <IconGift className="w-6 h-6" style={{ color: brandColors.primary }} />
                </div>
                <h3 className="mb-2 font-semibold">Start Selling</h3>
                <p className="text-sm" style={{ color: brandColors.textSecondary }}>List your products and reach over 200,000 potential customers</p>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 font-bold">What you'll need to prepare:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0">
                    <IconCircleCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Your business details</p>
                    <p className="text-sm" style={{ color: brandColors.textSecondary }}>Company name, address, and contact information</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0">
                    <IconCircleCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Tax information</p>
                    <p className="text-sm" style={{ color: brandColors.textSecondary }}>GSTIN, PAN number, and other tax identifiers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0">
                    <IconCircleCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Banking details</p>
                    <p className="text-sm" style={{ color: brandColors.textSecondary }}>Account number, IFSC code, and account holder name</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0">
                    <IconCircleCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Brand assets</p>
                    <p className="text-sm" style={{ color: brandColors.textSecondary }}>Logo, cover photo, and brand description</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-l-4 shadow-lg rounded-xl" style={{ borderColor: brandColors.primary }}>
              <div className="flex items-start">
                <IconAlertCircle className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0" style={{ color: brandColors.primary }} />
                <div>
                  <p className="font-medium" style={{ color: brandColors.primary }}>You can save and come back anytime</p>
                  <p className="text-sm" style={{ color: brandColors.textSecondary }}>Your progress is automatically saved, so you can continue where you left off.</p>
                </div>
              </div>
            </div>
          </div>
        );

        case "basic-info":

          return (
            <div className="py-4 space-y-6">
              <div className="flex items-center p-4 mb-6 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                  <IconHelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-blue-700">This information will be visible to customers and help them identify your brand.</p>
              </div>
              
              <div className="space-y-6">
                {/* Email Display Section - Updated for Existing Vendors */}
                {/* Email Display Section - Works without external isLoading state */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Your Email ID <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Account Email</span>
                  </div>
                  <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                    <IconMail className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">
                      {vendorData ? (
                        vendorData.vendor && 
                        vendorData.vendor.admin && 
                        Array.isArray(vendorData.vendor.admin) && 
                        vendorData.vendor.admin.length > 0 && 
                        vendorData.vendor.admin[0].email
                          ? vendorData.vendor.admin[0].email
                          : localStorage.getItem('vendorEmail') || "vendor@example.com"
                      ) : (
                        "Loading email..."
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">This email will be used for account notifications</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Your First Name <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Required</span>
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.admin && Array.isArray(vendorData.vendor.admin) && vendorData.vendor.admin.length > 0 
                      ? vendorData.vendor.admin[0].first_name || '' 
                      : ''}
                    onChange={(e) => {
                      // Create a deep copy of the current vendor data
                      const updatedVendorData = { ...vendorData };
                      
                      // Ensure admin array is properly initialized
                      if (!updatedVendorData.vendor.admin || !Array.isArray(updatedVendorData.vendor.admin) || updatedVendorData.vendor.admin.length === 0) {
                        updatedVendorData.vendor.admin = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
                      }
                      
                      // Update the first_name property
                      updatedVendorData.vendor.admin[0].first_name = e.target.value;
                      
                      // Set the updated vendor data
                      setVendorData(updatedVendorData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.admin && 
                                  Array.isArray(vendorData.vendor.admin) && 
                                  vendorData.vendor.admin.length > 0 && 
                                  vendorData.vendor.admin[0].first_name 
                        ? 'rgb(229, 231, 235)' 
                        : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your First name"
                  />
                  {(!vendorData.vendor.admin || 
                    !Array.isArray(vendorData.vendor.admin) || 
                    vendorData.vendor.admin.length === 0 ||
                    !vendorData.vendor.admin[0].first_name) && (
                    <p className="mt-1 text-sm" style={{ color: brandColors.error }}>First name is required</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Your Last Name <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Required</span>
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.admin && Array.isArray(vendorData.vendor.admin) && vendorData.vendor.admin.length > 0 
                      ? vendorData.vendor.admin[0].last_name || '' 
                      : ''}
                    onChange={(e) => {
                      // Create a deep copy of the current vendor data
                      const updatedVendorData = { ...vendorData };
                      
                      // Ensure admin array is properly initialized
                      if (!updatedVendorData.vendor.admin || !Array.isArray(updatedVendorData.vendor.admin) || updatedVendorData.vendor.admin.length === 0) {
                        updatedVendorData.vendor.admin = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
                      }
                      
                      // Update the last_name property
                      updatedVendorData.vendor.admin[0].last_name = e.target.value;
                      
                      // Set the updated vendor data
                      setVendorData(updatedVendorData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.admin && 
                                  Array.isArray(vendorData.vendor.admin) && 
                                  vendorData.vendor.admin.length > 0 && 
                                  vendorData.vendor.admin[0].last_name 
                        ? 'rgb(229, 231, 235)' 
                        : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your Last name"
                  />
                  {(!vendorData.vendor.admin || 
                    !Array.isArray(vendorData.vendor.admin) || 
                    vendorData.vendor.admin.length === 0 ||
                    !vendorData.vendor.admin[0].last_name) && (
                    <p className="mt-1 text-sm" style={{ color: brandColors.error }}>Last name is required</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Brand Name <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Required</span>
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.name || ''}
                    onChange={(e) => updateVendorData('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.name ? 'rgb(229, 231, 235)' : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your brand name"
                  />
                  {!vendorData.vendor.name && (
                    <p className="mt-1 text-sm" style={{ color: brandColors.error }}>Brand name is required</p>
                  )}
                </div>

                <VendorHandleInput 
                  vendorData={vendorData} 
                  updateVendorData={updateVendorData} 
                  brandColors={brandColors} 
                />

                {/* <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Vendor's Handle <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Required</span>
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.handle || ''}
                    onChange={(e) => updateVendorData('handle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.handle ? 'rgb(229, 231, 235)' : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your handle"
                  />
                  {!vendorData.vendor.handle && (
                    <p className="mt-1 text-sm" style={{ color: brandColors.error }}>Vendor's handle is required</p>
                  )}
                </div> */}
                
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Logo <span className="text-red-500">*</span></label>
                      <span className="text-xs text-gray-400">Recommended size: 400x400px</span>
                    </div>
                    <div 
                      className="flex items-center justify-center h-40 transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{ borderColor: vendorData.vendor.logo ? brandColors.success : 'rgb(229, 231, 235)' }}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      {vendorData.vendor.logo ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={vendorData.vendor.logo}
                            alt="Logo Preview" 
                            className="absolute inset-0 object-contain w-full h-full p-2"
                          />
                          <div 
                            className="absolute p-1 bg-white rounded-full shadow-md cursor-pointer top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's click
                              updateVendorData('logo', null);
                            }}
                          >
                            <IconX className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <button
                              className="px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-80 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent div's click
                                document.getElementById('logo-upload').click();
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                            <IconFileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium">
                            Drop your logo here or <span style={{ color: brandColors.primary, cursor: 'pointer' }}>browse</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, SVG</p>
                        </div>
                      )}
                     <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        disabled={isUploading && uploadType === 'logo'}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], 'logo');
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Cover Photo</label>
                      <span className="text-xs text-gray-400">Recommended size: 1200x400px</span>
                    </div>
                    <div 
                      className="flex items-center justify-center h-40 transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{ borderColor: vendorData.vendor.coverphoto ? brandColors.success : 'rgb(229, 231, 235)' }}
                      onClick={() => document.getElementById('cover-upload').click()}
                    >
                      {vendorData.vendor.coverphoto ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={vendorData.vendor.coverphoto}
                            alt="Cover Preview" 
                            className="absolute inset-0 object-cover w-full h-full"
                          />
                          <div 
                            className="absolute p-1 bg-white rounded-full shadow-md cursor-pointer top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's click
                              updateVendorData('coverphoto', null);
                            }}
                          >
                            <IconX className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                            <IconFileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium">
                            Add a cover photo 
                            <span style={{ color: brandColors.primary, cursor: 'pointer' }}> - browse</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">Showcases your brand</p>
                        </div>
                      )}
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        disabled={isUploading && uploadType === 'coverphoto'}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], 'coverphoto');
                          }
                          // Clear the input value so the same file can be selected again
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>
                </div>
                                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex items-center">
                      <IconHelpCircle className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-400">For verification and support</span>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={vendorData.vendor.phonenumber || ''}
                    onChange={(e) => updateVendorData('phonenumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRing: brandColors.primary }}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Social Media Links</h3>
                  <p className="text-sm text-gray-500">Add your social media accounts to help customers connect with you</p>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Instagram</label>
                      <div className="flex overflow-hidden">
                        <div className="flex items-center justify-center flex-shrink-0 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                          <span className="text-sm text-gray-500 whitespace-nowrap">instagram.com/</span>
                        </div>
                        <input
                          type="text"
                          value={vendorData.vendor.instagram || ''}
                          onChange={(e) => updateVendorData('instagram', e.target.value)}
                          className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                          style={{ focusRing: brandColors.primary }}
                          placeholder="yourbrand"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium">YouTube</label>
                      <div className="flex overflow-hidden">
                        <div className="flex items-center justify-center flex-shrink-0 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                          <span className="text-sm text-gray-500 whitespace-nowrap">youtube.com/</span>
                        </div>
                        <input
                          type="text"
                          value={vendorData.vendor.youtube || ''}
                          onChange={(e) => updateVendorData('youtube', e.target.value)}
                          className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                          style={{ focusRing: brandColors.primary }}
                          placeholder="@yourchannel"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium">Twitter</label>
                      <div className="flex overflow-hidden">
                        <div className="flex items-center justify-center flex-shrink-0 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                          <span className="text-sm text-gray-500 whitespace-nowrap">twitter.com/</span>
                        </div>
                        <input
                          type="text"
                          value={vendorData.vendor.xtwitter || ''}
                          onChange={(e) => updateVendorData('xtwitter', e.target.value)}
                          className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                          style={{ focusRing: brandColors.primary }}
                          placeholder="@yourhandle"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 mt-6 border-l-4 rounded-lg bg-green-50" style={{ borderLeftColor: brandColors.success }}>
                <div className="flex items-start">
                  <IconCircleCheck className="w-5 h-5 mt-0.5 mr-2" style={{ color: brandColors.success }} />
                  <p className="text-sm">
                    <span className="font-medium">Pro tip:</span> Brands with complete profiles get 75% more views and 50% higher engagement.
                  </p>
                </div>
              </div>
            </div>
          );

      // Other form components would go here
      case "business-details":
        return (
          <div className="py-4 space-y-6">
            <div className="p-4 mb-6 border rounded-lg bg-amber-50 border-amber-100">
              <div className="flex">
                <IconAlertCircle className="w-5 h-5 mt-0.5 mr-3 text-amber-500" />
                <div>
                <p className="text-sm font-medium text-amber-800">
                  {!vendorData.vendor.id 
                    ? "Let's add your business details for tax and verification purposes."
                    : "We use this information for tax reporting and verification purposes only."}
                </p>
                  {/* <p className="text-sm font-medium text-amber-800">We use this information for tax reporting and verification purposes only.</p> */}
                  <p className="mt-1 text-xs text-amber-700">All your business information is securely stored and protected.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <label className="block text-sm font-medium">GSTIN <span className="text-red-500">*</span></label>
                    <div className="relative ml-1 group">
                      <IconHelpCircle className="w-4 h-4 text-gray-400" />
                      <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                        {FIELD_EXPLANATIONS.GSTIN}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Required</span>
                </div>
                <input
                  type="text"
                  value={vendorData.vendor.GSTIN || ''}
                  onChange={(e) => updateVendorData('GSTIN', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ focusRing: brandColors.primary }}
                  placeholder="22AAAAA0000A1Z5"
                />
                <div className="flex items-center mt-1.5 h-4">
                  {vendorData.vendor.GSTIN && vendorData.vendor.gst_verification_status === "verified" && (
                    <div className="flex items-center">
                      <IconCircleCheck className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                  {vendorData.vendor.GSTIN && vendorData.vendor.gst_verification_status === "pending" && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
                      <span className="text-xs text-amber-600">Verification in progress</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <label className="block text-sm font-medium">PAN Number <span className="text-red-500">*</span></label>
                    <div className="relative ml-1 group">
                      <IconHelpCircle className="w-4 h-4 text-gray-400" />
                      <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                        {FIELD_EXPLANATIONS.pan_number}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Required</span>
                </div>
                <input
                  type="text"
                  value={vendorData.vendor.pan_number || ''}
                  onChange={(e) => updateVendorData('pan_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ focusRing: brandColors.primary }}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={vendorData.vendor.companyname || ''}
                onChange={(e) => updateVendorData('companyname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRing: brandColors.primary }}
                placeholder="Your registered company name"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Address Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={vendorData.vendor.address || ''}
                    onChange={(e) => updateVendorData('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    placeholder="Street address"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={vendorData.vendor.city || ''}
                    onChange={(e) => updateVendorData('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    placeholder="City"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">State</label>
                  <select
                    value={vendorData.vendor.state || ''}
                    onChange={(e) => updateVendorData('state', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none"
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    {/* Additional states would be here */}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium">PIN Code</label>
                  <input
                    type="text"
                    value={vendorData.vendor.pincode || ''}
                    onChange={(e) => updateVendorData('pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    placeholder="PIN Code"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case "banking-info":
        console.log('Rendering banking-info with vendorData:', vendorData);
  
        // True loading state - only if vendorData is completely null
        if (vendorData === null) {
          return <div>Loading...</div>;
        }
        
        // For missing vendor structure, initialize it rather than showing loading
        if (!vendorData.vendor) {
          vendorData = {
            vendor: {
              // id: "",
              handle: "",
              name: "",
              bank_account_holder_name: null,
              bank_account_number: null,
              bank_account_ifsc_code: null,
              bank_name: null,
              bank_account_type: "Saving", // Default value
              cancelled_checkque: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        }
        
        // Ensure admin property exists and is properly structured
        if (!vendorData.vendor.admin || !Array.isArray(vendorData.vendor.admin) || vendorData.vendor.admin.length === 0) {
          console.log('Admin data missing, initializing...');
          const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
          
          // Initialize admin array with empty data
          vendorData.vendor.admin = [{
            email: userEmail,
            first_name: '',
            last_name: ''
          }];
        }
        return (
          <div className="py-4 space-y-6">
            <div className="flex items-center p-4 mb-6 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                <IconCreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
              <p className="text-sm font-medium text-blue-800">
                {!vendorData.vendor.id 
                  ? "Please provide your banking details so we can send your earnings."
                  : "Your banking details are needed for payouts"}
              </p>
                {/* <p className="text-sm font-medium text-blue-800">Your banking details are needed for payouts</p> */}
                <p className="mt-1 text-xs text-blue-700">We'll transfer your earnings to this account when customers purchase your products</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Account Holder Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={vendorData.vendor.bank_account_holder_name || ''}
                  onChange={(e) => updateVendorData('bank_account_holder_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ focusRing: brandColors.primary }}
                  placeholder="Name as per bank records"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">Account Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vendorData.vendor.bank_account_number || ''}
                      onChange={(e) => updateVendorData('bank_account_number', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRing: brandColors.primary }}
                      placeholder="Your bank account number"
                    />
                    <button className="absolute transform -translate-y-1/2 right-2 top-1/2">
                      <IconEye className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium">IFSC Code <span className="text-red-500">*</span></label>
                    <div className="relative ml-1 group">
                      <IconHelpCircle className="w-4 h-4 text-gray-400" />
                      <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                        {FIELD_EXPLANATIONS.bank_account_ifsc_code}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.bank_account_ifsc_code || ''}
                    onChange={(e) => updateVendorData('bank_account_ifsc_code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRing: brandColors.primary }}
                    placeholder="e.g. SBIN0001234"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">Bank Name</label>
                  <input
                    type="text"
                    value={vendorData.vendor.bank_name || ''}
                    onChange={(e) => updateVendorData('bank_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRing: brandColors.primary }}
                    placeholder="e.g. State Bank of India"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium">Account Type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={vendorData.vendor.bank_account_type === "Saving"}
                        onChange={() => updateVendorData('bank_account_type', "Saving")}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: brandColors.primary }}
                      />
                      <span>Savings</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={vendorData.vendor.bank_account_type === "Current"}
                        onChange={() => updateVendorData('bank_account_type', "Current")}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: brandColors.primary }}
                      />
                      <span>Current</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium">Upload Cancelled Cheque</label>
                  <span className="text-xs text-gray-400">For verification purposes</span>
                </div>
                <div 
                  className="flex items-center justify-center h-32 transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: vendorData.vendor.cancelled_checkque ? brandColors.success : 'rgb(229, 231, 235)' }}
                  onClick={() => document.getElementById('cheque-upload').click()}
                >
                  {vendorData.vendor.cancelled_checkque ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-md">
                          <IconFileText className="w-5 h-5 mr-2 text-green-500" />
                          <span className="text-sm font-medium">cheque_scan.jpg</span>
                        </div>
                      </div>
                      <div 
                        className="absolute p-1 bg-white rounded-full shadow-md cursor-pointer top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent div's click
                          updateVendorData('cancelled_checkque', null);
                        }}
                      >
                        <IconX className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                        <IconFileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">
                        Drop your file here or <span style={{ color: brandColors.primary }}>browse</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, PDF (Max: 5MB)</p>
                    </div>
                  )}
                  {/* Hidden file input for cheque upload */}
                  <input
                    id="cheque-upload"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    disabled={isUploading && uploadType === 'cancelled_checkque'}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'cancelled_checkque');
                      }
                      // Clear the input value so the same file can be selected again
                      e.target.value = '';
                    }}
                  />
                </div>
                </div>
            </div>
            
            <div className="p-4 bg-white border-l-4 border-blue-400 rounded-lg shadow-sm">
              <div className="flex">
                <div className="mr-3 mt-0.5">
                  <IconAlertCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure Banking</p>
                  <p className="mt-1 text-xs text-gray-600">Your banking information is encrypted and securely stored. We only use it for processing your payments.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "creator-profile":
        console.log('Rendering creator-profile with vendorData:', vendorData);
  
        // True loading state - only if vendorData is completely null
        if (vendorData === null) {
          return <div>Loading...</div>;
        }
        
        // For missing vendor structure, initialize it rather than showing loading
        if (!vendorData.vendor) {
          vendorData = {
            vendor: {
              // id: "new",
              handle: "",
              name: "",
              logo: null,
              coverphoto: null,
              creator_bio: null,
              creator_title: null,
              //creator_category: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        }
        
        // Ensure admin property exists and is properly structured
        if (!vendorData.vendor.admin || !Array.isArray(vendorData.vendor.admin) || vendorData.vendor.admin.length === 0) {
          console.log('Admin data missing, initializing...');
          const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
          
          // Initialize admin array with empty data
          vendorData.vendor.admin = [{
            email: userEmail,
            first_name: '',
            last_name: ''
          }];
        }
        return (
          <div className="py-4 space-y-6">
            <div className="p-4 mb-6 bg-white border-l-4 rounded-lg shadow-sm" style={{ borderLeftColor: brandColors.primary }}>
              {/* <p className="text-sm">
                <span className="font-semibold">Make your profile stand out!</span> This information will be visible to customers browsing the marketplace.
              </p> */}
              <p className="text-sm">
                {!vendorData.vendor.id 
                  ? "Let's create your creator profile! This is how customers will discover your unique brand story."
                  : "Make your profile stand out! This information will be visible to customers browsing the marketplace."}
              </p>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Creator Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={vendorData.vendor.creator_title || ''}
                onChange={(e) => updateVendorData('creator_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ focusRing: brandColors.primary }}
                placeholder="e.g. Hand-crafted jewelry artisan"
              />
              <p className="mt-1 text-xs text-gray-500">A short phrase describing what you create (50 chars max)</p>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium">Creator Category <span className="text-red-500">*</span></label>
                <div className="relative ml-1 group">
                  <IconHelpCircle className="w-4 h-4 text-gray-400" />
                  <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-72 group-hover:opacity-100">
                    {FIELD_EXPLANATIONS.creator_category}
                  </div>
                </div>
              </div>
              <select
                value={vendorData.vendor.creator_category || ''}
                onChange={(e) => updateVendorData('creator_category', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none"
              >
                 <option value="">Select Category</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                  <option value="Cinema">Cinema</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sports">Sports</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Influencer">Influencer</option>
                  <option value="other">Other</option>
                {/* More categories would be here */}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Creator Bio <span className="text-red-500">*</span></label>
              <textarea
                value={vendorData.vendor.creator_bio || ''}
                onChange={(e) => updateVendorData('creator_bio', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2"
                style={{ focusRing: brandColors.primary }}
                placeholder="Tell customers about yourself, your creative journey, and what makes your products special..."
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Minimum 100 characters recommended</p>
                <p className="text-xs text-gray-500">
                  {vendorData.vendor.creator_bio ? vendorData.vendor.creator_bio.length : 0}/500
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="mb-3 font-medium">Creator Profile Preview</h3>
              <div className="overflow-hidden border rounded-lg shadow-sm">
                <div className="relative h-32 bg-gray-200">
                  {vendorData.vendor.coverphoto ? (
                    <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-gray-400">Add a cover photo</p>
                    </div>
                  )}
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
                      {vendorData.vendor.logo ? (
                        <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-100">
                          <IconUser className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6 pt-14">
                  <h2 className="text-xl font-bold">{vendorData.vendor.name || 'Your Brand Name'}</h2>
                  <p className="mt-1 text-sm text-gray-600">{vendorData.vendor.creator_title || 'Your creator title will appear here'}</p>
                  
                  <div className="mt-4 text-sm text-gray-700">
                    {vendorData.vendor.creator_bio || 'Your bio will appear here. A good bio helps customers connect with your brand and understand your creative vision.'}
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <IconBookmark className="w-4 h-4 mr-1" />
                      <span>{vendorData.vendor.creator_category || 'Category'}</span>
                    </div>
                    <div className="flex items-center">
                      <IconCalendar className="w-4 h-4 mr-1" />
                      <span>Joined {new Date(vendorData.vendor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "final-review":
        console.log('Rendering final-review with vendorData:', vendorData);
  
        // True loading state - only if vendorData is completely null
        if (vendorData === null) {
          return <div>Loading...</div>;
        }
        
        // For missing vendor structure, initialize it rather than showing loading
        if (!vendorData.vendor) {
          vendorData = {
            vendor: {
              // id: "new",
              handle: "",
              name: "",
              logo: null,
              coverphoto: null,
              phonenumber: null,
              GSTIN: null,
              gst_verification_status: "pending",
              companyname: null,
              pan_number: null,
              city: null,
              pincode: null,
              state: null,
              address: null,
              bank_account_holder_name: null,
              bank_account_number: null,
              bank_account_ifsc_code: null,
              bank_name: null,
              bank_account_type: "Saving",
              cancelled_checkque: null,
              creator_bio: null,
              creator_title: null,
              creator_category: "other",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        }
        
        // Ensure admin property exists and is properly structured
        if (!vendorData.vendor.admin || !Array.isArray(vendorData.vendor.admin) || vendorData.vendor.admin.length === 0) {
          console.log('Admin data missing, initializing...');
          const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
          
          // Initialize admin array with empty data
          vendorData.vendor.admin = [{
            email: userEmail,
            first_name: '',
            last_name: ''
          }];
        }
        return (
          <div className="py-4 space-y-6">
            <div className="p-4 mb-6 border border-green-100 rounded-lg bg-green-50">
              <div className="flex">
                <IconCircleCheck className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {!vendorData.vendor.id 
                      ? "Let's review your information before submitting"
                      : "You're almost there!"}
                  </p>
                  <p className="mt-1 text-xs text-green-700">Review your information before submitting your profile.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {STEPS.filter(step => step.id !== "welcome" && step.id !== "final-review").map((step) => {
                const isCompleted = stepCompletion[step.id];
                const StepIcon = step.icon;
                
                // For new vendors with no data yet, we show sections as incomplete
                // but still enable them to proceed if they've filled in required fields
                const isNewVendor = !vendorData.vendor.id;
          
                return (
                  <div key={step.id} className="overflow-hidden border rounded-lg">
                    <div 
                      className="flex items-center justify-between px-4 py-3"
                      style={{ 
                        backgroundColor: isCompleted ? `${brandColors.success}11` : `${brandColors.error}11`,
                        borderBottom: `1px solid ${isCompleted ? `${brandColors.success}22` : `${brandColors.error}22`}`
                      }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="flex items-center justify-center w-8 h-8 mr-3 rounded-full"
                          style={{ 
                            backgroundColor: isCompleted ? `${brandColors.success}22` : `${brandColors.error}22`,
                            color: isCompleted ? brandColors.success : brandColors.error
                          }}
                        >
                          {isCompleted ? (
                            <IconCircleCheck className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="h-8 px-3 text-sm"
                        style={{ color: brandColors.primary }}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        {isCompleted ? 'Edit' : 'Complete'}
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      {step.id === "basic-info" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-sm font-medium">Brand Name</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Phone Number</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.phonenumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Logo</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.logo ? 'Uploaded' : 'Not uploaded'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Social Media</p>
                            <p className="text-sm text-gray-700">
                              {vendorData.vendor.instagram || vendorData.vendor.youtube ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {step.id === "business-details" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-sm font-medium">Company Name</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.companyname || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">GSTIN</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.GSTIN || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">PAN Number</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.pan_number || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Address</p>
                            <p className="text-sm text-gray-700">
                              {vendorData.vendor.address && vendorData.vendor.city ? 
                                `${vendorData.vendor.address}, ${vendorData.vendor.city}, ${vendorData.vendor.state || ''} ${vendorData.vendor.pincode || ''}` : 
                                'Not provided'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {step.id === "banking-info" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-sm font-medium">Account Holder</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.bank_account_holder_name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Account Number</p>
                            <p className="text-sm text-gray-700">
                              {vendorData.vendor.bank_account_number ? 
                                `XXXX${vendorData.vendor.bank_account_number.slice(-4)}` : 
                                'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Bank Name</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.bank_name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">IFSC Code</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.bank_account_ifsc_code || 'Not provided'}</p>
                          </div>
                        </div>
                      )}
                      
                      {step.id === "creator-profile" && (
                        <div className="space-y-3">
                          <div>
                            <p className="mb-1 text-sm font-medium">Creator Title</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.creator_title || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Category</p>
                            <p className="text-sm text-gray-700">{vendorData.vendor.creator_category || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-medium">Bio</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{vendorData.vendor.creator_bio || 'Not provided'}</p>
                          </div>
                        </div>
                      )}
                      
                      {!isCompleted && (
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          <p className="flex items-center text-xs text-red-500">
                            <IconAlertCircle className="w-3.5 h-3.5 mr-1" />
                            Required information missing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
             {/* Updated checkbox with state */}
             <div className="p-4 mt-8 bg-white border border-gray-200 rounded-lg">
              <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                id="terms-checkbox"
                className="w-5 h-5 mt-1 mr-3" // Made slightly larger
                style={{ accentColor: brandColors.primary, cursor: 'pointer' }}
                checked={termsAgreed}
                onChange={() => {
                  console.log("Checkbox clicked - current value:", !termsAgreed);
                  // Use direct toggle approach
                  setTermsAgreed(!termsAgreed);
                }}
              />
                <div>
                  <p className="text-sm">I confirm that all the information provided is accurate and complete.</p>
                  <p className="mt-1 text-xs text-gray-500">By submitting, you agree to Junooni's <a href="#" style={{ color: brandColors.primary }}>Terms of Service</a> and <a href="#" style={{ color: brandColors.primary }}>Seller Policy</a>.</p>
                </div>
              </label>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return renderFormFields();
};

// Show creator stories for motivation
const CreatorStoryCard = ({ story, brandColors }) => {
  return (
    <div className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 mr-3 overflow-hidden rounded-full">
            <img src={story.image || "http://localhost:9000/static/creator-placeholder.webp"} alt={story.name} className="object-cover w-full h-full" />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: brandColors.primary }}>{story.name}</h3>
            <p className="text-xs" style={{ color: brandColors.textSecondary }}>{story.category}</p>
          </div>
        </div>
        <p className="mb-3 text-sm italic">"{story.quote}"</p>
        <p className="text-xs text-right" style={{ color: brandColors.textLight }}>Joined {story.joined}</p>
      </div>
    </div>
  );
};

export default function ImprovedCreatorOnboarding() {
  const [currentStep, setCurrentStep] = useState("welcome");
  const [progress, setProgress] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  // Add these with your other state variables in ImprovedCreatorOnboarding function
const [isUploading, setIsUploading] = useState(false);
const [uploadType, setUploadType] = useState<string | null>(null);
  // const [logoFile, setLogoFile] = useState<File | null>(null);
  // const [coverFile, setCoverFile] = useState<File | null>(null);
  const [vendorData, setVendorData] = useState<ApiVendorResponse | null>(null);
  const [stepCompletion, setStepCompletion] = useState({
    "welcome": true,
    "basic-info": false,
    "business-details": false,
    "banking-info": false,
    "creator-profile": false,
    "final-review": false
  });
  const [autoSaveIndicator, setAutoSaveIndicator] = useState("");
  const [navExpanded, setNavExpanded] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add this to your ImprovedCreatorOnboarding component before any function references it
  // const saveAdminData = async (firstName, lastName) => {
  //   try {
  //     // Use the parameters instead of trying to get values from DOM
  //     const email = localStorage.getItem('vendorEmail') || 'vendor@example.com';
      
  //     console.log('Admin data to save:', { firstName, lastName, email });
      
  //     // Validate data
  //     if (!firstName || !lastName) {
  //       throw new Error('First name and last name are required');
  //     }
      
  //     // Get token and prepare API request
  //     const token = localStorage.getItem('vendorToken');
  //     if (!token) {
  //       throw new Error('Authentication token not found. Please log in again.');
  //     }
      
  //      // Get vendor name from current state if available
  //   const vendorName = vendorData?.vendor?.name || "New Vendor11"; // Provide a default name

  //   const vendorHandle = vendorData?.vendor?.handle || "New Vendor handle11"; // Provide a default name

  //     // Prepare API payload - simplified to just include admin data
  //     const payload = {
  //       name: vendorName, // Add the required name field
  //       handle: vendorHandle, // Add the required name field
  //       admin: {
  //         email: email,
  //         first_name: firstName,
  //         last_name: lastName
  //       }
  //     };
      
  //     console.log('Sending admin data:', payload);
      
  //     // Determine if this is a new vendor
  //     const isNewVendor = vendorData?.vendor?.id === "new";
      
  //     // Choose the endpoint based on whether it's a new vendor
  //     const endpoint = 'http://localhost:9000/vendors';
      
  //     console.log('Using endpoint:', endpoint);
      
  //     const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify(payload)
  //     });
      
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('API error response:', errorText);
  //       throw new Error(`API error: ${response.status} - ${errorText}`);
  //     }
      
  //     const responseData = await response.json();
  //     console.log('Admin created successfully:', responseData);
      
  //     // If we created a new vendor, update the ID in vendorData
  //     if (responseData.vendor && responseData.vendor.id) {
  //       setVendorData(prevData => ({
  //         ...prevData,
  //         vendor: {
  //           ...prevData.vendor,
  //           id: responseData.vendor.id
  //         }
  //       }));
  //     }
      
  //     toast({
  //       title: "Success",
  //       description: "Admin information saved successfully",
  //     });
      
  //     return responseData;
  //   } catch (error) {
  //     console.error('Error saving admin data:', error);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to save admin information",
  //       variant: "destructive",
  //     });
  //     return null;
  //   }
  // };

  // Add this useEffect to check for step parameter in URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get('step');
  
  // If a valid step parameter is found, set it as the current step
  if (stepParam && STEPS.some(step => step.id === stepParam)) {
    setCurrentStep(stepParam);
  }
}, []);

 // Add this useEffect at the top of your component to check authentication
 useEffect(() => {
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('vendorToken');
  
  // If no token is found, redirect to sign-up page
  if (!token) {
    // You can also show a toast notification
    toast({
      title: "Authentication Required",
      description: "Please sign up or log in to access the onboarding process.",
      variant: "destructive",
    });
    
    // Redirect to sign-up page
    navigate({ to: '/sign-up' });
  }
}, [navigate]); // Only run this effect when navigate changes

  // Fetch vendor data when component mounts
  const [isLoading, setIsLoading] = useState(true);
   // Fetch vendor data when component mounts
// Modified version with proper loading state management
useEffect(() => {
  let isActive = true;

  // Helper function to set up a new vendor profile
const setupNewVendorProfile = () => {
  // Try to get email from an API endpoint if possible
  // This could be a separate endpoint that returns user details after auth
  const fetchUserEmail = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) return null;
      
      // You might have an endpoint like /user/me that returns basic user info
      const response = await fetch('http://localhost:9000/vendors/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const userData = await response.json();
      return userData.email || null;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return null;
    }
  };
  
  // Execute this immediately and use it to set up the vendor profile
  (async () => {
    // Try to get email from API first, fall back to localStorage
    const apiEmail = await fetchUserEmail();
    const userEmail = apiEmail || localStorage.getItem('vendorEmail') || "vendor@example.com";
    
    // Store email for future reference if we got it from API
    if (apiEmail) {
      localStorage.setItem('vendorEmail', apiEmail);
    }
    
    const defaultData = {
      vendor: {
        // id: "new",
        handle: "",
        name: "",
        logo: null,
        coverphoto: null,
        youtube: null,
        instagram: null,
        xtwitter: null,
        othersocial: null,
        phonenumber: null,
        GSTIN: null,
        gst_verification_status: "pending",
        companyname: null,
        pan_number: null,
        city: null,
        pincode: null,
        state: null,
        address: null,
        tan_number: null,
        bank_account_holder_name: null,
        bank_account_number: null,
        bank_account_ifsc_code: null,
        bank_name: null,
        bank_account_type: "Saving",
        cancelled_checkque: null,
        creator_bio: null,
        creator_title: null,
        creator_category: "other",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        admin: [{
          email: userEmail,
          first_name: '',
          last_name: ''
        }]
      }
    };
    
    // Show a welcome toast
    toast({
      title: "Welcome to Junooni!",
      description: "Complete your profile to start selling.",
    });
    
    if (isActive) {
      setVendorData(defaultData);
      
      // Set initial step completion for new vendor
      const initialStepCompletion = {
        "welcome": true,
        "basic-info": false,
        "business-details": false,
        "banking-info": false,
        "creator-profile": false,
        "final-review": false
      };
      
      setStepCompletion(initialStepCompletion);
      
      // Calculate progress
      calculateProgress(initialStepCompletion);
      
      // IMPORTANT: Set loading to false
      setIsLoading(false);
    }
  })();
};
  // Helper function to normalize vendor data
  const normalizeVendorData = (data) => {
    if (data && data.vendor) {
      const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
      
      // If admins array exists, use it as the source of truth
      if (data.vendor.admins && Array.isArray(data.vendor.admins) && data.vendor.admins.length > 0) {
        // Copy data from admins to admin for component compatibility
        data.vendor.admin = data.vendor.admins;
      } 
      // If neither admin nor admins have data, initialize with user's email
      else if (!data.vendor.admin || !Array.isArray(data.vendor.admin) || data.vendor.admin.length === 0) {
        data.vendor.admin = [{
          email: userEmail,
          first_name: '',
          last_name: ''
        }];
      }
    }
    return data; // Return the normalized data
  };
  
  // Helper function to update step completion
  const updateStepCompletion = (data) => {
    if (!isActive) return; // Skip if component unmounted
    
    // Create a new object without referencing the existing one
    const newStepCompletion = {
      "welcome": true,
      "basic-info": Boolean(data.vendor.name && data.vendor.phonenumber), // Removed logo requirement
      "business-details": Boolean(data.vendor.GSTIN && data.vendor.companyname && data.vendor.pan_number),
      "banking-info": Boolean(data.vendor.bank_account_holder_name && data.vendor.bank_account_number),
      "creator-profile": Boolean(data.vendor.creator_bio && data.vendor.creator_category),
      "final-review": false
    };
    
    setStepCompletion(newStepCompletion);
    
    // Calculate progress
    calculateProgress(newStepCompletion);
  };
  
  // Mark component as loading
  setIsLoading(true);
  
  // Use an immediately invoked async function (IIFE)
  (async () => {
    try {
      // Get authentication token from localStorage
      let token = localStorage.getItem('vendorToken');
      
      // Skip API call completely if no token exists
      if (!token) {
        console.log('No token found in localStorage, immediately creating new vendor profile');
        setupNewVendorProfile();
        return; // Exit the function early
      }
      
      console.log('Attempting to fetch vendor data with token');
      let response = await fetch('http://localhost:9000/vendors/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle 401 errors as new vendor cases
      if (response.status === 401) {
        console.log('Got 401 Unauthorized response, handling as new vendor');
        setupNewVendorProfile();
        return;
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Got 404 response, handling as new vendor');
          setupNewVendorProfile();
          return;
        }
        
        // For other non-200 responses, throw a general error
        console.log('API returned non-200 status:', response.status);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Success path - parse the response data
      console.log('Successfully fetched vendor data');
      const data = await response.json();
      
      // Normalize admin data for consistent access
      const normalizedData = normalizeVendorData(data);
      
      console.log('Normalized vendor data:', normalizedData);
      
      if (isActive) {
        setVendorData(normalizedData);
        
        // Calculate initial step completion based on data
        updateStepCompletion(normalizedData);
        
        // IMPORTANT: Set loading to false after successful fetch
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      
      if (isActive) {
        // For other errors, show general error message
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again.",
          variant: "destructive",
        });
        
        // Still set up as new vendor for fallback
        setupNewVendorProfile();
      }
    }
  })();
  
  // Cleanup function
  return () => {
    isActive = false;
  };
}, [navigate, toast]); // Only depend on navigate and toast

// IMPORTANT: Remove any other useEffect hooks that try to fetch vendor data!  
  // Add this useEffect after your fetchVendorData useEffect
useEffect(() => {
  if (vendorData && vendorData.vendor && (!vendorData.vendor.admin || !Array.isArray(vendorData.vendor.admin))) {
    console.log('Normalizing admin data structure...');
    const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
    
    setVendorData(prevData => ({
      ...prevData,
      vendor: {
        ...prevData.vendor,
        admin: [{
          email: userEmail,
          first_name: '',
          last_name: ''
        }]
      }
    }));
  }
}, [vendorData]);

  // Calculate progress
  const calculateProgress = (completion: {[key: string]: boolean}) => {
    const completedSteps = Object.values(completion).filter(value => value).length;
    const totalSteps = Object.keys(completion).length - 1; // Exclude final review from calculation
    const newProgress = Math.round((completedSteps / totalSteps) * 100);
    setProgress(newProgress);
  };

  // Auto-save functionality simulation
  const [shouldAutoSave, setShouldAutoSave] = useState(false);

// Watch for vendorData changes to trigger auto-save flag
useEffect(() => {
  if (vendorData && 
    currentStep !== "welcome" && 
    currentStep !== "final-review" &&
    // Skip auto-save on basic-info if essential fields are missing
    !(currentStep === "basic-info" && (!vendorData.vendor.name))
) {
    // Don't auto-save immediately when mounting or changing steps
    const timer = setTimeout(() => {
      setShouldAutoSave(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }
}, [currentStep]); // Only depend on step changes, not vendorData

// Handle the actual auto-save process
useEffect(() => {
  if (shouldAutoSave) {
    setAutoSaveIndicator("Saving...");
    
    // Execute auto-save
    saveCurrentStepData();
    
    // Reset the flag
    setShouldAutoSave(false);
    
    // Update indicator
    setTimeout(() => {
      setAutoSaveIndicator("All changes saved");
      setTimeout(() => {
        setAutoSaveIndicator("");
      }, 2000);
    }, 1000);
  }
}, [shouldAutoSave]);



// For form field changes, use this debounced approach
const handleFormChange = () => {
  // Clear any pending auto-save
  setShouldAutoSave(false);
  
  // Schedule a new auto-save
  const timer = setTimeout(() => {
    setShouldAutoSave(true);
  }, 3000);
  
  return () => clearTimeout(timer);
};

// Add this new function in your ImprovedCreatorOnboarding component
// 1. First, create a utility function to sanitize vendor data
const sanitizeVendorData = (vendorData) => {
  // Make a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(vendorData));
  
  // Define ALL fields that must be strings
  const stringFields = [
    'logo', 'coverphoto', 'name', 'handle', 'phonenumber',
    'youtube', 'instagram', 'xtwitter', 'othersocial',
    'GSTIN', 'companyname', 'pan_number', 'city', 'pincode', 'state', 'address', 'tan_number',
    'bank_account_holder_name', 'bank_account_number', 'bank_account_ifsc_code', 'bank_name', 
    'cancelled_checkque', 'creator_bio', 'creator_title', 'creator_category'
  ];
  
  // Convert null to empty string for all string fields
  stringFields.forEach(field => {
    if (sanitized.vendor[field] === null || sanitized.vendor[field] === undefined) {
      sanitized.vendor[field] = '';
    }
  });
  
  return sanitized;
};
 // Now update your saveCurrentStepData function to handle admin data separately
 const saveCurrentStepData = async () => {
  try {
    const token = localStorage.getItem('vendorToken');
    setAutoSaveIndicator("Saving...");
    
    if (!vendorData || !vendorData.vendor) {
      console.error('No vendor data available');
      return null;
    }
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your data.",
        variant: "destructive",
      });
      return null;
    }
    
    // Create a completely new object to send to the API
    const updateData = {};
    
    // Copy specific fields from vendorData.vendor to updateData
    const fieldsToInclude = [
      'name', 'handle', 'logo', 'coverphoto', 'phonenumber',
      'youtube', 'instagram', 'xtwitter', 'othersocial',
      'GSTIN', 'companyname', 'pan_number', 'city', 'pincode', 'state', 'address', 'tan_number',
      'bank_account_holder_name', 'bank_account_number', 'bank_account_ifsc_code', 'bank_name', 
      'bank_account_type', 'cancelled_checkque', 'creator_bio', 'creator_title', 'creator_category'
    ];
    
    // Copy each field and ensure it's a string if needed
    fieldsToInclude.forEach(field => {
      // Use empty string for null/undefined values
      updateData[field] = vendorData.vendor[field] === null || 
                          vendorData.vendor[field] === undefined ? 
                          '' : vendorData.vendor[field];
    });
    
    // Determine if this is a new vendor (no ID means it hasn't been created yet)
    // const isNewVendor = !vendorData.vendor.id;
    const isNewVendor = !vendorData.vendor.id || vendorData.vendor.id === null;
    console.log(`Vendor status: ${isNewVendor ? 'NEW' : 'EXISTING'}, ID: ${vendorData.vendor.id || 'none'}`);
    
    let method, url;
    
    // CREATION LOGIC: New vendor on basic-info page
    if (isNewVendor && currentStep === "basic-info") {
      console.log('🔵 CREATING NEW VENDOR - using POST to /vendors');
      method = 'POST';
      url = 'http://localhost:9000/vendors';
      
      // CRITICAL: For vendor creation, ALWAYS include admin data
      if (vendorData.vendor.admin && 
          Array.isArray(vendorData.vendor.admin) && 
          vendorData.vendor.admin.length > 0) {
        
        updateData.admin = {
          email: vendorData.vendor.admin[0].email || '',
          first_name: vendorData.vendor.admin[0].first_name || '',
          last_name: vendorData.vendor.admin[0].last_name || ''
        };
      }
      
      // Make sure required fields for vendor creation are included
      if (!updateData.name || !updateData.handle) {
        console.error('Missing required fields for vendor creation');
        toast({
          title: "Missing Information",
          description: "Brand name and handle are required to create your vendor profile.",
          variant: "destructive",
        });
        setAutoSaveIndicator("");
        return null;
      }
    } else {
      // UPDATE LOGIC: Either existing vendor OR new vendor on non-basic pages
      console.log('🟢 UPDATING VENDOR - using PUT to /vendors/me');
      method = 'PUT';
      url = 'http://localhost:9000/vendors/me';
      
      // Include vendor_id if it exists
      if (vendorData.vendor.id) {
        updateData.vendor_id = vendorData.vendor.id;
      }
    }
    
    console.log(`Using ${method} for step ${currentStep} to URL: ${url}`);
    console.log('Final payload to be sent:', JSON.stringify(updateData));
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      console.error('Current step:', currentStep);
      console.error('Is new vendor:', isNewVendor);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('API response data:', responseData);
    
    // CRITICAL: Update local state with server data, especially the ID for new vendors
    if (responseData.vendor) {
      console.log('Updating local state with server response:', responseData.vendor);
      
      setVendorData(prevData => ({
        ...prevData,
        vendor: {
          ...prevData.vendor,
          ...responseData.vendor, // Merge all fields from server response
          // Ensure we have the ID (critical for new vendors)
          id: responseData.vendor.id || prevData.vendor.id
        }
      }));
      
      if (isNewVendor && responseData.vendor.id) {
        console.log('✅ SUCCESS: New vendor created with ID:', responseData.vendor.id);
        
        // Show success message for vendor creation
        toast({
          title: "Vendor Created",
          description: "Your vendor profile has been successfully created!",
        });
      }
    }
    
    setAutoSaveIndicator("All changes saved");
    setTimeout(() => {
      setAutoSaveIndicator("");
    }, 2000);
    
    return responseData;
  } catch (error) {
    console.error('Error saving vendor data:', error);
    toast({
      title: "Error Saving Data",
      description: error.message || String(error),
      variant: "destructive",
    });
    setAutoSaveIndicator("");
    return null;
  }
};
  // Handle final submission - reusing your original function
  const handleFinalSubmission = async () => {
    try {
      // Validate token first
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Null check for vendorData
      if (!vendorData || !vendorData.vendor) {
        console.error('No vendor data available for submission');
        toast({
          title: "Error",
          description: "Vendor data is missing. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Change how we determine if a vendor is new - check if ID exists instead of "new"
      const isNewVendor = !vendorData.vendor.id;
      
      // Create a complete payload with ALL fields from vendorData.vendor
      const finalPayload = {
        // Include ALL vendor data fields
        name: vendorData.vendor.name,
        handle: vendorData.vendor.handle,
        logo: vendorData.vendor.logo || '',
        coverphoto: vendorData.vendor.coverphoto || '',
        youtube: vendorData.vendor.youtube || '',
        instagram: vendorData.vendor.instagram || '',
        xtwitter: vendorData.vendor.xtwitter || '',
        othersocial: vendorData.vendor.othersocial || '',
        phonenumber: vendorData.vendor.phonenumber || '',
        
        // Business details
        GSTIN: vendorData.vendor.GSTIN || '',
        companyname: vendorData.vendor.companyname || '',
        pan_number: vendorData.vendor.pan_number || '',
        city: vendorData.vendor.city || '',
        pincode: vendorData.vendor.pincode || '',
        state: vendorData.vendor.state || '',
        address: vendorData.vendor.address || '',
        tan_number: vendorData.vendor.tan_number || '',
        
        // Banking information
        bank_account_holder_name: vendorData.vendor.bank_account_holder_name || '',
        bank_account_number: vendorData.vendor.bank_account_number || '',
        bank_account_ifsc_code: vendorData.vendor.bank_account_ifsc_code || '',
        bank_name: vendorData.vendor.bank_name || '',
        bank_account_type: vendorData.vendor.bank_account_type || 'Saving',
        cancelled_checkque: vendorData.vendor.cancelled_checkque || '',
        
        // Creator profile
        creator_bio: vendorData.vendor.creator_bio || '',
        creator_title: vendorData.vendor.creator_title || '',
        creator_category: vendorData.vendor.creator_category || 'other',
        
        // Admin information 
        admin: {
          email: vendorData.vendor.admin && vendorData.vendor.admin[0] ? 
            vendorData.vendor.admin[0].email || '' : '',
          first_name: vendorData.vendor.admin && vendorData.vendor.admin[0] ? 
            vendorData.vendor.admin[0].first_name || '' : '',
          last_name: vendorData.vendor.admin && vendorData.vendor.admin[0] ? 
            vendorData.vendor.admin[0].last_name || '' : ''
        }
      };
      
      console.log('Sending final submission with payload:', JSON.stringify(finalPayload));
      
      // For final submission, use PUT for existing vendors
      const method = isNewVendor ? 'POST' : 'PUT';
      const url = isNewVendor 
        ? 'http://localhost:9000/vendors' 
        : 'http://localhost:9000/vendors/me';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Final submission error:', errorText);
        throw new Error(`Failed to complete onboarding: ${response.status}`);
      }
      
      // Capture the response data so we can log it for debugging
      const responseData = await response.json();
      console.log('Final submission response:', responseData);
      
      toast({
        title: "Onboarding Complete",
        description: "Welcome to Junooni Creator Dashboard! You can now manage your products and orders.",
      });
      
      // Redirect to dashboard
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding.",
        variant: "destructive",
      });
    }
  };
  
  // Add this after handleFinalSubmission and before handleSaveAndContinue
  // Modify the handleFileUpload function to auto-save basic info first for new vendors
  const handleFileUpload = async (file: File, fileType: 'logo' | 'coverphoto' | 'cancelled_checkque') => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadType(fileType);
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Show loading state
      toast({
        title: "Uploading...",
        description: `Uploading your ${fileType === 'cancelled_checkque' ? 'cheque' : fileType}, please wait.`,
      });
      
      // For new vendors, we need a different approach - bypass creation and go straight to file upload
      // Upload the file and get the URL first
      const formData = new FormData();
      formData.append('files', file);
      //formData.append('vendor_id', 'temp'); // Add this in case your API needs it
      
      // Try direct upload without vendor creation
      console.log('Attempting direct file upload...');
      const response = await fetch('http://localhost:9000/vendors/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        // If direct upload fails with 401, check if we're on the correct step
        if (response.status === 401 && currentStep === "basic-info") {
          // Give helpful message about continuing to next step first
          throw new Error(`Please complete required fields and click 'Continue' to proceed to the next step, then try uploading files again.`);
        } else {
          throw new Error(`Upload failed: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Server response structure:', data);
      
      // Extract URL (same logic as before)
      let fileUrl = null;
      
      // Extract URL from various possible response formats
      if (data.url) fileUrl = data.url;
      else if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        const file = data.files[0];
        if (file.url) fileUrl = file.url;
        else if (file.file_url) fileUrl = file.file_url;
        else if (file.path) fileUrl = file.path;
      } else if (data.file) {
        if (data.file.url) fileUrl = data.file.url;
        else if (data.file.path) fileUrl = data.file.path;
      } else if (typeof data === 'string' && data.startsWith('http')) {
        fileUrl = data;
      } else if (data.data) {
        if (data.data.url) fileUrl = data.data.url;
        else if (typeof data.data === 'string' && data.data.startsWith('http')) {
          fileUrl = data.data;
        }
      }
      
      // Store the URL locally but don't try to update the backend yet
      if (fileUrl) {
        console.log(`Extracted ${fileType} URL:`, fileUrl);
        
        // Update local state
        updateVendorData(fileType, fileUrl);
        
        // Save reference in localStorage for restoration if needed
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '{}');
        uploadedFiles[fileType] = fileUrl;
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        toast({
          title: "Upload Complete",
          description: `Your ${fileType === 'cancelled_checkque' ? 'cheque' : fileType} has been uploaded successfully.`,
        });
      } else {
        throw new Error('Could not extract file URL from server response');
      }
      
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      
      toast({
        title: "Upload Failed",
        description: `${error.message || `Failed to upload your ${fileType}. Please try again.`}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };
// Handle save and continue functionality
const handleSaveAndContinue = async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    // No special case for welcome step anymore - all data is saved together
    // Validate admin data if on welcome step
    if (currentStep === "welcome") {
      // Check if admin data is complete
      const adminFirst = vendorData?.vendor?.admin?.[0]?.first_name;
      const adminLast = vendorData?.vendor?.admin?.[0]?.last_name;
      
      if (!adminFirst || !adminLast) {
        toast({
          title: "Admin Information Required",
          description: "Please provide both first name and last name to continue.",
          variant: "destructive",
        });
        return; // Stop if admin data incomplete
      }
    }

    // Save all data in one call
    await saveCurrentStepData();
    
    // Update step completion status
    const newStepCompletion = { ...stepCompletion };
    
    // Add null check before accessing vendorData properties
    if (vendorData && vendorData.vendor) {
      if (currentStep === "basic-info") {
        newStepCompletion["basic-info"] = Boolean(
          vendorData.vendor.name && 
          vendorData.vendor.phonenumber
        );
      } else if (currentStep === "business-details") {
        newStepCompletion["business-details"] = Boolean(
          vendorData.vendor.GSTIN && 
          vendorData.vendor.companyname && 
          vendorData.vendor.pan_number
        );
      } else if (currentStep === "banking-info") {
        newStepCompletion["banking-info"] = Boolean(
          vendorData.vendor.bank_account_holder_name && 
          vendorData.vendor.bank_account_number && 
          vendorData.vendor.bank_account_ifsc_code
        );
      } else if (currentStep === "creator-profile") {
        newStepCompletion["creator-profile"] = Boolean(
          vendorData.vendor.creator_bio && 
          vendorData.vendor.creator_category
        );
      }
    }
    
    setStepCompletion(newStepCompletion);    
    // Calculate progress
    calculateProgress(newStepCompletion);
    
    // Handle navigation based on current step
    if (currentStep === "final-review") {
      // Get the terms agreement status directly from state
      if (!termsAgreed) {
        toast({
          title: "Agreement Required",
          description: "Please confirm that all information is accurate by checking the box.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle final submission
      await handleFinalSubmission();
    } else {
      // Find current step index
      const currentIndex = STEPS.findIndex(step => step.id === currentStep);
      
      // Check if there is a next step
      if (currentIndex < STEPS.length - 1) {
        // Move to next step
        setCurrentStep(STEPS[currentIndex + 1].id);
        
        // Show success toast if step was completed
        if (newStepCompletion[currentStep]) {
          toast({
            title: "Step Completed",
            description: `${STEPS[currentIndex].title} information saved successfully.`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error during save and continue:', error);
    toast({
      title: "Error",
      description: "Failed to save your information. Please try again.",
      variant: "destructive",
    });
  }
};  // Update vendor data
const updateVendorData = (field: keyof VendorData, value: any) => {
  if (vendorData && vendorData.vendor) {
    setVendorData({
      ...vendorData,
      vendor: {
        ...vendorData.vendor,
        [field]: value,
        updated_at: new Date().toISOString()
      }
    });
  }
};

// 1. Replace initializeNewVendor with this improved version
const createEmptyVendorTemplate = () => {
  const userEmail = localStorage.getItem('vendorEmail') || "vendor@digicloud.com";
  return {
    vendor: {
      // Remove the "new" ID marker completely - let the backend generate the ID
      handle: "",
      name: "",
      logo: "",
      coverphoto: "",
      youtube: "",
      instagram: "",
      xtwitter: "",
      othersocial: "",
      phonenumber: "",
      GSTIN: "",
      gst_verification_status: "pending",
      companyname: "",
      pan_number: "",
      city: "",
      pincode: "",
      state: "",
      address: "",
      tan_number: "",
      bank_account_holder_name: "",
      bank_account_number: "",
      bank_account_ifsc_code: "",
      bank_name: "",
      bank_account_type: "Saving",
      cancelled_checkque: "",
      creator_bio: "",
      creator_title: "",
      creator_category: "other",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      admin: [{
        email: userEmail,
        first_name: '',
        last_name: ''
      }]
    }
  };
};

// Add a loading state to track API request status
// const [isLoading, setIsLoading] = useState(true);

// In useEffect for fetchVendorData
// useEffect(() => {
//   const fetchVendorData = async () => {
//     setIsLoading(true); // Start loading
    
//     try {
//       // Get authentication token from localStorage
//       let token = localStorage.getItem('vendorToken');
      
//       // Skip API call completely if no token exists
//       if (!token) {
//         console.log('No token found in localStorage, immediately creating new vendor profile');
//         setVendorData(createEmptyVendorTemplate());
//         setIsLoading(false);
//         return;
//       }
      
//       // Add a timeout to prevent indefinite loading
//       const timeoutPromise = new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Request timed out')), 5000)
//       );
      
//       // Race the fetch against the timeout
//       const fetchPromise = fetch('http://localhost:9000/vendors/me', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       // Wait for either the fetch to complete or the timeout to occur
//       const response = await Promise.race([fetchPromise, timeoutPromise]);
      
//       // Handle 401/404 errors as new vendor cases
//       if (response.status === 401 || response.status === 404) {
//         console.log(`Got ${response.status} response, handling as new vendor`);
//         setVendorData(createEmptyVendorTemplate());
//         setIsLoading(false);
//         return;
//       }
      
//       if (!response.ok) {
//         throw new Error(`API error: ${response.status} ${response.statusText}`);
//       }
      
//       // Success path - parse the response data
//       console.log('Successfully fetched vendor data');
//       const data = await response.json();
      
//       // Normalize admin data
//       // ... (same code as before)
      
//       setVendorData(data);
//       setIsLoading(false);
      
//     } catch (error) {
//       console.error('Error fetching vendor data:', error);
//       // For any error, initialize as new vendor instead of showing error
//       setVendorData(createEmptyVendorTemplate());
//       setIsLoading(false);
//     }
//   };
  
//   fetchVendorData();
  
  // Important: Add a fallback timeout to ensure loading state is cleared
//   const fallbackTimer = setTimeout(() => {
//     setIsLoading(false);
//     if (!vendorData) {
//       setVendorData(createEmptyVendorTemplate());
//     }
//   }, 8000);
  
//   return () => {
//     clearTimeout(fallbackTimer);
//   };
// }, []);

 // ADD THE NEW USEEFFECT HERE
 useEffect(() => {
  if (vendorData && !isLoading) {
    // Sanitize existing data
    const sanitized = sanitizeVendorData(vendorData);
    setVendorData(sanitized);
  }
}, [isLoading]); // Only run when loading completes

// Modify the loading check to use the isLoading state
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: `linear-gradient(135deg, ${BRAND.background} 0%, white 100%)` }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-t-2 border-b-2 rounded-full animate-spin" style={{ borderColor: BRAND.primary }}></div>
        <p className="text-lg font-medium" style={{ color: BRAND.textPrimary }}>Loading your profile...</p>
      </div>
    </div>
  );
}

// Default to new vendor data if vendorData is still null after loading
if (!vendorData) {
  setVendorData(createEmptyVendorTemplate());
  return null; // Return null to trigger re-render with new state
}
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `radial-gradient(circle at 15% 50%, ${BRAND.background}44, transparent 25%), 
                     radial-gradient(circle at 85% 30%, ${BRAND.light}22, transparent 25%)`,
        backgroundColor: "white",
        color: BRAND.textPrimary
      }}
    >
      {/* Header with progress */}
      <div 
        className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90"
      >
        <div className="container px-4 py-3 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex items-center mr-4">
                <div 
                  className="mr-2 text-2xl font-bold" 
                  style={{ color: BRAND.primary }}
                >
                  <Link to="/dashboard">
                    <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
                  </Link>
                </div>
                <span className="hidden text-gray-500 md:inline">|</span>
                <h1 className="hidden ml-2 text-lg font-semibold md:block" style={{ color: BRAND.secondary }}>
                  Creator Onboarding
                </h1>
              </div>
            </div>
            
            <div className="flex-1 max-w-sm mt-3 md:mt-0">
              {progress > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: BRAND.textSecondary }}>
                        {progress}% Complete
                      </span>
                      
                      {autoSaveIndicator && (
                        <span className="ml-3 text-xs italic text-gray-500">
                          {autoSaveIndicator}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={() => {
                          saveCurrentStepData();
                          toast({
                            title: "Progress Saved",
                            description: "Your progress has been saved. You can continue later.",
                          });
                        }} 
                        className="flex items-center text-xs"
                        style={{ color: BRAND.primary }}
                      >
                        <IconDeviceFloppy className="w-3 h-3 mr-1" />
                        Save & Exit
                      </button>
                    </div>
                  </div>
                  
                  <Progress 
                    value={progress}
                    className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden"
                    indicatorClassName={cn(
                      "h-full rounded-full transition-all duration-500 ease-out"
                    )}
                    style={{ 
                      background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar with improved navigation */}
          <div className={`w-full lg:w-72 shrink-0 ${navExpanded ? 'block' : 'hidden lg:block'}`}>
            <div className="overflow-hidden bg-white border border-gray-100 shadow-lg lg:sticky lg:top-24 rounded-xl">
              <div className="p-4" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                <h2 className="text-lg font-bold text-white">Your Journey</h2>
                <p className="text-sm text-white/80">Complete these steps to start selling</p>
              </div>
              
              <nav className="p-2">
                {STEPS.map((step, index) => {
                  const isCompleted = stepCompletion[step.id];
                  const isCurrent = currentStep === step.id;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex flex-col">
                      <button
                       onClick={() => {
                        setCurrentStep(step.id);
                        // Add this line to scroll to the top of the page when a step is clicked
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                        className={cn(
                          "flex items-center p-3 my-1 rounded-lg text-left transition-all duration-200 ease-out group relative",
                          isCurrent && "shadow-md",
                          isCompleted && !isCurrent && "opacity-85"
                        )}
                        style={{ 
                          background: isCurrent 
                            ? `linear-gradient(90deg, ${BRAND.primary}15, ${BRAND.primary}05)` 
                            : isCompleted ? '#f8f8f8' : 'transparent',
                          borderLeft: isCurrent ? `3px solid ${BRAND.primary}` : isCompleted ? `3px solid ${BRAND.success}` : '3px solid transparent',
                        }}
                      >
                        <div 
                          className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg mr-3 shrink-0 transition-all duration-300",
                            isCurrent && "shadow-md"
                          )}
                          style={{ 
                            background: isCompleted 
                              ? BRAND.success 
                              : isCurrent 
                                ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`
                                : '#f0f0f0',
                            color: (isCompleted || isCurrent) ? 'white' : BRAND.textSecondary
                          }}
                        >
                          {isCompleted ? (
                            <IconCircleCheck className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex flex-col">
                            <span className="font-medium" style={{ color: isCurrent ? BRAND.primary : BRAND.textPrimary }}>
                              {step.title}
                            </span>
                            <span className="mt-1 text-xs" style={{ color: BRAND.textSecondary }}>
                              {step.description}
                            </span>
                          </div>
                        </div>
                        
                        {step.estimatedTime && (
                          <div className="ml-2 text-xs py-1 px-1.5 rounded bg-gray-100 whitespace-nowrap">
                            {step.estimatedTime}
                          </div>
                        )}
                        
                        {isCurrent && (
                          <div 
                            className="absolute right-2 opacity-70"
                            style={{ color: BRAND.primary }}
                          >
                            <IconChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                      
                      {index < STEPS.length - 1 && (
                        <div className="flex items-center ml-5">
                          <div 
                            className="w-px h-6 mx-auto" 
                            style={{ 
                              background: isCompleted && stepCompletion[STEPS[index + 1].id] 
                                ? BRAND.success 
                                : '#e0e0e0'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              
              {/* Success stories */}
              {currentStep !== "welcome" && currentStep !== "final-review" && (
                <div className="px-4 py-6 border-t border-gray-100">
                  <h3 className="mb-3 text-sm font-semibold" style={{ color: BRAND.secondary }}>Success Stories</h3>
                  <div className="space-y-3">
                    <CreatorStoryCard story={CREATOR_STORIES[0]} brandColors={BRAND} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile nav toggle */}
          <div className="fixed z-40 lg:hidden bottom-4 right-4">
            <button
              onClick={() => setNavExpanded(!navExpanded)}
              className="p-3 text-white rounded-full shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}
            >
              {navExpanded ? (
                <IconX className="w-6 h-6" />
              ) : (
                <IconChevronRight className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
                <div className="flex items-center">
                  {STEPS.find(step => step.id === currentStep)?.icon && (
                    <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                      {(() => {
                        const IconComponent = STEPS.find(step => step.id === currentStep)?.icon;
                        return IconComponent ? <IconComponent className="w-6 h-6 text-white" /> : null;
                      })()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                      {STEPS.find(step => step.id === currentStep)?.title}
                    </CardTitle>
                    <CardDescription className="text-base" style={{ color: BRAND.textSecondary }}>
                      {STEPS.find(step => step.id === currentStep)?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pt-4">
                <FormComponent 
                  stepId={currentStep} 
                  vendorData={vendorData} 
                  updateVendorData={updateVendorData} 
                  brandColors={BRAND}
                  toast={toast}
                  stepCompletion={stepCompletion}  
                  setCurrentStep={setCurrentStep}
                  handleFileUpload={handleFileUpload}  
                  isUploading={isUploading}        
                  uploadType={uploadType}
                  termsAgreed={termsAgreed} 
                  setTermsAgreed={setTermsAgreed}
                  setVendorData={setVendorData}
                />
              </CardContent>
              
              {currentStep !== "welcome" && (
                <CardFooter className="flex justify-between px-6 pt-4 pb-6 border-t" style={{ borderColor: `${BRAND.primary}11` }}>
                  <div className="flex-1 max-w-[200px]">
                    <Button
                      variant="outline"
                      className="transition-all duration-200"
                      onClick={() => {
                        const currentIndex = STEPS.findIndex(step => step.id === currentStep);
                        if (currentIndex > 0) {
                          setCurrentStep(STEPS[currentIndex - 1].id);
                        }
                      }}
                    >
                      Back
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    {STEPS.find(step => step.id === currentStep)?.isSkippable && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const currentIndex = STEPS.findIndex(step => step.id === currentStep);
                          if (currentIndex < STEPS.length - 1) {
                            setCurrentStep(STEPS[currentIndex + 1].id);
                          }
                        }}
                      >
                        Skip for now
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleSaveAndContinue}
                      className="transition-all duration-200 hover:shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                        color: 'white' 
                      }}
                    >
                      {currentStep === "final-review" ? (
                        <>
                          Complete Onboarding
                          <IconArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Continue
                          <IconArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              )}
              
              {currentStep === "welcome" && (
                <CardFooter className="flex justify-center px-6 pt-4 pb-6">
                  <Button 
                    onClick={handleSaveAndContinue}
                    className="px-8 py-6 text-lg transition-all duration-200 hover:shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                      color: 'white' 
                    }}
                  >
                    Start Your Journey
                    <IconArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Support and help section */}
            {currentStep !== "welcome" && currentStep !== "final-review" && (
              <div 
                className="flex items-start p-5 mt-6 shadow-lg rounded-xl"
                style={{ 
                  background: 'white',
                  borderLeft: `4px solid ${BRAND.primary}`
                }}
              >
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 rounded-full" style={{ background: `${BRAND.primary}22` }}>
                  <IconHelpCircle style={{ color: BRAND.primary }} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium" style={{ color: BRAND.secondary }}>Need help?</h3>
                  <p style={{ color: BRAND.textSecondary }} className="mb-3 text-sm">Our team is available to answer any questions about this step.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="h-8 text-xs"
                      style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                    >
                      Chat with Support
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-8 text-xs"
                      style={{ color: BRAND.textSecondary }}
                    >
                      Read Documentation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right sidebar with live preview */}
          {(currentStep === "creator-profile" || currentStep === "basic-info") && (
              <div className="hidden xl:block w-72 shrink-0">
                <div className="sticky top-24">
                  <div className="mb-6 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-medium" style={{ color: BRAND.secondary }}>Live Preview</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="relative h-32 bg-gray-100 rounded-lg">
                        {vendorData?.vendor?.coverphoto ? (
                          <img src={vendorData.vendor.coverphoto} alt="Cover" className="object-cover w-full h-full rounded-lg" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xs text-gray-400">Cover Photo</p>
                          </div>
                        )}
                        
                        <div className="absolute -bottom-6 left-4">
                          <div className="w-12 h-12 overflow-hidden bg-gray-100 border-2 border-white rounded-full">
                            {vendorData?.vendor?.logo ? (
                              <img src={vendorData.vendor.logo} alt="Logo" className="object-cover w-full h-full" />
                            ) : (
                              <IconUser className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-8 pb-2">
                        <h4 className="font-bold">
                          {vendorData?.vendor?.name || 'Your Brand Name'}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          {vendorData?.vendor?.creator_title || 'Your creator title'}
                        </p>
                        
                        <div className="mt-3 text-xs text-gray-600 line-clamp-4">
                          {vendorData?.vendor?.creator_bio || 'Your bio will appear here, helping customers understand your creative vision and connect with your brand values.'}
                        </div>
                      </div>
                    </div>
                  </div>
                            
                <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium" style={{ color: BRAND.secondary }}>Tips</h3>
                  </div>
                  
                  <div className="p-4">
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start">
                        <IconCircleCheck className="w-3.5 h-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>Add a high-quality logo that's easily recognizable</span>
                      </li>
                      <li className="flex items-start">
                        <IconCircleCheck className="w-3.5 h-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>Choose a cover photo that showcases your best work</span>
                      </li>
                      <li className="flex items-start">
                        <IconCircleCheck className="w-3.5 h-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>Write a compelling bio that tells your unique story</span>
                      </li>
                      <li className="flex items-start">
                        <IconCircleCheck className="w-3.5 h-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                        <span>Select the most relevant category for your products</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <ChatwootWidget />
      </div>
      
      {/* Footer */}
      <div className="py-6 mt-12 border-t border-gray-200">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm" style={{ color: BRAND.textLight }}>
            &copy; {new Date().getFullYear()} Junooni. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}