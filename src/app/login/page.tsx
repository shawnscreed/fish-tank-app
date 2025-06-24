// File: src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; // ✅ Required for Google button to work

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email/password login logic if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Top Navigation / Login Form */}
      <div className="flex justify-end p-4">
        <form onSubmit={handleLogin} className="bg-white shadow-xl rounded-xl p-6 w-80">
          <h2 className="text-xl font-bold mb-4">Login</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-3">
            Sign In
          </button>

          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded shadow transition"
          >
            Sign in with Google
          </button>

          <div className="mt-3 text-sm text-center">
            <Link href="/signup" className="text-blue-500 hover:underline">Create an account</Link>
          </div>
        </form>
      </div>

      {/* App Marketing Section */}
      <div className="flex-grow px-8 py-12 md:px-20">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to Fish Keeper App 🐠
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          The smartest way to track your aquarium health, log water tests, manage tank species,
          and get AI-powered care suggestions for your fish!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            { icon: "🧪", label: "Water Testing Logs", desc: "Track pH, hardness, ammonia, nitrate levels and more." },
            { icon: "🐡", label: "Stocking Suggestions", desc: "Get suggestions based on current tank setup." },
            { icon: "🛠️", label: "Maintenance Reminders", desc: "Stay on top of cleaning, filter changes, and testing." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl">{item.icon}</div>
              <h3 className="text-xl font-bold mt-2">{item.label}</h3>
              <p className="text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
