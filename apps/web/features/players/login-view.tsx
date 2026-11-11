"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "./auth-provider";
import { ArrowRightIcon, EyeIcon, FlameIcon, StarIcon, TrophyIcon } from "./icons";

type Mode = "signin" | "signup";

/** Animated backdrop: several balls descending a loss surface with different learning rates. */
function DescentBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let raf = 0;
    const lrs = [0.01, 0.03, 0.06, 0.081];
    const colors = ["#5eead4", "#2dd4bf", "#fbbf24", "#fb7185"];
    type Ball = { x: number; y: number; trail: [number, number][]; lr: number; color: string };
    const spawn = (i: number): Ball => ({ x: -3.6 + i * 0.2, y: 1.6 - i * 0.35, trail: [], lr: lrs[i], color: colors[i] });
    let balls = lrs.map((_, i) => spawn(i));

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.62;
      const cy = h * 0.26;
      const sx = w / 10;
      const sy = h / 9;
      for (let k = 1; k <= 11; k++) {
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.05 + (12 - k) * 0.012})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.sqrt(k) * sx * 0.95, Math.sqrt(k / 6) * sy * 0.95, -0.25, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      if (!reduce && frame % 3 === 0) {
        balls = balls.map((b) => {
          const gx = 2 * b.x;
          const gy = 12 * b.y;
          const nx = b.x - b.lr * gx;
          const ny = b.y - b.lr * gy;
          const trail = [...b.trail, [b.x, b.y] as [number, number]].slice(-60);
          return { ...b, x: nx, y: ny, trail };
        });
        if (frame > 900) {
          frame = 0;
          balls = lrs.map((_, i) => spawn(i));
        }
      }
      for (const b of balls) {
        const px = (x: number, y: number): [number, number] => [cx + x * sx * 0.95, cy - y * sy * 0.95];
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        b.trail.forEach(([x, y], i) => {
          const [X, Y] = px(x, y);
          if (i) ctx.lineTo(X, Y);
          else ctx.moveTo(X, Y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
        const [X, Y] = px(b.x, b.y);
        if (Number.isFinite(X) && Math.abs(b.y) < 6) {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(X, Y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      frame++;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 dark:focus:border-teal-400 dark:focus:ring-teal-400/15 transition";

export function LoginView() {
  const { status, signIn, signUp, guestQueued } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/games";
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "signed-in") router.replace(next);
  }, [status, next, router]);

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (mode === "signup" && name.trim().length < 2) errors.name = "Display name needs at least 2 characters.";
    if (mode === "signup" && password.length < 8) errors.password = "Use at least 8 characters.";
    if (mode === "signin" && !password) errors.password = "Enter your password.";
    return errors;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(email, name, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setFieldErrors({});
  };

  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length);

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[var(--background)]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white">
        <DescentBackdrop />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70" aria-hidden="true" />
        <Link href="/" className="relative z-10 flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-slate-950 font-mono text-sm font-bold">ML</span>
          MLingo
        </Link>
        <div className="relative z-10 max-w-md space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-300">Frame by frame</p>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.05] tracking-tight">
            Four learning rates.
            <br />
            <span className="text-teal-300">One minimum.</span>
          </h1>
          <p className="text-slate-300 leading-relaxed">
            Watch them race behind this form. Sign in to keep your streak, your stars and every run you&apos;ve saved.
          </p>
          <ul className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: <FlameIcon size={18} className="text-orange-400" />, label: "Daily streaks" },
              { icon: <StarIcon size={18} filled className="text-amber-300" />, label: "Stars per level" },
              { icon: <TrophyIcon size={18} className="text-teal-300" />, label: "Badges" },
            ].map((item) => (
              <li key={item.label} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-3 text-xs text-slate-200">
                <span className="mb-1.5 block">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 font-mono text-[11px] text-slate-500">α = 0.01 · 0.03 · 0.06 · 0.081 · guess which one overshoots</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] space-y-7">
          <Link href="/" className="lg:hidden flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white font-mono text-sm font-bold">ML</span>
            MLingo
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {mode === "signin" ? "Your streak is waiting." : "Save your progress across devices. It takes 20 seconds."}
            </p>
          </div>

          <div role="tablist" aria-label="Account mode" className="grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-900 p-1 text-sm font-semibold">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-lg py-2 transition ${mode === m ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {guestQueued > 0 ? (
            <p className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
              You have {guestQueued} game {guestQueued === 1 ? "result" : "results"} from playing as a guest. They&apos;ll move into your account when you sign in.
            </p>
          ) : null}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name</label>
                <input id="name" autoComplete="nickname" className={inputClass} placeholder="Ada" value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: "" })); }} />
                {fieldErrors.name ? <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p> : null}
              </div>
            ) : null}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input id="email" type="email" autoComplete="email" className={inputClass} placeholder="you@college.edu" value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: "" })); }} />
              {fieldErrors.email ? <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={`${inputClass} pr-11`} placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: "" })); }} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon size={18} off={showPassword} />
                </button>
              </div>
              {mode === "signup" && password ? (
                <div className="flex gap-1 pt-1" aria-label={`Password strength ${strength} of 4`}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength < 2 ? "bg-red-400" : strength < 3 ? "bg-amber-400" : "bg-teal-500") : "bg-slate-200 dark:bg-slate-800"}`} />
                  ))}
                </div>
              ) : null}
              {fieldErrors.password ? <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p> : null}
            </div>

            {error ? (
              <p role="alert" className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 py-3 font-semibold text-white dark:text-slate-950 transition disabled:opacity-70">
              {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
              {!busy ? <ArrowRightIcon size={18} className="transition-transform group-hover:translate-x-0.5" /> : null}
            </button>
          </form>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />or<span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <Link href={next}
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
            Continue as guest
          </Link>
          <p className="text-center text-xs text-slate-400">Guest progress stays on this browser until you sign in.</p>
        </div>
      </main>
    </div>
  );
}
