import { Video, Phone } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  avatar: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  country: string;
  isPremium: boolean; // If partner is premium
};

const dummyPartners: Partner[] = [
  {
    id: "1",
    name: "Sophia",
    avatar: "/src/assets/images/testimonial1.png",
    level: "Intermediate",
    country: "USA",
    isPremium: true,
  },
  {
    id: "2",
    name: "James",
    avatar: "/src/assets/images/testimonial2.png",
    level: "Advanced",
    country: "India",
    isPremium: false,
  },
  {
    id: "3",
    name: "Emily",
    avatar: "/src/assets/images/testimonial3.png",
    level: "Beginner",
    country: "UK",
    isPremium: true,
  },
];

const FavoritePracticePartnerSection = () => {
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

  const currentUserIsPremium = true; // Set according to logged-in user

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Favorite Partners</h2>

      {dummyPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer flex flex-col items-center gap-4"
            >
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800">{partner.name}</h3>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${getLevelColor(
                  partner.level
                )}`}
              >
                {partner.level}
              </span>
              <p className="text-gray-500 text-sm">{partner.country}</p>

              {/* Buttons Stack */}
              <div className="flex flex-col gap-2 w-full mt-3">
                {/* Audio Call button */}
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition w-full">
                  <Phone size={16} />
                  Audio Call
                </button>

                {/* Video Call button only for premium users */}
                {currentUserIsPremium && partner.isPremium && (
                  <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition w-full">
                    <Video size={16} />
                    Video Call
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500">
          You have no favorite partners yet.
        </div>
      )}
    </div>
  );
};

export default FavoritePracticePartnerSection;
