import React, { useState } from 'react';
import {
  Bell,
  Languages,
  Plus,
  Send,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Mail,
  Smartphone,
  Webhook
} from 'lucide-react';
import { AlertItem } from '../../types';

interface AlertsTabProps {
  initialAlerts: AlertItem[];
}

export const AlertsTab: React.FC<AlertsTabProps> = ({ initialAlerts }) => {
  // Alert Rule Builder State
  const [ruleCity, setRuleCity] = useState('Bhubaneswar');
  const [ruleHazard, setRuleHazard] = useState('storm');
  const [ruleThreshold, setRuleThreshold] = useState(80);
  const [ruleChannel, setRuleChannel] = useState('browser_push');
  const [createdRules, setCreatedRules] = useState<any[]>([
    { id: 1, city: 'Puri', hazard: 'Storm Wind', threshold: '> 85 km/h', channel: 'Browser Push', status: 'Active' },
    { id: 2, city: 'Delhi NCR', hazard: 'Outdoor WBGT', threshold: '> 32.5°C', channel: 'Email Digest', status: 'Active' },
    { id: 3, city: 'Nagpur', hazard: 'IMD Heatwave', threshold: 'Departure > +4.5°C', channel: 'SMS Alert', status: 'Active' }
  ]);

  // Multilingual State
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'kn' | 'ta' | 'te'>('en');
  const [selectedHazardSample, setSelectedHazardSample] = useState<'storm_severe' | 'heatwave_extreme'>('storm_severe');

  // Push notification state
  const [emailSub, setEmailSub] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);

  // Filter state for history
  const [filterHazard, setFilterHazard] = useState<string>('all');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' }
  ];

  const multilingualContent: Record<string, Record<string, { title: string; body: string; action: string }>> = {
    storm_severe: {
      en: {
        title: 'EMERGENCY: Very Severe Cyclonic Storm Warning',
        body: 'Gale winds up to 135 km/h and torrential rainfall expected in coastal districts. Evacuate low-lying mud houses immediately. Fishermen must stay in harbor.',
        action: 'Move to designated pucca cyclone shelters. Keep emergency battery radio active.'
      },
      hi: {
        title: 'आपातकालीन चेतावनी: अत्यंत गंभीर चक्रवाती तूफान',
        body: 'तटीय जिलों में 135 किमी/घंटे तक की आंधी और भारी मूसलाधार बारिश की संभावना। निचले इलाकों के कच्चे मकान तुरंत खाली करें। मछुआरे समुद्र में न जाएं।',
        action: 'नजदीकी पक्के चक्रवात राहत शिविर में जाएं। आवश्यक दवाएं और टॉर्च पास रखें।'
      },
      kn: {
        title: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಚಂಡಮಾರುತ ಎಚ್ಚರಿಕೆ',
        body: 'ಕರಾವಳಿ ಪ್ರದೇಶಗಳಲ್ಲಿ ಗಂಟೆಗೆ 135 ಕಿ.ಮೀ ವೇಗದಲ್ಲಿ ಬಿರುಗಾಳಿ ಮತ್ತು ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಬೇಕು.',
        action: 'ಸರ್ಕಾರಿ ಚಂಡಮಾರುತ ಆಶ್ರಯ ತಾಣಗಳಿಗೆ ತೆರಳಿ. ತುರ್ತು ಸಹಾಯವಾಣಿ 112 ಗೆ ಕರೆ ಮಾಡಿ.'
      },
      ta: {
        title: 'அவசர எச்சரிக்கை: தீவிர புயல் முன்னெச்சரிக்கை',
        body: 'கடலோர மாவட்டங்களில் மணிக்கு 135 கி.மீ வேகத்தில் பலத்த காற்று மற்றும் மிக பலத்த மழை பெய்யக்கூடும். தாழ்வான பகுதி மக்கள் பாதுகாப்பான இடங்களுக்கு செல்லவும்.',
        action: 'புயல் பாதுகாப்பு மையங்களுக்கு உடனடியாக செல்லவும். அவசர உதவி எண் 112-ஐ தொடர்பு கொள்ளவும்.'
      },
      te: {
        title: 'అత్యవసర హెచ్చరిక: తీవ్ర తుఫాను ప్రమాద సూచన',
        body: 'తీరప్రాంత జిల్లాల్లో గంటకు 135 కి.మీ వేగంతో బలమైన ఈదురు గాలులు మరియు భారీ వర్షాలు కురిసే అవకాశం ఉంది. లోతట్టు ప్రాంత ప్రజలు వెంటనే సురక్షిత ప్రాంతాలకు వెళ్లాలి.',
        action: 'తుఫాను పునరావాస కేంద్రాలకు చేరుకోండి. అత్యవసర సహాయం కొరకు 112 కాల్ చేయండి.'
      }
    },
    heatwave_extreme: {
      en: {
        title: 'RED ALERT: Extreme Heatwave & High WBGT',
        body: 'Wet-Bulb Globe Temperature has crossed 32.5°C with air temperatures exceeding 44°C. Severe risk of exertional heat stroke and hyperthermia.',
        action: 'Suspend outdoor manual work between 11:00 AM and 4:30 PM. Drink electrolytes frequently.'
      },
      hi: {
        title: 'रेड अलर्ट: भीषण लू (हीटवेव) और जानलेवा गर्मी',
        body: 'डब्ल्यूबीजीटी तापमान 32.5 डिग्री सेल्सियस पार और अधिकतम तापमान 44 डिग्री से अधिक। हीट स्ट्रोक और डिहाइड्रेशन का गंभीर खतरा।',
        action: 'दोपहर 11:00 से शाम 4:30 बजे तक बाहर मजदूरी व खेलकूद बंद रखें। ओआरएस और नींबू पानी का सेवन करें।'
      },
      kn: {
        title: 'ರೆಡ್ ಅಲರ್ಟ್: ತೀವ್ರ ಬಿಸಿಗಾಳಿ ಎಚ್ಚರಿಕೆ',
        body: 'WBGT ತಾಪಮಾನವು 32.5°C ಮೀರಿದ್ದು, ತೀವ್ರ ಶಾಖಾಘಾತದ (Heat Stroke) ಸಾಧ್ಯತೆ ಇದೆ.',
        action: 'ಬೆಳಿಗ್ಗೆ 11:00 ರಿಂದ ಸಂಜೆ 4:30 ರವರೆಗೆ ಹೊರಗಿನ ಕೆಲಸಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.'
      },
      ta: {
        title: 'சிவப்பு எச்சரிக்கை: கடுமையான வெப்ப அலை முன்னெச்சரிக்கை',
        body: 'WBGT வெப்பநிலை 32.5°C ஐத் தாண்டியுள்ளது. வெயில் கொடுமையால் மயக்கம் மற்றும் வெப்ப பக்கவாதம் ஏற்பட வாய்ப்புள்ளது.',
        action: 'முற்பகல் 11 முதல் மாலை 4:30 மணி வரை வெளியில் செல்வதை தவிர்க்கவும். அதிக அளவில் நீர் அருந்தவும்.'
      },
      te: {
        title: 'రెడ్ అలర్ట్: తీవ్ర వడగాల్పుల తీవ్రత హెచ్చరిక',
        body: 'WBGT ఉష్ణోగ్రత 32.5°C దాటింది. వడదెబ్బ తగిలే తీవ్ర ప్రమాదం ఉంది.',
        action: 'ఉదయం 11:00 నుండి సాయంత్రం 4:30 వరకు బయట పనులను నిలిపివేయండి. నిరంతరం ద్రవాహారం తీసుకోండి.'
      }
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule = {
      id: Date.now(),
      city: ruleCity,
      hazard: ruleHazard === 'storm' ? 'Storm Wind' : ruleHazard === 'heatwave' ? 'IMD Heatwave' : 'WBGT',
      threshold: ruleHazard === 'storm' ? `> ${ruleThreshold} km/h` : `> ${ruleThreshold}°C`,
      channel: ruleChannel === 'browser_push' ? 'Browser Push' : ruleChannel === 'email' ? 'Email' : 'SMS',
      status: 'Active'
    };
    setCreatedRules([newRule, ...createdRules]);
    alert(`Alert rule for ${ruleCity} successfully created.`);
  };

  const handleTestBrowserPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('SkyShield Alert Test', {
            body: `Test notification triggered for ${ruleCity}: Hazard threshold breached!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png'
          });
        } else {
          alert('Browser notifications blocked. Using in-app toast preview: [SkyShield Alert] Threshold breached for ' + ruleCity);
        }
      });
    } else {
      alert('Browser notifications not supported on this device. In-app notifications active.');
    }
  };

  const handleSubscribeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub) return;
    setSubStatus(`Successfully subscribed ${emailSub} to emergency weather alerts.`);
    setEmailSub('');
  };

  const filteredAlerts = initialAlerts.filter((a) =>
    filterHazard === 'all' ? true : a.hazard.toLowerCase() === filterHazard.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Alerts, Triggers & Multi-Lingual Public Broadcasts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated threshold monitors, subscribe to push/email alerts, and read localized warnings in 5 Indian languages.
          </p>
        </div>
      </div>

      {/* Multilingual Broadcast Warning Card */}
      <div className="glass-panel p-5 border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Multi-Language Emergency Public Warnings
            </h3>
          </div>

          {/* Language Switcher Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setSelectedLang(l.code as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLang === l.code
                    ? 'bg-red-600 text-white shadow ring-1 ring-red-400'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{l.native}</span>
                <span className="text-[10px] opacity-70 ml-1">({l.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Selector for Preview */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Hazard Sample:</span>
          <button
            onClick={() => setSelectedHazardSample('storm_severe')}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              selectedHazardSample === 'storm_severe' ? 'bg-red-900/80 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            Cyclone Emergency
          </button>
          <button
            onClick={() => setSelectedHazardSample('heatwave_extreme')}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              selectedHazardSample === 'heatwave_extreme' ? 'bg-orange-900/80 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            Extreme Heatwave
          </button>
        </div>

        {/* Localized Message Display Box */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-red-900/60 space-y-2">
          <h4 className="text-base font-bold text-red-400">
            {multilingualContent[selectedHazardSample][selectedLang].title}
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {multilingualContent[selectedHazardSample][selectedLang].body}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300">
            <strong>Action:</strong>
            <span>{multilingualContent[selectedHazardSample][selectedLang].action}</span>
          </div>
        </div>
      </div>

      {/* Alert Rule Builder & Notification Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rule Builder Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Automated Alert Rule Builder
            </h3>
            <span className="text-xs text-slate-400 font-mono">Custom Thresholds</span>
          </div>

          <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Monitoring City</label>
                <select
                  value={ruleCity}
                  onChange={(e) => setRuleCity(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-sans"
                >
                  {['Bhubaneswar', 'Puri', 'New Delhi', 'Mumbai', 'Kolkata', 'Nagpur', 'Chennai', 'Ahmedabad', 'Bengaluru'].map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hazard Criterion</label>
                <select
                  value={ruleHazard}
                  onChange={(e) => setRuleHazard(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="storm" className="bg-slate-900">Storm Wind Speed (km/h)</option>
                  <option value="wbgt" className="bg-slate-900">Outdoor WBGT (&deg;C)</option>
                  <option value="heatwave" className="bg-slate-900">Air Temperature (&deg;C)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-mono">
                <span className="text-slate-400 font-sans">Trigger Threshold</span>
                <span className="text-cyan-400 font-bold">
                  {ruleHazard === 'storm' ? `${ruleThreshold} km/h` : `${ruleThreshold}°C`}
                </span>
              </div>
              <input
                type="range"
                min={ruleHazard === 'storm' ? 40 : 25}
                max={ruleHazard === 'storm' ? 180 : 48}
                value={ruleThreshold}
                onChange={(e) => setRuleThreshold(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Notification Delivery Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'browser_push', label: 'Browser Push', icon: Bell },
                  { id: 'email', label: 'Email Digest', icon: Mail },
                  { id: 'sms', label: 'SMS / Helpline', icon: Smartphone }
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setRuleChannel(ch.id)}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                        ruleChannel === ch.id
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
              >
                Create Alert Rule
              </button>
              <button
                type="button"
                onClick={handleTestBrowserPush}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
              >
                Test Notification
              </button>
            </div>
          </form>

          {/* Active Rules List */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Trigger Rules ({createdRules.length})
            </span>
            {createdRules.map((r) => (
              <div key={r.id} className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold">{r.city}</span> &bull; <span className="text-amber-400">{r.hazard}</span> ({r.threshold})
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{r.channel}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email & Public Subscription Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Direct Citizen Subscription Form
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Subscribe for real-time storm landfall alerts, heatwave declarations, and high WBGT work-rest advisories.
            </p>

            <form onSubmit={handleSubscribeEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Alert Categories</label>
                <div className="space-y-1 text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-800 text-cyan-500" />
                    <span>Tropical Cyclone Track & Surge Alerts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-800 text-cyan-500" />
                    <span>IMD Severe Heatwave Advisories</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-800 text-cyan-500" />
                    <span>Occupational WBGT Work-Rest Thresholds</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow transition-all"
              >
                Subscribe to Alerts
              </button>
            </form>

            {subStatus && (
              <div className="mt-3 p-2.5 rounded bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{subStatus}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <strong>NDMA Integration:</strong> Alerts strictly follow India National Disaster Management Authority and State Disaster Management Authority guidelines.
          </div>
        </div>
      </div>

      {/* Alert History Log with Hazard Filters */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Official Alert Dispatch History Log
            </h3>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {['all', 'storm', 'heatwave', 'wbgt', 'lightning'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterHazard(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors ${
                  filterHazard === cat
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.2 rounded text-[10px] font-bold text-white font-mono"
                    style={{ backgroundColor: alt.color }}
                  >
                    {alt.severity}
                  </span>
                  <span className="text-xs font-bold text-white">{alt.headline}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Target Sector: <strong className="text-slate-300">{alt.region}</strong> &bull; Hazard: <span className="capitalize text-cyan-300">{alt.hazard}</span>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap self-start sm:self-center">
                {alt.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
