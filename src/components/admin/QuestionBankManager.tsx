import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Copy,
  BookOpen,
  Filter,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Question, Lesson, QuestionPart, KnowledgeLevel } from "../../types";
import { QuestionEditorModal } from "./QuestionEditorModal";
import { QuestionBankImportModal } from "./QuestionBankImportModal";

interface QuestionBankManagerProps {
  questions: Question[];
  lessons: Lesson[];
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBulkImport: (newQuestions: Question[], mode: "MERGE" | "REPLACE") => void;
}

export function QuestionBankManager({
  questions,
  lessons,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBulkImport,
}: QuestionBankManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("ALL");
  const [selectedPart, setSelectedPart] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchLesson = selectedLessonId === "ALL" || q.lessonId === selectedLessonId;
      const matchPart = selectedPart === "ALL" || q.part === selectedPart;
      const matchLevel = selectedLevel === "ALL" || q.level === selectedLevel;
      const matchSearch =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLesson && matchPart && matchLevel && matchSearch;
    });
  }, [questions, selectedLessonId, selectedPart, selectedLevel, searchQuery]);

  const p1Count = questions.filter((q) => q.part === "PART_1").length;
  const p2Count = questions.filter((q) => q.part === "PART_2").length;
  const p3Count = questions.filter((q) => q.part === "PART_3").length;

  const handleDuplicate = (q: Question) => {
    const duplicated: Question = {
      ...q,
      id: `Q_DUP_${Date.now()}`,
      questionText: `(Bản sao) ${q.questionText}`,
    };
    onAddQuestion(duplicated);
  };

  return (
    <div id="question-bank-manager" className="space-y-6">
      {/* Top Header Stats & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Ngân Hàng Câu Hỏi Toán THCS & THPT</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              {questions.length} câu
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>Phần I: <strong className="text-sky-700">{p1Count}</strong></span>
            <span>• Phần II: <strong className="text-emerald-700">{p2Count}</strong></span>
            <span>• Phần III: <strong className="text-indigo-700">{p3Count}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-open-word-import"
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>NHẬP / XUẤT WORD</span>
          </button>

          <button
            id="btn-add-new-question"
            onClick={() => {
              setEditingQuestion(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM CÂU HỎI MỚI</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa câu hỏi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filter Lesson */}
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="ALL">Tất cả các bài học</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              Bài {l.lessonNumber}. {l.title.slice(0, 28)}...
            </option>
          ))}
        </select>

        {/* Filter Part */}
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="ALL">Tất cả 3 Phần</option>
          <option value="PART_1">Phần I: Nhiều lựa chọn</option>
          <option value="PART_2">Phần II: Đúng / Sai</option>
          <option value="PART_3">Phần III: Trả lời ngắn</option>
        </select>

        {/* Filter Level */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="ALL">Tất cả mức độ</option>
          <option value="NHAN_BIET">Nhận biết</option>
          <option value="THONG_HIEU">Thông hiểu</option>
          <option value="VAN_DUNG">Vận dụng</option>
          <option value="VAN_DUNG_CAO">Vận dụng cao</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredQuestions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredQuestions.map((q, idx) => {
              const lesson = lessons.find((l) => l.id === q.lessonId);

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          q.part === "PART_1"
                            ? "bg-sky-100 text-sky-800"
                            : q.part === "PART_2"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {q.part === "PART_1" && "Phần I"}
                        {q.part === "PART_2" && "Phần II"}
                        {q.part === "PART_3" && "Phần III"}
                      </span>

                      <span className="text-[11px] font-bold text-slate-700">
                        {lesson ? `Bài ${lesson.lessonNumber}` : q.lessonId}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                        {q.level}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {q.id}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                      {q.questionText}
                    </p>

                    {/* Preview details */}
                    <div className="text-xs text-slate-500">
                      {q.part === "PART_1" && (
                        <span>Đáp án đúng: <strong className="text-emerald-700">{q.correctOption}</strong></span>
                      )}
                      {q.part === "PART_2" && (
                        <span>
                          Đáp án đúng/sai: {q.subAnswers?.map((s) => `${s.id}: ${s.correctAnswer ? "Đ" : "S"}`).join(", ")}
                        </span>
                      )}
                      {q.part === "PART_3" && (
                        <span>
                          Đáp án: <strong className="text-indigo-700">{q.correctAnswerText}</strong> ({q.unit || "không có đơn vị"})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleDuplicate(q)}
                      title="Nhân bản câu hỏi"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsEditorOpen(true);
                      }}
                      title="Chỉnh sửa câu hỏi"
                      className="p-2 rounded-xl text-sky-600 hover:text-sky-800 hover:bg-sky-50 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${q.questionText.slice(0, 40)}..."?`)) {
                          onDeleteQuestion(q.id);
                        }
                      }}
                      title="Xóa câu hỏi"
                      className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy câu hỏi nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "THÊM CÂU HỎI MỚI".
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        lessons={lessons}
        initialQuestion={editingQuestion}
        defaultLessonId={selectedLessonId !== "ALL" ? selectedLessonId : undefined}
        onSave={(q) => {
          if (editingQuestion) {
            onUpdateQuestion(q);
          } else {
            onAddQuestion(q);
          }
        }}
      />

      {/* Excel Import Modal */}
      <QuestionBankImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        lessons={lessons}
        existingQuestions={questions}
        onImportSuccess={onBulkImport}
      />
    </div>
  );
}
