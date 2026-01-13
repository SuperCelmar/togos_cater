import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { ghlService } from '../services/ghl';
import { getRecommendation, formatPrice } from '../lib/cateringRecommendations';
import { saveContactSession, getContactId, getSessionId } from '../lib/storage';

/**
 * Extract firstName and lastName from email address
 * Attempts to parse common patterns: john.doe@example.com, jane_smith@example.com, etc.
 */
function extractNameFromEmail(email: string): { firstName: string; lastName: string } {
  if (!email || !email.includes('@')) {
    return { firstName: '', lastName: '' };
  }

  const localPart = email.split('@')[0];
  
  // Try common separators: ., _, -
  const separators = ['.', '_', '-'];
  for (const sep of separators) {
    if (localPart.includes(sep)) {
      const parts = localPart.split(sep);
      if (parts.length >= 2) {
        const firstName = parts[0].trim();
        const lastName = parts.slice(1).join(sep).trim();
        if (firstName && lastName) {
          return { 
            firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
            lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()
          };
        }
      }
    }
  }

  return { 
    firstName: localPart.trim() || '', 
    lastName: '' 
  };
}

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { contactId, contact, isSessionLoading, setContactSession } = useAppContext();

  useEffect(() => {
    const checkExistingSession = async () => {
      // Wait for context to finish loading
      if (isSessionLoading) return;

      // If we have a valid session, go to home
      if (contactId) {
        console.log('[Splash] Valid session found, navigating to home');
        navigate('/home', { replace: true });
        return;
      }

      // Check for stored contact ID and session ID (fallback)
      const storedContactId = getContactId();
      const storedSessionId = getSessionId();
      
      console.log('[Splash] Checking session - contactId:', storedContactId, 'sessionId:', storedSessionId?.slice(0, 8) + '...');

      if (storedContactId && storedSessionId) {
        const { data: { session } } = await supabase.auth.getSession();
        const currentSessionId = session?.user?.id || session?.access_token || null;
        
        if (currentSessionId && currentSessionId === storedSessionId) {
          console.log('[Splash] Valid session found, restoring user session...');
          
          try {
            const profileResponse = await ghlService.getContactProfile(storedContactId);
            const fetchedContact = profileResponse.contact || profileResponse || null;
            
            setContactSession(storedContactId, fetchedContact, storedSessionId);
            navigate('/home', { replace: true });
            return;
          } catch (profileError) {
            console.warn('[Splash] Failed to fetch contact profile:', profileError);
            setContactSession(storedContactId, null, storedSessionId);
            navigate('/home', { replace: true });
            return;
          }
        }
      }

      // No valid session - go to login
      navigate('/login', { replace: true });
    };

    // Delay to show splash briefly, then check session
    const timer = setTimeout(() => {
      checkExistingSession();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate, contactId, isSessionLoading, setContactSession]);

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

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setPhone } = useAppContext();
  const [phone, setPhoneLocal] = useState('');
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
    setPhoneLocal(formatted);
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

      setPhone(cleanPhone);
      navigate('/verify');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col items-center justify-center relative w-full">
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
          <div className="mt-auto pt-6 text-center pb-8 shrink-0 relative z-20">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't have an account? <span className="text-primary font-semibold">That's fine, we'll create one.</span></p>
            <div className="flex flex-col gap-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/login/email');
                }} 
                className="text-sm text-primary font-bold hover:underline py-2 block w-full cursor-pointer relative z-30"
              >
                Use Email instead
              </button>
              <button 
                type="button"
                onClick={() => navigate('/debug')} 
                className="mt-2 text-xs text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors py-1 block w-full"
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

export const LoginEmailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setEmail } = useAppContext();
  const [email, setEmailLocal] = useState('');
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

      setEmail(email);
      navigate('/verify/email');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col items-center justify-center relative w-full">
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
                onChange={(e) => setEmailLocal(e.target.value)}
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
          <div className="mt-auto pt-6 text-center pb-8 shrink-0 relative z-20">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Don't have an account? <span className="text-primary font-semibold">That's fine, we'll create one.</span></p>
            <div className="flex flex-col gap-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/login');
                }} 
                className="text-sm text-primary font-bold hover:underline py-2 block w-full cursor-pointer relative z-30"
              >
                Use Phone instead
              </button>
              <button 
                type="button"
                onClick={() => navigate('/debug')} 
                className="mt-2 text-xs text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors py-1 block w-full"
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

