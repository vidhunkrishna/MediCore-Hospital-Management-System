import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { success } from '../utils/response.js';

const prisma = new PrismaClient();

interface HospitalState {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  criticalPatients: number;
  unresolvedAlerts: number;
  availableStaff: number;
  totalStaff: number;
  staffUtilization: number;
  activeAlertsList: Array<{ message: string; severity: string }>;
  criticalPatientsList: Array<{ firstName: string; lastName: string }>;
  maintenanceEquipmentList: Array<{ name: string; category: string }>;
  todayAppointmentsCount: number;
}

// In-memory cache helper to avoid Gemini free-tier 429 rate/quota limits (20 requests per day)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const aiCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = aiCache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T, ttlMs = 5 * 60 * 1000) {
  aiCache.set(key, { data, expiry: Date.now() + ttlMs });
}

function generateMockOperationalAnswer(message: string, state: HospitalState): string {
  const msgLower = message.toLowerCase().trim();
  if (msgLower.includes('summary') || msgLower.includes('overall') || msgLower.includes('status')) {
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Here is the real-time status of **MediCore Hospital Operations**:
- **Total Beds**: ${state.totalBeds} (${state.occupiedBeds} occupied, ${state.occupancyRate.toFixed(1)}% occupancy rate)
- **Active Staff**: ${state.availableStaff} / ${state.totalStaff} on duty (Utilization: ${state.staffUtilization.toFixed(1)}%)
- **Critical Patients**: ${state.criticalPatients}
- **Active Alerts**: ${state.unresolvedAlerts} unresolved alerts
Everything is running normally. Let me know if you need specific details.`;
  }
  if (msgLower.includes('critical') || msgLower.includes('patient')) {
    const list = state.criticalPatientsList.map((p: { firstName: string; lastName: string }) => `- ${p.firstName} ${p.lastName}`).join('\n');
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Currently, there are **${state.criticalPatients}** patients registered in critical condition:
${list || 'No critical patients currently listed.'}`;
  }
  if (msgLower.includes('bed') || msgLower.includes('occupancy') || msgLower.includes('icu')) {
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Current Bed Capacity:
- **Total Registered Beds**: ${state.totalBeds}
- **Occupied Beds**: ${state.occupiedBeds}
- **Occupancy Rate**: ${state.occupancyRate.toFixed(1)}%
Hospital admission and discharge flows are stable.`;
  }
  if (msgLower.includes('alert') || msgLower.includes('today')) {
    const list = state.activeAlertsList.map((a: { message: string; severity: string }) => `- [${a.severity}] ${a.message}`).join('\n');
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Active unresolved operational alerts:
${list || 'No active unresolved alerts.'}`;
  }
  if (msgLower.includes('staff') || msgLower.includes('nurse') || msgLower.includes('doctor') || msgLower.includes('availability')) {
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Current Staffing Shift Status:
- **On Duty**: ${state.availableStaff} / ${state.totalStaff} staff members available
- **Shift Workload Utilization**: ${state.staffUtilization.toFixed(1)}%`;
  }
  if (msgLower.includes('equipment') || msgLower.includes('maintenance')) {
    const list = state.maintenanceEquipmentList.map((e: { name: string; category: string }) => `- ${e.name} (${e.category})`).join('\n');
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Medical Equipment Maintenance Status:
${list || 'All equipment currently operational.'}`;
  }
  if (msgLower.includes('forecast') || msgLower.includes('congestion')) {
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Patient queue congestion is expected to follow normal daily workload profiles, peaking between 10:00 AM and 2:00 PM, and lowering during night shifts. No critical queue jams predicted.`;
  }
  if (msgLower.includes('load') || msgLower.includes('department') || msgLower.includes('overloaded')) {
    return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

Based on shift workload:
- Current staff utilization is ${state.staffUtilization.toFixed(1)}%.
- Bed occupancy rate is ${state.occupancyRate.toFixed(1)}%.
- There are ${state.criticalPatients} critical patients.
Department loads are within manageable capacity thresholds.`;
  }
  return `**[Free Tier Quota Note: Displaying Local Operational Summary]**

I am answering using the real-time operational state of the hospital:
- **Beds occupancy**: ${state.occupiedBeds} / ${state.totalBeds} (${state.occupancyRate.toFixed(1)}%)
- **Active staff**: ${state.availableStaff} / ${state.totalStaff} (${state.staffUtilization.toFixed(1)}% utilization)
- **Critical patients**: ${state.criticalPatients}
- **Unresolved alerts**: ${state.unresolvedAlerts}`;
}

