export const DEMO_USERS = [
  { id: 'usr_admin', phone: '+8801700000001', name: 'Admin User', email: 'admin@coxbeach.com', role: 'ADMIN', password: 'Admin@123' },
  { id: 'usr_manager', phone: '+8801700000002', name: 'Hotel Manager', email: 'manager@coxbeach.com', role: 'MANAGER', password: 'Manager@123' },
  { id: 'usr_agent', phone: '+8801700000003', name: 'Travel Agent', email: 'agent@coxbeach.com', role: 'AGENT', password: 'Agent@123' },
  { id: 'usr_customer', phone: '+8801700000004', name: 'Customer', email: 'customer@coxbeach.com', role: 'CUSTOMER', password: 'Customer@123' },
];

export const DEMO_REVIEWS = [
  { id: 'rev_1', rating: 5, title: 'Amazing stay!', body: 'Breathtaking view and incredibly friendly staff. Will come back!', user: { name: 'Rahim Ahmed' }, createdAt: '2026-05-15T10:00:00Z' },
  { id: 'rev_2', rating: 4, title: 'Great value', body: 'Good facilities and very clean rooms. Recommended.', user: { name: 'Karim Khan' }, createdAt: '2026-05-20T14:30:00Z' },
  { id: 'rev_3', rating: 5, title: 'Perfect vacation', body: 'Everything was perfect from check-in to check-out. Beach right there!', user: { name: 'Nusrat Islam' }, createdAt: '2026-06-01T09:00:00Z' },
];

export const DEMO_HOTELS = [
  {
    id: 'hotel_1',
    name: 'Ocean Paradise Resort',
    slug: 'ocean-paradise',
    description: "A luxurious beachfront resort with panoramic views of the Bay of Bengal. Enjoy world-class amenities, fresh seafood, and direct beach access just steps from your room.",
    address: "Marine Drive, Kolatoli, Cox's Bazar",
    city: "Cox's Bazar",
    starRating: 'FIVE_STAR',
    amenities: ['Swimming Pool', 'Free WiFi', 'Restaurant', 'Beach Access', 'Spa', 'Gym', 'Air Conditioning', 'Room Service'],
    photos: [],
    status: 'APPROVED',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    avgRating: 4.7,
    _count: { reviews: 124, rooms: 2 },
    reviews: DEMO_REVIEWS,
    rooms: [
      { id: 'room_1_std', hotelId: 'hotel_1', name: 'Standard Sea View', type: 'STANDARD', description: 'Comfortable room with partial sea view', basePriceBdt: 5000, maxGuests: 2, totalUnits: 20, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water'], isActive: true },
      { id: 'room_1_dlx', hotelId: 'hotel_1', name: 'Deluxe Ocean Suite', type: 'DELUXE', description: 'Spacious suite with full ocean view and private balcony', basePriceBdt: 8000, maxGuests: 3, totalUnits: 10, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water', 'Balcony', 'Mini Bar'], isActive: true },
    ],
  },
  {
    id: 'hotel_2',
    name: 'Seashore Inn',
    slug: 'seashore-inn',
    description: "A charming boutique hotel with warm hospitality and stunning beach views. Perfect for budget-conscious travelers who don't want to compromise on quality.",
    address: "Sugandha Point, Cox's Bazar",
    city: "Cox's Bazar",
    starRating: 'THREE_STAR',
    amenities: ['Free WiFi', 'Restaurant', 'Beach Access', 'Air Conditioning', 'Parking'],
    photos: [],
    status: 'APPROVED',
    checkInTime: '13:00',
    checkOutTime: '11:00',
    avgRating: 4.2,
    _count: { reviews: 67, rooms: 1 },
    reviews: DEMO_REVIEWS.slice(0, 2),
    rooms: [
      { id: 'room_2_std', hotelId: 'hotel_2', name: 'Beach View Room', type: 'STANDARD', description: 'Cozy room with beach view', basePriceBdt: 3500, maxGuests: 2, totalUnits: 15, photos: [], amenities: ['AC', 'WiFi', 'TV'], isActive: true },
    ],
  },
  {
    id: 'hotel_3',
    name: 'Long Beach Grand',
    slug: 'long-beach-grand',
    description: "Experience the longest sea beach in the world from our premium resort. Modern facilities, multiple dining options, and exceptional service await you.",
    address: "Kolatoli Road, Cox's Bazar",
    city: "Cox's Bazar",
    starRating: 'FOUR_STAR',
    amenities: ['Swimming Pool', 'Free WiFi', 'Restaurant', 'Beach Access', 'Gym', 'Conference Room', 'Air Conditioning'],
    photos: [],
    status: 'APPROVED',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    avgRating: 4.5,
    _count: { reviews: 89, rooms: 2 },
    reviews: DEMO_REVIEWS.slice(0, 1),
    rooms: [
      { id: 'room_3_std', hotelId: 'hotel_3', name: 'Superior Room', type: 'STANDARD', description: 'Well-appointed room with modern furnishings', basePriceBdt: 4500, maxGuests: 2, totalUnits: 30, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water', 'Safety Box'], isActive: true },
      { id: 'room_3_fam', hotelId: 'hotel_3', name: 'Family Suite', type: 'SUITE', description: 'Large suite perfect for families with a living area and kitchenette', basePriceBdt: 9000, maxGuests: 5, totalUnits: 5, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water', 'Living Room', 'Kitchenette'], isActive: true },
    ],
  },
];

export function calcPricing(basePricePerNight: number, nights: number, hasAgent: boolean) {
  const base = basePricePerNight * nights;
  const vatRate = 0.15;
  const platformRate = 0.05;
  const agentRate = hasAgent ? 0.08 : 0;
  const vat = Math.round(base * vatRate);
  const platform = Math.round(base * platformRate);
  const agent = Math.round(base * agentRate);
  return {
    baseTotalBdt: base,
    vatBdt: vat,
    platformFeeBdt: platform,
    agentCommBdt: agent,
    grandTotalBdt: base + vat + platform + agent,
    nights,
    pricePerNight: basePricePerNight,
    rates: { vatRate, platformFeeRate: platformRate, agentCommRate: agentRate },
  };
}
