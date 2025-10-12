import { useState, useRef, useEffect } from "react";
import { Send, Video, Phone } from "lucide-react";

type UserType = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  level: "Beginner" | "Intermediate" | "Advanced";
  country: string;
  isPremium: boolean;
};

type Message = {
  id: string;
  sender: "me" | "partner";
  text: string;
  time: string;
};

const dummyUsers: UserType[] = [
  { id: "1", name: "Sophia", avatar: "/src/assets/images/testimonial1.png", isOnline: true, level: "Intermediate", country: "USA", isPremium: true },
  { id: "2", name: "James", avatar: "/src/assets/images/testimonial2.png", isOnline: true, level: "Beginner", country: "India", isPremium: false },
  { id: "3", name: "Emily", avatar: "/src/assets/images/testimonial3.png", isOnline: false, level: "Advanced", country: "UK", isPremium: true },
  { id: "4", name: "Ryan", avatar: "/src/assets/images/testimonial1.png", isOnline: true, level: "Intermediate", country: "Canada", isPremium: false },
];

const initialMessages: Message[] = [
  { id: "1", sender: "partner", text: "Hi! How are you?", time: "3:00 PM" },
  { id: "2", sender: "me", text: "I’m good! How about you?", time: "3:01 PM" },
  { id: "3", sender: "partner", text: "Doing great, practicing English!", time: "3:02 PM" },
];

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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pt-20 lg:pt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Chat with Strangers</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Users Sidebar */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-xl p-4 overflow-y-auto max-h-[75vh]">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Online Users</h3>
          <ul className="space-y-3">
            {dummyUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition transform hover:scale-105 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelColor(user.level)}`}>
                      {user.level}
                    </span>{" "}
                    • {user.country}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        {selectedUser ? (
          <div className="lg:w-2/3 flex flex-col bg-white rounded-3xl shadow-xl max-h-[75vh] p-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLevelColor(selectedUser.level)}`}>
                      {selectedUser.level}
                    </span>{" "}
                    • {selectedUser.country}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:scale-105 transition cursor-pointer flex items-center gap-1">
                  <Phone size={16} /> Audio
                </button>
                {selectedUser.isPremium && (
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition cursor-pointer flex items-center gap-1">
                    <Video size={16} /> Video
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm animate-fadeIn ${
                      msg.sender === "me"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "bg-gray-50 text-gray-800 shadow-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs text-gray-400 block text-right mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-blue-500 text-white rounded-xl hover:scale-105 transition shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:w-2/3 flex items-center justify-center bg-white rounded-3xl shadow-xl max-h-[75vh] text-gray-400 font-semibold text-lg">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithStrangersSection;
