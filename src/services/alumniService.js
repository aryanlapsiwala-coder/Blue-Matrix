import { pushCampusNotification } from './notificationService';

export const VERIFIED_ALUMNI_MENTORS = [
  {
    id: 'alm_01',
    name: 'Marcus Ramirez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    currentCompany: 'Google Cloud',
    currentRole: 'Principal Infrastructure Engineer',
    graduationBatch: 'Class of 2021',
    department: 'Computer Science & Engineering',
    expertise: ['Cloud Infrastructure', 'Kubernetes', 'Go / C++', 'Distributed Systems'],
    email: 'marcus.ramirez@google.com',
    referralBonus: '₹1,20,000 internal referral program',
    availableSlots: ['Mon, 6:00 PM - 6:45 PM IST', 'Wed, 7:00 PM - 7:45 PM IST', 'Sat, 11:00 AM - 11:45 AM IST'],
    targetRoles: ['Software Engineer (SDE-1)', 'Cloud Systems Engineer', 'Site Reliability Engineer (SRE)'],
  },
  {
    id: 'alm_02',
    name: 'Priya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150',
    currentCompany: 'Microsoft',
    currentRole: 'Cloud Systems Architect (Azure Core)',
    graduationBatch: 'Class of 2022',
    department: 'Electronics & Communication',
    expertise: ['Azure Microservices', 'High-Scale Concurrency', 'Distributed Databases', 'C# / Java'],
    email: 'priya.sundaram@microsoft.com',
    referralBonus: '₹1,00,000 internal referral program',
    availableSlots: ['Tue, 6:30 PM - 7:15 PM IST', 'Thu, 8:00 PM - 8:45 PM IST', 'Sun, 4:00 PM - 4:45 PM IST'],
    targetRoles: ['Cloud & Distributed Systems Engineer', 'Software Development Engineer', 'Backend Engineer'],
  },
  {
    id: 'alm_03',
    name: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    currentCompany: 'NVIDIA',
    currentRole: 'Senior Robotics Software Engineer',
    graduationBatch: 'Class of 2023',
    department: 'Mechanical & Robotics',
    expertise: ['CUDA / C++', 'ROS2 Humble', 'Autonomous Motion Planning', 'ANSYS / Simulation'],
    email: 'vikram.malhotra@nvidia.com',
    referralBonus: '₹1,50,000 internal referral program',
    availableSlots: ['Mon, 8:00 PM - 8:45 PM IST', 'Fri, 6:00 PM - 6:45 PM IST', 'Sat, 3:00 PM - 3:45 PM IST'],
    targetRoles: ['Robotics Software Engineer', 'CUDA Systems Engineer', 'Autonomous Vehicles Engineer'],
  },
  {
    id: 'alm_04',
    name: 'Sneha Reddy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    currentCompany: 'Texas Instruments',
    currentRole: 'Embedded Systems & FPGA Engineer',
    graduationBatch: 'Class of 2023',
    department: 'Electronics & Communication',
    expertise: ['Verilog / VHDL', 'FPGA Artix-7', 'Embedded C / ARM Cortex', 'Silicon Verification'],
    email: 'sneha.reddy@ti.com',
    referralBonus: '₹80,000 internal referral program',
    availableSlots: ['Wed, 5:30 PM - 6:15 PM IST', 'Fri, 7:00 PM - 7:45 PM IST', 'Sun, 10:30 AM - 11:15 AM IST'],
    targetRoles: ['Embedded Firmware Specialist', 'VLSI Design Engineer', 'FPGA Hardware Engineer'],
  },
  {
    id: 'alm_05',
    name: 'Rahul Saxena',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    currentCompany: 'Zomato / Blinkit',
    currentRole: 'Staff Backend Engineer',
    graduationBatch: 'Class of 2022',
    department: 'Information Technology & AI',
    expertise: ['Kafka Event Streams', 'Redis Caching', 'Golang Microservices', 'High-QPS APIs'],
    email: 'rahul.saxena@zomato.com',
    referralBonus: '₹60,000 internal referral program',
    availableSlots: ['Tue, 7:30 PM - 8:15 PM IST', 'Thu, 6:00 PM - 6:45 PM IST', 'Sat, 5:00 PM - 5:45 PM IST'],
    targetRoles: ['High-Scale Backend Engineer', 'Full-Stack Software Engineer', 'API Architect'],
  },
];

