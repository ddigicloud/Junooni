import { useState, useEffect } from "react";
// import React, { useRef } from 'react';
import VendorHandleInput from "./VendorHandleInput"; // Adjust the path as needed
// import BrandSettings from "@/features/auth/sign-up/onboarding/components/BrandSettings"
import { useNavigate } from "@tanstack/react-router";
import ChatwootWidget from '@/components/ChatwootWidget'
import JunooniLogo from '../../../../assets/junooni_logo_brand_color.png'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  IconEyeOff,
  IconLogout
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
  facebook: string | null;
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
   // Add the adminss property to match API response
    // Add the adminss property to match API response
  admins: {
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
  tan_number: "10-digit alphanumeric number to all persons who bear the responsibility of collecting tax at source (TCS) or deducting tax at source (TDS).",
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

// Utility function to decode JWT token and check for actor_id
const checkTokenForActorId = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return { hasActorId: false, actorId: null };

    // Decode JWT token (assuming it's base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));
    //console.log('Token payload:', payload);
    
    const actorId = payload.actor_id || payload.sub || payload.id;
    return { 
      hasActorId: !!actorId, 
      actorId: actorId 
    };
  } catch (error) {
    //console.error('Error decoding token:', error);
    return { hasActorId: false, actorId: null };
  }
};

const getEmailFromToken = (): string => {
  try {
    const token = localStorage.getItem('vendorToken')
    if (!token) return ''
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email || payload.app_metadata?.email || payload.entity_id || ''
  } catch {
    return ''
  }
}

