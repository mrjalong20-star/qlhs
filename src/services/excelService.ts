import * as XLSX from "xlsx";
import { Question, QuestionPart, QuestionType, QuestionLevel, Lesson } from "../types";

export interface ImportValidationResult {
  validQuestions: Question[];
  errors: { row: number; reason: string }[];
  totalRows: number;
}

/**
 * Generates and downloads a sample Excel template for questions
 */
export function generateSampleQuestionBankTemplate(lessons?: Lesson[]): void {
  const sampleRows = [
    {
      "Mã bài (lessonId)": "bai-01",
      "Phần (PART_1 / PART_2 / PART_3)": "PART_1",
      "Mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)": "Nhận biết",
      "Nội dung câu hỏi (questionText)": "Nhóm các nước phát triển có đặc điểm nào sau đây về cơ cấu kinh tế?",
      "Phương án A": "Tỉ trọng ngành dịch vụ rất cao trong cơ cấu GDP",
      "Phương án B": "Nông nghiệp chiếm tỉ trọng chủ đạo trong GDP",
      "Phương án C": "Công nghiệp khai khoáng đóng góp phần lớn GDP",
      "Phương án D": "Kinh tế chậm chuyển dịch theo hướng hiện đại",
      "Đáp án đúng (A/B/C/D)": "A",
      "Nhận định a (Phần II)": "",
      "Đúng/Sai a (Đúng/Sai)": "",
      "Nhận định b (Phần II)": "",
      "Đúng/Sai b (Đúng/Sai)": "",
      "Nhận định c (Phần II)": "",
      "Đúng/Sai c (Đúng/Sai)": "",
      "Nhận định d (Phần II)": "",
      "Đúng/Sai d (Đúng/Sai)": "",
      "Đáp án ngắn (Phần III)": "",
      "Đơn vị tính": "",
      "Các đáp án chấp nhận thêm": "",
      "Giải thích / Công thức": "Dịch vụ ở các nước phát triển chiếm >70% GDP.",
    },
    {
      "Mã bài (lessonId)": "bai-01",
      "Phần (PART_1 / PART_2 / PART_3)": "PART_2",
      "Mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)": "Thông hiểu",
      "Nội dung câu hỏi (questionText)": "Cho nhận định về đặc điểm dân cư và xã hội của các nước phát triển:",
      "Phương án A": "",
      "Phương án B": "",
      "Phương án C": "",
      "Phương án D": "",
      "Đáp án đúng (A/B/C/D)": "",
      "Nhận định a (Phần II)": "Tỉ lệ gia tăng tự nhiên của dân số thường ở mức thấp.",
      "Đúng/Sai a (Đúng/Sai)": "Đúng",
      "Nhận định b (Phần II)": "Cơ cấu dân số có xu hướng già hóa nhanh.",
      "Đúng/Sai b (Đúng/Sai)": "Đúng",
      "Nhận định c (Phần II)": "Tỉ lệ dân thành thị thường thấp hơn các nước đang phát triển.",
      "Đúng/Sai c (Đúng/Sai)": "Sai",
      "Nhận định d (Phần II)": "Chất lượng cuộc sống và chỉ số HDI thuộc loại rất cao.",
      "Đúng/Sai d (Đúng/Sai)": "Đúng",
      "Đáp án ngắn (Phần III)": "",
      "Đơn vị tính": "",
      "Các đáp án chấp nhận thêm": "",
      "Giải thích / Công thức": "Tỉ lệ thị dân các nước phát triển rất cao (thường >75%).",
    },
    {
      "Mã bài (lessonId)": "bai-01",
      "Phần (PART_1 / PART_2 / PART_3)": "PART_3",
      "Mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)": "Vận dụng",
      "Nội dung câu hỏi (questionText)": "Năm 2021, tổng GDP toàn thế giới là 96 100 tỉ USD, nhóm nước phát triển chiếm 58 621 tỉ USD. Tính tỉ trọng (%) GDP của nhóm nước phát triển (làm tròn 1 chữ số thập phân).",
      "Phương án A": "",
      "Phương án B": "",
      "Phương án C": "",
      "Phương án D": "",
      "Đáp án đúng (A/B/C/D)": "",
      "Nhận định a (Phần II)": "",
      "Đúng/Sai a (Đúng/Sai)": "",
      "Nhận định b (Phần II)": "",
      "Đúng/Sai b (Đúng/Sai)": "",
      "Nhận định c (Phần II)": "",
      "Đúng/Sai c (Đúng/Sai)": "",
      "Nhận định d (Phần II)": "",
      "Đúng/Sai d (Đúng/Sai)": "",
      "Đáp án ngắn (Phần III)": "61.0",
      "Đơn vị tính": "%",
      "Các đáp án chấp nhận thêm": "61,0, 61",
      "Giải thích / Công thức": "(58 621 / 96 100) * 100 = 61.0%",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mau_Cau_Hoi_DiaLi11");
  XLSX.writeFile(wb, "Mau_Ngan_Hang_Cau_Hoi_DiaLi11_GDPT2018.xlsx");
}

/**
 * Parses uploaded Excel file
 */
export async function parseExcelQuestionBank(
  file: File,
  lessons?: Lesson[]
): Promise<ImportValidationResult> {
  const dataBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(dataBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

  const validQuestions: Question[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    let lessonId = String(row["Mã bài (lessonId)"] || row["lessonId"] || "bai-01").trim().toLowerCase();
    if (!lessonId.startsWith("bai-")) {
      lessonId = `bai-${lessonId.replace("bai_", "").replace("bai", "").padStart(2, "0")}`;
    }

    const rawPart = String(row["Phần (PART_1 / PART_2 / PART_3)"] || row["part"] || "PART_1").trim().toUpperCase();
    const rawLevel = String(row["Mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)"] || row["level"] || "Thông hiểu").trim();
    const questionText = String(row["Nội dung câu hỏi (questionText)"] || row["questionText"] || "").trim();

    if (!questionText) {
      errors.push({
        row: rowNum,
        reason: "Thiếu nội dung câu hỏi",
      });
      return;
    }

    let part: QuestionPart = "PART_1";
    if (rawPart.includes("2") || rawPart === "PART_2") part = "PART_2";
    else if (rawPart.includes("3") || rawPart === "PART_3") part = "PART_3";

    let level: QuestionLevel = "Thông hiểu";
    if (rawLevel.includes("Nhận") || rawLevel.includes("nhan")) level = "Nhận biết";
    else if (rawLevel.includes("cao")) level = "Vận dụng cao";
    else if (rawLevel.includes("Vận") || rawLevel.includes("van")) level = "Vận dụng";

    const qId = `Q_EXCEL_${Date.now()}_${index}`;
    const explanation = String(row["Giải thích / Công thức"] || row["explanation"] || "").trim();

    if (part === "PART_1") {
      const optA = String(row["Phương án A"] || row["optionA"] || "").trim();
      const optB = String(row["Phương án B"] || row["optionB"] || "").trim();
      const optC = String(row["Phương án C"] || row["optionC"] || "").trim();
      const optD = String(row["Phương án D"] || row["optionD"] || "").trim();
      const ans = String(row["Đáp án đúng (A/B/C/D)"] || row["answer"] || "").trim().toUpperCase() as any;

      if (!optA || !optB || !optC || !optD) {
        errors.push({
          row: rowNum,
          reason: "Phần I thiếu một trong 4 phương án A, B, C, D",
        });
        return;
      }

      if (!["A", "B", "C", "D"].includes(ans)) {
        errors.push({
          row: rowNum,
          reason: "Phần I thiếu đáp án đúng hoặc đáp án không hợp lệ (phải là A, B, C hoặc D)",
        });
        return;
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_1",
        type: "MULTIPLE_CHOICE",
        level,
        questionText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        answer: ans,
        correctOption: ans,
        explanation,
      });
    } else if (part === "PART_2") {
      const subA = String(row["Nhận định a (Phần II)"] || row["subA"] || "").trim();
      const tfA = String(row["Đúng/Sai a (Đúng/Sai)"] || row["tfA"] || "").toLowerCase().includes("đúng") || String(row["tfA"]).toLowerCase() === "true";

      const subB = String(row["Nhận định b (Phần II)"] || row["subB"] || "").trim();
      const tfB = String(row["Đúng/Sai b (Đúng/Sai)"] || row["tfB"] || "").toLowerCase().includes("đúng") || String(row["tfB"]).toLowerCase() === "true";

      const subC = String(row["Nhận định c (Phần II)"] || row["subC"] || "").trim();
      const tfC = String(row["Đúng/Sai c (Đúng/Sai)"] || row["tfC"] || "").toLowerCase().includes("đúng") || String(row["tfC"]).toLowerCase() === "true";

      const subD = String(row["Nhận định d (Phần II)"] || row["subD"] || "").trim();
      const tfD = String(row["Đúng/Sai d (Đúng/Sai)"] || row["tfD"] || "").toLowerCase().includes("đúng") || String(row["tfD"]).toLowerCase() === "true";

      if (!subA || !subB || !subC || !subD) {
        errors.push({
          row: rowNum,
          reason: "Phần II bắt buộc phải có đủ 4 nhận định a, b, c, d",
        });
        return;
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_2",
        type: "TRUE_FALSE_GROUP",
        level,
        questionText,
        subAnswers: [
          { id: "a", statement: subA, correctAnswer: tfA },
          { id: "b", statement: subB, correctAnswer: tfB },
          { id: "c", statement: subC, correctAnswer: tfC },
          { id: "d", statement: subD, correctAnswer: tfD },
        ],
        explanation,
      });
    } else if (part === "PART_3") {
      const shortAns = String(row["Đáp án ngắn (Phần III)"] || row["shortAnswer"] || "").trim();
      const unit = String(row["Đơn vị tính"] || row["unit"] || "").trim();
      const acceptedRaw = String(row["Các đáp án chấp nhận thêm"] || "").trim();
      const acceptedList = acceptedRaw
        ? acceptedRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (shortAns && !acceptedList.includes(shortAns)) {
        acceptedList.push(shortAns);
      }

      if (!shortAns) {
        errors.push({
          row: rowNum,
          reason: "Phần III thiếu đáp án ngắn chuẩn",
        });
        return;
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_3",
        type: "SHORT_ANSWER",
        level,
        questionText,
        shortAnswer: shortAns,
        correctAnswerText: shortAns,
        acceptableAnswers: acceptedList,
        acceptedAnswers: acceptedList,
        unit,
        explanation,
      });
    }
  });

  return {
    validQuestions,
    errors,
    totalRows: rows.length,
  };
}

