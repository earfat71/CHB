export const DEMO_USERS = [
  { id: 'usr_admin', phone: '+8801700000001', name: 'Admin User', email: 'admin@coxbeach.com', role: 'ADMIN', status: 'ACTIVE', password: 'Admin@123', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'usr_manager', phone: '+8801700000002', name: 'Hotel Manager', email: 'manager@coxbeach.com', role: 'MANAGER', status: 'ACTIVE', password: 'Manager@123', createdAt: '2026-01-05T00:00:00Z' },
  { id: 'usr_agent', phone: '+8801700000003', name: 'Travel Agent', email: 'agent@coxbeach.com', role: 'AGENT', status: 'ACTIVE', password: 'Agent@123', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'usr_customer', phone: '+8801700000004', name: 'Customer User', email: 'customer@coxbeach.com', role: 'CUSTOMER', status: 'ACTIVE', password: 'Customer@123', createdAt: '2026-01-15T00:00:00Z' },
  { id: 'usr_c2', phone: '+8801711111111', name: 'Karim Ahmed', email: 'karim@example.com', role: 'CUSTOMER', status: 'ACTIVE', password: '', createdAt: '2026-02-01T00:00:00Z' },
  { id: 'usr_c3', phone: '+8801722222222', name: 'Nusrat Jahan', email: 'nusrat@example.com', role: 'CUSTOMER', status: 'ACTIVE', password: '', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'usr_c4', phone: '+8801733333333', name: 'Rahim Khan', email: 'rahim@example.com', role: 'CUSTOMER', status: 'BANNED', password: '', createdAt: '2026-03-01T00:00:00Z' },
];

export let DEMO_CONFIGS = [
  { key: 'VAT_RATE', value: '0.15', description: 'VAT rate applied to all bookings (e.g. 0.15 = 15%)' },
  { key: 'PLATFORM_FEE_RATE', value: '0.08', description: 'Platform service fee rate (e.g. 0.08 = 8%)' },
  { key: 'AGENT_COMM_RATE', value: '0.05', description: 'Agent commission rate on bookings (e.g. 0.05 = 5%)' },
  { key: 'OTP_EXPIRY_MINUTES', value: '5', description: 'OTP validity window in minutes' },
  { key: 'BOOKING_HOLD_MINUTES', value: '10', description: 'How long a booking hold is reserved before releasing' },
  { key: 'MAX_PHOTOS_PER_HOTEL', value: '20', description: 'Maximum photos allowed per hotel listing' },
  { key: 'AGENT_ATTRIBUTION_HOURS', value: '24', description: 'Agent QR attribution window in hours' },
];

export const DEMO_REVIEWS = [
  { id: 'rev_1', rating: 5, title: 'Amazing stay!', body: 'Breathtaking view and incredibly friendly staff. Will definitely come back!', status: 'APPROVED', user: { name: 'Rahim Ahmed' }, hotel: { name: 'Ocean Paradise Resort' }, createdAt: '2026-05-15T10:00:00Z' },
  { id: 'rev_2', rating: 4, title: 'Great value', body: 'Good facilities and very clean rooms. Highly recommended.', status: 'APPROVED', user: { name: 'Karim Khan' }, hotel: { name: 'Seashore Inn' }, createdAt: '2026-05-20T14:30:00Z' },
  { id: 'rev_3', rating: 5, title: 'Perfect vacation', body: 'Everything was perfect from check-in to check-out. Beach right at the doorstep!', status: 'APPROVED', user: { name: 'Nusrat Islam' }, hotel: { name: 'Long Beach Grand' }, createdAt: '2026-06-01T09:00:00Z' },
  { id: 'rev_4', rating: 2, title: 'Disappointing', body: 'Room was not as described. AC was broken and staff was slow to respond.', status: 'PENDING', user: { name: 'Rahim Khan' }, hotel: { name: 'Ocean Paradise Resort' }, createdAt: '2026-06-10T11:00:00Z' },
  { id: 'rev_5', rating: 3, title: 'Average experience', body: 'Nothing special but decent for the price. Location is great though.', status: 'PENDING', user: { name: 'Karim Ahmed' }, hotel: { name: 'Long Beach Grand' }, createdAt: '2026-06-15T16:00:00Z' },
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
    reviews: [] as typeof DEMO_REVIEWS,
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
    reviews: [] as typeof DEMO_REVIEWS,
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
    reviews: [] as typeof DEMO_REVIEWS,
    rooms: [
      { id: 'room_3_std', hotelId: 'hotel_3', name: 'Superior Room', type: 'STANDARD', description: 'Well-appointed room with modern furnishings', basePriceBdt: 4500, maxGuests: 2, totalUnits: 30, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water', 'Safety Box'], isActive: true },
      { id: 'room_3_fam', hotelId: 'hotel_3', name: 'Family Suite', type: 'SUITE', description: 'Large suite perfect for families', basePriceBdt: 9000, maxGuests: 5, totalUnits: 5, photos: [], amenities: ['AC', 'WiFi', 'TV', 'Hot Water', 'Living Room', 'Kitchenette'], isActive: true },
    ],
  },
  {
    id: 'hotel_4',
    name: 'Bay View Hotel',
    slug: 'bay-view',
    description: "Modern hotel with stunning bay views and all essential amenities for a comfortable stay.",
    address: "Kolatoli Beach Road, Cox's Bazar",
    city: "Cox's Bazar",
    starRating: 'THREE_STAR',
    amenities: ['Free WiFi', 'Restaurant', 'Air Conditioning', 'Parking'],
    photos: [],
    status: 'PENDING_APPROVAL',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    avgRating: 0,
    _count: { reviews: 0, rooms: 1 },
    reviews: [] as typeof DEMO_REVIEWS,
    rooms: [
      { id: 'room_4_std', hotelId: 'hotel_4', name: 'Standard Room', type: 'STANDARD', description: 'Clean comfortable room', basePriceBdt: 3000, maxGuests: 2, totalUnits: 20, photos: [], amenities: ['AC', 'WiFi', 'TV'], isActive: true },
    ],
  },
];

