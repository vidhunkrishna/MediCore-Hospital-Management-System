import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.$transaction([
    prisma.alert.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.equipment.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.bed.deleteMany(),
    prisma.ward.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const password = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.create({ data: { email: 'admin@hospital.com', password, name: 'Dr. Sarah Chen', role: 'ADMIN' } });
  const doc1 = await prisma.user.create({ data: { email: 'dr.james@hospital.com', password, name: 'Dr. James Wilson', role: 'DOCTOR' } });
  const doc2 = await prisma.user.create({ data: { email: 'dr.priya@hospital.com', password, name: 'Dr. Priya Sharma', role: 'DOCTOR' } });
  const doc3 = await prisma.user.create({ data: { email: 'dr.marcus@hospital.com', password, name: 'Dr. Marcus Lee', role: 'DOCTOR' } });
  const doc4 = await prisma.user.create({ data: { email: 'dr.emma@hospital.com', password, name: 'Dr. Emma Roberts', role: 'DOCTOR' } });
  const nurse1 = await prisma.user.create({ data: { email: 'nurse.anna@hospital.com', password, name: 'Nurse Anna Kim', role: 'NURSE' } });
  const nurse2 = await prisma.user.create({ data: { email: 'nurse.ben@hospital.com', password, name: 'Nurse Ben Carter', role: 'NURSE' } });
  const receptionist = await prisma.user.create({ data: { email: 'reception@hospital.com', password, name: 'Maria Santos', role: 'RECEPTIONIST' } });

  // Departments
  const cardiology = await prisma.department.create({ data: { name: 'Cardiology', capacity: 60, floor: 3, color: '#ef4444' } });
  const emergency = await prisma.department.create({ data: { name: 'Emergency', capacity: 40, floor: 1, color: '#f59e0b' } });
  const neurology = await prisma.department.create({ data: { name: 'Neurology', capacity: 45, floor: 4, color: '#8b5cf6' } });
  const orthopedics = await prisma.department.create({ data: { name: 'Orthopedics', capacity: 50, floor: 2, color: '#06b6d4' } });
  const pediatrics = await prisma.department.create({ data: { name: 'Pediatrics', capacity: 35, floor: 5, color: '#10b981' } });

  // Wards
  const cardWardA = await prisma.ward.create({ data: { name: 'Cardiology Ward A', floor: 3, departmentId: cardiology.id } });
  const icuWard = await prisma.ward.create({ data: { name: 'ICU', floor: 2, departmentId: emergency.id } });
  const emerWard = await prisma.ward.create({ data: { name: 'Emergency Ward', floor: 1, departmentId: emergency.id } });
  const neuroWard = await prisma.ward.create({ data: { name: 'Neurology Ward', floor: 4, departmentId: neurology.id } });
  const orthoWard = await prisma.ward.create({ data: { name: 'Orthopedics Ward', floor: 2, departmentId: orthopedics.id } });
  const pedWard = await prisma.ward.create({ data: { name: 'Pediatrics Ward', floor: 5, departmentId: pediatrics.id } });

  // Beds
  const bedStatuses = ['AVAILABLE', 'OCCUPIED', 'OCCUPIED', 'AVAILABLE', 'MAINTENANCE', 'OCCUPIED'] as const;
  const beds: { id: string }[] = [];
  const wardBedMap = [
    { ward: cardWardA, count: 12, type: 'GENERAL' as const },
    { ward: icuWard, count: 8, type: 'ICU' as const },
    { ward: emerWard, count: 10, type: 'EMERGENCY' as const },
    { ward: neuroWard, count: 10, type: 'GENERAL' as const },
    { ward: orthoWard, count: 12, type: 'PRIVATE' as const },
    { ward: pedWard, count: 8, type: 'GENERAL' as const },
  ];
  for (const { ward, count, type } of wardBedMap) {
    for (let i = 1; i <= count; i++) {
      const bed = await prisma.bed.create({
        data: { number: `${ward.name.slice(0, 2).toUpperCase()}${i.toString().padStart(2, '0')}`, wardId: ward.id, type, status: bedStatuses[i % bedStatuses.length] },
      });
      beds.push(bed);
    }
  }

  // Staff
  await prisma.staff.createMany({
    data: [
      { userId: doc1.id, departmentId: cardiology.id, shift: 'MORNING', available: true },
      { userId: doc2.id, departmentId: emergency.id, shift: 'AFTERNOON', available: true },
      { userId: doc3.id, departmentId: neurology.id, shift: 'MORNING', available: false },
      { userId: doc4.id, departmentId: orthopedics.id, shift: 'MORNING', available: true },
      { userId: nurse1.id, departmentId: cardiology.id, shift: 'MORNING', available: true },
      { userId: nurse2.id, departmentId: emergency.id, shift: 'NIGHT', available: true },
      { userId: receptionist.id, departmentId: pediatrics.id, shift: 'MORNING', available: true },
      { userId: admin.id, departmentId: cardiology.id, shift: 'MORNING', available: true },
    ],
  });

  // Equipment
  await prisma.equipment.createMany({
    data: [
      { name: 'MRI Scanner Unit A', category: 'Imaging', serialNo: 'MRI-001', status: 'OPERATIONAL', departmentId: neurology.id, nextService: new Date('2025-02-15') },
      { name: 'MRI Scanner Unit B', category: 'Imaging', serialNo: 'MRI-002', status: 'MAINTENANCE', departmentId: neurology.id, lastServiced: new Date('2024-12-01') },
      { name: 'ECG Machine #1', category: 'Cardiac', serialNo: 'ECG-001', status: 'OPERATIONAL', departmentId: cardiology.id },
      { name: 'ECG Machine #2', category: 'Cardiac', serialNo: 'ECG-002', status: 'OPERATIONAL', departmentId: cardiology.id },
      { name: 'Ventilator Unit 1', category: 'Life Support', serialNo: 'VENT-001', status: 'OPERATIONAL', departmentId: emergency.id },
      { name: 'Ventilator Unit 2', category: 'Life Support', serialNo: 'VENT-002', status: 'OPERATIONAL', departmentId: emergency.id },
      { name: 'Ventilator Unit 3', category: 'Life Support', serialNo: 'VENT-003', status: 'MAINTENANCE', departmentId: emergency.id, nextService: new Date('2025-01-20') },
      { name: 'X-Ray Machine', category: 'Imaging', serialNo: 'XRAY-001', status: 'OPERATIONAL', departmentId: orthopedics.id },
      { name: 'Ultrasound Machine', category: 'Imaging', serialNo: 'US-001', status: 'OPERATIONAL', departmentId: pediatrics.id },
      { name: 'Defibrillator #1', category: 'Emergency', serialNo: 'DEF-001', status: 'OPERATIONAL', departmentId: emergency.id },
    ],
  });

  // Patients
  const patientData = [
    { firstName: 'Robert', lastName: 'Johnson', dob: new Date('1965-03-15'), gender: 'MALE' as const, bloodType: 'A+', phone: '555-0101', email: 'r.johnson@email.com', status: 'ADMITTED' as const, doctorId: doc1.id },
    { firstName: 'Emily', lastName: 'Chen', dob: new Date('1990-07-22'), gender: 'FEMALE' as const, bloodType: 'O-', phone: '555-0102', email: 'e.chen@email.com', status: 'CRITICAL' as const, doctorId: doc2.id },
    { firstName: 'Michael', lastName: 'Davis', dob: new Date('1978-11-08'), gender: 'MALE' as const, bloodType: 'B+', phone: '555-0103', status: 'OUTPATIENT' as const, doctorId: doc3.id },
    { firstName: 'Sophia', lastName: 'Martinez', dob: new Date('1955-05-30'), gender: 'FEMALE' as const, bloodType: 'AB+', phone: '555-0104', status: 'ADMITTED' as const, doctorId: doc4.id },
    { firstName: 'James', lastName: 'Anderson', dob: new Date('1982-09-14'), gender: 'MALE' as const, bloodType: 'O+', phone: '555-0105', status: 'OUTPATIENT' as const, doctorId: doc1.id },
    { firstName: 'Olivia', lastName: 'Taylor', dob: new Date('1998-02-28'), gender: 'FEMALE' as const, bloodType: 'A-', phone: '555-0106', status: 'ADMITTED' as const, doctorId: doc2.id },
    { firstName: 'William', lastName: 'Brown', dob: new Date('1943-12-03'), gender: 'MALE' as const, bloodType: 'B-', phone: '555-0107', status: 'CRITICAL' as const, doctorId: doc3.id },
    { firstName: 'Ava', lastName: 'Wilson', dob: new Date('2005-06-18'), gender: 'FEMALE' as const, bloodType: 'AB-', phone: '555-0108', status: 'OUTPATIENT' as const, doctorId: doc4.id },
    { firstName: 'Liam', lastName: 'Moore', dob: new Date('1970-04-25'), gender: 'MALE' as const, bloodType: 'O+', phone: '555-0109', status: 'DISCHARGED' as const, doctorId: doc1.id },
    { firstName: 'Isabella', lastName: 'Jackson', dob: new Date('1988-08-11'), gender: 'FEMALE' as const, bloodType: 'A+', phone: '555-0110', status: 'ADMITTED' as const, doctorId: doc2.id },
    { firstName: 'Noah', lastName: 'White', dob: new Date('1995-01-07'), gender: 'MALE' as const, bloodType: 'B+', phone: '555-0111', status: 'OUTPATIENT' as const, doctorId: doc3.id },
    { firstName: 'Mia', lastName: 'Harris', dob: new Date('1960-10-19'), gender: 'FEMALE' as const, bloodType: 'O-', phone: '555-0112', status: 'ADMITTED' as const, doctorId: doc4.id },
  ];

  const occupiedBedIds = beds.filter((_, i) => i % 2 === 1).map((b) => b.id);
  let bedIdx = 0;

  for (const [i, p] of patientData.entries()) {
    const mrn = `MRN-${(100001 + i).toString()}`;
    const needsBed = p.status === 'ADMITTED' || p.status === 'CRITICAL';
    await prisma.patient.create({
      data: {
        ...p,
        mrn,
        admittedAt: needsBed ? new Date(Date.now() - Math.random() * 7 * 86400000) : undefined,
        bedId: needsBed && bedIdx < occupiedBedIds.length ? occupiedBedIds[bedIdx++] : undefined,
      },
    });
  }

  // Appointments — last 7 days + next 7 days
  const patients = await prisma.patient.findMany({ take: 10 });
  const doctors = [doc1, doc2, doc3, doc4];
  const depts = [cardiology, emergency, neurology, orthopedics, pediatrics];
  const apptTypes = ['CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY'] as const;
  const apptStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'IN_PROGRESS'] as const;

  for (let i = 0; i < 40; i++) {
    const offsetDays = Math.floor(Math.random() * 14) - 7;
    const hour = 8 + Math.floor(Math.random() * 9);
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    await prisma.appointment.create({
      data: {
        patientId: patients[i % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        departmentId: depts[i % depts.length].id,
        scheduledAt: d,
        duration: [15, 30, 45, 60][i % 4],
        type: apptTypes[i % apptTypes.length],
        status: offsetDays < 0 ? 'COMPLETED' : apptStatuses[i % apptStatuses.length],
        notes: i % 3 === 0 ? 'Follow up required' : undefined,
      },
    });
  }

  // Alerts
  await prisma.alert.createMany({
    data: [
      { type: 'BED_CAPACITY', severity: 'CRITICAL', message: 'ICU at 95% capacity — only 2 beds remaining', resourceType: 'WARD' },
      { type: 'EQUIPMENT', severity: 'HIGH', message: 'MRI Scanner Unit B offline for emergency maintenance', resourceType: 'EQUIPMENT' },
      { type: 'STAFFING', severity: 'HIGH', message: 'Night shift understaffed in Ward B — 3 nurses short', resourceType: 'STAFF' },
      { type: 'PATIENT', severity: 'CRITICAL', message: 'Patient Emily Chen vitals deteriorating — immediate attention required', resourceType: 'PATIENT' },
      { type: 'SUPPLY', severity: 'MEDIUM', message: 'Blood supply Type O- running critically low (2 units remaining)', resourceType: 'SUPPLY' },
      { type: 'EQUIPMENT', severity: 'LOW', message: 'Ventilator Unit 3 scheduled maintenance overdue by 3 days', resourceType: 'EQUIPMENT' },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Admin:       admin@hospital.com / password123');
  console.log('   Doctor:      dr.james@hospital.com / password123');
  console.log('   Nurse:       nurse.anna@hospital.com / password123');
  console.log('   Receptionist: reception@hospital.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
