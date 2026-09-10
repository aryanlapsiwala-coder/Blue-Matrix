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
  Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { OnboardingModal } from '../components/common/OnboardingModal';

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
    bio: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department,
        yearOfStudy: formData.role === ROLES.STUDENT ? formData.yearOfStudy : null,
        bio: formData.bio.trim(),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-2xl w-full">
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
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Campus Member Registration</h2>
            <p className="text-xs text-slate-500 mt-1">
              All academic credentials are encrypted and verified against campus records
            </p>
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
                  Campus Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="alex.chen@campus.edu"
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
                  { role: ROLES.STUDENT, label: 'Student', desc: 'Study notes & queries' },
                  { role: ROLES.FACULTY, label: 'Faculty', desc: 'Publish & verify courseware' },
                  { role: ROLES.TECHNICIAN, label: 'Technician', desc: 'Lab SOPs & troubleshooting' },
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

            {/* 4. Department Dropdown & Conditional Year of Study */}
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

              {/* Conditional Year of Study (Only shown for Students) */}
              {formData.role === ROLES.STUDENT ? (
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
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>
                    Designated as <strong className="text-slate-700">{formData.role}</strong> (Specialist privileges enabled)
                  </span>
                </div>
              )}
            </div>

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

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-sm font-semibold mt-4 shadow-md shadow-indigo-600/20"
            >
              Create Campus Account <ArrowRight className="w-4 h-4 ml-1.5" />
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
    </div>
  );
}
