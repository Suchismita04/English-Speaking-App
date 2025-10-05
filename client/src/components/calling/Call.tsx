import { useState } from "react";
import { Users, Video, TrendingUp, User as UserIcon, Plus, Crown, Globe, Clock, Award, Calendar, MessageCircle, Mail, Menu, X } from "lucide-react";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

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

type Room = {
  id: string;
  name: string;
  host: string;
  participants: number;
  maxParticipants: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "Mixed";
  topic: string;
  isLive: boolean;
};

type ProgressData = {
  totalCalls: number;
  totalHours: number;
  streak: number;
  level: string;
  weeklyProgress: { day: string; minutes: number; calls: number }[];
};

const dummyUsers: User[] = [
  { id: "1", name: "Ariana", avatar: "/src/assets/images/testimonial1.png", isOnline: true, onCall: false, level: "Beginner", gender: "Female", country: "USA" },
  { id: "2", name: "David", avatar: "/src/assets/images/testimonial2.png", isOnline: true, onCall: true, level: "Intermediate", gender: "Male", country: "India" },
  { id: "3", name: "Sophie", avatar: "/src/assets/images/testimonial3.png", isOnline: false, onCall: false, level: "Advanced", gender: "Female", country: "UK" },
  { id: "4", name: "Carlos", avatar: "/src/assets/images/testimonial1.png", isOnline: true, onCall: false, level: "Intermediate", gender: "Male", country: "Spain" },
];

const dummyRooms: Room[] = [
  { id: "r1", name: "Daily English Practice", host: "Michael", participants: 8, maxParticipants: 15, level: "Beginner", topic: "Basic Conversation", isLive: true },
  { id: "r2", name: "Business English Hub", host: "Sarah", participants: 12, maxParticipants: 20, level: "Advanced", topic: "Professional Communication", isLive: true },
  { id: "r3", name: "Grammar Warriors", host: "James", participants: 5, maxParticipants: 10, level: "Intermediate", topic: "Grammar & Writing", isLive: true },
  { id: "r4", name: "Movie Discussion Club", host: "Emma", participants: 15, maxParticipants: 25, level: "Mixed", topic: "Entertainment & Culture", isLive: true },
];

const progressData: ProgressData = {
  totalCalls: 47,
  totalHours: 23.5,
  streak: 12,
  level: "Intermediate",
  weeklyProgress: [
    { day: "Mon", minutes: 45, calls: 3 },
    { day: "Tue", minutes: 60, calls: 4 },
    { day: "Wed", minutes: 30, calls: 2 },
    { day: "Thu", minutes: 75, calls: 5 },
    { day: "Fri", minutes: 50, calls: 3 },
    { day: "Sat", minutes: 90, calls: 6 },
    { day: "Sun", minutes: 40, calls: 2 },
  ],
};

const currentUser = {
  name: "Alex Johnson",
  avatar: "/src/assets/images/testimonial1.png",
  email: "alex.johnson@email.com",
  level: "Intermediate",
  country: "USA",
  memberSince: "January 2024",
  isPremium: false,
};

