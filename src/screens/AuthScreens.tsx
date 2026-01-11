import React, { useEffect, useState } from 'react';
import { NavContextType } from '../../types';
import { supabase } from '../lib/supabase';

export const SplashScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      nav.navigate('login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [nav]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-between bg-background-light dark:bg-background-dark group/design-root overflow-hidden font-display transition-colors duration-300">
      <div className="flex-1"></div>
      <div className="flex flex-col items-center justify-center gap-10 p-6 z-10 w-full max-w-sm">
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-48 h-48 bg-contain bg-center bg-no-repeat drop-shadow-sm" 
               style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCr6VAJLyYoGLDyJug5EC7YtJOx6_QOwU8Mvxbh3yY5-k1d2ypPVOsW501Me9bNwmfBbCdGZEEnM7pHfU-2GEKeBQby2v9UzB108Di_nXXXZ1VafvjLd4hjz5NFKwEsLSj7BlV30EQCSbhIzQrykoH_lHAmPvX_EVMXpl9fC8sAnqx2OEhqSS5Lpyc8r9fb5WEOWq4S7ekW3exB5RA3KZxq1nMWgFwNu72VJEfleOtWmDNRgMou6CX_VX0XSLIh12PeJsnL4UJ-VUk")' }}>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <div className="relative h-12 w-12">
            <div className="absolute h-full w-full rounded-full border-4 border-primary/20 dark:border-primary/10"></div>
            <div className="absolute h-full w-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end pb-8">
        <div className="flex flex-col items-center gap-1 opacity-60">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#181111] dark:text-white uppercase">Catering</p>
          <p className="text-[10px] text-gray-500 font-display">v2.4.0</p>
        </div>
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length < 3) return `(${digits}`;
    if (digits.length === 3) return `(${digits})`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendCode = async () => {
    if (!phone) {
      alert('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Format to E.164: Remove non-digits and ensure +1 prefix
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = `+1${cleanPhone}`;
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        cleanPhone = `+${cleanPhone}`;
      } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 0) {
        cleanPhone = `+${cleanPhone}`;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (error) throw error;

      nav.setData({ ...nav.data, phone: cleanPhone });
      nav.navigate('verify');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col items-center justify-center relative">
      <div className="w-full h-full max-w-md mx-auto bg-white dark:bg-[#1a0c0c] relative flex flex-col shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col px-6 pt-12 pb-4 overflow-y-auto no-scrollbar">
          <div className="w-full flex justify-center mb-8 shrink-0">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-lg shadow-orange-200 dark:shadow-orange-900/20">T</div>
          </div>
          <div className="text-center mb-10 shrink-0">
            <h1 className="text-[#181111] dark:text-white text-[32px] font-extrabold leading-tight mb-3 tracking-tight">Order catering<br/>in seconds</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed">Enter your mobile number to log in or sign up.</p>
          </div>
          <div className="w-full mb-8">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="phone">Phone Number</label>
            <div className="relative flex items-center w-full group">
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                <button className="flex items-center gap-1.5 h-full pr-3 border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none rounded-l-lg transition-colors">
                  <span className="text-lg">🇺🇸</span>
                  <span>+1</span>
                </button>
              </div>
              <input 
                autoFocus 
                className="w-full h-14 pl-[5.5rem] pr-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-medium text-[#181111] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                id="phone" 
                placeholder="(555) 000-0000" 
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-full mb-6">
            <button 
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all rounded-xl text-white text-lg font-bold tracking-wide shadow-lg shadow-orange-200 dark:shadow-orange-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              <span>{isLoading ? 'Sending...' : 'Send Code'}</span>
              {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>
          <div className="mt-auto pt-6 text-center pb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't have an account? <span className="text-primary font-semibold">That's fine, we'll create one.</span></p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => nav.navigate('login_email')} 
                className="text-sm text-primary font-semibold hover:underline"
              >
                Use Email instead
              </button>
              <button 
                onClick={() => nav.navigate('debug')} 
                className="mt-2 text-xs text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors"
              >
                Dev: Connection Tester
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoginEmailScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;

      nav.setData({ ...nav.data, email });
      nav.navigate('verify_email');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col items-center justify-center relative">
      <div className="w-full h-full max-w-md mx-auto bg-white dark:bg-[#1a0c0c] relative flex flex-col shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col px-6 pt-12 pb-4 overflow-y-auto no-scrollbar">
          <div className="w-full flex justify-center mb-8 shrink-0">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-lg shadow-orange-200 dark:shadow-orange-900/20">T</div>
          </div>
          <div className="text-center mb-10 shrink-0">
            <h1 className="text-[#181111] dark:text-white text-[32px] font-extrabold leading-tight mb-3 tracking-tight">Order catering<br/>in seconds</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed">Enter your email address to log in or sign up.</p>
          </div>
          <div className="w-full mb-8">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="email">Email Address</label>
            <div className="relative flex items-center w-full group">
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                <span className="material-symbols-outlined text-slate-400">mail</span>
              </div>
              <input 
                autoFocus 
                className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-medium text-[#181111] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                id="email" 
                placeholder="name@company.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-full mb-6">
            <button 
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all rounded-xl text-white text-lg font-bold tracking-wide shadow-lg shadow-orange-200 dark:shadow-orange-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              <span>{isLoading ? 'Sending...' : 'Send Code'}</span>
              {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>
          <div className="mt-auto pt-6 text-center pb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't have an account? <span className="text-primary font-semibold">That's fine, we'll create one.</span></p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => nav.navigate('login')} 
                className="text-sm text-primary font-semibold hover:underline"
              >
                Use Phone instead
              </button>
              <button 
                onClick={() => nav.navigate('debug')} 
                className="mt-2 text-xs text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors"
              >
                Dev: Connection Tester
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VerificationScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take only the last entered char if multiple (e.g., paste handled separately or fast typing)
    // but here we primarily handle single char input
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move back if current is empty and backspace pressed
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6 && !isNaN(Number(char))) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
    // Focus last filled or next empty
    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const phone = nav.data?.phone;
      if (!phone) throw new Error('Phone number missing');

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      // Check GHL for contact existence
      try {
        const result = await ghlService.searchContact(phone);
        // Assuming result contains a 'contacts' array or similar based on GHL API structure.
        // If contacts found -> existing user
        if (result.contacts && result.contacts.length > 0) {
            nav.navigate('welcome_back');
        } else {
            nav.navigate('new_customer');
        }
      } catch (ghlError) {
        console.error('GHL Check failed', ghlError);
        // Fallback or treat as new user? Or maybe existing if we can't check?
        // Safe bet: New user flow might re-capture info, but let's assume new user if GHL fails to find
        nav.navigate('new_customer');
      }

    } catch (error: any) {
      console.error('Verification failed:', error);
      alert(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display transition-colors duration-200">
       <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1a0c0c] h-full flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-transparent z-10">
            <button onClick={() => nav.goBack()} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-900 dark:text-white">
            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>arrow_back_ios_new</span>
            </button>
        </div>
        <div className="flex-1 flex flex-col items-center px-6 pt-6">
            <div className="w-full text-center mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Code</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">Enter the 6-digit code sent to <span className="font-bold text-slate-900 dark:text-white">{nav.data?.phone || '+1 (555) 123-4567'}</span></p>
            </div>
            <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                    <input 
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      className="w-full aspect-square max-w-[3.5rem] bg-white dark:bg-[#331a1a] border border-slate-200 dark:border-[#4a2b2b] rounded-xl text-center text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary caret-primary transition-all shadow-sm"
                      maxLength={1}
                      type="tel"
                      value={digit}
                      onChange={(e) => handleChange(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onPaste={handlePaste}
                      autoFocus={i === 0}
                    />
                ))}
            </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full mt-8">
                <button 
                  onClick={handleVerify} 
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Verify'
                  )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export const VerificationEmailScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6 && !isNaN(Number(char))) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const email = nav.data?.email;
      if (!email) throw new Error('Email address missing');

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      // Check GHL for contact existence
      try {
        const result = await ghlService.searchContact(email);
        if (result.contacts && result.contacts.length > 0) {
            nav.navigate('welcome_back');
        } else {
            nav.navigate('new_customer');
        }
      } catch (ghlError) {
        console.error('GHL Check failed', ghlError);
        nav.navigate('new_customer');
      }

    } catch (error: any) {
      console.error('Verification failed:', error);
      alert(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display transition-colors duration-200">
       <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1a0c0c] h-full flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-transparent z-10">
            <button onClick={() => nav.goBack()} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-900 dark:text-white">
            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>arrow_back_ios_new</span>
            </button>
        </div>
        <div className="flex-1 flex flex-col items-center px-6 pt-6">
            <div className="w-full text-center mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">Enter the 6-digit code sent to <span className="font-bold text-slate-900 dark:text-white">{nav.data?.email || 'your@email.com'}</span></p>
            </div>
            <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                    <input 
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      className="w-full aspect-square max-w-[3.5rem] bg-white dark:bg-[#331a1a] border border-slate-200 dark:border-[#4a2b2b] rounded-xl text-center text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary caret-primary transition-all shadow-sm" 
                      maxLength={1} 
                      type="tel" 
                      value={digit}
                      onChange={(e) => handleChange(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onPaste={handlePaste}
                      autoFocus={i === 0} 
                    />
                ))}
            </div>
            </div>
            
            <div className="flex flex-col gap-4 w-full mt-8">
                <button 
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Verify'
                  )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export const WelcomeBackScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
      <div className="flex-1 flex flex-col px-6 pt-12 items-center text-center">
        <h1 className="text-3xl font-extrabold text-[#181111] dark:text-white mb-8">Welcome back,<br/><span className="text-primary">Acme Corp!</span></h1>
        
        <div className="w-full bg-gray-50 dark:bg-[#2a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 mb-8 text-left">
           <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Last Order • Dec 10</h3>
           <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyE1C2iCMLSaZoG9Cnr4qx7scj4YiYjmuJgZ1IrW2s5WIUxP_0v6Zf2ju7nZli_ZYkAjxn2zHEq5hrMJddnXRU193ADfWi6o7v1_JY6KChZhOp85QUdn9ie5S5si4dcAYNxLzDGmE3sIvHh_t24jSeN7LAOf0U9iYG4TnLvBXyJscMegBI7MHcIQQOgqz7vuy92EuYlFVV82SEz2Q2vzXAceNWc4TciQCeAQBDuw3eg7k2qeG8YnK_jLjanejgL7uYxvi0xdl8wmg")'}}></div>
              <div>
                 <p className="font-bold text-lg text-[#181111] dark:text-white leading-tight">50 Sandwich Platter + 20 Drinks</p>
                 <p className="text-primary font-bold mt-1">$450.00</p>
              </div>
           </div>
        </div>

        <div className="w-full space-y-3 mt-auto mb-8">
            <button onClick={() => nav.navigate('modify_reorder')} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">replay</span>
                Reorder This Now
            </button>
            <button onClick={() => nav.navigate('home')} className="w-full h-14 bg-white dark:bg-transparent border-2 border-gray-200 dark:border-gray-700 text-[#181111] dark:text-white rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all">
                Browse Full Menu
            </button>
        </div>
      </div>
    </div>
  );
};

