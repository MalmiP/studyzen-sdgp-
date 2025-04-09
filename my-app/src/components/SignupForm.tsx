"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentId: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
        setIsLoading(false);
        return;
      }
      router.push("/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 px-6 py-4 bg-white rounded-xl shadow-lg w-full max-w-md"
    >
      <div className="flex justify-center mb-6">
        <img
          src="/logo.png"
          alt="StudyZen Logo"
          className="w-64 h-64 object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Join StudyZen
      </h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Create an account to start your personalized study journey
      </p>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-700">
            Full Name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId" className="text-gray-700">
            Student ID
          </Label>
          <Input
            id="studentId"
            name="studentId"
            type="text"
            placeholder="12345678"
            required
            value={formData.studentId}
            onChange={handleChange}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleChange}
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#00A3FF] hover:bg-blue-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing up...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#00A3FF] hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  );
}