"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Define the validation schema with zod
const loginSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name must be less than 50 characters." }),
  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
});

export default function Login() {
  const [name, setName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input using the schema
      loginSchema.parse({ name, phone_number });

      // Clear any previous error
      setError("");

      // Store data in local storage
      localStorage.setItem("user", JSON.stringify({ name, phone_number }));

      // Redirect to the dashboard (Home page)
      router.push("/");
    } catch (err) {
      // Set validation error message
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Validation error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Login</h2>
          <p className="text-sm text-gray-600 mb-2">Welcome to our application!</p>
          <p className="text-sm text-gray-600 mb-2">Please enter your credentials to log in.</p>
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
        )}

        <div className="mb-4 mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
          <input
            type="text"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200 ease-in-out"
        >
          Login
        </button>
      </form>
    </div>
  );
}