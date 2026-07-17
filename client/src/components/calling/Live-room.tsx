import { useState, useEffect } from "react";
import { Plus, User as UserIcon, MessageCircle, ArrowLeft, Mic, MicOff, PhoneOff, Users } from "lucide-react";

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

// A participant as shown inside the joined-room view. "You" is added on join,
// the rest are filled in from the dummy user pool since the API doesn't
// return a real participant list yet.
type RoomParticipant = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isMuted: boolean;
  isYou: boolean;
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

// Shape of the "createdBy" nested user object returned by /session-room/getListOfRooms
type RoomCreator = {
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

// Exact shape returned by GET /session-room/getListOfRooms
type ApiRoom = {
  id: number;
  name: string;
  description: string;
  logo: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  createdBy: RoomCreator;
};

const dummyUsers: User[] = [
  { id: "1", name: "Ariana", avatar: "/src/assets/images/testimonial1.png", isOnline: true, onCall: false, level: "Beginner", gender: "Female", country: "USA" },
  { id: "2", name: "David", avatar: "/src/assets/images/testimonial2.png", isOnline: true, onCall: true, level: "Intermediate", gender: "Male", country: "India" },
  { id: "3", name: "Sophie", avatar: "/src/assets/images/testimonial3.png", isOnline: false, onCall: false, level: "Advanced", gender: "Female", country: "UK" },
  { id: "4", name: "Carlos", avatar: "/src/assets/images/testimonial1.png", isOnline: true, onCall: false, level: "Intermediate", gender: "Male", country: "Spain" },
];

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;
const DEFAULT_ROOM_LOGO = "https://exam.com/logo.png";

const mapApiRoomToRoom = (r: ApiRoom): Room => ({
  id: String(r.id),
  name: r.name,
  host: r.createdBy?.user_name ?? "Unknown",
  participants: 0, // not provided by the API yet
  maxParticipants: 10, // not provided by the API yet
  level: r.createdBy?.fluencyLevel ?? "Mixed",
  topic: r.description,
  isLive: true,
});

// Formats elapsed seconds as mm:ss (or h:mm:ss once past an hour) for the
// "room running for..." timer shown inside the joined room.
const formatElapsed = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

const LiveRoomsSection = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomTopic, setRoomTopic] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomLogo, setRoomLogo] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createRoomError, setCreateRoomError] = useState<string | null>(null);

  // Joined-room view state — set once the user taps "Join Room"
  const [joinedRoom, setJoinedRoom] = useState<Room | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<RoomParticipant[]>([]);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSelfMuted, setIsSelfMuted] = useState(false);

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

  // Fetch the list of session rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setRoomsError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/session-room/getListOfRooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }

        const data: ApiRoom[] = await response.json();
        setRooms(data.map(mapApiRoomToRoom));
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setRoomsError(err instanceof Error ? err.message : "Something went wrong while fetching rooms.");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ticks the "room running for..." timer once a second while inside a joined room
  useEffect(() => {
    if (!joinedRoom || !joinedAt) return;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - joinedAt.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [joinedRoom, joinedAt]);

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (room.participants >= room.maxParticipants) return;

    console.log("Joining room:", roomId);

    // Since the API doesn't return a real participant list yet, seed the
    // joined-room view with a slice of the dummy pool plus the current user.
    const seededParticipants: RoomParticipant[] = dummyUsers
      .slice(0, Math.max(room.participants, 0))
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        isOnline: u.isOnline,
        isMuted: false,
        isYou: false,
      }));

    seededParticipants.push({
      id: "you",
      name: "You",
      avatar: "/src/assets/images/testimonial1.png",
      isOnline: true,
      isMuted: false,
      isYou: true,
    });

    setRoomParticipants(seededParticipants);
    setJoinedRoom(room);
    setJoinedAt(new Date());
    setElapsedSeconds(0);
    setIsSelfMuted(false);

    // Reflect the new participant count on the room card behind the scenes,
    // so "Room Full" and the progress bar stay accurate once the user leaves.
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, participants: Math.min(r.participants + 1, r.maxParticipants) } : r
      )
    );
  };

  const handleLeaveRoom = () => {
    if (!joinedRoom) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === joinedRoom.id ? { ...r, participants: Math.max(r.participants - 1, 0) } : r
      )
    );

    setJoinedRoom(null);
    setRoomParticipants([]);
    setJoinedAt(null);
    setElapsedSeconds(0);
    setIsSelfMuted(false);
  };

  const toggleSelfMute = () => {
    setIsSelfMuted((prev) => !prev);
    setRoomParticipants((prev) =>
      prev.map((p) => (p.isYou ? { ...p, isMuted: !p.isMuted } : p))
    );
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

  // --- Joined room view --------------------------------------------------
  // Shown instead of the room list once the user taps "Join Room". Keeps the
  // same visual language (gradient buttons, rounded-2xl cards) as the rest
  // of the page.
  if (joinedRoom) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 pt-20 lg:pt-6">
        <button
          onClick={handleLeaveRoom}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Live Rooms
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Room banner */}
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{joinedRoom.name}</h2>
                  {joinedRoom.isLive && (
                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                      LIVE • {formatElapsed(elapsedSeconds)}
                    </span>
                  )}
                </div>
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <UserIcon size={14} />
                  Hosted by {joinedRoom.host}
                </p>
                <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                  <MessageCircle size={14} />
                  {joinedRoom.topic}
                </p>
              </div>
              <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold bg-white/20`}>
                {joinedRoom.level} level
              </span>
            </div>
          </div>

          {/* Participants */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-gray-500" />
                Participants ({roomParticipants.length}/{joinedRoom.maxParticipants})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {roomParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                    participant.isYou ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                    {participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {participant.name}
                      {participant.isYou && <span className="text-xs text-purple-600 font-medium"> (you)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{participant.isOnline ? "In room" : "Offline"}</p>
                  </div>
                  {participant.isMuted ? (
                    <MicOff size={16} className="text-gray-400" />
                  ) : (
                    <Mic size={16} className="text-green-500" />
                  )}
                </div>
              ))}
            </div>

            {/* Room status bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${(roomParticipants.length / joinedRoom.maxParticipants) * 100}%` }}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={toggleSelfMute}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition hover:scale-105 cursor-pointer ${
                  isSelfMuted
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                }`}
              >
                {isSelfMuted ? <MicOff size={18} /> : <Mic size={18} />}
                {isSelfMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={handleLeaveRoom}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition cursor-pointer"
              >
                <PhoneOff size={18} />
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {loadingRooms ? (
        <p className="text-center text-gray-500 py-12">Loading rooms...</p>
      ) : roomsError ? (
        <p className="text-center text-red-500 py-12">{roomsError}</p>
      ) : rooms.length > 0 ? (
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
      ) : (
        <p className="text-center text-gray-500 py-12">No live rooms yet. Be the first to create one!</p>
      )}
    </div>
  );
};

export default LiveRoomsSection;