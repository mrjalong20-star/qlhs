import { StudentProfile, StudentAnswers, SubmissionResult, AppConfig, Lesson, Question, Exam } from "../types";
import { STORAGE_KEYS, DEFAULT_CONFIG } from "../config/appConfig";
import { curriculumLessons } from "../data/curriculum";
import { sampleQuestions } from "../data/sampleQuestions";
import { DEFAULT_EXAMS } from "../data/mockExams";

export interface ActiveAttemptDraft { attemptId:string; studentName:string; className:string; lessonId:string; lessonTitle:string; semester:number; answers:StudentAnswers; flaggedQuestionIds:string[]; currentQuestionIndex:number; startedAt:string; elapsedSeconds:number; }
const QUESTIONS_STORAGE_KEY="dia_li_11_questions_bank_v4"; const LESSONS_STORAGE_KEY="dia_li_11_lessons_v4"; const EXAMS_STORAGE_KEY="dia_li_11_exams_v4";

async function onlineContent<T>(path:string, options:RequestInit={}):Promise<T>{ const res=await fetch(path,{...options,headers:{Accept:"application/json",...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})}}); const json=await res.json().catch(()=>({})); if(!res.ok||json.success===false) throw new Error(json.message||`HTTP ${res.status}`); return json.data as T; }

export const storageService = {
  getStudentProfile():StudentProfile|null{try{const d=localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);if(!d)return null;const p=JSON.parse(d);if(!p.studentName||!p.className||!p.dateOfBirth)return null;return p;}catch{return null;}},
  saveStudentProfile(profile:StudentProfile){try{localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE,JSON.stringify(profile));}catch{}},
  clearStudentProfile(){try{localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILE);}catch{}},
  saveActiveDraft(lessonId:string,draft:ActiveAttemptDraft){try{sessionStorage.setItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`,JSON.stringify(draft));localStorage.setItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`,JSON.stringify(draft));}catch{}},
  getActiveDraft(lessonId:string):ActiveAttemptDraft|null{try{const s=sessionStorage.getItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);if(s)return JSON.parse(s);const l=localStorage.getItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);return l?JSON.parse(l):null;}catch{return null;}},
  clearActiveDraft(lessonId:string){try{sessionStorage.removeItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);}catch{}},
  getLocalSubmissions():SubmissionResult[]{try{const d=localStorage.getItem(STORAGE_KEYS.LOCAL_SUBMISSIONS);return d?JSON.parse(d):[];}catch{return[];}},
  getSubmissions(){return this.getLocalSubmissions();},
  saveLocalSubmission(result:SubmissionResult){try{const l=this.getLocalSubmissions();const i=l.findIndex(x=>x.attemptId===result.attemptId);if(i>=0)l[i]=result;else l.unshift(result);localStorage.setItem(STORAGE_KEYS.LOCAL_SUBMISSIONS,JSON.stringify(l));}catch{}},
  getLessons(){try{const d=localStorage.getItem(LESSONS_STORAGE_KEY);if(d){const p=JSON.parse(d);if(Array.isArray(p)&&p.length)return p;}return curriculumLessons;}catch{return curriculumLessons;}},
  saveLessons(lessons:Lesson[]){localStorage.setItem(LESSONS_STORAGE_KEY,JSON.stringify(lessons));return onlineContent<Lesson[]>("/api/content/lessons",{method:"POST",body:JSON.stringify(lessons[0]||{})}).catch(()=>undefined);},
  async syncLessons(lessons:Lesson[]){for(const l of lessons) await onlineContent<Lesson>("/api/content/lessons",{method:"POST",body:JSON.stringify(l)});localStorage.setItem(LESSONS_STORAGE_KEY,JSON.stringify(lessons));return lessons;},
  getQuestions(){try{const d=localStorage.getItem(QUESTIONS_STORAGE_KEY);if(d){const p=JSON.parse(d);if(Array.isArray(p)&&p.length){const m=new Map<string,Question>();sampleQuestions.forEach(q=>m.set(q.id,q));p.forEach((q:Question)=>m.set(q.id,q));return Array.from(m.values());}}return sampleQuestions;}catch{return sampleQuestions;}},
  saveQuestions(questions:Question[]){localStorage.setItem(QUESTIONS_STORAGE_KEY,JSON.stringify(questions));},
  async syncQuestions(questions:Question[]){for(const q of questions) await onlineContent<Question>("/api/content/questions",{method:"POST",body:JSON.stringify(q)});localStorage.setItem(QUESTIONS_STORAGE_KEY,JSON.stringify(questions));return questions;},
  getExams(){try{const d=localStorage.getItem(EXAMS_STORAGE_KEY);if(d){const p=JSON.parse(d);if(Array.isArray(p)&&p.length){const m=new Map<string,Exam>();DEFAULT_EXAMS.forEach(e=>m.set(e.id,e));p.forEach((e:Exam)=>m.set(e.id,e));return Array.from(m.values());}}return DEFAULT_EXAMS;}catch{return DEFAULT_EXAMS;}},
  saveExams(exams:Exam[]){localStorage.setItem(EXAMS_STORAGE_KEY,JSON.stringify(exams));},
  async syncExams(exams:Exam[]){for(const e of exams) await onlineContent<Exam>("/api/content/exams",{method:"POST",body:JSON.stringify(e)});localStorage.setItem(EXAMS_STORAGE_KEY,JSON.stringify(exams));return exams;},
  async loadOnlineContent(){const [lessons,questions,exams]=await Promise.all([onlineContent<Lesson[]>("/api/content/lessons").catch(()=>[]),onlineContent<Question[]>("/api/content/questions").catch(()=>[]),onlineContent<Exam[]>("/api/content/exams").catch(()=>[])]);if(lessons.length)localStorage.setItem(LESSONS_STORAGE_KEY,JSON.stringify(lessons));if(questions.length)localStorage.setItem(QUESTIONS_STORAGE_KEY,JSON.stringify(questions));if(exams.length)localStorage.setItem(EXAMS_STORAGE_KEY,JSON.stringify(exams));return {lessons,questions,exams};},
  getAppConfig():AppConfig{try{const d=localStorage.getItem(STORAGE_KEYS.APP_CONFIG);return d?{...DEFAULT_CONFIG,...JSON.parse(d)}:DEFAULT_CONFIG;}catch{return DEFAULT_CONFIG;}},
  saveAppConfig(config:AppConfig){localStorage.setItem(STORAGE_KEYS.APP_CONFIG,JSON.stringify(config));},
  getAdminAuth(){try{return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH)==="authenticated";}catch{return false;}},
  isAdminLoggedIn(){return this.getAdminAuth();},
  setAdminAuth(isAuth:boolean){try{if(isAuth)sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH,"authenticated");else sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);}catch{}},
  resetToInitialSeed(){try{localStorage.setItem(LESSONS_STORAGE_KEY,JSON.stringify(curriculumLessons));localStorage.setItem(QUESTIONS_STORAGE_KEY,JSON.stringify(sampleQuestions));localStorage.setItem(EXAMS_STORAGE_KEY,JSON.stringify(DEFAULT_EXAMS));localStorage.setItem(STORAGE_KEYS.APP_CONFIG,JSON.stringify(DEFAULT_CONFIG));}catch{}}
};
