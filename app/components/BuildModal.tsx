"use client";

import { useState } from "react";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuildModal({ isOpen, onClose }: BuildModalProps) {
  const [buildForm, setBuildForm] = useState({
    carModel: "Lamborghini Huracán Evo",
    packageType: "Full Carbon Aero + ECU Stage 2",
    contactEmail: ""
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0c121e] border border-slate-800 rounded-lg max-w-lg w-full p-8 shadow-2xl z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg cursor-pointer"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Consultation Request Sent</h3>
            <p className="text-xs text-slate-400">
              Our master engineers will contact you shortly to review your bespoke build specification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-wide">START YOUR CUSTOM BUILD</h3>
              <p className="text-xs text-slate-400 mt-1">Configure your supercar precision package.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Vehicle Model
              </label>
              <select
                value={buildForm.carModel}
                onChange={(e) => setBuildForm({ ...buildForm, carModel: e.target.value })}
                className="w-full bg-[#070b12] border border-slate-800 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="Lamborghini Huracán Evo">Lamborghini Huracán Evo / Sterrato</option>
                <option value="Porsche 911 GT3 RS (992)">Porsche 911 GT3 RS (992)</option>
                <option value="McLaren 720S / 765LT">McLaren 720S / 765LT</option>
                <option value="Ferrari F8 Tributo / 296 GTB">Ferrari F8 Tributo / 296 GTB</option>
                <option value="Nissan GT-R Nismo (R35)">Nissan GT-R Nismo (R35)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Engineering Package
              </label>
              <select
                value={buildForm.packageType}
                onChange={(e) => setBuildForm({ ...buildForm, packageType: e.target.value })}
                className="w-full bg-[#070b12] border border-slate-800 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="Full Carbon Aero + ECU Stage 2">Full Carbon Aero Kit + Stage 2 ECU</option>
                <option value="Forged Wheels + Carbon Ceramic Brake">Forged Series R Wheels + Brake Setup</option>
                <option value="Track Telemetry Steering Wheel">Custom Telemetry Interior Suite</option>
                <option value="Complete Bespoke Overhaul">Complete Bespoke Track Overhaul</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Contact Email
              </label>
              <input
                type="email"
                required
                placeholder="client@domain.com"
                value={buildForm.contactEmail}
                onChange={(e) => setBuildForm({ ...buildForm, contactEmail: e.target.value })}
                className="w-full bg-[#070b12] border border-slate-800 rounded px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs py-3.5 rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,229,255,0.35)] cursor-pointer mt-2"
            >
              Submit Specification Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
