import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const empHash = await bcrypt.hash('Employee@123', 10);

  // Business Units
  const bu1 = await prisma.businessUnit.upsert({
    where: { code: 'ENG' },
    update: {},
    create: { name: 'Engineering', code: 'ENG' },
  });
  const bu2 = await prisma.businessUnit.upsert({
    where: { code: 'SALES' },
    update: {},
    create: { name: 'Sales', code: 'SALES' },
  });

  // Super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@utthunga.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@utthunga.com',
      name: 'Super Admin',
      employeeId: 'EMP001',
      role: 'SUPER_ADMIN',
      officeLocation: 'BANGALORE',
      department: 'Administration',
      passwordHash: adminHash,
    },
  });

  // Facility manager
  await prisma.user.upsert({
    where: { email: 'fm@utthunga.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'fm@utthunga.com',
      name: 'Facility Manager',
      employeeId: 'EMP002',
      role: 'FACILITY_MANAGER',
      officeLocation: 'BANGALORE',
      passwordHash: adminHash,
    },
  });

  // Sample employee
  const emp = await prisma.user.upsert({
    where: { email: 'employee@utthunga.com' },
    update: { passwordHash: empHash },
    create: {
      email: 'employee@utthunga.com',
      name: 'Ravi Kumar',
      employeeId: 'EMP100',
      role: 'EMPLOYEE',
      officeLocation: 'BANGALORE',
      department: 'Engineering',
      buId: bu1.id,
      managerId: admin.id,
      passwordHash: empHash,
    },
  });

  // Meeting rooms
  await prisma.meetingRoom.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Boardroom A', floor: '5', capacity: 20, officeLocation: 'BANGALORE', equipment: ['Projector', 'Video Conf', 'Whiteboard'] },
      { name: 'Training Room 1', floor: '3', capacity: 50, officeLocation: 'BANGALORE', equipment: ['Projector', 'Mic'] },
      { name: 'Huddle Space B1', floor: '2', capacity: 6, officeLocation: 'BANGALORE', equipment: ['TV Screen'] },
      { name: 'Boardroom P1', floor: '2', capacity: 15, officeLocation: 'PUNE', equipment: ['Projector', 'Video Conf'] },
    ],
  });

  // Rooms
  await prisma.room.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Boardroom A', type: 'BOARDROOM', capacity: 20, floor: '5', officeLocation: 'BANGALORE', equipment: ['Projector', 'Video Conf'] },
      { name: 'Training Hall 1', type: 'TRAINING', capacity: 50, floor: '3', officeLocation: 'BANGALORE', equipment: ['Projector'] },
      { name: 'Cafeteria', type: 'CAFETERIA', capacity: 200, floor: 'G', officeLocation: 'BANGALORE', equipment: [] },
      { name: 'Boardroom P1', type: 'BOARDROOM', capacity: 15, floor: '2', officeLocation: 'PUNE', equipment: ['TV', 'Video Conf'] },
    ],
  });

  // Courier partners
  await prisma.courierPartner.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Blue Dart', code: 'BD', trackingUrl: 'https://www.bluedart.com/tracking' },
      { name: 'DTDC', code: 'DTDC', trackingUrl: 'https://www.dtdc.in/tracking' },
      { name: 'FedEx', code: 'FEDEX', trackingUrl: 'https://www.fedex.com/en-in/tracking.html' },
      { name: 'DHL', code: 'DHL', trackingUrl: 'https://www.dhl.com/in-en/home/tracking.html' },
    ],
  });

  // Sample inventory
  await prisma.inventoryItem.createMany({
    skipDuplicates: true,
    data: [
      { itemCode: 'ST001', name: 'A4 Paper (500 sheets)', category: 'STATIONERY', unit: 'Ream', quantity: 50, reorderLevel: 20, officeLocation: 'BANGALORE' },
      { itemCode: 'ST002', name: 'Ballpoint Pen (Blue)', category: 'STATIONERY', unit: 'Box', quantity: 8, reorderLevel: 10, officeLocation: 'BANGALORE' },
      { itemCode: 'CS001', name: 'Hand Sanitizer 500ml', category: 'CONSUMABLES', unit: 'Bottle', quantity: 15, reorderLevel: 10, officeLocation: 'BANGALORE' },
      { itemCode: 'CS002', name: 'Tissue Box', category: 'CONSUMABLES', unit: 'Box', quantity: 3, reorderLevel: 10, officeLocation: 'BANGALORE' },
      { itemCode: 'ST003', name: 'Whiteboard Marker', category: 'STATIONERY', unit: 'Pack', quantity: 25, reorderLevel: 5, officeLocation: 'PUNE' },
    ],
  });

  // Sample grievance SLA config (stored in constants, but log it)
  console.log('✅ Seed complete');
  console.log('   Admin:    admin@utthunga.com     / Admin@123');
  console.log('   FM:       fm@utthunga.com        / Admin@123');
  console.log('   Employee: employee@utthunga.com  / Employee@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