// Initialise reviews inside hotels after both arrays exist
DEMO_HOTELS[0].reviews = DEMO_REVIEWS.filter((r) => r.hotel.name === 'Ocean Paradise Resort' && r.status === 'APPROVED');
DEMO_HOTELS[1].reviews = DEMO_REVIEWS.filter((r) => r.hotel.name === 'Seashore Inn' && r.status === 'APPROVED');
DEMO_HOTELS[2].reviews = DEMO_REVIEWS.filter((r) => r.hotel.name === 'Long Beach Grand' && r.status === 'APPROVED');

// Pricing model (§4.8): VAT 15%, Platform fee 8%, Agent comm 5% — all on room subtotal
// bk_1: base=10000, vat=1500(15%), fee=800(8%), comm=500(5%) => total=12800
// bk_2: base=7000, vat=1050, fee=560, comm=0 => total=8610
// bk_3: base=9000, vat=1350, fee=720, comm=450 => total=11520
// bk_4: base=10000, vat=1500, fee=800, comm=0 => total=12300
// bk_5: base=9000, vat=1350, fee=720, comm=450 => total=11520
export const DEMO_BOOKINGS = [
  { id: 'bk_1', bookingRef: 'CBZ-2026-001', userId: 'usr_customer', hotelId: 'hotel_1', status: 'CONFIRMED', checkIn: '2026-07-01', checkOut: '2026-07-03', nights: 2, guestCount: 2, guestName: 'Customer User', guestPhone: '+8801700000004', baseTotalBdt: 10000, platformFeeBdt: 800, agentCommBdt: 500, vatBdt: 1500, grandTotalBdt: 12800, user: { name: 'Customer User' }, hotel: { name: 'Ocean Paradise Resort' }, createdAt: '2026-06-20T10:00:00Z' },
  { id: 'bk_2', bookingRef: 'CBZ-2026-002', userId: 'usr_c2', hotelId: 'hotel_2', status: 'CONFIRMED', checkIn: '2026-07-05', checkOut: '2026-07-07', nights: 2, guestCount: 2, guestName: 'Karim Ahmed', guestPhone: '+8801711111111', baseTotalBdt: 7000, platformFeeBdt: 560, agentCommBdt: 0, vatBdt: 1050, grandTotalBdt: 8610, user: { name: 'Karim Ahmed' }, hotel: { name: 'Seashore Inn' }, createdAt: '2026-06-21T12:00:00Z' },
  { id: 'bk_3', bookingRef: 'CBZ-2026-003', userId: 'usr_c3', hotelId: 'hotel_3', status: 'PENDING_PAYMENT', checkIn: '2026-07-10', checkOut: '2026-07-12', nights: 2, guestCount: 3, guestName: 'Nusrat Jahan', guestPhone: '+8801722222222', baseTotalBdt: 9000, platformFeeBdt: 720, agentCommBdt: 450, vatBdt: 1350, grandTotalBdt: 11520, user: { name: 'Nusrat Jahan' }, hotel: { name: 'Long Beach Grand' }, createdAt: '2026-06-22T14:00:00Z' },
  { id: 'bk_4', bookingRef: 'CBZ-2026-004', userId: 'usr_customer', hotelId: 'hotel_1', status: 'CHECKED_OUT', checkIn: '2026-06-10', checkOut: '2026-06-12', nights: 2, guestCount: 2, guestName: 'Customer User', guestPhone: '+8801700000004', baseTotalBdt: 10000, platformFeeBdt: 800, agentCommBdt: 0, vatBdt: 1500, grandTotalBdt: 12300, user: { name: 'Customer User' }, hotel: { name: 'Ocean Paradise Resort' }, createdAt: '2026-06-05T09:00:00Z' },
  { id: 'bk_5', bookingRef: 'CBZ-2026-005', userId: 'usr_c2', hotelId: 'hotel_3', status: 'CANCELLED', checkIn: '2026-06-20', checkOut: '2026-06-22', nights: 2, guestCount: 2, guestName: 'Karim Ahmed', guestPhone: '+8801711111111', baseTotalBdt: 9000, platformFeeBdt: 720, agentCommBdt: 450, vatBdt: 1350, grandTotalBdt: 11520, user: { name: 'Karim Ahmed' }, hotel: { name: 'Long Beach Grand' }, createdAt: '2026-06-10T08:00:00Z' },
];

