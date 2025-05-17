import { useState, useEffect } from 'react';

// Component for vendor handle input with validation
const VendorHandleInput = ({ vendorData, updateVendorData, brandColors }) => {
  // State for handle validation
  const [isChecking, setIsChecking] = useState(false);
  const [isUnique, setIsUnique] = useState(true);
  const [hasBeenChecked, setHasBeenChecked] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isSameAsOriginal, setIsSameAsOriginal] = useState(false);
  
  // Store the original handle when component mounts
  const [originalHandle, setOriginalHandle] = useState('');
  
  useEffect(() => {
    // If vendor has an ID, they are an existing vendor
    if (vendorData.vendor.id && vendorData.vendor.handle) {
      setOriginalHandle(vendorData.vendor.handle);
    }
  }, [vendorData.vendor.id]);

  // Function to check handle uniqueness
  const checkHandleUniqueness = async (handle) => {
    if (!handle) return;
    
    // If the handle is the same as the original handle for an existing vendor
    if (vendorData.vendor.id && handle === originalHandle) {
      setIsUnique(true);
      setIsSameAsOriginal(true);
      setHasBeenChecked(true);
      setIsChecking(false);
      return;
    }
    
    setIsSameAsOriginal(false);
    setIsChecking(true);
    
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }
      console.log("Token found:", token);
      // FIXED: Added the request body with the handle
      const response = await fetch(`http://localhost:9000/vendors/check-handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ handle: handle }) // Added the body with handle property
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`Handle check for "${handle}":`, result);
      
      // Extract isUnique property from the response object
      const handleIsAvailable = result.isUnique === true;
      console.log(`Handle "${handle}" is ${handleIsAvailable ? 'AVAILABLE' : 'ALREADY TAKEN'}`);
      
      setIsUnique(handleIsAvailable);
      setHasBeenChecked(true);
    } catch (error) {
      console.error("Error checking handle:", error);
      setIsUnique(false); // Default to not unique on error for safety
    } finally {
      setIsChecking(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    updateVendorData('handle', value);
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Reset validation states when input changes
    setHasBeenChecked(false);
    setIsSameAsOriginal(false);
    
    // Only check handle if it's not empty
    if (value.trim()) {
      console.log(`Will check handle: "${value}" after typing stops`);
      
      // Set a new timeout
      const timeout = setTimeout(() => {
        checkHandleUniqueness(value);
      }, 500); // Wait for 500ms after user stops typing
      
      setTypingTimeout(timeout);
    } else {
      setHasBeenChecked(false);
      setIsSameAsOriginal(false);
    }
  };

  // Determine border color based on validation state
  const getBorderColor = () => {
    if (!vendorData.vendor.handle) return brandColors.error;
    if (isChecking) return brandColors.primary;
    if (isSameAsOriginal) return 'rgb(229, 231, 235)'; // Normal border for existing vendor's own handle
    if (hasBeenChecked && !isUnique) return brandColors.error;
    if (hasBeenChecked && isUnique) return 'green';
    return 'rgb(229, 231, 235)';
  };

  // Get feedback message
  const getFeedbackMessage = () => {
    if (!vendorData.vendor.handle) {
      return {
        text: "Vendor's handle is required",
        color: brandColors.error
      };
    }
    if (isChecking) {
      return {
        text: "Checking availability...",
        color: brandColors.primary
      };
    }
    if (isSameAsOriginal) {
      return {
        text: "This is your current handle",
        color: brandColors.textSecondary
      };
    }
    if (hasBeenChecked && !isUnique) {
      return {
        text: "This handle is already taken",
        color: brandColors.error
      };
    }
    if (hasBeenChecked && isUnique) {
      return {
        text: "Handle is available",
        color: 'green'
      };
    }
    return null;
  };

  const feedback = getFeedbackMessage();

  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="block text-sm font-medium">
          Vendor's Handle <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-400">Required</span>
      </div>
      <div className="relative">
        <input
          type="text"
          value={vendorData.vendor.handle || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{
            borderColor: getBorderColor(),
            focusRing: brandColors.primary
          }}
          placeholder="Enter your handle"
        />
        {isChecking && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {hasBeenChecked && !isChecking && (
          <div className="absolute right-3 top-2.5">
            {isUnique ? (
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>
      {feedback && (
        <p className="mt-1 text-sm" style={{ color: feedback.color }}>
          {feedback.text}
        </p>
      )}
    </div>
  );
};

export default VendorHandleInput;