/**
 * Export questions to Excel
 */
export function exportQuestionBankToExcel(
  questions: Question[],
  lessons?: Lesson[],
  filename = "Ngan_Hang_Cau_Hoi_Dia_Li_11.xlsx"
): void {
  const rows = questions.map((q) => ({
    "Mã bài (lessonId)": q.lessonId,
    "Phần (PART_1 / PART_2 / PART_3)": q.part,
    "Mức độ (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)": q.level,
    "Nội dung câu hỏi (questionText)": q.questionText,
    "Phương án A": q.optionA || "",
    "Phương án B": q.optionB || "",
    "Phương án C": q.optionC || "",
    "Phương án D": q.optionD || "",
    "Đáp án đúng (A/B/C/D)": q.answer || q.correctOption || "",
    "Nhận định a (Phần II)": q.subAnswers?.find((s) => s.id === "a")?.statement || "",
    "Đúng/Sai a (Đúng/Sai)": q.subAnswers?.find((s) => s.id === "a")?.correctAnswer ? "Đúng" : "Sai",
    "Nhận định b (Phần II)": q.subAnswers?.find((s) => s.id === "b")?.statement || "",
    "Đúng/Sai b (Đúng/Sai)": q.subAnswers?.find((s) => s.id === "b")?.correctAnswer ? "Đúng" : "Sai",
    "Nhận định c (Phần II)": q.subAnswers?.find((s) => s.id === "c")?.statement || "",
    "Đúng/Sai c (Đúng/Sai)": q.subAnswers?.find((s) => s.id === "c")?.correctAnswer ? "Đúng" : "Sai",
    "Nhận định d (Phần II)": q.subAnswers?.find((s) => s.id === "d")?.statement || "",
    "Đúng/Sai d (Đúng/Sai)": q.subAnswers?.find((s) => s.id === "d")?.correctAnswer ? "Đúng" : "Sai",
    "Đáp án ngắn (Phần III)": q.shortAnswer || q.correctAnswerText || "",
    "Đơn vị tính": q.unit || "",
    "Các đáp án chấp nhận thêm": q.acceptableAnswers?.join(", ") || "",
    "Giải thích / Công thức": q.explanation || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ngan_Hang_Cau_Hoi");
  XLSX.writeFile(wb, filename);
}

export const excelService = {
  downloadSampleTemplate: generateSampleQuestionBankTemplate,
  parseQuestionFile: parseExcelQuestionBank,
  exportQuestionBankToExcel,
};
