import React, { useEffect, useState } from "react";
import { getCurrentUser, type User } from "../api/userApi";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser(); // <-- returns User directly
        setUser(userData);
      } catch (err: any) {
        setError("Failed to load user profile. Please login again.");
        localStorage.removeItem("token"); // remove token if invalid
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">My Profile</h2>

        <div className="mb-3">
          <p className="font-semibold">Name:</p>
          <p>{user.name}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Email:</p>
          <p>{user.email}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Role:</p>
          <p className="capitalize">{user.role}</p>
        </div>

        <div className="mb-3">
          <p className="font-semibold">Created At:</p>
          <p>{new Date(user.created_at).toLocaleString()}</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
