import React, { useState } from 'react';
import {
  Users,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  MessageSquare,
  Heart,
  Globe,
  Share2
} from 'lucide-react';
import { CitizenReportItem } from '../../types';

interface CommunityTabProps {
  reports: CitizenReportItem[];
  onSubmitReport: (report: CitizenReportItem) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ reports, onSubmitReport }) => {
  // Citizen form state
  const [category, setCategory] = useState<'storm_seen' | 'extreme_heat' | 'flooding' | 'damage'>('storm_seen');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(4);
  const [reporterName, setReporterName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Feedback form state
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbCategory, setFbCategory] = useState('feature_request');
  const [fbSubmitted, setFbSubmitted] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmitCitizenReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName || !description) return;

    // Approximate coordinates for demo locations
    const lat = category === 'storm_seen' ? 20.3 : 21.1;
    const lon = category === 'storm_seen' ? 86.6 : 79.1;

    const newReport: CitizenReportItem = {
      id: `rep-${Date.now()}`,
      category,
      description,
      location_name: locationName,
      lat,
      lon,
      intensity_rating: intensity,
      reporter_name: reporterName || 'Anonymous Citizen',
      verified: false,
      timestamp: new Date().toISOString(),
      photo_url: photoPreview || undefined
    };

    onSubmitReport(newReport);
    setReportSubmitted(true);
    setLocationName('');
    setDescription('');
    setPhotoPreview(null);
    setTimeout(() => setReportSubmitted(false), 4000);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFbSubmitted(true);
    setFbName('');
    setFbEmail('');
    setFbMessage('');
    setTimeout(() => setFbSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Citizen Weather Observations, Community Feed & Project SkyShield
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Crowdsource real-time ground truth observations to validate satellite passes and AI nowcasts.
          </p>
        </div>
      </div>

      {/* Citizen Submission Form & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Citizen Report Form (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Submit Citizen Ground Observation
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Pins Live on Map</span>
          </div>

          <form onSubmit={handleSubmitCitizenReport} className="space-y-3.5 text-xs">
            {/* Category */}
            <div>
              <label className="block text-slate-400 mb-1">Observation Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'storm_seen', label: 'Storm Seen', icon: ShieldAlert },
                  { id: 'extreme_heat', label: 'Extreme Heat', icon: Flame },
                  { id: 'flooding', label: 'Flooding', icon: AlertTriangle },
                  { id: 'damage', label: 'Damage', icon: AlertTriangle }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = category === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setCategory(item.id as any)}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                        isSel
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Reporter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Location / Landmark *</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Chandipur Coast, Puri Beach, Civil Lines Nagpur"
                  required
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Anonymous Citizen"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between mb-1 font-mono">
                <span className="text-slate-400 font-sans">Observed Severity (1 = Minor, 5 = Severe)</span>
                <span className="text-amber-400 font-bold">{intensity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-400 mb-1">Eyewitness Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current wind strength, rain intensity, outdoor thermal feeling, fallen branches..."
                rows={3}
                required
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-slate-400 mb-1">Attach Photo (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                {photoPreview && (
                  <div className="flex items-center gap-2">
                    <img src={photoPreview} alt="Preview" className="w-10 h-10 object-cover rounded border border-slate-700" />
                    <button type="button" onClick={() => setPhotoPreview(null)} className="text-[10px] text-red-400 hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit & Pin on Mission Map</span>
            </button>
          </form>

          {reportSubmitted && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Report verified and broadcast to community live map!</span>
            </div>
          )}
        </div>

        {/* Right: Live Community Feed (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Verified Citizen Observations Feed ({reports.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Ground Truth</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-[10px] text-amber-300 uppercase">
                      {r.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-white">{r.location_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Severity: {r.intensity_rating}/5
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  "{r.description}"
                </p>

                {r.photo_url && (
                  <div className="mt-2">
                    <img src={r.photo_url} alt="Citizen report" className="w-full max-h-40 object-cover rounded-lg border border-slate-800" />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Reported by: <strong className="text-slate-300 font-sans">{r.reporter_name}</strong></span>
                  <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Project & Engineering Mission */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            About Project SkyShield & Technical Team
          </h3>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>SkyShield</strong> was conceived to bridge the gap between complex meteorological physics, satellite telemetry, and actionable community disaster resilience in India. Tropical cyclones in the Bay of Bengal and severe pre-monsoon heatwaves across the subcontinent demand hyper-localized, physics-informed decision support.
          </p>
          <p>
            By coupling real-time Open-Meteo multi-variable weather streams with the Stull (2011) and Liljegren Wet-Bulb Globe Temperature (WBGT) formulations, SkyShield delivers worker-centric safety advisories that traditional "feels like" heat indices fail to capture.
          </p>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Share Feedback or Suggest Meteorological Improvements
          </h3>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                value={fbName}
                onChange={(e) => setFbName(e.target.value)}
                placeholder="Scientist / Student / Citizen"
                required
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={fbEmail}
                onChange={(e) => setFbEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Feedback Category</label>
            <select
              value={fbCategory}
              onChange={(e) => setFbCategory(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans"
            >
              <option value="feature_request">Feature Request / Layer Proposal</option>
              <option value="data_discrepancy">Meteorological Data Discrepancy</option>
              <option value="academic_collaboration">Academic / NGO Collaboration</option>
              <option value="general">General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Message</label>
            <textarea
              value={fbMessage}
              onChange={(e) => setFbMessage(e.target.value)}
              placeholder="Your observations and suggestions..."
              rows={3}
              required
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
          >
            Submit Feedback
          </button>
        </form>

        {fbSubmitted && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Thank you! Your feedback has been sent to the SkyShield research team.</span>
          </div>
        )}
      </div>
    </div>
  );
};
