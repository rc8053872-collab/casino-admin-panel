import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  Activity,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import {
  initLoginBackground,
  animateSystemConnections,
  animateSystemNode,
  cleanupLoginAnimations,
} from '../animations/loginAnimations';

// Zod Validation Schema
const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .refine((val) => val.trim().length > 0, 'Email or username is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

type SubmitStage = 'idle' | 'authenticating' | 'verifying' | 'granted';

interface ActivityEvent {
  id: string;
  time: string;
  message: string;
  category: string;
}

const INITIAL_EVENTS: ActivityEvent[] = [
  { id: 'ev-1', time: '10:42:18', message: 'Player session verified', category: 'AUTH' },
  { id: 'ev-2', time: '10:42:19', message: 'Game Arena 03 synchronized', category: 'ENGINE' },
  { id: 'ev-3', time: '10:42:21', message: 'Settlement node healthy', category: 'LEDGER' },
  { id: 'ev-4', time: '10:42:23', message: 'Player activity updated', category: 'STREAM' },
];

const STREAM_POOL: Omit<ActivityEvent, 'id' | 'time'>[] = [
  { message: 'Anti-fraud heuristic passed', category: 'SECURITY' },
  { message: 'Table cluster sync verified', category: 'ENGINE' },
  { message: 'IMPS/UPI gateway handshake ok', category: 'PAYMENT' },
  { message: 'Session telemetry snapshot active', category: 'METRICS' },
  { message: 'Multi-table state verified', category: 'STATE' },
  { message: 'Sybil cluster scan completed', category: 'GUARD' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const svgMapRef = useRef<SVGSVGElement | null>(null);
  const centralNodeRef = useRef<SVGGElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  // Live Activity Stream
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);

  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, redirectUrl]);

  // GSAP Background & Mouse Interaction
  useEffect(() => {
    if (!containerRef.current) return;
    const bgInit = initLoginBackground(containerRef.current, { reducedMotion });

    let pointerMoveHandler: ((e: MouseEvent) => void) | undefined;
    if (bgInit?.handlePointerMove && leftPanelRef.current) {
      pointerMoveHandler = bgInit.handlePointerMove;
      const leftEl = leftPanelRef.current;
      leftEl.addEventListener('mousemove', pointerMoveHandler);
    }

    return () => {
      if (pointerMoveHandler && leftPanelRef.current) {
        leftPanelRef.current.removeEventListener('mousemove', pointerMoveHandler);
      }
      if (bgInit?.ctx) {
        cleanupLoginAnimations(bgInit.ctx);
      }
    };
  }, [reducedMotion]);

  // GSAP System Map & Particle Connections
  useEffect(() => {
    if (!svgMapRef.current) return;
    const mapCtx = animateSystemConnections(svgMapRef.current, { reducedMotion });
    const nodeCtx = centralNodeRef.current
      ? animateSystemNode(centralNodeRef.current, { reducedMotion })
      : null;

    return () => {
      if (mapCtx) cleanupLoginAnimations(mapCtx);
      if (nodeCtx) cleanupLoginAnimations(nodeCtx);
    };
  }, [reducedMotion]);

  // Live Activity Stream Interval
  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomItem = STREAM_POOL[Math.floor(Math.random() * STREAM_POOL.length)];

      setEvents((prev) => {
        const next: ActivityEvent = {
          id: `ev-${Date.now()}`,
          time: timeStr,
          message: randomItem.message,
          category: randomItem.category,
        };
        // Keep 4 latest events
        return [...prev.slice(1), next];
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Form Management
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: 'AdminMukesh@gmail.com',
      password: 'Admin@123',
      rememberMe: false,
    },
    mode: 'onTouched',
  });

  // Ensure password field is completely blank on mount, page load, and after logout
  useEffect(() => {
    // 1. Clear React Hook Form internal state
    setValue('password', 'Admin@123', { shouldValidate: false, shouldDirty: false, shouldTouch: false });

    // 2. Clear native DOM value at successive intervals to beat asynchronous browser password manager autofill
    const clearNativeDomPassword = () => {
      setValue('password', 'Admin@123', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      const pwdEl = document.getElementById('password') as HTMLInputElement | null;
      if (pwdEl) {
        pwdEl.value = 'Admin@123';
        pwdEl.setAttribute('value', 'Admin@123');
      }
    };

    clearNativeDomPassword();
    const t1 = setTimeout(clearNativeDomPassword, 50);
    const t2 = setTimeout(clearNativeDomPassword, 150);
    const t3 = setTimeout(clearNativeDomPassword, 350);
    const t4 = setTimeout(clearNativeDomPassword, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [setValue, location.key]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setSubmitStage('authenticating');

    try {
      // Start login request
      const loginPromise = login({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Subtle verifying session stage transition
      const timer = setTimeout(() => {
        setSubmitStage((curr) => (curr === 'authenticating' ? 'verifying' : curr));
      }, 280);

      const response = await loginPromise;
      clearTimeout(timer);

      if (response.success) {
        setSubmitStage('granted');
        toast.success('Access Granted', 'Administrative session initialized successfully.');

        // Quick transition to dashboard matching the 600-1000ms total spec
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 380);
      } else {
        setSubmitStage('idle');
        setErrorMessage(response.message || 'Invalid email or password.');
        setValue('password', '');
        setShakeCount((prev) => prev + 1);
      }
    } catch {
      setSubmitStage('idle');
      setErrorMessage('Unable to connect to authentication gateway. Please retry.');
      setValue('password', '');
      setShakeCount((prev) => prev + 1);
    }
  };

  // Headline Stagger Variants
  const headlineContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.28,
      },
    },
  };

  const headlineWord: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-5 lg:p-8 select-none relative overflow-x-hidden font-sans"
    >
      {/* Background Subtle Technical Grid & Ambient Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
      <div className="bg-tech-line absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent pointer-events-none opacity-[0.06]" />
      <div className="bg-tech-line absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent pointer-events-none opacity-[0.05]" />
      <div className="bg-ambient-node absolute top-12 left-16 w-2 h-2 rounded-full bg-blue-400 opacity-[0.06] pointer-events-none" />
      <div className="bg-ambient-node absolute bottom-16 right-20 w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-[0.06] pointer-events-none" />

      {/* Main Asymmetrical Authentication Workspace */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-6xl xl:max-w-7xl min-h-[680px] lg:min-h-[740px] bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col lg:flex-row relative z-10"
      >
        {/* ========================================================================= */}
        {/* LEFT COLUMN (~56%): GAME OPERATIONS CONTROL CENTER                        */}
        {/* ========================================================================= */}
        <div
          ref={leftPanelRef}
          className="w-full lg:w-[56%] xl:w-[57%] bg-gradient-to-br from-[#060913] via-[#0B1120] to-[#080D1A] text-white p-6 sm:p-8 xl:p-10 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-slate-800/80"
        >
          {/* Mouse-Following Ambient Radial Light */}
          <div className="bg-mouse-glow pointer-events-none absolute w-[420px] h-[420px] -left-20 -top-20 rounded-full bg-blue-500/10 blur-[130px] transition-opacity duration-700" />

          {/* Technical Grid Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.05] pointer-events-none" />

          {/* Technical Watermark Coordinate Badges */}
          <div className="absolute top-4 right-6 hidden sm:flex items-center gap-2 font-mono text-[9px] text-slate-500 tracking-wider">
            <span>SYS.MAP // AP-SOUTH-01</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          </div>

          {/* --- TOP: BRAND & HEADLINE --- */}
          <div className="relative z-10 space-y-5">
            {/* Logo & Operational Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 group cursor-default">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-extrabold tracking-tight text-white leading-none">
                    GAME ADMIN
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase pt-0.5">
                    CONTROL CENTER
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-medium text-sky-400">
                <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                <span>PLATFORM OPERATIONS</span>
              </div>
            </motion.div>

            {/* Headline with Staggered Word Reveal */}
            <motion.div
              variants={headlineContainer}
              initial={reducedMotion ? 'visible' : 'hidden'}
              animate="visible"
              className="pt-1 space-y-0.5"
            >
              <motion.div
                variants={headlineWord}
                className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight uppercase font-mono"
              >
                CONTROL
              </motion.div>
              <motion.div
                variants={headlineWord}
                className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight uppercase font-mono"
              >
                EVERYTHING
              </motion.div>
              <motion.div
                variants={headlineWord}
                className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-slate-100 leading-tight uppercase font-mono"
              >
                FROM ONE PLACE.
              </motion.div>
            </motion.div>
          </div>

          {/* --- CENTER: ANIMATED SYSTEM MAP & TOPOLOGY --- */}
          <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[500px] aspect-[540/320] relative">
              <svg
                ref={svgMapRef}
                viewBox="0 0 540 320"
                className="w-full h-full overflow-visible select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Gradients for Nodes & Links */}
                  <linearGradient id="centralNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="nodeBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1E293B" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* SVG Connection Paths */}
                {/* 1. PLAYERS <-> GAME PLATFORM */}
                <path
                  className="system-link-path"
                  d="M 270 65 L 270 120"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 2. WALLETS <-> GAME PLATFORM */}
                <path
                  className="system-link-path"
                  d="M 125 150 L 195 150"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 3. GAME PLATFORM <-> GAMES */}
                <path
                  className="system-link-path"
                  d="M 345 150 L 415 150"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 4. GAME PLATFORM <-> PAYMENTS */}
                <path
                  className="system-link-path"
                  d="M 270 180 L 270 230"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 5. PAYMENTS <-> ANALYTICS */}
                <path
                  className="system-link-path"
                  d="M 225 245 L 140 280"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 6. PAYMENTS <-> SECURITY */}
                <path
                  className="system-link-path"
                  d="M 315 245 L 400 280"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Staggered Traveling Particles (GSAP animates cx, cy) */}
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#38BDF8"
                  data-sx="270"
                  data-sy="65"
                  data-ex="270"
                  data-ey="120"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#60A5FA"
                  data-sx="125"
                  data-sy="150"
                  data-ex="195"
                  data-ey="150"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#38BDF8"
                  data-sx="345"
                  data-sy="150"
                  data-ex="415"
                  data-ey="150"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#34D399"
                  data-sx="270"
                  data-sy="180"
                  data-ex="270"
                  data-ey="230"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#38BDF8"
                  data-sx="225"
                  data-sy="245"
                  data-ex="140"
                  data-ey="280"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#34D399"
                  data-sx="315"
                  data-sy="245"
                  data-ex="400"
                  data-ey="280"
                />
                <circle
                  className="system-particle"
                  r="2.5"
                  fill="#60A5FA"
                  data-sx="270"
                  data-sy="120"
                  data-ex="270"
                  data-ey="65"
                />

                {/* --- CENTRAL NODE: GAME PLATFORM --- */}
                <g ref={centralNodeRef} className="system-central-node cursor-default">
                  {/* Radar Pulse Ring */}
                  <circle
                    className="node-pulse-ring"
                    cx="270"
                    cy="150"
                    r="46"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  {/* Central Node Body */}
                  <rect
                    x="195"
                    y="120"
                    width="150"
                    height="60"
                    rx="10"
                    fill="url(#centralNodeGrad)"
                    stroke="url(#nodeBorderGrad)"
                    strokeWidth="1.5"
                  />
                  {/* Pulsing Green Status Dot */}
                  <circle cx="215" cy="138" r="3.5" fill="#10B981" />
                  <text
                    x="225"
                    y="141"
                    fill="#34D399"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="0.5"
                  >
                    SYSTEM ONLINE
                  </text>
                  <text
                    x="215"
                    y="157"
                    fill="#FFFFFF"
                    fontSize="11.5"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="bold"
                    letterSpacing="0.5"
                  >
                    GAME PLATFORM
                  </text>
                  <text
                    x="215"
                    y="169"
                    fill="#94A3B8"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    Real-time operational network
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 1: PLAYERS (TOP) --- */}
                <g transform="translate(215, 30)">
                  <rect
                    width="110"
                    height="35"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="16" cy="17.5" r="3" fill="#38BDF8" />
                  <text
                    x="26"
                    y="16"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    PLAYERS
                  </text>
                  <text x="26" y="26" fill="#64748B" fontSize="8" fontFamily="monospace">
                    Active sessions
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 2: WALLETS (LEFT) --- */}
                <g transform="translate(25, 132)">
                  <rect
                    width="100"
                    height="36"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="15" cy="18" r="3" fill="#34D399" />
                  <text
                    x="25"
                    y="17"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    WALLETS
                  </text>
                  <text x="25" y="27" fill="#64748B" fontSize="8" fontFamily="monospace">
                    Ledger pool
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 3: GAMES (RIGHT) --- */}
                <g transform="translate(415, 132)">
                  <rect
                    width="100"
                    height="36"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="15" cy="18" r="3" fill="#60A5FA" />
                  <text
                    x="25"
                    y="17"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    GAMES
                  </text>
                  <text x="25" y="27" fill="#64748B" fontSize="8" fontFamily="monospace">
                    Live arenas
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 4: PAYMENTS (BOTTOM) --- */}
                <g transform="translate(215, 227)">
                  <rect
                    width="110"
                    height="36"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="16" cy="18" r="3" fill="#10B981" />
                  <text
                    x="26"
                    y="17"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    PAYMENTS
                  </text>
                  <text x="26" y="27" fill="#64748B" fontSize="8" fontFamily="monospace">
                    Gateways
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 5: ANALYTICS (BOTTOM LEFT) --- */}
                <g transform="translate(50, 268)">
                  <rect
                    width="100"
                    height="34"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="15" cy="17" r="3" fill="#38BDF8" />
                  <text
                    x="24"
                    y="16"
                    fill="#CBD5E1"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    ANALYTICS
                  </text>
                  <text x="24" y="26" fill="#64748B" fontSize="7.5" fontFamily="monospace">
                    Real-time
                  </text>
                </g>

                {/* --- PERIPHERAL NODE 6: SECURITY (BOTTOM RIGHT) --- */}
                <g transform="translate(390, 268)">
                  <rect
                    width="100"
                    height="34"
                    rx="8"
                    fill="#0F172A"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <circle cx="15" cy="17" r="3" fill="#34D399" />
                  <text
                    x="24"
                    y="16"
                    fill="#CBD5E1"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                  >
                    SECURITY
                  </text>
                  <text x="24" y="26" fill="#64748B" fontSize="7.5" fontFamily="monospace">
                    Anti-collusion
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* --- LIVE METRIC CARDS (3 Floating Operational Cards) --- */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-2">
            {/* Card 1: ACTIVE PLAYERS */}
            <motion.div
              animate={reducedMotion ? {} : { y: [0, -4, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ y: -2 }}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>ACTIVE PLAYERS</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[9.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                <AnimatedNumber value={2421} duration={0.9} />
              </div>
            </motion.div>

            {/* Card 2: LIVE GAMES */}
            <motion.div
              animate={reducedMotion ? {} : { y: [0, -4, 0] }}
              transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
              whileHover={{ y: -2 }}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>LIVE GAMES</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[9.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  OPERATIONAL
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                <AnimatedNumber value={24} duration={0.8} />
              </div>
            </motion.div>

            {/* Card 3: SETTLEMENT */}
            <motion.div
              animate={reducedMotion ? {} : { y: [0, -4, 0] }}
              transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
              whileHover={{ y: -2 }}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xs hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>SETTLEMENT</span>
                <span className="flex items-center gap-1 text-sky-400 font-semibold text-[9.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  HEALTHY
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                <AnimatedNumber value={99.8} decimals={1} suffix="%" duration={0.9} />
              </div>
            </motion.div>
          </div>

          {/* --- BOTTOM: LIVE DATA SIGNAL (ACTIVITY STREAM) --- */}
          <div className="relative z-10 pt-4 mt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Activity className="w-3 h-3 text-sky-400" />
                <span>ACTIVITY STREAM</span>
              </span>
              <span className="text-emerald-400">● 100% SLA</span>
            </div>

            <div className="space-y-1 overflow-hidden min-h-[70px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {events.slice(-3).map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between text-[11px] py-0.5 font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sky-400/80 text-[10px]">{item.time}</span>
                      <span className="text-slate-300 truncate">{item.message}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 bg-slate-850 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (~44%): ELEVATED AUTHENTICATION PANEL                        */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[44%] xl:w-[43%] bg-white p-6 sm:p-9 xl:p-11 flex flex-col justify-between relative">
          <motion.div
            animate={shakeCount > 0 ? { x: [0, -4, 4, -3, 3, 0] } : {}}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="max-w-md mx-auto w-full my-auto space-y-6"
          >
            {/* Authentication Header & Service Online Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shadow-blue-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 tracking-tight">GAME ADMIN</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AUTH ONLINE</span>
                </div>
              </div>

              {/* Status Header */}
              <div className="pt-2">
                <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  SECURE ADMIN ACCESS
                </div>
                <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-950 mt-1">
                  Welcome back.
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sign in to access the platform operations console.
                </p>
              </div>
            </div>

            {/* Error Notification with card shake */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  key={`err-${shakeCount}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 shadow-2xs"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Authentication Failed</span>
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="p-0.5 text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
              autoComplete="off"
              data-lpignore="true"
            >
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="emailOrUsername"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Admin email or phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="emailOrUsername"
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    disabled={submitStage !== 'idle'}
                    {...register('emailOrUsername')}
                    placeholder="Admin email or phone"
                    className={`w-full pl-9.5 pr-3.5 py-2.5 text-xs bg-white border rounded-xl placeholder-slate-400 text-slate-900 transition-all focus:outline-hidden ${
                      errors.emailOrUsername
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/12'
                    }`}
                  />
                </div>
                {errors.emailOrUsername && (
                  <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                    {errors.emailOrUsername.message}
                  </p>
                )}
              </div>

              {/* Hidden decoy fields to neutralize browser credential autofill */}
              <input
                type="text"
                name="fake_autofill_username"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="username"
                className="sr-only opacity-0 h-0 w-0 absolute pointer-events-none"
              />
              <input
                type="password"
                name="fake_autofill_password"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="new-password"
                className="sr-only opacity-0 h-0 w-0 absolute pointer-events-none"
              />

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    disabled={submitStage !== 'idle'}
                    {...register('password')}
                    placeholder="••••••••••••"
                    className={`w-full pl-9.5 pr-10 py-2.5 text-xs bg-white border rounded-xl placeholder-slate-400 text-slate-900 transition-all focus:outline-hidden ${
                      errors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/12'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword ? (
                        <motion.span
                          key="hide"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <EyeOff className="w-4 h-4" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="show"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me on this device
                  </span>
                </label>
              </div>

              {/* Primary Sign In Button with Multi-Stage Animation */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={submitStage !== 'idle'}
                  whileHover={submitStage === 'idle' ? { scale: 1.01 } : {}}
                  whileTap={submitStage === 'idle' ? { scale: 0.99 } : {}}
                  className={`w-full py-2.5 px-4 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group ${
                    submitStage === 'granted'
                      ? 'bg-emerald-600 shadow-emerald-500/25'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/25'
                  } disabled:opacity-90`}
                >
                  <AnimatePresence mode="wait">
                    {submitStage === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </motion.div>
                    )}

                    {submitStage === 'authenticating' && (
                      <motion.div
                        key="auth"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2 font-mono"
                      >
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </motion.div>
                    )}

                    {submitStage === 'verifying' && (
                      <motion.div
                        key="verify"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-2 font-mono"
                      >
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying session...</span>
                      </motion.div>
                    )}

                    {submitStage === 'granted' && (
                      <motion.div
                        key="granted"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 font-mono text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Authenticated ✓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <p className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Sign in with an active admin account registered on the platform.
              </p>
            </form>
          </motion.div>

          {/* Compact Security Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
            <div>
              <p className="font-medium text-slate-500">Authorized administrators only</p>
              <p className="text-[10px] text-slate-400">Session activity is securely logged.</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-500 block">TLS 1.3 Encrypted session</span>
              <span className="text-slate-400 text-[10px]">v2.4.0</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForgotModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Password Recovery</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Password recovery is handled directly by the system super administrator. To reset your administrative credentials, submit an internal IT security request or contact system ops.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
