import { useState } from "react";
import { Users, PhoneCall,TrendingUp,History, MessageCircle, FileHeart, User as UserIcon, Menu, X } from "lucide-react";
import VideoCallSection from "./Random-call";
import LiveRoomsSection from "./Live-room";
import ProgressSection from "./Progress";
import ProfileSection from "./Profile";

const Call = () => {
  const [activeTab, setActiveTab] = useState<"call" | "rooms" | "progress" | "profile">("call");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "call" as const, label: "Talk with Strangers", icon: PhoneCall },
    { id: "rooms" as const, label: "Live Rooms", icon: Users },
    { id: "progress" as const, label: "Progress", icon: TrendingUp },
        { id: "history" as const, label: "Call History", icon: History },
    { id: "favorites" as const, label: "Favorite Partner", icon: FileHeart },
    { id: "chat" as const, label: "Chat with Strangers", icon: MessageCircle },
    { id: "profile" as const, label: "Profile", icon: UserIcon },

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

        {/* Render Active Section */}
        {activeTab === "call" && <VideoCallSection />}
        {activeTab === "rooms" && <LiveRoomsSection />}
        {activeTab === "progress" && <ProgressSection />}
        {activeTab === "profile" && <ProfileSection />}
      </div>
    </div>
  );
};

export default Call;