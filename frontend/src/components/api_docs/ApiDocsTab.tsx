import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileSpreadsheet,
  Globe,
  Sliders,
  Flame
} from 'lucide-react';

export const ApiDocsTab: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'js'>('python');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [widgetCity, setWidgetCity] = useState('Bhubaneswar');

  const codeSnippets: Record<string, Record<string, string>> = {
    storm: {
      python: `import requests\n\n# Query SkyShield AI Storm Prediction\nurl = "http://127.0.0.1:8000/api/predict/storm"\nparams = {\n    "lat": 14.8,\n    "lon": 85.2,\n    "pressure": 974.0,\n    "sst": 30.6\n}\nresponse = requests.get(url, params=params)\ndata = response.json()\nprint(f"Predicted peak wind: {data['peak_forecast_wind_kmh']} km/h")`,
      curl: `curl -X GET "http://127.0.0.1:8000/api/predict/storm?lat=14.8&lon=85.2&pressure=974.0&sst=30.6" -H "accept: application/json"`,
      js: `// Fetch 72-hour Storm Track Forecast\nconst res = await fetch("http://127.0.0.1:8000/api/predict/storm?lat=14.8&lon=85.2");\nconst data = await res.json();\nconsole.log(data.track_forecast);`
    },
    wbgt: {
      python: `import requests\n\n# Query All-India WBGT & Heatwave Readings\nurl = "http://127.0.0.1:8000/api/wbgt/live"\nresp = requests.get(url)\nstations = resp.json()["stations"]\nfor st in stations:\n    wbgt = st["current"]["wbgt"]["wbgt_outdoor_c"]\n    print(f"{st['city_name']}: WBGT {wbgt}°C ({st['current']['wbgt']['risk_level']})")`,
      curl: `curl -X GET "http://127.0.0.1:8000/api/wbgt/live" -H "accept: application/json"`,
      js: `const res = await fetch("http://127.0.0.1:8000/api/wbgt/live");\nconst data = await res.json();\nconsole.log(data.summary);`
    }
  };

  const [activeSnippetKey, setActiveSnippetKey] = useState<'storm' | 'wbgt'>('wbgt');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeSnippetKey][selectedLanguage]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const embedCode = `<iframe \n  src="https://skyshield.in/embed/wbgt?city=${widgetCity.toLowerCase()}&theme=dark" \n  width="340" \n  height="220" \n  frameborder="0" \n  title="SkyShield Live WBGT Widget">\n</iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Developer REST API, Exports & Embeddable Widgets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated OpenAPI v3 endpoints, machine-readable GeoJSON & CSV formats, and iframe widgets.
          </p>
        </div>

        {/* Swagger UI Link */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-all self-start sm:self-center"
        >
          <span>Open Interactive Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* CSV and GeoJSON Download Center */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Direct Dataset Downloads (CSV & GeoJSON)
          </h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Export sanitized station observations and GIS feature collections for emergency response mapping in QGIS, ArcGIS, or Python:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>India WBGT Stations CSV</span>
              </div>
              <p className="text-[11px] text-slate-400">
                18+ stations with 2m Temp, RH, Wind Speed, Wet-Bulb, Globe Temp, and WBGT.
              </p>
            </div>
            <a
              href="http://127.0.0.1:8000/api/export/wbgt/csv"
              download
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download CSV</span>
            </a>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Storm Track GeoJSON</span>
              </div>
              <p className="text-[11px] text-slate-400">
                72h forecast trajectory LineString with waypoint Point attributes and cone radii.
              </p>
            </div>
            <a
              href="http://127.0.0.1:8000/api/export/forecast/geojson"
              download
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download GeoJSON</span>
            </a>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>OpenAPI v3 Schema</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Complete machine-readable JSON specification of all SkyShield REST endpoints.
              </p>
            </div>
            <a
              href="http://127.0.0.1:8000/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View openapi.json</span>
            </a>
          </div>
        </div>
      </div>

      {/* Code Snippets Explorer */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              API Code Generator & Integration Snippets
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Target endpoint switch */}
            <select
              value={activeSnippetKey}
              onChange={(e) => setActiveSnippetKey(e.target.value as any)}
              aria-label="Active endpoint selection"
              className="p-1 rounded bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
            >
              <option value="wbgt">GET /api/wbgt/live</option>
              <option value="storm">GET /api/predict/storm</option>
            </select>

            {/* Language switch */}
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 font-mono text-[11px]">
              {(['python', 'curl', 'js'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded capitalize ${
                    selectedLanguage === lang ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code block */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Example Request &bull; {selectedLanguage.toUpperCase()}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed select-text">
            {codeSnippets[activeSnippetKey][selectedLanguage]}
          </pre>
        </div>
      </div>

      {/* Embeddable WBGT Widget Showcase */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Embeddable WBGT Widget (Copy-Paste for News & Portals)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Custom Iframe</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Live Preview Card */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Live Widget Preview:
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border-2 border-slate-800 shadow-2xl max-w-[340px] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-white text-xs">SkyShield WBGT</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{widgetCity}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Outdoor WBGT</span>
                  <span className="text-3xl font-black text-purple-400 font-mono">32.8°C</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Air Temp</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">42.4°C</span>
                </div>
              </div>
              <div className="p-1.5 rounded bg-purple-950/60 border border-purple-800 text-[10px] text-purple-300 font-semibold text-center">
                EXTREME HAZARD &bull; 15m Work / 45m Rest
              </div>
              <div className="text-[9px] text-slate-500 font-mono text-center">
                Powered by SkyShield India Ops
              </div>
            </div>
          </div>

          {/* Copy Snippet Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-medium">Select Widget City:</label>
              <select
                value={widgetCity}
                onChange={(e) => setWidgetCity(e.target.value)}
                className="p-1 rounded bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
              >
                {['Bhubaneswar', 'New Delhi', 'Mumbai', 'Kolkata', 'Nagpur', 'Chennai'].map((c) => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>

            <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3">
              <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {embedCode}
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="mt-2 w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
