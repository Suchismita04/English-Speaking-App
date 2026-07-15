import { useState, useEffect } from "react";
import { Video, Phone, PhoneOff } from "lucide-react";

type User = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  onCall: boolean;
  level: "Beginner" | "Intermediate" | "Advanced";
  gender: "Male" | "Female" | "Other";
  country: string;
};

// Exact shape returned by /user/getAllTypesOfUser
type ApiUser = {
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
};

// Minimal shape needed from /user/getUserProfile (used to exclude self from the list)
type ApiUserProfile = {
  id: number;
  user_name: string;
};

// Response shape from POST /audio-call/start
type StartCallResponse = {
  message?: string;
  roomId: string;
};

// Response shape from POST /audio-call/end
type EndCallResponse = {
  message?: string;
};

type ActiveCall = {
  user: User;
  roomId: string;
};

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;

const getDefaultAvatar = (gender: ApiUser["gender"]) => {
  if (gender === "Female") return "/src/assets/images/testimonial3.png";
  if (gender === "Male") return "/src/assets/images/testimonial2.png";
  return "/src/assets/images/testimonial1.png";
};

const mapApiUserToUser = (u: ApiUser): User => ({
  id: String(u.id),
  name: u.user_name,
  avatar: getDefaultAvatar(u.gender),
  isOnline: u.isOnline,
  onCall: u.onCall,
  level: u.fluencyLevel ?? "Beginner",
  gender: u.gender ?? "Other",
  country: u.country ?? "Unknown",
});

