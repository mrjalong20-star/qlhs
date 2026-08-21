import { useState, useMemo } from "react";
import { FileCheck2, Clock, Play, Lock, Award } from "lucide-react";
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

export function PracticeExamsView({ exams, questions, student, onStartExam, onOpenStudentModal }: PracticeExamsViewProps) {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => e.semester === selectedSemester);
  }, [exams, selectedSemester]);

  const handleLaunch = (exam: Exam) => {
    if (!student) { onOpenStudentModal(); return; }
    const examQuestions = exam.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is Question => Boolean(q));
    if (examQuestions.length === 0) { alert("Đề thi chưa có câu hỏi."); return; }
    const examAsLesson: Lesson = {
      id: exam.id, lessonNumber: 0, title: exam.title,
      chapter: `Học kì ${exam.semester}`, semester: exam.semester,
      durationMinutes: exam.durationMinutes, totalPoints: exam.totalPoints || 10,
      scoringConfig: exam.scoringConfig, allowReview: exam.allowReview ?? true,
      reviewMode: exam.allowReview ? "FULL" : "SCORE_ONLY",
    };
    onStartExam(examAsLesson, examQuestions);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      {/* Semester tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => setSelectedSemester(1)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors cursor-pointer ${selectedSemester === 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Học kì I
        </button>
        <button onClick={() => setSelectedSemester(2)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors cursor-pointer ${selectedSemester === 2 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Học kì II
        </button>
      </div>

      {/* Exams */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-16">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Chưa có đề thi</p>
          <p className="text-xs text-slate-400 mt-1">Giáo viên sẽ tạo đề thi khi đến lúc</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams.map((exam) => {
            const examQuestions = exam.questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
            return (
              <div key={exam.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{exam.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.durationMinutes} phút</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" />{exam.totalPoints || 10} điểm</span>
                    <span>{examQuestions.length} câu hỏi</span>
                  </div>
                </div>
                {exam.isLocked ? (
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Lock className="w-3 h-3" />Khóa</span>
                ) : (
                  <button onClick={() => handleLaunch(exam)} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors cursor-pointer shrink-0">
                    Làm bài
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
