"use client";

import { useState } from "react";
import Input from "@modules/common/components/input";
import ErrorMessage from "@modules/checkout/components/error-message";
import { SubmitButton } from "@modules/checkout/components/submit-button";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { VendorView } from "../../templates/vendor-onboarding-template";

type Props = {
  setCurrentView: (view: VendorView) => void;
};

const VendorRegister = ({ setCurrentView }: Props) => {
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

      const response = await fetch(
        "http://localhost:9000/auth/vendor/emailpass/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setAuthToken(data.token);
      setStep(2); // Move to next step after successful registration
    } catch (error) {
      console.error("Initial Registration Error:", error);
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

      const response = await fetch("http://localhost:9000/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(vendorData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Registration complete - you can redirect or show success message
      setMessage("Registration successful!");
      // Optional: Redirect to dashboard or signin
      // setCurrentView("SIGN_IN");
    } catch (error) {
      console.error("Vendor Details Error:", error);
      setMessage(error instanceof Error ? error.message : "Failed to create vendor profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">
        Become a Medusa Store Vendor
      </h1>
      
      {step === 1 ? (
        // Step 1: Email and Password Form
        <>
          <p className="text-center text-base-regular text-ui-fg-base mb-4">
            Create your account credentials
          </p>
          <form className="w-full flex flex-col" onSubmit={handleInitialSignup}>
            <div className="flex flex-col w-full gap-y-2">
              <Input
                label="Email"
                name="email"
                required
                type="email"
                autoComplete="email"
              />
              <Input
                label="Password"
                name="password"
                required
                type="password"
                autoComplete="new-password"
              />
            </div>
            {message && <ErrorMessage error={message} />}
            <SubmitButton className="w-full mt-6">
              {loading ? "Processing..." : "Continue"}
            </SubmitButton>
          </form>
        </>
      ) : (
        // Step 2: Vendor Details Form
        <>
          <p className="text-center text-base-regular text-ui-fg-base mb-4">
            Complete your vendor profile
          </p>
          <form className="w-full flex flex-col" onSubmit={handleVendorDetails}>
            <div className="flex flex-col w-full gap-y-2">
              <Input
                label="Company Name"
                name="company_name"
                required
                autoComplete="organization"
              />
              <Input
                label="Handle (URL identifier)"
                name="handle"
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <Input
                label="First Name"
                name="first_name"
                required
                autoComplete="given-name"
              />
              <Input
                label="Last Name"
                name="last_name"
                required
                autoComplete="family-name"
              />
            </div>
            {message && <ErrorMessage error={message} />}
            <SubmitButton className="w-full mt-6">
              {loading ? "Creating Profile..." : "Complete Registration"}
            </SubmitButton>
          </form>
        </>
      )}

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        By creating a vendor account, you agree to Medusa Store&apos;s{" "}
        <LocalizedClientLink href="/content/privacy-policy" className="underline">
          Privacy Policy
        </LocalizedClientLink>{" "}
        and{" "}
        <LocalizedClientLink href="/content/terms-of-use" className="underline">
          Terms of Use
        </LocalizedClientLink>
        .
      </span>

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a vendor?{" "}
        <button onClick={() => setCurrentView("SIGN_IN")} className="underline">
          Sign in
        </button>
        .
      </span>
    </div>
  );
};

export default VendorRegister;