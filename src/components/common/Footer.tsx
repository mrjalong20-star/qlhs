import { GraduationCap, ShieldCheck, Database, Layers } from "lucide-react";
import { AppConfig } from "../../types";

interface FooterProps {
  config: AppConfig;
  onOpenTeacherAdmin: () => void;
  onOpenGasGuide?: () => void;
}

export function Footer({ config, onOpenTeacherAdmin, onOpenGasGuide }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 py-10 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-3">
              <GraduationCap className="w-6 h-6 text-sky-400" />
              <span>{config.subject} • GDPT 2018</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Năm học {config.schoolYear}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Cấu trúc đề đánh giá
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>Phần I: Trắc nghiệm 4 lựa chọn (A, B, C, D)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Phần II: Trắc nghiệm Đúng/Sai (4 nhận định)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Phần III: Trả lời ngắn & tính toán</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Hệ thống & Dữ liệu
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Google Sheets: Tự động ghi và tổng hợp điểm</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Bảo mật: Chống sửa điểm & chống nộp trùng</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Chấm điểm độc lập theo chuẩn GDPT 2018</span>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  id="footer-admin-link"
                  onClick={onOpenTeacherAdmin}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
                >
                  Khu vực Quản trị dành cho Giáo viên
                </button>

                {onOpenGasGuide && (
                  <button
                    id="footer-gas-guide-link"
                    onClick={onOpenGasGuide}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                  >
                    Hướng dẫn kết nối Google Sheets
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {config.subject}. Phát triển phục vụ giảng dạy môn Toán 11.</p>
        </div>
      </div>
    </footer>
  );
}
