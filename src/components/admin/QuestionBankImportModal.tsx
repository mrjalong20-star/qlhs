import { useState, useRef, type ChangeEvent } from "react";
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FileEdit,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Question, Lesson } from "../../types";
import {
  wordService,
  generateSampleWordTemplate,
  exportQuestionBankToWord,
  parseWordQuestionBank,
  parseRawTextToQuestions,
} from "../../services/wordService";
import {
  parseExcelQuestionBank,
  exportQuestionBankToExcel,
  generateSampleQuestionBankTemplate,
} from "../../services/excelService";

interface QuestionBankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  existingQuestions: Question[];
  onImportSuccess: (newQuestions: Question[], mode: "MERGE" | "REPLACE") => void;
}

export function QuestionBankImportModal({
  isOpen,
  onClose,
  lessons,
  existingQuestions,
  onImportSuccess,
}: QuestionBankImportModalProps) {
  const [activeTab, setActiveTab] = useState<"WORD_FILE" | "PASTE_TEXT" | "EXCEL_FILE">("WORD_FILE");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    validQuestions: Question[];
    errors: { row: number; reason: string }[];
    totalQuestionsParsed?: number;
    totalRows?: number;
  } | null>(null);
  const [importMode, setImportMode] = useState<"MERGE" | "REPLACE">("MERGE");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleWordFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const result = await parseWordQuestionBank(selectedFile, lessons);
      setImportResult(result);
    } catch (err: any) {
      alert("Lỗi khi đọc file Word: " + (err.message || "Định dạng file không tương thích. Hãy chắc chắn file có đuôi .docx"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const result = await parseExcelQuestionBank(selectedFile, lessons);
      setImportResult(result);
    } catch (err: any) {
      alert("Lỗi khi đọc file Excel: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      alert("Vui lòng dán văn bản câu hỏi từ Word trước khi phân tích.");
      return;
    }
    setIsLoading(true);
    try {
      const result = parseRawTextToQuestions(pastedText, lessons);
      setImportResult(result);
    } catch (err: any) {
      alert("Lỗi khi phân tích văn bản: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadWordTemplate = () => {
    generateSampleWordTemplate(lessons);
  };

  const handleDownloadWordAll = () => {
    exportQuestionBankToWord(existingQuestions, lessons, "Ngan_Hang_Cau_Hoi_DiaLi11_GDPT2018.docx");
  };

  const handleDownloadExcelTemplate = () => {
    generateSampleQuestionBankTemplate(lessons);
  };

  const handleDownloadExcelAll = () => {
    exportQuestionBankToExcel(existingQuestions, lessons, "Ngan_hang_cau_hoi_Dia_li_11.xlsx");
  };

  const handleConfirmImport = () => {
    if (!importResult || importResult.validQuestions.length === 0) return;
    onImportSuccess(importResult.validQuestions, importMode);
    onClose();
  };

  return (
    <div
      id="question-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nhập & Xuất Ngân Hàng Câu Hỏi (File Word / Excel)</h2>
              <p className="text-xs text-slate-400">
                Chuẩn hóa cấu trúc 3 phần GDPT 2018 theo định dạng giáo viên quen thuộc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab("WORD_FILE");
              setImportResult(null);
            }}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "WORD_FILE"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tệp Word (.docx)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("PASTE_TEXT");
              setImportResult(null);
            }}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "PASTE_TEXT"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Dán trực tiếp từ Word</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("EXCEL_FILE");
              setImportResult(null);
            }}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "EXCEL_FILE"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tệp Excel (.xlsx)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Quick Actions: Download Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeTab === "EXCEL_FILE" ? (
              <>
                <button
                  onClick={handleDownloadExcelTemplate}
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center gap-3 transition-colors text-left cursor-pointer"
                >
                  <Download className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Tải biểu mẫu Excel (.xlsx)</span>
                    <span className="text-[11px] text-emerald-700">
                      Gồm cấu trúc cột chuẩn Phần I, II, III và hướng dẫn
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleDownloadExcelAll}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex items-center gap-3 transition-colors text-left cursor-pointer"
                >
                  <Download className="w-6 h-6 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Xuất toàn bộ câu hỏi (Excel)</span>
                    <span className="text-[11px] text-slate-600">
                      {existingQuestions.length} câu hỏi đang có trên hệ thống
                    </span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDownloadWordTemplate}
                  className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 flex items-center gap-3 transition-colors text-left cursor-pointer"
                >
                  <Download className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Tải biểu mẫu File Word (.docx)</span>
                    <span className="text-[11px] text-blue-700">
                      Mẫu chuẩn 3 phần GDPT 2018 có sẵn ví dụ minh họa
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleDownloadWordAll}
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center gap-3 transition-colors text-left cursor-pointer"
                >
                  <Download className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Xuất toàn bộ ra File Word (.docx)</span>
                    <span className="text-[11px] text-emerald-700">
                      {existingQuestions.length} câu hỏi trình bày rõ ràng, in ấn trực tiếp
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* TAB 1: UPLOAD WORD FILE */}
          {activeTab === "WORD_FILE" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tải file Word câu hỏi (.docx):
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-3xl p-8 text-center bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleWordFileChange}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">
                  {file ? file.name : "Kéo thả file Word (.docx) vào đây hoặc bấm để duyệt tệp"}
                </p>
                <p className="text-xs text-slate-500">
                  Hệ thống tự động đọc và trích xuất các câu hỏi Phần I, Phần II, Phần III
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT */}
          {activeTab === "PASTE_TEXT" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Dán nội dung từ Word vào đây:
                </label>
                <span className="text-xs text-blue-600">Hỗ trợ copy/paste trực tiếp từ Word</span>
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                placeholder={`Dán nội dung câu hỏi tại đây theo mẫu:\n\nPHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN\nCâu 1: [Mã bài: bai-01] [Mức độ: Nhận biết] Nhóm các nước phát triển có đặc điểm nào sau đây?\nA. Tỉ trọng ngành dịch vụ rất cao trong GDP\nB. Nông nghiệp chiếm tỉ trọng chủ đạo\nC. Công nghiệp khai khoáng đóng góp phần lớn\nD. Kinh tế chậm chuyển dịch\nĐáp án: A\nLời giải: Dịch vụ ở các nước phát triển chiếm >70% GDP.\n\nPHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI\nCâu 2: [Mã bài: bai-01] Cho nhận định sau:\na) Tỉ lệ gia tăng tự nhiên thấp. [Đúng]\nb) Dân số già hóa. [Đúng]\nc) Dân số trẻ hóa. [Sai]\nd) HDI rất cao. [Đúng]\n\nPHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN\nCâu 3: [Mã bài: bai-01] Tính tỉ trọng % ...\nĐáp án: 61.0\nĐơn vị: %`}
                className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />

              <button
                onClick={handleParsePastedText}
                disabled={!pastedText.trim() || isLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>PHÂN TÍCH VĂN BẢN ĐÃ DÁN</span>
              </button>
            </div>
          )}

          {/* TAB 3: EXCEL FILE */}
          {activeTab === "EXCEL_FILE" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tải file Excel câu hỏi (.xlsx, .xls):
              </label>

              <div
                onClick={() => excelInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer space-y-2"
              >
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">
                  {file ? file.name : "Kéo thả file Excel (.xlsx) vào đây hoặc bấm để duyệt tệp"}
                </p>
                <p className="text-xs text-slate-500">
                  Hỗ trợ định dạng bảng tính Excel chuẩn các cột
                </p>
              </div>
            </div>
          )}

          {/* Parse Result Summary */}
          {importResult && (
            <div className="space-y-4 animate-in fade-in border-t border-slate-200 pt-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 block">Tổng câu nhận diện</span>
                  <span className="text-xl font-bold text-slate-800">
                    {importResult.totalQuestionsParsed ?? importResult.totalRows ?? importResult.validQuestions.length}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-700 block">Hợp lệ & Sẵn sàng</span>
                  <span className="text-xl font-black text-emerald-800">{importResult.validQuestions.length}</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[11px] text-rose-700 block">Cảnh báo / Lỗi dòng</span>
                  <span className="text-xl font-bold text-rose-800">{importResult.errors.length}</span>
                </div>
              </div>

              {/* Errors list if any */}
              {importResult.errors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl max-h-40 overflow-y-auto space-y-1">
                  <span className="font-bold text-xs text-rose-900 block">Chi tiết cảnh báo:</span>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-rose-700">
                      • {err.reason} (vị trí dòng/đoạn {err.row})
                    </p>
                  ))}
                </div>
              )}

              {/* Import Mode: Merge vs Replace */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chế độ nạp vào Ngân hàng câu hỏi:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "MERGE"}
                      onChange={() => setImportMode("MERGE")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <strong>Gộp thêm (Merge):</strong> Thêm các câu hỏi mới vào ngân hàng hiện có, giữ nguyên câu hỏi cũ.
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "REPLACE"}
                      onChange={() => setImportMode("REPLACE")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-rose-700">
                      <strong>Ghi đè toàn bộ (Replace):</strong> Xóa toàn bộ câu hỏi cũ và thay thế bằng danh sách vừa nhập.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Đóng
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!importResult || importResult.validQuestions.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md disabled:opacity-40 cursor-pointer"
          >
            TIẾN HÀNH NẠP ({importResult?.validQuestions.length || 0} CÂU HỎI)
          </button>
        </div>
      </div>
    </div>
  );
}
