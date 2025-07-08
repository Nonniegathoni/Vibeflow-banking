"use client";
// app/settings/page.tsx

// This page can be a Server Component initially,
// then hydrate into a Client Component for interactivity.
// No "use client" at the top if you want initial server render.
// We'll add it below the async function if needed for state/effects.

import { useState, useEffect } from "react";
// Remove the useUser import:
// import { useUser } from "@/contexts/UserContext";

// Import getSession from your auth library
import { getSession } from "@/lib/auth"; // Adjust the import path

import { getUserProfile, updateUserProfile } from "@/services/api"; // Assuming these are client-side API calls

import type React from "react"; // Import React type if needed for JSX

// Make the page component an async function to fetch session data
export default async function SettingsPage() {
  // Fetch session on the server during the initial render
  const session = await getSession();
  const initialUser: { id: string; email: string; role: string; name?: string; phone?: string } | null = session?.user || null; // Get initial user data from session

  // Now, add "use client" below the async function if you need client-side features
  // like useState, useEffect, form handling, etc.
  // If the entire component is just displaying data fetched on the server,
  // you might not need "use client". But for form interactions, you will.


  // Remove the useUser hook call:
  // const { user, setUser, logout } = useUser();

  // Use initialUser or a state derived from it
  const [user, setUser] = useState(initialUser); // Manage user state if needed for updates or UI
  const [formData, setFormData] = useState({
    name: user?.name || "", // Initialize from fetched user data
    email: user?.email || "", // Initialize from fetched user data
    phone: user?.phone || "", // Initialize from fetched user data
    emailAlerts: false, // Fetch this from profile API if it's not in session
    smsAlerts: false, // Fetch this from profile API if it's not in session
    twoFactorAuth: false, // Fetch this from profile API if it's not in session
  });
  const [loading, setLoading] = useState(true); // Loading state for the profile API call
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Use useEffect to fetch additional profile data if necessary (like preferences)
  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch if we have a user (session)
      if (!user?.id) {
        // Check for user existence using the state
        setLoading(false); // Stop loading if no user
        return;
      }
      try {
        // This API call fetches potentially more detailed profile info
        const response = await getUserProfile();
        setFormData((prev) => ({
          // Update form data with fetched profile details
          ...prev,
          name: response.data.name || prev.name, // Prefer API data but keep existing if not provided
          email: response.data.email || prev.email,
          phone: response.data.phone || prev.phone,
          emailAlerts: response.data.emailAlerts ?? false, // Use ?? for null/undefined check
          smsAlerts: response.data.smsAlerts ?? false,
          twoFactorAuth: response.data.twoFactorAuth ?? false,
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Optionally set an error message for the user
      } finally {
        setLoading(false);
      }
    };

    fetchProfile(); // Call fetchProfile when the component mounts or user changes
  }, [user]); // Depend on the user state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!user?.id) {
      setMessage("Error: User not authenticated.");
      setSaving(false);
      return;
    }

    try {
      // Update profile using the API
      const response = await updateUserProfile(
        formData.name,
        formData.email,
        formData.phone
      );

      // If successful, update the user state if needed (e.g., to reflect name change)
      // Note: Updating session usually requires a different mechanism (e.g., re-fetching session or an API endpoint to update session)
      if (setUser && user) {
        setUser({ ...user, name: formData.name }); // Update local state
      }

      setMessage("Settings updated successfully");
    } catch (error) {
      setMessage("Error updating settings");
      console.error("Error updating settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // If there's no user after the initial server fetch and client hydration
  if (!user) {
    // You might want to redirect here if authentication is required
    // This redirect would happen client-side after hydration if initialUser was null
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // useEffect(() => { router.push('/login'); }, [router]);
    return <div>Please log in to view settings</div>;
  }

  if (loading) {
    return <div>Loading settings...</div>;
  }

  // ... rest of your render logic using the 'user' state and 'formData'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {message && (
          <div
            className={`p-4 mb-4 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            {/* Email Field (often read-only if used as identifier) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              {/* If email can't be changed via this form, make it readOnly */}
              <input
                type="email"
                name="email"
                value={formData.email}
                // onChange={handleChange} // Remove onChange if readOnly
                readOnly // Make email read-only if it's not updatable here
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            {/* Alert Preferences (Assuming these are part of the profile API) */}
            <div className="space-y-2">
              {/* Email Alerts */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailAlerts"
                  checked={formData.emailAlerts}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  title="Receive email alerts"
                />
                <span className="ml-2">Receive email alerts</span>
              </label>

              {/* SMS Alerts */}
              <label className="flex items-center">
                <input
                    type="checkbox"
                    name="smsAlerts"
                    checked={formData.smsAlerts}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    title="Receive SMS alerts"
                />
                <span className="ml-2">Receive SMS alerts</span>
              </label>

              {/* Two-Factor Auth (State only, actual implementation would be complex) */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={formData.twoFactorAuth}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Enable two-factor authentication</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            {/* Logout Button (Assuming logout is a client-side action) */}
            {/* You'll need access to a logout function here.
                             If your auth library provides a client-side logout, import it.
                             If you were using UserContext for logout, you'll need to replace that.
                             Let's assume your auth library has a client-side logout function.
                         */}
            {/* You need to import logout from your auth library if it's not part of getSession */}
            {/* import { logout } from '@/lib/auth'; // Example */}
            <button
              type="button"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={() => {
                // Call your client-side logout function
                // Replace `logout()` with your actual logout function call
                // Example: yourAuthLibrary.signOut();
                alert("Logout functionality needs to be implemented"); // Placeholder
              }}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
