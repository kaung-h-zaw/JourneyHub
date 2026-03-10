import { MapPin, Star, DollarSign, Wifi, Coffee, Utensils } from "lucide-react";

const HotelCard = ({ hotel, onSelect }) => {
  const {
    name,
    address,
    rating = 0,
    price,
    image,
    amenities = [],
    distance,
  } = hotel;

  const amenityIcons = {
    wifi: Wifi,
    breakfast: Coffee,
    restaurant: Utensils,
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200">
      {/* Hotel Image */}
      <div className="relative h-48 bg-gray-200">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-4xl">🏨</span>
          </div>
        )}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-md flex items-center gap-1">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{name}</h3>

        {address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}

        {distance && (
          <p className="text-sm text-gray-500 mb-3">
            {distance} from city center
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {amenities.slice(0, 3).map((amenity, index) => {
              const Icon = amenityIcons[amenity.toLowerCase()] || Coffee;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                >
                  <Icon size={14} />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Price and Select Button */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="flex items-center gap-1 text-primary">
              <DollarSign size={20} />
              <span className="text-2xl font-bold">{price}</span>
            </div>
            <span className="text-xs text-gray-500">per night</span>
          </div>
          {onSelect && (
            <button
              onClick={() => onSelect(hotel)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
