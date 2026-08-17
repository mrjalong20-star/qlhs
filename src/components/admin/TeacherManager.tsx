import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Lock, Unlock } from "lucide-react";
import { authService } from "../../services/authService";

interface Teacher { username: string; displayName: string; active: boolean; createdAt: string; }

export function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() { setLoading(true); try { const r=await fetch('/api/teachers',{headers:authService.headers()}); const j=await r.json(); if(!r.ok) throw new Error(j.message); setTeachers(j.data||[]); } catch(e:any){setMessage(e.message||'Không thể tải giáo viên.')} finally{setLoading(false);} }
  useEffect(()=>{load()},[]);
  async function create(){ if(!displayName||!username||!password){setMessage('Nhập đủ tên, tài khoản và mật khẩu.');return;} setLoading(true);setMessage(''); try{const r=await fetch('/api/teachers',{method:'POST',headers:{'Content-Type':'application/json',...authService.headers()},body:JSON.stringify({displayName,username,password})});const j=await r.json();if(!r.ok)throw new Error(j.message);setDisplayName('');setUsername('');setPassword('');setMessage('Đã tạo tài khoản giáo viên. Hãy gửi tài khoản và mật khẩu cho giáo viên.');await load();}catch(e:any){setMessage(e.message||'Tạo giáo viên thất bại.')}finally{setLoading(false)}}
  async function toggle(t:Teacher){const r=await fetch(`/api/teachers/${encodeURIComponent(t.username)}`,{method:'PATCH',headers:{'Content-Type':'application/json',...authService.headers()},body:JSON.stringify({active:!t.active})});const j=await r.json();if(!r.ok){setMessage(j.message||'Không thể cập nhật.');return;}load();}
  return <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
    <div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">Quản lý giáo viên</h3><p className="text-xs text-slate-500">Quản trị viên chỉ quản lý tài khoản giáo viên.</p></div><button onClick={load} className="px-3 py-2 rounded-xl border text-xs font-bold"><RefreshCw className="inline w-3.5 h-3.5 mr-1"/>Cập nhật</button></div>
    <div className="grid md:grid-cols-3 gap-2"><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Tên giáo viên" className="px-4 py-3 rounded-xl border bg-slate-50 text-sm"/><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Tài khoản" className="px-4 py-3 rounded-xl border bg-slate-50 text-sm"/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="px-4 py-3 rounded-xl border bg-slate-50 text-sm"/></div>
    <button disabled={loading} onClick={create} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold"><UserPlus className="inline w-4 h-4 mr-2"/>Tạo tài khoản giáo viên</button>
    {message&&<div className="p-3 rounded-xl bg-sky-50 text-sky-800 text-xs">{message}</div>}
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left p-3">Giáo viên</th><th className="text-left p-3">Tài khoản</th><th className="text-left p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody>{teachers.map(t=><tr key={t.username} className="border-b"><td className="p-3 font-semibold">{t.displayName}</td><td className="p-3">{t.username}</td><td className="p-3">{t.active?'Đang hoạt động':'Đã khóa'}</td><td className="p-3 text-center"><button onClick={()=>toggle(t)} className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold">{t.active?<><Lock className="inline w-3.5 h-3.5 mr-1"/>Khóa</>:<><Unlock className="inline w-3.5 h-3.5 mr-1"/>Mở khóa</>}</button></td></tr>)}</tbody></table></div>
  </div>
}
