"use client";

import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 object-cover w-full h-full"
      >
        <source src="/startBG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <SignupForm />
      </div>
    </div>
  );
}