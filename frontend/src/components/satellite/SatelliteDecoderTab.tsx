import React, { useState, useEffect, useRef } from 'react';
import {
  Satellite,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  Flame,
  Droplets,
  Thermometer,
  CloudRain,
  Eye,
  Radio,
  FileCode,
  Sliders
} from 'lucide-react';
import { SatellitePacket, PipelineStage, DerivedProduct, SatellitePass } from '../../types';

interface SatelliteDecoderTabProps {
  initialPipeline: { stages: PipelineStage[]; satellite_name: string; downlink_freq_mhz: number; modulation: string; bitrate_mbps: number } | null;
  derivedProducts: DerivedProduct[];
  satellitePasses: SatellitePass[];
}

export const SatelliteDecoderTab: React.FC<SatelliteDecoderTabProps> = ({
  initialPipeline,
  derivedProducts,
  satellitePasses
}) => {
  // Stream state
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<'VIS' | 'TIR1' | 'WV' | 'RGB'>('VIS');
  const [streamSpeedMs, setStreamSpeedMs] = useState(120);

  // Packets console state
  const [packetLog, setPacketLog] = useState<SatellitePacket[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  // Pipeline stats
  const [activeStageIdx, setActiveStageIdx] = useState(2);
  const [totalDecoded, setTotalDecoded] = useState(5120);
  const [totalErrors, setTotalErrors] = useState(18);
  const [currentSnr, setCurrentSnr] = useState(14.8);
  const [currentBer, setCurrentBer] = useState('2.4e-6');

  // Canvas ref for progressive line-by-line reconstruction
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  // File upload inspector state
  const [inspectResult, setInspectResult] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Channel descriptions
  const channelMeta = {
    VIS: { name: 'Visible (0.65 µm)', desc: 'Daytime cloud reflectance & cyclonic spiral eyewall definition', res: '1.0 km' },
    TIR1: { name: 'Thermal Infrared (10.8 µm)', desc: 'Cloud-top brightness temperature & deep convective cores', res: '4.0 km' },
    WV: { name: 'Water Vapour (6.7 µm)', desc: 'Upper tropospheric moisture, jet streams & dry air intrusions', res: '8.0 km' },
    RGB: { name: 'False-Colour Composite', desc: 'Multispectral blend highlighting high ice clouds in cyan and land in ochre', res: '1.0 km' }
  };

  // Draw scanline on canvas
  const drawScanline = (lineIdx: number, channel: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const y = lineIdx % canvas.height;

    // Generate multispectral synthetic pixel line
    const imgData = ctx.createImageData(width, 1);
    for (let x = 0; x < width; x++) {
      // Simulate cyclone vortex pattern
      const dx = x - width / 2;
      const dy = y - canvas.height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const spiral = Math.sin(dist * 0.12 - angle * 3.0);

      let r = 0, g = 0, b = 0;

      if (channel === 'VIS') {
        const val = Math.floor(Math.max(10, Math.min(255, 128 + spiral * 80 + Math.random() * 25)));
        r = val; g = val; b = val;
      } else if (channel === 'TIR1') {
        // Cold cloud tops in vivid red/purple/cyan
        const temp = -30 - spiral * 40;
        if (temp < -60) {
          r = 239; g = 68; b = 68; // Severe convective core
        } else if (temp < -40) {
          r = 245; g = 158; b = 11;
        } else {
          r = 30; g = 58; b = 138;
        }
      } else if (channel === 'WV') {
        const moisture = Math.floor(100 + spiral * 70);
        r = 10; g = moisture; b = moisture + 50;
      } else {
        // RGB false color
        r = spiral > 0.2 ? 220 : 34;
        g = spiral > 0 ? 160 : 70;
        b = spiral < -0.2 ? 200 : 120;
      }

      const offset = x * 4;
      imgData.data[offset] = r;
      imgData.data[offset + 1] = g;
      imgData.data[offset + 2] = b;
      imgData.data[offset + 3] = 255;
    }

    ctx.putImageData(imgData, 0, y);

    // Draw active scanning line indicator
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(0, (y + 1) % canvas.height, width, 1);
  };

  // Streaming packet timer
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const nextLine = (prev + 1) % 256;
        drawScanline(nextLine, selectedChannel);
        return nextLine;
      });

      // Advance active pipeline stage animation
      setActiveStageIdx((prev) => (prev + 1) % 6);

      // Generate simulated packet
      const isCorrupted = Math.random() < 0.015;
      const snr = Number((14.5 + (Math.random() * 1.6 - 0.8)).toFixed(2));
      setCurrentSnr(snr);
      setCurrentBer(`${Math.max(1e-7, (18 - snr) * 8e-7).toExponential(2)}`);

      setTotalDecoded((prev) => prev + 1);
      if (isCorrupted) setTotalErrors((prev) => prev + 1);

      const payloadHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
          .toUpperCase()
      ).join(' ');

      const newPacket: SatellitePacket = {
        sync_marker: '1ACFFC1D',
        frame_counter: 10420 + currentLine,
        timestamp: new Date().toISOString().substring(11, 23) + 'Z',
        apid_hex: selectedChannel === 'VIS' ? '0x0064' : selectedChannel === 'TIR1' ? '0x0068' : '0x006C',
        channel: channelMeta[selectedChannel].name,
        snr_db: snr,
        ber: 2.4e-6,
        rs_corrected_symbols: Math.random() < 0.2 ? 2 : 0,
        status: isCorrupted ? 'CORRUPTED' : 'OK',
        hex_preview: `1ACFFC1D 08 64 ${payloadHex}`,
        scanline_index: currentLine
      };

      setPacketLog((prev) => [...prev.slice(-35), newPacket]);
    }, streamSpeedMs);

    return () => clearInterval(interval);
  }, [isStreaming, selectedChannel, streamSpeedMs, currentLine]);

  // Handle local file inspection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setInspectResult({
        filename: file.name,
        size_kb: Math.round(file.size / 1024),
        format: 'CCSDS 131.0 CADU Raw Downlink',
        sync_marker: '0x1ACFFC1D (Locked)',
        sensor: 'INSAT-3DR Multispectral Imager',
        orbit: 'GEO 74.0°E (ISRO Slot)',
        resolution: '1.0 km VIS / 4.0 km TIR',
        frames_detected: Math.max(1, Math.floor(file.size / 1024)),
        coverage: 'India Sector [5°N–38°N, 65°E–98°E]',
        crc_status: 'VALID (0 errors in 16-bit CRC)'
      });
    }, 700);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setCurrentLine(0);
    setPacketLog([]);
  };

  const stagesList = [
    { id: 1, name: 'Signal Reception', sub: '2210.5 MHz S-Band RHCP', metric: '-84.2 dBm' },
    { id: 2, name: 'Demodulation', sub: 'QPSK (2.62 Msps)', metric: `SNR ${currentSnr} dB` },
    { id: 3, name: 'Frame Sync', sub: '0x1ACFFC1D Locked', metric: '99.8% Sync' },
    { id: 4, name: 'Error Correction', sub: 'Reed-Solomon RS(255,223)', metric: `BER ${currentBer}` },
    { id: 5, name: 'De-framing', sub: 'CCSDS CADU Packets', metric: `${totalDecoded} Frames` },
    { id: 6, name: 'Image Reconstruction', sub: 'Multispectral Scanline', metric: `Line ${currentLine}/256` },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="px-4 py-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-blue-600/40 font-mono font-bold text-[10px] text-blue-300">
            SIMULATED DEMO DATA
          </span>
          <span>
            Realistic CCSDS telemetry packet generator, QPSK demodulator & scanline builder simulating INSAT-3DR 74&deg;E downlink.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-300 hidden md:inline">
          Architecture: Swappable SDR Interface
        </span>
      </div>

      {/* Primary Satellite Specs Banner */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-800 text-cyan-400">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">INSAT-3DR Downlink Receiver</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                CARRIER LOCKED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Orbital Slot: 74.0&deg;E Geostationary &bull; Downlink: 2210.5 MHz (S-Band) &bull; Bitrate: 5.24 Mbps QPSK
            </p>
          </div>
        </div>

        {/* Global Stream Control Bar */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow transition-all ${
              isStreaming ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs"
            title="Reset Scanlines & Log"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">Speed:</span>
            <select
              value={streamSpeedMs}
              onChange={(e) => setStreamSpeedMs(Number(e.target.value))}
              aria-label="Stream speed selection"
              className="bg-transparent text-cyan-300 focus:outline-none text-[11px]"
            >
              <option value={60} className="bg-slate-900">Fast (60ms)</option>
              <option value={120} className="bg-slate-900">Normal (120ms)</option>
              <option value={300} className="bg-slate-900">Slow (300ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6-Stage Interactive Decoding Pipeline Diagram */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              CCSDS Demodulation & Decoding Pipeline Stages
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Error Correction: RS(255,223)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stagesList.map((stage, idx) => {
            const isActive = isStreaming && activeStageIdx === idx;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      STAGE 0{stage.id}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-cyan-400 animate-ping' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-white block mb-0.5">{stage.name}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">{stage.sub}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 font-mono text-[11px] text-cyan-300 font-semibold truncate">
                  {stage.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Reconstruction Workspace: Image Canvas + Channel Selector + Live Hex Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Progressive Scanline Canvas (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Progressive Image Reconstruction
              </h4>
              <span className="text-[10px] text-slate-400">Scanline {currentLine} of 256</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {channelMeta[selectedChannel].res} Res
            </span>
          </div>

          {/* Multispectral Channel Selector Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {(['VIS', 'TIR1', 'WV', 'RGB'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => {
                  setSelectedChannel(ch);
                  clearCanvas();
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  selectedChannel === ch
                    ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-400'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{ch}</span>
                  <span className="text-[10px] font-mono opacity-80">{channelMeta[ch].res}</span>
                </div>
                <span className="text-[9px] block text-slate-300 truncate font-normal">
                  {channelMeta[ch].name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* CRT Screen Frame */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-2xl flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-full aspect-square rounded-lg image-rendering-pixelated"
            />
            <div className="scanline-crt absolute inset-0 rounded-lg pointer-events-none" />

            {/* Scan progress badge */}
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-cyan-300">
              Progress: {Math.round((currentLine / 256) * 100)}% &bull; {selectedChannel}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            <strong>Active Channel:</strong> {channelMeta[selectedChannel].desc}
          </p>
        </div>

        {/* Right: Scrolling Raw CCSDS Packet Hex Console (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Raw Telemetry Stream Console (Hex Bytes & Sync Markers)
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="text-emerald-400">{totalDecoded} OK</span>
              <span className="text-slate-600">|</span>
              <span className="text-red-400">{totalErrors} Corrupted</span>
            </div>
          </div>

          {/* Hex Packet Scroll Terminal */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] h-[370px] overflow-y-auto space-y-2 select-text">
            {packetLog.map((pkt, i) => (
              <div
                key={i}
                className={`p-1.5 rounded transition-colors ${
                  pkt.status === 'CORRUPTED'
                    ? 'bg-red-950/40 border border-red-800 text-red-300'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">[{pkt.timestamp}]</span>
                    <span>FRAME #{pkt.frame_counter}</span>
                    <span className="text-slate-400">APID {pkt.apid_hex}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">SNR {pkt.snr_db}dB</span>
                    <span
                      className={`px-1 py-0.2 rounded font-bold ${
                        pkt.status === 'OK' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-900 text-white'
                      }`}
                    >
                      {pkt.status}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] break-all leading-tight">
                  <span className="text-amber-300 font-bold">1ACFFC1D </span>
                  <span className="text-slate-400">{pkt.hex_preview.replace('1ACFFC1D ', '')}</span>
                </div>
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>Sync Marker: <strong className="text-amber-300">0x1ACFFC1D</strong> (CCSDS CADU)</span>
            <span>Reed-Solomon Parity: 32 bytes</span>
          </div>
        </div>
      </div>

      {/* Derived Geophysical Products Panel */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Derived Geophysical Products (Multi-Spectral Radiometry)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            INSAT-3DR Rapid Scan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {derivedProducts.map((p) => {
            const isCtt = p.id === 'ctt';
            const isSst = p.id === 'sst';
            const isQpe = p.id === 'qpe';
            const Icon = isCtt ? Thermometer : isSst ? Droplets : isQpe ? CloudRain : Flame;

            return (
              <div key={p.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">{p.title}</span>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-2">{p.sensor}</span>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80 mb-2 font-mono text-xs">
                    {p.min_value && <div className="text-cyan-300 font-bold">{p.min_value}</div>}
                    {p.bay_of_bengal_mean && <div className="text-amber-400 font-bold">Bay of Bengal: {p.bay_of_bengal_mean}</div>}
                    {p.max_hourly_rate && <div className="text-red-400 font-bold">Peak: {p.max_hourly_rate}</div>}
                    {p.detected_hotspots_count !== undefined && <div className="text-orange-400 font-bold">{p.detected_hotspots_count} Thermal Hotspots</div>}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.interpretation}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 inline-block">
                    {p.status_badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Satellite Pass Predictor & Raw File Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pass Predictor */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              Orbital Pass Predictor (User Ground Station)
            </h4>
            <span className="text-xs text-slate-400 font-mono">India Horizon</span>
          </div>

          <div className="space-y-2">
            {satellitePasses.map((pass) => (
              <div key={pass.satellite} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{pass.satellite}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{pass.orbit_type} &bull; {pass.scan_type}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-cyan-300 font-bold block">{pass.next_scan_time}</span>
                  <span className="text-[10px] text-emerald-400">{pass.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw Telemetry File Upload & Header Inspector */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Upload & Inspect Raw Satellite Telemetry File
            </h4>
            <span className="text-xs text-slate-400 font-mono">.raw, .cadu, .bin</span>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl p-5 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              id="rawFileInput"
              onChange={handleFileUpload}
              className="hidden"
              accept=".raw,.bin,.dat,.cadu"
            />
            <label htmlFor="rawFileInput" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-cyan-400 mb-2 opacity-80" />
              <span className="text-xs font-semibold text-white">Click to upload raw satellite capture</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Supports CCSDS 131.0 CADU binary formats</span>
            </label>
          </div>

          {/* Inspector Output */}
          {isUploading && (
            <p className="text-xs font-mono text-cyan-400 mt-3 text-center animate-pulse">
              Parsing frame synchronisation markers and CCSDS primary headers...
            </p>
          )}

          {inspectResult && (
            <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-1">
                <span>{inspectResult.filename}</span>
                <span className="text-cyan-400">{inspectResult.size_kb} KB</span>
              </div>
              <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-1 pt-1">
                <div>Sensor: <span className="text-white font-sans">{inspectResult.sensor}</span></div>
                <div>Sync: <span className="text-emerald-400">{inspectResult.sync_marker}</span></div>
                <div>Format: <span className="text-slate-200">{inspectResult.format}</span></div>
                <div>Orbit: <span className="text-slate-200">{inspectResult.orbit}</span></div>
                <div>Coverage: <span className="text-amber-300 font-sans">{inspectResult.coverage}</span></div>
                <div>CRC: <span className="text-emerald-400">{inspectResult.crc_status}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
