import { useState, useEffect, useRef } from "react";
import { Crown, Globe, Calendar, Mail, X } from "lucide-react";

// type User = {
//   id: string;
//   name: string;
//   avatar: string;
//   isOnline: boolean;
//   onCall: boolean;
//   level: "Beginner" | "Intermediate" | "Advanced";
//   gender: "Male" | "Female" | "Other";
//   country: string;
// };

type ProgressData = {
  totalCalls: number;
  totalHours: number;
  streak: number;
  level: string;
  weeklyProgress: { day: string; minutes: number; calls: number }[];
};

// Exact shape returned by /user/getUserProfile
type ApiUserProfile = {
  id: number;
  user_name: string;
  user_email: string;
  password: string;
  country: string | null;
  gender: "Male" | "Female" | "Other" | null;
  fluencyLevel: "Beginner" | "Intermediate" | "Advanced" | null;
  isOnline: boolean;
  isOffline: boolean;
  onCall: boolean;
  created_at: string;
  updated_at: string;
  socket_id: string | null;
  profile_picture?: string | null;
};

type CurrentUser = {
  name: string;
  avatar: string;
  profilePicture: string | null;
  email: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  gender: "Male" | "Female" | "Other";
  country: string;
  memberSince: string;
  isPremium: boolean;
};

type EditProfileForm = {
  user_name: string;
  country: string;
  gender: "Male" | "Female" | "Other";
  fluencyLevel: "Beginner" | "Intermediate" | "Advanced";
};

// const dummyUsers: User[] = [
//   { id: "1", name: "Ariana", avatar: "/src/assets/images/testimonial1.png", isOnline: true, onCall: false, level: "Beginner", gender: "Female", country: "USA" },
//   { id: "2", name: "David", avatar: "/src/assets/images/testimonial2.png", isOnline: true, onCall: true, level: "Intermediate", gender: "Male", country: "India" },
//   { id: "3", name: "Sophie", avatar: "/src/assets/images/testimonial3.png", isOnline: false, onCall: false, level: "Advanced", gender: "Female", country: "UK" },
// ];

const progressData: ProgressData = {
  totalCalls: 47,
  totalHours: 23.5,
  streak: 12,
  level: "Intermediate",
  weeklyProgress: [],
};

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;

const getDefaultAvatar = (gender: ApiUserProfile["gender"]) => {
  if (gender === "Female") return "/src/assets/images/testimonial3.png";
  if (gender === "Male") return "/src/assets/images/testimonial2.png";
  return "/src/assets/images/testimonial1.png";
};

// Builds a displayable avatar URL: uses the uploaded profile picture if present,
// otherwise falls back to the gender-based default asset.
const resolveAvatarUrl = (profilePicture: string | null | undefined, gender: ApiUserProfile["gender"]) => {
  if (profilePicture) {
    // profile_picture is a server-relative path like "/uploads/profile-pictures/xyz.jpg"
    return `${RAW_BASE_URL}${profilePicture}`;
  }
  return getDefaultAvatar(gender);
};

const formatMemberSince = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const mapApiProfileToCurrentUser = (u: ApiUserProfile): CurrentUser => ({
  name: u.user_name,
  avatar: resolveAvatarUrl(u.profile_picture, u.gender),
  profilePicture: u.profile_picture ?? null,
  email: u.user_email,
  level: u.fluencyLevel ?? "Beginner",
  gender: u.gender ?? "Other",
  country: u.country ?? "Unknown",
  memberSince: formatMemberSince(u.created_at),
  isPremium: false, // not provided by API yet
});

const getAuthHeaders = (extra?: Record<string, string>) => {
  const accessToken = localStorage.getItem("access_token");
  return {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(extra || {}),
  };
};

