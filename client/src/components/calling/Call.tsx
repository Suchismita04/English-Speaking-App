import { useState } from "react";

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

const dummyUsers: User[] = [
  {
    id: "1",
    name: "Ariana",
    avatar: "/assets/images/testimonial2.png",
    isOnline: true,
    onCall: false,
    level: "Beginner",
    gender: "Female",
    country: "USA",
  },
  {
    id: "2",
    name: "David",
    avatar: "/avatars/2.jpg",
    isOnline: true,
    onCall: true,
    level: "Intermediate",
    gender: "Male",
    country: "India",
  },
  {
    id: "3",
    name: "Sophie",
    avatar: "/avatars/3.jpg",
    isOnline: false,
    onCall: false,
    level: "Advanced",
    gender: "Female",
    country: "UK",
  },
];

const Call = () => {

 const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  const filteredUsers = dummyUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) &&
      (genderFilter === "All" || user.gender === genderFilter) &&
      (levelFilter === "All" || user.level === levelFilter) &&
      (countryFilter === "All" || user.country === countryFilter)
  );

  const handleCall = (userId: string) => {
    console.log("Calling:", userId);
  };

  const handleRandomCall = () => {
    console.log("Random stranger call initiated.");
  };

  const getStatusColor = (user: User) => {
    if (!user.isOnline) return "bg-gray-400";
    if (user.onCall) return "bg-red-500";
    return "bg-green-500";
  };


  return (
     <div className="pt-16 min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] px-4 gap-6">
        
        {/* LEFT SIDE: Call Area with Premium Banner */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 items-center justify-start py-4">
          {/* Premium Access Banner */}
          <div className="w-full max-w-5xl bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-white px-6 py-4 rounded-2xl shadow-xl text-center">
            <h2 className="text-lg md:text-xl font-bold">
              🎥 Video Calling is available for Premium Members
            </h2>
            <p className="text-sm md:text-base">
              Upgrade your account to talk face-to-face with strangers in real time.
            </p>
          </div>

          {/* Video Area Placeholder */}
          <div className="w-full h-[75%] max-w-5xl flex items-center justify-center">
            <div className="w-full h-full bg-white/50 border border-gray-200 shadow-2xl rounded-3xl backdrop-blur-sm flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">Video Area</h3>
                <p className="text-gray-500">Start a call or upgrade to premium to enable video calls.</p>
              </div>
            </div>
          </div>

          {/* Filters and Random Call Button */}
          <div className="w-full max-w-5xl bg-white p-4 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={handleRandomCall}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition"
              >
                🎲 Talk to a Random Stranger
              </button>

              <div className="flex flex-wrap gap-3 items-center">
                <select
                  className="px-3 py-2 rounded-full border border-gray-300"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  className="px-3 py-2 rounded-full border border-gray-300"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  className="px-3 py-2 rounded-full border border-gray-300"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="All">All Countries</option>
                  <option value="USA">USA</option>
                  <option value="India">India</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-bold text-gray-700 mb-3">🟢 Online Users</h3>

          {/* Search */}
          <input
            type="text"
            placeholder="Search user..."
            className="px-4 py-2 border border-gray-300 rounded-full mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Scrollable user list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-blue-100 transition p-3 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border border-gray-300 object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${getStatusColor(user)}`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.level} • {user.country}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCall(user.id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-full hover:scale-105 transition"
                  >
                    Call
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users match the filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Call;