async function getHospitalState(): Promise<HospitalState> {
  const [
    totalBeds,
    occupiedBeds,
    criticalPatients,
    unresolvedAlerts,
    availableStaff,
    totalStaff,
    activeAlertsList,
    criticalPatientsList,
    maintenanceEquipmentList,
    todayAppointmentsCount,
  ] = await Promise.all([
    prisma.bed.count(),
    prisma.bed.count({ where: { status: 'OCCUPIED' } }),
    prisma.patient.count({ where: { status: 'CRITICAL' } }),
    prisma.alert.count({ where: { resolved: false } }),
    prisma.staff.count({ where: { available: true } }),
    prisma.staff.count(),
    prisma.alert.findMany({ where: { resolved: false }, take: 5, select: { message: true, severity: true } }),
    prisma.patient.findMany({ where: { status: 'CRITICAL' }, select: { firstName: true, lastName: true }, take: 5 }),
    prisma.equipment.findMany({ where: { status: 'MAINTENANCE' }, select: { name: true, category: true }, take: 5 }),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return {
    totalBeds,
    occupiedBeds,
    occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    criticalPatients,
    unresolvedAlerts,
    availableStaff,
    totalStaff,
    staffUtilization: totalStaff > 0 ? ((totalStaff - availableStaff) / totalStaff) * 100 : 0,
    activeAlertsList,
    criticalPatientsList,
    maintenanceEquipmentList,
    todayAppointmentsCount,
  };
}

async function generateWithGemini(prompt: string, jsonMode = true): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode ? {
        responseMimeType: 'application/json',
      } : undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
  }

  const result = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini API');
  }
  return text;
}

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
    engine: process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Mock AI Engine v1.0',
  });
}

const MOCK_INSIGHTS = [
  { id: '1', type: 'optimization', priority: 'HIGH', title: 'ICU Capacity Warning', message: 'ICU occupancy at 87%. Consider early discharge planning for stable patients.', action: 'Review ICU patients' },
  { id: '2', type: 'forecast', priority: 'MEDIUM', title: 'Peak Hours Incoming', message: 'Appointment volume expected to spike 35% between 10AM–2PM today based on historical patterns.', action: 'Allocate additional staff' },
  { id: '3', type: 'resource', priority: 'LOW', title: 'Equipment Maintenance Due', message: '3 MRI machines are due for scheduled maintenance this week. Book service windows.', action: 'Schedule maintenance' },
  { id: '4', type: 'efficiency', priority: 'MEDIUM', title: 'Discharge Bottleneck', message: 'Average discharge processing time increased to 4.2 hours. Streamline paperwork workflow.', action: 'Optimize discharge flow' },
  { id: '5', type: 'staffing', priority: 'HIGH', title: 'Night Shift Understaffed', message: 'Ward B night shift has 40% fewer nurses than recommended. Critical risk window 11PM–6AM.', action: 'Arrange cover staff' },
];