const ProfileSection = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditProfileForm>({
    user_name: "",
    country: "",
    gender: "Male",
    fluencyLevel: "Beginner",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile picture upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/getUserProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data: ApiUserProfile = await response.json();
      setCurrentUser(mapApiProfileToCurrentUser(data));
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfileError(err instanceof Error ? err.message : "Something went wrong while fetching your profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-blue-100 text-blue-700";
      case "Advanced": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // ---- Edit Profile handlers ----

  const handleOpenEditModal = () => {
    if (!currentUser) return;
    setEditForm({
      user_name: currentUser.name,
      country: currentUser.country,
      gender: currentUser.gender,
      fluencyLevel: currentUser.level,
    });
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (savingProfile) return;
    setIsEditModalOpen(false);
    setSaveError(null);
  };

  const handleEditFormChange = (
    field: keyof EditProfileForm,
    value: string
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          user_name: editForm.user_name,
          country: editForm.country,
          gender: editForm.gender,
          fluencyLevel: editForm.fluencyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const data: ApiUserProfile = await response.json();
      setCurrentUser((prev) => {
        const updated = mapApiProfileToCurrentUser(data);
        // Preserve existing avatar/profilePicture if the update response
        // doesn't include profile_picture (some endpoints omit unchanged fields).
        if (!data.profile_picture && prev) {
          updated.avatar = prev.avatar;
          updated.profilePicture = prev.profilePicture;
        }
        return updated;
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveError(err instanceof Error ? err.message : "Something went wrong while updating your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Profile picture upload handlers ----

  const handleAvatarButtonClick = () => {
    if (uploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input value so selecting the same file again still fires onChange
    e.target.value = "";
    if (!file) return;

    setUploadingAvatar(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/user/upload-profile-picture`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload profile picture: ${response.status}`);
      }

      const data: { message: string; profilePicture: string; user: ApiUserProfile } = await response.json();

      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profilePicture: data.profilePicture,
          avatar: resolveAvatarUrl(data.profilePicture, prev.gender),
        };
      });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setUploadError(err instanceof Error ? err.message : "Something went wrong while uploading your photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pt-20 lg:pt-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (profileError || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pt-20 lg:pt-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center text-red-500">
          {profileError || "Unable to load profile."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pt-20 lg:pt-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <button
                onClick={handleAvatarButtonClick}
                disabled={uploadingAvatar}
                className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{currentUser.name}</h2>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getLevelColor(currentUser.level)}`}>
                  {currentUser.level}
                </span>
                {!currentUser.isPremium && (
                  <button className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-semibold hover:scale-105 transition cursor-pointer">
                    <Crown size={14} />
                    Upgrade to Premium
                  </button>
                )}
              </div>
              {uploadError && (
                <p className="text-xs text-red-500 mt-2">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Globe className="text-green-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="font-semibold text-gray-800">{currentUser.country}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-purple-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-800">{currentUser.memberSince}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">Quick Stats</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{progressData.totalCalls}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Calls</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600">{progressData.totalHours}h</p>
                  <p className="text-xs text-gray-600 mt-1">Hours Practiced</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-orange-600">{progressData.streak}</p>
                  <p className="text-xs text-gray-600 mt-1">Day Streak</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-xs text-gray-600 mt-1">Rooms Joined</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Learning Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Topics</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Business</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Travel</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Culture</span>
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition cursor-pointer">+ Add</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Practice Goals</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">Fluency</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Grammar</span>
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition cursor-pointer">+ Add</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenEditModal}
                disabled={uploadingAvatar}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </button>
              {/* Account Settings button temporarily hidden per request — button removed from view but code kept for future use
              <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer">
                Account Settings
              </button>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Profile Cards — Badges & Achievements / Recent Connections — temporarily hidden per request, code kept intact below
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            Badges & Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-xl">
              <span className="text-3xl mb-1">🏆</span>
              <p className="text-xs text-center font-semibold text-gray-700">Early Bird</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-3xl mb-1">⭐</span>
              <p className="text-xs text-center font-semibold text-gray-700">Social Star</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-xl">
              <span className="text-3xl mb-1">🎯</span>
              <p className="text-xs text-center font-semibold text-gray-700">Goal Getter</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-xl">
              <span className="text-3xl mb-1">🔥</span>
              <p className="text-xs text-center font-semibold text-gray-700">Streak King</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-pink-50 rounded-xl">
              <span className="text-3xl mb-1">💬</span>
              <p className="text-xs text-center font-semibold text-gray-700">Chatterbox</p>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-100 rounded-xl opacity-50">
              <span className="text-3xl mb-1">🔒</span>
              <p className="text-xs text-center font-semibold text-gray-700">Locked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-blue-500" size={20} />
            Recent Connections
          </h3>
          <div className="space-y-3">
            {dummyUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.country}</p>
                  </div>
                </div>
                <button className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      */}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
              <button
                onClick={handleCloseEditModal}
                disabled={savingProfile}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.user_name}
                  onChange={(e) => handleEditFormChange("user_name", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => handleEditFormChange("country", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your country"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => handleEditFormChange("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fluency Level</label>
                <select
                  value={editForm.fluencyLevel}
                  onChange={(e) => handleEditFormChange("fluencyLevel", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
            </div>

            <div className="px-6 py-5 border-t flex gap-3">
              <button
                onClick={handleCloseEditModal}
                disabled={savingProfile}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
              >
                {savingProfile && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                )}
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;