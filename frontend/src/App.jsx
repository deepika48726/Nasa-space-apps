import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import InvestigateView from './views/InvestigateView';
import CompareView from './views/CompareView';
import DemosView from './views/DemosView';
import DetectiveView from './views/DetectiveView';
import MethodologyView from './views/MethodologyView';
import { fetchVariables, fetchPresets, fetchDemos } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('investigate');

  // Shared Data State
  const [variables, setVariables] = useState({});
  const [presets, setPresets] = useState({});
  const [demos, setDemos] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Investigation parameters
  const [selectedVar, setSelectedVar] = useState('T2M');
  const [selectedLat, setSelectedLat] = useState(78.22);
  const [selectedLon, setSelectedLon] = useState(15.65);
  const [selectedRegionName, setSelectedRegionName] = useState('Arctic (Svalbard)');
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2024);

  // Initial Fetch of Catalog and Presets
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [vData, pData, dData] = await Promise.all([
          fetchVariables(),
          fetchPresets(),
          fetchDemos(),
        ]);
        setVariables(vData);
        setPresets(pData);
        setDemos(dData);
      } catch (err) {
        console.error('Failed to load initial config:', err);
        toast.error('Could not connect to FastAPI backend on port 8000.');
      } finally {
        setLoadingConfig(false);
      }
    }
    loadCatalog();
  }, []);

  // Launch Demo Handler
  const handleLaunchDemo = (demo) => {
    setSelectedVar(demo.variable);
    setSelectedLat(demo.lat);
    setSelectedLon(demo.lon);
    setSelectedRegionName(demo.region_key);
    setStartYear(demo.start_year);
    setEndYear(demo.end_year);
    setActiveTab('investigate');
    toast.success(`🚀 Loaded Demo: ${demo.title}!`, { icon: '❄️' });
  };

  // Launch Detective Mission Handler
  const handleStartMission = ({ variable, regionKey, lat, lon }) => {
    setSelectedVar(variable);
    setSelectedRegionName(regionKey);
    if (lat !== undefined) setSelectedLat(lat);
    if (lon !== undefined) setSelectedLon(lon);
    setStartYear(1990);
    setEndYear(2024);
    setActiveTab('investigate');
    toast.success(`🔍 Detective Mission Loaded: ${regionKey}!`, { icon: '🛰️' });
  };

  return (
    <div className="min-h-screen space-bg flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast notifications container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d1730',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        }}
      />

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loadingConfig ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-cyan-300">
              Initializing Earth Trend Detective System...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'investigate' && (
              <InvestigateView
                variables={variables}
                presets={presets}
                selectedVar={selectedVar}
                setSelectedVar={setSelectedVar}
                selectedLat={selectedLat}
                setSelectedLat={setSelectedLat}
                selectedLon={selectedLon}
                setSelectedLon={setSelectedLon}
                selectedRegionName={selectedRegionName}
                setSelectedRegionName={setSelectedRegionName}
                startYear={startYear}
                setStartYear={setStartYear}
                endYear={endYear}
                setEndYear={setEndYear}
              />
            )}

            {activeTab === 'compare' && (
              <CompareView variables={variables} presets={presets} />
            )}

            {activeTab === 'demos' && (
              <DemosView demos={demos} onLaunchDemo={handleLaunchDemo} />
            )}

            {activeTab === 'detective' && (
              <DetectiveView onStartMission={handleStartMission} />
            )}

            {activeTab === 'methodology' && <MethodologyView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>NASA Space Apps Challenge</span>
            <span>•</span>
            <span className="text-slate-400">Earth Trend Detective</span>
          </div>
          <div>
            Data: NASA Langley Research Center POWER API (MERRA-2 assimilation)
          </div>
        </div>
      </footer>
    </div>
  );
}
