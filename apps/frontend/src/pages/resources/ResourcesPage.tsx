import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { BedDouble, Wrench, Users } from 'lucide-react';
import { useBeds, useEquipment, useStaff } from '@/hooks/useResources';
import { BedGrid } from './BedGrid';
import { EquipmentTable } from './EquipmentTable';
import { StaffRoster } from './StaffRoster';

const TABS = [
  { id: 'beds',      label: 'Beds',      icon: BedDouble },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'staff',     label: 'Staff',     icon: Users },
] as const;

type Tab = (typeof TABS)[number]['id'];

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  const tab = TABS.some((t) => t.id === tabParam) ? tabParam : 'beds';

  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab });
  };

  const { data: beds,      isLoading: bedsLoading  } = useBeds();
  const { data: equipment, isLoading: equipLoading } = useEquipment();
  const { data: staff,     isLoading: staffLoading } = useStaff();

  const available  = beds?.filter((b) => b.status === 'AVAILABLE').length   ?? 0;
  const occupied   = beds?.filter((b) => b.status === 'OCCUPIED').length    ?? 0;
  const maintenance = beds?.filter((b) => b.status === 'MAINTENANCE').length ?? 0;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-bold tracking-tight">Resources</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Beds, equipment and staff management</p>
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Available Beds',  value: available,                                         color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Occupied Beds',   value: occupied,                                          color: 'text-primary' },
          { label: 'Maintenance',     value: maintenance,                                       color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total Equipment', value: equipment?.length ?? 0,                            color: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'Total Staff',     value: staff?.length ?? 0,                               color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Available Staff', value: staff?.filter((s) => s.available).length ?? 0,    color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-4 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit border border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t.id
                ? 'gradient-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'beds'      && <BedGrid       beds={beds}           loading={bedsLoading}  />}
        {tab === 'equipment' && <EquipmentTable equipment={equipment} loading={equipLoading} />}
        {tab === 'staff'     && <StaffRoster   staff={staff}         loading={staffLoading} />}
      </motion.div>
    </div>
  );
}
