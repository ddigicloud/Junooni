

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import ChatwootWidget from '@/components/ChatwootWidget'
import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Button
} from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconUser,
  IconBuilding,
  IconCreditCard,
  IconFileText,
  IconEye,
  IconEyeOff,
  IconHelpCircle,
  IconX,
  IconCamera,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandX,
  IconBrandFacebook,
  IconLogout,
  IconMenu2,
  IconPhone,
  IconMail,
  IconMapPin,
  IconShield,
  IconChecks,
  IconSettings
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from '@/components/profile-dropdown'
import Junoonilogo from '../../../../assets/junooni_logo_brand_color.png' // Adjust path as needed


interface AdminData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  // Add any other admin properties that might exist
}

// Type for the vendor data (same as in onboarding)
interface VendorData {
  vendor: {
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
  admins: AdminData[]; 
  }
}

// Field explanations for tooltips
const FIELD_EXPLANATIONS = {
  GSTIN: "Your Goods and Services Tax Identification Number issued by the Indian government.",
  pan_number: "Permanent Account Number (PAN) is a 10-character alphanumeric identifier issued by the Income Tax Department.",
  tan_number: "10-digit alphanumeric number to all persons who bear the responsibility of collecting tax at source (TCS) or deducting tax at source (TDS).",
  bank_account_ifsc_code: "11-character code that uniquely identifies a bank branch participating in electronic funds transfer systems.",
  creator_category: "The category that best describes your creative work to help buyers find you."
};

// Junooni brand colors (same as in onboarding)
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

// Creator profile categories
const CREATOR_CATEGORIES = [
  "Art",
  "Music",
  "Home Decor",
  "Cinema",
  "Fashion",
  "Sports",
  "Comedy",
  "Gaming",
  "Influencer",
  "Other"
];

// Indian states for dropdown
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh"
  // Additional states would be here
];
// Create a separate PasswordChangeModal component outside of your main component
// Add this BEFORE your CreatorProfile component

// Define interfaces for type safety
interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

// Separate component for password change functionality
const PasswordChangeModal: React.FC<PasswordChangeModalProps> = React.memo(({
  isOpen,
  onClose,
  onSave,
  isLoading
}) => {
  // Local state for this component only
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  
  // Input refs
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  
  // Local handlers
  const handleCurrentPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    if (currentPasswordError) setCurrentPasswordError('');
  }, [currentPasswordError]);

  const handleNewPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (newPasswordError) setNewPasswordError('');
  }, [newPasswordError]);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) setConfirmPasswordError('');
  }, [confirmPasswordError]);
  
  // Validation function
  const validateForm = useCallback(() => {
    let isValid = true;
    
    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      isValid = false;
    }
    
    if (!newPassword) {
      setNewPasswordError("New password is required");
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
    
    return isValid;
  }, [currentPassword, newPassword, confirmPassword]);
  
  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      await onSave(currentPassword, newPassword);
      // Reset form on success - parent component will handle closing the modal
    } catch (error) {
      // Error handling is done by parent component
    }
  }, [currentPassword, newPassword, validateForm, onSave]);
  
  // Clear form when closed
  const handleClose = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    onClose();
  }, [onClose]);
  
  // Don't render anything if not open
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: BRAND.secondary }}>Change Password</h3>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Current Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                ref={currentPasswordRef}
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  currentPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ focusRing: BRAND.primary }}
                placeholder="Enter your current password"
              />
              {currentPasswordError && (
                <p className="mt-1 text-xs text-red-500">{currentPasswordError}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">New Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                ref={newPasswordRef}
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  newPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ focusRing: BRAND.primary }}
                placeholder="Enter new password"
              />
              {newPasswordError && (
                <p className="mt-1 text-xs text-red-500">{newPasswordError}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium">Confirm New Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                ref={confirmPasswordRef}
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ focusRing: BRAND.primary }}
                placeholder="Confirm new password"
              />
              {confirmPasswordError && (
                <p className="mt-1 text-xs text-red-500">{confirmPasswordError}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          
          <Button
            className="flex items-center gap-1"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
              color: 'white'
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 mr-1 border-2 border-white rounded-full animate-spin border-b-transparent" />
            ) : null}
            <span>Change Password</span>
          </Button>
        </div>
      </div>
    </div>
  );
});
export default function CreatorProfile() {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({
    profile: false,
    business: false,
    banking: false
  });
  const [showBankDetails, setShowBankDetails] = useState(false);
const [isUploadingImage, setIsUploadingImage] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
 const [nameEditMode, setNameEditMode] = useState<{
    firstName: boolean;
    lastName: boolean;
  }>({
    firstName: false,
    lastName: false
  });
// Inside your CreatorProfile component, replace the existing showPasswordModal state and handlers
// with these simplified versions that work with the separate component

// At the top of your component with other state declarations:
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);

// Password reset functionality - send link to email instead of modal
const [isSendingResetLink, setIsSendingResetLink] = useState(false);

// Function to send password reset link to user's email
const sendPasswordResetLink = useCallback(async () => {
  setIsSendingResetLink(true);
  
  try {
    // Get admin email from vendor data
    const adminEmail = vendorData?.vendor?.admins?.[0]?.email;
    
    if (!adminEmail) {
      throw new Error("Email address not found in your profile");
    }
    
    //console.log('Sending password reset link to:', adminEmail);
    
    // Send request to forgot password endpoint
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: adminEmail
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send reset link");
    }
    
    // Show success message
    toast({
      title: "Reset Link Sent",
      description: `A password reset link has been sent to ${adminEmail}. Please check your email and click the link to change your password.`,
    });
    
  } catch (error) {
    //console.error('Error sending reset link:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to send password reset link. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSendingResetLink(false);
  }
}, [vendorData, toast]);

