import React, { useState } from 'react';
import { Button } from './Button';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
  FileCheck,
  Cpu,
  Layers,
  HelpCircle,
  Hash,
  Mail
} from 'lucide-react';

const TOPIC_SUGGESTIONS = [
  { id: 'ai_ml', name: 'AI & Machine Learning', icon: Sparkles, color: 'indigo' },
  { id: 'cloud_devops', name: 'Cloud Computing & DevOps', icon: Layers, color: 'blue' },
  { id: 'dsa', name: 'Data Structures & Algorithms', icon: BookOpen, color: 'emerald' },
  { id: 'embedded', name: 'VLSI & Embedded Systems', icon: Cpu, color: 'purple' },
  { id: 'cad_thermo', name: 'CAD, Robotics & Thermodynamics', icon: Compass, color: 'amber' },
  { id: 'civil_struct', name: 'Structural Design & Surveying', icon: Layers, color: 'rose' },
  { id: 'cybersecurity', name: 'Network Security & Cryptography', icon: FileCheck, color: 'teal' },
  { id: 'biotech', name: 'Bioinformatics & Genetics', icon: HelpCircle, color: 'cyan' },
];

export function OnboardingModal({ isOpen, user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);

  if (!isOpen) return null;

  const toggleInterest = (topicId) => {
    setSelectedInterests((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete({ interests: selectedInterests });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header & Progress Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-500/30">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Welcome to KnowPass, {user?.name || 'Scholar'}!
                </h3>
                <p className="text-[11px] text-slate-500">
                  Let's personalize your campus knowledge workspace
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Step {currentStep} of 3
            </span>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* STEP 1: What is KnowPass */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center sm:text-left">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  What is KnowPass?
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  <strong>KnowPass</strong> is your university's unified Knowledge Management System designed to bridge classroom learning, lab operations, and collaborative research.
                </p>

                <div className="p-3.5 mt-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-indigo-950">Welcome Greeting Dispatched</h5>
                    <p className="text-[11px] text-indigo-700">
                      An onboarding confirmation has been sent to <strong>{user?.email}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Peer-Verified Notes</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Access course syllabi, lecture slides, and student-shared exam study guides across all engineering departments.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Laboratory SOPs</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Find hardware troubleshooting protocols, HPC cluster access guides, and equipment operating standards verified by technicians.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Campus AI Assistant</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Ask instant questions directly against the repository of campus documents and get sourced answers in seconds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Role-Based Access</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Tailored dashboards and tools specifically configured for Students, Faculty, Technicians, and Campus Admins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Knowledge Areas to Explore */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  What knowledge areas interest you?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the domains you want to explore or follow for your department feed (select all that apply):
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {TOPIC_SUGGESTIONS.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = selectedInterests.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleInterest(topic.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-indigo-950' : 'text-slate-800'
                            }`}
                          >
                            {topic.name}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-1" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Articles, manuals & discussion
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedInterests.length === 0 && (
                <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Tip: Choose at least one topic to personalize your recommended campus feed.
                </p>
              )}
            </div>
          )}

          {/* STEP 3: How to Contribute */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  How to Contribute to KnowPass
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Knowledge grows when shared. Here is how your contributions help the entire campus:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Click "Contribute" in the Menu</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload your lecture notes, lab guides, past seminar papers, or hardware fixes through the simple submission form.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Faculty & Tech Lead Verification</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Department faculty and senior technicians review and endorse submissions to maintain academic integrity and high quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Earn Campus Recognition</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Approved resources earn you contributor badges on your profile, upvotes, and help future batches excel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                <p className="font-bold">You're all set to begin!</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Click below to finalize setup and explore your campus dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={handleBack} className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button size="sm" onClick={handleNext} className="text-xs px-5">
            {currentStep === 3 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Complete Setup & Enter KnowPass
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
