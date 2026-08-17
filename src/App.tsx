import { useState, useEffect } from "react";
import {
  StudentProfile,
  AppConfig,
  Lesson,
  Question,
  SubmissionResult,
  Exam,
} from "./types";
import { storageService } from "./services/storageService";
import { mockExams } from "./data/mockExams";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { NetworkStatusBanner } from "./components/common/NetworkStatusBanner";
import { StudentGateModal } from "./components/student/StudentGateModal";
import { LessonListView } from "./components/student/LessonListView";
import { PracticeExamsView } from "./components/student/PracticeExamsView";
import { MyResultsView } from "./components/student/MyResultsView";
import { QuizRunner } from "./components/student/QuizRunner";
import { QuizResultView } from "./components/student/QuizResultView";
import { AdminLoginModal } from "./components/admin/AdminLoginModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AppsScriptGuideModal } from "./components/admin/AppsScriptGuideModal";
import { telemetryService } from "./services/telemetryService";
import { authService } from "./services/authService";

type AppView = "LESSONS" | "EXAMS" | "MY_RESULTS" | "QUIZ" | "RESULT" | "ADMIN";

export default function App() {
  // App data state
  const [config, setConfig] = useState<AppConfig>(() => storageService.getAppConfig());
  const [lessons, setLessons] = useState<Lesson[]>(() => storageService.getLessons());
  const [questions, setQuestions] = useState<Question[]>(() => storageService.getQuestions());
  const [submissions, setSubmissions] = useState<SubmissionResult[]>(() =>
    storageService.getSubmissions()
  );
  const [exams, setExams] = useState<Exam[]>(() => storageService.getExams());

  // Student Profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() =>
    storageService.getStudentProfile()
  );

  // View state
  const [currentView, setCurrentView] = useState<AppView>("LESSONS");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<SubmissionResult | null>(null);

  // Admin auth state
  const [authSession, setAuthSession] = useState(() => authService.get());
  const isAdminAuthenticated = Boolean(authSession);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState(false);

  // Real-time student presence tracking. Heartbeats are lightweight and never block learning.
  useEffect(() => {
    if (!studentProfile) return;
    const getActivity = () => {
      if (currentView === "QUIZ") return "EXAM" as const;
      if (["LESSONS", "EXAMS"].includes(currentView)) return "LEARNING" as const;
      return "IDLE" as const;
    };
    const send = () => telemetryService.heartbeat(studentProfile, getActivity());
    send();
    const timer = window.setInterval(send, 30000);
    return () => window.clearInterval(timer);
  }, [studentProfile, currentView]);

  // Pending action when opening student gate
  const [pendingLessonToStart, setPendingLessonToStart] = useState<{
    lesson: Lesson;
    questions?: Question[];
    isRetake?: boolean;
  } | null>(null);
  const [isActiveLessonRetake, setIsActiveLessonRetake] = useState(false);

  // Keep state synced with localStorage
  const handleSaveStudentProfile = (profile: StudentProfile) => {
    storageService.saveStudentProfile(profile);
    setStudentProfile(profile);
    setIsStudentModalOpen(false);

    // If student opened modal while trying to start a lesson, launch it
    if (pendingLessonToStart) {
      startQuizSession(
        pendingLessonToStart.lesson,
        pendingLessonToStart.questions,
        pendingLessonToStart.isRetake
      );
      setPendingLessonToStart(null);
    }
  };

  // Start a lesson or exam quiz session
  const startQuizSession = (
    lesson: Lesson,
    customQuestions?: Question[],
    isRetake = false
  ) => {
    if (!studentProfile) {
      setPendingLessonToStart({ lesson, questions: customQuestions, isRetake });
      setIsStudentModalOpen(true);
      return;
    }

    const quizQuestions =
      customQuestions || questions.filter((q) => q.lessonId === lesson.id);

    if (quizQuestions.length === 0) {
      alert(
        `Bài học "${lesson.title}" hiện chưa có câu hỏi nào trong ngân hàng. Giáo viên có thể thêm câu hỏi trong khu vực Quản trị.`
      );
      return;
    }

    // When starting a clean retake, clear any previous active draft
    if (isRetake) {
      storageService.clearActiveDraft(lesson.id);
    }

    setIsActiveLessonRetake(isRetake);
    setActiveLesson(lesson);
    setActiveQuizQuestions(quizQuestions);
    setCurrentView("QUIZ");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Finish Quiz and transition to Result view
  const handleFinishQuiz = (result: SubmissionResult) => {
    setLatestResult(result);
    // Refresh submissions list from storage
    setSubmissions(storageService.getSubmissions());
    setCurrentView("RESULT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigation handlers
  const handleNavigate = (view: AppView) => {
    if (view === "ADMIN") {
      if (isAdminAuthenticated) {
        setCurrentView("ADMIN");
      } else {
        setIsAdminLoginModalOpen(true);
      }
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Admin Data mutations
  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const updated = lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
    storageService.saveLessons(updated);
    setLessons(updated);
  };

  const handleBatchUpdateLessons = (updatedLessons: Lesson[]) => {
    storageService.saveLessons(updatedLessons);
    setLessons(updatedLessons);
  };

  const handleAddQuestion = (newQuestion: Question) => {
    const updated = [newQuestion, ...questions];
    storageService.saveQuestions(updated);
    setQuestions(updated);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    const updated = questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q));
    storageService.saveQuestions(updated);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    storageService.saveQuestions(updated);
    setQuestions(updated);
  };

  const handleBulkImportQuestions = (
    newQuestions: Question[],
    mode: "MERGE" | "REPLACE"
  ) => {
    let finalQuestions: Question[] = [];
    if (mode === "REPLACE") {
      finalQuestions = newQuestions;
    } else {
      const existingIds = new Set(questions.map((q) => q.id));
      const filteredNew = newQuestions.filter((q) => !existingIds.has(q.id));
      finalQuestions = [...questions, ...filteredNew];
    }
    storageService.saveQuestions(finalQuestions);
    setQuestions(finalQuestions);
  };

  const handleSaveExam = (exam: Exam, newQuestions?: Question[]) => {
    // If there are newly imported questions from Word, add them to the question bank
    if (newQuestions && newQuestions.length > 0) {
      const existingIds = new Set(questions.map((q) => q.id));
      const filteredNew = newQuestions.filter((q) => !existingIds.has(q.id));
      if (filteredNew.length > 0) {
        const mergedQuestions = [...questions, ...filteredNew];
        storageService.saveQuestions(mergedQuestions);
        setQuestions(mergedQuestions);
      }
    }

    const exists = exams.some((e) => e.id === exam.id);
    let updated: Exam[];
    if (exists) {
      updated = exams.map((e) => (e.id === exam.id ? exam : e));
    } else {
      updated = [exam, ...exams];
    }
    storageService.saveExams(updated);
    setExams(updated);
  };

  const handleDeleteExam = (examId: string) => {
    const updated = exams.filter((e) => e.id !== examId);
    storageService.saveExams(updated);
    setExams(updated);
  };

  const handleToggleLockExam = (examId: string) => {
    const updated = exams.map((e) =>
      e.id === examId ? { ...e, isLocked: !e.isLocked } : e
    );
    storageService.saveExams(updated);
    setExams(updated);
  };

  const handlePreviewExam = (exam: Exam) => {
    const examQuestions = exam.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

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

    startQuizSession(examAsLesson, examQuestions);
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    storageService.saveAppConfig(newConfig);
    setConfig(newConfig);
  };

  const handleRestoreBackup = (data: {
    questions: Question[];
    lessons: Lesson[];
    config: AppConfig;
  }) => {
    storageService.saveQuestions(data.questions);
    storageService.saveLessons(data.lessons);
    storageService.saveAppConfig(data.config);
    setQuestions(data.questions);
    setLessons(data.lessons);
    setConfig(data.config);
  };

  const handleResetFactory = () => {
    storageService.resetToInitialSeed();
    setConfig(storageService.getAppConfig());
    setLessons(storageService.getLessons());
    setQuestions(storageService.getQuestions());
    setExams(storageService.getExams());
    setSubmissions(storageService.getSubmissions());
  };

  const handleAdminLogout = async () => {
    await authService.logout();
    setAuthSession(null);
    setCurrentView("LESSONS");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Offline sync alert if any */}
      <NetworkStatusBanner />

      {/* Main Header */}
      <Header
        config={config}
        studentProfile={studentProfile}
        currentView={currentView}
        onOpenStudentGate={() => setIsStudentModalOpen(true)}
        onStudentLogout={() => {
          storageService.clearStudentProfile();
          localStorage.removeItem("geo11_student_session_id");
          setStudentProfile(null);
          setCurrentView("LESSONS");
        }}
        onOpenAdminLogin={() => {
          if (isAdminAuthenticated) {
            setCurrentView("ADMIN");
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
        onNavigate={handleNavigate}
        isAdmin={isAdminAuthenticated}
        authSession={authSession}
        onLogout={handleAdminLogout}
      />

      {/* Body Content Router */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* VIEW 1: LESSONS LIST (STUDENT DASHBOARD) */}
        {currentView === "LESSONS" && (
          <LessonListView
            lessons={lessons}
            questions={questions}
            submissions={submissions}
            student={studentProfile}
            onStartLesson={(lesson, isRetake) => startQuizSession(lesson, undefined, isRetake)}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {/* VIEW 2: PRACTICE EXAMS */}
        {currentView === "EXAMS" && (
          <PracticeExamsView
            exams={exams}
            questions={questions}
            student={studentProfile}
            isAdmin={isAdminAuthenticated}
            onStartExam={(examLesson, examQuestions) =>
              startQuizSession(examLesson, examQuestions, true)
            }
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
            onOpenAdminExamManager={() => setCurrentView("ADMIN")}
          />
        )}

        {/* VIEW 3: MY RESULTS */}
        {currentView === "MY_RESULTS" && (
          <MyResultsView
            student={studentProfile}
            lessons={lessons}
            submissions={submissions}
            onRetakeLesson={(lesson) => startQuizSession(lesson, undefined, true)}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {/* VIEW 4: QUIZ RUNNER (INTERACTIVE EXAM) */}
        {currentView === "QUIZ" && activeLesson && (
          <QuizRunner
            key={`${activeLesson.id}-${isActiveLessonRetake ? "retake" : "normal"}`}
            lesson={activeLesson}
            questions={activeQuizQuestions}
            student={
              studentProfile || {
                studentName: "Học sinh",
                className: "11A1",
                dateOfBirth: "",
              }
            }
            config={config}
            isRetake={isActiveLessonRetake}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={() => setCurrentView("LESSONS")}
          />
        )}

        {/* VIEW 5: QUIZ RESULT */}
        {currentView === "RESULT" && latestResult && (
          <QuizResultView
            result={latestResult}
            lesson={lessons.find((l) => l.id === latestResult.lessonId)}
            questions={questions}
            onRetake={() => {
              const lesson = lessons.find((l) => l.id === latestResult.lessonId);
              if (lesson) startQuizSession(lesson, activeQuizQuestions, true);
            }}
            onBackToLessons={() => setCurrentView("LESSONS")}
            onGoToMyResults={() => setCurrentView("MY_RESULTS")}
          />
        )}

        {/* VIEW 6: TEACHER ADMIN DASHBOARD */}
        {currentView === "ADMIN" && (
          <AdminDashboard
            questions={questions}
            lessons={lessons}
            exams={exams}
            submissions={submissions}
            config={config}
            onUpdateLesson={handleUpdateLesson}
            onBatchUpdateLessons={handleBatchUpdateLessons}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onBulkImportQuestions={handleBulkImportQuestions}
            onSaveExam={handleSaveExam}
            onDeleteExam={handleDeleteExam}
            onToggleLockExam={handleToggleLockExam}
            onPreviewExam={handlePreviewExam}
            onSaveConfig={handleSaveConfig}
            onRestoreBackup={handleRestoreBackup}
            onResetFactory={handleResetFactory}
            onLogout={handleAdminLogout}
            role={authSession?.role || "TEACHER"}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        config={config}
        onOpenTeacherAdmin={() => {
          if (isAdminAuthenticated) {
            setCurrentView("ADMIN");
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
        onOpenGasGuide={() => setIsGasGuideOpen(true)}
      />

      {/* Student Identification Modal */}
      <StudentGateModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudentProfile}
        currentProfile={studentProfile}
        config={config}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setAuthSession(authService.get());
          setCurrentView("ADMIN");
        }}
        config={config}
      />

      {/* Quick Access Google Apps Script Guide Modal */}
      <AppsScriptGuideModal
        isOpen={isGasGuideOpen}
        onClose={() => setIsGasGuideOpen(false)}
        config={config}
        onSaveGasUrl={(url) => {
          handleSaveConfig({ ...config, googleAppsScriptUrl: url });
        }}
      />
    </div>
  );
}
