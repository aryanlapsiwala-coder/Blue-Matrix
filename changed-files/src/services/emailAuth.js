const normalizeEmail = (email) => {
  const value = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Enter a valid email address.');
  return value;
};

export function createEmailAuth(client) {
  const requireClient = () => {
    if (!client) throw new Error('Email sign-in is unavailable. Please contact the site administrator.');
  };
  return {
    async requestCode({ email, profile }) {
      requireClient();
      const address = normalizeEmail(email);
      const options = { shouldCreateUser: Boolean(profile) };
      if (profile) {
        if (!profile.name?.trim()) throw new Error('Enter your full name.');
        options.data = {
          name: profile.name.trim(),
          role: ['STUDENT', 'ALUMNI', 'FACULTY'].includes(profile.role) ? profile.role : 'STUDENT',
          department: profile.department,
          year_of_study: profile.yearOfStudy,
          graduation_year: profile.graduationYear,
          current_company: profile.currentCompany,
          bio: profile.bio,
          roll_number: profile.rollNumber,
          work_email: profile.workEmail,
          linkedin_url: profile.linkedinUrl,
          kyc_id: profile.kycId,
          kyc_status: profile.kycStatus,
          kyc_level: profile.kycLevel,
          kyc_document_name: profile.kycDocumentName,
        };
      }
      const { error } = await client.auth.signInWithOtp({ email: address, options });
      if (error) throw error;
      return { email: address, requiresVerification: true };
    },
    async verifyCode({ email, token }) {
      requireClient();
      const code = String(token || '').trim();
      if (!/^\d{6,10}$/.test(code)) throw new Error('Enter the complete verification code from your email.');
      const { data, error } = await client.auth.verifyOtp({ email: normalizeEmail(email), token: code, type: 'email' });
      if (error) throw new Error('That code is invalid or has expired. Try again or request a new code.');
      if (!data?.session?.access_token || !data.session.user?.email_confirmed_at) {
        throw new Error('Email verification did not complete. Please request a new code.');
      }
      return data.session;
    },
  };
}
