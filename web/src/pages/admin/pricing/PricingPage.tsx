import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, X, Loader2, Edit, PowerOff, CheckCircle, Trash2,
  DollarSign, Tag, MoreVertical, Moon, Clock, CreditCard,
} from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { facilityService, type Facility } from '../../../services/facility.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import {
  pricingService, type PricingPlan, type FeeType,
  type CreatePricingPlanPayload, type UpdatePricingPlanPayload,
} from '../../../services/pricing.service';

// ── Constants ─────────────────────────────────────────────
const FEE_TYPE_LABELS: Record<FeeType, string> = {
  per_turn: 'Per Turn',
  hourly: 'Hourly',
  daily: 'Daily',
  monthly: 'Monthly',
};

const FEE_TYPE_OPTIONS = (Object.entries(FEE_TYPE_LABELS) as [FeeType, string][]);

// ── Zod schema ────────────────────────────────────────────
const rateSchema = z.object({
  label: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(0, 'Must be ≥ 0'),
  unit: z.string().min(1, 'Required'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  vehicleTypeId: z.string().min(1, 'Select vehicle type'),
  facilityId: z.string().min(1, 'Select facility'),
  feeType: z.enum(['per_turn', 'hourly', 'daily', 'monthly']),
  rates: z.array(rateSchema).min(1, 'At least 1 rate is required'),
  overnightFee: z.coerce.number().min(0).default(0),
  overtimeFeePerHour: z.coerce.number().min(0).default(0),
  lostCardFee: z.coerce.number().min(0).default(50000),
});
type FormValues = z.infer<typeof formSchema>;

// ── Form Modal ────────────────────────────────────────────
interface FormModalProps {
  plan?: PricingPlan;
  facilities: Facility[];
  vehicleTypes: VehicleType[];
  onClose: () => void;
  onSuccess: () => void;
}

function FormModal({ plan, facilities, vehicleTypes, onClose, onSuccess }: FormModalProps) {
  const isEdit = !!plan;

  const getVtId = (vt: any) => typeof vt === 'object' ? vt._id : vt;
  const getFacId = (f: any) => typeof f === 'object' ? f._id : f;

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: plan
      ? {
        name: plan.name,
        vehicleTypeId: getVtId(plan.vehicleTypeId),
        facilityId: getFacId(plan.facilityId),
        feeType: plan.feeType,
        rates: plan.rates,
        overnightFee: plan.overnightFee,
        overtimeFeePerHour: plan.overtimeFeePerHour,
        lostCardFee: plan.lostCardFee,
      }
      : { feeType: 'hourly', rates: [{ label: 'First hour', amount: 5000, unit: 'hour' }], overnightFee: 0, overtimeFeePerHour: 0, lostCardFee: 50000 },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rates' });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        const payload: UpdatePricingPlanPayload = {
          name: data.name, feeType: data.feeType, rates: data.rates,
          overnightFee: data.overnightFee, overtimeFeePerHour: data.overtimeFeePerHour, lostCardFee: data.lostCardFee,
        };
        await pricingService.update(plan!._id, payload);
        toast.success('Pricing plan updated successfully');
      } else {
        const payload: CreatePricingPlanPayload = { ...data };
        await pricingService.create(payload);
        toast.success('New pricing plan created successfully');
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Operation failed');
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] bg-white';
  const errCls = 'text-xs text-red-500 mt-0.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#060606]">
            {isEdit ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Pricing Plan Name *</label>
            <input {...register('name')} className={inputCls} placeholder="e.g. Motorbike - Hourly" />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Facility */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Facility *</label>
              <select {...register('facilityId')} className={isEdit ? `${inputCls} bg-gray-100 pointer-events-none opacity-70` : inputCls} tabIndex={isEdit ? -1 : 0}>
                <option value="">-- Select --</option>
                {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              {errors.facilityId && <p className={errCls}>{errors.facilityId.message}</p>}
            </div>

            {/* Vehicle type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Vehicle Type *</label>
              <select {...register('vehicleTypeId')} className={isEdit ? `${inputCls} bg-gray-100 pointer-events-none opacity-70` : inputCls} tabIndex={isEdit ? -1 : 0}>
                <option value="">-- Select --</option>
                {vehicleTypes.map((v) => <option key={v._id} value={v._id}>{v.icon} {v.name}</option>)}
              </select>
              {errors.vehicleTypeId && <p className={errCls}>{errors.vehicleTypeId.message}</p>}
            </div>
          </div>

          {/* Fee type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Fee Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_TYPE_OPTIONS.map(([val, label]) => (
                <Controller key={val} control={control} name="feeType" render={({ field }) => (
                  <label className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer transition-colors text-sm ${field.value === val ? 'border-[#060606] bg-[#d7ee46]/10 font-semibold' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input type="radio" className="sr-only" value={val} checked={field.value === val} onChange={() => field.onChange(val)} />
                    {label}
                  </label>
                )} />
              ))}
            </div>
          </div>

          {/* Rates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Rates *</label>
              <button type="button" onClick={() => append({ label: '', amount: 0, unit: 'hour' })}
                className="text-xs font-medium text-[#060606] hover:underline flex items-center gap-1">
                <Plus size={12} /> Add Rate
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input {...register(`rates.${idx}.label`)} placeholder="Label (e.g. First hour)" className={inputCls} />
                    {errors.rates?.[idx]?.label && <p className={errCls}>{errors.rates[idx]!.label!.message}</p>}
                  </div>
                  <div className="w-28">
                    <input {...register(`rates.${idx}.amount`)} type="number" placeholder="Price" className={inputCls} />
                  </div>
                  <div className="w-20">
                    <input {...register(`rates.${idx}.unit`)} placeholder="Unit" className={inputCls} />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg mt-0.5">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.rates?.root && <p className={errCls}>{errors.rates.root.message}</p>}
          </div>

          {/* Surcharges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><Moon size={11} />Overnight Fee (đ)</label>
              <input {...register('overnightFee')} type="number" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><Clock size={11} />Overtime Fee/h</label>
              <input {...register('overtimeFeePerHour')} type="number" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><CreditCard size={11} />Lost Card Fee</label>
              <input {...register('lostCardFee')} type="number" className={inputCls} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#060606] text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────
interface PlanCardProps {
  plan: PricingPlan;
  facilities: Facility[];
  vehicleTypes: VehicleType[];
  onEdit: (p: PricingPlan) => void;
  onRefresh: () => void;
}

function PlanCard({ plan, facilities, vehicleTypes, onEdit, onRefresh }: PlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const vtId = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId._id : plan.vehicleTypeId;
  const facId = (plan.facilityId && typeof plan.facilityId === 'object') ? plan.facilityId._id : plan.facilityId;
  const vtName = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId.name
    : (vehicleTypes.find(v => v._id === vtId)?.name ?? (vtId || ''));
  const vtIcon = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId.icon
    : (vehicleTypes.find(v => v._id === vtId)?.icon ?? '🚗');
  const facName = (plan.facilityId && typeof plan.facilityId === 'object') ? plan.facilityId.name
    : (facilities.find(f => f._id === facId)?.name ?? (facId || ''));

  const toggle = async (newStatus: 'active' | 'inactive') => {
    setMenuOpen(false); setLoading(true);
    try {
      await pricingService.update(plan._id, { status: newStatus });
      toast.success(newStatus === 'active' ? 'Activated successfully' : 'Deactivated successfully');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Delete pricing plan "${plan.name}"?`)) return;
    setLoading(true);
    try {
      await pricingService.deactivate(plan._id);
      toast.success('Pricing plan deleted successfully');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const mainRate = plan.rates[0];
  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d7ee46]/20 rounded-xl flex items-center justify-center text-lg">{vtIcon}</div>
          <div>
            <h3 className="font-bold text-[#060606] text-sm leading-tight">{plan.name}</h3>
            <p className="text-xs text-gray-500">{facName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>{plan.status === 'active' ? 'Active' : 'Inactive'}</span>
          {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                    <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                    <button onClick={() => { onEdit(plan); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Edit size={13} /> Edit
                    </button>
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    {plan.status === 'active'
                      ? <button onClick={() => toggle('inactive')} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"><PowerOff size={13} /> Deactivate</button>
                      : <button onClick={() => toggle('active')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"><CheckCircle size={13} /> Activate</button>}
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={13} /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Tag size={12} className="text-gray-400" /> {vtName} · <span className="font-medium">{FEE_TYPE_LABELS[plan.feeType]}</span>
        </div>
        {mainRate && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <DollarSign size={12} className="text-gray-400" />
            {mainRate.label}: <span className="font-semibold text-[#060606]">{fmt(mainRate.amount)}</span>/{mainRate.unit}
          </div>
        )}
        {plan.rates.length > 1 && (
          <p className="text-[11px] text-gray-400">+{plan.rates.length - 1} other rates</p>
        )}
      </div>

      {/* Surcharges */}
      {(plan.overnightFee > 0 || plan.overtimeFeePerHour > 0 || plan.lostCardFee > 0) && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
          {plan.overnightFee > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">🌙 {fmt(plan.overnightFee)}</span>}
          {plan.overtimeFeePerHour > 0 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">⏱ {fmt(plan.overtimeFeePerHour)}/h</span>}
          {plan.lostCardFee > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">💳 {fmt(plan.lostCardFee)}</span>}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFacility, setFilterFacility] = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, fRes, vtRes] = await Promise.all([
        pricingService.getAll({ limit: 100 }),
        facilityService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
      ]);
      setPlans(pRes.data);
      setFacilities(fRes.data);
      setVehicleTypes(vtRes.data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const displayed = plans.filter((p) => {
    const facId = typeof p.facilityId === 'object' ? p.facilityId._id : p.facilityId;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterFacility !== 'all' && facId !== filterFacility) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Pricing Plans</h1>
          <p className="text-gray-500 text-sm">Manage parking rate policies (FR-5)</p>
        </div>
        <button
          onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
          className="bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Create Plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-[#060606] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
        <select value={filterFacility} onChange={(e) => setFilterFacility(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d7ee46]">
          <option value="all">All Facilities</option>
          {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{displayed.length} plans</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-44 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No pricing plans found.</p>
          <button onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
            className="mt-4 bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors inline-flex items-center gap-2">
            <Plus size={16} /> Create first pricing plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              facilities={facilities}
              vehicleTypes={vehicleTypes}
              onEdit={(p) => { setEditingPlan(p); setModalOpen(true); }}
              onRefresh={fetchAll}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <FormModal
            plan={editingPlan}
            facilities={facilities}
            vehicleTypes={vehicleTypes}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
