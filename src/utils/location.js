import { useGoalStore } from "../store/goalStore";

// Mirrors GoalManager.calculateSteps()
export const calculateSteps = (fromCoord, toCoord) => {
  const R = 6371000; // Earth radius in meters
  const lat1 = (fromCoord.latitude * Math.PI) / 180;
  const lat2 = (toCoord.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((toCoord.longitude - fromCoord.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.floor(distance / 0.76);
};

// Reverse geocode using nominatim (free, no API key)
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { headers: { "Accept-Language": "en", "User-Agent": "lepesrol-lepesre-app" } },
    );
    const data = await res.json();
    const city =
      data.address?.city ?? data.address?.town ?? data.address?.village ?? "";
    const country = data.address?.country ?? "";
    return `${city}, ${country}`;
  } catch {
    return "Unknown Location";
  }
};

// Search locations using nominatim
export const searchLocations = async (query) => {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en", "User-Agent": "lepesrol-lepesre-app" } },
    );
    const data = await res.json();
    return data.map((item) => ({
      name: item.display_name.split(",")[0],
      fullName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
};