export const DEMO_AGENTS = [
  { id: 'ag_1', userId: 'usr_agent', agentCode: 'AG-001', name: 'Travel Agent', phone: '+8801700000003', nidLast4: '****5678', totalBookings: 42, totalCommissionBdt: 185600, pendingCommissionBdt: 24800, status: 'ACTIVE', joinedAt: '2026-01-10T00:00:00Z' },
  { id: 'ag_2', userId: 'usr_c5', agentCode: 'AG-002', name: 'Salam Tours', phone: '+8801744444444', nidLast4: '****1234', totalBookings: 28, totalCommissionBdt: 112400, pendingCommissionBdt: 18200, status: 'ACTIVE', joinedAt: '2026-02-01T00:00:00Z' },
  { id: 'ag_3', userId: 'usr_c6', agentCode: 'AG-003', name: 'Cox Travel Hub', phone: '+8801755555555', nidLast4: '****9012', totalBookings: 15, totalCommissionBdt: 58000, pendingCommissionBdt: 8600, status: 'ACTIVE', joinedAt: '2026-03-15T00:00:00Z' },
];

export const DEMO_SETTLEMENTS = {
  agents: [
    { id: 'as_1', agentName: 'Travel Agent', agentCode: 'AG-001', period: 'June 2026', totalBookings: 12, commissionBdt: 48600, status: 'PENDING', createdAt: '2026-06-30T00:00:00Z' },
    { id: 'as_2', agentName: 'Salam Tours', agentCode: 'AG-002', period: 'June 2026', totalBookings: 8, commissionBdt: 32400, status: 'PENDING', createdAt: '2026-06-30T00:00:00Z' },
    { id: 'as_3', agentName: 'Travel Agent', agentCode: 'AG-001', period: 'May 2026', totalBookings: 18, commissionBdt: 72800, status: 'PAID', createdAt: '2026-05-31T00:00:00Z' },
  ],
  hotels: [
    { id: 'hs_1', hotelName: 'Ocean Paradise Resort', period: 'June 2026', totalBookings: 24, netRevenueBdt: 216000, status: 'PENDING', createdAt: '2026-06-30T00:00:00Z' },
    { id: 'hs_2', hotelName: 'Seashore Inn', period: 'June 2026', totalBookings: 11, netRevenueBdt: 72600, status: 'PENDING', createdAt: '2026-06-30T00:00:00Z' },
    { id: 'hs_3', hotelName: 'Ocean Paradise Resort', period: 'May 2026', totalBookings: 38, netRevenueBdt: 342000, status: 'PAID', createdAt: '2026-05-31T00:00:00Z' },
  ],
};

