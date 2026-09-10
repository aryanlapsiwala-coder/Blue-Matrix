import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ROLES } from '../constants/roles';
import { pushCampusNotification } from '../services/notificationService';
import { DotPattern } from '../components/ui/dot-pattern';
import {
  Wrench,
  Search,
  Building,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  X,
  Phone,
  Mail,
  FileText,
  UploadCloud,
  Check,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Download,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

// ==========================================
// 1. INITIAL EQUIPMENT DATASET
// ==========================================

const INITIAL_EQUIPMENT_DATA = [
  {
    id: 'eq_01',
    name: 'NVIDIA DGX A100 SuperPOD High-Density Node',
    category: 'High Performance Computing & AI',
    location: 'Central Computing Lab, Block B — Room 304',
    status: 'OPERATIONAL',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lastMaintenance: '2026-02-15',
    nextMaintenance: '2026-05-15',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600',
    technicianInCharge: 'Marcus Ramirez (Lead Systems Admin)',
    commonIssues: [
      { issue: 'CUDA Driver Mismatch (Error 803)', fix: 'Execute "module load cuda/12.8" and reload nvidia-peermem kernel modules.' },
      { issue: 'Scratch disk quota exceeded (Error 122)', fix: 'Purge temporary PyTorch checkpoints under /scratch/$USER older than 14 days.' },
    ],
    maintenanceSteps: [
      '1. Verify liquid cooling manifold pressure is strictly between 2.4 - 2.8 bar.',
      '2. Run "nvidia-smi -q -d TEMPERATURE" to ensure GPU junction temps are <= 68°C under full load.',
      '3. Inspect InfiniBand 200Gbps QSFP56 optical transceivers for fiber dust attenuation.',
      '4. Verify SLURM cluster daemon heartbeats across all 32 worker partitions.',
    ],
    vendor: {
      name: 'NVIDIA Enterprise Systems & Hewlett Packard Enterprise',
      supportPhone: '+1 (800) 797-6567 / +91 (080) 4185-9900',
      supportEmail: 'enterprise-hpc-support@nvidia.com',
      amcContract: 'Tier-1 24/7 Mission Critical SLA (Valid until Dec 2027)',
      warrantyStatus: 'Active Comprehensive AMC',
    },
    tribalWisdom: {
      knownQuirks: 'Front bezel power button requires a 5-second sustained hold to bypass SLURM auto-lockout. If PyTorch throws CUDA Error 43, reboot worker node using kernel 5.15.',
      adapterLocation: 'Cabinet B, Shelf 2 (200Gbps QSFP56 optical patch cables & USB recovery key)',
      goldenRule: 'Never terminate PyTorch runs with SIGKILL ("kill -9"); use SIGTERM ("kill -15") so unified VRAM registers deallocate cleanly.',
      pastBatchLesson: 'Batch 2024 fried an optical transceiver by hot-plugging fiber under power. Always run "ip link set ib0 down" first.'
    },
  },
  {
    id: 'eq_02',
    name: 'Cadence Virtuoso Silicon Layout & IC Emulation Workstation',
    category: 'VLSI & Semiconductor Design',
    location: 'VLSI Digital Lab, ECE Block 2 — Room 218',
    status: 'OPERATIONAL',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lastMaintenance: '2026-02-20',
    nextMaintenance: '2026-06-20',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    technicianInCharge: 'Priya Sundaram & ECE Lab Staff',
    commonIssues: [
      { issue: 'FlexLM License Server Checkout Failed (Error -15)', fix: 'Restart lmgrd daemon using: "csh /opt/cadence/license/restart_license.csh".' },
      { issue: 'DRC/LVS Rule Deck missing techfiles', fix: 'Verify TSMC 65nm / 28nm PDK paths are linked in ~/.cdsinit.' },
    ],
    maintenanceSteps: [
      '1. Clean Linux host temporary shared memory segments using "ipcs -m | grep cadence".',
      '2. Backup student layout cellviews from local NVMe cache to departmental NAS storage.',
      '3. Run Calibre DRC regression testbench on TSMC reference standard cells.',
    ],
    vendor: {
      name: 'Cadence Design Systems Global University Program',
      supportPhone: '+1 (408) 943-1234 / +91 (080) 4184-1111',
      supportEmail: 'support-academic@cadence.com',
      amcContract: 'University Program Multi-Seat Academic License (Valid until Mar 2028)',
      warrantyStatus: 'Active Software Assurance',
    },
    tribalWisdom: {
      knownQuirks: 'TSMC 65nm techfile throws false DRC errors if CDS_Netlisting_Mode is not set to Analog. Launch virtuoso strictly from terminal using "tcsh".',
      adapterLocation: 'Server Rack 4, Drawer 1 (Hardware FlexLM HASP Sentinel Dongle & TSMC PDK USB)',
      goldenRule: 'Always exit Virtuoso via File -> Exit before locking Linux session; otherwise your layout lock files (*.cdslck) remain locked forever.',
      pastBatchLesson: 'Past capstone batch lost 3 weeks of layout work due to local NVMe auto-wiping. Always symlink ~/cds_work to departmental NAS.'
    },
  },
  {
    id: 'eq_03',
    name: 'High-Temperature Autoclave Sterilizer 50L (Digital Dual Chamber)',
    category: 'Biotechnology & Wet Lab',
    location: 'Biotechnology & Genomics Lab, Ground Floor — Room 102',
    status: 'MAINTENANCE DUE',
    statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
    lastMaintenance: '2025-11-10',
    nextMaintenance: '2026-02-28',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
    technicianInCharge: 'Fatima Al-Mansoor (Lab Technician)',
    commonIssues: [
      { issue: 'Lid Safety Interlock Sensor Stuck', fix: 'Clean silicone sealing ring gasket with 70% isopropyl alcohol and lubricate latch.' },
      { issue: 'Slow Pressure Build-up (>25 mins to 121°C)', fix: 'Descaling heating coil using dilute citric acid flush cycle.' },
    ],
    maintenanceSteps: [
      '1. Inspect pressure safety release valve (pop-off valve) at 15 PSI.',
      '2. Check heating element resistance with multimeter (should measure ~18.5 Ohms).',
      '3. Replace distilled water reservoir filter cartridge every 30 operational cycles.',
      '4. Run biological spore strip (Geobacillus stearothermophilus) test for sterility audit.',
    ],
    vendor: {
      name: 'Systec BioSciences & Thermo Fisher Scientific',
      supportPhone: '+1 (800) 556-2323 / +91 (022) 6716-2200',
      supportEmail: 'service.lifesciences@thermofisher.com',
      amcContract: 'Annual Preventive Maintenance (Renewal Scheduled March 2026)',
      warrantyStatus: 'Standard Annual Maintenance',
    },
    tribalWisdom: {
      knownQuirks: 'Pressure release valve sticks if distilled water purity drops below 1.5 microSiemens. Tap water will destroy the heating element in 48 hours.',
      adapterLocation: 'Sterilization Bay, Blue Toolbox (Silicone gasket grease & spare 15 PSI safety burst discs)',
      goldenRule: 'Never open chamber lid until temperature drops below 80°C and gauge reads strictly 0.0 PSI (hot agar will flash-boil and explode).',
      pastBatchLesson: 'A past researcher melted 20 polypropylene test tubes by selecting 134°C cycle instead of 121°C. Always verify autoclave-safe plastic grades.'
    },
  },
  {
    id: 'eq_04',
    name: 'Keysight 4-Channel Infiniium Mixed Signal Oscilloscope (4 GHz)',
    category: 'Electronics & RF Testing',
    location: 'Advanced Communication & RF Lab, ECE Block — Room 310',
    status: 'OPERATIONAL',
    statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lastMaintenance: '2026-01-10',
    nextMaintenance: '2026-07-10',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
    technicianInCharge: 'Priya Sundaram (Faculty In-Charge)',
    commonIssues: [
      { issue: 'Active Probe DC Offset Calibration Drift', fix: 'Run self-calibration routine from Utilities -> Calibration -> Full Routine.' },
      { issue: 'Screen Touch Digitizer Lag', fix: 'Connect external USB mouse and reboot Windows Embedded OS.' },
    ],
    maintenanceSteps: [
      '1. Perform factory zero-point DC offset calibration with 50-Ohm BNC terminator.',
      '2. Clean intake dust filters on rear chassis fans with compressed air.',
      '3. Verify BNC connector coaxial impedance on all 4 analog channels.',
    ],
    vendor: {
      name: 'Keysight Technologies Global Support',
      supportPhone: '+1 (800) 829-4444 / +91 (0124) 434-2000',
      supportEmail: 'tm_india@keysight.com',
      amcContract: 'Calibration Assurance Plan (Annual NABL Accredited Certificate)',
      warrantyStatus: 'Active Warranty & Calibration SLA',
    },
    tribalWisdom: {
      knownQuirks: 'Channel 3 BNC input has a slight 2.4mV offset drift after 3 hours of continuous runtime; run quick self-calibration from Utilities menu.',
      adapterLocation: 'Workbench Drawer A3 (4x 500MHz active differential probes, 50-Ohm BNC terminators, and grounding clips)',
      goldenRule: 'Never connect RF power exceeding +20 dBm (100mW) directly without an external 30dB inline coaxial attenuator.',
      pastBatchLesson: 'A previous student burned the front-end amplifier on Channel 1 by connecting a 50V inductive motor spike. Always check input coupling range!'
    },
  },
  {
    id: 'eq_05',
    name: 'Universal Testing Machine (UTM) 100kN Tensile & Compression Tester',
    category: 'Mechanical & Structural Testing',
    location: 'Materials Testing Workshop, Mechanical Block — Bay 4',
    status: 'CALIBRATION REQUIRED',
    statusClass: 'bg-rose-100 text-rose-800 border-rose-200',
    lastMaintenance: '2025-10-05',
    nextMaintenance: '2026-02-01',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600',
    technicianInCharge: 'Rohan Sharma & Workshop Superintendent',
    commonIssues: [
      { issue: 'Hydraulic Crosshead Creep during static load hold', fix: 'Check hydraulic oil ISO VG 46 level and inspect check-valve seals.' },
      { issue: 'Extensometer Strain Gauge Drift', fix: 'Re-zero load cell amplifier before specimen clamp engagement.' },
    ],
    maintenanceSteps: [
      '1. Calibrate 100kN S-type load cell using calibrated deadweights.',
      '2. Lubricate dual ball-screws with Mobilux EP2 high-pressure grease.',
      '3. Test emergency stop limit switches on upper and lower crosshead stops.',
    ],
    vendor: {
      name: 'Instron & Tinius Olsen Testing Systems',
      supportPhone: '+1 (800) 473-7838 / +91 (044) 2836-8000',
      supportEmail: 'service@instron.com',
      amcContract: 'On-Site Hydro-Mechanical Service Contract',
      warrantyStatus: 'AMC Renewal in Progress',
    },
    tribalWisdom: {
      knownQuirks: 'Lower hydraulic crosshead creeps downward by 0.3mm if oil temperature exceeds 45°C. Allow 15-minute cool down between high-cycle fatigue tests.',
      adapterLocation: 'Bay 4 Tool Chest, Cabinet 1 (Wedge grips for tensile specimens, calibration spanner, and extensometer gauge pin)',
      goldenRule: 'Always set mechanical physical limit switches before mounting high-strength tensile specimens to prevent crosshead bottoming-out into load cell.',
      pastBatchLesson: 'A tensile specimen shattered and sheared the extensometer knife-edges because the safety shield was bypassed. Safety acrylic shield is mandatory.'
    },
  },
];

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export function EquipmentWiki() {
  const { user, awardPoints } = useAuth();

  // State
  const [equipmentList, setEquipmentList] = useState(INITIAL_EQUIPMENT_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipmentDetail, setSelectedEquipmentDetail] = useState(null);

  // Add Equipment Entry Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqCategory, setNewEqCategory] = useState('High Performance Computing & AI');
  const [newEqLocation, setNewEqLocation] = useState('');
  const [newEqStatus, setNewEqStatus] = useState('OPERATIONAL');
  const [newEqCommonIssues, setNewEqCommonIssues] = useState('');
  const [newEqMaintenanceSteps, setNewEqMaintenanceSteps] = useState('');
  const [newEqVendorName, setNewEqVendorName] = useState('');
  const [newEqVendorPhone, setNewEqVendorPhone] = useState('');
  const [newEqVendorEmail, setNewEqVendorEmail] = useState('');
  const [newEqAMC, setNewEqAMC] = useState('');
  const [newEqImage, setNewEqImage] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600');
  const [addSuccessToast, setAddSuccessToast] = useState(false);

  // Tacit Quirk Modal State
  const [quirkModalOpen, setQuirkModalOpen] = useState(false);
  const [quirkType, setQuirkType] = useState('knownQuirks');
  const [quirkText, setQuirkText] = useState('');
  const [quirkToast, setQuirkToast] = useState(false);

  // Live Supabase PostgreSQL query
  useEffect(() => {
    const fetchLiveEquipment = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('lab_equipment')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const dbList = data.map((d) => ({
              id: d.id,
              name: d.name,
              category: d.category || 'Laboratory Infrastructure',
              location: d.location || 'Central University Labs',
              status: d.status || 'OPERATIONAL',
              statusClass:
                d.status === 'OPERATIONAL'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : d.status === 'MAINTENANCE DUE'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200',
              lastMaintenance: d.created_at?.split('T')[0] || '2026-02-01',
              nextMaintenance: '2026-08-01',
              image: d.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
              technicianInCharge: d.lead_technician || 'Campus Technician In-Charge',
              commonIssues: d.troubleshooting_guide
                ? d.troubleshooting_guide.split('\n').map((l) => ({ issue: l.split(':')[0] || l, fix: l.split(':')[1] || 'See SOP manual' }))
                : [{ issue: 'Calibration Check', fix: 'Follow operating handbook' }],
              maintenanceSteps: d.sop_guide
                ? d.sop_guide.split('\n')
                : ['1. Standard safety check', '2. Power-on calibration self-test'],
              vendor: {
                name: d.vendor_contact?.split('(')[0] || 'Campus Equipment Vendor',
                supportPhone: '+1 (800) 555-0199',
                supportEmail: 'lab-support@university.edu',
                amcContract: 'Institutional Service SLA',
                warrantyStatus: 'Active Service SLA',
              },
              tribalWisdom: {
                knownQuirks: 'Verify power-on grounding and allow 60-second warm-up before running high-voltage tests.',
                adapterLocation: 'Cabinet A, Shelf 1 with Lab Technician in-charge.',
                goldenRule: 'Always log operational runtime in the physical lab registry.',
                pastBatchLesson: 'Ensure all cable locks are engaged before initiating tests.',
              },
            }));

            // Merge with standard benchmarks without duplicate names
            const existingNames = new Set(dbList.map((e) => e.name.toLowerCase()));
            const benchmarks = INITIAL_EQUIPMENT_DATA.filter((b) => !existingNames.has(b.name.toLowerCase()));
            setEquipmentList([...dbList, ...benchmarks]);
          }
        } catch (err) {
          console.warn('Equipment live sync error:', err);
        }
      }
    };

    fetchLiveEquipment();
  }, []);

  // Filtered Equipment
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((eq) => {
      const matchSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.commonIssues.some((ci) => ci.issue.toLowerCase().includes(searchQuery.toLowerCase()) || ci.fix.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'All' || eq.category.includes(selectedCategory);
      return matchSearch && matchCat;
    });
  }, [equipmentList, searchQuery, selectedCategory]);

  // Handle Add Equipment Form Submit
  const handleAddEquipmentSubmit = async (e) => {
    e.preventDefault();
    if (!newEqName || !newEqLocation) return;

    const parsedIssues = newEqCommonIssues
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const parts = line.split(':');
        return { issue: parts[0]?.trim() || line, fix: parts[1]?.trim() || 'Follow standard technician operating manual.' };
      });

    const parsedSteps = newEqMaintenanceSteps
      .split('\n')
      .filter((line) => line.trim().length > 0);

    const newEntry = {
      id: `eq_${Date.now()}`,
      name: newEqName,
      category: newEqCategory,
      location: newEqLocation,
      status: newEqStatus,
      statusClass:
        newEqStatus === 'OPERATIONAL'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : newEqStatus === 'MAINTENANCE DUE'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-rose-100 text-rose-800 border-rose-200',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: '2026-06-30',
      image: newEqImage,
      technicianInCharge: `${user?.name || 'Technician'} (${user?.role || 'TECHNICIAN'})`,
      commonIssues: parsedIssues.length > 0 ? parsedIssues : [{ issue: 'General Calibration Required', fix: 'Consult technician on duty.' }],
      maintenanceSteps: parsedSteps.length > 0 ? parsedSteps : ['1. Verify power supply and grounding.', '2. Run self-test diagnostics.'],
      vendor: {
        name: newEqVendorName || 'University Approved Supplier',
        supportPhone: newEqVendorPhone || '+91 98765-43210',
        supportEmail: newEqVendorEmail || 'service@vendor.edu',
        amcContract: newEqAMC || 'Campus AMC Contract Active',
        warrantyStatus: 'Active Service SLA',
      },
    };

    // Save to Supabase PostgreSQL table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lab_equipment').insert([
          {
            name: newEqName,
            category: newEqCategory,
            location: newEqLocation,
            status: newEqStatus,
            image_url: newEqImage,
            lead_technician: `${user?.name || 'Technician'} (${user?.role || 'TECHNICIAN'})`,
            sop_guide: parsedSteps.join('\n'),
            troubleshooting_guide: parsedIssues.map((i) => `${i.issue}: ${i.fix}`).join('\n'),
            vendor_contact: `${newEqVendorName} (${newEqVendorPhone}, ${newEqVendorEmail})`,
          },
        ]);
        console.log('[Supabase] Saved lab equipment to PostgreSQL:', newEqName);
      } catch (err) {
        console.warn('Error saving equipment to Supabase:', err);
      }
    }

    if (awardPoints) {
      awardPoints(50, `Added lab SOP for "${newEqName}"`);
    }

    pushCampusNotification(user?.email, {
      title: 'Lab Hardware SOP Registered 🔬',
      desc: `"${newEqName}" was added to the Central Equipment Wiki with runbook & troubleshooting steps.`,
      type: 'equipment',
      link: '/equipment',
    });

    setEquipmentList([newEntry, ...equipmentList]);
    setAddSuccessToast(true);
    setAddModalOpen(false);

    // Reset Form
    setNewEqName('');
    setNewEqLocation('');
    setNewEqCommonIssues('');
    setNewEqMaintenanceSteps('');
    setNewEqVendorName('');
    setNewEqVendorPhone('');
    setNewEqVendorEmail('');
    setNewEqAMC('');

    setTimeout(() => setAddSuccessToast(false), 4000);
  };

  // Handle Save Hardware Quirk
  const handleSaveQuirk = (e) => {
    e.preventDefault();
    if (!quirkText.trim() || !selectedEquipmentDetail) return;

    const updatedDetail = {
      ...selectedEquipmentDetail,
      tribalWisdom: {
        ...(selectedEquipmentDetail.tribalWisdom || {}),
        [quirkType]: quirkText.trim(),
      },
    };

    setSelectedEquipmentDetail(updatedDetail);
    setEquipmentList((prev) =>
      prev.map((item) => (item.id === selectedEquipmentDetail.id ? updatedDetail : item))
    );

    if (awardPoints) {
      awardPoints(25, `Contributed tacit hardware quirk for "${selectedEquipmentDetail.name}"`);
    }

    pushCampusNotification(user?.email, {
      title: 'Tacit Hardware Quirk Logged 💡',
      desc: `You contributed a real-world workaround for "${selectedEquipmentDetail.name}". Earned +25 KnowPoints!`,
      type: 'equipment',
      link: '/equipment',
    });

    setQuirkModalOpen(false);
    setQuirkText('');
    setQuirkToast(true);
    setTimeout(() => setQuirkToast(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HERO BANNER
      ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-indigo-500/20">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="fill-indigo-400/25 opacity-70 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"
        />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold border border-white/15">
            <Wrench className="w-3.5 h-3.5 text-emerald-300" />
            FEDERATED GLOBAL LABORATORY INFRASTRUCTURE WIKI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Research Facility & Lab Equipment Runbooks
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            SOPs, tacit hardware workarounds, calibration checklists, and authorized vendor escalation protocols across federated campus nodes
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 px-4 py-2.5 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Facility Hardware</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {addSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in slide-in-from-top duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>New Lab Equipment entry created and indexed into the global facility wiki!</span>
          </div>
          <button onClick={() => setAddSuccessToast(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          SEARCH & CATEGORY FILTERS
      ======================================================== */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, facility node, room location, error code, or vendor..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none"
          >
            <option value="All">🌐 All Federated Research Nodes</option>
            <option value="High Performance Computing">🖥️ AI & HPC Supercomputing Node</option>
            <option value="VLSI">🔬 Silicon & Microelectronics VLSI Node</option>
            <option value="Biotechnology">🧬 Genomic & Wet-Lab Facility Node</option>
            <option value="Electronics">📡 Electronics & RF Testing Node</option>
            <option value="Mechanical">⚙️ Materials & Structural Testing Node</option>
          </select>
        </div>
      </Card>

      {/* ========================================================
          EQUIPMENT CARDS GRID
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <Card
            key={eq.id}
            className="p-0 overflow-hidden border border-slate-200/80 hover:shadow-lg transition flex flex-col justify-between group"
          >
            <div>
              {/* Equipment Photo with Status Badge Overlay */}
              <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                />
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm ${eq.statusClass}`}>
                    {eq.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
                    {eq.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {eq.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>{eq.location}</span>
                  </p>
                </div>

                {/* Common Issue Sneak Peek */}
                {eq.commonIssues && eq.commonIssues.length > 0 && (
                  <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Known Issue & Quick Fix:
                    </span>
                    <p className="font-bold text-slate-900 text-[11px] line-clamp-1">{eq.commonIssues[0].issue}</p>
                    <p className="text-slate-600 text-[10px] line-clamp-1">Fix: {eq.commonIssues[0].fix}</p>
                  </div>
                )}

                {/* Vendor Contact Snippet */}
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                  <p><strong className="text-slate-700">Vendor:</strong> {eq.vendor?.name ? eq.vendor.name.split('&')[0] : 'Authorized Lab Supplier'}</p>
                  <p><strong className="text-slate-700">Support:</strong> {eq.vendor?.supportPhone || 'Campus Extension 4185'}</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">
                Tech: {eq.technicianInCharge ? eq.technicianInCharge.split('(')[0] : 'Lab Staff'}
              </span>

              <Button
                size="sm"
                onClick={() => setSelectedEquipmentDetail(eq)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <span>View Full SOP</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ========================================================
          MODAL 1: FULL EQUIPMENT DETAIL & SOP MODAL
      ======================================================== */}
      {selectedEquipmentDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${selectedEquipmentDetail.statusClass || 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                    {selectedEquipmentDetail.status || 'OPERATIONAL'}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {selectedEquipmentDetail.category || 'Laboratory Infrastructure'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedEquipmentDetail.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedEquipmentDetail.location || 'Central Research Lab'}</span>
                  <span>•</span>
                  <span>Managed by {selectedEquipmentDetail.technicianInCharge || 'Department Technical Officer'}</span>
                </p>
              </div>
              <button onClick={() => setSelectedEquipmentDetail(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {/* Photo & Specs Banner */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <img
                  src={selectedEquipmentDetail.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'}
                  alt={selectedEquipmentDetail.name}
                  className="w-full sm:w-48 h-32 object-cover rounded-xl shadow-sm"
                />
                <div className="space-y-1.5 flex-1 text-xs">
                  <p><strong className="text-slate-700">Last Maintenance Audit:</strong> {selectedEquipmentDetail.lastMaintenance || 'Verified Active'}</p>
                  <p><strong className="text-slate-700">Next Scheduled Service:</strong> {selectedEquipmentDetail.nextMaintenance || 'Quarterly Cycle'}</p>
                  <p><strong className="text-slate-700">AMC Warranty Tier:</strong> {selectedEquipmentDetail.vendor?.warrantyStatus || 'Active Comprehensive AMC'}</p>
                  <p><strong className="text-slate-700">Contract Code:</strong> {selectedEquipmentDetail.vendor?.amcContract || 'Tier-1 Institutional SLA'}</p>
                </div>
              </div>

              {/* Facility Tribal Knowledge & Secret Workarounds */}
              {selectedEquipmentDetail.tribalWisdom ? (
                <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-50 to-indigo-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                        Facility Tribal Knowledge & Tacit Workarounds
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuirkModalOpen(true)}
                        className="text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-0.5 rounded-full transition flex items-center gap-1 shadow-2xs"
                      >
                        <PlusCircle className="w-3 h-3" />
                        + Log Quirk (+25 pts)
                      </button>
                      <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                        Not in Vendor Manual
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Known Quirk */}
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                      <p className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                        ⚠️ Known Hardware Quirk:
                      </p>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {selectedEquipmentDetail.tribalWisdom.knownQuirks || 'Run power-on diagnostics for 30 seconds before launching software.'}
                      </p>
                    </div>

                    {/* Adapter Location */}
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                      <p className="font-bold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                        📍 Physical Key / Dongle Location:
                      </p>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {selectedEquipmentDetail.tribalWisdom.adapterLocation || 'Tool Cabinet A, Drawer 2 with Faculty In-Charge.'}
                      </p>
                    </div>

                    {/* Golden Rule */}
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                      <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                        💡 Golden Operational Rule:
                      </p>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {selectedEquipmentDetail.tribalWisdom.goldenRule || 'Always save testbench configuration files to departmental network storage.'}
                      </p>
                    </div>

                    {/* Past Batch Failure Lesson */}
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                      <p className="font-bold text-rose-900 flex items-center gap-1.5 text-[11px]">
                        🚨 Past Batch Failure Lesson:
                      </p>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {selectedEquipmentDetail.tribalWisdom.pastBatchLesson || 'Ensure emergency stop is tested prior to initiating high-load operational cycle.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Maintenance Steps */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  Step-by-Step Maintenance & Calibration Checklist:
                </h4>
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2 font-mono text-xs text-indigo-950">
                  {(Array.isArray(selectedEquipmentDetail.maintenanceSteps) ? selectedEquipmentDetail.maintenanceSteps : ['1. Standard power check', '2. Run system calibration']).map((step, idx) => (
                    <p key={idx}>{step}</p>
                  ))}
                </div>
              </div>

              {/* Common Issues & Fixes */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Troubleshooting Common Failure Modes & Quick Fixes:
                </h4>
                <div className="space-y-2">
                  {(Array.isArray(selectedEquipmentDetail.commonIssues) ? selectedEquipmentDetail.commonIssues : []).map((ci, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                      <p className="font-bold text-rose-700">⚠️ Issue: {ci.issue}</p>
                      <p className="text-slate-700 font-medium">🛠️ Solution: {ci.fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor & Emergency Hotline */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  Authorized Vendor Support & Emergency Escalation:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Vendor Partner:</p>
                    <p className="font-bold text-white">{selectedEquipmentDetail.vendor?.name || 'Authorized Technical Partner'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Support Hotline:</p>
                    <p className="font-bold text-emerald-400">{selectedEquipmentDetail.vendor?.supportPhone || '+1 (800) 555-0199'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Service Email:</p>
                    <p className="font-bold text-indigo-300">{selectedEquipmentDetail.vendor?.supportEmail || 'support@academic-hardware.com'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Institutional Lab Wiki SOP
              </span>
              <Button size="sm" onClick={() => setSelectedEquipmentDetail(null)}>
                Close SOP
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: "ADD EQUIPMENT ENTRY" QUICK FORM FOR TECHNICIANS
      ======================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Technician Wiki Contributor
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Add Lab Equipment Entry & Maintenance SOP
                </h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipmentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={newEqName}
                    onChange={(e) => setNewEqName(e.target.value)}
                    placeholder="e.g. 3D Laser Sintering Printer 400W"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laboratory Discipline *</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                  >
                    <option value="High Performance Computing & AI">High Performance Computing & AI</option>
                    <option value="VLSI & Semiconductor Design">VLSI & Semiconductor Design</option>
                    <option value="Biotechnology & Wet Lab">Biotechnology & Wet Lab</option>
                    <option value="Electronics & RF Testing">Electronics & RF Testing</option>
                    <option value="Mechanical & Structural Testing">Mechanical & Structural Testing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lab Room & Building Location *</label>
                  <input
                    type="text"
                    required
                    value={newEqLocation}
                    onChange={(e) => setNewEqLocation(e.target.value)}
                    placeholder="e.g. Robotics Lab, Tech Block C — Room 108"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Status *</label>
                  <select
                    value={newEqStatus}
                    onChange={(e) => setNewEqStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="MAINTENANCE DUE">MAINTENANCE DUE</option>
                    <option value="CALIBRATION REQUIRED">CALIBRATION REQUIRED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Common Failure Issues & Quick Fixes (Format: Issue : Fix per line)
                </label>
                <textarea
                  rows={3}
                  value={newEqCommonIssues}
                  onChange={(e) => setNewEqCommonIssues(e.target.value)}
                  placeholder="e.g. Laser lens fogging : Clean with optic wipes and anhydrous methanol&#10;Emergency stop tripped : Reset E-stop knob clockwise"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Step-by-Step Maintenance Checklist (1 step per line)
                </label>
                <textarea
                  rows={3}
                  value={newEqMaintenanceSteps}
                  onChange={(e) => setNewEqMaintenanceSteps(e.target.value)}
                  placeholder="1. Power down main breaker before chassis inspection&#10;2. Check coolant reservoir levels&#10;3. Run calibration calibration pass"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newEqVendorName}
                    onChange={(e) => setNewEqVendorName(e.target.value)}
                    placeholder="e.g. EOS Laser Systems"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={newEqVendorPhone}
                    onChange={(e) => setNewEqVendorPhone(e.target.value)}
                    placeholder="+91 1800-419-0000"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={newEqVendorEmail}
                    onChange={(e) => setNewEqVendorEmail(e.target.value)}
                    placeholder="service@vendor.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save & Index Equipment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: LOG TACIT HARDWARE QUIRK / TIP MODAL
      ======================================================== */}
      {quirkModalOpen && selectedEquipmentDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Log Tacit Hardware Quirk</h3>
                  <p className="text-[11px] text-slate-500">For {selectedEquipmentDetail.name}</p>
                </div>
              </div>
              <button onClick={() => setQuirkModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuirk} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Workaround / Quirk Category</label>
                <select
                  value={quirkType}
                  onChange={(e) => setQuirkType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="knownQuirks">⚠️ Known Hardware Quirk / OS Bug Fix</option>
                  <option value="adapterLocation">📍 Physical Key / Dongle / Adapter Location</option>
                  <option value="goldenRule">💡 Golden Operational Rule</option>
                  <option value="pastBatchLesson">🚨 Past Batch Failure Lesson / Avoid Costly Damage</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Practical Workaround Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={quirkText}
                  onChange={(e) => setQuirkText(e.target.value)}
                  placeholder="e.g. If CUDA throws error 43, hold the front power button for 5 seconds to bypass the SLURM interlock. Adapter is in Cabinet B, Shelf 2."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Contributor Bounty Reward:
                </span>
                <span className="font-mono font-bold bg-amber-200 px-2 py-0.5 rounded text-amber-950">+25 KnowPoints</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setQuirkModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Publish Hardware Quirk
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quirk Toast Notification */}
      {quirkToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Tacit Hardware Quirk published! +25 KnowPoints credited.</span>
        </div>
      )}
    </div>
  );
}
