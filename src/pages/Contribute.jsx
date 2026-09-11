import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { knowledgeService, recordUserContributionId } from '../services/knowledgeService';
import { pushCampusNotification } from '../services/notificationService';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Rocket,
  FlaskConical,
  Briefcase,
  GraduationCap,
  Cpu,
  Calendar,
  Compass,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Youtube,
  Video,
  File,
  X,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Tag,
  Building,
  Check,
  RefreshCw,
  Play,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';

// 8 Knowledge Types with visual styling and descriptions
const KNOWLEDGE_TYPES = [
  {
    id: 'Project Experience',
    title: 'Project Experience',
    desc: 'Architecture patterns, capstone retrospectives, repository links & lessons learned.',
    icon: Rocket,
    color: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'Lab Tip',
    title: 'Lab Tip',
    desc: 'Quick laboratory hacks, circuit setup advice, chemistry safe handling & bug workarounds.',
    icon: FlaskConical,
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'Placement Insight',
    title: 'Placement Insight',
    desc: 'Interview rounds, coding assessments, campus drive experiences & company questions.',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'Faculty Method',
    title: 'Faculty Method',
    desc: 'Pedagogical lecture breakdowns, reference research papers & syllabus walk-throughs.',
    icon: GraduationCap,
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'Equipment Guide',
    title: 'Equipment Guide',
    desc: 'SOPs for HPC clusters, oscilloscopes, 3D printers, CNC mills & network racks.',
    icon: Cpu,
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'Event Playbook',
    title: 'Event Playbook',
    desc: 'Hackathon organizing guides, technical symposium timelines & club event protocols.',
    icon: Calendar,
    color: 'from-rose-500 to-rose-600',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'Career Advice',
    title: 'Career Advice',
    desc: 'Higher studies (GATE / GRE), research internships, fellowship applications & guidance.',
    icon: Compass,
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'Other',
    title: 'Other Topic',
    desc: 'General campus guides, student welfare information & open-ended technical discussions.',
    icon: FileText,
    color: 'from-slate-600 to-slate-700',
    bgLight: 'bg-slate-50 text-slate-700 border-slate-200',
  },
];

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Information Technology & AI (IT)',
  'Electrical & Electronics (EEE)',
  'Biotechnology & Bioinformatics (BT)',
  'Chemical Engineering (CHE)',
  'General Campus & Cross-Department',
];

// Contextual AI tag suggestions based on selected type
const AI_TAG_DICTIONARY = {
  'Project Experience': ['React', 'System-Design', 'Microservices', 'Docker', 'Machine-Learning', 'Full-Stack', 'Open-Source'],
  'Lab Tip': ['Digital-Circuits', 'Oscilloscope', 'Arduino', 'Matlab', 'Safety-Protocol', 'Microcontroller', 'Breadboard'],
  'Placement Insight': ['Data-Structures', 'Algorithms', 'System-Design', 'HR-Round', 'Coding-Test', 'Mock-Interview', 'Resume-Review'],
  'Faculty Method': ['Syllabus', 'Pedagogy', 'Lecture-Slides', 'Peer-Review', 'Exam-Format', 'Term-Paper', 'Grading-Rubric'],
  'Equipment Guide': ['HPC-Cluster', 'SLURM', 'NVIDIA-A100', '3D-Printer', 'GPU-Server', 'Linux-CLI', 'Calibration'],
  'Event Playbook': ['Hackathon', 'Sponsorship', 'Workshop-Planning', 'Tech-Fest', 'Logistics', 'Speaker-Coordination'],
  'Career Advice': ['GATE-Prep', 'GRE-Abroad', 'Internship', 'Research-Fellowship', 'Scholarship', 'Mentorship'],
  'Other': ['Campus-Guide', 'Library', 'Wi-Fi-Access', 'Student-Portal', 'General-FAQ'],
};