export const NewCustomerScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
      <div className="w-full h-64 bg-cover bg-center relative" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY")'}}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0c0c] to-transparent opacity-60"></div>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-6">
         <h1 className="text-2xl font-extrabold text-[#181111] dark:text-white mb-6">How many people are we catering for?</h1>
         
         <div className="flex items-center justify-between bg-gray-50 dark:bg-[#2a1a1a] p-4 rounded-xl mb-6">
            <button className="w-12 h-12 rounded-full bg-white dark:bg-[#3a2a2a] shadow-sm flex items-center justify-center text-primary text-2xl font-bold hover:scale-105 transition-transform">-</button>
            <div className="text-center">
                <span className="text-4xl font-black text-[#181111] dark:text-white">20</span>
                <p className="text-sm text-gray-500">People</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white text-2xl font-bold hover:scale-105 transition-transform">+</button>
         </div>

         <div className="space-y-4">
            <div className="flex gap-3 items-start p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                <div>
                    <p className="font-bold text-sm text-[#181111] dark:text-white">Our Recommendation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For 20 people, we suggest 4 Sandwich Platters and 2 Gallons of Drinks.</p>
                </div>
            </div>
         </div>

         <div className="mt-auto mb-8">
            <button onClick={() => nav.navigate('delivery_setup')} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
                Let's build your order
            </button>
         </div>
      </div>
    </div>
  );
};

export const DeliverySetupScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
       <div className="flex items-center p-4">
            <button onClick={() => nav.goBack()} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#181111] dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1 text-center pr-10">
                <p className="font-bold text-lg">Delivery Details</p>
            </div>
       </div>
       <div className="flex-1 px-6 pt-4 flex flex-col gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Where should we deliver?</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 material-symbols-outlined text-gray-400">location_on</span>
                    <input className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" placeholder="Enter address" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input type="date" className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input type="time" defaultValue="11:30" className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Special Instructions (Optional)</label>
                 <textarea className="w-full h-32 p-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary resize-none" placeholder="Gate code, parking info, etc."></textarea>
            </div>

            <div className="mt-auto mb-8">
                <button onClick={() => nav.navigate('menu')} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
                    Continue to Menu
                </button>
            </div>
       </div>
    </div>
  );
};
