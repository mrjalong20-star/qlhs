import { useState, useEffect } from "react";
import { StudentProfile, AppConfig, Lesson, Question, SubmissionResult, Exam } from "./types";
import { storageService } from "./services/storageService";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { NetworkStatusBanner } from "./components/common/NetworkStatusBanner";
import { RoleSelection } from "./components/common/RoleSelection";
import { StudentGateModal } from "./components/student/StudentGateModal";
import { LessonListView } from "./components/student/LessonListView";
import { PracticeExamsView } from "./components/student/PracticeExamsView";
import { MyResultsView } from "./components/student/MyResultsView";
import { QuizRunner } from "./components/student/QuizRunner";
import { QuizResultView } from "./components/student/QuizResultView";
import { FormulaView } from "./components/student/FormulaView";
import { FormulaManager } from "./components/admin/FormulaManager";
import { AdminLoginModal } from "./components/admin/AdminLoginModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AppsScriptGuideModal } from "./components/admin/AppsScriptGuideModal";
import { telemetryService } from "./services/telemetryService";
import { authService } from "./services/authService";
import { apiService } from "./services/apiService";

type AppView = "LESSONS" | "EXAMS" | "MY_RESULTS" | "FORMULAS" | "FORMULA_MANAGER" | "QUIZ" | "RESULT" | "ADMIN";
type UserRole = "NONE" | "TEACHER" | "STUDENT";

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("qlhs_user_role");
    if (saved === "TEACHER" || saved === "STUDENT") return saved;
    return "NONE";
  });
  const [config, setConfig] = useState<AppConfig>(() => storageService.getAppConfig());
  const [lessons, setLessons] = useState<Lesson[]>(() => storageService.getLessons());
  const [questions, setQuestions] = useState<Question[]>(() => storageService.getQuestions());
  const [submissions, setSubmissions] = useState<SubmissionResult[]>(() => storageService.getSubmissions());
  const [exams, setExams] = useState<Exam[]>(() => storageService.getExams());
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => storageService.getStudentProfile());
  const [currentView, setCurrentView] = useState<AppView>("LESSONS");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<SubmissionResult | null>(null);
  const [authSession, setAuthSession] = useState(() => authService.get());
  const isAdminAuthenticated = Boolean(authSession);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState(false);

  const handleSelectRole = (selected: "TEACHER" | "STUDENT") => {
    setRole(selected);
    localStorage.setItem("qlhs_user_role", selected);
    if (selected === "TEACHER") {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleSwitchRole = () => {
    setRole("NONE");
    localStorage.removeItem("qlhs_user_role");
    setCurrentView("LESSONS");
  };

  useEffect(() => {
    let cancelled = false;
    void storageService.loadOnlineContent().then((data) => {
      if (cancelled) return;
      if (data.lessons.length) setLessons(data.lessons);
      if (data.questions.length) setQuestions(data.questions);
      if (data.exams.length) setExams(data.exams);
    });
    return () => { cancelled = true; };
  }, [studentProfile?.classId, authSession?.token]);

  useEffect(() => {
    let cancelled = false;
    if (!studentProfile) return;
    void apiService.getAllSubmissions(config).then((all) => {
      if (cancelled) return;
      const mine = all.filter((s) =>
        String(s.studentName || "").trim().toLowerCase() === String(studentProfile.studentName || "").trim().toLowerCase()
        && String(s.className || "").trim().toLowerCase() === String(studentProfile.className || "").trim().toLowerCase()
      );
      if (mine.length) {
        setSubmissions(mine);
        mine.forEach((submission) => storageService.saveLocalSubmission(submission));
      } else {
        setSubmissions(storageService.getLocalSubmissions().filter((s) =>
          String(s.studentName || "").trim().toLowerCase() === String(studentProfile.studentName || "").trim().toLowerCase()
          && String(s.className || "").trim().toLowerCase() === String(studentProfile.className || "").trim().toLowerCase()
        ));
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [studentProfile?.studentName, studentProfile?.className, studentProfile?.classId, config.googleAppsScriptUrl]);

  useEffect(() => {
    const openFormulas = () => setCurrentView("FORMULAS");
    window.addEventListener("open-formulas", openFormulas);
    return () => window.removeEventListener("open-formulas", openFormulas);
  }, []);

  useEffect(() => {
    if (!studentProfile) return;
    const getActivity = () => currentView === "QUIZ" ? "EXAM" as const : ["LESSONS", "EXAMS"].includes(currentView) ? "LEARNING" as const : "IDLE" as const;
    const send = () => telemetryService.heartbeat(studentProfile, getActivity());
    send(); const timer = window.setInterval(send, 30000); return () => window.clearInterval(timer);
  }, [studentProfile, currentView]);

  const [pendingLessonToStart, setPendingLessonToStart] = useState<{ lesson: Lesson; questions?: Question[]; isRetake?: boolean } | null>(null);
  const [isActiveLessonRetake, setIsActiveLessonRetake] = useState(false);
  const handleSaveStudentProfile = (profile: StudentProfile) => { storageService.saveStudentProfile(profile); setStudentProfile(profile); setIsStudentModalOpen(false); if (pendingLessonToStart) { startQuizSession(pendingLessonToStart.lesson, pendingLessonToStart.questions, pendingLessonToStart.isRetake); setPendingLessonToStart(null); } };
  const startQuizSession = (lesson: Lesson, customQuestions?: Question[], isRetake = false) => { if (!studentProfile) { setPendingLessonToStart({ lesson, questions: customQuestions, isRetake }); setIsStudentModalOpen(true); return; } const quizQuestions = customQuestions || questions.filter(q => q.lessonId === lesson.id); if (!quizQuestions.length) { alert(`Bài học "${lesson.title}" hiện chưa có câu hỏi nào trong ngân hàng.`); return; } if (isRetake) storageService.clearActiveDraft(lesson.id); setIsActiveLessonRetake(isRetake); setActiveLesson(lesson); setActiveQuizQuestions(quizQuestions); setCurrentView("QUIZ"); window.scrollTo({top:0,behavior:"smooth"}); };
  const handleFinishQuiz = (result: SubmissionResult) => { setLatestResult(result); setSubmissions(prev => { const next=[result,...prev.filter(x=>x.attemptId!==result.attemptId)]; return next; }); setCurrentView("RESULT"); window.scrollTo({top:0,behavior:"smooth"}); };
  const handleNavigate = (view: AppView) => {
    if (view === "ADMIN" || view === "FORMULA_MANAGER") {
      if (!isAdminAuthenticated) { setIsAdminLoginModalOpen(true); return; }
      setCurrentView(view);
    } else setCurrentView(view);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const handleUpdateLesson = (updatedLesson: Lesson) => { setLessons(lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l)); void storageService.syncLessons([updatedLesson]).catch(console.error); };
  const handleBatchUpdateLessons = (updatedLessons: Lesson[]) => { setLessons(updatedLessons); void storageService.syncLessons(updatedLessons).catch(console.error); };
  const handleAddQuestion = (newQuestion: Question) => { setQuestions([newQuestion,...questions]); void storageService.syncQuestions([newQuestion]).catch(console.error); };
  const handleUpdateQuestion = (updatedQuestion: Question) => { setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)); void storageService.syncQuestions([updatedQuestion]).catch(console.error); };
  const handleDeleteQuestion = (id:string) => { setQuestions(questions.filter(q=>q.id!==id)); void storageService.deleteQuestion(id).catch(console.error); };
  const handleBulkImportQuestions = (newQuestions:Question[], mode:"MERGE"|"REPLACE") => { const existing=new Set(questions.map(q=>q.id)); const finalQuestions=mode === "REPLACE" ? newQuestions : [...questions,...newQuestions.filter(q=>!existing.has(q.id))]; setQuestions(finalQuestions); void storageService.syncQuestions(finalQuestions).catch(console.error); };
  const handleSaveExam = (exam:Exam,newQuestions?:Question[]) => { if(newQuestions?.length){const existing=new Set(questions.map(q=>q.id));const filtered=newQuestions.filter(q=>!existing.has(q.id));if(filtered.length){setQuestions([...questions,...filtered]);void storageService.syncQuestions(filtered).catch(console.error);}}const updated=exams.some(e=>e.id===exam.id)?exams.map(e=>e.id===exam.id?exam:e):[exam,...exams];setExams(updated);void storageService.syncExams([exam]).catch(console.error);};
  const handleDeleteExam=(examId:string)=>{setExams(exams.filter(e=>e.id!==examId));void storageService.deleteExam(examId).catch(console.error);};
  const handleToggleLockExam=(examId:string)=>{const updated=exams.map(e=>e.id===examId?{...e,isLocked:!e.isLocked}:e);setExams(updated);const exam=updated.find(e=>e.id===examId);if(exam)void storageService.syncExams([exam]).catch(()=>undefined);};
  const handlePreviewExam=(exam:Exam)=>{const qs=exam.questionIds.map(id=>questions.find(q=>q.id===id)).filter((q):q is Question=>Boolean(q));const examAsLesson:Lesson={id:exam.id,lessonNumber:0,title:exam.title,chapter:`Đề thi định kì • Học kì ${exam.semester}`,semester:exam.semester,durationMinutes:exam.durationMinutes,totalPoints:exam.totalPoints||10,scoringConfig:exam.scoringConfig,allowReview:exam.allowReview??true,reviewMode:exam.allowReview?"FULL":"SCORE_ONLY",grade:exam.grade};startQuizSession(examAsLesson,qs);};
  const handleSaveConfig=(newConfig:AppConfig)=>{storageService.saveAppConfig(newConfig);setConfig(newConfig);};
  const handleRestoreBackup=(data:{questions:Question[];lessons:Lesson[];config:AppConfig})=>{setQuestions(data.questions);setLessons(data.lessons);setConfig(data.config);void storageService.syncQuestions(data.questions);void storageService.syncLessons(data.lessons);};
  const handleResetFactory=()=>{storageService.resetToInitialSeed();setConfig(storageService.getAppConfig());setLessons(storageService.getLessons());setQuestions(storageService.getQuestions());setExams(storageService.getExams());setSubmissions(storageService.getSubmissions());};
  const handleAdminLogout=async()=>{await authService.logout();setAuthSession(null);setCurrentView("LESSONS");};

  // ─── Role Selection Screen ─────────────────────────────────────────────
  if (role === "NONE") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <NetworkStatusBanner />
        <RoleSelection config={config} onSelectRole={handleSelectRole} />
      </div>
    );
  }

  // ─── Teacher Interface ──────────────────────────────────────────────────
  if (role === "TEACHER") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <NetworkStatusBanner />
        <Header
          config={config}
          studentProfile={null}
          currentView={currentView}
          onOpenStudentGate={() => {}}
          onStudentLogout={() => {}}
          onOpenAdminLogin={() => isAdminAuthenticated ? setCurrentView("ADMIN") : setIsAdminLoginModalOpen(true)}
          onNavigate={handleNavigate}
          isAdmin={isAdminAuthenticated}
          authSession={authSession}
          onLogout={handleAdminLogout}
          onSwitchRole={handleSwitchRole}
          userRole="TEACHER"
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {currentView === "ADMIN" && isAdminAuthenticated && (
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
          {currentView === "FORMULA_MANAGER" && isAdminAuthenticated && <FormulaManager />}
          {currentView === "LESSONS" && !isAdminAuthenticated && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm">Vui lòng đăng nhập để truy cập khu vực quản trị.</p>
            </div>
          )}
          {currentView === "LESSONS" && isAdminAuthenticated && (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg font-semibold">Chào mừng Giáo viên!</p>
              <p className="text-slate-500 text-sm mt-2">Sử dụng menu quản trị để quản lý lớp học và đề thi.</p>
            </div>
          )}
        </main>
        <Footer config={config} onOpenTeacherAdmin={() => isAdminAuthenticated ? setCurrentView("ADMIN") : setIsAdminLoginModalOpen(true)} onOpenGasGuide={() => setIsGasGuideOpen(true)} />
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={() => { setAuthSession(authService.get()); setCurrentView("ADMIN"); }}
          config={config}
        />
        <AppsScriptGuideModal isOpen={isGasGuideOpen} onClose={() => setIsGasGuideOpen(false)} config={config} onSaveGasUrl={url => handleSaveConfig({ ...config, googleAppsScriptUrl: url })} />
      </div>
    );
  }

  // ─── Student Interface ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <NetworkStatusBanner />
      <Header
        config={config}
        studentProfile={studentProfile}
        currentView={currentView}
        onOpenStudentGate={() => setIsStudentModalOpen(true)}
        onStudentLogout={() => { storageService.clearStudentProfile(); localStorage.removeItem("geo11_student_session_id"); setStudentProfile(null); setCurrentView("LESSONS"); }}
        onOpenAdminLogin={() => {}}
        onNavigate={handleNavigate}
        isAdmin={false}
        authSession={null}
        onLogout={() => {}}
        onSwitchRole={handleSwitchRole}
        userRole="STUDENT"
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentView === "LESSONS" && <LessonListView lessons={lessons} questions={questions} submissions={submissions} student={studentProfile} onStartLesson={(lesson, retake) => startQuizSession(lesson, undefined, retake)} onOpenStudentModal={() => setIsStudentModalOpen(true)} />}
        {currentView === "EXAMS" && <PracticeExamsView exams={exams} questions={questions} student={studentProfile} isAdmin={false} onStartExam={(lesson, qs) => startQuizSession(lesson, qs, true)} onOpenStudentModal={() => setIsStudentModalOpen(true)} onOpenAdminExamManager={() => {}} />}
        {currentView === "MY_RESULTS" && <MyResultsView student={studentProfile} lessons={lessons} submissions={submissions} onRetakeLesson={lesson => startQuizSession(lesson, undefined, true)} onOpenStudentModal={() => setIsStudentModalOpen(true)} />}
        {currentView === "FORMULAS" && <FormulaView student={studentProfile} />}
        {currentView === "QUIZ" && activeLesson && <QuizRunner lesson={activeLesson} questions={activeQuizQuestions} student={studentProfile || { studentName: "Học sinh", className: "", dateOfBirth: "", grade: 6 }} config={config} isRetake={isActiveLessonRetake} onFinishQuiz={handleFinishQuiz} onCancelQuiz={() => setCurrentView("LESSONS")} />}
        {currentView === "RESULT" && latestResult && <QuizResultView result={latestResult} lesson={lessons.find(l => l.id === latestResult.lessonId)} questions={questions} onRetake={() => { const l = lessons.find(x => x.id === latestResult.lessonId); if (l) startQuizSession(l, activeQuizQuestions, true); }} onBackToLessons={() => setCurrentView("LESSONS")} onGoToMyResults={() => setCurrentView("MY_RESULTS")} />}
      </main>
      <Footer config={config} onOpenTeacherAdmin={() => {}} />
      <StudentGateModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onSave={handleSaveStudentProfile} currentProfile={studentProfile} config={config} />
    </div>
  );
}
