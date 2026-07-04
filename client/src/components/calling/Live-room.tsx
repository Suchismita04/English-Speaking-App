import { useState, useEffect } from "react";
import { Plus, User as UserIcon, MessageCircle } from "lucide-react";

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

// Minimal shape needed from /user/getUserProfile (used to know the current user's id)
type ApiUserProfile = {
  id: number;
  user_name: string;
};

// Response shape from POST /session-room/createRoom
type CreateRoomResponse = {
  message: string;
  room: {
    id: number;
    name: string;
    description: string;
    logo: string;
    created_at: string;
    updated_at: string;
    created_by: number;
  };
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

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;
const DEFAULT_ROOM_LOGO = "https://exam.com/logo.png";

const LiveRoomsSection = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomTopic, setRoomTopic] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomLogo, setRoomLogo] = useState("");

  const [rooms, setRooms] = useState<Room[]>(dummyRooms);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createRoomError, setCreateRoomError] = useState<string | null>(null);

  const accessToken = localStorage.getItem("access_token");

  // Fetch the logged-in user's id up front, so it's ready for createdBy
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
        setCurrentUserId(data.id);
      } catch (err) {
        console.error("Error fetching current user for room creation:", err);
      }
    };

    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinRoom = (roomId: string) => {
    console.log("Joining room:", roomId);
  };

  const resetCreateRoomForm = () => {
    setShowCreateRoom(false);
    setSelectedUsers([]);
    setRoomName("");
    setRoomTopic("");
    setRoomDescription("");
    setRoomLogo("");
    setCreateRoomError(null);
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    if (!currentUserId) {
      setCreateRoomError("Could not identify the current user. Please try again.");
      return;
    }

    setIsCreatingRoom(true);
    setCreateRoomError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/session-room/createRoom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDescription || roomTopic || "A session room for English learners",
          logo: roomLogo || DEFAULT_ROOM_LOGO,
          createdBy: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }

      const data: CreateRoomResponse = await response.json();

      const newRoom: Room = {
        id: String(data.room.id),
        name: data.room.name,
        host: "You",
        participants: selectedUsers.length,
        maxParticipants: Math.max(selectedUsers.length, 10),
        level: "Mixed",
        topic: data.room.description,
        isLive: true,
      };

      setRooms((prev) => [newRoom, ...prev]);
      resetCreateRoomForm();
    } catch (err) {
      console.error("Error creating room:", err);
      setCreateRoomError(err instanceof Error ? err.message : "Something went wrong while creating the room.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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

  return (
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

          {createRoomError && (
            <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {createRoomError}
            </div>
          )}

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
            <textarea
              placeholder="Description (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Logo URL (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={roomLogo}
              onChange={(e) => setRoomLogo(e.target.value)}
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
              disabled={!roomName.trim() || isCreatingRoom}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition cursor-pointer"
            >
              {isCreatingRoom ? "Creating..." : "Create Room"}
            </button>
            <button
              onClick={resetCreateRoomForm}
              disabled={isCreatingRoom}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
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
  );
};

export default LiveRoomsSection;