const VideoCallSection = () => {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [callMode, setCallMode] = useState<"audio" | "video">("audio");

  // API-driven users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Logged-in user's own id, used to exclude self from the Online Users panel
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Audio call state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const accessToken = localStorage.getItem("access_token");

  // Fetch the logged-in user's own profile, so we can exclude them from the list
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/getUserProfile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch current user: ${response.status}`);
        }

        const data: ApiUserProfile = await response.json();
        setCurrentUserId(String(data.id));
      } catch (err) {
        console.error("Error fetching current user profile:", err);
      }
    };

    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/user/getAllTypesOfUser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data: ApiUser[] = await response.json();
        setUsers(data.map(mapApiUserToUser));
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError(err instanceof Error ? err.message : "Something went wrong while fetching users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users
    .filter((user) => user.id !== currentUserId) // exclude the logged-in user from the list
    .filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) &&
        (genderFilter === "All" || user.gender === genderFilter) &&
        (levelFilter === "All" || user.level === levelFilter) &&
        (countryFilter === "All" || user.country === countryFilter)
    );

  const startAudioCall = async (user: User) => {
    setCallError(null);
    setConnectingUserId(user.id);

    try {
      const response = await fetch(`${API_BASE_URL}/audio-call/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ userId: Number(user.id) }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start call: ${response.status}`);
      }

      const data: StartCallResponse = await response.json();
      setActiveCall({ user, roomId: data.roomId });
    } catch (err) {
      console.error("Error starting audio call:", err);
      setCallError(err instanceof Error ? err.message : "Could not start the call.");
    } finally {
      setConnectingUserId(null);
    }
  };

  const endAudioCall = async () => {
    if (!activeCall) return;

    try {
      const response = await fetch(`${API_BASE_URL}/audio-call/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ roomId: activeCall.roomId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to end call: ${response.status}`);
      }

      await response.json() as EndCallResponse;
    } catch (err) {
      console.error("Error ending audio call:", err);
      setCallError(err instanceof Error ? err.message : "Could not end the call cleanly.");
    } finally {
      setActiveCall(null);
    }
  };

  const handleCall = (userId: string, type: "audio" | "video") => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (type === "audio") {
      startAudioCall(user);
    } else {
      console.log("Video call to:", userId);
    }
  };

  const handleRandomCall = () => {
    if (callMode !== "audio") return;

    const candidates = filteredUsers.filter((u) => u.isOnline && !u.onCall);
    if (candidates.length === 0) {
      setCallError("No online users available for a random call right now.");
      return;
    }

    const randomUser = candidates[Math.floor(Math.random() * candidates.length)];
    startAudioCall(randomUser);
  };

  const getStatusColor = (user: User) => {
    if (!user.isOnline) return "bg-gray-400";
    if (user.onCall) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-full px-4 gap-6 py-6 pt-20 lg:pt-6">
      <div className="w-full lg:w-2/3 flex flex-col gap-6 items-center justify-start">
        {/* Call Mode Selector */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Call Type</h3>
          <div className="grid grid-cols-1 gap-4">
            {/* Audio Call Option - FREE (expanded to full width to fill the space freed by the hidden Video Call option) */}
            <button
              onClick={() => setCallMode("audio")}
              className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                callMode === "audio"
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${callMode === "audio" ? "bg-blue-500" : "bg-gray-200"}`}>
                    <Phone size={24} className={callMode === "audio" ? "text-white" : "text-gray-600"} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-800">Audio Call</h4>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-1">
                      FREE
                    </span>
                  </div>
                </div>
                {callMode === "audio" && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-left">
                Practice speaking English with voice calls. Perfect for beginners and advanced learners.
              </p>
            </button>

            {/* Video Call Option - PREMIUM — temporarily hidden per request, code kept intact below
            <button
              onClick={() => setCallMode("video")}
              className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                callMode === "video"
                  ? "border-purple-500 bg-purple-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${callMode === "video" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-200"}`}>
                    <Video size={24} className={callMode === "video" ? "text-white" : "text-gray-600"} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-gray-800">Video Call</h4>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full mt-1">
                      PREMIUM
                    </span>
                  </div>
                </div>
                {callMode === "video" && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-left">
                Face-to-face conversations for better learning. Upgrade to premium to unlock this feature.
              </p>
            </button>
            */}
          </div>
        </div>

        {/* Video Call Premium Banner — temporarily hidden per request, code kept intact below
        {callMode === "video" && (
          <div className="w-full max-w-5xl bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-white px-6 py-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold mb-1">
                  🎥 Upgrade to Premium for Video Calling
                </h2>
                <p className="text-sm md:text-base">
                  Talk face-to-face with strangers and enhance your learning experience.
                </p>
              </div>
              <button className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition whitespace-nowrap cursor-pointer">
                Upgrade Now
              </button>
            </div>
          </div>
        )}
        */}

        {/* Call error banner */}
        {callError && (
          <div className="w-full max-w-5xl bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-sm">
            {callError}
          </div>
        )}

        {/* Call Area */}
        <div className="w-full flex-1 max-w-5xl flex items-center justify-center">
          <div className={`w-full h-full min-h-[400px] border shadow-2xl rounded-3xl backdrop-blur-sm flex items-center justify-center p-6 ${
            callMode === "video" 
              ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" 
              : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          }`}>
            <div className="text-center">
              {callMode === "audio" ? (
                activeCall ? (
                  <>
                    <div className="relative mb-4 inline-block">
                      <img
                        src={activeCall.user.avatar}
                        alt={activeCall.user.name}
                        className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover mx-auto"
                      />
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white"></span>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-1">In call with {activeCall.user.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{activeCall.user.level} • {activeCall.user.country}</p>
                    <button
                      onClick={endAudioCall}
                      className="flex items-center gap-2 mx-auto bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition cursor-pointer"
                    >
                      <PhoneOff size={18} />
                      End Call
                    </button>
                  </>
                ) : connectingUserId ? (
                  <>
                    <div className="mb-4 p-6 bg-blue-500 rounded-full inline-block animate-pulse">
                      <Phone size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Connecting...</h3>
                    <p className="text-gray-600">Setting up your audio call.</p>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-6 bg-blue-500 rounded-full inline-block">
                      <Phone size={48} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Audio Call Ready</h3>
                    <p className="text-gray-600">Select a user or start a random call to begin practicing!</p>
                  </>
                )
              ) : (
                // Video Call - Premium Feature branch — kept intact; unreachable now since the Video Call
                // mode option above is commented out, so callMode can no longer become "video"
                <>
                  <div className="mb-4 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full inline-block opacity-50">
                    <Video size={48} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">Video Call - Premium Feature</h3>
                  <p className="text-gray-600 mb-4">Upgrade your account to enable video calling</p>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition cursor-pointer">
                    Get Premium Access
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Random Call and Filters */}
        <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-md">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleRandomCall}
              disabled={callMode === "video" || !!activeCall || !!connectingUserId}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg hover:scale-105 transition font-semibold ${
                callMode === "video" || activeCall || connectingUserId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 text-white cursor-pointer"
              }`}
            >
              {callMode === "audio" ? <Phone size={20} /> : <Video size={20} />}
              {callMode === "audio" ? "🎲 Talk to a Random Stranger (Audio)" : "🔒 Random Video Call (Premium Only)"}
            </button>

            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-3 items-center">
                <h4 className="text-sm font-semibold text-gray-700">Filter Users:</h4>
                <select
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="All">All Countries</option>
                  <option value="USA">USA</option>
                  <option value="India">India</option>
                  <option value="UK">UK</option>
                  <option value="Spain">Spain</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Users Panel */}
      <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-700">🟢 Online Users</h3>
          <span className="text-sm text-gray-500">{filteredUsers.length} online</span>
        </div>

        <input
          type="text"
          placeholder="Search user..."
          className="px-4 py-2 border border-gray-300 rounded-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loadingUsers ? (
            <p className="text-center text-gray-500 py-8">Loading users...</p>
          ) : usersError ? (
            <p className="text-center text-red-500 py-8">{usersError}</p>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isThisUserConnecting = connectingUserId === user.id;
              const isThisUserInCall = activeCall?.user.id === user.id;
              const audioDisabled = !!activeCall || !!connectingUserId;

              return (
                <div
                  key={user.id}
                  className="bg-gray-50 hover:bg-blue-50 transition p-3 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${getStatusColor(user)}`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.level} • {user.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCall(user.id, "audio")}
                      disabled={audioDisabled}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition text-sm font-medium ${
                        isThisUserInCall
                          ? "bg-red-500 text-white cursor-default"
                          : audioDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                      }`}
                    >
                      <Phone size={14} />
                      {isThisUserInCall ? "In Call" : isThisUserConnecting ? "Connecting..." : "Audio"}
                    </button>
                    {/* Video call button — temporarily hidden per request, code kept intact below
                    <button
                      onClick={() => handleCall(user.id, "video")}
                      disabled
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-400 px-3 py-2 rounded-lg cursor-not-allowed text-sm font-medium"
                      title="Premium feature"
                    >
                      <Video size={14} />
                      Video 🔒
                    </button>
                    */}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">No users match the filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallSection;