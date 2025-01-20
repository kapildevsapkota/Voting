"use client";

import { useState } from "react";
import { useRouter } from "next/router"; // Assuming you're using Next.js for routing

export default function Login() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && number.trim()) {
      // Store data in local storage
      localStorage.setItem("user", JSON.stringify({ name, number }));
      // Redirect to the dashboard (Home page)
      router.push("/"); // Adjust the path if necessary
    } else {
      alert("Please enter both name and number.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Number</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
