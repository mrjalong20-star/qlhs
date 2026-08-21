import { useState, useEffect } from "react";
import { StudentProfile, AppConfig, Lesson, Question, SubmissionResult, Exam, Assignment } from "./types";
import { storageService } from "./services/storageService";
import { Header } from "./components/common/Header";
import { AppLayout } from "./components/common/AppLayout";
import { NetworkStatusBanner } from "./components/common/NetworkStatusBanner";
import { RoleSelection } from "./components/common/RoleSelection";
import { StudentClassEntry } from "./components/student/StudentClassEntry";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { HomeworkView } from "./components/student/HomeworkView";
import { QuizGame } from "./components/student/QuizGame";
import { StudentGateModal } from "./components/student/StudentGateModal";
import { LessonListView } from "./components/student/LessonListView";
import { PracticeExamsView } from "./components/student/PracticeExamsView";
import { MyResultsView } from "./components/student/MyResultsView";
import { QuizRunner } from "./components/student/QuizRunner";
import { QuizResultView } from "./components/student/QuizResultView";

import { AdminLoginModal } from "./components/admin/AdminLoginModal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { TeacherAssignmentPanel } from "./components/admin/TeacherAssignmentPanel";
import { AppsScriptGuideModal } from "./components/admin/AppsScriptGuideModal";
import { telemetryService } from "./services/telemetryService";
import { authService } from "./services/authService";
import { apiService } from "./services/apiService";

