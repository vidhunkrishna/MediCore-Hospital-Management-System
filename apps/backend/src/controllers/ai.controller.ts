import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success } from '../utils/response.js';

const prisma = new PrismaClient();

export async function getHealthScore(_req: Request, res: Response) {
  const [totalBeds, occupiedBeds, criticalPatients, unresolvedAlerts, availableStaff, totalStaff] = await Promise.all([
    prisma.bed.count(),
    prisma.bed.count({ where: { status: 'OCCUPIED' } }),
    prisma.patient.count({ where: { status: 'CRITICAL' } }),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.staff.count({ where: { available: true } }),
    prisma.staff.count(),
  ]);

  const occupancyRate = totalBeds > 0 ? occupiedBeds / totalBeds : 0;
  const staffRate = totalStaff > 0 ? availableStaff / totalStaff : 1;
  const alertPenalty = Math.min(unresolvedAlerts * 3, 30);
  const criticalPenalty = Math.min(criticalPatients * 5, 25);
  const score = Math.round((1 - occupancyRate * 0.3 - (1 - staffRate) * 0.2) * 100 - alertPenalty - criticalPenalty);

  success(res, {
    score: Math.max(0, Math.min(100, score)),
    occupancyRate: Math.round(occupancyRate * 100),
    staffUtilization: Math.round((1 - staffRate) * 100),
    criticalPatients,
    unresolvedAlerts,
  });
}

export async function getInsights(_req: Request, res: Response) {
  const insights = [
    { id: '1', type: 'optimization', priority: 'HIGH', title: 'ICU Capacity Warning', message: 'ICU occupancy at 87%. Consider early discharge planning for stable patients.', action: 'Review ICU patients' },
    { id: '2', type: 'forecast', priority: 'MEDIUM', title: 'Peak Hours Incoming', message: 'Appointment volume expected to spike 35% between 10AM–2PM today based on historical patterns.', action: 'Allocate additional staff' },
    { id: '3', type: 'resource', priority: 'LOW', title: 'Equipment Maintenance Due', message: '3 MRI machines are due for scheduled maintenance this week. Book service windows.', action: 'Schedule maintenance' },
    { id: '4', type: 'efficiency', priority: 'MEDIUM', title: 'Discharge Bottleneck', message: 'Average discharge processing time increased to 4.2 hours. Streamline paperwork workflow.', action: 'Optimize discharge flow' },
    { id: '5', type: 'staffing', priority: 'HIGH', title: 'Night Shift Understaffed', message: 'Ward B night shift has 40% fewer nurses than recommended. Critical risk window 11PM–6AM.', action: 'Arrange cover staff' },
  ];
  success(res, insights);
}

export async function getForecast(_req: Request, res: Response) {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const base = i >= 9 && i <= 17 ? 70 : i >= 18 && i <= 22 ? 55 : 35;
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      appointments: Math.floor(Math.random() * 10) + (i >= 9 && i <= 17 ? 15 : 5),
      congestion: Math.min(100, base + Math.floor(Math.random() * 20) - 10),
    };
  });
  success(res, hours);
}

export async function getRecommendations(_req: Request, res: Response) {
  const recommendations = [
    { id: '1', category: 'Beds', icon: 'bed', priority: 'CRITICAL', message: 'Transfer 4 stable ICU patients to general ward to free critical care capacity', impact: '+8 ICU beds freed' },
    { id: '2', category: 'Staffing', icon: 'users', priority: 'HIGH', message: 'Assign 2 additional nurses to Emergency Department during afternoon peak hours', impact: 'Reduce wait time by ~40 min' },
    { id: '3', category: 'Equipment', icon: 'activity', priority: 'MEDIUM', message: 'Schedule Ventilator #3 maintenance during low-occupancy window (Sun 2AM–6AM)', impact: 'Prevent unplanned downtime' },
    { id: '4', category: 'Workflow', icon: 'zap', priority: 'LOW', message: 'Enable digital pre-admission forms for elective procedures to cut check-in time', impact: 'Save 15 min per patient' },
  ];
  success(res, recommendations);
}
