// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Siren, Wallet, Store, UserCheck, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { ONBOARDING_STEPS, OnboardingStep } from './onboardingStepsData';
import { useAuth } from '../../context/AuthContext';
import { getMemberLabel } from '../../lib/terminology';

interface InteractiveOnboardingProps {
  onComplete: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ICON_MAP = {
  Sparkles: <Sparkles className="text-amber-500" size={28} />,
  Siren: <Siren className="text-rose-500" size={28} />,
  Wallet: <Wallet className="text-emerald-500" size={28} />,
  Store: <Store className="text-blue-500" size={28} />,
  UserCheck: <UserCheck className="text-cyan-500" size={28} />
};

export function InteractiveOnboarding({ onComplete, isOpen = true, onClose }: InteractiveOnboardingProps) {
  const { tenant } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const memberLabel = getMemberLabel(tenant?.type);

  if (!isOpen) return null;

  const currentStepRaw: OnboardingStep = ONBOARDING_STEPS[currentStepIndex];
  
  // Replace terminology dynamically
  const processText = (text: string) => text.replace(/Warga/g, memberLabel).replace(/warga/g, memberLabel.toLowerCase());
  
  const currentStep = {
    ...currentStepRaw,
    description: processText(currentStepRaw.description),
    highlights: currentStepRaw.highlights.map(processText)
  };

  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const handleFinish = () => {
    onComplete();
    if (onClose) onClose();
  };

  const handleNext = () => isLastStep ? handleFinish() : setCurrentStepIndex(p => p + 1);
  const handlePrev = () => currentStepIndex > 0 && setCurrentStepIndex(p => p - 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden relative"
      >
        <button
          onClick={handleFinish}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
          title="Lewati panduan"
        >
          <X size={18} />
        </button>

        <div className="p-4 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100/80">
              {currentStep.badge}
            </span>
            <div className="flex gap-1 pr-6">
              {ONBOARDING_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                {ICON_MAP[currentStep.iconName]}
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">{currentStep.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{currentStep.description}</p>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100/80 space-y-2">
                {currentStep.highlights.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Kembali"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100 cursor-pointer active:scale-[0.98]"
            >
              <span>{currentStep.actionLabel}</span>
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
