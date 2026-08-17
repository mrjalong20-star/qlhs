import React, { useState, useMemo, useRef, type ChangeEvent } from "react";
import {
  X,
  FileCheck2,
  Clock,
  Award,
  BookOpen,
  Filter,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Calendar,
  Lock,
  Unlock,
  Eye,
  AlertCircle,
  Search,
  Shuffle,
  Upload,
  FileText,
  Download,
  FileEdit,
} from "lucide-react";
import {
  Exam,
  Question,
  Lesson,
  ExamScoringConfig,
  QuestionPart,
  QuestionLevel,
} from "../../types";
import {
  parseWordQuestionBank,
  parseRawTextToQuestions,
  generateSampleWordTemplate,
} from "../../services/wordService";

interface ExamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  questions: Question[];
  lessons: Lesson[];
  initialMode?: "MANUAL" | "AUTO" | "WORD_IMPORT";
  onSave: (exam: Exam, newQuestions?: Question[]) => void;
}

export function ExamEditorModal({
  isOpen,
  onClose,
  exam,
  questions,
  lessons,
  initialMode = "MANUAL",
  onSave,
}: ExamEditorModalProps) {
  // Mode: Manual Pick, Matrix Auto-Generator, or Word Import
  const [pickMode, setPickMode] = useState<"MANUAL" | "AUTO" | "WORD_IMPORT">(
    initialMode
  );

  // Basic Info Form State
  const [title, setTitle] = useState(exam?.title || "");
  const [description, setDescription] = useState(exam?.description || "");
  const [semester, setSemester] = useState<1 | 2>(exam?.semester || 1);
  const [category, setCategory] = useState<string>(exam?.category || "GIỮA KÌ");
  const [durationMinutes, setDurationMinutes] = useState<number>(exam?.durationMinutes || 45);
  const [isLocked, setIsLocked] = useState<boolean>(exam?.isLocked || false);
  const [allowReview, setAllowReview] = useState<boolean>(exam?.allowReview ?? true);

  // Scoring Setup
  const [totalPoints, setTotalPoints] = useState<number>(exam?.totalPoints || 10.0);
  const [part1ScorePerQ, setPart1ScorePerQ] = useState<number>(
    exam?.scoringConfig?.part1ScorePerQuestion ?? 0.25
  );
  const [part2Formula, setPart2Formula] = useState({
    correct1: exam?.scoringConfig?.part2ScoringFormula?.correct1 ?? 0.1,
    correct2: exam?.scoringConfig?.part2ScoringFormula?.correct2 ?? 0.25,
    correct3: exam?.scoringConfig?.part2ScoringFormula?.correct3 ?? 0.5,
    correct4: exam?.scoringConfig?.part2ScoringFormula?.correct4 ?? 1.0,
  });
  const [part3ScorePerQ, setPart3ScorePerQ] = useState<number>(
    exam?.scoringConfig?.part3ScorePerQuestion ?? 0.25
  );

  // Selected Question IDs
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    exam?.questionIds || []
  );

  // Newly imported questions from Word (to be saved to bank and added to exam)
  const [importedWordQuestions, setImportedWordQuestions] = useState<Question[]>([]);

  // Word import UI states
  const [wordInputType, setWordInputType] = useState<"FILE" | "PASTE">("FILE");
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [pastedWordText, setPastedWordText] = useState("");
  const [isWordParsing, setIsWordParsing] = useState(false);
  const [wordParseResult, setWordParseResult] = useState<{
    validQuestions: Question[];
    errors: { row: number; reason: string }[];
    totalQuestionsParsed?: number;
  } | null>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);

  // Filter state for manual question picker
  const [filterPart, setFilterPart] = useState<string>("ALL");
  const [filterLesson, setFilterLesson] = useState<string>("ALL");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Auto Matrix Generator State
  const [autoP1Count, setAutoP1Count] = useState<number>(18);
  const [autoP2Count, setAutoP2Count] = useState<number>(4);
  const [autoP3Count, setAutoP3Count] = useState<number>(6);
  const [autoLessonScope, setAutoLessonScope] = useState<"ALL_SEMESTER" | "SELECTED_LESSONS">("ALL_SEMESTER");
  const [autoSelectedLessons, setAutoSelectedLessons] = useState<string[]>([]);

  // Validation Error
  const [error, setError] = useState<string | null>(null);

  // Combined questions pool (existing questions + newly imported questions)
  const allAvailableQuestions = useMemo(() => {
    const map = new Map<string, Question>();
    questions.forEach((q) => map.set(q.id, q));
    importedWordQuestions.forEach((q) => map.set(q.id, q));
    return Array.from(map.values());
  }, [questions, importedWordQuestions]);

  // Filter available questions for manual picker
  const filteredQuestions = useMemo(() => {
    return allAvailableQuestions.filter((q) => {
      const matchPart = filterPart === "ALL" || q.part === filterPart;
      const matchLesson = filterLesson === "ALL" || q.lessonId === filterLesson;
      const matchLevel = filterLevel === "ALL" || q.level === filterLevel;
      const matchQuery =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPart && matchLesson && matchLevel && matchQuery;
    });
  }, [allAvailableQuestions, filterPart, filterLesson, filterLevel, searchQuery]);

  // Selected Questions Details
  const selectedQuestions = useMemo(() => {
    return selectedQuestionIds
      .map((id) => allAvailableQuestions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));
  }, [selectedQuestionIds, allAvailableQuestions]);

  const p1Selected = selectedQuestions.filter((q) => q.part === "PART_1");
  const p2Selected = selectedQuestions.filter((q) => q.part === "PART_2");
  const p3Selected = selectedQuestions.filter((q) => q.part === "PART_3");

  // Handle Word file upload
  const handleWordFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setWordFile(selected);
    setIsWordParsing(true);
    setError(null);

    try {
      const result = await parseWordQuestionBank(selected, lessons);
      setWordParseResult(result);

      // Auto-suggest title from filename if title is empty
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setTitle(cleanName);
      }
    } catch (err: any) {
      setError(
        "Lỗi khi đọc file Word: " +
          (err.message || "File không đúng định dạng .docx hoặc bị hỏng.")
      );
    } finally {
      setIsWordParsing(false);
    }
  };

  // Handle parse pasted text
  const handleParsePastedWordText = () => {
    if (!pastedWordText.trim()) {
      setError("Vui lòng dán văn bản câu hỏi từ Word trước khi phân tích.");
      return;
    }
    setIsWordParsing(true);
    setError(null);
    try {
      const result = parseRawTextToQuestions(pastedWordText, lessons);
      setWordParseResult(result);
    } catch (err: any) {
      setError("Lỗi phân tích văn bản: " + err.message);
    } finally {
      setIsWordParsing(false);
    }
  };

  // Apply parsed Word questions to exam
  const handleApplyWordQuestions = () => {
    if (!wordParseResult || wordParseResult.validQuestions.length === 0) {
      setError("Chưa có câu hỏi hợp lệ nào được phân tích từ file Word.");
      return;
    }

    const newQs = wordParseResult.validQuestions;
    setImportedWordQuestions((prev) => {
      const map = new Map<string, Question>();
      prev.forEach((q) => map.set(q.id, q));
      newQs.forEach((q) => map.set(q.id, q));
      return Array.from(map.values());
    });

    const newIds = newQs.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...newIds])));
    setPickMode("MANUAL");
    setError(null);
  };

  // Toggle single question selection
  const handleToggleQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedQuestionIds((prev) => [...prev, id]);
    }
  };

  // Select all in current filter
  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredQuestions.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  // Clear all selected
  const handleClearSelected = () => {
    setSelectedQuestionIds([]);
  };

  // Execute Auto Generator
  const handleGenerateMatrix = () => {
    const pool = allAvailableQuestions.filter((q) => {
      const qLesson = lessons.find((l) => l.id === q.lessonId);
      if (autoLessonScope === "ALL_SEMESTER") {
        return qLesson ? qLesson.semester === semester : true;
      } else {
        return autoSelectedLessons.includes(q.lessonId);
      }
    });

    const poolP1 = pool.filter((q) => q.part === "PART_1");
    const poolP2 = pool.filter((q) => q.part === "PART_2");
    const poolP3 = pool.filter((q) => q.part === "PART_3");

    const shuffle = (arr: Question[]): Question[] => [...arr].sort(() => Math.random() - 0.5);

    const pickedP1 = shuffle(poolP1).slice(0, autoP1Count);
    const pickedP2 = shuffle(poolP2).slice(0, autoP2Count);
    const pickedP3 = shuffle(poolP3).slice(0, autoP3Count);

    const allPicked = [...pickedP1, ...pickedP2, ...pickedP3].map((q) => q.id);
    setSelectedQuestionIds(allPicked);
    setPickMode("MANUAL");
  };

  // Submit Save
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tên đề kiểm tra.");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setError("Vui lòng chọn ít nhất 1 câu hỏi cho đề kiểm tra.");
      return;
    }

    if (durationMinutes <= 0) {
      setError("Thời gian làm bài phải lớn hơn 0 phút.");
      return;
    }

    const scoringConfig: ExamScoringConfig = {
      totalPoints,
      part1ScorePerQuestion: part1ScorePerQ,
      part2ScoringFormula: part2Formula,
      part3ScorePerQuestion: part3ScorePerQ,
    };

    const newExam: Exam = {
      id: exam?.id || `EXAM_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      semester,
      term: category.toUpperCase() || "CUSTOM",
      category,
      durationMinutes,
      totalPoints,
      scoringConfig,
      isLocked,
      allowReview,
      questionIds: selectedQuestionIds,
      createdAt: exam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newExam, importedWordQuestions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="exam-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {exam ? "Chỉnh Sửa Đề Kiểm Tra" : "Tạo Đề Kiểm Tra Mới"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tự thiết lập thời gian làm bài, ma trận điểm số và chọn câu hỏi từ ngân hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveExam} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản & Phân loại */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>1. Thông tin chung về đề kiểm tra</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tên đề kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đề kiểm tra Giữa học kì I - Môn Toán 11"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Học kì</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSemester(1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      semester === 1
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Học kì I
                  </button>
                  <button
                    type="button"
                    onClick={() => setSemester(2)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      semester === 2
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Học kì II
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Thể loại / Nhãn đề</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GIỮA KÌ">GIỮA KÌ (45 - 50 phút)</option>
                  <option value="CUỐI KÌ">CUỐI KÌ (45 - 50 phút)</option>
                  <option value="15 PHÚT">15 PHÚT (Kiểm tra thường xuyên)</option>
                  <option value="1 TIẾT">1 TIẾT (Kiểm tra định kì)</option>
                  <option value="KHẢO SÁT">KHẢO SÁT CHẤT LƯỢNG</option>
                  <option value="TỰ LUYỆN">LUYỆN TẬP TỰ DO</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Trạng thái mở đề
                </label>
                <button
                  type="button"
                  onClick={() => setIsLocked(!isLocked)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    !isLocked
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-slate-200/80 text-slate-700 border-slate-300"
                  }`}
                >
                  {!isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>Đang MỞ cho học sinh làm</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-600" />
                      <span>Đang KHÓA (Tạm ẩn)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Xem lại bài sau nộp</label>
                <button
                  type="button"
                  onClick={() => setAllowReview(!allowReview)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    allowReview
                      ? "bg-blue-50 text-blue-800 border-blue-300"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>{allowReview ? "Cho phép xem đáp án" : "Chỉ hiện điểm số"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Ghi chú / Hướng dẫn học sinh (Tùy chọn)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Đề thi tổng hợp kiến thức từ Bài 1 đến Bài 5. Học sinh không sử dụng tài liệu."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Cài đặt Thời gian & Thang điểm */}
          <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-4">
            <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>2. Cài đặt thời gian làm bài & thang điểm đánh giá</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thời gian làm bài */}
              <div className="space-y-2.5 bg-white p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Thời gian làm bài</span>
                  </label>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {durationMinutes} phút
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[15, 20, 30, 45, 50, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        durationMinutes === mins
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mins}p
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500 font-medium">Hoặc nhập số phút:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
                    className="w-20 px-2.5 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500">phút</span>
                </div>
              </div>

              {/* Thang điểm tổng */}
              <div className="space-y-2.5 bg-white p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Thang điểm tổng</span>
                  </label>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {totalPoints} điểm
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  {[10, 20, 100].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setTotalPoints(pts)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        totalPoints === pts
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Thang {pts}đ
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Hệ thống tự động quy đổi và chuẩn hóa kết quả bài làm về thang điểm đã chọn.
                </p>
              </div>
            </div>

            {/* Chi tiết phân bổ điểm 3 phần */}
            <div className="bg-white p-4 rounded-xl border border-indigo-100/80 space-y-3">
              <span className="text-xs font-extrabold text-slate-700 block">
                Phân bổ điểm số chi tiết theo từng phần thi (Chuẩn GDPT 2018):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Part 1 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-sky-800 flex items-center justify-between">
                    <span>Phần I (Nhiều lựa chọn)</span>
                    <span className="text-[11px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                      {p1Selected.length} câu
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span>Điểm / câu:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      value={part1ScorePerQ}
                      onChange={(e) => setPart1ScorePerQ(Number(e.target.value) || 0.25)}
                      className="w-16 px-1.5 py-0.5 text-center font-bold bg-white border border-slate-200 rounded"
                    />
                    <span>đ</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Ước tính: {(p1Selected.length * part1ScorePerQ).toFixed(2)}đ
                  </span>
                </div>

                {/* Part 2 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-emerald-800 flex items-center justify-between">
                    <span>Phần II (Đúng / Sai 4 ý)</span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {p2Selected.length} câu
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Đúng 1 ý: 0.10đ</span>
                      <span>Đúng 2 ý: 0.25đ</span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>Đúng 3 ý: 0.50đ</span>
                      <span>Đúng 4 ý: 1.00đ</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Ước tính tối đa: {(p2Selected.length * 1.0).toFixed(2)}đ
                  </span>
                </div>

                {/* Part 3 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-indigo-800 flex items-center justify-between">
                    <span>Phần III (Trả lời ngắn)</span>
                    <span className="text-[11px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                      {p3Selected.length} câu
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span>Điểm / câu:</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      value={part3ScorePerQ}
                      onChange={(e) => setPart3ScorePerQ(Number(e.target.value) || 0.25)}
                      className="w-16 px-1.5 py-0.5 text-center font-bold bg-white border border-slate-200 rounded"
                    />
                    <span>đ</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Ước tính: {(p3Selected.length * part3ScorePerQ).toFixed(2)}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Chọn câu hỏi cho đề */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>3. Danh sách câu hỏi trong đề ({selectedQuestionIds.length} câu đã chọn)</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickMode("WORD_IMPORT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    pickMode === "WORD_IMPORT"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải lên từ file Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickMode("MANUAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    pickMode === "MANUAL"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Chọn từng câu thủ công
                </button>
                <button
                  type="button"
                  onClick={() => setPickMode("AUTO")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    pickMode === "AUTO"
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tạo tự động theo ma trận</span>
                </button>
              </div>
            </div>

            {/* Word Import View */}
            {pickMode === "WORD_IMPORT" && (
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>NHẬP CÂU HỎI TRỰC TIẾP TỪ FILE WORD (.DOCX) HOẶC DÁN VĂN BẢN:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => generateSampleWordTemplate(lessons)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file Word mẫu</span>
                  </button>
                </div>

                {/* Switch between file upload and paste */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWordInputType("FILE")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      wordInputType === "FILE"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải file .docx</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWordInputType("PASTE")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      wordInputType === "PASTE"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Dán văn bản Word</span>
                  </button>
                </div>

                {/* Upload File Zone */}
                {wordInputType === "FILE" && (
                  <div className="space-y-3">
                    <input
                      ref={wordFileInputRef}
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleWordFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => wordFileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {wordFile ? wordFile.name : "Nhấp để chọn hoặc kéo thả file Word (.docx) vào đây"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tự động nhận diện cấu trúc đề 3 Phần: Trắc nghiệm A/B/C/D, Đúng/Sai và Trả lời ngắn
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paste Text Zone */}
                {wordInputType === "PASTE" && (
                  <div className="space-y-3">
                    <textarea
                      rows={6}
                      value={pastedWordText}
                      onChange={(e) => setPastedWordText(e.target.value)}
                      placeholder="Dán nội dung các câu hỏi từ đề kiểm tra Word vào đây... (Ví dụ: PHẦN I. CÂU HỎI TRẮC NGHIỆM... Câu 1: ... A. ... B. ... Đáp án: A)"
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParsePastedWordText}
                        disabled={isWordParsing || !pastedWordText.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Phân tích văn bản</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isWordParsing && (
                  <div className="p-4 rounded-xl bg-white border border-blue-200 text-center text-xs font-bold text-blue-700 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang đọc và phân tích cấu trúc câu hỏi từ file Word...</span>
                  </div>
                )}

                {/* Parse Results Preview */}
                {wordParseResult && (
                  <div className="bg-white p-4 rounded-2xl border border-blue-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Đã trích xuất thành công{" "}
                          <strong className="text-blue-700">
                            {wordParseResult.validQuestions.length}
                          </strong>{" "}
                          câu hỏi hợp lệ
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                          Phần I: {wordParseResult.validQuestions.filter((q) => q.part === "PART_1").length}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Phần II: {wordParseResult.validQuestions.filter((q) => q.part === "PART_2").length}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          Phần III: {wordParseResult.validQuestions.filter((q) => q.part === "PART_3").length}
                        </span>
                      </div>
                    </div>

                    {wordParseResult.errors.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Cảnh báo cấu trúc ({wordParseResult.errors.length} câu cần kiểm tra lại):</span>
                        </div>
                        <ul className="list-disc pl-5 text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                          {wordParseResult.errors.map((err, i) => (
                            <li key={i}>{err.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Preview parsed questions */}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {wordParseResult.validQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                q.part === "PART_1"
                                  ? "bg-sky-100 text-sky-800"
                                  : q.part === "PART_2"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              Câu {idx + 1} • {q.part === "PART_1" ? "Phần I" : q.part === "PART_2" ? "Phần II" : "Phần III"}
                            </span>
                            <span className="text-slate-500">[{q.level}]</span>
                            {q.answer && (
                              <span className="text-emerald-700 font-extrabold ml-auto">
                                Đ/A: {q.answer}
                              </span>
                            )}
                            {q.shortAnswer && (
                              <span className="text-emerald-700 font-extrabold ml-auto">
                                Đ/A: {q.shortAnswer} {q.unit || ""}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-900 font-semibold line-clamp-2">
                            {q.questionText}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleApplyWordQuestions}
                        className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ÁP DỤNG {wordParseResult.validQuestions.length} CÂU VÀO ĐỀ THI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auto Matrix Generator Form */}
            {pickMode === "AUTO" && (
              <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                  <Shuffle className="w-4 h-4 text-purple-700" />
                  <span>TỰ ĐỘNG BỐC ĐỀ THEO MA TRẬN SỐ LƯỢNG CÂU HỎI:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Số câu Phần I</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={autoP1Count}
                      onChange={(e) => setAutoP1Count(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">Khuyên dùng: 18 câu</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Số câu Phần II</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={autoP2Count}
                      onChange={(e) => setAutoP2Count(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">Khuyên dùng: 4 câu</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Số câu Phần III</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={autoP3Count}
                      onChange={(e) => setAutoP3Count(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">Khuyên dùng: 6 câu</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPickMode("MANUAL")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateMatrix}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tạo đề ngay bây giờ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Manual Selection View */}
            {pickMode === "MANUAL" && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm nội dung câu hỏi..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>

                  <select
                    value={filterPart}
                    onChange={(e) => setFilterPart(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700"
                  >
                    <option value="ALL">Tất cả phần thi</option>
                    <option value="PART_1">Phần I (Nhiều lựa chọn)</option>
                    <option value="PART_2">Phần II (Đúng/Sai)</option>
                    <option value="PART_3">Phần III (Trả lời ngắn)</option>
                  </select>

                  <select
                    value={filterLesson}
                    onChange={(e) => setFilterLesson(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 max-w-[180px]"
                  >
                    <option value="ALL">Tất cả bài học</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id.toUpperCase()}: {l.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700"
                  >
                    <option value="ALL">Tất cả mức độ</option>
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 cursor-pointer"
                  >
                    Chọn tất cả ({filteredQuestions.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Không tìm thấy câu hỏi phù hợp với bộ lọc.
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      const qLesson = lessons.find((l) => l.id === q.lessonId);

                      return (
                        <div
                          key={q.id}
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px] font-extrabold">
                              <span
                                className={`px-2 py-0.5 rounded-md ${
                                  q.part === "PART_1"
                                    ? "bg-sky-100 text-sky-800"
                                    : q.part === "PART_2"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-indigo-100 text-indigo-800"
                                }`}
                              >
                                {q.part === "PART_1"
                                  ? "Phần I"
                                  : q.part === "PART_2"
                                  ? "Phần II"
                                  : "Phần III"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {qLesson?.id.toUpperCase() || q.lessonId}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                {q.level}
                              </span>
                            </div>

                            <p className="text-xs text-slate-900 font-semibold line-clamp-2 leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <strong className="text-indigo-700">{selectedQuestionIds.length}</strong> câu
              hỏi • Thời lượng: <strong className="text-indigo-700">{durationMinutes}</strong> phút •
              Thang điểm: <strong className="text-indigo-700">{totalPoints}</strong>đ
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{exam ? "Lưu Thay Đổi" : "Tạo Đề Kiểm Tra"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