type AppView = "DASHBOARD" | "LESSONS" | "EXAMS" | "MY_RESULTS" | "HOMEWORK" | "QUIZ" | "RESULT" | "ADMIN" | "ASSIGNMENTS";
type StudentSubView = "DASHBOARD" | "HOMEWORK" | "LESSONS" | "EXAMS" | "GAME";
type UserRole = "NONE" | "TEACHER" | "STUDENT";

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    // If URL has ?class=xxx, auto-select STUDENT role immediately
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("class")) {
      localStorage.setItem("qlhs_user_role", "STUDENT");
      return "STUDENT";
    }
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
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try { return JSON.parse(localStorage.getItem("qlhs_assignments") || "[]"); } catch { return []; }
  });
  const [currentView, setCurrentView] = useState<AppView>("LESSONS");
  const [studentSubView, setStudentSubView] = useState<StudentSubView>("DASHBOARD");
  const [studentClassName, setStudentClassName] = useState<string | null>(() => localStorage.getItem("qlhs_student_class"));
  const [isFirstStudentLogin, setIsFirstStudentLogin] = useState(() => !localStorage.getItem("qlhs_student_profile"));
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<SubmissionResult | null>(null);
  const [authSession, setAuthSession] = useState(() => authService.get());
  const isAdminAuthenticated = Boolean(authSession);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState(false);



  const persistAssignments = (a: Assignment[]) => {
    setAssignments(a);
    localStorage.setItem("qlhs_assignments", JSON.stringify(a));
  };

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
    localStorage.removeItem("qlhs_student_class");
    localStorage.removeItem("qlhs_student_profile");
    localStorage.removeItem("toan_student_session_id");
    storageService.clearStudentProfile();
    setStudentProfile(null);
    setStudentClassName(null);
    setCurrentView("LESSONS");
    setStudentSubView("DASHBOARD");
    // Remove ?class= from URL so useState initializer doesn't re-select STUDENT
    if (window.location.search.includes("class=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const handleStudentEnterClass = (className: string, studentName: string, dateOfBirth: string, classId?: string) => {
    setStudentClassName(className);
    localStorage.setItem("qlhs_student_class", className);
    // Create and persist student profile
    const profile: StudentProfile = {
      studentName,
      className,
      dateOfBirth,
      classId: classId || undefined,
      grade: parseInt(className) as any || 11,
    };
    storageService.saveStudentProfile(profile);
    setStudentProfile(profile);
    setIsFirstStudentLogin(!localStorage.getItem("qlhs_student_profile"));
    localStorage.setItem("qlhs_student_profile", JSON.stringify(profile));
    // Clear ?class= from URL after successful login
    if (classId) window.history.replaceState({}, "", window.location.pathname);
    setStudentSubView("DASHBOARD");
  };

  const handleStudentExitClass = () => {
    setStudentClassName(null);
    localStorage.removeItem("qlhs_student_class");
    localStorage.removeItem("qlhs_student_profile");
    storageService.clearStudentProfile();
    setStudentProfile(null);
    setStudentSubView("DASHBOARD");
  };

  // Fetch assignments from API (simulated with localStorage for now)
  useEffect(() => {
    // In a real app, fetch assignments from API based on studentClassName
    // For now, assignments are stored in localStorage by the teacher
  }, [studentClassName]);

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
  const handleNavigate = (view: string) => {
    const v = view as AppView;
    if (v === "ADMIN" || v === "ASSIGNMENTS") {
      if (!isAdminAuthenticated) { setIsAdminLoginModalOpen(true); return; }
      setCurrentView(v);
    } else setCurrentView(v);
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

  // Get unique class names from classes API
  const [classNames, setClassNames] = useState<string[]>([]);
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    fetch("/api/classes")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setClassNames(j.data.map((c: any) => c.name || c.className).filter(Boolean));
        }
      })
      .catch(() => {});
  }, [isAdminAuthenticated]);

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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <NetworkStatusBanner />
        <AppLayout
          currentView={currentView}
          onNavigate={handleNavigate}
          userRole="TEACHER"
          userName={authSession?.displayName}
          userSubtitle={authSession?.role === "SUPER_ADMIN" ? "Quản trị viên" : "Giáo viên"}
          onLogout={handleAdminLogout}
          onSwitchRole={handleSwitchRole}
          isAdmin={isAdminAuthenticated}
        >
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
          {currentView === "ASSIGNMENTS" && isAdminAuthenticated && (
            <TeacherAssignmentPanel
              lessons={lessons}
              assignments={assignments}
              classNames={classNames.length > 0 ? classNames : ["Chưa có lớp"]}
              submissions={submissions}
              authSession={authSession}
              onSaveAssignment={(a) => persistAssignments([...assignments.filter((x) => x.className !== a.className), a])}
              onDeleteAssignment={(id) => persistAssignments(assignments.filter((a) => a.id !== id))}
            />
          )}
          {currentView === "DASHBOARD" && (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg font-semibold">Chào mừng Giáo viên!</p>
              <p className="text-slate-500 text-sm mt-2">Chọn menu bên trái để quản lý lớp học và đề thi.</p>
            </div>
          )}
          {currentView === "LESSONS" && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm">Chọn menu bên trái để quản lý.</p>
            </div>
          )}
        </AppLayout>
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

  // ─── Restore student profile from localStorage on mount ──────────────────
  useEffect(() => {
    if (role !== "STUDENT") return;
    if (studentClassName && studentProfile) return; // Already have profile
    const saved = localStorage.getItem("qlhs_student_profile");
    if (!saved) return;
    try {
      const profile: StudentProfile = JSON.parse(saved);
      if (profile.className && profile.studentName) {
        setStudentClassName(profile.className);
        storageService.saveStudentProfile(profile);
        setStudentProfile(profile);
        setStudentSubView("DASHBOARD");
      } else {
        localStorage.removeItem("qlhs_student_profile");
      }
    } catch {
      localStorage.removeItem("qlhs_student_profile");
    }
  }, [role, studentClassName, studentProfile]);

  // ─── Student Interface ──────────────────────────────────────────────────

  // Step 1: Enter student info (only if no saved profile)
  if (!studentClassName || !studentProfile) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <NetworkStatusBanner />
        <StudentClassEntry
          config={config}
          onEnter={handleStudentEnterClass}
          onSwitchRole={handleSwitchRole}
        />
      </div>
    );
  }

  // Step 2+: Dashboard or specific section
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NetworkStatusBanner />
      <AppLayout
        currentView={currentView === "QUIZ" || currentView === "RESULT" ? "DASHBOARD" : currentView}
        onNavigate={(v) => {
          setCurrentView(v as AppView);
          if (["LESSONS", "EXAMS", "MY_RESULTS"].includes(v)) {
            setStudentSubView(v === "LESSONS" ? "LESSONS" : v === "EXAMS" ? "EXAMS" : "DASHBOARD");
          } else if (v === "DASHBOARD") {
            setStudentSubView("DASHBOARD");
          } else if (v === "HOMEWORK") {
            setStudentSubView("HOMEWORK");
          }
        }}
        userRole="STUDENT"
        userName={studentProfile?.studentName}
        userSubtitle={`Lớp ${studentClassName}`}
        onLogout={() => {
          storageService.clearStudentProfile();
          localStorage.removeItem("toan_student_session_id");
          setStudentProfile(null);
          setCurrentView("LESSONS");
          setStudentSubView("DASHBOARD");
        }}
        onSwitchRole={handleSwitchRole}
      >
        {/* Quiz / Result views take over completely */}
        {currentView === "QUIZ" && activeLesson && (
          <QuizRunner lesson={activeLesson} questions={activeQuizQuestions} student={studentProfile || { studentName: "Học sinh", className: studentClassName, dateOfBirth: "", grade: 6 }} config={config} isRetake={isActiveLessonRetake} onFinishQuiz={handleFinishQuiz} onCancelQuiz={() => { setCurrentView("LESSONS"); setStudentSubView("DASHBOARD"); }} />
        )}
        {currentView === "RESULT" && latestResult && (
          <QuizResultView result={latestResult} lesson={lessons.find(l => l.id === latestResult.lessonId)} questions={questions} onRetake={() => { const l = lessons.find(x => x.id === latestResult.lessonId); if (l) startQuizSession(l, activeQuizQuestions, true); }} onBackToLessons={() => { setCurrentView("LESSONS"); setStudentSubView("DASHBOARD"); }} onGoToMyResults={() => { setCurrentView("MY_RESULTS"); setStudentSubView("DASHBOARD"); }} />
        )}

        {/* Dashboard or section views */}
        {currentView !== "QUIZ" && currentView !== "RESULT" && studentSubView === "DASHBOARD" && (
          <StudentDashboard
            className={studentClassName}
            studentName={studentProfile?.studentName || "Học sinh"}
            grade={studentProfile?.grade}
            assignments={assignments}
            lessons={lessons}
            exams={exams}
            submissions={submissions}
            isFirstLogin={isFirstStudentLogin}
            onSelectSection={(section) => {
              setStudentSubView(section);
              setCurrentView(section === "HOMEWORK" ? "LESSONS" : section === "LESSONS" ? "LESSONS" : "EXAMS");
            }}
          />
        )}

        {currentView !== "QUIZ" && currentView !== "RESULT" && studentSubView === "HOMEWORK" && (
          <HomeworkView
            assignment={assignments.find((a) => a.className === studentClassName) || null}
            lessons={lessons}
            questions={questions}
            submissions={submissions}
            onStartLesson={(lesson) => startQuizSession(lesson)}
            onBack={() => setStudentSubView("DASHBOARD")}
          />
        )}

        {currentView !== "QUIZ" && currentView !== "RESULT" && studentSubView === "LESSONS" && (
          <LessonListView lessons={lessons} questions={questions} submissions={submissions} student={studentProfile || { studentName: "Học sinh", className: studentClassName, dateOfBirth: "", grade: 6 }} onStartLesson={(lesson, retake) => startQuizSession(lesson, undefined, retake)} onOpenStudentModal={() => setIsStudentModalOpen(true)} />
        )}

        {currentView !== "QUIZ" && currentView !== "RESULT" && studentSubView === "EXAMS" && (
          <PracticeExamsView exams={exams} questions={questions} student={studentProfile || { studentName: "Học sinh", className: studentClassName, dateOfBirth: "", grade: 6 }} isAdmin={false} onStartExam={(lesson, qs) => startQuizSession(lesson, qs, true)} onOpenStudentModal={() => setIsStudentModalOpen(true)} onOpenAdminExamManager={() => {}} />
        )}

        {currentView !== "QUIZ" && currentView !== "RESULT" && studentSubView === "GAME" && (
          <QuizGame lessons={lessons} questions={questions} completedLessonIds={new Set(submissions.map(s => s.lessonId))} onSelectLesson={(lesson) => startQuizSession(lesson)} />
        )}

        {currentView === "MY_RESULTS" && (
          <MyResultsView student={studentProfile} lessons={lessons} submissions={submissions} onRetakeLesson={lesson => startQuizSession(lesson, undefined, true)} onOpenStudentModal={() => setIsStudentModalOpen(true)} />
        )}
      </AppLayout>
      <StudentGateModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onSave={handleSaveStudentProfile} currentProfile={studentProfile} config={config} />
    </div>
  );
}