const REFERRAL_KEY = 'knowpass_alumni_referral_requests';
const MOCK_KEY = 'knowpass_mock_interview_requests';

export const alumniService = {
  getMentors: () => VERIFIED_ALUMNI_MENTORS,

  getReferralRequests: (userEmail) => {
    try {
      const saved = localStorage.getItem(REFERRAL_KEY);
      const all = saved ? JSON.parse(saved) : [];
      if (!userEmail) return all;
      return all.filter((r) => r.studentEmail?.toLowerCase() === userEmail.toLowerCase());
    } catch {
      return [];
    }
  },

  submitReferralRequest: ({ student, mentor, targetCompany, targetRole, resumeUrl, notes }) => {
    const newReq = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentName: student.name || 'Student Candidate',
      studentEmail: student.email || '',
      studentDepartment: student.department || 'Computer Science & Engineering',
      studentYear: student.yearOfStudy || '3rd Year (Junior)',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorCompany: mentor.currentCompany,
      mentorRole: mentor.currentRole,
      mentorEmail: mentor.email,
      targetCompany: targetCompany || mentor.currentCompany,
      targetRole: targetRole || mentor.currentRole,
      resumeUrl: resumeUrl || 'https://drive.google.com/knowpass-candidate-resume',
      notes: notes || 'Looking forward to your feedback and prospective internal referral.',
      tokenCost: 50,
      status: 'PENDING_ALUMNI_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(REFERRAL_KEY);
      const all = saved ? JSON.parse(saved) : [];
      localStorage.setItem(REFERRAL_KEY, JSON.stringify([newReq, ...all]));

      pushCampusNotification(student.email, {
        title: 'Fast-Track Referral Token Redeemed! ⚡',
        desc: `Your request was routed to ${mentor.name} (${mentor.currentCompany}). Token deducted: 50 pts.`,
        type: 'points',
        link: '/profile',
      });

      window.dispatchEvent(new CustomEvent('knowpass-referral-created', { detail: newReq }));
    } catch (err) {
      console.warn('Error saving referral request:', err);
    }

    return newReq;
  },

  getMockInterviewRequests: (userEmail) => {
    try {
      const saved = localStorage.getItem(MOCK_KEY);
      const all = saved ? JSON.parse(saved) : [];
      if (!userEmail) return all;
      return all.filter((r) => r.studentEmail?.toLowerCase() === userEmail.toLowerCase());
    } catch {
      return [];
    }
  },

  scheduleMockInterview: ({ student, mentor, targetRole, preferredDate, timeSlot, interviewFocus }) => {
    const newReq = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentName: student.name || 'Student Candidate',
      studentEmail: student.email || '',
      studentDepartment: student.department || 'Computer Science & Engineering',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorCompany: mentor.currentCompany,
      mentorEmail: mentor.email,
      targetRole: targetRole || mentor.currentRole,
      preferredDate: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: timeSlot || mentor.availableSlots[0],
      interviewFocus: interviewFocus || 'Algorithms, System Architecture & Live Problem Solving',
      meetingUrl: `https://meet.google.com/kno-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
      status: 'CONFIRMED_SCHEDULED',
      duration: '45 Minutes',
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(MOCK_KEY);
      const all = saved ? JSON.parse(saved) : [];
      localStorage.setItem(MOCK_KEY, JSON.stringify([newReq, ...all]));

      pushCampusNotification(student.email, {
        title: '1-on-1 Mock Interview Scheduled! 🎯',
        desc: `Confirmed with ${mentor.name} (${mentor.currentCompany}) for ${newReq.preferredDate} at ${newReq.timeSlot}.`,
        type: 'points',
        link: '/profile',
      });

      window.dispatchEvent(new CustomEvent('knowpass-mock-interview-created', { detail: newReq }));
    } catch (err) {
      console.warn('Error scheduling mock interview:', err);
    }

    return newReq;
  },
};