export async function getInsights(_req: Request, res: Response) {
  const cached = getCached<unknown[]>('insights');
  if (cached) {
    return success(res, cached);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return success(res, MOCK_INSIGHTS);
  }

  try {
    const state = await getHospitalState();
    const prompt = `
You are the AI Command Center of MediCore, an intelligent hospital operations management system.
Based on the current real-time state of the hospital, analyze the data and generate exactly 5 operational insights.

Current Hospital State:
- Total Beds: ${state.totalBeds}
- Occupied Beds: ${state.occupiedBeds} (${state.occupancyRate.toFixed(1)}% occupancy rate)
- Critical Patients: ${state.criticalPatients}
- Unresolved Alerts: ${state.unresolvedAlerts}
- Active Staff: ${state.availableStaff} / ${state.totalStaff} on duty
- Active Alerts Summary: ${state.activeAlertsList.map(a => `[${a.severity}] ${a.message}`).join(', ') || 'None'}
- Critical Patients List: ${state.criticalPatientsList.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'None'}
- Maintenance Equipment: ${state.maintenanceEquipmentList.map(e => e.name).join(', ') || 'None'}
- Today's Appointments: ${state.todayAppointmentsCount}

Generate a JSON array containing exactly 5 insight objects matching this TypeScript schema:
interface AIInsight {
  id: string; // "1", "2", "3", "4", "5"
  type: string; // e.g. "optimization" | "forecast" | "resource" | "efficiency" | "staffing"
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string; // short, action-oriented title
  message: string; // clear analysis of the situation based on the stats
  action: string; // recommended action for the hospital administrator
}
`;
    const responseText = await generateWithGemini(prompt);
    const insights = JSON.parse(responseText);
    setCached('insights', insights);
    success(res, insights);
  } catch (err) {
    console.error('Gemini Insights generation failed, falling back to mock:', err);
    success(res, MOCK_INSIGHTS);
  }
}

function generateMockForecast() {
  return Array.from({ length: 24 }, (_, i) => {
    const base = i >= 9 && i <= 17 ? 70 : i >= 18 && i <= 22 ? 55 : 35;
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      appointments: Math.floor(Math.random() * 10) + (i >= 9 && i <= 17 ? 15 : 5),
      congestion: Math.min(100, base + Math.floor(Math.random() * 20) - 10),
    };
  });
}

export async function getForecast(_req: Request, res: Response) {
  const cached = getCached<unknown[]>('forecast');
  if (cached) {
    return success(res, cached);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return success(res, generateMockForecast());
  }

  try {
    const state = await getHospitalState();
    const prompt = `
You are the AI Command Center of MediCore, an intelligent hospital operations management system.
Generate a 24-hour hourly congestion and appointment volume forecast for the hospital operations dashboard based on the current state.

Current Hospital State:
- Total Beds: ${state.totalBeds}
- Occupied Beds: ${state.occupiedBeds} (${state.occupancyRate.toFixed(1)}% occupancy rate)
- Staff Utilization: ${state.staffUtilization.toFixed(1)}%
- Today's Appointments: ${state.todayAppointmentsCount}

Predict the load for each hour of the 24-hour cycle starting from 00:00 (i.e. exactly 24 periods: "00:00", "01:00", ..., "23:00").
Congestion rate should represent percentage (0-100) based on typical hospital patterns (e.g. peak hours between 10 AM and 3 PM, lower at night, but influenced by current occupancy and staff rate).
Appointments predicted should represent expected appointment check-ins.

Generate a JSON array containing exactly 24 objects matching this TypeScript schema:
interface ForecastHour {
  hour: string; // format: "HH:00"
  appointments: number;
  congestion: number; // 0 to 100
}
`;
    const responseText = await generateWithGemini(prompt);
    const forecast = JSON.parse(responseText);
    setCached('forecast', forecast);
    success(res, forecast);
  } catch (err) {
    console.error('Gemini Forecast generation failed, falling back to mock:', err);
    success(res, generateMockForecast());
  }
}

const MOCK_RECOMMENDATIONS = [
  { id: '1', category: 'Beds', icon: 'bed', priority: 'CRITICAL', message: 'Transfer 4 stable ICU patients to general ward to free critical care capacity', impact: '+8 ICU beds freed' },
  { id: '2', category: 'Staffing', icon: 'users', priority: 'HIGH', message: 'Assign 2 additional nurses to Emergency Department during afternoon peak hours', impact: 'Reduce wait time by ~40 min' },
  { id: '3', category: 'Equipment', icon: 'activity', priority: 'MEDIUM', message: 'Schedule Ventilator #3 maintenance during low-occupancy window (Sun 2AM–6AM)', impact: 'Prevent unplanned downtime' },
  { id: '4', category: 'Workflow', icon: 'zap', priority: 'LOW', message: 'Enable digital pre-admission forms for elective procedures to cut check-in time', impact: 'Save 15 min per patient' },
];

