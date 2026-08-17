import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Table as TableIcon,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { APPS_SCRIPT_CODE } from "../../google-apps-script/Code.gs";
import { AppConfig } from "../../types";

interface AppsScriptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveGasUrl: (url: string) => void;
}

export function AppsScriptGuideModal({
  isOpen,
  onClose,
  config,
  onSaveGasUrl,
}: AppsScriptGuideModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputUrl, setInputUrl] = useState(config.googleAppsScriptUrl || "");
  const [activeTab, setActiveTab] = useState<"GUIDE" | "CODE" | "SHEETS">("GUIDE");
  const [saveStatus, setSaveStatus] = useState<string>("");

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveUrl = () => {
    const clean = inputUrl.trim();
    onSaveGasUrl(clean);
    setSaveStatus("Đã lưu URL thành công!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div
      id="apps-script-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TableIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Hướng Dẫn Kết Nối Google Sheets & Apps Script</h2>
              <p className="text-xs text-slate-400">
                10 bước triển khai backend tự động ghi và tổng hợp điểm cho giáo viên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("GUIDE")}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "GUIDE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            10 BƯỚC TRIỂN KHAI CHI TIẾT
          </button>
          <button
            onClick={() => setActiveTab("CODE")}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "CODE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            MÃ NGUỒN APPS SCRIPT (CODE.GS)
          </button>
          <button
            onClick={() => setActiveTab("SHEETS")}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "SHEETS"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            CẤU TRÚC GOOGLE SHEETS
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* TAB 1: 10 STEPS GUIDE */}
          {activeTab === "GUIDE" && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl text-xs text-sky-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Giáo viên chỉ cần làm một lần duy nhất cho cả năm học!</p>
                  <p className="text-sky-800 mt-0.5">
                    Hệ thống sẽ tự động tạo Sheet cho từng bài học khi học sinh nộp bài và tự động cập nhật bảng điểm tổng hợp.
                  </p>
                </div>
              </div>

              <ol className="space-y-3.5 text-xs text-slate-700">
                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 1: Tạo Google Sheets mới</strong>
                    <p className="text-slate-600 mt-0.5">
                      Truy cập <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">sheets.new</a> để tạo bảng tính mới. Đặt tên ví dụ: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">KẾT QUẢ LUYỆN TẬP ĐỊA LÍ 11 – 2026–2027</code>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 2: Mở Tiện ích mở rộng (Apps Script)</strong>
                    <p className="text-slate-600 mt-0.5">
                      Trên thanh menu của Google Sheets, chọn <strong>Tiện ích mở rộng (Extensions)</strong> → chọn <strong>Apps Script</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 3: Dán mã nguồn Backend</strong>
                    <p className="text-slate-600 mt-0.5">
                      Chuyển sang tab <strong>"MÃ NGUỒN APPS SCRIPT (CODE.GS)"</strong> ở trên, bấm <strong>Sao chép toàn bộ mã</strong>, sau đó xóa hết code cũ trong Apps Script và dán toàn bộ vào.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 4: Bấm Triển khai (Deploy)</strong>
                    <p className="text-slate-600 mt-0.5">
                      Ở góc trên bên phải màn hình Apps Script, bấm nút màu xanh <strong>Triển khai (Deploy)</strong> → chọn <strong>Tùy chọn triển khai mới (New deployment)</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                  <div>
                    <strong className="text-amber-900 block font-bold">Bước 5: Chọn Loại ứng dụng Web (QUAN TRỌNG NHẤT)</strong>
                    <p className="text-amber-800 mt-0.5">
                      • Bấm biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn <strong>Ứng dụng web (Web app)</strong>.<br />
                      • Thực thi dưới dạng (Execute as): <strong>Tôi (Me)</strong>.<br />
                      • Ai có quyền truy cập (Who has access): <strong>Bất kỳ ai (Anyone)</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">6</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 6: Cấp quyền truy cập cho Script</strong>
                    <p className="text-slate-600 mt-0.5">
                      Google sẽ yêu cầu cấp quyền để Apps Script ghi dữ liệu vào Sheet của bạn. Bấm <strong>Ủy quyền truy cập (Authorize access)</strong> → Chọn tài khoản Google của bạn → Bấm <strong>Nâng cao (Advanced)</strong> → Chọn <strong>Đi tới... (không an toàn)</strong> → Bấm <strong>Cho phép (Allow)</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">7</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 7: Sao chép URL Ứng dụng Web (Web App URL)</strong>
                    <p className="text-slate-600 mt-0.5">
                      Sau khi triển khai, Google sẽ cung cấp <strong>URL ứng dụng web</strong> (có đuôi dạng <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/exec</code>). Bấm nút <strong>Sao chép</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">8</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 8: Dán URL vào ô cấu hình bên dưới</strong>
                    <p className="text-slate-600 mt-0.5">
                      Dán URL vừa sao chép vào ô <strong>"Google Apps Script Web App URL"</strong> bên dưới và bấm <strong>LƯU CẤU HÌNH</strong>.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">9</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Bước 9: Kiểm tra học sinh nộp bài</strong>
                    <p className="text-slate-600 mt-0.5">
                      Thực hiện thử 1 bài làm học sinh. Sau khi bấm Nộp bài, mở Google Sheets của bạn để thấy sheet <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">BAI_01</code> và <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">TONG_HOP</code> tự động sinh ra kèm điểm số đầy đủ.
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">10</span>
                  <div>
                    <strong className="text-emerald-900 block font-bold">Bước 10: Chia sẻ link website cho học sinh</strong>
                    <p className="text-emerald-800 mt-0.5">
                      Gửi link website cho học sinh trong các tiết học hoặc bài tập về nhà. Điểm số sẽ tự động cập nhật theo thời gian thực!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 2: CODE.GS */}
          {activeTab === "CODE" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Mã nguồn Google Apps Script (Code.gs)
                </span>
                <button
                  id="btn-copy-apps-script-code"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? "ĐÃ SAO CHÉP MÃ!" : "SAO CHÉP TOÀN BỘ MÃ"}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-[400px] leading-relaxed">
                  <code>{APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SHEETS STRUCTURE */}
          {activeTab === "SHEETS" && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  1. Cấu trúc Sheet Bài học (BAI_01, BAI_02, ... BAI_32)
                </h4>
                <p className="text-slate-600 mb-3">
                  Tự động sinh ra khi có lượt nộp bài đầu tiên. Gồm 17 cột tiêu chuẩn:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[11px] text-left border divide-y divide-slate-200">
                    <thead className="bg-sky-50 font-bold text-sky-950">
                      <tr>
                        <th className="p-2">Cột</th>
                        <th className="p-2">Tên Header</th>
                        <th className="p-2">Mô tả dữ liệu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr><td className="p-2 font-mono">A</td><td className="p-2 font-bold">Timestamp</td><td className="p-2">Thời gian máy chủ nhận bài</td></tr>
                      <tr><td className="p-2 font-mono">B</td><td className="p-2 font-bold">attemptId</td><td className="p-2">Mã lượt làm bài độc nhất (chống nộp trùng)</td></tr>
                      <tr><td className="p-2 font-mono">C</td><td className="p-2 font-bold">Họ và tên</td><td className="p-2">Họ tên học sinh</td></tr>
                      <tr><td className="p-2 font-mono">D</td><td className="p-2 font-bold">Lớp</td><td className="p-2">Lớp học sinh</td></tr>
                      <tr><td className="p-2 font-mono">E</td><td className="p-2 font-bold">Bài học</td><td className="p-2">Tên bài học SGK</td></tr>
                      <tr><td className="p-2 font-mono">F</td><td className="p-2 font-bold">Lần làm</td><td className="p-2">Số lần làm bài của học sinh đối với bài này</td></tr>
                      <tr><td className="p-2 font-mono">G</td><td className="p-2 font-bold text-emerald-700">Điểm tổng</td><td className="p-2 font-bold">Điểm tổng kết trên thang 10</td></tr>
                      <tr><td className="p-2 font-mono">H - J</td><td className="p-2 font-bold">Điểm Phần I, II, III</td><td className="p-2">Điểm chi tiết từng phần</td></tr>
                      <tr><td className="p-2 font-mono">K - M</td><td className="p-2 font-bold">Số câu Đúng/Sai/Bỏ</td><td className="p-2">Thống kê số lượng câu</td></tr>
                      <tr><td className="p-2 font-mono">N</td><td className="p-2 font-bold">Thời gian (giây)</td><td className="p-2">Thời lượng học sinh hoàn thành bài</td></tr>
                      <tr><td className="p-2 font-mono">O - Q</td><td className="p-2 font-bold">Answers / Logs</td><td className="p-2">Dữ liệu chi tiết & thời gian nộp</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  2. Cấu trúc Sheet TỔNG HỢP (TONG_HOP)
                </h4>
                <p className="text-slate-600">
                  Tự động tổng hợp điểm cao nhất của mỗi học sinh qua tất cả các bài học từ Bài 1 đến Bài 32, tự động tính Điểm trung bình và Số bài đã hoàn thành.
                </p>
              </div>
            </div>
          )}

          {/* Configuration Input Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Dán URL Google Apps Script vào đây:
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="input-gas-url-modal"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                id="btn-save-gas-url"
                onClick={handleSaveUrl}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
              >
                LƯU CẤU HÌNH
              </button>
            </div>
            {saveStatus && (
              <p className="text-xs text-emerald-400 font-semibold">{saveStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
