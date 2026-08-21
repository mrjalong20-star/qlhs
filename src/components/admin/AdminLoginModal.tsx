import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck, ArrowRight, X, KeyRound, Eye, EyeOff, GraduationCap, UserPlus } from "lucide-react";
import { authService } from "../../services/authService";
import { AppConfig } from "../../types";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: AppConfig;
}

type LoginRole = "TEACHER" | "SUPER_ADMIN";

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<LoginRole>("TEACHER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Register fields
  const [regCode, setRegCode] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  if (!isOpen) return null;

  const selectRole = (nextRole: LoginRole) => {
    setRole(nextRole);
    setError("");
    setPassword("");
    setUsername(nextRole === "SUPER_ADMIN" ? "admin" : "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const session = await authService.login(username.trim(), password);
      if (role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
        await authService.logout();
        throw new Error("Tài khoản này không phải tài khoản quản trị viên.");
      }
      if (role === "TEACHER" && session.role !== "TEACHER") {
        await authService.logout();
        throw new Error("Hãy chọn mục Quản trị viên để đăng nhập tài khoản admin.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!regCode.trim() || !regDisplayName.trim() || !regUsername.trim() || !regPassword) {
      setError("Vui lòng nhập đầy đủ mã đăng ký, họ tên, tài khoản và mật khẩu.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: regCode.trim(),
          displayName: regDisplayName.trim(),
          username: regUsername.trim(),
          password: regPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Đăng ký thất bại.");
      // Auto-login after register
      const session = await authService.login(regUsername.trim(), regPassword);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đăng ký thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer" aria-label="Đóng"><X className="w-5 h-5" /></button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            {mode === "register" ? <UserPlus className="w-7 h-7 text-emerald-400" /> : role === "SUPER_ADMIN" ? <Lock className="w-7 h-7 text-amber-400" /> : <GraduationCap className="w-7 h-7 text-sky-300" />}
          </div>
          <h2 className="text-xl font-bold">{mode === "register" ? "Đăng ký giáo viên" : "Đăng nhập hệ thống"}</h2>
          <p className="text-xs text-slate-400 mt-1">{mode === "register" ? "Dán mã đăng ký do quản trị viên cung cấp" : "Chọn loại tài khoản trước khi đăng nhập"}</p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button type="button" onClick={() => selectRole("TEACHER")} className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${role === "TEACHER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><GraduationCap className="w-4 h-4" /> Giáo viên</button>
              <button type="button" onClick={() => selectRole("SUPER_ADMIN")} className={`py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${role === "SUPER_ADMIN" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><KeyRound className="w-4 h-4" /> Quản trị viên</button>
            </div>

            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tài khoản</label>
              <input id="input-admin-username" type="text" value={username} onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }} placeholder={role === "SUPER_ADMIN" ? "admin" : "Tài khoản giáo viên..."} autoComplete="username" autoFocus className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900" />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <input id="input-admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} placeholder="Nhập mật khẩu..." autoComplete="current-password" className="w-full pl-4 pr-11 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>

            <button id="btn-admin-login-submit" type="submit" disabled={isLoading} className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50">
              {isLoading ? <span>Đang xác thực...</span> : <><span>ĐĂNG NHẬP {role === "SUPER_ADMIN" ? "QUẢN TRỊ" : "GIÁO VIÊN"}</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            {role === "TEACHER" && (
              <button type="button" onClick={() => { setMode("register"); setError(""); setRegCode(""); setRegDisplayName(""); setRegUsername(""); setRegPassword(""); }} className="w-full py-3 px-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 text-slate-600 hover:text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                <UserPlus className="w-4 h-4" /> Đăng ký tài khoản mới (có mã)
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /><span>Hệ thống bảo vệ quyền riêng tư & dữ liệu học sinh</span></div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mã đăng ký</label>
              <input type="text" value={regCode} onChange={(e) => { setRegCode(e.target.value.toUpperCase()); if (error) setError(""); }} placeholder="Dán mã từ quản trị viên (VD: GV-A1B2-C3D4)" autoFocus className="w-full px-4 py-3 text-sm bg-amber-50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 tracking-wider uppercase" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Họ và tên</label>
              <input type="text" value={regDisplayName} onChange={(e) => { setRegDisplayName(e.target.value); if (error) setError(""); }} placeholder="Nguyễn Văn A" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tài khoản đăng nhập</label>
              <input type="text" value={regUsername} onChange={(e) => { setRegUsername(e.target.value); if (error) setError(""); }} placeholder="Tài khoản (email hoặc tên)" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900" />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <input type={showPassword ? "text" : "password"} value={regPassword} onChange={(e) => { setRegPassword(e.target.value); if (error) setError(""); }} placeholder="Tạo mật khẩu mới" className="w-full pl-4 pr-11 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50">
              {isLoading ? <span>Đang đăng ký...</span> : <><UserPlus className="w-4 h-4" /><span>ĐĂNG KÝ TÀI KHOẢN</span></>}
            </button>

            <button type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer">
              ← Quay lại đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