// Add this function to handle password changes:
const handlePasswordSave = useCallback(async (currentPassword: string, newPassword: string) => {
  setIsChangingPassword(true);
  
  try {
    const token = localStorage.getItem('vendorToken');

    //console.log("token", token);
    // Get admin email from vendor data
    const adminEmail = vendorData?.vendor?.admins?.[0]?.email;
    
    if (!adminEmail) {
      throw new Error("Admin email not found");
    }
    
    // Create payload with email and new password as required by the new endpoint
    const payload = {
      email: adminEmail,
      password: newPassword
    };
    
    //console.log('Sending password update payload:', payload);
    
    // Use the new auth/vendor/emailpass/update endpoint
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/auth/vendor/emailpass/update`, {
      method: 'POST',  // Use POST as specified in the curl example
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
    }
    
    // Close modal on success
    setShowPasswordModal(false);
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  } catch (error) {
    //console.error('Error changing password:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to change your password. Please try again.",
      variant: "destructive",
    });
    throw error; // Re-throw so the modal component can handle it
  } finally {
    setIsChangingPassword(false);
  }
}, [vendorData, toast]);

  // Add this useEffect near the top of your component, right after your state declarations
  useEffect(() => {
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('vendorToken');
  
  // If no token is found, redirect to sign-in page
  if (!token) {
    // Show a toast notification
    toast({
      title: "Authentication Required",
      description: "Please sign in to access your profile.",
      variant: "destructive",
    });
    
    // Redirect to sign-in page
    navigate({ to: '/sign-in' });
    return;
  }
}, []); // Empty dependency array means this runs once when component mounts
  // Fetch vendor data when component mounts
  useEffect(() => {
  const fetchVendorData = async () => {
  try {
    const token = localStorage.getItem('vendorToken');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your profile.",
        variant: "destructive",
      });
      navigate({ to: '/sign-in' });
      return;
    }
    
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      //console.log("Vendor profile not found. Redirecting to onboarding page.");
      window.location.href = '/onboarding?step=basic-info';
      return;
    }
    
    const data = await response.json();
    //console.log('📥 Initial fetch response:', data);
    
    // Handle array response structure for initial fetch too
    if (data.vendor && Array.isArray(data.vendor) && data.vendor.length > 0) {
      //console.log('✅ Initial fetch: Converting array to object structure');
      const correctedData = {
        vendor: data.vendor[0],
        message: data.message
      };
      setVendorData(correctedData);
    } else if (data.vendor && !Array.isArray(data.vendor)) {
      //console.log('✅ Initial fetch: Vendor already in object format');
      setVendorData(data);
    } else {
      //console.log("Vendor data empty. Redirecting to onboarding page.");
      window.location.href = '/onboarding?step=basic-info';
      return;
    }
    
  } catch (error) {
    //console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile data. Please try again.",
        variant: "destructive",
      });
        // For demo purposes - use sample data if API fails
        const sampleData = {
          "id": "01JPX3QMRYAYMZ3KRPTA5FX43R",
          "handle": "craftsbypriyansh",
          "name": "Crafts By Priyansh",
          "logo": "http://localhost:9000/static/logo-craftsbypriyansh.webp",
          "coverphoto": "http://localhost:9000/static/cover-craftsbypriyansh.webp",
          "youtube": "craftsbypriyansh",
          "instagram": "craftsbypriyansh",
          "xtwitter": null,
          "othersocial": null,
          "phonenumber": "+91 9876543210",
          "GSTIN": "22AAAAA0000A1Z5",
          "gst_verification_status": "verified",
          "companyname": "Priyansh Handicrafts Pvt. Ltd.",
          "pan_number": "ABCDE1234F",
          "city": "Mumbai",
          "pincode": "400001",
          "state": "Maharashtra",
          "address": "Shop No. 42, Artisan Lane, Bandra West",
          "tan_number": "MUMB12345A",
          "bank_account_holder_name": "Priyansh Kumar",
          "bank_account_number": "1234567890123456",
          "bank_account_ifsc_code": "SBIN0001234",
          "bank_name": "State Bank of India",
          "bank_account_type": "Current",
          "cancelled_checkque": "http://localhost:9000/static/checkque-sample.jpg",
          "creator_bio": "Crafts By Priyansh specializes in handcrafted home decor made from sustainable materials. Each piece tells a story of Indian craftsmanship passed down through generations. Our mission is to bring traditional art forms into modern homes while supporting local artisans.",
          "creator_title": "Handcrafted Home Decor Artisan",
          "creator_category": "Home Decor",
          "created_at": "2024-11-15T12:43:57.726Z",
          "updated_at": "2025-03-21T19:43:57.726Z",
          "deleted_at": null
        };
       
        setVendorData(sampleData as VendorData);
      }
    };

    fetchVendorData();
  }, []);

  // Fixed saveVendorData function
// ULTIMATE FIX - Replace your saveVendorData function with this
const saveVendorData = async (section) => {
  if (!vendorData) {
    //console.error('❌ No vendor data available');
    return;
  }
  
  setIsSaving(true);
  
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Get current vendor data
    const currentVendor = vendorData.vendor;
    
    // Create COMPLETE payload with ALL required fields
    const completePayload = {
      // Basic Information
      name: currentVendor.name || '',
      handle: currentVendor.handle || '',
      
      // Creator Information  
      creator_bio: currentVendor.creator_bio || '',
      creator_title: currentVendor.creator_title || '',
      creator_category: currentVendor.creator_category || '',
      
      // Contact Information
      phonenumber: currentVendor.phonenumber || '',
      
      // Images
      logo: currentVendor.logo || '',
      coverphoto: currentVendor.coverphoto || '',
      
      // Social Media
      youtube: currentVendor.youtube || '',
      instagram: currentVendor.instagram || '',
      xtwitter: currentVendor.xtwitter || '',
      facebook: currentVendor.facebook || '',
      othersocial: currentVendor.othersocial || '',
      
      // Business Information
      companyname: currentVendor.companyname || '',
      GSTIN: currentVendor.GSTIN || '',
      gst_verification_status: currentVendor.gst_verification_status || 'pending',
      pan_number: currentVendor.pan_number || '',
      tan_number: currentVendor.tan_number || '',
      
      // Address
      address: currentVendor.address || '',
      city: currentVendor.city || '',
      state: currentVendor.state || '',
      pincode: currentVendor.pincode || '',
      
      // Banking
      bank_account_holder_name: currentVendor.bank_account_holder_name || '',
      bank_account_number: currentVendor.bank_account_number || '',
      bank_account_ifsc_code: currentVendor.bank_account_ifsc_code || '',
      bank_name: currentVendor.bank_name || '',
      bank_account_type: currentVendor.bank_account_type || 'Saving',
      cancelled_checkque: currentVendor.cancelled_checkque || ''
    };
    
    const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(completePayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      //console.error('❌ Backend error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    //console.log('✅ Raw backend response:', responseData);
    
    // CRITICAL FIX: Handle array response structure
    if (responseData.vendor && Array.isArray(responseData.vendor) && responseData.vendor.length > 0) {
      //console.log('✅ Backend returned vendor as array, extracting first element');
      
      // Convert array response to object structure that frontend expects
      const correctedResponse = {
        vendor: responseData.vendor[0], // Extract the first (and only) vendor object
        message: responseData.message
      };
      
      // console.log('✅ Corrected response structure:', {
      //   hasVendor: !!correctedResponse.vendor,
      //   vendorIsArray: Array.isArray(correctedResponse.vendor),
      //   name: correctedResponse.vendor.name,
      //   creator_title: correctedResponse.vendor.creator_title,
      //   logo: correctedResponse.vendor.logo ? 'SET' : 'MISSING',
      //   coverphoto: correctedResponse.vendor.coverphoto ? 'SET' : 'MISSING'
      // });
      
      // Update state with corrected structure
      setVendorData(correctedResponse);
      
    } else if (responseData.vendor && !Array.isArray(responseData.vendor)) {
      // Handle case where vendor is already an object (shouldn't happen based on your logs, but just in case)
      //console.log('✅ Backend returned vendor as object directly');
      setVendorData(responseData);
      
    } else {
      //console.error('❌ Unexpected response structure:', responseData);
      throw new Error('Server response has unexpected structure');
    }
    
    // Turn off edit mode
    setEditMode(prev => ({
      ...prev,
      [section]: false
    }));
    
    toast({
      title: "Changes Saved",
      description: `Your ${section} information has been updated successfully.`,
    });
    
  } catch (error) {
    //console.error('❌ Save operation failed:', error);
    toast({
      title: "Error",
      description: `Failed to save changes: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};

  //save admin data
  const saveAdminData = async (adminData) => {
    if (!vendorData?.vendor?.admins?.length) return;
    
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('vendorToken');
      const admin = vendorData.vendor.admins[0]; // Get the first admin
      const vendorId = vendorData.vendor.id; // Get the actual vendor ID
      
      // Create payload with only the fields we want to update
     const payload = {
        email: adminEmail,
        password: newPassword
      };
      
      //console.log('Sending admin update:', payload);
      
      // Use the actual vendor ID in the URL
      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/${vendorId}/admins`, {
        method: 'PUT', // or 'PATCH' depending on your API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      // Update local state with the new admin data
      setVendorData({
        ...vendorData,
        vendor: {
          ...vendorData.vendor,
          admins: [
            { ...admin, ...payload },
            ...vendorData.vendor.admins.slice(1)
          ]
        }
      });
      
      toast({
        title: "Profile Updated",
        description: "Your personal information has been updated successfully.",
      });
    } catch (error) {
      //console.error('Error saving admin data:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  // Update vendor data
 // Update vendor data function for the nested vendor structure
const updateVendorData = (field, value) => {
  //console.log(`🔄 Updating ${field} to:`, value);
  
  setVendorData(prevData => {
    if (!prevData) return prevData;
    
    const newData = {
      ...prevData,
      vendor: {
        ...prevData.vendor,
        [field]: value
      },
      updated_at: new Date().toISOString()
    };
    
    // console.log('📝 State updated. Current values:', {
    //   name: newData.vendor.name || 'EMPTY',
    //   creator_title: newData.vendor.creator_title || 'EMPTY', 
    //   creator_bio: newData.vendor.creator_bio || 'EMPTY',
    //   logo: newData.vendor.logo || 'EMPTY',
    //   coverphoto: newData.vendor.coverphoto || 'EMPTY',
    //   phonenumber: newData.vendor.phonenumber || 'EMPTY'
    // });
    
    return newData;
  });
};
  // Fixed uploadImageToServer function based on the working code
// Fix your uploadImageToServer function - change PUT to POST
const uploadImageToServer = async (file: File, type: 'logo' | 'coverphoto'): Promise<string> => {
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    //console.log(`🔄 Uploading ${type}:`, file.name, `(${(file.size / 1024).toFixed(1)}KB)`);

    const formData = new FormData();
    formData.append('files', file);

    try {
      let response;
      let uploadUrl = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/uploads`;
      
      //console.log(`📡 Attempting upload to: ${uploadUrl}`);
      
      response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      //console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        //console.log(`❌ Primary upload failed (${response.status}), trying alternatives...`);
        
        const alternativeEndpoints = [
          `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/upload`,
          `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendor/uploads`
        ];
        
        let uploadSucceeded = false;
        
        for (const altUrl of alternativeEndpoints) {
          try {
            //console.log(`🔄 Trying alternative endpoint: ${altUrl}`);
            
            const altResponse = await fetch(altUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
            
            if (altResponse.ok) {
              //console.log(`✅ Alternative upload succeeded: ${altUrl}`);
              response = altResponse;
              uploadSucceeded = true;
              break;
            } else {
              //console.log(`❌ Alternative ${altUrl} failed:`, altResponse.status);
            }
          } catch (altError) {
            //console.log(`❌ Alternative ${altUrl} error:`, altError.message);
          }
        }
        
        if (!uploadSucceeded) {
          const errorText = await response.text();
          //console.error('All upload endpoints failed:', errorText);
          
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || 'Failed to upload image';
          } catch {
            errorMessage = `Upload failed with status ${response.status}: ${errorText}`;
          }
          
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      //console.log('✅ Upload successful. Full response data:', JSON.stringify(data, null, 2));
      
      let fileUrl = null;
      
      if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        const fileData = data.files[0];
        //console.log('📁 File data structure:', JSON.stringify(fileData, null, 2));
        
        fileUrl = fileData.url || fileData.file_url || fileData.path || fileData.location;
        
        if (fileUrl && !fileUrl.startsWith('http')) {
          fileUrl = `${import.meta.env.VITE_MEDUSA_BACKEND_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
        }
      }
      else if (data.url) {
        fileUrl = data.url;
      } else if (data.imageUrl) {
        fileUrl = data.imageUrl;
      } else if (data.file_url) {
        fileUrl = data.file_url;
      } else if (data.data && data.data.url) {
        fileUrl = data.data.url;
      } else if (data.file && typeof data.file === 'object') {
        fileUrl = data.file.url || data.file.path;
      } else if (data.path) {
        fileUrl = data.path.startsWith('http') ? data.path : `${import.meta.env.VITE_MEDUSA_BACKEND_URL}${data.path}`;
      } else if (data.location) {
        fileUrl = data.location;
      } else if (data.uploadedUrls && data.uploadedUrls[type]) {
        fileUrl = data.uploadedUrls[type];
      } else if (typeof data === 'string' && data.startsWith('http')) {
        fileUrl = data;
      }
      
      if (fileUrl) {
        //console.log(`✅ Successfully extracted ${type} URL:`, fileUrl);
        return fileUrl;
      } else {
        //console.error('❌ Could not extract URL from response. Available keys:', Object.keys(data));
        //console.error('Full response:', data);
        throw new Error('Server response missing image URL');
      }

    } catch (error) {
      //console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

// Updated handleImageUpload function
const handleImageUpload = async (e, field) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast({
      title: "Invalid File Type",
      description: "Please upload a JPG, PNG, or WebP image.",
      variant: "destructive",
    });
    return;
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    toast({
      title: "File Too Large",
      description: "Please upload an image smaller than 5MB.",
      variant: "destructive",
    });
    return;
  }

  setIsUploadingImage(true);

  try {
    //console.log(`🔄 Starting ${field} upload...`);
    
    // Step 1: Upload file to server and get the URL
    const imageUrl = await uploadImageToServer(file, field);
    //console.log(`✅ Image uploaded successfully: ${imageUrl}`);
    
    // Step 2: ONLY update the image field in local state, don't save to backend yet
    updateVendorData(field, imageUrl);
    
    //console.log(`🔄 Updated local state for ${field}. Will save when user clicks "Save Changes"`);
    
    toast({
      title: "Image Uploaded",
      description: `Your ${field === 'logo' ? 'logo' : 'cover photo'} has been uploaded. Click "Save Changes" to save all your profile updates.`,
    });
    
  } catch (error) {
    //console.error(`Error uploading ${field}:`, error);
    toast({
      title: "Upload Failed",
      description: error instanceof Error ? error.message : `Failed to upload your ${field === 'logo' ? 'logo' : 'cover photo'}. Please try again.`,
      variant: "destructive",
    });
  } finally {
    setIsUploadingImage(false);
    
    // Clear the input so the same file can be selected again if needed
    if (e.target) {
      e.target.value = '';
    }
  }
};

    //console.log('vendor data:', vendorData);

//     const updatedData = await response.json();
// //console.log('🔍 FULL RESPONSE DATA:', JSON.stringify(updatedData, null, 2));
// //console.log('🔍 COVERPHOTO IN RESPONSE:', updatedData.vendor?.coverphoto);
// //console.log('🔍 EXPECTED URL:', imageUrl);
    // Helper function to safely get the vendor email
const getVendorEmail = (vendorData) => {
  // First check if the email is in the first admin's data
  if (vendorData?.vendor?.admins?.length > 0 && vendorData.vendor.admins[0]?.email) {
    return vendorData.vendor.admins[0].email;
  }
  
  // If there's no admin email, check if there's a vendor email directly
  if (vendorData?.vendor?.email) {
    return vendorData.vendor.email;
  }
  
  // Fallback value if no email is found
  return 'No email available';
};
// Add this function with your other functions
const openChatwoot = () => {
  // Check if the Chatwoot API is available
  if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
    // Use the confirmed working method
    window.$chatwoot.toggle();
  } else {
    //console.log('Chatwoot API not ready yet, waiting...');
    
    // Notify the user
    toast({
      title: "Opening Support Chat",
      description: "Please wait a moment while we connect you to support...",
    });
    
    // Try again after a short delay to allow for Chatwoot initialization
    setTimeout(() => {
      if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
        window.$chatwoot.toggle();
      } else {
        //console.error('Chatwoot API still not available after delay');
        toast({
          title: "Support Chat Issue",
          description: "The support chat couldn't be opened. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    }, 1500); // 1.5 second delay
  }
};
  // If vendor data is not loaded yet, show loading state
  if (!vendorData) {
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
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            {/* Mobile Layout */}
            <div className="flex items-center justify-between w-full lg:hidden">
              {/* Hamburger Menu Button - Left */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <IconMenu2 className="w-6 h-6" style={{ color: BRAND.primary }} />
              </button>

              {/* Logo - Center */}
              <div className="flex justify-center flex-1">
                <Link to="/dashboard">
                  <img src={Junoonilogo} alt="Junooni Logo" className="h-8" />
                </Link>
              </div>

              {/* Profile Dropdown - Right */}
              <ProfileDropdown />
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center lg:w-full lg:justify-between">
              <div className="flex items-center">
                <div
                  className="mr-2 text-2xl font-bold"
                  style={{ color: BRAND.primary }}
                >
                  <Link to="/dashboard">
                    <img src={Junoonilogo} alt="Junooni Logo" className="h-8" />
                  </Link>
                </div>
                <Separator orientation='vertical' className='h-6 ml-2' />
                <div className="flex flex-col items-start ml-4 text-xs font-medium leading-tight text-muted-foreground">
                  <span className="text-xs">Creator</span>
                  <span className="text-xs">Studio</span>
                </div>
              </div>
            
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="hidden md:flex"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="hidden md:flex"
                  onClick={() => window.location.href = '/products'}
                >
                  Products
                </Button>
                <Button
                  variant="ghost"
                  className="hidden md:flex"
                  onClick={() => window.location.href = '/orders'}
                >
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  className="hidden md:flex"
                  onClick={() => window.location.href = '/help-center'}
                >
                  Help
                </Button>
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between flex-shrink-0 p-6 bg-gradient-to-r from-orange-600 to-red-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Account Settings</h2>
                  <p className="text-sm text-white/80">Manage your creator profile</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 transition-colors rounded-full hover:bg-white/20"
                >
                  <IconX className="w-6 h-6 text-white" />
                </button>
              </div>
            
              {/* Navigation */}
              <div className="flex-1 px-6 py-8">
                <div className="space-y-3">
                  {/* Profile Information */}
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-4 py-4 rounded-lg text-left transition-all duration-200 hover:bg-gray-50",
                      activeTab === "profile" 
                        ? "bg-orange-50 text-orange-800 border-l-4 border-orange-600" 
                        : "text-gray-700 hover:text-orange-700"
                    )}
                  >
                    <IconUser className="flex-shrink-0 w-5 h-5 mr-4" />
                    <span className="font-medium">Profile Information</span>
                  </button>
                  
                  {/* Business Details */}
                  <button
                    onClick={() => {
                      setActiveTab("business");
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-4 py-4 rounded-lg text-left transition-all duration-200 hover:bg-gray-50",
                      activeTab === "business" 
                        ? "bg-orange-50 text-orange-800 border-l-4 border-orange-600" 
                        : "text-gray-700 hover:text-orange-700"
                    )}
                  >
                    <IconBuilding className="flex-shrink-0 w-5 h-5 mr-4" />
                    <span className="font-medium">Business Details</span>
                  </button>
                  
                  {/* Banking Details */}
                  <button
                    onClick={() => {
                      setActiveTab("banking");
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-4 py-4 rounded-lg text-left transition-all duration-200 hover:bg-gray-50",
                      activeTab === "banking" 
                        ? "bg-orange-50 text-orange-800 border-l-4 border-orange-600" 
                        : "text-gray-700 hover:text-orange-700"
                    )}
                  >
                    <IconCreditCard className="flex-shrink-0 w-5 h-5 mr-4" />
                    <span className="font-medium">Banking Details</span>
                  </button>
                  
                  {/* Account Settings */}
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-4 py-4 rounded-lg text-left transition-all duration-200 hover:bg-gray-50",
                      activeTab === "settings" 
                        ? "bg-orange-50 text-orange-800 border-l-4 border-orange-600" 
                        : "text-gray-700 hover:text-orange-700"
                    )}
                  >
                    <IconSettings className="flex-shrink-0 w-5 h-5 mr-4" />
                    <span className="font-medium">Account Settings</span>
                  </button>

                  {/* Separator */}
                  <div className="my-6 border-t border-gray-200"></div>
                    
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      // Clear authentication tokens
                      localStorage.removeItem('vendorToken');
                      localStorage.removeItem('vendorEmail');
                      
                      // Redirect to sign-in page
                      window.location.href = '/sign-in';
                    }}
                    className="flex items-center w-full px-4 py-4 text-left text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50"
                  >
                    <IconLogout className="flex-shrink-0 w-5 h-5 mr-4" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            
              {/* Support Section */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
                <div className="p-4 border border-orange-200 rounded-xl bg-orange-50">
                  <p className="mb-2 text-sm font-medium text-orange-800">
                    Need help updating your profile?
                  </p>
                  <button
                    onClick={() => {
                      openChatwoot();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-orange-600 underline transition-colors hover:text-orange-700"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
     
      {/* Main content */}
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar with navigation */}
          <div className="hidden w-full lg:block lg:w-64 shrink-0">
            <div className="overflow-hidden bg-white border border-gray-100 shadow-lg lg:sticky lg:top-24 rounded-xl min-h-[455px]">
              <div className="p-4 bg-gradient-to-r from-orange-600 to-red-800">
                <h2 className="text-lg font-bold text-white">Account Settings</h2>
                <p className="text-sm text-white/80">Manage your creator profile</p>
              </div>
             
              <nav className="px-16 py-16 mt-14">
                <Tabs defaultValue="products" className="space-y-4">
                    <TabsList className="flex flex-col w-full space-y-2 bg-transparent">
                        <TabsTrigger
                            value="profile"
                            onClick={() => setActiveTab("profile")}
                            className={cn(
                            "justify-start py-2 px-3 h-auto data-[state=active]:shadow-none",
                            activeTab === "profile" ? "bg-orange-50 text-orange-800" : ""
                            )}
                            style={{
                            borderLeft: activeTab === "profile" ? `3px solid ${BRAND.primary}` : '3px solid transparent',
                            }}
                        >
                            <div className="flex items-center">
                              <IconUser className="w-12 h-6" />
                              <span className="text-base">Profile Information</span>
                            </div>
                        </TabsTrigger>
                        
                        <TabsTrigger
                            value="business"
                            onClick={() => setActiveTab("business")}
                            className={cn(
                            "justify-start py-2 px-3 h-auto data-[state=active]:shadow-none",
                            activeTab === "business" ? "bg-orange-50 text-orange-800" : ""
                            )}
                            style={{
                            borderLeft: activeTab === "business" ? `3px solid ${BRAND.primary}` : '3px solid transparent',
                            }}
                        >
                          <div className="flex items-center">
                            <IconBuilding className="w-12 h-6 " />
                            <span className="mr-4 text-base">Business Details</span>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger
                            value="banking"
                            onClick={() => setActiveTab("banking")}
                            className={cn(
                            "justify-start py-2 px-3 h-auto data-[state=active]:shadow-none",
                            activeTab === "banking" ? "bg-orange-50 text-orange-800" : ""
                            )}
                            style={{
                            borderLeft: activeTab === "banking" ? `3px solid ${BRAND.primary}` : '3px solid transparent',
                            }}
                        >
                          <div className="flex items-center">
                            <IconCreditCard className="w-12 h-6 " />
                            <span className="mr-6 text-base">Banking Details</span>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger
                            value="settings"
                            onClick={() => setActiveTab("settings")}
                            className={cn(
                            "justify-start py-2 px-3 h-auto data-[state=active]:shadow-none text-base",
                            activeTab === "settings" ? "bg-orange-50 text-orange-800" : ""
                            )}
                            style={{
                            borderLeft: activeTab === "settings" ? `3px solid ${BRAND.primary}` : '3px solid transparent',
                            }}
                        >
                          <div className="flex items-center">
                            <IconSettings className="w-12 h-6 " />
                            <span className="mr-3 text-base">Account Settings</span>
                          </div>
                        </TabsTrigger>

                        {/* Separator before logout button */}
                        <div className="my-2 border-t border-gray-200"></div>
                        
                        {/* Logout Button */}
                        <TabsTrigger
                            value="logout"
                            onClick={() => {
                                // Clear authentication tokens
                                localStorage.removeItem('vendorToken');
                                localStorage.removeItem('vendorEmail');
                                
                                // Redirect to sign-in page
                                window.location.href = '/sign-in';
                            }}
                            className="justify-start h-auto px-3 py-2 text-red-600 hover:bg-red-50"
                            style={{
                                borderLeft: '3px solid transparent',
                            }}
                        >
                          <div className="flex items-center">
                            <IconLogout className="w-12 h-6" />
                            <span className="mr-4 text-base">Log Out</span>
                          </div>
                        </TabsTrigger>

                    </TabsList>
                </Tabs>
              </nav>
             
              <div className="p-4 mt-8 border-t border-gray-100">
                <div className="px-4 py-3 text-sm border border-orange-100 rounded-lg bg-orange-50">
                  <p className="text-orange-800">Need help updating your profile?</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 mt-1 text-sm"
                    style={{ color: BRAND.primary }}
                    onClick={openChatwoot}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
         
          {/* Main content area */}
          <div className="flex-1">
            <Tabs value={activeTab} className="w-full">
              {/* Profile Information Tab */}
              <TabsContent value="profile" className="mt-0">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader
                    className="px-2 py-3 pb-2 border-b md:px-6 md:py-4"
                    style={{ borderColor: `${BRAND.primary}11` }}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      {/* Left side: Icon + Title */}
                      <div className="flex items-center">
                        <div
                          className="p-3 mr-4 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                          }}
                        >
                          <IconUser className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle
                            className="text-2xl font-bold"
                            style={{ color: BRAND.secondary }}
                          >
                            Profile Information
                          </CardTitle>
                          <CardDescription
                            className="text-base"
                            style={{ color: BRAND.textSecondary }}
                          >
                            Manage how customers see you on the marketplace
                          </CardDescription>
                        </div>
                      </div>

                      {/* Right side: Buttons */}
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <Button
                          variant="outline"
                          className="flex items-center gap-1"
                          style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                          onClick={() => (window.location.href = "/dashboard")}
                        >
                          <span>Back to dashboard</span>
                        </Button>

                        {!editMode.profile ? (
                          <Button
                            variant="outline"
                            className="flex items-center gap-1"
                            style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                            onClick={() => setEditMode({ ...editMode, profile: true })}
                          >
                            <IconEdit className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => setEditMode({ ...editMode, profile: false })}
                            >
                              <IconX className="w-4 h-4" />
                              <span>Cancel</span>
                            </Button>

                            <Button
                              className="flex items-center gap-1"
                              style={{
                                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                                color: "white",
                              }}
                              onClick={() => saveVendorData("profile")}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <div className="w-4 h-4 mr-1 border-2 border-white rounded-full animate-spin border-b-transparent" />
                              ) : (
                                <IconDeviceFloppy className="w-4 h-4" />
                              )}
                              <span>Save Changes</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                 
                  <CardContent className="px-2 py-3 pt-6 pb-8 md:px-6 md:py-4">
                    {/* Brand display with cover photo and logo */}
                    <div className="mb-8">
                      <div className="relative h-64 bg-gray-100 rounded-xl">
                        {vendorData.vendor.coverphoto ? (
                          <img
                            src={vendorData.vendor.coverphoto}
                            alt="Cover Photo"
                            className="object-cover w-full h-full"
                            style={{ 
                              objectPosition: 'center center',
                              aspectRatio: '16/9'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 z-10 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <IconCamera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                              <p>No cover photo</p>
                              <p className="text-sm">Recommended size: 1600x900px</p>
                            </div>
                          </div>
                        )}
                       
                        {editMode.profile && (
                          <div className="absolute bottom-4 right-4 z-20">
                            <Button
                              className="flex items-center gap-1 text-white bg-black/50 hover:bg-black/70"
                              onClick={() => coverPhotoInputRef.current?.click()}
                              disabled={isUploadingImage}
                            >
                              {isUploadingImage ? (
                                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-b-transparent" />
                              ) : (
                                <IconCamera className="w-4 h-4" />
                              )}
                              <span>
                                {isUploadingImage 
                                  ? 'Uploading...' 
                                  : (vendorData.vendor.coverphoto ? 'Change Cover' : 'Add Cover')
                                }
                              </span>
                            </Button>
                            <input
                              type="file"
                              ref={coverPhotoInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={e => handleImageUpload(e, 'coverphoto')}
                              disabled={isUploadingImage}
                            />
                          </div>
                        )}
                       
                        {vendorData.vendor.logo && (
                        <div className="absolute z-1 -bottom-12 left-6">
                          <div className="relative">
                            <div className="w-24 h-24 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
                              <img
                                src={vendorData.vendor.logo}
                                alt="Logo"
                                className="object-cover w-full h-full"
                              />
                            </div>

                            {editMode.profile && (
                              <div className="absolute bottom-0 right-0">
                                <button
                                  className="p-2 text-white bg-orange-600 rounded-full shadow-md disabled:opacity-50"
                                  onClick={() => logoInputRef.current?.click()}
                                  disabled={isUploadingImage}
                                >
                                  {isUploadingImage ? (
                                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-b-transparent" />
                                  ) : (
                                    <IconCamera className="w-4 h-4" />
                                  )}
                                </button>
                                <input
                                  type="file"
                                  ref={logoInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'logo')}
                                  disabled={isUploadingImage}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      </div>
                     
                      <div className="mt-16 mb-6">
                        {editMode.profile ? (
                          <div className="z-10 space-y-4">
                            <div>
                              <label className="block mb-1 text-sm font-medium">Brand Name <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={vendorData.vendor.name}
                                onChange={(e) => updateVendorData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="Your brand name"
                              />
                            </div>
                           
                            <div>
                              <label className="block mb-1 text-sm font-medium">Creator Title <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={vendorData.vendor.creator_title || ''}
                                onChange={(e) => updateVendorData('creator_title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="e.g. Handcrafted Jewelry Artisan"
                              />
                              <p className="mt-1 text-xs text-gray-500">A short phrase describing what you create (50 chars max)</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h1 className="text-2xl font-bold">{vendorData.vendor.name}</h1>
                            <p className="text-gray-600 text-md">{vendorData.vendor.creator_title || 'No creator title set'}</p>
                          </div>
                        )}
                      </div>
                     
                      <Separator className="my-6" />
                     
                      {/* Creator Bio */}
                      <div className="mb-6">
                        <h2 className="mb-3 text-lg font-semibold">About</h2>
                       
                        {editMode.profile ? (
                          <div>
                            <label className="block mb-1 text-sm font-medium">Creator Bio <span className="text-red-500">*</span></label>
                            <textarea
                              value={vendorData.vendor.creator_bio || ''}
                              onChange={(e) => updateVendorData('creator_bio', e.target.value)}
                              rows={5}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2"
                              style={{ focusRing: BRAND.primary }}
                              placeholder="Tell customers about yourself, your creative journey, and what makes your products special..."
                            />
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">Minimum 100 characters recommended</p>
                              <p className="text-xs text-gray-500">
                                {vendorData.vendor.creator_bio ? vendorData.vendor.creator_bio.length : 0}/500
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="prose-sm prose max-w-none">
                            <p>{vendorData.vendor.creator_bio || 'No bio information provided.'}</p>
                          </div>
                        )}
                      </div>
                     
                      {/* Creator Category */}
                      <div className="mb-6">
                        <h2 className="mb-3 text-lg font-semibold">Category</h2>
                       
                        {editMode.profile ? (
                          <div>
                            <label className="block mb-1 text-sm font-medium">Creator Category <span className="text-red-500">*</span></label>
                            <select
                              value={vendorData.vendor.creator_category || ''}
                              onChange={(e) => updateVendorData('creator_category', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none"
                            >
                              <option value="">Select Category</option>
                              {CREATOR_CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Select the category that best describes your creative work</p>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                              {vendorData.vendor.creator_category || 'No category selected'}
                            </span>
                          </div>
                        )}
                      </div>
                     
                      <Separator className="my-6" />
                     
                      {/* Contact Information */}
                      <div className="mb-6">
                        <h2 className="mb-3 text-lg font-semibold">Contact Information</h2>
                       
                        {editMode.profile ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1 text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                              <input
                                type="tel"
                                value={vendorData.vendor.phonenumber || ''}
                                onChange={(e) => updateVendorData('phonenumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="+91 9876543210"
                              />
                            </div>
                           
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium">Instagram</label>
                                <div className="flex">
                                  <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                    <span className="text-sm text-gray-500">instagram.com/</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={vendorData.vendor.instagram || ''}
                                    onChange={(e) => updateVendorData('instagram', e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2"
                                    style={{ focusRing: BRAND.primary }}
                                    placeholder="yourbrand"
                                  />
                                </div>
                              </div>
                             
                              <div>
                                <label className="block mb-1 text-sm font-medium">YouTube</label>
                                <div className="flex">
                                  <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                    <span className="text-sm text-gray-500">youtube.com/</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={vendorData.vendor.youtube || ''}
                                    onChange={(e) => updateVendorData('youtube', e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none"
                                    placeholder="@yourchannel"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block mb-1 text-sm font-medium">Twitter</label>
                                <div className="flex">
                                  <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                    <span className="text-sm text-gray-500">twitter.com/</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={vendorData.vendor.xtwitter || ''}
                                    onChange={(e) => updateVendorData('xtwitter', e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none"
                                    placeholder="@yourhandle"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block mb-1 text-sm font-medium">Facebook</label>
                                <div className="flex">
                                  <div className="flex items-center justify-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                                    <span className="text-sm text-gray-500">facebook.com/</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={vendorData.vendor.facebook || ''}
                                    onChange={(e) => updateVendorData('facebook', e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none"
                                    placeholder="@yourhandle"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <IconPhone className="w-5 h-5 text-gray-400" />
                              <span>{vendorData.vendor.phonenumber || 'No phone number provided'}</span>
                            </div>
                           
                            {vendorData.vendor.instagram && (
                              <div className="flex items-center gap-2">
                                <IconBrandInstagram className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`https://instagram.com/${vendorData.vendor.instagram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: BRAND.primary }}
                                >
                                  @{vendorData.vendor.instagram}
                                </a>
                              </div>
                            )}
                           
                            {vendorData.vendor.youtube && (
                              <div className="flex items-center gap-2">
                                <IconBrandYoutube className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`https://youtube.com/${vendorData.vendor.youtube}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: BRAND.primary }}
                                >
                                  {vendorData.vendor.youtube}
                                </a>
                              </div>
                            )}

                            {vendorData.vendor.xtwitter && (
                              <div className="flex items-center gap-2">
                                <IconBrandX className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`https://youtube.com/${vendorData.vendor.xtwitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: BRAND.primary }}
                                >
                                  {vendorData.vendor.xtwitter}
                                </a>
                              </div>
                            )}

                            {vendorData.vendor.facebook && (
                              <div className="flex items-center gap-2">
                                <IconBrandFacebook className="w-5 h-5 text-gray-400" />
                                <a
                                  href={`https://youtube.com/${vendorData.vendor.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: BRAND.primary }}
                                >
                                  {vendorData.vendor.facebook}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
             
              {/* Business Details Tab */}
              <TabsContent value="business" className="mt-0">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                          <IconBuilding className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                            Business Details
                          </CardTitle>
                          <CardDescription className="text-base" style={{ color: BRAND.textSecondary }}>
                            Company and tax information
                          </CardDescription>
                        </div>
                      </div>
                     
                      {!editMode.business ? (
                        <Button
                          variant="outline"
                          className="flex items-center gap-1"
                          style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                          onClick={() => setEditMode({ ...editMode, business: true })}
                        >
                          <IconEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setEditMode({ ...editMode, business: false })}
                          >
                            <IconX className="w-4 h-4" />
                            <span>Cancel</span>
                          </Button>
                         
                          <Button
                            className="flex items-center gap-1"
                            style={{
                              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                              color: 'white'
                            }}
                            onClick={() => saveVendorData('business')}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 mr-1 border-2 border-white rounded-full animate-spin border-b-transparent" />
                            ) : (
                              <IconDeviceFloppy className="w-4 h-4" />
                            )}
                            <span>Save Changes</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                 
                  <CardContent className="pt-6 pb-8">
                    <div className="space-y-6">
                      {/* Company Information */}
                      <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold">Company Information</h2>
                       
                        {editMode.business ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1 text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={vendorData.vendor.companyname || ''}
                                onChange={(e) => updateVendorData('companyname', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="Your registered company name"
                              />
                            </div>
                           
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <div className="flex items-center mb-1">
                                  <label className="block text-sm font-medium">GSTIN <span className="text-red-500">*</span></label>
                                  <div className="relative ml-1 group">
                                    <IconHelpCircle className="w-4 h-4 text-gray-400" />
                                    <div className="absolute left-0 z-10 px-2 py-1 -mt-1 text-xs text-white transition-opacity bg-gray-800 rounded-lg opacity-0 pointer-events-none w-60 group-hover:opacity-100">
                                      {FIELD_EXPLANATIONS.GSTIN}
                                    </div>
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  value={vendorData.vendor.GSTIN || ''}
                                  onChange={(e) => updateVendorData('GSTIN', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
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
                                <div className="flex items-center mb-1">
                                  <label className="block text-sm font-medium">PAN Number <span className="text-red-500">*</span></label>
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
                                  onChange={(e) => updateVendorData('pan_number', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="ABCDE1234F"
                                />
                              </div>

                              <div>
                                <div className="flex items-center mb-1">
                                  <label className="block text-sm font-medium">TAN Number <span className="text-red-500">*</span></label>
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
                                  onChange={(e) => updateVendorData('tan_number', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="ABCDE1234F"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                              <p>{vendorData.vendor.companyname || 'Not provided'}</p>
                            </div>
                           
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">GSTIN</h3>
                              <div className="flex items-center">
                                <p className="mr-2">{vendorData.vendor.GSTIN || 'Not provided'}</p>
                                {vendorData.vendor.GSTIN && vendorData.vendor.gst_verification_status === "verified" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <IconCircleCheck className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                                {vendorData.vendor.GSTIN && vendorData.vendor.gst_verification_status === "pending" && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    <IconAlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                           
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">PAN Number</h3>
                              <p>{vendorData.vendor.pan_number || 'Not provided'}</p>
                            </div>
                           
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">TAN Number</h3>
                              <p>{vendorData.vendor.tan_number || 'Not provided'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                     
                      <Separator className="my-6" />
                     
                      {/* Address Information */}
                      <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold">Address Information</h2>
                       
                        {editMode.business ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1 text-sm font-medium">Address</label>
                              <input
                                type="text"
                                value={vendorData.vendor.address || ''}
                                onChange={(e) => updateVendorData('address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="Street address"
                              />
                            </div>
                           
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div>
                                <label className="block mb-1 text-sm font-medium">City</label>
                                <input
                                  type="text"
                                  value={vendorData.vendor.city || ''}
                                  onChange={(e) => updateVendorData('city', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="City"
                                />
                              </div>
                             
                              <div>
                                <label className="block mb-1 text-sm font-medium">State</label>
                                <select
                                  value={vendorData.vendor.state || ''}
                                  onChange={(e) => updateVendorData('state', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none"
                                >
                                  <option value="">Select State</option>
                                  {INDIAN_STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                  ))}
                                </select>
                              </div>
                             
                              <div>
                                <label className="block mb-1 text-sm font-medium">PIN Code</label>
                                <input
                                  type="text"
                                  value={vendorData.vendor.pincode || ''}
                                  onChange={(e) => updateVendorData('pincode', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="PIN Code"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {vendorData.vendor.address && vendorData.vendor.city ? (
                              <div className="flex items-start">
                                <IconMapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                                <p>
                                  {vendorData.vendor.address}, {vendorData.vendor.city}, {vendorData.vendor.state || ''} {vendorData.vendor.pincode || ''}
                                </p>
                              </div>
                            ) : (
                              <p className="italic text-gray-500">No address information provided</p>
                            )}
                          </div>
                        )}
                      </div>
                     
                      {!editMode.business && (
                        <Alert>
                          <IconShield className="w-4 h-4" />
                          <AlertTitle>Secure Information</AlertTitle>
                          <AlertDescription>
                            Your business information is securely stored and only used for verification and compliance purposes.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
             
              {/* Banking Details Tab */}
              <TabsContent value="banking" className="mt-0">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                          <IconCreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                            Banking Details
                          </CardTitle>
                          <CardDescription className="text-base" style={{ color: BRAND.textSecondary }}>
                            Manage your payment account information
                          </CardDescription>
                        </div>
                      </div>
                     
                      {!editMode.banking ? (
                        <Button
                          variant="outline"
                          className="flex items-center gap-1"
                          style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                          onClick={() => setEditMode({ ...editMode, banking: true })}
                        >
                          <IconEdit className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setEditMode({ ...editMode, banking: false })}
                          >
                            <IconX className="w-4 h-4" />
                            <span>Cancel</span>
                          </Button>
                         
                          <Button
                            className="flex items-center gap-1"
                            style={{
                              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                              color: 'white'
                            }}
                            onClick={() => saveVendorData('banking')}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 mr-1 border-2 border-white rounded-full animate-spin border-b-transparent" />
                            ) : (
                              <IconDeviceFloppy className="w-4 h-4" />
                            )}
                            <span>Save Changes</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                 
                  <CardContent className="pt-6 pb-8">
                    <div className="space-y-6">
                      {/* Banking Information */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold">Banking Information</h2>
                         
                          {!editMode.banking && (
                            <Button
                              variant="ghost"
                              className="flex items-center h-8 gap-1 text-xs"
                              onClick={() => setShowBankDetails(!showBankDetails)}
                            >
                              {showBankDetails ? (
                                <>
                                  <IconEyeOff className="w-4 h-4 mr-1" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <IconEye className="w-4 h-4 mr-1" />
                                  Show Details
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                       
                        {editMode.banking ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1 text-sm font-medium">Account Holder Name <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={vendorData.vendor.bank_account_holder_name || ''}
                                onChange={(e) => updateVendorData('bank_account_holder_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ focusRing: BRAND.primary }}
                                placeholder="Name as per bank records"
                              />
                            </div>
                           
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium">Account Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={vendorData.vendor.bank_account_number || ''}
                                    onChange={(e) => updateVendorData('bank_account_number', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                    style={{ focusRing: BRAND.primary }}
                                    placeholder="Your bank account number"
                                  />
                                  <button className="absolute transform -translate-y-1/2 right-2 top-1/2">
                                    <IconEye className="w-5 h-5 text-gray-400" />
                                  </button>
                                </div>
                              </div>
                             
                              <div>
                                <div className="flex items-center mb-1">
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
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="e.g. SBIN0001234"
                                />
                              </div>
                            </div>
                           
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium">Bank Name</label>
                                <input
                                  type="text"
                                  value={vendorData.vendor.bank_name || ''}
                                  onChange={(e) => updateVendorData('bank_name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ focusRing: BRAND.primary }}
                                  placeholder="e.g. State Bank of India"
                                />
                              </div>
                             
                              <div>
                                <label className="block mb-1 text-sm font-medium">Account Type</label>
                                <div className="flex space-x-4">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      checked={vendorData.vendor.bank_account_type === "Saving"}
                                      onChange={() => updateVendorData('bank_account_type', "Saving")}
                                      className="w-4 h-4 mr-2"
                                      style={{ accentColor: BRAND.primary }}
                                    />
                                    <span>Savings</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      checked={vendorData.vendor.bank_account_type === "Current"}
                                      onChange={() => updateVendorData('bank_account_type', "Current")}
                                      className="w-4 h-4 mr-2"
                                      style={{ accentColor: BRAND.primary }}
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
                                style={{ borderColor: vendorData.vendor.cancelled_checkque ? BRAND.success : 'rgb(229, 231, 235)' }}
                              >
                                {vendorData.vendor.cancelled_checkque ? (
                                  <div className="relative w-full h-full">
                                    <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                                      <div className="flex items-center p-3 bg-white rounded-lg shadow-md">
                                        <IconFileText className="w-5 h-5 mr-2 text-green-500" />
                                        <span className="text-sm font-medium">cheque_scan.jpg</span>
                                      </div>
                                    </div>
                                    <div className="absolute p-1 bg-white rounded-full shadow-md top-2 right-2">
                                      <IconX className="w-4 h-4 text-gray-500" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 text-center">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                                      <IconFileText className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium">Drop your file here or <span style={{ color: BRAND.primary }}>browse</span></p>
                                    <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, PDF (Max: 5MB)</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {showBankDetails ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Account Holder Name</h3>
                                  <p>{vendorData.vendor.bank_account_holder_name || 'Not provided'}</p>
                                </div>
                               
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Bank Name</h3>
                                  <p>{vendorData.vendor.bank_name || 'Not provided'}</p>
                                </div>
                               
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Account Number</h3>
                                  <p>
                                    {vendorData.vendor.bank_account_number ?
                                      `XXXX${vendorData.vendor.bank_account_number.slice(-4)}` :
                                      'Not provided'}
                                  </p>
                                </div>
                               
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">IFSC Code</h3>
                                  <p>{vendorData.vendor.bank_account_ifsc_code || 'Not provided'}</p>
                                </div>
                               
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                                  <p>{vendorData.vendor.bank_account_type}</p>
                                </div>
                               
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Cancelled Cheque</h3>
                                  <p>{vendorData.vendor.cancelled_checkque ? 'Uploaded' : 'Not uploaded'}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 text-center rounded-lg bg-gray-50">
                                <p className="text-gray-500">Banking details are hidden for security. Click "Show Details" to view.</p>
                              </div>
                            )}
                           
                            <Alert className="mt-4 border border-orange-100 bg-orange-50">
                              <IconShield className="w-4 h-4 text-orange-500" />
                              <AlertTitle className="text-orange-700">Secure Banking</AlertTitle>
                              <AlertDescription className="text-orange-600">
                                Your banking information is encrypted and securely stored. We only use it for processing payments to you.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                     
                      <Separator className="my-6" />
                     
                      {/* Payout History */}
                      <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold">Payout History</h2>

                        <div className="border rounded-lg">
                          <div className="p-4 text-center">
                            <button
                              onClick={() => (window.location.href = "/payouts")}
                              className="px-4 py-2 text-white transition-colors rounded-lg shadow-md"
                              style={{ backgroundColor: "#e65100" }}
                            >
                              Click here to check your payout history
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
             
              {/* Account Settings Tab */}
              <TabsContent value="settings" className="mt-0">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <CardHeader className="pb-2 border-b" style={{ borderColor: `${BRAND.primary}11` }}>
                    <div className="flex items-center">
                      <div className="p-3 mr-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
                        <IconSettings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                          Account Settings
                        </CardTitle>
                        <CardDescription className="text-base" style={{ color: BRAND.textSecondary }}>
                          Manage your account preferences and security
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                 
                  <CardContent className="pt-6 pb-8">
                    <div className="space-y-6">
                      <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold">Account Security</h2>
                       
                        <div className="space-y-4">
                          {/* First Name Field */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                              <div className="flex-1">
                                <h3 className="font-medium">First Name</h3>
                                {nameEditMode.firstName ? (
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      value={vendorData.vendor.admins[0]?.first_name || ''}
                                      onChange={(e) => {
                                        if (!vendorData?.vendor?.admins?.length) return;
                                        
                                        // Update the admin in state without saving to backend yet
                                        const updatedAdmins = [...vendorData.vendor.admins];
                                        updatedAdmins[0] = { 
                                          ...updatedAdmins[0], 
                                          first_name: e.target.value 
                                        };
                                        
                                        setVendorData({
                                          ...vendorData,
                                          vendor: {
                                            ...vendorData.vendor,
                                            admins: updatedAdmins
                                          }
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                      style={{ focusRing: BRAND.primary }}
                                      placeholder="Enter your first name"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    {vendorData?.vendor?.admins?.[0]?.first_name || 'Not set'}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                {nameEditMode.firstName ? (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      className="h-8"
                                      onClick={() => setNameEditMode({ ...nameEditMode, firstName: false })}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className="h-8"
                                      style={{
                                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                                        color: 'white'
                                      }}
                                      onClick={() => {
                                        if (!vendorData?.vendor?.admins?.length) return;
                                        
                                        // Save the admin data to backend
                                        saveAdminData(vendorData.vendor.admins[0]);
                                        setNameEditMode({ ...nameEditMode, firstName: false });
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => setNameEditMode({ ...nameEditMode, firstName: true })}
                                  >
                                    Change
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Last Name Field */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                              <div className="flex-1">
                                <h3 className="font-medium">Last Name</h3>
                                {nameEditMode.lastName ? (
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      value={vendorData.vendor.admins[0]?.last_name || ''}
                                      onChange={(e) => {
                                        if (!vendorData?.vendor?.admins?.length) return;
                                        
                                        // Update the admin in state
                                        const updatedAdmins = [...vendorData.vendor.admins];
                                        updatedAdmins[0] = { 
                                          ...updatedAdmins[0], 
                                          last_name: e.target.value 
                                        };
                                        
                                        setVendorData({
                                          ...vendorData,
                                          vendor: {
                                            ...vendorData.vendor,
                                            admins: updatedAdmins
                                          }
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                      style={{ focusRing: BRAND.primary }}
                                      placeholder="Enter your last name"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    {vendorData?.vendor?.admins?.[0]?.last_name || 'Not set'}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                {nameEditMode.lastName ? (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      className="h-8"
                                      onClick={() => setNameEditMode({ ...nameEditMode, lastName: false })}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className="h-8"
                                      style={{
                                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
                                        color: 'white'
                                      }}
                                      onClick={() => {
                                        if (!vendorData?.vendor?.admins?.length) return;
                                        
                                        // Save the admin data to backend
                                        saveAdminData(vendorData.vendor.admins[0]);
                                        setNameEditMode({ ...nameEditMode, lastName: false });
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => setNameEditMode({ ...nameEditMode, lastName: true })}
                                  >
                                    Change
                                  </Button>
                                )}
                              </div>
                            </div>

                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                              <h3 className="font-medium">Email Address</h3>
                              <p className="text-sm text-gray-500">{getVendorEmail(vendorData)}</p>
                            </div>
                          </div>
                         
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div>
                              <h3 className="font-medium">Password</h3>
                              <p className="text-sm text-gray-500">Secure your account with a strong password</p>
                            </div>
                            <Button variant="outline" className="h-8"  onClick={sendPasswordResetLink} >{isSendingResetLink ? "Sending..." : "Change"}</Button>
                          </div>
                        </div>
                      </div>
                     
                      <Separator className="my-6" />
                     
                      <Separator className="my-6" />
                     
                      <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold">Account Management</h2>
                       
                        <div className="space-y-4">
                          <Button
                            variant="outline"
                            style={{ color: BRAND.error, borderColor: BRAND.error }}
                            className="flex items-center gap-1"
                          >
                            <IconTrash className="w-4 h-4" />
                            Deactivate Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
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
      <PasswordChangeModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordSave}
        isLoading={isChangingPassword}
      />
    </div>
    
  );
}