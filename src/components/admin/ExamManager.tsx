import { useState, useMemo } from "react";
import {
  FileCheck2,
  Plus,
  Clock,
  Award,
  BookOpen,
  Sliders,
  Search,
  Filter,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Share2,
  Upload,
} from "lucide-react";
import { Exam, Question, Lesson } from "../../types";
import { ExamEditorModal } from "./ExamEditorModal";
import { exportQuestionsToWord } from "../../services/wordService";

interface ExamManagerProps {
  exams: Exam[];
  questions: Question[];
  lessons: Lesson[];
  onSaveExam: (exam: Exam, newQuestions?: Question[]) => void;
  onDeleteExam: (examId: string) => void;
  onToggleLock: (examId: string) => void;
  onPreviewExam?: (exam: Exam) => void;
}

export function ExamManager({
  exams,
  questions,
  lessons,
  onSaveExam,
  onDeleteExam,
  onToggleLock,
  onPreviewExam,
}: ExamManagerProps) {
  const [selectedSemester, setSelectedSemester] = useState<"ALL" | 1 | 2>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [modalInitialMode, setModalInitialMode] = useState<"MANUAL" | "AUTO" | "WORD_IMPORT">("MANUAL");

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSemester =
        selectedSemester === "ALL" || exam.semester === selectedSemester;
      const matchCategory =
        selectedCategory === "ALL" || exam.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description &&
          exam.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSemester && matchCategory && matchSearch;
    });
  }, [exams, selectedSemester, selectedCategory, searchQuery]);

  // Statistics
  const totalExams = exams.length;
  const activeExams = exams.filter((e) => !e.isLocked).length;
  const sem1Count = exams.filter((e) => e.semester === 1).length;
  const sem2Count = exams.filter((e) => e.semester === 2).length;

  // Handle open create modal
  const handleOpenCreate = (mode: "MANUAL" | "AUTO" | "WORD_IMPORT" = "MANUAL") => {
    setEditingExam(null);
    setModalInitialMode(mode);
    setIsEditorOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setModalInitialMode("MANUAL");
    setIsEditorOpen(true);
  };

  // Handle duplicate exam
  const handleDuplicate = (exam: Exam) => {
    const duplicated: Exam = {
      ...exam,
      id: `EXAM_${Date.now()}`,
      title: `${exam.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveExam(duplicated);
  };

  // Handle export single exam to Word
  const handleExportWord = async (exam: Exam) => {
    const examQuestions = exam.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    if (examQuestions.length === 0) {
      alert("Đề thi này chưa có câu hỏi nào để xuất file Word.");
      return;
    }

    try {
      await exportQuestionsToWord(
        examQuestions,
        exam.title,
        `ĐỀ KIỂM TRA: ${exam.title} - Thời gian: ${exam.durationMinutes} phút`
      );
    } catch (err: any) {
      alert("Lỗi xuất file Word: " + (err.message || "Không xác định"));
    }
  };

  return (
    <div id="exam-manager" className="space-y-6">
      {/* Top Banner / Action Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Quản Lí Đề Kiểm Tra & Khảo Sát
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tạo đề thi mới, điều chỉnh thời lượng, thang điểm và phân quyền hiển thị cho học sinh
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenCreate("WORD_IMPORT")}
            className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs border border-blue-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>TẠO TỪ WORD</span>
          </button>

          <button
            onClick={() => handleOpenCreate("AUTO")}
            className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>TẠO TỪ BÀI GIẢNG</span>
          </button>

          <button
            onClick={() => handleOpenCreate("MANUAL")}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>TẠO MỚI</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng số đề thi</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalExams}</span>
          <span className="text-[10px] text-slate-400">Đã lưu trong hệ thống</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 block">Đang mở cho HS</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{activeExams}</span>
          <span className="text-[10px] text-emerald-500">Học sinh có thể làm bài</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600 block">Đề Học kì I</span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">{sem1Count}</span>
          <span className="text-[10px] text-indigo-400">Chương trình HK I</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 block">Đề Học kì II</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{sem2Count}</span>
          <span className="text-[10px] text-purple-400">Chương trình HK II</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedSemester("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedSemester === "ALL"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả kì
            </button>
            <button
              onClick={() => setSelectedSemester(1)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedSemester === 1
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Học kì I
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedSemester === 2
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Học kì II
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Tất cả thể loại đề</option>
            <option value="GIỮA KÌ">Giữa kì</option>
            <option value="CUỐI KÌ">Cuối kì</option>
            <option value="15 PHÚT">15 Phút</option>
            <option value="1 TIẾT">1 Tiết (45p)</option>
            <option value="KHẢO SÁT">Khảo sát</option>
            <option value="TỰ LUYỆN">Tự luyện</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tên đề thi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Chưa có đề kiểm tra nào phù hợp</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bấm nút "Tạo đề kiểm tra mới" ở trên để đưa đề lên, set up thời gian và thang điểm.
            </p>
            <button
              onClick={() => handleOpenCreate()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề mới ngay</span>
            </button>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const examQuestions = exam.questionIds
              .map((id) => questions.find((q) => q.id === id))
              .filter((q): q is Question => Boolean(q));

            const p1 = examQuestions.filter((q) => q.part === "PART_1").length;
            const p2 = examQuestions.filter((q) => q.part === "PART_2").length;
            const p3 = examQuestions.filter((q) => q.part === "PART_3").length;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                        {exam.category || "ĐỀ THI"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        HK {exam.semester === 1 ? "I" : "II"}
                      </span>
                    </div>

                    {/* Lock / Unlock Toggle Button */}
                    <button
                      onClick={() => onToggleLock(exam.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        !exam.isLocked
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={exam.isLocked ? "Bấm để mở cho học sinh" : "Bấm để khóa đề thi"}
                    >
                      {!exam.isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đang Mở</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Đang Khóa</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {exam.title}
                  </h3>
                  {exam.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-normal">
                      {exam.description}
                    </p>
                  )}

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">THỜI GIAN</span>
                      <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {exam.durationMinutes}p
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">THANG ĐIỂM</span>
                      <span className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        {exam.totalPoints || 10}đ
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">CÂU HỎI</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 block">
                        {exam.questionIds.length} câu
                      </span>
                    </div>
                  </div>

                  {/* Question breakdown */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mt-2 px-1">
                    <span>Phần I: {p1} câu</span>
                    <span>•</span>
                    <span>Phần II: {p2} câu</span>
                    <span>•</span>
                    <span>Phần III: {p3} câu</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {onPreviewExam && (
                      <button
                        onClick={() => onPreviewExam(exam)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title="Làm thử như học sinh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleExportWord(exam)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer transition-colors"
                      title="Xuất đề ra file Word (.docx)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(exam)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                      title="Nhân bản đề kiểm tra"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Bạn có chắc chắn muốn xóa đề kiểm tra "${exam.title}" không?`
                          )
                        ) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors"
                      title="Xóa đề thi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Edit / Create */}
      <ExamEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        exam={editingExam}
        questions={questions}
        lessons={lessons}
        initialMode={modalInitialMode}
        onSave={(savedExam, newQuestions) => {
          onSaveExam(savedExam, newQuestions);
        }}
      />
    </div>
  );
}
