import { useState } from "react";
import { Video, Phone, Clock, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type CallHistory = {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  callType: "Audio" | "Video";
  duration: string;
  topic: string;
  date: string;
  partnerLevel: "Beginner" | "Intermediate" | "Advanced";
};

const dummyCallHistory: CallHistory[] = [
  {
    id: "1",
    partnerName: "Ariana",
    partnerAvatar: "/src/assets/images/testimonial1.png",
    callType: "Video",
    duration: "24m 32s",
    topic: "Travel Conversations",
    date: "Oct 10, 2025",
    partnerLevel: "Beginner",
  },
  {
    id: "2",
    partnerName: "David",
    partnerAvatar: "/src/assets/images/testimonial2.png",
    callType: "Audio",
    duration: "17m 12s",
    topic: "Daily Routine Talk",
    date: "Oct 8, 2025",
    partnerLevel: "Intermediate",
  },
  {
    id: "3",
    partnerName: "Sophie",
    partnerAvatar: "/src/assets/images/testimonial3.png",
    callType: "Video",
    duration: "32m 45s",
    topic: "Interview Practice",
    date: "Oct 5, 2025",
    partnerLevel: "Advanced",
  },
];

const CallHistorySection = () => {
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleFavorite = (id: string) => {
    if (!favoriteRequests.includes(id)) {
      setFavoriteRequests([...favoriteRequests, id]);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-blue-100 text-blue-700";
      case "Advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-20 lg:pt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Call History
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {dummyCallHistory.map((call, index) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
            onClick={() =>
              navigate(`/profile/${call.partnerName.toLowerCase()}`, {
                state: { user: call },
              })
            }
          >
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <img
                src={call.partnerAvatar}
                alt={call.partnerName}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {call.partnerName}
                </h3>
                <p
                  className={`text-xs px-3 py-0.5 mt-1 rounded-full inline-block ${getLevelColor(
                    call.partnerLevel
                  )}`}
                >
                  {call.partnerLevel}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  {call.callType === "Video" ? (
                    <Video className="text-purple-500" size={18} />
                  ) : (
                    <Phone className="text-blue-500" size={18} />
                  )}
                  <span className="text-sm font-medium">
                    {call.callType} Call
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">{call.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="text-green-500" size={16} />
                <span className="text-sm">Topic: {call.topic}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-3">
                <p className="text-xs text-gray-500">{call.date}</p>

                <button
                  className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full transition ${
                    favoriteRequests.includes(call.id)
                      ? "bg-yellow-100 text-yellow-600 cursor-default"
                      : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:scale-105"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(call.id);
                  }}
                  disabled={favoriteRequests.includes(call.id)}
                >
                  <Star
                    size={14}
                    className={
                      favoriteRequests.includes(call.id)
                        ? "text-yellow-500"
                        : "text-white"
                    }
                  />
                  {favoriteRequests.includes(call.id)
                    ? "Request Sent"
                    : "Send Favorite Request"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CallHistorySection;
