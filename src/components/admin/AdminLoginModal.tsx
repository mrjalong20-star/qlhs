import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck, ArrowRight, X, KeyRound, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/authService";
import { AppConfig } from "../../types";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: AppConfig;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
  config,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await authService.login(username.trim(), password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold">Đăng nhập hệ thống</h2>
          <p className="text-xs text-slate-400 mt-1">
            Giáo viên và quản trị viên đăng nhập bằng tài khoản được cấp
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tài khoản
            </label>
            <div className="relative">
              <input
                id="input-admin-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }}
                placeholder="Tên tài khoản..."
                autoComplete="username"
                autoFocus
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900 mb-3"
              />
              <input
                id="input-admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Nhập mật khẩu..."
                autoComplete="current-password"
                className="w-full pl-4 pr-11 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>ĐĂNG NHẬP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hệ thống bảo vệ quyền riêng tư & dữ liệu học sinh</span>
          </div>
        </form>
      </div>
    </div>
  );
}

