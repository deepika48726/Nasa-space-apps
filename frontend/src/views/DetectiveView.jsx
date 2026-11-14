import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, MapPin, Gauge } from 'lucide-react';
import { recommendMission } from '../api';

const STEPS = [
  {
    id: 'environment',
    title: '1. Which Earth environment fascinates you most?',
    subtitle: 'Choose the biome or terrain you want to explore with satellite data.',
    options: [
      { id: 'polar', label: '❄️ Polar & Glacial', desc: 'Arctic ice caps, Antarctic glaciers, sub-zero latitudes' },
      { id: 'tropical', label: '🌴 Tropical Rainforests & Coasts', desc: 'Amazon rainforest, monsoon coastlines, dense canopy' },
      { id: 'desert', label: '🏜️ Hyper-Arid Deserts', desc: 'Sahara sand seas, Arabian Gulf metropolises' },
      { id: 'farmland', label: '🌾 Open Grasslands & Plains', desc: 'Great Plains breadbasket, semi-arid Sahel transition' },
      { id: 'mountain', label: '🏔️ High Mountain Ranges', desc: 'Himalayan Third Pole, glacial water towers' },
    ],
  },
  {
    id: 'sphere',
    title: '2. Which sphere of the Earth system are you investigating?',
    subtitle: 'Earth is a dynamic interconnected system of spheres.',
    options: [
      { id: 'atmosphere', label: '💨 Atmosphere (Air & Wind)', desc: 'Surface air temperature, wind speeds, atmospheric circulation' },
      { id: 'hydrosphere', label: '🌧️ Hydrosphere (Precipitation & Moisture)', desc: 'Rainfall, snowfall, water cycle and relative humidity' },
      { id: 'land', label: '🌱 Biosphere / Geosphere (Soil & Sun)', desc: 'Root zone soil moisture, incoming solar irradiance' },
    ],
  },
  {
    id: 'concern',
    title: '3. What climate mystery or challenge matters most to you?',
    subtitle: 'Identify the core scientific question your team wants to test.',
    options: [
      { id: 'warming', label: '🔥 Thermal Warming & Heatwaves', desc: 'Are temperature anomalies accelerating over decades?' },
      { id: 'drought', label: '🌵 Drought Risk & Soil Depletion', desc: 'Is farmland drying out and depleting agricultural root zones?' },
      { id: 'energy', label: '⚡ Clean Renewable Energy Potential', desc: 'How stable are solar irradiance and surface wind resources?' },
      { id: 'rain', label: '⛈️ Shifting Rain & Monsoon Patterns', desc: 'Are annual precipitation totals recovering or collapsing?' },
    ],
  },
];

export default function DetectiveView({ onStartMission }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    environment: 'polar',
    sphere: 'atmosphere',
    concern: 'warming',
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectOption = (optionId) => {
    const stepKey = STEPS[currentStep].id;
    setAnswers((prev) => ({ ...prev, [stepKey]: optionId }));
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finished all 3 questions! Fetch recommendation
      setLoading(true);
      try {
        const rec = await recommendMission(answers.environment, answers.sphere, answers.concern);
        setRecommendation(rec);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (recommendation) {
      setRecommendation(null);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepData = STEPS[currentStep];

  return (
    <div className="max-w-4xl mx-auto my-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 text-center mb-8 relative overflow-hidden">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
          Interactive Diagnostic Flow
        </span>
        <h2 className="text-3xl font-extrabold text-white mt-2 flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-cyan-400" />
          Data Detective: Find Your Earth Mystery
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
          Not sure where to begin? Answer three guided questions about your Earth science interests, and our algorithm will pair you with a compelling target region and parameter.
        </p>

        {/* Progress Dots */}
        {!recommendation && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-8 bg-cyan-400'
                    : idx < currentStep
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Wizard Area */}
      <AnimatePresence mode="wait">
        {!recommendation ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card rounded-2xl p-8 border border-white/10 space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-white">{stepData.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{stepData.subtitle}</p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {stepData.options.map((opt) => {
                const isSelected = answers[stepData.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-slate-100">{opt.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading
                  ? 'Calculating Mission...'
                  : currentStep === STEPS.length - 1
                  ? 'Reveal Recommended Mystery →'
                  : 'Next Question →'}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Recommendation Outcome Card */
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-8 border border-cyan-500/30 space-y-6 relative overflow-hidden"
          >
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl inline-block text-cyan-300 text-xs font-mono">
              🚀 Mission Assignment Generated
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                Mystery Brief: {recommendation.variable.name} in {recommendation.region_key}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on your inquiry profile, your custom investigative target is located in{' '}
                <strong className="text-cyan-400">{recommendation.region_key}</strong> analyzing{' '}
                <strong className="text-cyan-400">{recommendation.variable.name}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Target Region
                </span>
                <div className="text-lg font-bold text-white">{recommendation.region_key}</div>
                <div className="text-xs text-slate-400 font-mono">
                  Coordinates: {recommendation.region.lat?.toFixed(2)}°, {recommendation.region.lon?.toFixed(2)}°
                </div>
                <p className="text-xs text-slate-300 pt-1">{recommendation.region.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Observation Parameter
                </span>
                <div className="text-lg font-bold text-cyan-300">{recommendation.variable.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  Unit: {recommendation.variable.unit}
                </div>
                <p className="text-xs text-slate-300 pt-1">{recommendation.variable.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-wrap gap-4">
              <button
                onClick={handleBack}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Retake Questionnaire
              </button>

              <button
                onClick={() =>
                  onStartMission({
                    variable: recommendation.variable_key,
                    regionKey: recommendation.region_key,
                    lat: recommendation.region.lat,
                    lon: recommendation.region.lon,
                  })
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-xl shadow-cyan-500/25"
              >
                Launch Investigation in Tab 1
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