const Call = () => {
  const [activeTab, setActiveTab] = useState<"call" | "rooms" | "progress" | "profile">("call");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomTopic, setRoomTopic] = useState("");

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

  const handleJoinRoom = (roomId: string) => {
    console.log("Joining room:", roomId);
  };

  const handleCreateRoom = () => {
    if (roomName && selectedUsers.length > 0) {
      console.log("Creating room:", { roomName, roomTopic, users: selectedUsers });
      setShowCreateRoom(false);
      setSelectedUsers([]);
      setRoomName("");
      setRoomTopic("");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const getStatusColor = (user: User) => {
    if (!user.isOnline) return "bg-gray-400";
    if (user.onCall) return "bg-red-500";
    return "bg-green-500";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-blue-100 text-blue-700";
      case "Advanced": return "bg-purple-100 text-purple-700";
      case "Mixed": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const navItems = [
    { id: "call" as const, label: "Video Call", icon: Video },
    { id: "rooms" as const, label: "Live Rooms", icon: Users },
    { id: "progress" as const, label: "Progress", icon: TrendingUp },
    { id: "profile" as const, label: "Profile", icon: UserIcon }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header Area with Close Button */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-wide">
              Daily<span className="text-rose-500">Talk</span>
            </h1>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={`transition-transform group-hover:scale-110 ${
                        isActive ? '' : 'text-gray-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 DailyTalk
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-20 p-2 rounded-lg bg-white shadow-lg lg:hidden hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Menu size={24} className="text-gray-600" />
        </button>

        {/* Call Section */}
        {activeTab === "call" && (
          <div className="flex flex-col lg:flex-row min-h-full px-4 gap-6 py-6 pt-20 lg:pt-6">
            <div className="w-full lg:w-2/3 flex flex-col gap-6 items-center justify-start">
              <div className="w-full max-w-5xl bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-white px-6 py-4 rounded-2xl shadow-xl text-center">
                <h2 className="text-lg md:text-xl font-bold">
                  🎥 Video Calling is available for Premium Members
                </h2>
                <p className="text-sm md:text-base">
                  Upgrade your account to talk face-to-face with strangers in real time.
                </p>
              </div>

              <div className="w-full flex-1 max-w-5xl flex items-center justify-center">
                <div className="w-full h-full min-h-[400px] bg-white/50 border border-gray-200 shadow-2xl rounded-3xl backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Video Area</h3>
                    <p className="text-gray-500">Start a call or upgrade to premium to enable video calls.</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-5xl bg-white p-4 rounded-2xl shadow-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={handleRandomCall}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition cursor-pointer"
                  >
                    🎲 Talk to a Random Stranger
                  </button>

                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      className="px-3 py-2 rounded-full border border-gray-300 text-sm cursor-pointer"
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    >
                      <option value="All">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <select
                      className="px-3 py-2 rounded-full border border-gray-300 text-sm cursor-pointer"
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <option value="All">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <select
                      className="px-3 py-2 rounded-full border border-gray-300 text-sm cursor-pointer"
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

            <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-lg p-6 flex flex-col">
              <h3 className="text-xl font-bold text-gray-700 mb-3">🟢 Online Users</h3>

              <input
                type="text"
                placeholder="Search user..."
                className="px-4 py-2 border border-gray-300 rounded-full mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
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
                        className="bg-blue-500 text-white px-4 py-1 rounded-full hover:scale-105 transition text-sm cursor-pointer"
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
        )}

        {/* Rooms Section */}
        {activeTab === "rooms" && (
          <div className="max-w-7xl mx-auto px-4 py-6 pt-20 lg:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Live Rooms</h2>
                <p className="text-gray-600">Join group conversations and practice English together</p>
              </div>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <Plus size={20} />
                Create Room
              </button>
            </div>

            {showCreateRoom && (
              <div className="mb-6 bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Your Own Room</h3>
                
                <div className="space-y-4 mb-4">
                  <input
                    type="text"
                    placeholder="Room Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Topic (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={roomTopic}
                    onChange={(e) => setRoomTopic(e.target.value)}
                  />
                </div>

                <h4 className="font-semibold text-gray-700 mb-3">Select Participants</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-60 overflow-y-auto">
                  {dummyUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                        selectedUsers.includes(user.id)
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.level}</p>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <span className="text-purple-600 font-bold">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateRoom}
                    disabled={!roomName || selectedUsers.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition cursor-pointer"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateRoom(false);
                      setSelectedUsers([]);
                      setRoomName("");
                      setRoomTopic("");
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dummyRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <UserIcon size={14} />
                        Hosted by {room.host}
                      </p>
                    </div>
                    {room.isLive && (
                      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{room.topic}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(room.level)}`}>
                        {room.level}
                      </span>
                      <span className="text-sm text-gray-600">
                        {room.participants}/{room.maxParticipants} participants
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(room.participants / room.maxParticipants) * 100}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.participants >= room.maxParticipants}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {room.participants >= room.maxParticipants ? "Room Full" : "Join Room"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Section */}
        {activeTab === "progress" && (
          <div className="max-w-6xl mx-auto px-4 py-6 pt-20 lg:pt-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Video size={32} />
                  <span className="text-3xl font-bold">{progressData.totalCalls}</span>
                </div>
                <p className="text-blue-100">Total Calls</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock size={32} />
                  <span className="text-3xl font-bold">{progressData.totalHours}h</span>
                </div>
                <p className="text-purple-100">Practice Hours</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award size={32} />
                  <span className="text-3xl font-bold">{progressData.streak}</span>
                </div>
                <p className="text-orange-100">Day Streak 🔥</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={32} />
                  <span className="text-3xl font-bold">{progressData.level}</span>
                </div>
                <p className="text-green-100">Current Level</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Weekly Activity</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={progressData.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    style={{ fontSize: '14px', fontWeight: '600' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Calls', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="minutes" 
                    fill="url(#colorMinutes)" 
                    radius={[8, 8, 0, 0]}
                    name="Practice Minutes"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 5 }}
                    name="Total Calls"
                  />
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white rounded-xl p-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="font-semibold text-gray-800">First Call</p>
                      <p className="text-sm text-gray-500">Make your first video call</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-xl p-3">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <p className="font-semibold text-gray-800">Week Warrior</p>
                      <p className="text-sm text-gray-500">7-day practice streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-xl p-3 opacity-50">
                    <span className="text-3xl">💎</span>
                    <div>
                      <p className="font-semibold text-gray-800">100 Calls Club</p>
                      <p className="text-sm text-gray-500">Complete 100 calls (47/100)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Learning Insights</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Speaking Fluency</span>
                      <span className="text-sm font-bold text-blue-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Vocabulary</span>
                      <span className="text-sm font-bold text-purple-600">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Confidence</span>
                      <span className="text-sm font-bold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeTab === "profile" && (
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
                    <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </button>
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
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition cursor-pointer">
                      Edit Profile
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer">
                      Account Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Profile Cards */}
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
                  {dummyUsers.slice(0, 3).map((user) => (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Call;