import { Building2, Landmark, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DemoProfile {
  /** Must match an `id` in data/demo_profiles.json — this is what loginAsDemo() receives. */
  id: string;
  track: string;
  icon: LucideIcon;
  name: string;
  patientMeta: string;
  cover: string;
  room: string;
  coPay: string;
  hospital: string;
  /** The coverage mechanic this profile exists to demonstrate. */
  mechanic: string;
  accentText: string;
  accentChip: string;
  accentBorder: string;
  accentRing: string;
}

/**
 * Display metadata for the three guest profiles, transcribed from
 * data/demo_profiles.json — the backend's source of truth for /auth/demo-login.
 */
export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'demo-01-private-insurance',
    track: 'Private insurance',
    icon: ShieldCheck,
    name: 'Ananya Sharma',
    patientMeta: '38F · Bengaluru',
    cover: 'Star Comprehensive · ₹5L',
    room: 'Private AC',
    coPay: 'None',
    hospital: 'Manipal Old Airport Rd',
    mechanic: 'Cashless pre-auth, with a room tariff that has to stay under the cap.',
    accentText: 'text-emerald-700',
    accentChip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentBorder: 'hover:border-emerald-300',
    accentRing: 'focus-within:ring-emerald-500/30 focus-within:border-emerald-400'
  },
  {
    id: 'demo-02-gov-scheme',
    track: 'Government scheme',
    icon: Landmark,
    name: 'Rajesh Verma',
    patientMeta: '55M · Mumbai',
    cover: 'Ayushman Bharat PM-JAY · ₹5L',
    room: 'General ward',
    coPay: 'None',
    hospital: 'KEM Hospital',
    mechanic: 'One bundled package price, so nothing reaches the patient at all.',
    accentText: 'text-sky-700',
    accentChip: 'bg-sky-50 text-sky-700 border-sky-200',
    accentBorder: 'hover:border-sky-300',
    accentRing: 'focus-within:ring-sky-500/30 focus-within:border-sky-400'
  },
  {
    id: 'demo-03-corporate-plan',
    track: 'Corporate plan',
    icon: Building2,
    name: 'Meera Iyer',
    patientMeta: '32F · Bengaluru',
    cover: 'ICICI Lombard Corporate · ₹7L',
    room: 'Deluxe',
    coPay: '10% of the claim',
    hospital: 'Apollo Bannerghatta',
    mechanic: 'A fixed share of every approved claim stays with the patient.',
    accentText: 'text-violet-700',
    accentChip: 'bg-violet-50 text-violet-700 border-violet-200',
    accentBorder: 'hover:border-violet-300',
    accentRing: 'focus-within:ring-violet-500/30 focus-within:border-violet-400'
  }
];
