import { PrismaClient, UserRole, HotelStatus, StarRating, RoomType, AgentStatus, AccountStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Platform config defaults
  const configs = [
    { key: 'VAT_RATE', value: '0.15', description: 'VAT rate (15%)' },
    { key: 'PLATFORM_FEE_RATE', value: '0.05', description: 'Platform fee rate (5%)' },
    { key: 'AGENT_COMMISSION_RATE', value: '0.08', description: 'Agent commission rate (8%)' },
    { key: 'BOOKING_HOLD_MINUTES', value: '15', description: 'Booking hold time in minutes' },
    { key: 'AGENT_ATTRIBUTION_HOURS', value: '72', description: 'Agent attribution window in hours' },
    { key: 'SETTLEMENT_DAY', value: 'monday', description: 'Settlement processing day' },
  ];

  for (const config of configs) {
    await prisma.platformConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { phone: '+8801700000001' },
    update: {},
    create: {
      phone: '+8801700000001',
      name: 'Admin User',
      email: 'admin@coxbeach.com.bd',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  // Hotel manager
  const managerHash = await bcrypt.hash('Manager@123', 12);
  const manager = await prisma.user.upsert({
    where: { phone: '+8801700000002' },
    update: {},
    create: {
      phone: '+8801700000002',
      name: 'Hotel Manager Demo',
      email: 'manager@coxbeach.com.bd',
      passwordHash: managerHash,
      role: UserRole.HOTEL_MANAGER,
      status: AccountStatus.ACTIVE,
    },
  });

  // Agent user
  const agentUserHash = await bcrypt.hash('Agent@123', 12);
  const agentUser = await prisma.user.upsert({
    where: { phone: '+8801700000003' },
    update: {},
    create: {
      phone: '+8801700000003',
      name: 'Agent Demo',
      email: 'agent@coxbeach.com.bd',
      passwordHash: agentUserHash,
      role: UserRole.AGENT,
      status: AccountStatus.ACTIVE,
    },
  });

  // Customer
  const customerHash = await bcrypt.hash('Customer@123', 12);
  const customer = await prisma.user.upsert({
    where: { phone: '+8801700000004' },
    update: {},
    create: {
      phone: '+8801700000004',
      name: 'Test Customer',
      email: 'customer@test.com',
      passwordHash: customerHash,
      role: UserRole.CUSTOMER,
      status: AccountStatus.ACTIVE,
    },
  });

  // Agent record
  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      agentCode: 'AGT-DEMO-001',
      commissionRate: 0.08,
      status: AgentStatus.ACTIVE,
      walletBalance: 0,
    },
  });

  // Demo hotel
  const hotel = await prisma.hotel.upsert({
    where: { slug: 'ocean-paradise-coxs-bazar' },
    update: {},
    create: {
      name: "Ocean Paradise Hotel",
      slug: 'ocean-paradise-coxs-bazar',
      description: "Experience luxury by the sea at Ocean Paradise Hotel, Cox's Bazar. Breathtaking sea views, world-class amenities, and exceptional Bangladeshi hospitality.",
      address: "Marine Drive, Cox's Bazar",
      city: "Cox's Bazar",
      latitude: 21.4272,
      longitude: 92.0058,
      starRating: StarRating.FOUR,
      amenities: ['Free WiFi', 'Swimming Pool', 'Restaurant', 'Gym', 'Spa', 'Room Service', 'Sea View', 'Beach Access'],
      photos: ['/uploads/hotel-demo-1.jpg', '/uploads/hotel-demo-2.jpg'],
      status: HotelStatus.ACTIVE,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: 'Check-in: 2 PM. Check-out: 12 PM. No smoking in rooms. Pets not allowed.',
    },
  });

  // Link manager
  await prisma.hotelManager.upsert({
    where: { hotelId_userId: { hotelId: hotel.id, userId: manager.id } },
    update: {},
    create: {
      hotelId: hotel.id,
      userId: manager.id,
      isPrimary: true,
    },
  });

  // Demo rooms
  const rooms = [
    {
      name: 'Standard Sea View',
      type: RoomType.STANDARD,
      basePriceBdt: 5000,
      maxGuests: 2,
      totalUnits: 10,
      description: 'Comfortable standard room with stunning sea view.',
      amenities: ['Sea View', 'AC', 'TV', 'WiFi', 'En-suite Bathroom'],
    },
    {
      name: 'Deluxe Ocean Suite',
      type: RoomType.DELUXE,
      basePriceBdt: 8000,
      maxGuests: 3,
      totalUnits: 5,
      description: 'Spacious deluxe suite with panoramic ocean views.',
      amenities: ['Sea View', 'AC', 'TV', 'WiFi', 'Mini Bar', 'Bathtub', 'Balcony'],
    },
    {
      name: 'Family Room',
      type: RoomType.FAMILY,
      basePriceBdt: 12000,
      maxGuests: 6,
      totalUnits: 3,
      description: 'Spacious family room perfect for families.',
      amenities: ['Sea View', 'AC', 'TV', 'WiFi', 'Living Area', '2 Bathrooms'],
    },
  ];

  for (const roomData of rooms) {
    const existing = await prisma.room.findFirst({
      where: { hotelId: hotel.id, name: roomData.name },
    });

    if (!existing) {
      const room = await prisma.room.create({
        data: { ...roomData, hotelId: hotel.id, photos: [] },
      });

      // Seed availability for next 60 days
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        date.setHours(0, 0, 0, 0);
        await prisma.roomAvailability.upsert({
          where: { roomId_date: { roomId: room.id, date } },
          update: {},
          create: {
            roomId: room.id,
            date,
            totalUnits: roomData.totalUnits,
            bookedUnits: 0,
            heldUnits: 0,
            priceBdt: roomData.basePriceBdt,
          },
        });
      }
    }
  }

  // Second demo hotel
  const hotel2 = await prisma.hotel.upsert({
    where: { slug: 'sea-pearl-beach-resort' },
    update: {},
    create: {
      name: "Sea Pearl Beach Resort",
      slug: 'sea-pearl-beach-resort',
      description: "A premium beach resort offering the finest hospitality in Cox's Bazar with direct beach access and luxury facilities.",
      address: "Kolatoli Road, Cox's Bazar",
      city: "Cox's Bazar",
      latitude: 21.4250,
      longitude: 92.0040,
      starRating: StarRating.FIVE,
      amenities: ['Free WiFi', 'Private Beach', 'Multiple Restaurants', 'Infinity Pool', 'Spa', 'Kids Club', 'Business Center'],
      photos: ['/uploads/hotel2-demo-1.jpg'],
      status: HotelStatus.ACTIVE,
      checkInTime: '15:00',
      checkOutTime: '11:00',
    },
  });

  const room2 = await prisma.room.findFirst({ where: { hotelId: hotel2.id } });
  if (!room2) {
    const r2 = await prisma.room.create({
      data: {
        hotelId: hotel2.id,
        name: 'Sea View Executive',
        type: RoomType.SEA_VIEW,
        basePriceBdt: 9000,
        maxGuests: 2,
        totalUnits: 8,
        amenities: ['Private Beach Access', 'Sea View', 'AC', 'Mini Bar', 'Jacuzzi'],
        photos: [],
      },
    });
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      await prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId: r2.id, date } },
        update: {},
        create: { roomId: r2.id, date, totalUnits: 8, bookedUnits: 0, heldUnits: 0, priceBdt: 9000 },
      });
    }
  }

  console.log('Seed complete.');
  console.log('Demo users:');
  console.log('  Admin:    +8801700000001 / Admin@123');
  console.log('  Manager:  +8801700000002 / Manager@123');
  console.log('  Agent:    +8801700000003 / Agent@123');
  console.log('  Customer: +8801700000004 / Customer@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
