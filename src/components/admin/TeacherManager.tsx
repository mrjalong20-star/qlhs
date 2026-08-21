import { useEffect, useState } from "react";
import { RefreshCw, Lock, Unlock, KeyRound, Copy, CheckCircle } from "lucide-react";
import { authService } from "../../services/authService";

interface Teacher { username: string; displayName: string; active: boolean; createdAt: string; }
interface RegCode { code: string; createdBy: string; displayName: string; usedBy?: string; usedAt?: string; createdAt: string; }

export function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [regCodes, setRegCodes] = useState<RegCode[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeCount, setCodeCount] = useState(1);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/teachers', { headers: authService.headers() });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      setTeachers(j.data || []);
    } catch (e: any) { setMessage(e.message || 'Không thể tải giáo viên.'); }
    try {
      const r2 = await fetch('/api/registration-codes', { headers: authService.headers() });
      const j2 = await r2.json();
      if (r2.ok) setRegCodes(j2.data || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function generateCodes() {
    setLoading(true); setMessage('');
    try {
      const r = await fetch('/api/registration-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.headers() },
        body: JSON.stringify({ count: codeCount })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      setNewCodes(j.data || []);
      setMessage(`Đã tạo ${j.data?.length || 0} mã đăng ký. Hãy gửi mã cho giáo viên.`);
      await load();
    } catch (e: any) { setMessage(e.message || 'Tạo mã thất bại.'); }
    finally { setLoading(false); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    });
  }

  async function toggle(t: Teacher) {
    const r = await fetch(`/api/teachers/${encodeURIComponent(t.username)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authService.headers() },
      body: JSON.stringify({ active: !t.active })
    });
    const j = await r.json();
    if (!r.ok) { setMessage(j.message || 'Không thể cập nhật.'); return; }
    load();
  }

  return (
    <div className="space-y-6">
      {/* Teacher Account List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Quản lý giáo viên</h3>
            <p className="text-xs text-slate-500">Quản trị viên chỉ quản lý tài khoản giáo viên.</p>
          </div>
          <button onClick={load} className="px-3 py-2 rounded-xl border text-xs font-bold"><RefreshCw className="inline w-3.5 h-3.5 mr-1" />Cập nhật</button>
        </div>
        {message && <div className="p-3 rounded-xl bg-sky-50 text-sky-800 text-xs">{message}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-3">Giáo viên</th><th className="text-left p-3">Tài khoản</th><th className="text-left p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
            <tbody>{teachers.map(t => <tr key={t.username} className="border-b">
              <td className="p-3 font-semibold">{t.displayName}</td>
              <td className="p-3">{t.username}</td>
              <td className="p-3">{t.active ? 'Đang hoạt động' : 'Đã khóa'}</td>
              <td className="p-3 text-center">
                <button onClick={() => toggle(t)} className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold">
                  {t.active ? <><Lock className="inline w-3.5 h-3.5 mr-1" />Khóa</> : <><Unlock className="inline w-3.5 h-3.5 mr-1" />Mở khóa</>}
                </button>
              </td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* Registration Codes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-500" /> Mã đăng ký</h3>
          <p className="text-xs text-slate-500 mt-1">Tạo mã để giáo viên tự đăng ký. Giáo viên chỉ cần dán mã + nhập thông tin.</p>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng mã</label>
            <input type="number" min={1} max={20} value={codeCount} onChange={e => setCodeCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))} className="w-24 px-4 py-3 rounded-xl border bg-slate-50 text-sm text-center font-bold" />
          </div>
          <button disabled={loading} onClick={generateCodes} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm">
            <KeyRound className="inline w-4 h-4 mr-2" />Tạo mã đăng ký
          </button>
        </div>

        {newCodes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-800">Mã vừa tạo (gửi cho giáo viên):</p>
            <div className="flex flex-wrap gap-2">
              {newCodes.map(c => (
                <div key={c} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-300">
                  <code className="text-sm font-bold text-slate-800">{c}</code>
                  <button onClick={() => copyCode(c)} className="p-1 rounded-lg hover:bg-amber-100">
                    {copiedCode === c ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {regCodes.length > 0 && (
          <div className="overflow-x-auto">
            <p className="text-xs font-bold text-slate-600 mb-2">Tất cả mã đã tạo:</p>
            <table className="min-w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-3">Mã</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Đã dùng bởi</th><th className="text-left p-3">Ngày tạo</th><th className="p-3">Sao chép</th></tr></thead>
              <tbody>{regCodes.map(rc => (
                <tr key={rc.code} className="border-b">
                  <td className="p-3"><code className="font-bold text-sm">{rc.code}</code></td>
                  <td className="p-3">
                    {rc.usedBy ? <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">Đã dùng</span> : <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">Chưa dùng</span>}
                  </td>
                  <td className="p-3 text-xs">{rc.usedBy || '—'}</td>
                  <td className="p-3 text-xs text-slate-500">{new Date(rc.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-3 text-center">
                    {!rc.usedBy && <button onClick={() => copyCode(rc.code)} className="px-2 py-1 rounded-lg hover:bg-slate-100">
                      {copiedCode === rc.code ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
