import { useState, useEffect, type FormEvent } from "react";
import { X, Plus, Trash2, CheckCircle2, HelpCircle, Image, Sparkles } from "lucide-react";
import { Question, Lesson, QuestionPart, KnowledgeLevel } from "../../types";

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  initialQuestion?: Question | null;
  defaultLessonId?: string;
  onSave: (question: Question) => void;
}

export function QuestionEditorModal({
  isOpen,
  onClose,
  lessons,
  initialQuestion,
  defaultLessonId,
  onSave,
}: QuestionEditorModalProps) {
  const [lessonId, setLessonId] = useState<string>("");
  const [part, setPart] = useState<QuestionPart>("PART_1");
  const [level, setLevel] = useState<KnowledgeLevel>("Thông hiểu");
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [source, setSource] = useState("");
  const [explanation, setExplanation] = useState("");

  // Part 1
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");

  // Part 2
  const [subA, setSubA] = useState({ text: "", isTrue: true });
  const [subB, setSubB] = useState({ text: "", isTrue: false });
  const [subC, setSubC] = useState({ text: "", isTrue: true });
  const [subD, setSubD] = useState({ text: "", isTrue: false });

  // Part 3
  const [part3Correct, setPart3Correct] = useState("");
  const [unit, setUnit] = useState("");
  const [acceptedAnswersText, setAcceptedAnswersText] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialQuestion) {
      setLessonId(initialQuestion.lessonId);
      setPart(initialQuestion.part);
      setLevel(initialQuestion.level);
      setQuestionText(initialQuestion.questionText);
      setImageUrl(initialQuestion.imageUrl || "");
      setSource(initialQuestion.source || "");
      setExplanation(initialQuestion.explanation || "");

      if (initialQuestion.part === "PART_1") {
        setOptionA(initialQuestion.optionA || "");
        setOptionB(initialQuestion.optionB || "");
        setOptionC(initialQuestion.optionC || "");
        setOptionD(initialQuestion.optionD || "");
        setCorrectOption(initialQuestion.answer || initialQuestion.correctOption || "A");
      } else if (initialQuestion.part === "PART_2") {
        const subs = initialQuestion.subAnswers || [];
        setSubA({ text: subs.find((s) => s.id === "a")?.statement || "", isTrue: subs.find((s) => s.id === "a")?.correctAnswer ?? true });
        setSubB({ text: subs.find((s) => s.id === "b")?.statement || "", isTrue: subs.find((s) => s.id === "b")?.correctAnswer ?? false });
        setSubC({ text: subs.find((s) => s.id === "c")?.statement || "", isTrue: subs.find((s) => s.id === "c")?.correctAnswer ?? true });
        setSubD({ text: subs.find((s) => s.id === "d")?.statement || "", isTrue: subs.find((s) => s.id === "d")?.correctAnswer ?? false });
      } else if (initialQuestion.part === "PART_3") {
        setPart3Correct(initialQuestion.shortAnswer || initialQuestion.correctAnswerText || "");
        setUnit(initialQuestion.unit || "");
        const accepted = initialQuestion.acceptableAnswers || initialQuestion.acceptedAnswers || [];
        setAcceptedAnswersText(accepted.join(", "));
      }
    } else {
      setLessonId(defaultLessonId || lessons[0]?.id || "bai-01");
      setPart("PART_1");
      setLevel("Thông hiểu");
      setQuestionText("");
      setImageUrl("");
      setSource("");
      setExplanation("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectOption("A");
      setSubA({ text: "", isTrue: true });
      setSubB({ text: "", isTrue: false });
      setSubC({ text: "", isTrue: true });
      setSubD({ text: "", isTrue: false });
      setPart3Correct("");
      setUnit("");
      setAcceptedAnswersText("");
    }
  }, [initialQuestion, defaultLessonId, lessons, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    if (!lessonId) {
      setError("Vui lòng chọn bài học");
      return;
    }

    const newId = initialQuestion ? initialQuestion.id : `Q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const baseQuestion: Partial<Question> = {
      id: newId,
      lessonId,
      part,
      level,
      questionText: questionText.trim(),
      explanation: explanation.trim(),
      imageUrl: imageUrl.trim() || undefined,
      source: source.trim() || undefined,
      chart: initialQuestion?.chart,
      dataTable: initialQuestion?.dataTable,
    };

    if (part === "PART_1") {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        setError("Vui lòng nhập đầy đủ 4 phương án A, B, C, D");
        return;
      }
      baseQuestion.optionA = optionA.trim();
      baseQuestion.optionB = optionB.trim();
      baseQuestion.optionC = optionC.trim();
      baseQuestion.optionD = optionD.trim();
      baseQuestion.answer = correctOption;
      baseQuestion.correctOption = correctOption;
    } else if (part === "PART_2") {
      if (!subA.text.trim() || !subB.text.trim() || !subC.text.trim() || !subD.text.trim()) {
        setError("Vui lòng nhập đầy đủ nội dung cho cả 4 nhận định a, b, c, d");
        return;
      }
      baseQuestion.subAnswers = [
        { id: "a", statement: subA.text.trim(), correctAnswer: subA.isTrue },
        { id: "b", statement: subB.text.trim(), correctAnswer: subB.isTrue },
        { id: "c", statement: subC.text.trim(), correctAnswer: subC.isTrue },
        { id: "d", statement: subD.text.trim(), correctAnswer: subD.isTrue },
      ];
    } else if (part === "PART_3") {
      if (!part3Correct.trim()) {
        setError("Vui lòng nhập đáp án chuẩn phần trả lời ngắn");
        return;
      }
      const acceptedList = acceptedAnswersText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (!acceptedList.includes(part3Correct.trim())) {
        acceptedList.push(part3Correct.trim());
      }
      baseQuestion.shortAnswer = part3Correct.trim();
      baseQuestion.correctAnswerText = part3Correct.trim();
      baseQuestion.unit = unit.trim() || undefined;
      baseQuestion.acceptableAnswers = acceptedList;
      baseQuestion.acceptedAnswers = acceptedList;
    }

    setError("");
    onSave(baseQuestion as Question);
    onClose();
  };

  return (
    <div
      id="question-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {initialQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới"}
            </h2>
            <p className="text-xs text-slate-400">
              Điền thông tin và cấu hình đáp án chuẩn GDPT 2018
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Lesson, Part, Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bài học
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    Bài {l.lessonNumber}. {l.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phần trắc nghiệm
              </label>
              <select
                value={part}
                onChange={(e) => setPart(e.target.value as QuestionPart)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 font-bold text-sky-800"
              >
                <option value="PART_1">Phần I: Nhiều lựa chọn</option>
                <option value="PART_2">Phần II: Đúng / Sai</option>
                <option value="PART_3">Phần III: Trả lời ngắn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mức độ nhận thức
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as KnowledgeLevel)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="NHAN_BIET">Nhận biết</option>
                <option value="THONG_HIEU">Thông hiểu</option>
                <option value="VAN_DUNG">Vận dụng</option>
                <option value="VAN_DUNG_CAO">Vận dụng cao</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nội dung câu hỏi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập nội dung câu hỏi hoặc lời dẫn..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          {/* Optional Image and Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                URL Hình ảnh / Biểu đồ (tùy chọn)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nguồn trích dẫn (tùy chọn)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ví dụ: Đề kiểm tra Toán 11 kỳ I, Swift Code 50024"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* PART 1 SPECIFIC FIELDS */}
          {part === "PART_1" && (
            <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-3">
              <span className="block text-xs font-bold text-sky-900 uppercase">
                4 Phương án lựa chọn & Chọn đáp án đúng:
              </span>

              <div className="space-y-2">
                {[
                  { key: "A", val: optionA, setVal: setOptionA },
                  { key: "B", val: optionB, setVal: setOptionB },
                  { key: "C", val: optionC, setVal: setOptionC },
                  { key: "D", val: optionD, setVal: setOptionD },
                ].map(({ key, val, setVal }) => (
                  <div key={key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectOption(key as any)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                        correctOption === key
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {key}
                    </button>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={`Nội dung phương án ${key}...`}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PART 2 SPECIFIC FIELDS */}
          {part === "PART_2" && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-3">
              <span className="block text-xs font-bold text-emerald-900 uppercase">
                4 Nhận định Đúng / Sai (a, b, c, d):
              </span>

              {[
                { id: "a", sub: subA, setSub: setSubA },
                { id: "b", sub: subB, setSub: setSubB },
                { id: "c", sub: subC, setSub: setSubC },
                { id: "d", sub: subD, setSub: setSubD },
              ].map(({ id, sub, setSub }) => (
                <div key={id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {id})
                  </span>
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => setSub({ ...sub, text: e.target.value })}
                    placeholder={`Nhận định ${id}...`}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSub({ ...sub, isTrue: true })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        sub.isTrue
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      ĐÚNG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSub({ ...sub, isTrue: false })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        !sub.isTrue
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      SAI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PART 3 SPECIFIC FIELDS */}
          {part === "PART_3" && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
              <span className="block text-xs font-bold text-indigo-950 uppercase">
                Cấu hình đáp án trả lời ngắn:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Đáp án chuẩn:
                  </label>
                  <input
                    type="text"
                    value={part3Correct}
                    onChange={(e) => setPart3Correct(e.target.value)}
                    placeholder="Ví dụ: 12.5"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Đơn vị tính (nếu có):
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ví dụ: cm, m, %, độ..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Các định dạng chấp nhận thêm (phân cách bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={acceptedAnswersText}
                  onChange={(e) => setAcceptedAnswersText(e.target.value)}
                  placeholder="Ví dụ: 12.5, 12,5, 13"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-700"
                />
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Hướng dẫn giải / Lời giải chi tiết / Công thức:
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Nhập công thức tính, số liệu đối chiếu hoặc giải thích đáp án..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btn-save-question-submit"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md cursor-pointer"
            >
              LƯU CÂU HỎI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