export const VerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { phone, setContactSession, setOrders, setSelectedOrder } = useAppContext();
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
      if (!phone) throw new Error('Phone number missing');

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms',
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = session?.user?.id || session?.access_token || null;

      try {
        const result = await ghlService.searchContact(phone);
        if (result.contacts && result.contacts.length > 0) {
          const searchContact = result.contacts[0];
          const contactId = searchContact.id;
          
          let contact = searchContact;
          try {
            const profileResponse = await ghlService.getContactProfile(contactId);
            contact = profileResponse.contact || profileResponse || searchContact;
          } catch (profileError) {
            console.warn('[Auth] Could not fetch full profile, using search result:', profileError);
          }
          
          setContactSession(contactId, contact, sessionId || undefined);
          
          try {
            const orders = await ghlService.getOrdersByContactId(contactId);
            if (orders && orders.length > 0) {
              setOrders(orders);
              setSelectedOrder(orders[0]);
              navigate('/welcome', { replace: true });
            } else {
              navigate('/new-customer', { replace: true });
            }
          } catch (orderError) {
            console.error('Failed to check orders for contact:', orderError);
            navigate('/new-customer', { replace: true });
          }
        } else {
          if (sessionId) {
            saveContactSession('', sessionId);
          }
          navigate('/new-customer', { replace: true });
        }
      } catch (ghlError) {
        console.error('GHL Check failed', ghlError);
        if (sessionId) {
          saveContactSession('', sessionId);
        }
        navigate('/new-customer', { replace: true });
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
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-900 dark:text-white">
            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>arrow_back_ios_new</span>
            </button>
        </div>
        <div className="flex-1 flex flex-col items-center px-6 pt-6">
            <div className="w-full text-center mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Code</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">Enter the 6-digit code sent to <span className="font-bold text-slate-900 dark:text-white">{phone || '+1 (555) 123-4567'}</span></p>
            </div>
            <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                    <input 
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
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

export const VerificationEmailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { email, setContactSession, setOrders, setSelectedOrder } = useAppContext();
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
      if (!email) throw new Error('Email address missing');

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = session?.user?.id || session?.access_token || null;

      try {
        const result = await ghlService.searchContact(email);
        let contactId: string | null = null;
        let contact: any = null;

        if (result.contacts && result.contacts.length > 0) {
          const searchContact = result.contacts[0];
          contactId = searchContact.id;
          
          try {
            const profileResponse = await ghlService.getContactProfile(contactId);
            contact = profileResponse.contact || profileResponse || searchContact;
          } catch (profileError) {
            console.warn('[Auth] Could not fetch full profile, using search result:', profileError);
            contact = searchContact;
          }
        } else {
          try {
            const nameParts = extractNameFromEmail(email);
            const createResult = await ghlService.createContact({
              firstName: nameParts.firstName,
              lastName: nameParts.lastName,
              email: email,
              phone: '',
            });

            if (createResult.contact && createResult.contact.id) {
              contactId = createResult.contact.id;
              contact = createResult.contact;
            }
          } catch (createError) {
            console.error('Failed to create contact in GHL:', createError);
          }
        }

        if (contactId) {
          setContactSession(contactId, contact, sessionId || undefined);
          
          if (result.contacts && result.contacts.length > 0) {
            try {
              const orders = await ghlService.getOrdersByContactId(contactId);
              if (orders && orders.length > 0) {
                setOrders(orders);
                setSelectedOrder(orders[0]);
                navigate('/welcome', { replace: true });
              } else {
                navigate('/new-customer', { replace: true });
              }
            } catch (orderError) {
              console.error('Failed to check orders for contact:', orderError);
              navigate('/new-customer', { replace: true });
            }
          } else {
            navigate('/new-customer', { replace: true });
          }
        } else {
          if (sessionId) {
            saveContactSession('', sessionId);
          }
          navigate('/new-customer', { replace: true });
        }
      } catch (ghlError) {
        console.error('GHL Check failed', ghlError);
        if (sessionId) {
          saveContactSession('', sessionId);
        }
        navigate('/new-customer', { replace: true });
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
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-900 dark:text-white">
            <span className="material-symbols-outlined" style={{fontSize: '24px'}}>arrow_back_ios_new</span>
            </button>
        </div>
        <div className="flex-1 flex flex-col items-center px-6 pt-6">
            <div className="w-full text-center mb-8 space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">Enter the 6-digit code sent to <span className="font-bold text-slate-900 dark:text-white">{email || 'your@email.com'}</span></p>
            </div>
            <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                    <input 
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
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

export const WelcomeBackScreen: React.FC = () => {
  const navigate = useNavigate();
  const { contact, contactId, orders, selectedOrder, setOrders, setSelectedOrder } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  
  const displayName = contact?.companyName 
    || contact?.name 
    || (contact?.firstName && contact?.lastName ? `${contact.firstName} ${contact.lastName}` : null)
    || contact?.firstName 
    || 'there';

  useEffect(() => {
    async function fetchLastOrder() {
      if (!contactId) {
        setIsLoading(false);
        return;
      }

      // Check if we already have orders to avoid redundant calls
      if (orders.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedOrders = await ghlService.getOrdersByContactId(contactId);
        if (fetchedOrders && fetchedOrders.length > 0) {
          setOrders(fetchedOrders);
          setSelectedOrder(fetchedOrders[0]);
        } else if (fetchedOrders) {
          // If we got an empty array, still set it to mark as "loaded"
          // but we need to be careful about the loop if setOrders([]) triggers re-render
          // Since setOrders is now stable, it should be fine.
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLastOrder();
  }, [contactId, orders.length, setOrders, setSelectedOrder]);

  const lastOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getOrderSummary = () => {
    if (!lastOrder) return 'No previous orders';
    if (lastOrder.items && lastOrder.items.length > 0) {
      return lastOrder.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' + ');
    }
    return 'Catering Order';
  };

  const formatOrderPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
      <div className="flex-1 flex flex-col px-6 pt-12 items-center text-center">
        <h1 className="text-3xl font-extrabold text-[#181111] dark:text-white mb-8">
          Welcome back,<br/><span className="text-primary">{displayName}!</span>
        </h1>
        
        {isLoading ? (
          <div className="w-full bg-gray-50 dark:bg-[#2a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 mb-8 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : lastOrder ? (
          <div className="w-full bg-gray-50 dark:bg-[#2a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 mb-8 text-left">
             <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
               Last Order • {formatOrderDate(lastOrder.createdAt)}
             </h3>
             <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
                </div>
                <div>
                   <p className="font-bold text-lg text-[#181111] dark:text-white leading-tight line-clamp-2">{getOrderSummary()}</p>
                   <p className="text-primary font-bold mt-1">{formatOrderPrice(lastOrder.totalAmount)}</p>
                </div>
             </div>
          </div>
        ) : (
          <div className="w-full bg-gray-50 dark:bg-[#2a1a1a] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 mb-8 text-center">
            <p className="text-gray-500">Ready to place your first order?</p>
          </div>
        )}

        <div className="w-full space-y-3 mt-auto mb-8">
            {lastOrder && (
              <button onClick={() => navigate('/reorder/modify')} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">replay</span>
                  Reorder This Now
              </button>
            )}
            <button onClick={() => navigate('/home')} className={`w-full h-14 rounded-xl font-bold text-lg active:scale-[0.98] transition-all ${
              lastOrder 
                ? 'bg-white dark:bg-transparent border-2 border-gray-200 dark:border-gray-700 text-[#181111] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover'
            }`}>
                {lastOrder ? 'Browse Full Menu' : 'Start Ordering'}
            </button>
        </div>
      </div>
    </div>
  );
};

// Dynamic recommendation box component
const RecommendationBox: React.FC<{ guestCount: number }> = ({ guestCount }) => {
  const recommendation = getRecommendation(guestCount);
  
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
        <span className="material-symbols-outlined text-primary mt-0.5">tips_and_updates</span>
        <div className="flex-1">
          <p className="font-bold text-sm text-[#181111] dark:text-white mb-2">Our Recommendation</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            For {guestCount} people, we suggest:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {recommendation.mainItems.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span className="text-gray-500">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
            {recommendation.drinks.map((item, idx) => (
              <li key={`drink-${idx}`} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span className="text-gray-500">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
            {recommendation.sides.map((item, idx) => (
              <li key={`side-${idx}`} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span className="text-gray-500">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800/30 flex justify-between items-center">
            <span className="text-xs text-gray-500">Estimated total</span>
            <span className="font-bold text-primary">{formatPrice(recommendation.subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewCustomerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setGuestCount } = useAppContext();
  const [guestCountLocal, setGuestCountLocal] = useState(20);
  const [isEditing, setIsEditing] = useState(false);

  const MIN_GUESTS = 10;
  const MAX_GUESTS = 500;
  const STEP = 5;

  const increment = () => setGuestCountLocal(prev => Math.min(prev + STEP, MAX_GUESTS));
  const decrement = () => setGuestCountLocal(prev => Math.max(prev - STEP, MIN_GUESTS));

  const handleDirectInput = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setGuestCountLocal(Math.min(Math.max(num, MIN_GUESTS), MAX_GUESTS));
    }
  };

  const handleProceed = () => {
    setGuestCount(guestCountLocal);
    navigate('/delivery-setup');
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
      <div className="w-full h-64 bg-cover bg-center relative" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY")'}}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0c0c] to-transparent opacity-60"></div>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-6">
         <h1 className="text-2xl font-extrabold text-[#181111] dark:text-white mb-6">How many people are we catering for?</h1>
         
         <div className="flex items-center justify-between bg-gray-50 dark:bg-[#2a1a1a] p-4 rounded-xl mb-6">
            <button 
              onClick={decrement}
              disabled={guestCountLocal <= MIN_GUESTS}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#3a2a2a] shadow-sm flex items-center justify-center text-primary text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            >-</button>
            <div className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={guestCountLocal}
                    onChange={(e) => handleDirectInput(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                    min={MIN_GUESTS}
                    max={MAX_GUESTS}
                    className="w-24 text-4xl font-black text-[#181111] dark:text-white bg-transparent text-center border-b-2 border-primary outline-none"
                  />
                ) : (
                  <span 
                    onClick={() => setIsEditing(true)}
                    className="text-4xl font-black text-[#181111] dark:text-white cursor-pointer hover:text-primary transition-colors"
                  >{guestCountLocal}</span>
                )}
                <p className="text-sm text-gray-500">People</p>
            </div>
            <button 
              onClick={increment}
              disabled={guestCountLocal >= MAX_GUESTS}
              className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            >+</button>
         </div>

         <RecommendationBox guestCount={guestCountLocal} />

         <div className="mt-auto mb-8">
            <button onClick={handleProceed} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all">
                Let's build your order
            </button>
         </div>
      </div>
    </div>
  );
};

export const DeliverySetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { guestCount, contact, contactId, deliveryDetails, cartItems, setDeliveryDetails, populateCartFromRecommendation } = useAppContext();
  
  const getInitialValue = (
    deliveryField: string | undefined, 
    contactField: string | undefined
  ): string => {
    return deliveryField || contactField || '';
  };

  const [address, setAddress] = useState(
    getInitialValue(deliveryDetails?.address, contact?.address1)
  );
  const [city, setCity] = useState(
    getInitialValue(deliveryDetails?.city, contact?.city)
  );
  const [state, setState] = useState(
    getInitialValue(deliveryDetails?.state, contact?.state)
  );
  const [zip, setZip] = useState(
    getInitialValue(deliveryDetails?.zip, contact?.postalCode)
  );
  const [date, setDate] = useState(deliveryDetails?.date || '');
  const [time, setTime] = useState(deliveryDetails?.time || '11:30');
  const [specialInstructions, setSpecialInstructions] = useState(deliveryDetails?.specialInstructions || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userHasEdited, setUserHasEdited] = useState(false);
  
  // Only show auto-fill message if address was auto-filled AND user hasn't started editing
  const wasAutoFilled = !userHasEdited && address !== '' && (address === contact?.address1 || !deliveryDetails?.address);

  const handleContinue = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address');
      return;
    }
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }
    if (!state.trim()) {
      setError('Please enter a state');
      return;
    }
    if (!zip.trim()) {
      setError('Please enter a ZIP code');
      return;
    }
    if (!date) {
      setError('Please select a delivery date');
      return;
    }

    setError('');

    setDeliveryDetails({
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      date,
      time,
      specialInstructions: specialInstructions.trim()
    });

    // Save address to Go High Level
    if (contactId) {
      try {
        await ghlService.updateContactAddress(contactId, {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: zip.trim()
        });
      } catch (err) {
        console.error('[DeliverySetup] Failed to save address to GHL:', err);
        // Non-blocking - continue with flow even if save fails
      }
    }

    // If cart is empty, auto-populate with recommendations
    if (cartItems.length === 0 && guestCount) {
      setIsLoading(true);
      try {
        const { getRecommendationWithItems } = await import('../lib/cateringRecommendations');
        const recommendation = await getRecommendationWithItems(guestCount);
        
        if (recommendation.items.length > 0) {
          populateCartFromRecommendation(recommendation);
          navigate('/cart');
          return;
        }
      } catch (err) {
        console.error('[DeliverySetup] Failed to fetch recommendations:', err);
        // Fall through to menu navigation if recommendations fail
      } finally {
        setIsLoading(false);
      }
    }

    navigate('/menu');
  };
  
  return (
    <div className="relative flex flex-col h-screen w-full bg-white dark:bg-[#1a0c0c] overflow-hidden font-display">
       <div className="flex items-center p-4">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#181111] dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1 text-center">
                <p className="font-bold text-lg">Delivery Details</p>
                <p className="text-xs text-primary font-medium">Catering for {guestCount || 20} people</p>
            </div>
       </div>
       <div className="flex-1 px-6 pt-4 flex flex-col gap-5 overflow-y-auto no-scrollbar">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 material-symbols-outlined text-gray-400">location_on</span>
                    <input 
                      className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" 
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setUserHasEdited(true); }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
                    <input 
                      className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" 
                      placeholder="City"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setUserHasEdited(true); }}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
                        <input 
                          className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" 
                          placeholder="ST"
                          maxLength={2}
                          value={state}
                          onChange={(e) => { setState(e.target.value.toUpperCase()); setUserHasEdited(true); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ZIP</label>
                        <input 
                          className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary" 
                          placeholder="ZIP"
                      value={zip}
                      onChange={(e) => { setZip(e.target.value); setUserHasEdited(true); }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input 
                      type="date" 
                      className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input 
                      type="time" 
                      className="w-full h-14 px-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Special Instructions (Optional)</label>
                 <textarea 
                   className="w-full h-24 p-4 bg-gray-50 dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl text-base text-[#181111] dark:text-white focus:ring-primary focus:border-primary resize-none" 
                   placeholder="Gate code, parking info, etc."
                   value={specialInstructions}
                   onChange={(e) => setSpecialInstructions(e.target.value)}
                 ></textarea>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium -mt-2">{error}</p>
            )}

            {wasAutoFilled && !error && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg -mt-2">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check_circle</span>
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">Address auto-filled from your profile</p>
              </div>
            )}

            <div className="mt-auto mb-8">
                <button 
                  onClick={handleContinue} 
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Building Your Order...</span>
                      </>
                    ) : (
                      <span>{cartItems.length === 0 ? 'Build My Order' : 'Continue to Menu'}</span>
                    )}
                </button>
            </div>
       </div>
    </div>
  );
};
