import { AppConfig } from "../../types";

interface FooterProps {
  config: AppConfig;
  onOpenTeacherAdmin: () => void;
  onOpenGasGuide?: () => void;
}

export function Footer({ config, onOpenTeacherAdmin }: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} {config.subject} • Năm học {config.schoolYear}
        </p>
        <button onClick={onOpenTeacherAdmin} className="mt-2 text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer">
          Khu vực Giáo viên
        </button>
      </div>
    </footer>
  );
}