export const DEMO_LEDGER = [
  { id: 'le_1', bookingRef: 'CBZ-2026-001', type: 'DEBIT', account: 'GUEST_RECEIVABLE', amountBdt: 12800, description: 'Booking payment received', createdAt: '2026-06-20T10:05:00Z' },
  { id: 'le_2', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'PLATFORM_REVENUE', amountBdt: 500, description: 'Platform fee', createdAt: '2026-06-20T10:05:00Z' },
  { id: 'le_3', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'VAT_PAYABLE', amountBdt: 1500, description: 'VAT collected', createdAt: '2026-06-20T10:05:00Z' },
  { id: 'le_4', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'AGENT_COMMISSION_PAYABLE', amountBdt: 800, description: 'Agent commission payable', createdAt: '2026-06-20T10:05:00Z' },
  { id: 'le_5', bookingRef: 'CBZ-2026-001', type: 'CREDIT', account: 'HOTEL_PAYABLE', amountBdt: 10000, description: 'Hotel revenue payable', createdAt: '2026-06-20T10:05:00Z' },
  { id: 'le_6', bookingRef: 'CBZ-2026-002', type: 'DEBIT', account: 'GUEST_RECEIVABLE', amountBdt: 8400, description: 'Booking payment received', createdAt: '2026-06-21T12:05:00Z' },
  { id: 'le_7', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'PLATFORM_REVENUE', amountBdt: 350, description: 'Platform fee', createdAt: '2026-06-21T12:05:00Z' },
  { id: 'le_8', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'VAT_PAYABLE', amountBdt: 1050, description: 'VAT collected', createdAt: '2026-06-21T12:05:00Z' },
  { id: 'le_9', bookingRef: 'CBZ-2026-002', type: 'CREDIT', account: 'HOTEL_PAYABLE', amountBdt: 7000, description: 'Hotel revenue payable', createdAt: '2026-06-21T12:05:00Z' },
];

export let DEMO_CMS = [
  {
    key: 'about',
    title: 'About CoxBeach',
    content: `CoxBeach is Bangladesh's premier hotel booking platform dedicated to Cox's Bazar — the world's longest natural sea beach.

## Our Mission

We connect travellers with the finest hotels and resorts across Cox's Bazar, providing transparent pricing and seamless bookings. Every booking includes a clear breakdown: room rate + VAT (15%) + platform fee (8%) + optional agent commission (5%).

## Why Choose CoxBeach?

- **Local expertise**: We know every stretch of beach from Kolatoli to Marine Drive
- **Transparent pricing**: No hidden fees — you see the full breakdown before you pay
- **Bangladeshi payments**: bKash, Nagad, Rocket, and card payments accepted
- **Agent network**: Travel agents earn 5% commission on every booking they refer
- **Instant confirmation**: Real-time availability and immediate booking confirmation

## Contact Us

Email: support@coxbeach.com.bd
Phone: +880 1700-000000
Office: Cox's Bazar, Chittagong, Bangladesh`,
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    key: 'terms',
    title: 'Terms & Conditions',
    content: `# Terms & Conditions

**Last updated: June 2026**

## 1. Agreement

By using CoxBeach you agree to these terms. If you disagree, please do not use the platform.

## 2. Booking & Payment

All prices are in Bangladeshi Taka (BDT). Payment is required to confirm a booking. We accept bKash, Nagad, Rocket, and SSLCommerz.

## 3. Cancellation Policy

- More than 48 hours before check-in: **100% refund**
- 24–48 hours before check-in: **50% refund**
- Less than 24 hours before check-in: **No refund**

## 4. Agent Programme

Registered agents earn 5% commission on bookings within 24 hours of QR attribution. Commissions are settled monthly.

## 5. Governing Law

These terms are governed by the laws of the People's Republic of Bangladesh.`,
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    key: 'refund-policy',
    title: 'Refund Policy',
    content: `# Refund Policy

**Last updated: June 2026**

## Cancellation Refund Schedule

| Cancellation Time | Refund |
|---|---|
| More than 48h before check-in | 100% |
| 24–48h before check-in | 50% |
| Less than 24h before check-in | 0% |

## How to Cancel

1. Log in to your account
2. Go to My Bookings
3. Select the booking and click Cancel
4. Confirm cancellation

## Refund Timeline

- bKash / Nagad / Rocket: 3–5 business days
- Card payments: 5–10 business days

## Exceptions

Hotel-initiated cancellations receive a full refund regardless of timing. Force majeure events are handled case by case.`,
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

export function calcPricing(basePricePerNight: number, nights: number, hasAgent: boolean) {
  const vatRate = parseFloat(DEMO_CONFIGS.find((c) => c.key === 'VAT_RATE')?.value ?? '0.15');
  const platformRate = parseFloat(DEMO_CONFIGS.find((c) => c.key === 'PLATFORM_FEE_RATE')?.value ?? '0.05');
  const agentRate = hasAgent ? parseFloat(DEMO_CONFIGS.find((c) => c.key === 'AGENT_COMM_RATE')?.value ?? '0.08') : 0;
  const base = basePricePerNight * nights;
  return {
    baseTotalBdt: base,
    vatBdt: Math.round(base * vatRate),
    platformFeeBdt: Math.round(base * platformRate),
    agentCommBdt: Math.round(base * agentRate),
    grandTotalBdt: Math.round(base * (1 + vatRate + platformRate + agentRate)),
    nights,
    pricePerNight: basePricePerNight,
    rates: { vatRate, platformFeeRate: platformRate, agentCommRate: agentRate },
  };
}
