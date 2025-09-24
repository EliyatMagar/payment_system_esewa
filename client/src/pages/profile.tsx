import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import ApiDebugger from "./ApiDebugger"; // Temporary debug component

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();
  const [showDebug, setShowDebug] = useState(false);

  // Check token validity on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Basic token validation (JWT tokens are typically in 3 parts)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid token format");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    // Optional: Check if token is expired (for JWT tokens)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= exp) {
        console.log("Token expired");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (e) {
      console.log("Could not parse token payload (may not be JWT)");
    }
  }, [navigate]);

  const handleRetry = async () => {
    await refetch();
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleClearTokenAndRetry = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 text-lg ml-4">Loading profile...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {/* Error Message */}
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Issue</h2>
            <p className="text-gray-600">
              We have a token but can't fetch your profile data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <button
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
              onClick={handleLoginRedirect}
            >
              Go to Login Page
            </button>
            
            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 font-medium"
              onClick={handleRetry}
            >
              Try Again (Refetch)
            </button>
            
            <button
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 font-medium"
              onClick={handleClearTokenAndRetry}
            >
              Clear Token & Login Again
            </button>

            <button
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
              onClick={() => setShowDebug(!showDebug)}
            >
              {showDebug ? "Hide" : "Show"} Debug Info
            </button>
          </div>

          {/* Debug Information */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Current Status:</h3>
            <div className="text-sm space-y-1">
              <p>Token exists: <span className="font-mono">{localStorage.getItem("token") ? "Yes" : "No"}</span></p>
              <p>Token length: <span className="font-mono">{localStorage.getItem("token")?.length || 0}</span></p>
              <p>API Error: <span className="font-mono text-red-600">{error?.toString() || "Unknown error"}</span></p>
            </div>
          </div>

          {/* API Debugger */}
          {showDebug && <ApiDebugger />}
        </div>
      </div>
    );
  }

  // Success state - user profile loaded
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-green-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Profile Loaded Successfully!</h1>
          <p className="text-green-100">Welcome back, {user.name}!</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <InfoField label="Name" value={user.name} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Role" value={user.role} />
            <InfoField label="User ID" value={user.id} />
            <InfoField 
              label="Member Since" 
              value={new Date(user.created_at).toLocaleDateString()} 
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => alert("Edit profile coming soon!")}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded">
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <p className="mt-1 text-gray-900">{value}</p>
  </div>
);

export default Profile;