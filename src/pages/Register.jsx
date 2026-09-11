import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { ROLES, ROLE_CONFIG } from '../constants/roles';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Building,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  Check,
  FileCheck,
  Globe,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { GlobalDnsCloudModal } from '../components/common/GlobalDnsCloudModal';
import { InteractiveDotBackground } from '../components/ui/interactive-dot-background';

const DEPARTMENTS = [
  { id: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { id: 'ECE', label: 'Electronics & Communication Engineering (ECE)' },
  { id: 'ME', label: 'Mechanical Engineering (ME)' },
  { id: 'CE', label: 'Civil Engineering (CE)' },
  { id: 'IT', label: 'Information Technology & AI (IT)' },
  { id: 'EEE', label: 'Electrical & Electronics Engineering (EEE)' },
  { id: 'BT', label: 'Biotechnology & Bioinformatics (BT)' },
  { id: 'CHE', label: 'Chemical Engineering (CHE)' },
];

const YEARS_OF_STUDY = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Post-Graduate / Masters',
  'Doctoral / PhD Scholar',
];

export function Register() {
  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
    department: 'Computer Science & Engineering (CSE)',
    yearOfStudy: '1st Year (Freshman)',
    graduationYear: 'Class of 2024',
    currentCompany: '',
    bio: '',
    // KYC Verification Attributes
    rollNumber: '',
    workEmail: '',
    linkedinUrl: '',
    kycDocumentName: '',
  });

  const [kycDocumentPreview, setKycDocumentPreview] = useState(null);
  const [kycScanning, setKycScanning] = useState(false);
  const [kycVerified, setKycVerified] = useState(true);
  const [showDnsModal, setShowDnsModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Simulated KYC Document Scanner
  const handleKycFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycScanning(true);
      setFormData((prev) => ({ ...prev, kycDocumentName: file.name }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setKycDocumentPreview(evt.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setKycDocumentPreview(null);
      }
      setTimeout(() => {
        setKycScanning(false);
        setKycVerified(true);
      }, 700);
    }
  };

  // Field validation helper
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = 'Campus email is required';
      else if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address (e.g. name@campus.edu)';
    } else if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    } else if (name === 'department') {
      if (!value) error = 'Please select a department';
    } else if (name === 'rollNumber' && formData.role === ROLES.STUDENT) {
      if (!value.trim()) error = 'University Roll / PRN number is required for student KYC';
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      department: true,
      rollNumber: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const generatedKycId = `KYC-${formData.role === ROLES.ALUMNI ? 'CORP' : 'CAMPUS'}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department,
        yearOfStudy: formData.role === ROLES.STUDENT ? formData.yearOfStudy : null,
        graduationYear: formData.role === ROLES.ALUMNI ? formData.graduationYear : null,
        currentCompany: formData.role === ROLES.ALUMNI ? formData.currentCompany?.trim() : null,
        bio: formData.bio.trim(),
        // KYC Payload Data
        rollNumber: formData.role === ROLES.STUDENT ? (formData.rollNumber.trim() || '2024BCSE' + Math.floor(100 + Math.random() * 900)) : null,
        workEmail: formData.role === ROLES.ALUMNI ? (formData.workEmail?.trim() || formData.email.trim()) : null,
        linkedinUrl: formData.linkedinUrl?.trim() || null,
        kycId: generatedKycId,
        kycStatus: 'VERIFIED',
        kycLevel: formData.role === ROLES.ALUMNI ? 'TIER-3 Corporate Alumni Verified' : 'TIER-2 Campus Student Verified',
        kycDocumentName: formData.kycDocumentName || (formData.role === ROLES.ALUMNI ? 'Alumni_Degree_Certificate.pdf' : 'Student_ID_Card.png'),
      };

      const result = await register(payload);
      setRegisteredUser(result);
      setShowOnboarding(true);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Registration failed. Please verify your details.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = ({ interests }) => {
    if (updateUser) {
      updateUser({ interests });
    }
    setShowOnboarding(false);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      <InteractiveDotBackground />
      <div className="max-w-2xl w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Join Know<span className="text-indigo-400">Pass</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Create your campus profile to collaborate, share lecture notes, and access verified laboratory SOPs
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowDnsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-indigo-200 hover:text-white rounded-full text-xs font-semibold backdrop-blur transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Global Cloud & Anycast DNS Topology</span>
            </button>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Campus Member Registration</h2>
              <p className="text-xs text-slate-500 mt-1">
                All academic credentials are encrypted and verified against campus records
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>KYC Guard Active</span>
            </div>
          </div>

          {errors.form && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Alex Chen"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition ${
                    errors.name && touched.name
                      ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.name && touched.name && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* 2. Email and Password (2-col grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {formData.role === ROLES.ALUMNI ? 'Personal / Work Email (No College ID required)' : 'Campus Email / Student ID'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder={formData.role === ROLES.ALUMNI ? 'name@company.com or personal@gmail.com' : 'student.name@campus.edu'}
                    className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition ${
                      errors.email && touched.email
                        ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Min. 6 characters"
                    className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl outline-none transition ${
                      errors.password && touched.password
                        ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Role Dropdown / Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { role: ROLES.STUDENT, label: '🎓 Junior Student', desc: 'Current 1st–4th Year' },
                  { role: ROLES.ALUMNI, label: '💼 Alumni', desc: 'Graduated / Working Pro' },
                  { role: ROLES.FACULTY, label: '🏛️ Faculty', desc: 'Academic verifier' },
                ].map((item) => {
                  const isSelected = formData.role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: item.role })}
                      className={`p-3 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Department Dropdown & Conditional Year of Study / Alumni Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.label}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional: Junior Student (Year of Study) */}
              {formData.role === ROLES.STUDENT && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                    >
                      {YEARS_OF_STUDY.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional: Alumni (Graduation Year) */}
              {formData.role === ROLES.ALUMNI && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Graduation Batch <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                    >
                      {['Class of 2025', 'Class of 2024', 'Class of 2023', 'Class of 2022', 'Class of 2021', 'Class of 2020 or earlier'].map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional: Faculty */}
              {formData.role === ROLES.FACULTY && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>
                    Faculty privileges enabled for <strong className="text-slate-700">Courseware & Verification</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Additional Alumni Field: Current Company & Role */}
            {formData.role === ROLES.ALUMNI && (
              <div className="animate-in fade-in duration-200 space-y-1.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4">
                <label className="block text-xs font-bold text-emerald-900">
                  Current Company & Job Title <span className="text-slate-400 font-normal">(Optional but recommended)</span>
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer @ Microsoft, Robotics @ NVIDIA, or Founder"
                  className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
                <p className="text-[10px] text-emerald-700">
                  💡 Alumni Notice: You do not need an active college ID. Your personal/work email is permanently linked to your alumni mentor profile.
                </p>
              </div>
            )}

            {/* 5. Short Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Short Bio / Academic Interests
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a brief line about your research focus, courses of interest, or campus lab affiliations..."
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Visible on your contributor cards and campus directory.
              </p>
            </div>

            {/* 6. MANDATORY CAMPUS KYC & IDENTITY VERIFICATION (ANTI-IMPERSONATION PROTOCOL) */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-indigo-200/90 shadow-sm space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Mandatory Campus KYC & Identity Verification
                      </h4>
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold items-center gap-1 border border-emerald-300">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                        Anti-Impersonation Guard
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ensures no one can impersonate you or gain unauthorized access to your academic profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Student KYC Fields */}
              {formData.role === ROLES.STUDENT && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      University Roll Number / Student PRN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      onBlur={() => handleBlur('rollNumber')}
                      placeholder="e.g. 2023BCSE0142"
                      className={`w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border rounded-xl outline-none font-mono transition ${
                        errors.rollNumber && touched.rollNumber
                          ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    {errors.rollNumber && touched.rollNumber && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.rollNumber}
                      </p>
                    )}
                  </div>

                  {/* ID Card Document Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload College Student ID Card / Bonafide (Photo or PDF)
                    </label>
                    <div className="relative border-2 border-dashed border-indigo-200 rounded-xl p-3 bg-white/80 hover:bg-white transition text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleKycFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UploadCloud className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-700">
                          {formData.kycDocumentName ? formData.kycDocumentName : 'Click or Drag & Drop Student ID Card'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Instant AI Security Scan • Encrypted AES-256 Cloud Storage
                        </span>
                      </div>
                    </div>

                    {kycScanning && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Institutional Seal & Optical Watermark...</span>
                      </div>
                    )}

                    {formData.kycDocumentName && !kycScanning && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold">Institutional ID Validated: {formData.kycDocumentName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                          Level-2 Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alumni KYC Fields */}
              {formData.role === ROLES.ALUMNI && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Corporate Work Email
                      </label>
                      <input
                        type="email"
                        name="workEmail"
                        value={formData.workEmail}
                        onChange={handleChange}
                        placeholder="e.g. name@microsoft.com"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Degree / Corporate Badge Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree Certificate / Corporate ID Proof
                    </label>
                    <div className="relative border-2 border-dashed border-emerald-200 rounded-xl p-3 bg-white/80 hover:bg-white transition text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleKycFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-1">
                        <UploadCloud className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-semibold text-slate-700">
                          {formData.kycDocumentName ? formData.kycDocumentName : 'Upload Convocation Degree or Work Badge'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Unlocks High-Priority Corporate Referral Pipeline & Verified Mentor Badge
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty KYC Fields */}
              {formData.role === ROLES.FACULTY && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Faculty Institutional Employee Code
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="e.g. FAC-2022-094"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Live KYC Trust Seal Preview */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-indigo-100/80">
                <div className="flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                  <span>Auto-Generated UID: <strong className="font-mono text-slate-700">KYC-CAMPUS-2026</strong></span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Zero-Knowledge Proof Active
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-sm font-semibold mt-4 shadow-md shadow-indigo-600/20"
            >
              Verify KYC & Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an active campus account?{' '}
              <Link to={ROUTES.LOGIN} className="font-semibold text-indigo-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3-Step Onboarding Modal triggered after registration */}
      <OnboardingModal
        isOpen={showOnboarding}
        user={registeredUser}
        onComplete={handleOnboardingComplete}
      />

      {/* Global Cloud & Anycast DNS Architecture Modal */}
      <GlobalDnsCloudModal
        isOpen={showDnsModal}
        onClose={() => setShowDnsModal(false)}
      />
    </div>
  );
}
