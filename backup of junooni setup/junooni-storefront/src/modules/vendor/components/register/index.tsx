"use client";

import { useState } from "react";
import Input from "@modules/common/components/input";
import ErrorMessage from "@modules/checkout/components/error-message";
import { SubmitButton } from "@modules/checkout/components/submit-button";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { VendorView } from "../../templates/vendor-onboarding-template";

interface VendorRegisterProps {
  setCurrentView: (view: VendorView) => void;
}



const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;

const VendorRegister = ({ setCurrentView }: VendorRegisterProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Step 1: Handle email/password registration
  const handleInitialSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();

      const response = await fetch(`${BACKEND_URL}/auth/vendor/emailpass/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
     
      const token = data.token;
      setAuthToken(token); // Update state for future use
      
      setStep(2); // Move to next step after successful registration
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle vendor details submission
  const handleVendorDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
  
    try {
      const formData = new FormData(e.currentTarget);
      const vendorData = {
        name: formData.get("company_name")?.toString(),
        handle: formData.get("handle")?.toString(),
        admin: {
          email: formData.get("email")?.toString(),
          first_name: formData.get("first_name")?.toString(),
          last_name: formData.get("last_name")?.toString(),
        },
      };
  
      console.log("Vendor Data Payload:", vendorData);
  
      const token = authToken;
      console.log("Authorization Header:", `Bearer ${token}`);
  
      const response = await fetch(`${BACKEND_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create vendor profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Vendor Registration</h1>
      {step === 1 ? (
        <form onSubmit={handleInitialSignup}>
          <Input label="Email" name="email" required />
          <Input label="Password" name="password" required type="password" />
          {message && <ErrorMessage error={message} />}
          <SubmitButton>{loading ? "Processing..." : "Continue"}</SubmitButton>
        </form>
      ) : (
        <form onSubmit={handleVendorDetails}>
          <Input label="Email" name="email" required />
          <Input label="Company Name" name="company_name" required />
          <Input label="Handle" name="handle" required />
          <Input label="First Name" name="first_name" required />
          <Input label="Last Name" name="last_name" required />
          {message && <ErrorMessage error={message} />}
          <SubmitButton>{loading ? "Processing..." : "Submit"}</SubmitButton>
        </form>
      )}
    </div>
  );
};

export default VendorRegister;