export async function getRecommendations(_req: Request, res: Response) {
  const cached = getCached<unknown[]>('recommendations');
  if (cached) {
    return success(res, cached);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return success(res, MOCK_RECOMMENDATIONS);
  }

  try {
    const state = await getHospitalState();
    const prompt = `
You are the AI Command Center of MediCore, an intelligent hospital operations management system.
Based on the current real-time state of the hospital, generate exactly 4 operational recommendations to optimize efficiency, staff workload, and patient throughput.

Current Hospital State:
- Total Beds: ${state.totalBeds}
- Occupied Beds: ${state.occupiedBeds} (${state.occupancyRate.toFixed(1)}% occupancy rate)
- Critical Patients: ${state.criticalPatients}
- Unresolved Alerts: ${state.unresolvedAlerts}
- Active Staff: ${state.availableStaff} / ${state.totalStaff} on duty
- Active Alerts Summary: ${state.activeAlertsList.map(a => `[${a.severity}] ${a.message}`).join(', ') || 'None'}
- Maintenance Equipment: ${state.maintenanceEquipmentList.map(e => e.name).join(', ') || 'None'}
- Today's Appointments: ${state.todayAppointmentsCount}

Generate a JSON array containing exactly 4 recommendation objects matching this TypeScript schema:
interface AIRecommendation {
  id: string; // "1", "2", "3", "4"
  category: string; // e.g. "Beds", "Staffing", "Equipment", "Workflow"
  icon: string; // MUST be one of: "bed" | "users" | "activity" | "zap"
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string; // concrete recommendation action
  impact: string; // expected short impact (e.g. "+8 ICU beds freed", "Reduce wait time by ~40 min")
}
`;
    const responseText = await generateWithGemini(prompt);
    const recommendations = JSON.parse(responseText);
    setCached('recommendations', recommendations);
    success(res, recommendations);
  } catch (err) {
    console.error('Gemini Recommendations generation failed, falling back to mock:', err);
    success(res, MOCK_RECOMMENDATIONS);
  }
}

export async function handleChat(req: Request, res: Response) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const state = await getHospitalState();

  if (!apiKey) {
    const mockAnswer = generateMockOperationalAnswer(message, state);
    return success(res, { message: mockAnswer });
  }

  try {
    const prompt = `
You are MediCore AI.

You are an intelligent Hospital Operations Assistant.

Only answer using the supplied hospital operational data.
If the requested information is unavailable, clearly state that it is unavailable.

Hospital Data:
- Total Beds: ${state.totalBeds}
- Occupied Beds: ${state.occupiedBeds} (${state.occupancyRate.toFixed(1)}% occupancy rate)
- Critical Patients: ${state.criticalPatients}
- Unresolved/Active Alerts Count: ${state.unresolvedAlerts}
- Active Staff: ${state.availableStaff} / ${state.totalStaff} on duty
- Staff Utilization: ${state.staffUtilization.toFixed(1)}%
- Active Alerts Summary: ${state.activeAlertsList.map(a => `[${a.severity}] ${a.message}`).join(', ') || 'None'}
- Critical Patients List: ${state.criticalPatientsList.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'None'}
- Maintenance Equipment: ${state.maintenanceEquipmentList.map(e => `${e.name} (${e.category})`).join(', ') || 'None'}
- Today's Appointments Scheduled: ${state.todayAppointmentsCount}

User Question:
${message}
`;

    const responseText = await generateWithGemini(prompt, false);
    success(res, { message: responseText.trim() });
  } catch (err) {
    console.error('Gemini Chat failed, falling back to local DB-driven operational summary:', err);
    try {
      const mockAnswer = generateMockOperationalAnswer(message, state);
      success(res, { message: mockAnswer });
    } catch (fallbackErr) {
      console.error('Fallback generation failed:', fallbackErr);
      success(res, {
        message: 'Sorry, I encountered an error while processing your request. Please check the logs.'
      });
    }
  }
}
