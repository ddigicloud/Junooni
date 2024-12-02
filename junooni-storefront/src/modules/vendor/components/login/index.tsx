"use client"; // include with Next.js 13+

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorView } from "../../templates/vendor-onboarding-template";

interface VendorLoginProps {
  setCurrentView: (view: VendorView) => void;
}

export default function VendorLogin({ setCurrentView }: VendorLoginProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Obtain JWT token for the vendor
      const { token } = await fetch(
        `http://localhost:9000/auth/vendor/emailpass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      ).then((res) => {
        if (!res.ok) {
          throw new Error("Invalid email or password");
        }
        return res.json();
      });

      // Save token to localStorage
      localStorage.setItem("vendorToken", token);

      // Redirect to the vendor dashboard
      router.push("/vendor/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form className="space-y-4">
        <input
          type="email"
          name="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          disabled={loading}
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <button
          onClick={() => setCurrentView("REGISTER")}
          className="text-blue-500 hover:underline"
        >
          Register
        </button>
      </p>
    </div>
  );
}
