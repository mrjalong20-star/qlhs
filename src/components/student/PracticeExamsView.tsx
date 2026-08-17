import { useState, useMemo } from "react";
import {
  FileCheck2,
  Clock,
  Play,
  Lock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Award,
  Filter,
  Sliders,
  BookOpen,
} from "lucide-react";
import { Exam, Question, Lesson, StudentProfile } from "../../types";

interface PracticeExamsViewProps {
  exams: Exam[];
  questions: Question[];
  student: StudentProfile | null;
  isAdmin?: boolean;
  onStartExam: (examLesson: Lesson, examQuestions: Question[]) => void;
  onOpenStudentModal: () => void;
  onOpenAdminExamManager?: () => void;
}

export function PracticeExamsView({
  exams,
  questions,
  student,
  isAdmin,
  onStartExam,
  onOpenStudentModal,
  onOpenAdminExamManager,
}: PracticeExamsViewProps) {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchSemester = e.semester === selectedSemester;
      const matchCategory =
        selectedCategory === "ALL" || e.category === selectedCategory;
      return matchSemester && matchCategory;
    });
  }, [exams, selectedSemester, selectedCategory]);

  const handleLaunch = (exam: Exam) => {
    if (!student) {
      onOpenStudentModal();
      return;
    }

    // Resolve questions in exam
    const examQuestions = exam.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    if (examQuestions.length === 0) {
      alert("Đề thi này hiện chưa có câu hỏi nào. Vui lòng liên hệ giáo viên!");
      return;
    }

    // Convert exam to Lesson wrapper for QuizRunner with full custom scoring
    const examAsLesson: Lesson = {
      id: exam.id,
      lessonNumber: 0,
      title: exam.title,
      chapter: `Đề thi định kì • Học kì ${exam.semester}`,
      semester: exam.semester,
      durationMinutes: exam.durationMinutes,
      totalPoints: exam.totalPoints || 10.0,
      scoringConfig: exam.scoringConfig,
      allowReview: exam.allowReview ?? true,
      reviewMode: exam.allowReview ? "FULL" : "SCORE_ONLY",
    };

    onStartExam(examAsLesson, examQuestions);
  };

  return (
    <div id="practice-exams-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kiểm Tra Đánh Giá & Thi Thử Định Kì</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Đề Kiểm Tra Thử Môn Địa Lí 11
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
            Hệ thống đề thi chuẩn ma trận GDPT 2018 (Phần I: Nhiều lựa chọn, Phần II: Đúng/Sai 4 ý, Phần III: Trả lời ngắn). Giáo viên có thể tự thiết lập thời gian và thang điểm.
          </p>
        </div>

        {isAdmin && onOpenAdminExamManager && (
          <button
            onClick={onOpenAdminExamManager}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-xs border border-white/30 flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto shrink-0"
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>Quản Lý & Tạo Đề Mới (Giáo viên)</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Semester Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedSemester(1)}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedSemester === 1
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HỌC KÌ I
          </button>
          <button
            onClick={() => setSelectedSemester(2)}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedSemester === 2
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HỌC KÌ II
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {[
            { id: "ALL", label: "Tất cả đề" },
            { id: "GIỮA KÌ", label: "Giữa kì" },
            { id: "CUỐI KÌ", label: "Cuối kì" },
            { id: "15 PHÚT", label: "15 Phút" },
            { id: "1 TIẾT", label: "1 Tiết" },
            { id: "KHẢO SÁT", label: "Khảo sát" },
            { id: "TỰ LUYỆN", label: "Luyện tập" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Chưa có đề kiểm tra nào trong danh mục này</p>
            <p className="text-xs text-slate-500">
              Vui lòng chọn danh mục khác hoặc liên hệ giáo viên để được cung cấp đề thi.
            </p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const examQuestions = exam.questionIds
              .map((id) => questions.find((q) => q.id === id))
              .filter((q): q is Question => Boolean(q));

            const p1Count = examQuestions.filter((q) => q.part === "PART_1").length;
            const p2Count = examQuestions.filter((q) => q.part === "PART_2").length;
            const p3Count = examQuestions.filter((q) => q.part === "PART_3").length;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                      {exam.category || "ĐỀ KIỂM TRA"}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Thang {exam.totalPoints || 10}đ</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {exam.description ||
                      "Tổng hợp kiến thức trọng tâm theo chuẩn ma trận đánh giá năng lực GDPT 2018."}
                  </p>

                  {/* Structure Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mt-5 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-extrabold uppercase">
                        Phần I (Trắc nghiệm)
                      </span>
                      <span className="font-extrabold text-sky-700 text-sm">{p1Count}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> câu</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-extrabold uppercase">
                        Phần II (Đúng/Sai)
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">{p2Count}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> câu</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-extrabold uppercase">
                        Phần III (Trả lời ngắn)
                      </span>
                      <span className="font-extrabold text-indigo-700 text-sm">{p3Count}</span>
                      <span className="text-[10px] text-slate-500 font-medium"> câu</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 bg-white">
                  {exam.isLocked ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Giáo viên đang tạm khóa đề thi này</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-launch-exam-${exam.id}`}
                      onClick={() => handleLaunch(exam)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>BẮT ĐẦU LÀM BÀI KIỂM TRA</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
