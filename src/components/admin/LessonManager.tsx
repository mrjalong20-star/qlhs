import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, Clock, Layers, CheckCircle2, Shield } from "lucide-react";
import { Lesson, Question } from "../../types";

interface LessonManagerProps {
  lessons: Lesson[];
  questions: Question[];
  onUpdateLesson: (updated: Lesson) => void;
  onBatchUpdateLessons: (updatedList: Lesson[]) => void;
}

export function LessonManager({
  lessons,
  questions,
  onUpdateLesson,
  onBatchUpdateLessons,
}: LessonManagerProps) {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  const semesterLessons = lessons.filter((l) => l.semester === selectedSemester);

  const handleToggleLock = (lesson: Lesson) => {
    onUpdateLesson({
      ...lesson,
      isLocked: !lesson.isLocked,
    });
  };

  const handleToggleHide = (lesson: Lesson) => {
    onUpdateLesson({
      ...lesson,
      isHidden: !lesson.isHidden,
    });
  };

  const handleLockAllSemester = (lock: boolean) => {
    const updated = lessons.map((l) =>
      l.semester === selectedSemester ? { ...l, isLocked: lock } : l
    );
    onBatchUpdateLessons(updated);
  };

  return (
    <div id="lesson-manager" className="space-y-6">
      {/* Header & Batch Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Quản Lý Bài Học & Cấu Hình Mở Khóa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chủ động khóa/mở bài học theo tiến độ giảng dạy trên lớp của giáo viên
          </p>
        </div>

        {/* Batch buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLockAllSemester(false)}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Mở tất cả HK{selectedSemester}</span>
          </button>

          <button
            onClick={() => handleLockAllSemester(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Khóa tất cả HK{selectedSemester}</span>
          </button>
        </div>
      </div>

      {/* Semester Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto self-start inline-flex">
        <button
          onClick={() => setSelectedSemester(1)}
          className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedSemester === 1
              ? "bg-white text-sky-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          HỌC KÌ I (Bài 1 - Bài 14)
        </button>
        <button
          onClick={() => setSelectedSemester(2)}
          className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedSemester === 2
              ? "bg-white text-sky-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          HỌC KÌ II (Bài 15 - Bài 32)
        </button>
      </div>

      {/* Lessons List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Bài số</th>
                <th className="px-4 py-3">Tên bài học SGK</th>
                <th className="px-4 py-3">Chương / Chủ đề</th>
                <th className="px-4 py-3 text-center">Số câu hỏi</th>
                <th className="px-4 py-3 text-center">Thời lượng</th>
                <th className="px-4 py-3 text-center">Trạng thái khóa</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {semesterLessons.map((lesson) => {
                const lessonQuestions = questions.filter((q) => q.lessonId === lesson.id);

                return (
                  <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      Bài {lesson.lessonNumber < 10 ? `0${lesson.lessonNumber}` : lesson.lessonNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 text-sm">{lesson.title}</p>
                      <span className="text-[11px] font-mono text-slate-400">ID: {lesson.id}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {lesson.chapter}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                          lessonQuestions.length > 0
                            ? "bg-sky-100 text-sky-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {lessonQuestions.length} câu
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center text-slate-600">
                      <div className="inline-flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lesson.durationMinutes || 15} phút</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          lesson.isLocked
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {lesson.isLocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            Đang khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            Đang mở
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleLock(lesson)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                            lesson.isLocked
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {lesson.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{lesson.isLocked ? "Mở khóa" : "Khóa"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