// Mock component for the forms - in reality these would be your actual form components
const FormComponent = ({ stepId, vendorData, updateVendorData, brandColors, toast, setVendorData, stepCompletion ,setCurrentStep, handleFileUpload, isUploading,  uploadType,  termsAgreed, setTermsAgreed,  openDialog, setOpenDialog  }) => {
  
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
              <div className="mt-8">
                <Button 
                  onClick={() => setCurrentStep("basic-info")}
                  className="px-8 py-6 text-lg transition-all duration-200 hover:shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                    color: 'white' 
                  }}
                >
                  Start Your Journey
                  <IconArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

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
              <div className="flex items-center p-4 mb-6 border border-orange-100 rounded-lg bg-orange-50">
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-full">
                  <IconHelpCircle className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm text-orange-700">This information will be visible to customers and help them identify your brand.</p>
              </div>
              
              <div className="space-y-6">
                {/* Email Display Section */}
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
                        vendorData.vendor.admins && 
                        Array.isArray(vendorData.vendor.admins) && 
                        vendorData.vendor.admins.length > 0 && 
                        vendorData.vendor.admins[0].email
                          ? vendorData.vendor.admins[0].email
                          : localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com"
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
                    value={vendorData.vendor.admins && Array.isArray(vendorData.vendor.admins) && vendorData.vendor.admins.length > 0 
                      ? vendorData.vendor.admins[0].first_name || '' 
                      : ''}
                    onChange={(e) => {
                      const updatedVendorData = { ...vendorData };
                      if (!updatedVendorData.vendor.admins || !Array.isArray(updatedVendorData.vendor.admins) || updatedVendorData.vendor.admins.length === 0) {
                        updatedVendorData.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
                      }
                      updatedVendorData.vendor.admins[0].first_name = e.target.value;
                      setVendorData(updatedVendorData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.admins && 
                                  Array.isArray(vendorData.vendor.admins) && 
                                  vendorData.vendor.admins.length > 0 && 
                                  vendorData.vendor.admins[0].first_name 
                        ? 'rgb(229, 231, 235)' 
                        : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your First name"
                  />
                  {(!vendorData.vendor.admins || 
                    !Array.isArray(vendorData.vendor.admins) || 
                    vendorData.vendor.admins.length === 0 ||
                    !vendorData.vendor.admins[0].first_name) && (
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
                    value={vendorData.vendor.admins && Array.isArray(vendorData.vendor.admins) && vendorData.vendor.admins.length > 0 
                      ? vendorData.vendor.admins[0].last_name || '' 
                      : ''}
                    onChange={(e) => {
                      const updatedVendorData = { ...vendorData };
                      if (!updatedVendorData.vendor.admins || !Array.isArray(updatedVendorData.vendor.admins) || updatedVendorData.vendor.admins.length === 0) {
                        updatedVendorData.vendor.admins = [{ email: localStorage.getItem('vendorEmail') || 'vendor@example.com' }];
                      }
                      updatedVendorData.vendor.admins[0].last_name = e.target.value;
                      setVendorData(updatedVendorData);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: vendorData.vendor.admins && 
                                  Array.isArray(vendorData.vendor.admins) && 
                                  vendorData.vendor.admins.length > 0 && 
                                  vendorData.vendor.admins[0].last_name 
                        ? 'rgb(229, 231, 235)' 
                        : brandColors.error,
                      focusRing: brandColors.primary
                    }}
                    placeholder="Enter your Last name"
                  />
                  {(!vendorData.vendor.admins || 
                    !Array.isArray(vendorData.vendor.admins) || 
                    vendorData.vendor.admins.length === 0 ||
                    !vendorData.vendor.admins[0].last_name) && (
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
                
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="w-full">
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Profile pic <span className="text-red-500">*</span></label>
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
                              e.stopPropagation();
                              updateVendorData('logo', null);
                            }}
                          >
                            <IconX className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <button
                              className="px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-80 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
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
                            Drop your picture here or <span style={{ color: brandColors.primary, cursor: 'pointer' }}>browse</span>
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
                              e.stopPropagation();
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

                    <div>
                      <label className="block mb-1 text-sm font-medium">Facebook</label>
                      <div className="flex overflow-hidden">
                        <div className="flex items-center justify-center flex-shrink-0 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                          <span className="text-sm text-gray-500 whitespace-nowrap">facebook.com/</span>
                        </div>
                        <input
                          type="text"
                          value={vendorData.vendor.facebook || ''}
                          onChange={(e) => updateVendorData('facebook', e.target.value)}
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
                    Business details are optional — fill in only what applies to you.
                  </p>
                  <p className="mt-1 text-xs text-amber-700">All your business information is securely stored and protected.</p>
                </div>
              </div>
            </div>

            {/* ===== GST SECTION ===== */}
            <div className="p-5 border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">GST Registration</h3>
                  <p className="mt-0.5 text-sm text-gray-500">Required only if you have a GST Number</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Optional</span>
              </div>

              {/* Yes/No Toggle */}
              {!vendorData._gstAnswered ? (
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">Do you have a GST number?</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVendorData(prev => ({
                          ...prev,
                          _gstAnswered: true,
                          _hasGst: true
                        }));
                      }}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white transition-all rounded-lg hover:shadow-md"
                      style={{ background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)` }}
                    >
                      <IconCircleCheck className="w-4 h-4" />
                      Yes, I have GST
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVendorData(prev => ({
                          ...prev,
                          _gstAnswered: true,
                          _hasGst: false,
                          vendor: { ...prev.vendor, GSTIN: null }
                        }));
                      }}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <IconX className="w-4 h-4" />
                      No, I don't have GST
                    </button>
                  </div>
                </div>
              ) : vendorData._hasGst ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setVendorData(prev => ({ ...prev, _gstAnswered: false, _hasGst: false }))}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Change answer
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-3 mb-2 text-xs text-blue-700 rounded-lg bg-blue-50">
                    <IconInfoCircle className="w-4 h-4 shrink-0" />
                    Format: 22AAAAA0000A1Z5 — 15 character alphanumeric GST number
                  </div>
                  <input
                    type="text"
                    value={vendorData.vendor.GSTIN || ''}
                    onChange={(e) => updateVendorData('GSTIN', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                  <IconCircleCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">No GST — that's perfectly fine!</p>
                    <p className="mt-1 text-xs text-green-700">
                      You can still sell on Junooni without a GST number. If you register for GST later, you can update this anytime.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVendorData(prev => ({ ...prev, _gstAnswered: false, _hasGst: false }))}
                    className="text-xs text-green-600 underline hover:text-green-800 shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
            {/* ===== END GST SECTION ===== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-sm font-medium">PAN Number</label>
                  <div className="relative ml-1 group">
                    <IconHelpCircle className="w-4 h-4 text-gray-400" />
                    <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                      {FIELD_EXPLANATIONS.pan_number}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={vendorData.vendor.pan_number || ''}
                  onChange={(e) => updateVendorData('pan_number', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-sm font-medium">TAN Number</label>
                  <div className="relative ml-1 group">
                    <IconHelpCircle className="w-4 h-4 text-gray-400" />
                    <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                      {FIELD_EXPLANATIONS.tan_number}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={vendorData.vendor.tan_number || ''}
                  onChange={(e) => updateVendorData('tan_number', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Company Name</label>
              <input
                type="text"
                value={vendorData.vendor.companyname || ''}
                onChange={(e) => updateVendorData('companyname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                placeholder="Your registered company name (if applicable)"
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
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
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
        //console.log('Rendering banking-info with vendorData:', vendorData);
  
        if (vendorData === null) {
          return <div>Loading...</div>;
        }
        
        if (!vendorData.vendor) {
          vendorData = {
            vendor: {
              handle: "",
              name: "",
              bank_account_holder_name: null,
              bank_account_number: null,
              bank_account_ifsc_code: null,
              bank_name: null,
              bank_account_type: "Saving",
              cancelled_checkque: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        }
        
        if (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins) || vendorData.vendor.admins.length === 0) {
          //console.log('admins data missing, initializing...');
          const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
          
          vendorData.vendor.admins = [{
            email: userEmail,
            first_name: '',
            last_name: ''
          }];
        }
        return (
          <div className="py-4 space-y-6">
            <div className="flex items-center p-4 mb-6 border border-orange-100 rounded-lg bg-orange-50">
              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-full">
                <IconCreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <div>
              <p className="text-sm font-medium text-orange-800">
                {!vendorData.vendor.id 
                  ? "Please provide your banking details so we can send your earnings."
                  : "Your banking details are needed for payouts"}
              </p>
                <p className="mt-1 text-xs text-orange-700">We'll transfer your earnings to this account when customers purchase your products</p>
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
                          e.stopPropagation();
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
        //console.log('Rendering creator-profile with vendorData:', vendorData);
  
        if (vendorData === null) {
          return <div>Loading...</div>;
        }
        
        if (!vendorData.vendor) {
          vendorData = {
            vendor: {
              handle: "",
              name: "",
              logo: null,
              coverphoto: null,
              creator_bio: null,
              creator_title: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          };
        }
        
        if (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins) || vendorData.vendor.admins.length === 0) {
          //console.log('admins data missing, initializing...');
          const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
          
          vendorData.vendor.admins = [{
            email: userEmail,
            first_name: '',
            last_name: ''
          }];
        }
        return (
          <div className="py-4 space-y-6">
            <div className="p-4 mb-6 bg-white border-l-4 rounded-lg shadow-sm" style={{ borderLeftColor: brandColors.primary }}>
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
  //console.log('Rendering final-review with vendorData:', vendorData);

  if (vendorData === null) {
    return <div>Loading...</div>;
  }
  
  if (!vendorData.vendor) {
    vendorData = {
      vendor: {
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
  
  if (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins) || vendorData.vendor.admins.length === 0) {
    //console.log('admins data missing, initializing...');
    const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
    
    vendorData.vendor.admins = [{
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
      
      <div className="p-4 mt-8 bg-white border border-gray-200 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            id="terms-checkbox"
            className="w-5 h-5 mt-1 mr-3"
            style={{ accentColor: brandColors.primary, cursor: 'pointer' }}
            checked={termsAgreed}
            onChange={() => {
              setTermsAgreed(!termsAgreed);
            }}
          />
          <div>
            <p className="text-sm">I confirm that all the information provided is accurate and complete.</p>
            <p className="mt-1 text-xs text-gray-500">
              By submitting, you agree to Junooni's{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDialog('terms');
                }}
                className="font-medium hover:underline"
                style={{ color: brandColors.primary }}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDialog('seller');
                }}
                className="font-medium hover:underline"
                style={{ color: brandColors.primary }}
              >
                Seller Policy
              </button>.
            </p>
          </div>
        </label>
      </div>

      {/* Terms of Service Dialog */}
      <Dialog open={openDialog === 'terms'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              Terms of Service
            </DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                1. Acceptance of Terms
              </h3>
              <p className="text-gray-700">
                By accessing and using Junooni's creator platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                2. Account Registration
              </h3>
              <p className="mb-2 text-gray-700">
                To become a creator on Junooni, you must:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain and update your account information</li>
                <li>Be at least 18 years of age or have parental consent</li>
                <li>Have the legal authority to enter into this agreement</li>
                <li>Not have been previously suspended or removed from the platform</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                3. Creator Responsibilities
              </h3>
              <p className="mb-2 text-gray-700">
                As a creator, you are responsible for:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>The accuracy and legality of your product listings</li>
                <li>Fulfilling orders in a timely manner</li>
                <li>Providing excellent customer service</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Maintaining the confidentiality of your account credentials</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                4. Intellectual Property
              </h3>
              <p className="text-gray-700">
                You retain all rights to your intellectual property. By listing products on Junooni, you grant us a limited license to display, promote, and sell your products through our platform. You warrant that you have all necessary rights to the content you upload.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                5. Payments and Fees
              </h3>
              <p className="mb-2 text-gray-700">
                Junooni operates on a commission-based model:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Platform fees are deducted from each sale</li>
                <li>Payments are processed according to our payment schedule</li>
                <li>You are responsible for applicable taxes on your earnings</li>
                <li>Fee structures may be updated with advance notice</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                6. Prohibited Activities
              </h3>
              <p className="mb-2 text-gray-700">
                You may not:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Sell counterfeit, illegal, or prohibited items</li>
                <li>Engage in fraudulent activities or misrepresentation</li>
                <li>Violate intellectual property rights</li>
                <li>Manipulate reviews or ratings</li>
                <li>Spam or harass other users</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                7. Termination
              </h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or at our discretion. You may close your account at any time, subject to fulfilling pending orders and obligations.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                8. Limitation of Liability
              </h3>
              <p className="text-gray-700">
                Junooni provides the platform "as is" and makes no warranties about the service. We are not liable for indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                9. Changes to Terms
              </h3>
              <p className="text-gray-700">
                We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms. We will notify you of significant changes via email or platform notification.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                10. Contact Information
              </h3>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at support@junooni.com or through our support center.
              </p>
            </section>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t">
            <Button
              onClick={() => setOpenDialog(null)}
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                color: 'white'
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seller Policy Dialog */}
      <Dialog open={openDialog === 'seller'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              Seller Policy
            </DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                1. Product Listings
              </h3>
              <p className="mb-2 text-gray-700">
                All product listings must:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Contain accurate and truthful descriptions</li>
                <li>Include clear, high-quality images of actual products</li>
                <li>Display correct pricing and availability</li>
                <li>Specify shipping costs and delivery timeframes</li>
                <li>Comply with applicable consumer protection laws</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                2. Prohibited Items
              </h3>
              <p className="mb-2 text-gray-700">
                The following items are strictly prohibited:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Counterfeit or replica products</li>
                <li>Stolen goods or items obtained illegally</li>
                <li>Weapons, ammunition, or explosives</li>
                <li>Illegal drugs or controlled substances</li>
                <li>Items that promote hate or violence</li>
                <li>Adult content or services</li>
                <li>Items infringing on intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                3. Order Fulfillment
              </h3>
              <p className="mb-2 text-gray-700">
                Sellers must:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Ship orders within the stated processing time</li>
                <li>Provide tracking information when available</li>
                <li>Package items securely to prevent damage</li>
                <li>Honor stated return and refund policies</li>
                <li>Respond to customer inquiries within 24 hours</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                4. Pricing and Fees
              </h3>
              <p className="mb-2 text-gray-700">
                Regarding pricing:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Sellers set their own product prices</li>
                <li>Platform commission is charged per transaction</li>
                <li>Payment processing fees may apply</li>
                <li>Sellers are responsible for applicable taxes</li>
                <li>Price manipulation or false pricing is prohibited</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                5. Returns and Refunds
              </h3>
              <p className="text-gray-700">
                Sellers must establish clear return policies that comply with consumer protection laws. At minimum, sellers should accept returns for defective or misrepresented items. The return policy must be clearly stated in product listings.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                6. Customer Service
              </h3>
              <p className="mb-2 text-gray-700">
                Excellence in customer service includes:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Prompt responses to customer messages</li>
                <li>Professional and courteous communication</li>
                <li>Fair resolution of disputes</li>
                <li>Honoring commitments made to customers</li>
                <li>Maintaining a high seller rating</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                7. Reviews and Ratings
              </h3>
              <p className="text-gray-700">
                Reviews are crucial for marketplace trust. Sellers must not manipulate reviews through incentives, threats, or fake reviews. Negative reviews should be addressed professionally. Junooni reserves the right to remove reviews that violate guidelines.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                8. Account Requirements
              </h3>
              <p className="mb-2 text-gray-700">
                To maintain seller status:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Keep contact information current</li>
                <li>Maintain valid payment details</li>
                <li>Complete tax documentation as required</li>
                <li>Respond to platform communications</li>
                <li>Meet performance standards</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                9. Compliance and Legal
              </h3>
              <p className="text-gray-700">
                Sellers must comply with all applicable laws including but not limited to: consumer protection laws, tax regulations, import/export restrictions, data protection requirements, and intellectual property laws. Sellers are solely responsible for legal compliance.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                10. Policy Violations
              </h3>
              <p className="mb-2 text-gray-700">
                Violations of this policy may result in:
              </p>
              <ul className="pl-5 space-y-1 text-gray-700 list-disc">
                <li>Warning notices</li>
                <li>Listing removal</li>
                <li>Account suspension</li>
                <li>Permanent account termination</li>
                <li>Withholding of funds pending investigation</li>
                <li>Legal action for serious violations</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: brandColors.secondary }}>
                11. Support and Appeals
              </h3>
              <p className="text-gray-700">
                If you believe a policy decision was made in error, you may appeal through our support center. We will review appeals fairly and respond within 5-7 business days. Contact seller-support@junooni.com for assistance.
              </p>
            </section>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t">
            <Button
              onClick={() => setOpenDialog(null)}
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
                color: 'white'
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
            <img src={story.image || `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/static/creator-placeholder.webp`} alt={story.name} className="object-cover w-full h-full" />
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<'terms' | 'seller' | null>(null);

  const [pendingFiles, setPendingFiles] = useState({
    logo: null,
    coverphoto: null,
    cancelled_checkque: null
  });
  
  const [vendorData, setVendorData] = useState<ApiVendorResponse | null>(null);
  const [localPayload, setLocalPayload] = useState(null); // NEW: Store payload locally
  
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

  // Fetch vendor data when component mounts - UPDATED with token logic
  const [isLoading, setIsLoading] = useState(true);
   
// NEW: Modified useEffect with token-based logic
useEffect(() => {
  let isActive = true;

  const setupInitialState = () => {
   const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
    
    const defaultData = {
      vendor: {
        handle: "",
        name: "",
        logo: null,
        coverphoto: null,
        youtube: null,
        instagram: null,
        xtwitter: null,
        facebook: null,
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
        admins: [{
          email: userEmail,
          first_name: '',
          last_name: ''
        }]
      }
    };
    
    if (isActive) {
      setVendorData(defaultData);
      
      // Set initial step completion
      const initialStepCompletion = {
        "welcome": true,
        "basic-info": false,
        "business-details": false,
        "banking-info": false,
        "creator-profile": false,
        "final-review": false
      };
      
      setStepCompletion(initialStepCompletion);
      calculateProgress(initialStepCompletion);
      setIsLoading(false);
    }
  };
  
  // Check token and decide whether to fetch existing vendor or set up new one
  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        //console.log('No token found, setting up as new vendor');
        setupInitialState();
        return;
      }
      
      // Check if token has actor_id
      const { hasActorId } = checkTokenForActorId();
      //console.log('Token has actor_id:', hasActorId);
      
      if (hasActorId) {
        // Try to fetch existing vendor data
        try {
          const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            //console.log('Successfully fetched existing vendor data:', data);
            
            if (isActive) {
              setVendorData(data);
              
              // Calculate step completion based on existing data
              const completion = {
                "welcome": true,
                "basic-info": Boolean(data.vendor.name && data.vendor.phonenumber),
                "business-details": Boolean(data.vendor.GSTIN && data.vendor.companyname && data.vendor.pan_number),
                "banking-info": Boolean(data.vendor.bank_account_holder_name && data.vendor.bank_account_number),
                "creator-profile": Boolean(data.vendor.creator_bio && data.vendor.creator_category),
                "final-review": false
              };
              
              setStepCompletion(completion);
              calculateProgress(completion);
            }
          } else {
            //console.log('Failed to fetch vendor data, setting up as new vendor');
            setupInitialState();
          }
        } catch (fetchError) {
          //console.error('Error fetching vendor data:', fetchError);
          setupInitialState();
        }
      } else {
        // No actor_id, set up as new vendor
        //console.log('No actor_id in token, setting up as new vendor');
        setupInitialState();
      }
      
      if (isActive) {
        setIsLoading(false);
      }
      
    } catch (error) {
      //console.error('Error initializing onboarding:', error);
      if (isActive) {
        setupInitialState();
      }
    }
  };
  
  initializeOnboarding();
  
  return () => {
    isActive = false;
  };
}, [navigate, toast]);

// Add this useEffect after your main initialization useEffect
useEffect(() => {
  if (vendorData && vendorData.vendor && (!vendorData.vendor.admins || !Array.isArray(vendorData.vendor.admins))) {
    //console.log('Normalizing admins data structure...');
    const userEmail = localStorage.getItem('vendorEmail') || getEmailFromToken() || "vendor@example.com";
    
    setVendorData(prevData => ({
      ...prevData,
      vendor: {
        ...prevData.vendor,
        admins: [{
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

// Handle the actual auto-save process - UPDATED with token logic
useEffect(() => {
  if (shouldAutoSave) {
    setAutoSaveIndicator("Saving...");
    
    // Check token and decide whether to save locally or to server
    const { hasActorId } = checkTokenForActorId();
    
    if (hasActorId) {
      // Save to server using PUT
      handleServerUpdate();
    } else {
      // Save to local payload
      handleLocalSave();
    }
    
    // Reset the flag
    setShouldAutoSave(false);
    
    // Update indicator
    setTimeout(() => {
      setAutoSaveIndicator("Changes saved");
      setTimeout(() => {
        setAutoSaveIndicator("");
      }, 2000);
    }, 1000);
  }
}, [shouldAutoSave]);


// Add this useEffect after your existing useEffects to recalculate step completion
useEffect(() => {
  if (vendorData && vendorData.vendor) {
    const newCompletion = {
      "welcome": true,
      "basic-info": Boolean(
        vendorData.vendor.name && 
        vendorData.vendor.phonenumber &&
        vendorData.vendor.admins && 
        Array.isArray(vendorData.vendor.admins) && 
        vendorData.vendor.admins.length > 0 &&
        vendorData.vendor.admins[0].first_name &&
        vendorData.vendor.admins[0].last_name
      ),
      "business-details": Boolean(
        vendorData.vendor.GSTIN && 
        vendorData.vendor.companyname && 
        vendorData.vendor.pan_number
      ),
      "banking-info": Boolean(
        vendorData.vendor.bank_account_holder_name && 
        vendorData.vendor.bank_account_number && 
        vendorData.vendor.bank_account_ifsc_code
      ),
      "creator-profile": Boolean(
        vendorData.vendor.creator_bio && 
        vendorData.vendor.creator_category
      ),
      "final-review": false
    };
    
    setStepCompletion(newCompletion);
    calculateProgress(newCompletion);
  }
}, [vendorData]); // Recalculate whenever vendorData changes

// Also update your STEPS array to reflect the actual required fields:
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
    requiredFields: ["name", "phonenumber", "first_name", "last_name"], // Updated
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
    requiredFields: ["bank_account_holder_name", "bank_account_number", "bank_account_ifsc_code"], // Updated
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


// NEW: Handle local payload save
const handleLocalSave = () => {
  try {
    if (vendorData && vendorData.vendor) {
      const payload = {
        ...vendorData.vendor,
        updated_at: new Date().toISOString()
      };
      setLocalPayload(payload);
      //console.log('Data saved to local payload:', payload);
    }
  } catch (error) {
    //console.error('Error saving to local payload:', error);
  }
};

// NEW: Handle server update via PUT
const handleServerUpdate = async () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token || !vendorData || !vendorData.vendor) {
      return;
    }
    
    // Upload pending files first
    const uploadedUrls = await uploadPendingFiles();
    //console.log('📁 Uploaded file URLs for update:', uploadedUrls);
    
    // Prepare update payload
    const updatePayload = {};
    const textFields = [
      'name', 'handle', 'phonenumber',
      'youtube', 'instagram', 'xtwitter', 'facebook', 'othersocial',
      'GSTIN', 'gst_verification_status', 'companyname', 'pan_number', 
      'city', 'pincode', 'state', 'address', 'tan_number',
      'bank_account_holder_name', 'bank_account_number', 'bank_account_ifsc_code', 
      'bank_name', 'bank_account_type', 
      'creator_bio', 'creator_title', 'creator_category'
    ];
    
    // Add text fields (exclude base64 data)
    textFields.forEach(field => {
      let value = vendorData.vendor[field];
      if (value && !String(value).startsWith('data:')) {
        updatePayload[field] = value || '';
      }
    });
    
    // Add file fields only if we have uploaded URLs
    if (uploadedUrls.logo) updatePayload.logo = uploadedUrls.logo;
    if (uploadedUrls.coverphoto) updatePayload.coverphoto = uploadedUrls.coverphoto;
    if (uploadedUrls.cancelled_checkque) updatePayload.cancelled_checkque = uploadedUrls.cancelled_checkque;
    
    // For existing files, only include if they're not base64 data
    ['logo', 'coverphoto', 'cancelled_checkque'].forEach(field => {
      if (!uploadedUrls[field] && vendorData.vendor[field] && !vendorData.vendor[field].startsWith('data:')) {
        updatePayload[field] = vendorData.vendor[field];
      }
    });
    
    // Check payload size
    //checkPayloadSize(updatePayload, 'Vendor Update');
    
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (response.ok) {
      const updatedData = await response.json();
      if (updatedData.vendor) {
        setVendorData(prevData => ({
          ...prevData,
          vendor: {
            ...prevData.vendor,
            ...updatedData.vendor
          }
        }));
      }
      //console.log('Successfully updated vendor data on server');
    } else {
      //console.error('Failed to update vendor data on server');
    }
  } catch (error) {
    //console.error('Error updating vendor data on server:', error);
  }
};

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

  // NEW FUNCTION: Handle Continue - UPDATED with token logic
  const handleContinue = async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  try {
    if (currentStep === "welcome") {
      setCurrentStep("basic-info");
      return;
    }
    
    // Validate current step requirements
    if (currentStep === "basic-info") {
      if (!vendorData?.vendor?.name || !vendorData?.vendor?.phonenumber) {
        toast({
          title: "Required Fields Missing",
          description: "Please fill in Brand Name and Phone Number to continue.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep === "final-review") {
      if (!termsAgreed) {
        toast({
          title: "Agreement Required",
          description: "Please confirm that all information is accurate by checking the box.",
          variant: "destructive",
        });
        return;
      }
      
      // For final review, this becomes the complete submission
      await handleFinalSubmission();
    } else {
      // Check token and decide action
      const { hasActorId } = checkTokenForActorId();
      
      if (hasActorId) {
        // Update existing vendor via PUT
        await handleServerUpdate();
        toast({
          title: "Progress Saved",
          description: "Your changes have been saved to your vendor profile.",
        });
      } else {
        // Save to local payload
        handleLocalSave();
        toast({
          title: "Progress Saved",
          description: "Your progress has been saved. Continue filling the form.",
        });
      }
      
      // Move to next step
      const currentIndex = STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1].id);
      }
    }
  } catch (error) {
    //console.error('Error during continue:', error);
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  }
};

// NEW FUNCTION: Handle Save and Exit - UPDATED with token logic
const handleSaveAndExit = async () => {
  try {
    const token = localStorage.getItem('vendorToken');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your data.",
        variant: "destructive",
      });
      return;
    }

    // Validate mandatory fields for vendor creation
    if (!vendorData?.vendor?.admins?.[0]?.first_name || !vendorData?.vendor?.admins?.[0]?.last_name) {
      toast({
        title: "Required Information Missing",
        description: "Please provide your First Name and Last Name to save your profile.",
        variant: "destructive",
      });
      return;
    }

    setAutoSaveIndicator("Saving your profile...");
    
    const { hasActorId } = checkTokenForActorId();
    
    if (hasActorId) {
      // Case 2: Token has actor_id - Update existing vendor and navigate to dashboard
      await handleServerUpdate();
      
      toast({
        title: "Profile Updated Successfully!",
        description: "Your vendor profile has been updated. Redirecting to dashboard...",
      });
      
      setTimeout(() => {
        setAutoSaveIndicator("");
        navigate({ to: '/dashboard' });
      }, 1500);
      
    } else {
      // Case 1: Token doesn't have actor_id - Create new vendor and navigate to sign-in
      await handleCreateNewVendor();
      
      toast({
        title: "Profile Created Successfully!",
        description: "Your vendor profile has been created. Redirecting to sign-in...",
      });
      
      setTimeout(() => {
        setAutoSaveIndicator("");
        navigate({ to: '/sign-in' });
      }, 1500);
    }
    
  } catch (error) {
    //console.error('Error during save and exit:', error);
    toast({
      title: "Error Saving Profile",
      description: error.message || "Failed to save your profile. Please try again.",
      variant: "destructive",
    });
    setAutoSaveIndicator("");
  }
};


// NEW FUNCTION: Create new vendor
// Updated handleCreateNewVendor function
const handleCreateNewVendor = async () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // Upload pending files first and get URLs
    const uploadedUrls = await uploadPendingFiles();
    //console.log('📁 Uploaded file URLs:', uploadedUrls);
    
    // Combine local payload with current vendorData
    const finalData = localPayload || vendorData.vendor;
    
    // Prepare creation payload
    const createPayload = {
      name: finalData.name || 'New Vendor',
      handle: finalData.handle || 'new-vendor-handle',
      phonenumber: finalData.phonenumber || '',
      
      // FIXED: Only use uploaded URLs, don't fallback to base64 data
      logo: uploadedUrls.logo || '',
      coverphoto: uploadedUrls.coverphoto || '',
      cancelled_checkque: uploadedUrls.cancelled_checkque || '',
      
      // Fixed admin field (singular)
      admin: {
        email: finalData.admins?.[0]?.email || localStorage.getItem('vendorEmail') || 'vendor@example.com',
        first_name: finalData.admins?.[0]?.first_name || '',
        last_name: finalData.admins?.[0]?.last_name || ''
      }
    };
    
    // Add optional text fields (no file fields here)
    const textFields = [
      'youtube', 'instagram', 'xtwitter', 'facebook', 'GSTIN', 
      'companyname', 'pan_number', 'city', 'pincode', 'state', 
      'address', 'bank_name', 'bank_account_holder_name', 
      'bank_account_number', 'bank_account_ifsc_code', 
      'bank_account_type', 'creator_bio', 'creator_title', 'creator_category'
    ];
    
    textFields.forEach(field => {
      if (finalData[field] && !finalData[field].startsWith('data:')) {
        createPayload[field] = finalData[field];
      }
    });
    
    // Check payload size
    // checkPayloadSize(createPayload, 'Vendor Creation');
    
    //console.log('Creating new vendor with payload:', createPayload);
    
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(createPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create vendor: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    //console.log('Vendor created successfully:', responseData);
    
    // Update local state with created vendor
    if (responseData.vendor) {
      setVendorData(responseData);
      setLocalPayload(null);
      // Clear pending files since they're uploaded
      setPendingFiles({
        logo: null,
        coverphoto: null,
        cancelled_checkque: null
      });
    }
    
  } catch (error) {
    //console.error('Error creating vendor:', error);
    throw error;
  }
};

// Handle final submission
const handleFinalSubmission = async () => {
  try {
    if (!termsAgreed) {
      toast({
        title: "Agreement Required",
        description: "Please confirm that all information is accurate by checking the box.",
        variant: "destructive",
      });
      return;
    }
    
    const { hasActorId } = checkTokenForActorId();
    
    if (hasActorId) {
      // Update existing vendor and redirect to dashboard
      await handleServerUpdate();
      toast({
        title: "Onboarding Complete",
        description: "Welcome to Junooni Creator Dashboard!",
      });
      setTimeout(() => {
        navigate({ to: '/dashboard' });
      }, 1000);
    } else {
      // Create new vendor and redirect to sign-in
      await handleCreateNewVendor();
      toast({
        title: "Onboarding Complete",
        description: "Your vendor profile has been created successfully!",
      });
      setTimeout(() => {
        navigate({ to: '/sign-in' });
      }, 1000);
    }
    
  } catch (error) {
    //console.error('Error completing onboarding:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to complete onboarding. Please try again.",
      variant: "destructive",
    });
  }
};

// Handle file upload
const handleFileUpload = async (file: File, fileType: 'logo' | 'coverphoto' | 'cancelled_checkque') => {
  if (!file) return;
  
  try {
    // Validate file type
    if (!file.type.startsWith('image/') && fileType !== 'cancelled_checkque') {
      throw new Error('Please select a valid image file');
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
    
    //console.log(`Storing ${fileType} file for later upload:`, file.name, file.size, file.type);
    
    // Store the actual File object for later upload
    setPendingFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    
    // Create preview URL using FileReader for immediate display
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      
      // Update vendor data with preview URL for display
      updateVendorData(fileType, previewUrl);
      
      //console.log(`${fileType} preview set, file stored for upload on save`);
      
      toast({
        title: "File Selected",
        description: `${fileType === 'cancelled_checkque' ? 'Cheque' : fileType} ready for upload.`,
      });
    };
    
    reader.onerror = () => {
      throw new Error(`Failed to read ${fileType} file`);
    };
    
    // Read file as data URL for preview
    reader.readAsDataURL(file);
    
  } catch (error) {
    //console.error(`Error processing ${fileType}:`, error);
    
    toast({
      title: "File Error",
      description: error.message || `Failed to process your ${fileType}. Please try again.`,
      variant: "destructive",
    });
  }
};

// Upload pending files
const uploadPendingFiles = async () => {
  const token = localStorage.getItem('vendorToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const uploadedUrls = {};
  
  // Check if we have any files to upload
  const filesToUpload = Object.entries(pendingFiles).filter(([key, file]) => file instanceof File);
  
  //console.log('🔍 Pending files to upload:', filesToUpload.map(([key, file]) => `${key}: ${file.name}`));
  
  if (filesToUpload.length === 0) {
    //console.log('No pending files to upload');
    return uploadedUrls;
  }
  
  //console.log(`📁 Uploading ${filesToUpload.length} pending files...`);
  
  // Upload each pending file
  for (const [fileType, file] of filesToUpload) {
    try {
      //console.log(`🔄 Uploading ${fileType}:`, file.name, `(${(file.size / 1024).toFixed(1)}KB)`);
      
      const formData = new FormData();
      formData.append('files', file);
      
      const uploadUrl = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/uploads`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        //console.error(`❌ Upload failed for ${fileType}:`, response.status, await response.text());
        continue;
      }
      
      // Parse the response
      const data = await response.json();
      //console.log(`📄 Upload response data for ${fileType}:`, data);
      
      // FIXED: Extract URL from the correct response structure
      let fileUrl = null;
      
      // Check for the actual response structure: { files: [{ url: "..." }] }
      if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        const fileData = data.files[0];
        fileUrl = fileData.url || fileData.path;
      }
      // Fallback checks for other possible response structures
      else if (data.url) {
        fileUrl = data.url;
      } else if (data.file_url) {
        fileUrl = data.file_url;
      } else if (data.path) {
        fileUrl = data.path.startsWith('http') ? data.path : `${import.meta.env.VITE_MEDUSA_BACKEND_URL}${data.path}`;
      }
      
      if (fileUrl) {
        uploadedUrls[fileType] = fileUrl;
        //console.log(`✅ ${fileType} uploaded successfully:`, fileUrl);
        
        toast({
          title: "File Uploaded",
          description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`,
        });
      } else {
        //console.error(`❌ Could not extract URL from response for ${fileType}:`, data);
        //console.error(`Response structure: files array exists: ${!!data.files}, is array: ${Array.isArray(data.files)}, length: ${data.files?.length}`);
      }
      
    } catch (error) {
      //console.error(`❌ Error uploading ${fileType}:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${fileType}: ${error.message}`,
        variant: "destructive",
      });
      continue;
    }
  }
  
  //console.log(`📁 Upload completed. Successfully uploaded URLs:`, uploadedUrls);
  return uploadedUrls;
};

  // Update vendor data function
const updateVendorData = (field: keyof VendorData, value: any) => {
  if (vendorData && vendorData.vendor) {
    // If it's a file field and the value is a base64 data URL, 
    // store it separately for preview but don't include in vendor data
    if (['logo', 'coverphoto', 'cancelled_checkque'].includes(field) && 
        typeof value === 'string' && value.startsWith('data:')) {
      
      // Store for preview purposes
      setVendorData({
        ...vendorData,
        vendor: {
          ...vendorData.vendor,
          [field]: value, // Keep for preview
          updated_at: new Date().toISOString()
        }
      });
      
      // Don't trigger auto-save for base64 data
      return;
    }
    
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

// Loading check
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
                    <img src={JunooniLogo} alt="Junooni Logo" className="h-8" />
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
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                />
              </CardContent>
              
              {/* UPDATED FOOTER WITH BOTH BUTTONS */}
              {currentStep !== "welcome" && (
                <CardFooter className="px-4 pt-4 pb-6 border-t sm:px-6" style={{ borderColor: `${BRAND.primary}11` }}>
                {/* Mobile Layout (< sm) - Stacked in 2 rows */}
                <div className="flex flex-col w-full gap-3 sm:hidden">
                  {/* Row 1: Back and Continue */}
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm transition-all duration-200 h-9"
                      onClick={() => {
                        const currentIndex = STEPS.findIndex(step => step.id === currentStep);
                        if (currentIndex > 0) {
                          setCurrentStep(STEPS[currentIndex - 1].id);
                        }
                      }}
                    >
                      Back
                    </Button>
                    
                    <Button 
                      onClick={handleContinue}
                      className="flex-1 text-sm transition-all duration-200 hover:shadow-md h-9"
                      style={{ 
                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                        color: 'white' 
                      }}
                    >
                      {currentStep === "final-review" ? (
                        <>
                          Complete
                          <IconArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      ) : (
                        <>
                          Continue
                          <IconArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Row 2: Save & Exit and Skip */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSaveAndExit}
                      className="px-3 text-sm transition-all duration-200 hover:shadow-md h-9"
                      style={{ 
                        borderColor: BRAND.primary,
                        color: BRAND.primary 
                      }}
                    >
                      <IconLogout className="w-3.5 h-3.5 mr-1" />
                      Save & Exit
                    </Button>
                    
                    {STEPS.find(step => step.id === currentStep)?.isSkippable && (
                      <Button
                        variant="ghost"
                        className="text-sm h-9"
                        style={{ 
                        borderColor: BRAND.primary,
                        color: BRAND.primary 
                      }}
                        onClick={() => {
                          const currentIndex = STEPS.findIndex(step => step.id === currentStep);
                          if (currentIndex < STEPS.length - 1) {
                            setCurrentStep(STEPS[currentIndex + 1].id);
                          }
                        }}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Desktop Layout (>= sm) - Original horizontal layout */}
                <div className="justify-between hidden w-full sm:flex">
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
                    {/* SAVE AND EXIT BUTTON */}
                    <Button
                      variant="outline"
                      onClick={handleSaveAndExit}
                      className="transition-all duration-200 hover:shadow-md"
                      style={{ 
                        borderColor: BRAND.primary,
                        color: BRAND.primary 
                      }}
                    >
                      <IconLogout className="w-4 h-4 mr-2" />
                      Save & Exit
                    </Button>
                    
                    {/* Skip button (if applicable) */}
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
                    
                    {/* CONTINUE BUTTON */}
                    <Button 
                      onClick={handleContinue}
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
                </div>
              </CardFooter>
              )}
              
              {/* WELCOME STEP FOOTER */}
              {/* {currentStep === "welcome" && (
                <CardFooter className="flex justify-center px-6 pt-4 pb-6">
                  <Button 
                    onClick={handleContinue}
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
              )} */}
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