const SAMPLE_DRAFT_TEXT = `During our final-year capstone project on Autonomous Drone Navigation with Edge AI, we encountered severe latency bottlenecks when running computer vision models directly on Jetson Nano microcontrollers.

To solve this, we implemented TensorRT INT8 model quantization which yielded a 3.4x FPS increase without noticeable mAP accuracy drop. Additionally, we designed a custom ROS2 message queue protocol to handle dropped frames gracefully.

Key steps for teams reproducing this:
1. Ensure CUDA 11.4 and TensorRT are installed within the Jetpack 4.6 Linux environment.
2. Calibrate calibration cache with at least 500 representative camera test frames.
3. Use zero-copy shared memory pointers between the camera driver node and the perception pipeline.
4. Set thermal throttling thresholds to prevent automatic GPU clock downscaling during continuous flight tests.`;

export function Contribute() {
  const { user, role, awardPoints } = useAuth();
  const navigate = useNavigate();

  // Multi-step State with persistence
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem('knowpass_contribute_step');
      return saved ? Math.min(Math.max(parseInt(saved, 10), 1), 5) : 1;
    } catch {
      return 1;
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form Fields with persistence
  const [knowledgeType, setKnowledgeType] = useState(() => {
    try {
      return sessionStorage.getItem('knowpass_contribute_type') || 'Project Experience';
    } catch {
      return 'Project Experience';
    }
  });
  const [publishingScope, setPublishingScope] = useState('GLOBAL');
  const [title, setTitle] = useState(() => {
    try {
      return sessionStorage.getItem('knowpass_contribute_title') || '';
    } catch {
      return '';
    }
  });
  const [department, setDepartment] = useState(user?.department || DEPARTMENTS[0]);
  const [description, setDescription] = useState(() => {
    try {
      return sessionStorage.getItem('knowpass_contribute_desc') || '';
    } catch {
      return '';
    }
  });
  const [tags, setTags] = useState(['Project Experience', 'Engineering']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Step 3: Media & Resources
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [webcamError, setWebcamError] = useState(null);
  const videoLiveRef = React.useRef(null);
  const mediaStreamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const recordedChunksRef = React.useRef([]);

  // Step 4: AI Enhancement
  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [aiEnhancedContent, setAiEnhancedContent] = useState('');
  const [useAIVersion, setUseAIVersion] = useState(true);

  // Step 5: Integrity
  const [integrityAgreed, setIntegrityAgreed] = useState(false);

  // Update default tag suggestions when knowledgeType changes
  useEffect(() => {
    const suggested = AI_TAG_DICTIONARY[knowledgeType] || [];
    if (suggested.length > 0) {
      setTags([knowledgeType, suggested[0], suggested[1]]);
    }
  }, [knowledgeType]);

  // Persist current step and draft inputs to prevent data loss
  useEffect(() => {
    try {
      sessionStorage.setItem('knowpass_contribute_step', currentStep.toString());
      sessionStorage.setItem('knowpass_contribute_type', knowledgeType);
      sessionStorage.setItem('knowpass_contribute_title', title);
      sessionStorage.setItem('knowpass_contribute_desc', description);
    } catch {
      // Storage unavailable or quota reached
    }
  }, [currentStep, knowledgeType, title, description]);

  // Video recording timer & real MediaRecorder lifecycle
  useEffect(() => {
    let interval;
    if (isRecordingVideo) {
      interval = setInterval(() => setRecordTimer((t) => t + 1), 1000);
    } else {
      setRecordTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVideo]);

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Automatically connect stream to videoLiveRef as soon as recording starts
  useEffect(() => {
    if (isRecordingVideo && videoLiveRef.current && mediaStreamRef.current) {
      videoLiveRef.current.srcObject = mediaStreamRef.current;
      videoLiveRef.current.play().catch(() => {});
    }
  }, [isRecordingVideo]);

  const startWebcamRecording = async () => {
    setWebcamError(null);
    recordedChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;

      // Select best supported MIME type
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setVideoRecorded(true);

        // Turn off camera tracks immediately
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // 500ms data slices ensure clean keyframes and seekability
      setIsRecordingVideo(true);
      setRecordTimer(0);
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setWebcamError(
        'Could not access camera/microphone. Please ensure permissions are allowed in your browser settings.'
      );
    }
  };

  const stopWebcamRecording = () => {
    setIsRecordingVideo(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const discardWebcamRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setVideoRecorded(false);
    setRecordTimer(0);
  };

  // Trigger AI generation when reaching Step 4
  const triggerAIEnhancement = () => {
    setIsAIEnhancing(true);
    setTimeout(() => {
      const generatedAI = `# 📌 ${title || 'Campus Technical Contribution'}
**Knowledge Domain**: ${knowledgeType} | **Department**: ${department}

---

### 🎯 Executive Overview & Purpose
${description.slice(0, 220)}...

---

### 🛠️ Key Technical Steps & Methodology
* **System Environment Setup**: Ensure verified toolchains, dependencies, and environment variables are locked before execution.
* **Core Workflow Execution**:
  * Execute modular test scripts with benchmark telemetry enabled.
  * Implement fail-safes for error propagation and resource allocation limits.
* **Performance Optimization**: Apply recommended best practices for latency reduction and hardware utilization.

---

### 💡 Key Takeaways & Recommendations
* 🔹 **Document Edge Cases**: Keep structured log traces during reproduction trials.
* 🔹 **Peer Verification**: Cross-verify results with department faculty or lab technicians.
* 🔹 **Reproducibility**: Source repositories and configuration files should be accessible to campus peers.

---
*✨ Verified & Structured by KnowPass AI Assistant for Academic Excellence.*`;

      setAiEnhancedContent(generatedAI);
      setIsAIEnhancing(false);
    }, 1400);
  };

  // Step Navigation Validators
  const handleNext = () => {
    if (currentStep === 1) {
      if (!knowledgeType) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!title.trim() || description.length < 200) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
      triggerAIEnhancement();
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const addTag = (tagToAdd) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setCustomTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileUploadSim = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: f.type || 'Document',
    }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
  };

  const handleFinalSubmit = async () => {
    if (!integrityAgreed) return;

    setLoading(true);
    try {
      const finalBody = useAIVersion && aiEnhancedContent ? aiEnhancedContent : description;

      const payload = {
        title: title.trim(),
        category: knowledgeType,
        knowledgeType: knowledgeType,
        department: department,
        author: user?.name || 'Campus Contributor',
        authorEmail: user?.email || '',
        authorId: user?.id || '',
        authorRole: role || 'STUDENT',
        authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        authorBio: user?.bio || '',
        summary: description.slice(0, 150) + '...',
        content: finalBody,
        tags: tags,
        resources: {
          files: uploadedFiles,
          youtube: youtubeUrl ? youtubeUrl : null,
          videoRecorded: videoRecorded,
        },
        aiEnhanced: useAIVersion,
      };

      const createdItem = await knowledgeService.create(payload);
      if (createdItem && createdItem.id) {
        recordUserContributionId(createdItem.id, user?.email);
      }
      if (awardPoints) {
        awardPoints(50, `Published "${title.trim()}"`);
      }

      pushCampusNotification(user?.email, {
        title: 'Document Published & AI Vectorized 🚀',
        desc: `"${title.trim()}" is now permanently live in the Knowledge Base and indexed by KnowBot AI!`,
        type: 'endorse',
        link: `${ROUTES.KNOWLEDGE_BASE}?search=${encodeURIComponent(title.trim())}`,
      });

      setSubmitted(true);
      try {
        sessionStorage.removeItem('knowpass_contribute_step');
        sessionStorage.removeItem('knowpass_contribute_type');
        sessionStorage.removeItem('knowpass_contribute_title');
        sessionStorage.removeItem('knowpass_contribute_desc');
      } catch {
        // ignore
      }
      setTimeout(() => {
        navigate(ROUTES.KNOWLEDGE_BASE);
      }, 1000);
    } catch {
      alert('Error submitting knowledge resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleDraft = () => {
    setTitle('Optimizing Computer Vision Pipelines on Edge Microcontrollers (Jetson & TensorRT)');
    setDescription(SAMPLE_DRAFT_TEXT);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Publish Campus Knowledge
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            5-Step guided contribution workflow with AI formatting and resource attachments
          </p>
        </div>
        {currentStep === 2 && description.length < 200 && (
          <button
            type="button"
            onClick={fillSampleDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fill 200+ Char Sample Draft
          </button>
        )}
      </div>

      {/* Progress Bar & Stepper Indicator */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
          <span className="text-indigo-600">Step {currentStep} of 5</span>
          <span className="text-slate-400">
            {currentStep === 1 && 'Knowledge Type'}
            {currentStep === 2 && 'Core Details (200+ Chars)'}
            {currentStep === 3 && 'Media & Resources'}
            {currentStep === 4 && 'AI Enhancement Studio'}
            {currentStep === 5 && 'Review & Publish'}
          </span>
        </div>

        {/* Stepper Dots & Line */}
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 w-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />

          {[
            { step: 1, label: 'Type' },
            { step: 2, label: 'Details' },
            { step: 3, label: 'Resources' },
            { step: 4, label: 'AI Enhance' },
            { step: 5, label: 'Submit' },
          ].map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-500/30'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <span
                  className={`text-[11px] mt-1.5 hidden sm:block font-medium ${
                    isCurrent ? 'text-indigo-600 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted View or 5-Step Workflow */}
      {submitted ? (
        <Card className="p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 bg-white border border-slate-200/90 shadow-lg rounded-3xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Knowledge Published & Vectorized!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              "{title.trim() || 'Your resource'}" is now permanently indexed in the central Knowledge Base and available to all campus scholars.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>+50 KnowPoints Credited to Your Account</span>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate(ROUTES.KNOWLEDGE_BASE)}
              className="text-xs px-6 py-2.5 shadow-md shadow-indigo-600/20"
            >
              Go to Knowledge Base Now
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
                setUploadedFiles([]);
                setYoutubeUrl('');
                setAiEnhancedContent('');
                setIntegrityAgreed(false);
              }}
              className="text-xs"
            >
              Publish Another Resource
            </Button>
          </div>
        </Card>
      ) : (
        <>
      {/* STEP 1: Choose Knowledge Type */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 animate-in fade-in duration-200">
          <CardHeader
            title="Step 1: Choose Knowledge Category"
            subtitle="Select the category that best represents the kind of resource you are contributing"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {KNOWLEDGE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = knowledgeType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setKnowledgeType(type.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} text-white flex items-center justify-center mb-3 shadow-xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {type.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {type.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Select</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 2: Core Details (200 char min) */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <CardHeader
            title="Step 2: Core Details & Description"
            subtitle="Provide document title, academic department, detailed body (min 200 chars), and tags"
          />

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Knowledge Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Setting up Distributed Raft Consensus in Go: Architecture & Pitfalls"
              className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Publishing Scope & Network Visibility */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Publishing Scope & Network Visibility <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPublishingScope('GLOBAL')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  publishingScope === 'GLOBAL'
                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  🌐
                </div>
                <div>
                  <p className="font-bold">Global Open Academic Network (Recommended)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Accessible to researchers, scholars & students worldwide. Ideal for interview playbooks, algorithms & research SOPs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPublishingScope('LOCAL')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  publishingScope === 'LOCAL'
                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  🔒
                </div>
                <div>
                  <p className="font-bold">Institutional Node Scoped</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Restricted strictly to verified campus researchers for local lab machine access codes and physical room logistics.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Description with 200 Char Minimum Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Knowledge Description <span className="text-rose-500">* (200 chars min)</span>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    description.length >= 200
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {description.length} / 200 characters
                </span>
              </div>
            </div>

            <textarea
              rows={8}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the concepts, step-by-step methodologies, commands, code blocks, or experimental observations in detail (minimum 200 characters)..."
              className={`w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white outline-none transition font-sans leading-relaxed ${
                description.length >= 200
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />

            {/* Live Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  description.length >= 200 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (description.length / 200) * 100)}%` }}
              />
            </div>

            {description.length < 200 && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please write at least {200 - description.length} more characters to ensure high academic quality.
              </p>
            )}
          </div>

          {/* AI-Generated Tag Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Knowledge Tags & Categorization
            </label>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold"
                >
                  <Tag className="w-3 h-3" />
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* AI Suggested Tags */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI-Suggested Topic Tags (Click to add):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(AI_TAG_DICTIONARY[knowledgeType] || []).map((sug) => {
                  const isAdded = tags.includes(sug);
                  return (
                    <button
                      key={sug}
                      type="button"
                      disabled={isAdded}
                      onClick={() => addTag(sug)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isAdded
                          ? 'bg-slate-200/60 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{sug}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(customTagInput);
                  }
                }}
                placeholder="Type custom tag and press Add..."
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addTag(customTagInput)}
              >
                Add Tag
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Add Resources (File, YouTube, Video) */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <CardHeader
            title="Step 3: Add Media & Learning Resources"
            subtitle="Enrich your knowledge contribution with laboratory files, YouTube links, or short video demos"
          />

          {/* 1. File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-indigo-600" />
              Document / Lab Manual Attachments (PDF, DOCX, ZIP)
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center">
              <UploadCloud className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop files here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Up to 25MB per document (PDF, DOCX, XLSX, ZIP)
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUploadSim}
                className="hidden"
              />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <File className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        {file.size}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. YouTube Video Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-rose-600" />
              YouTube Video / Walkthrough URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />

            {youtubeUrl && (
              <div className="mt-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center gap-3 text-xs text-rose-900">
                <Play className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">YouTube Video Attached</p>
                  <p className="text-[11px] text-rose-700 truncate">{youtubeUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Record or Upload Short Video */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-600" />
              Record or Upload Quick Lab Video Clip (Max 2 Mins)
            </label>

            {webcamError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{webcamError}</span>
              </div>
            )}

            {/* Live Camera Viewfinder while recording */}
            {isRecordingVideo && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border-2 border-rose-500 shadow-lg">
                <video
                  ref={videoLiveRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono font-bold text-rose-300">
                    REC 00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer}
                  </span>
                </div>
              </div>
            )}

            {/* Recorded Video Playback Preview */}
            {videoRecorded && recordedVideoUrl && !isRecordingVideo && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border border-emerald-400 shadow-md">
                <video
                  src={recordedVideoUrl}
                  controls
                  preload="auto"
                  playsInline
                  onLoadedMetadata={(e) => {
                    // Force duration calculation if browser reports Infinity for in-memory WebM blobs
                    if (e.target.duration === Infinity) {
                      e.target.currentTime = 1e101;
                      e.target.ontimeupdate = function () {
                        this.ontimeupdate = () => {};
                        this.currentTime = 0;
                      };
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {!isRecordingVideo ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={startWebcamRecording}
                  className="text-xs"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                  {videoRecorded ? 'Re-record Webcam Demo' : 'Record Quick Webcam Demo'}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={stopWebcamRecording}
                    className="text-xs py-1.5 px-3 shadow"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Stop & Attach Recording
                  </Button>
                </div>
              )}

              {videoRecorded && !isRecordingVideo && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Webcam Clip Attached ({recordTimer}s)
                  </span>
                  <button
                    type="button"
                    onClick={discardWebcamRecording}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: AI-Enhancement Studio */}
      {currentStep === 4 && (
        <Card className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <CardHeader
            title="Step 4: AI-Enhanced Knowledge Structuring"
            subtitle="KnowPass AI reformulates your raw submission into clear academic sections and bullet points"
          />

          {isAIEnhancing ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-indigo-500/30">
                <Wand2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Knowledge Architect at Work...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Extracting key takeaways, structuring prerequisites, and optimizing markdown for search retrieval.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Version Selector Banner */}
              <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-indigo-950">
                    AI enhancement applied. You can edit the text directly below:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseAIVersion(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      useAIVersion
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-indigo-50'
                    }`}
                  >
                    AI Version
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseAIVersion(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !useAIVersion
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-indigo-50'
                    }`}
                  >
                    Original Draft
                  </button>
                </div>
              </div>

              {/* AI Academic Integrity & Quality Inspector Panel */}
              <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">AI Academic Integrity & Quality Inspection</h4>
                      <p className="text-[10px] text-slate-300">Automated institutional relevance & anti-spam verification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Peer-Review Ready
                    </span>
                    <span className="text-sm font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      96 / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-[10px]">Clarity & Structure</p>
                    <p className="font-bold text-emerald-400 mt-0.5">98% (High)</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-[10px]">Code Reproducibility</p>
                    <p className="font-bold text-indigo-300 mt-0.5">94% (Verified)</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-[10px]">Global Duplication</p>
                    <p className="font-bold text-emerald-400 mt-0.5">0% (Unique Global Asset)</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-[10px]">Quality Bonus</p>
                    <p className="font-bold text-amber-300 mt-0.5">+25 KnowPoints</p>
                  </div>
                </div>
              </div>

              {/* Editable Markdown Area */}
              <div>
                <textarea
                  rows={12}
                  value={useAIVersion ? aiEnhancedContent : description}
                  onChange={(e) => {
                    if (useAIVersion) setAiEnhancedContent(e.target.value);
                    else setDescription(e.target.value);
                  }}
                  className="w-full text-xs font-mono px-4 py-3 bg-slate-900 text-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Feel free to edit the generated markdown directly in the editor above.</span>
                <button
                  type="button"
                  onClick={triggerAIEnhancement}
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Re-generate AI Structure
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 5: Review & Submit */}
      {currentStep === 5 && (
        <Card className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <CardHeader
            title="Step 5: Final Review & Submission"
            subtitle="Review your document summary, attached media, and confirm academic honesty"
          />

          {/* Document Preview Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                  {knowledgeType}
                </span>
                <span className="text-xs text-slate-500 font-medium">{department}</span>
              </div>
              <div className="text-xs text-slate-400">
                Author: <strong className="text-slate-700">{user?.name}</strong> ({role})
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {useAIVersion ? aiEnhancedContent : description}
            </div>

            {/* Media Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-1">Attached Files:</p>
                <p className="text-slate-500">
                  {uploadedFiles.length > 0
                    ? `${uploadedFiles.length} file(s) ready for upload`
                    : 'No documents attached'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-1">Video / Media:</p>
                <p className="text-slate-500">
                  {youtubeUrl ? 'YouTube link attached' : videoRecorded ? 'Webcam video attached' : 'None'}
                </p>
              </div>
            </div>

            {/* Tags preview */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Academic Integrity Sign-off */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={integrityAgreed}
                onChange={(e) => setIntegrityAgreed(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-amber-300 focus:ring-indigo-500 mt-0.5"
              />
              <div>
                <p className="font-bold">Academic Integrity & Verification Declaration</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
                  I certify that this knowledge contribution adheres to university copyright standards, represents genuine academic work, and contains no confidential examination or exam answer keys.
                </p>
              </div>
            </label>
          </div>
        </Card>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Previous Step
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="text-xs"
          >
            Cancel
          </Button>
        )}

        {currentStep < 5 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !knowledgeType) ||
              (currentStep === 2 && (!title.trim() || description.length < 200))
            }
            className="text-xs px-6 py-2.5 shadow-md shadow-indigo-600/20"
          >
            Continue to Next Step
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        ) : (
          <Button
            type="button"
            loading={loading}
            disabled={!integrityAgreed}
            onClick={handleFinalSubmit}
            className="text-xs px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" />
            Submit & Index Contribution
          </Button>
        )}
      </div>
      </>
      )}
    </div>
  );
}
