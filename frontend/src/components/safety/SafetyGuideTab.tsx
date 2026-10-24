import React, { useState } from 'react';
import {
  LifeBuoy,
  ShieldAlert,
  Zap,
  Flame,
  Phone,
  CheckSquare,
  Square,
  AlertOctagon,
  HeartPulse,
  Printer,
  ChevronRight
} from 'lucide-react';

export const SafetyGuideTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'storm' | 'lightning' | 'heat'>('storm');

  // Interactive Checklist State
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    item1: true,
    item2: true,
    item3: false,
    item4: false,
    item5: false,
    item6: false,
    item7: false
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    { id: 'item1', label: 'Battery-powered transistor radio with spare dry cells for IMD bulletins' },
    { id: 'item2', label: '3-day potable water supply (3-4 litres per person per day in sealed containers)' },
    { id: 'item3', label: 'Non-perishable dry ration (chura, gur, sattu, biscuits, canned food)' },
    { id: 'item4', label: 'Waterproof polythene pouch for Aadhaar, land deeds, bank passbooks, cash' },
    { id: 'item5', label: 'Emergency First-Aid Kit with ORS packets, bandage, antiseptic, chlorine tablets' },
    { id: 'item6', label: 'Fully charged power banks and manual wind-up LED emergency torches' },
    { id: 'item7', label: 'Essential prescription medicines for elderly and infants for at least 7 days' },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-cyan-400" />
            Public Safety, First-Aid Triage & Emergency Helplines
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Standard operating protocols validated by NDMA (National Disaster Management Authority) & Indian Red Cross.
          </p>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'storm', label: 'Tropical Cyclone & Gales', icon: ShieldAlert, color: 'text-red-400' },
          { id: 'lightning', label: 'Lightning & Thundersqualls', icon: Zap, color: 'text-amber-400' },
          { id: 'heat', label: 'Heat Stroke Emergency First-Aid', icon: Flame, color: 'text-orange-400' }
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Do's and Don'ts Content */}
      {activeCategory === 'storm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-panel p-5 border-l-4 border-l-emerald-500 space-y-3">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              CYCLONE DO'S (MANDATORY ACTIONS)
            </h3>
            <ul className="text-xs text-slate-200 space-y-2 list-disc list-inside leading-relaxed">
              <li>Inspect house roof, clear dead branches, and secure loose sheet roofing.</li>
              <li>Keep battery radio tuned to All India Radio / IMD regional cyclone bulletins.</li>
              <li>Move livestock and pets to high ground away from coastal creeks and mangroves.</li>
              <li>Switch off primary electrical mains and turn off LPG cylinder valves before landfall.</li>
              <li>Evacuate to designated RCC pucca shelters if living in kutcha or mud-thatch homes.</li>
              <li>Boil drinking water or use chlorine purification tablets before consumption.</li>
            </ul>
          </div>

          <div className="glass-panel p-5 border-l-4 border-l-red-500 space-y-3">
            <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              CYCLONE DON'TS (STRICT HAZARDS)
            </h3>
            <ul className="text-xs text-slate-200 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Do NOT venture out during the eye passage:</strong> Sudden calm winds will violently reverse direction within 30-45 minutes at maximum intensity.</li>
              <li>Do NOT believe unverified WhatsApp or social media rumors; rely only on IMD/NDMA.</li>
              <li>Do NOT drive on waterlogged causeways or near fallen high-voltage electrical poles.</li>
              <li>Do NOT touch dangling power lines or flooded transformers.</li>
              <li>Do NOT remain inside weak or asbestos-sheet structures once gale winds exceed 80 km/h.</li>
            </ul>
          </div>
        </div>
      )}

      {activeCategory === 'lightning' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-panel p-5 border-l-4 border-l-emerald-500 space-y-3">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              LIGHTNING SAFETY (30-30 RULE)
            </h3>
            <ul className="text-xs text-slate-200 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>30-30 Rule:</strong> If time between flash and thunder is under 30 seconds, immediately seek indoor shelter. Wait 30 minutes after last thunder before venturing out.</li>
              <li>Seek shelter inside a substantial pucca building or fully enclosed metal-top automobile.</li>
              <li>If caught in open field: Adopt the <strong>Lightning Crouch</strong> (crouch low on balls of feet, hands over ears, head between knees, minimize ground contact).</li>
              <li>Unplug sensitive home electronics and television coaxial cables during squalls.</li>
            </ul>
          </div>

          <div className="glass-panel p-5 border-l-4 border-l-red-500 space-y-3">
            <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              LIGHTNING LETHAL HAZARDS
            </h3>
            <ul className="text-xs text-slate-200 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>NEVER take shelter under an isolated tall tree:</strong> Causes deadly side-flash.</li>
              <li>Do NOT hold umbrellas with metal tips, golf clubs, or metal farming implements.</li>
              <li>Avoid open tractors, tin-roof sheds, elevated ridges, and wire boundary fences.</li>
              <li>Do NOT swim or stand in water bodies (ponds, irrigation canals, rivers).</li>
              <li>Avoid using corded landline telephones or taking showers during electrical storms.</li>
            </ul>
          </div>
        </div>
      )}

      {activeCategory === 'heat' && (
        <div className="space-y-5">
          {/* Step-by-Step Heat Stroke Emergency Flowchart */}
          <div className="glass-panel p-5 border border-red-900/60 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <HeartPulse className="w-5 h-5 text-red-400 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Step-by-Step Heat Stroke Emergency Triage (Life-Saving Flowchart)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-red-900 text-white font-mono font-bold text-[10px]">
                  STEP 01: RECOGNIZE
                </span>
                <h4 className="font-bold text-white text-sm">Detect Heat Stroke Signs</h4>
                <p className="text-slate-300 leading-relaxed">
                  High core temperature (&gt; 40&deg;C), hot red dry skin, confusion, delirium, slurred speech, or loss of consciousness.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px]">
                  STEP 02: CALL 112 / 108
                </span>
                <h4 className="font-bold text-white text-sm">Call Ambulance Immediately</h4>
                <p className="text-slate-300 leading-relaxed">
                  Heat stroke is a medical emergency. Request an ambulance with ice packs or cold water immersion facility.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-cyan-700 text-white font-mono font-bold text-[10px]">
                  STEP 03: RAPID COOLING
                </span>
                <h4 className="font-bold text-white text-sm">Cool First, Transport Second</h4>
                <p className="text-slate-300 leading-relaxed">
                  Move to AC or shade. Douse body with cold water, fan vigorously, and place ice packs on armpits, groin, and neck.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-mono font-bold text-[10px]">
                  STEP 04: HYDRATION RULE
                </span>
                <h4 className="font-bold text-white text-sm">Do NOT Force Liquids</h4>
                <p className="text-slate-300 leading-relaxed">
                  Only give sips of cold ORS / water if patient is fully conscious and swallowing normally. Never force fluids into an unconscious victim.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Directory */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Official 24/7 Emergency Helpline Directory (Tap to Call)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Toll-Free Numbers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {[
            { label: 'National All Emergency', number: '112', desc: 'Police / Fire / Disaster' },
            { label: 'Emergency Ambulance', number: '108', desc: 'Free Medical Response' },
            { label: 'NDMA National Control', number: '1078', desc: 'Disaster Management' },
            { label: 'Odisha SDMA', number: '1070', desc: 'Cyclone Control Room' },
            { label: 'West Bengal SDMA', number: '1070', desc: 'State Relief Dept' },
            { label: 'Andhra Pradesh SDMA', number: '1070', desc: 'Disaster Helpline' },
          ].map((item) => (
            <a
              key={item.label}
              href={`tel:${item.number}`}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 transition-all text-center group block"
            >
              <span className="text-[10px] text-slate-400 block mb-0.5">{item.label}</span>
              <span className="text-xl font-black text-emerald-400 font-mono group-hover:scale-105 transition-transform block">
                {item.number}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">{item.desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Downloadable / Printable Preparedness Checklist */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              Emergency Kit Preparedness Checklist
            </h3>
            <span className="text-xs text-slate-400">
              Completed: <strong className="text-cyan-400">{checkedCount} of {checklistItems.length}</strong> essentials ready
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 self-start sm:self-center"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist</span>
          </button>
        </div>

        <div className="space-y-2">
          {checklistItems.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 text-xs ${
                  isChecked
                    ? 'bg-cyan-950/20 border-cyan-500/50 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600 shrink-0" />
                )}
                <span className={isChecked ? 'line-through opacity-80' : ''}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
