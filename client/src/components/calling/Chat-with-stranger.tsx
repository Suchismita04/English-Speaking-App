import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Video, Phone, Search, MoreVertical, Smile, Paperclip, Crown } from "lucide-react";
import { io, Socket } from "socket.io-client";

type UserType = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  level: "Beginner" | "Intermediate" | "Advanced";
  country: string;
  isPremium: boolean;
  lastMessage?: string;
  unreadCount?: number;
};

type Message = {
  id: string;
  sender: "me" | "partner";
  text: string;
  time: string;
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

// Minimal shape needed from /user/getUserProfile
type ApiUserProfile = {
  id: number;
  user_name: string;
};

// Incoming socket message payload — adjust the event name / field names once
// confirmed against your backend's actual Socket.IO emit contract.
type IncomingSocketMessage = {
  from: string | number;
  text: string;
};

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;

const getDefaultAvatar = (gender: ApiUser["gender"]) => {
  if (gender === "Female") return "/src/assets/images/testimonial3.png";
  if (gender === "Male") return "/src/assets/images/testimonial2.png";
  return "/src/assets/images/testimonial1.png";
};

const mapApiUserToUserType = (u: ApiUser): UserType => ({
  id: String(u.id),
  name: u.user_name,
  avatar: getDefaultAvatar(u.gender),
  isOnline: u.isOnline,
  level: u.fluencyLevel ?? "Beginner",
  country: u.country ?? "Unknown",
  isPremium: false, // not provided by API yet
  lastMessage: "",
  unreadCount: 0,
});

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner": return "bg-green-100 text-green-700";
    case "Intermediate": return "bg-blue-100 text-blue-700";
    case "Advanced": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const ChatWithStrangersSection = () => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Messages are stored per-user, keyed by user id, so each conversation stays independent
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>({});

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserIsPremium = true;

  // API-driven users state
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Logged-in user's own id, used to exclude self from the chat list
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Socket.IO connection
  const socketRef = useRef<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketStatusMessage, setSocketStatusMessage] = useState<string | null>(null);

  const currentMessages = selectedUser ? messagesByUser[selectedUser.id] ?? [] : [];
  const isTyping = selectedUser ? typingUserId === selectedUser.id : false;

  // Fetch the logged-in user's own profile, so we can exclude them from the chat list
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

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
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);

      try {
        const accessToken = localStorage.getItem("access_token");

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
        setUsers(data.map(mapApiUserToUserType));
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError(err instanceof Error ? err.message : "Something went wrong while fetching users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Connect via Socket.IO (not raw WebSocket) using the stored access token
  const handleIncomingMessage = useCallback((data: IncomingSocketMessage) => {
    if (!data?.text || data?.from === undefined) return;

    const fromId = String(data.from);
    const incoming: Message = {
      id: Date.now().toString(),
      sender: "partner",
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Route the incoming message into that specific user's conversation only
    setMessagesByUser((prev) => ({
      ...prev,
      [fromId]: [...(prev[fromId] ?? []), incoming],
    }));
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.warn("No access_token found in localStorage — skipping socket connection.");
      setSocketStatusMessage("Not logged in — chat is offline.");
      return;
    }

    // Socket.IO client handles its own handshake, reconnection and backoff —
    // no need to manually manage WebSocket readyState or reconnect timers.
    const socket = io(RAW_BASE_URL, {
      query: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
      setIsSocketConnected(true);
      setSocketStatusMessage(null);
    });

    // Adjust "receive_message" / "message" to whatever event name your backend
    // actually emits — check this against what worked in EchoAPI.
    socket.on("message", handleIncomingMessage);
    socket.on("receive_message", handleIncomingMessage);

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
      setIsSocketConnected(false);
      setSocketStatusMessage(reason === "io server disconnect" ? "Disconnected by server." : "Reconnecting...");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setSocketStatusMessage(`Connection error: ${err.message}`);
    });

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("receive_message", handleIncomingMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [handleIncomingMessage]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedUser) return;

    const targetId = selectedUser.id;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Append only to the conversation with this specific user
    setMessagesByUser((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] ?? []), newMessage],
    }));

    // Emit over Socket.IO if connected — adjust "send_message" to your backend's
    // actual event name (whatever you called in EchoAPI to send successfully).
    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", {
        to: targetId,
        text: inputText,
      });
    } else {
      console.warn("Socket not connected — message saved locally but not sent to server.");
    }

    setInputText("");

    // Simulate typing indicator scoped to this conversation only
    setTypingUserId(targetId);
    setTimeout(() => {
      setTypingUserId((current) => (current === targetId ? null : current));
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const filteredUsers = users
    .filter((user) => user.id !== currentUserId) // exclude yourself from the chat list
    .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white px-4 py-6 pt-20 lg:pt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Messages</h2>
          <p className="text-gray-600">
            Connect and practice with learners worldwide
            {isSocketConnected && (
              <span className="ml-2 text-xs text-green-600 font-semibold">• Live</span>
            )}
            {!isSocketConnected && socketStatusMessage && (
              <span className="ml-2 text-xs text-orange-500 font-semibold">• {socketStatusMessage}</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Users Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <p className="text-center text-gray-500 py-8 px-4">Loading users...</p>
              ) : usersError ? (
                <p className="text-center text-red-500 py-8 px-4">{usersError}</p>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const userMessages = messagesByUser[user.id] ?? [];
                  const lastMsg = userMessages[userMessages.length - 1];

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 ${
                        selectedUser?.id === user.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                        />
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                        {user.isPremium && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-1">
                            <Crown size={10} className="text-white" fill="currentColor" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                          {user.unreadCount! > 0 && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {user.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {lastMsg ? lastMsg.text : user.lastMessage || "No messages yet"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelColor(user.level)}`}>
                            {user.level}
                          </span>
                          <span className="text-xs text-gray-400">{user.country}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-8 px-4">No users found.</p>
              )}
            </div>
          </div>

          {/* Chat Window */}
          {selectedUser ? (
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow object-cover"
                    />
                    {selectedUser.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{selectedUser.name}</p>
                      {selectedUser.isPremium && (
                        <Crown size={14} className="text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelColor(selectedUser.level)}`}>
                        {selectedUser.level}
                      </span>
                      <span className="text-xs text-gray-500">{selectedUser.country}</span>
                      {selectedUser.isOnline && (
                        <span className="text-xs text-green-600 font-medium">• Online</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition shadow-md">
                    <Phone size={18} />
                  </button>
                  {currentUserIsPremium && selectedUser.isPremium && (
                    <button className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:scale-105 transition shadow-md">
                      <Video size={18} />
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
                {currentMessages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No messages yet. Say hello to {selectedUser.name}!
                  </p>
                )}

                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-fadeIn`}
                  >
                    <div className={`flex items-end gap-2 max-w-[70%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
                      {msg.sender === "partner" && (
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.sender === "me"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <span className={`text-xs text-gray-400 mt-1 block ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator for chat*/}
                {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex items-end gap-2 max-w-[70%]">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                      <div className="bg-white text-gray-800 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area for chat*/}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Smile size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className={`p-3 rounded-xl transition shadow-lg ${
                      inputText.trim()
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={40} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Conversation</h3>
                <p className="text-gray-500">Choose a user from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWithStrangersSection;