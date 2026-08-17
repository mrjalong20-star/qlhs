import * as mammoth from "mammoth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import { Question, QuestionPart, QuestionLevel, Lesson } from "../types";

export interface WordImportValidationResult {
  validQuestions: Question[];
  errors: { row: number; reason: string }[];
  totalQuestionsParsed: number;
}

/**
 * Creates and downloads a standard formatted Microsoft Word (.docx) template
 */
export async function generateSampleWordTemplate(lessons?: Lesson[]): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "BIỂU MẪU CÂU HỎI ĐỊA LÍ 11 - CHƯƠNG TRÌNH GDPT 2018",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "HƯỚNG DẪN SOẠN THẢO CHO GIÁO VIÊN:",
                bold: true,
                color: "C00000",
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Cấu trúc đề gồm 3 phần: PHẦN I (4 lựa chọn), PHẦN II (Đúng/Sai), PHẦN III (Trả lời ngắn).\n",
              }),
              new TextRun({
                text: "- Mỗi câu bắt đầu bằng: ",
              }),
              new TextRun({
                text: "Câu [Số]: [Mã bài: bai-01] [Mức độ: Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao]\n",
                bold: true,
                color: "002060",
              }),
              new TextRun({
                text: "- Mã bài học chuẩn: bai-01 đến bai-32 (Ví dụ: bai-01, bai-02, ..., bai-32).\n",
              }),
              new TextRun({
                text: "- Phần I: Các phương án ghi rõ A., B., C., D. và dòng 'Đáp án: A'.\n",
              }),
              new TextRun({
                text: "- Phần II: 4 ý ghi a), b), c), d) kèm theo [Đúng] hoặc [Sai] ở cuối mỗi ý.\n",
              }),
              new TextRun({
                text: "- Phần III: Dòng 'Đáp án: [giá trị]', dòng 'Đơn vị: [đơn vị]' (nếu có).\n",
              }),
              new TextRun({
                text: "- Có thể ghi thêm dòng 'Lời giải: [nội dung]' ở cuối mỗi câu.",
              }),
            ],
            spacing: { after: 240 },
          }),

          // PHẦN I
          new Paragraph({
            text: "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Câu 1: [Mã bài: bai-01] [Mức độ: Nhận biết] ",
                bold: true,
              }),
              new TextRun({
                text: "Nhóm các nước phát triển có đặc điểm nào sau đây về cơ cấu kinh tế?",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({ text: "A. Tỉ trọng ngành dịch vụ rất cao trong cơ cấu GDP" }),
          new Paragraph({ text: "B. Nông nghiệp chiếm tỉ trọng chủ đạo trong GDP" }),
          new Paragraph({ text: "C. Công nghiệp khai khoáng đóng góp phần lớn GDP" }),
          new Paragraph({ text: "D. Kinh tế chậm chuyển dịch theo hướng hiện đại" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
              new TextRun({ text: "A", bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true }),
              new TextRun({ text: "Ngành dịch vụ ở các nước phát triển thường chiếm trên 70% trong cơ cấu GDP.", italics: true }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Câu 2: [Mã bài: bai-01] [Mức độ: Thông hiểu] ",
                bold: true,
              }),
              new TextRun({
                text: "Sự phân chia thế giới thành các nhóm nước phát triển và đang phát triển dựa trên tiêu chí nào sau đây?",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({ text: "A. Diện tích lãnh thổ và số lượng tài nguyên thiên nhiên" }),
          new Paragraph({ text: "B. Trình độ phát triển kinh tế - xã hội" }),
          new Paragraph({ text: "C. Vị trí địa lí và điều kiện tự nhiên" }),
          new Paragraph({ text: "D. Quy mô dân số và cơ cấu dân số theo giới tính" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
              new TextRun({ text: "B", bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true }),
              new TextRun({ text: "Tiêu chí chủ yếu để phân chia là trình độ phát triển kinh tế - xã hội (GNI/người, HDI, cơ cấu kinh tế).", italics: true }),
            ],
            spacing: { after: 200 },
          }),

          // PHẦN II
          new Paragraph({
            text: "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Câu 3: [Mã bài: bai-01] [Mức độ: Thông hiểu] ",
                bold: true,
              }),
              new TextRun({
                text: "Cho nhận định về đặc điểm dân cư và xã hội của các nước phát triển:",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({ text: "a) Tỉ lệ gia tăng tự nhiên của dân số thường ở mức thấp. [Đúng]" }),
          new Paragraph({ text: "b) Cơ cấu dân số có xu hướng già hóa nhanh. [Đúng]" }),
          new Paragraph({ text: "c) Tỉ lệ dân thành thị thường thấp hơn các nước đang phát triển. [Sai]" }),
          new Paragraph({ text: "d) Chất lượng cuộc sống và chỉ số HDI thuộc loại rất cao. [Đúng]" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true }),
              new TextRun({ text: "Tỉ lệ dân thành thị ở các nước phát triển rất cao (thường trên 75%), câu c sai.", italics: true }),
            ],
            spacing: { after: 200 },
          }),

          // PHẦN III
          new Paragraph({
            text: "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Câu 4: [Mã bài: bai-01] [Mức độ: Vận dụng] ",
                bold: true,
              }),
              new TextRun({
                text: "Năm 2021, tổng GDP toàn thế giới là 96 100 tỉ USD, nhóm nước phát triển chiếm 58 621 tỉ USD. Tính tỉ trọng (%) GDP của nhóm nước phát triển trong tổng GDP thế giới (làm tròn kết quả đến 1 chữ số thập phân).",
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
              new TextRun({ text: "61.0", bold: true }),
            ],
          }),
          new Paragraph({ text: "Đơn vị: %" }),
          new Paragraph({ text: "Chấp nhận thêm: 61,0, 61" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true }),
              new TextRun({ text: "Tỉ trọng = (58 621 / 96 100) * 100 = 61.0000... ≈ 61.0%", italics: true }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Mau_Ngan_Hang_Cau_Hoi_DiaLi11_GDPT2018.docx");
}

/**
 * Exports current questions bank into a structured, readable Microsoft Word (.docx) document
 */
export async function exportQuestionBankToWord(
  questions: Question[],
  lessons?: Lesson[],
  filename = "Ngan_Hang_Cau_Hoi_Dia_Li_11.docx"
): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      text: "NGÂN HÀNG CÂU HỎI ĐỊA LÍ 11 - CHƯƠNG TRÌNH GDPT 2018",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    new Paragraph({
      text: `Tổng số câu hỏi: ${questions.length} câu • Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ];

  // Group by Part
  const part1Questions = questions.filter((q) => q.part === "PART_1");
  const part2Questions = questions.filter((q) => q.part === "PART_2");
  const part3Questions = questions.filter((q) => q.part === "PART_3");

  // Part 1 Section
  if (part1Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (${part1Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    part1Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Câu ${idx + 1}: [Mã bài: ${q.lessonId}] [Mức độ: ${q.level}] `,
              bold: true,
              color: "002060",
            }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({ text: `A. ${q.optionA || ""}` }),
        new Paragraph({ text: `B. ${q.optionB || ""}` }),
        new Paragraph({ text: `C. ${q.optionC || ""}` }),
        new Paragraph({ text: `D. ${q.optionD || ""}` }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
            new TextRun({ text: `${q.answer || q.correctOption || "A"}`, bold: true }),
          ],
        })
      );
      if (q.explanation) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true, color: "555555" }),
              new TextRun({ text: q.explanation, italics: true, color: "555555" }),
            ],
            spacing: { after: 120 },
          })
        );
      } else {
        children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      }
    });
  }

  // Part 2 Section
  if (part2Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI (${part2Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    part2Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Câu ${idx + 1}: [Mã bài: ${q.lessonId}] [Mức độ: ${q.level}] `,
              bold: true,
              color: "002060",
            }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        })
      );

      const subA = q.subAnswers?.find((s) => s.id === "a");
      const subB = q.subAnswers?.find((s) => s.id === "b");
      const subC = q.subAnswers?.find((s) => s.id === "c");
      const subD = q.subAnswers?.find((s) => s.id === "d");

      children.push(
        new Paragraph({ text: `a) ${subA?.statement || ""} [${subA?.correctAnswer ? "Đúng" : "Sai"}]` }),
        new Paragraph({ text: `b) ${subB?.statement || ""} [${subB?.correctAnswer ? "Đúng" : "Sai"}]` }),
        new Paragraph({ text: `c) ${subC?.statement || ""} [${subC?.correctAnswer ? "Đúng" : "Sai"}]` }),
        new Paragraph({ text: `d) ${subD?.statement || ""} [${subD?.correctAnswer ? "Đúng" : "Sai"}]` })
      );

      if (q.explanation) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true, color: "555555" }),
              new TextRun({ text: q.explanation, italics: true, color: "555555" }),
            ],
            spacing: { after: 120 },
          })
        );
      } else {
        children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      }
    });
  }

  // Part 3 Section
  if (part3Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (${part3Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    part3Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Câu ${idx + 1}: [Mã bài: ${q.lessonId}] [Mức độ: ${q.level}] `,
              bold: true,
              color: "002060",
            }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
            new TextRun({ text: `${q.shortAnswer || q.correctAnswerText || ""}`, bold: true }),
          ],
        })
      );
      if (q.unit) {
        children.push(new Paragraph({ text: `Đơn vị: ${q.unit}` }));
      }
      const acceptable = q.acceptableAnswers || q.acceptedAnswers;
      if (acceptable && acceptable.length > 1) {
        children.push(new Paragraph({ text: `Chấp nhận thêm: ${acceptable.join(", ")}` }));
      }
      if (q.explanation) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Lời giải: ", italics: true, color: "555555" }),
              new TextRun({ text: q.explanation, italics: true, color: "555555" }),
            ],
            spacing: { after: 120 },
          })
        );
      } else {
        children.push(new Paragraph({ text: "", spacing: { after: 80 } }));
      }
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Export exam questions to Word
 */
export async function exportQuestionsToWord(
  questions: Question[],
  filename = "De_Kiem_Tra.docx",
  customHeaderTitle?: string
): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      text: customHeaderTitle || "ĐỀ KIỂM TRA ĐỊA LÍ 11 - CHƯƠNG TRÌNH GDPT 2018",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    new Paragraph({
      text: `Tổng số câu hỏi: ${questions.length} câu • Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ];

  const part1Questions = questions.filter((q) => q.part === "PART_1");
  const part2Questions = questions.filter((q) => q.part === "PART_2");
  const part3Questions = questions.filter((q) => q.part === "PART_3");

  if (part1Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (${part1Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );
    part1Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, color: "002060" }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({ text: `A. ${q.optionA || ""}` }),
        new Paragraph({ text: `B. ${q.optionB || ""}` }),
        new Paragraph({ text: `C. ${q.optionC || ""}` }),
        new Paragraph({ text: `D. ${q.optionD || ""}` }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
            new TextRun({ text: `${q.answer || q.correctOption || "A"}`, bold: true }),
          ],
        })
      );
    });
  }

  if (part2Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG/SAI (${part2Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );
    part2Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, color: "002060" }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        })
      );

      const subA = q.subAnswers?.find((s) => s.id === "a");
      const subB = q.subAnswers?.find((s) => s.id === "b");
      const subC = q.subAnswers?.find((s) => s.id === "c");
      const subD = q.subAnswers?.find((s) => s.id === "d");

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `a) ${subA?.statement || ""} - ` }),
            new TextRun({ text: subA?.correctAnswer ? "ĐÚNG" : "SAI", bold: true, color: subA?.correctAnswer ? "008000" : "C00000" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `b) ${subB?.statement || ""} - ` }),
            new TextRun({ text: subB?.correctAnswer ? "ĐÚNG" : "SAI", bold: true, color: subB?.correctAnswer ? "008000" : "C00000" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `c) ${subC?.statement || ""} - ` }),
            new TextRun({ text: subC?.correctAnswer ? "ĐÚNG" : "SAI", bold: true, color: subC?.correctAnswer ? "008000" : "C00000" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `d) ${subD?.statement || ""} - ` }),
            new TextRun({ text: subD?.correctAnswer ? "ĐÚNG" : "SAI", bold: true, color: subD?.correctAnswer ? "008000" : "C00000" }),
          ],
        })
      );
    });
  }

  if (part3Questions.length > 0) {
    children.push(
      new Paragraph({
        text: `PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (${part3Questions.length} CÂU)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );
    part3Questions.forEach((q, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Câu ${idx + 1}: `, bold: true, color: "002060" }),
            new TextRun({ text: q.questionText }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đáp án: ", bold: true, color: "008000" }),
            new TextRun({ text: `${q.shortAnswer || q.correctAnswerText || ""}`, bold: true }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  saveAs(blob, cleanFilename);
}

/**
 * Parses raw text extracted from a Word (.docx) file or pasted text into Question[]
 */
export function parseRawTextToQuestions(
  rawText: string,
  lessons?: Lesson[]
): WordImportValidationResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  const validQuestions: Question[] = [];
  const errors: { row: number; reason: string }[] = [];

  let currentPart: QuestionPart = "PART_1";

  // Split content into question blocks by "Câu \d+" or "PHẦN"
  interface RawBlock {
    part: QuestionPart;
    lines: string[];
    startLine: number;
  }

  const blocks: RawBlock[] = [];
  let currentBlockLines: string[] = [];
  let currentBlockStartLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Detect Part Switch
    if (/^PHẦN\s*I\b|^PHẦN\s*1\b/i.test(line)) {
      if (currentBlockLines.length > 0) {
        blocks.push({ part: currentPart, lines: currentBlockLines, startLine: currentBlockStartLine });
        currentBlockLines = [];
      }
      currentPart = "PART_1";
      continue;
    } else if (/^PHẦN\s*II\b|^PHẦN\s*2\b/i.test(line)) {
      if (currentBlockLines.length > 0) {
        blocks.push({ part: currentPart, lines: currentBlockLines, startLine: currentBlockStartLine });
        currentBlockLines = [];
      }
      currentPart = "PART_2";
      continue;
    } else if (/^PHẦN\s*III\b|^PHẦN\s*3\b/i.test(line)) {
      if (currentBlockLines.length > 0) {
        blocks.push({ part: currentPart, lines: currentBlockLines, startLine: currentBlockStartLine });
        currentBlockLines = [];
      }
      currentPart = "PART_3";
      continue;
    }

    // Detect Question Start: "Câu 1:", "Câu 1.", "Câu 1 :"
    if (/^Câu\s*\d+\s*[:.]/i.test(line)) {
      if (currentBlockLines.length > 0) {
        blocks.push({ part: currentPart, lines: currentBlockLines, startLine: currentBlockStartLine });
      }
      currentBlockLines = [line];
      currentBlockStartLine = i + 1;
    } else {
      if (currentBlockLines.length > 0) {
        currentBlockLines.push(line);
      }
    }
  }

  if (currentBlockLines.length > 0) {
    blocks.push({ part: currentPart, lines: currentBlockLines, startLine: currentBlockStartLine });
  }

  // Parse each question block
  blocks.forEach((block, bIdx) => {
    const blockText = block.lines.join("\n");
    const firstLine = block.lines[0];

    // Extract lessonId from tags e.g. [Mã bài: bai-01] or [bai-01] or default to "bai-01"
    let lessonId = "bai-01";
    const lessonMatch = firstLine.match(/\[(?:Mã bài|Bài|Lesson|Ma bai)?\s*[:=]?\s*(bai-?\d+|\d+)\]/i);
    if (lessonMatch) {
      const rawNum = lessonMatch[1].toLowerCase().replace("bai-", "").replace("bai", "");
      const padded = rawNum.padStart(2, "0");
      lessonId = `bai-${padded}`;
    }

    // Extract level from tags e.g. [Mức độ: Nhận biết] or [Nhận biết]
    let level: QuestionLevel = "Thông hiểu";
    if (/Nhận biết|NHAN_BIET|NB/i.test(firstLine)) level = "Nhận biết";
    else if (/Vận dụng cao|VAN_DUNG_CAO|VDC/i.test(firstLine)) level = "Vận dụng cao";
    else if (/Vận dụng|VAN_DUNG|VD/i.test(firstLine)) level = "Vận dụng";
    else if (/Thông hiểu|THONG_HIEU|TH/i.test(firstLine)) level = "Thông hiểu";

    // Clean question header from tags
    let questionContent = firstLine
      .replace(/^Câu\s*\d+\s*[:.]\s*/i, "")
      .replace(/\[(?:Mã bài|Bài|Lesson|Ma bai)?\s*[:=]?\s*(?:bai-?\d+|\d+)\]/gi, "")
      .replace(/\[(?:Mức độ|Muc do)?\s*[:=]?\s*(?:Nhận biết|Thông hiểu|Vận dụng cao|Vận dụng|NB|TH|VD|VDC)\]/gi, "")
      .trim();

    // Additional question lines until options / statements / answer
    let lineIdx = 1;
    while (
      lineIdx < block.lines.length &&
      !/^[A-D]\s*[\.\):]/i.test(block.lines[lineIdx]) &&
      !/^[a-d]\s*[\.\):]/i.test(block.lines[lineIdx]) &&
      !/^(?:Đáp án|Đ\/A|Answer|Lời giải|Giải thích|Đơn vị)/i.test(block.lines[lineIdx])
    ) {
      questionContent += " " + block.lines[lineIdx];
      lineIdx++;
    }

    // Extract explanation if present
    let explanation = "";
    const explMatch = blockText.match(/(?:Lời giải|Giải thích|Hướng dẫn|HD giải)\s*[:.]\s*([\s\S]+?)(?=\n[A-D]\.|$)/i);
    if (explMatch) {
      explanation = explMatch[1].trim();
    }

    const qId = `Q_WORD_${Date.now()}_${bIdx}`;

    // PARSE BASED ON PART
    if (block.part === "PART_1") {
      let optA = "";
      let optB = "";
      let optC = "";
      let optD = "";
      let ans: "A" | "B" | "C" | "D" = "A";

      for (let j = 0; j < block.lines.length; j++) {
        const l = block.lines[j];
        if (/^A\s*[\.\):]/i.test(l)) optA = l.replace(/^A\s*[\.\):]\s*/i, "").trim();
        else if (/^B\s*[\.\):]/i.test(l)) optB = l.replace(/^B\s*[\.\):]\s*/i, "").trim();
        else if (/^C\s*[\.\):]/i.test(l)) optC = l.replace(/^C\s*[\.\):]\s*/i, "").trim();
        else if (/^D\s*[\.\):]/i.test(l)) optD = l.replace(/^D\s*[\.\):]\s*/i, "").trim();
        else if (/^(?:Đáp án|Đ\/A|Answer)\s*[:.]\s*([A-D])/i.test(l)) {
          const m = l.match(/^(?:Đáp án|Đ\/A|Answer)\s*[:.]\s*([A-D])/i);
          if (m) ans = m[1].toUpperCase() as any;
        }
      }

      if (!optA || !optB || !optC || !optD) {
        errors.push({
          row: block.startLine,
          reason: `Câu ${bIdx + 1} (Phần I): Thiếu một trong các phương án A, B, C, D`,
        });
        return;
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_1",
        type: "MULTIPLE_CHOICE",
        level,
        questionText: questionContent || "Nội dung câu hỏi",
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        answer: ans,
        correctOption: ans,
        explanation,
      });
    } else if (block.part === "PART_2") {
      let subA = { text: "", isTrue: true };
      let subB = { text: "", isTrue: true };
      let subC = { text: "", isTrue: false };
      let subD = { text: "", isTrue: true };

      for (let j = 0; j < block.lines.length; j++) {
        const l = block.lines[j];
        if (/^a\s*[\.\):]/i.test(l)) {
          const isTrue = /\[\s*Đúng\s*\]|\(\s*Đúng\s*\)|\bĐúng\b/i.test(l);
          const cleanText = l.replace(/^a\s*[\.\):]\s*/i, "").replace(/\[\s*(?:Đúng|Sai)\s*\]|\(\s*(?:Đúng|Sai)\s*\)/gi, "").trim();
          subA = { text: cleanText, isTrue };
        } else if (/^b\s*[\.\):]/i.test(l)) {
          const isTrue = /\[\s*Đúng\s*\]|\(\s*Đúng\s*\)|\bĐúng\b/i.test(l);
          const cleanText = l.replace(/^b\s*[\.\):]\s*/i, "").replace(/\[\s*(?:Đúng|Sai)\s*\]|\(\s*(?:Đúng|Sai)\s*\)/gi, "").trim();
          subB = { text: cleanText, isTrue };
        } else if (/^c\s*[\.\):]/i.test(l)) {
          const isTrue = /\[\s*Đúng\s*\]|\(\s*Đúng\s*\)|\bĐúng\b/i.test(l);
          const cleanText = l.replace(/^c\s*[\.\):]\s*/i, "").replace(/\[\s*(?:Đúng|Sai)\s*\]|\(\s*(?:Đúng|Sai)\s*\)/gi, "").trim();
          subC = { text: cleanText, isTrue };
        } else if (/^d\s*[\.\):]/i.test(l)) {
          const isTrue = /\[\s*Đúng\s*\]|\(\s*Đúng\s*\)|\bĐúng\b/i.test(l);
          const cleanText = l.replace(/^d\s*[\.\):]\s*/i, "").replace(/\[\s*(?:Đúng|Sai)\s*\]|\(\s*(?:Đúng|Sai)\s*\)/gi, "").trim();
          subD = { text: cleanText, isTrue };
        }
      }

      if (!subA.text || !subB.text || !subC.text || !subD.text) {
        errors.push({
          row: block.startLine,
          reason: `Câu ${bIdx + 1} (Phần II): Cần đủ 4 nhận định a, b, c, d`,
        });
        return;
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_2",
        type: "TRUE_FALSE_GROUP",
        level,
        questionText: questionContent || "Cho các nhận định sau:",
        subAnswers: [
          { id: "a", statement: subA.text, correctAnswer: subA.isTrue },
          { id: "b", statement: subB.text, correctAnswer: subB.isTrue },
          { id: "c", statement: subC.text, correctAnswer: subC.isTrue },
          { id: "d", statement: subD.text, correctAnswer: subD.isTrue },
        ],
        explanation,
      });
    } else if (block.part === "PART_3") {
      let shortAnswer = "";
      let unit = "";
      let acceptedAnswers: string[] = [];

      for (let j = 0; j < block.lines.length; j++) {
        const l = block.lines[j];
        if (/^(?:Đáp án|Đ\/A|Answer)\s*[:.]\s*(.+)/i.test(l)) {
          const m = l.match(/^(?:Đáp án|Đ\/A|Answer)\s*[:.]\s*(.+)/i);
          if (m) shortAnswer = m[1].trim();
        } else if (/^(?:Đơn vị|Unit)\s*[:.]\s*(.+)/i.test(l)) {
          const m = l.match(/^(?:Đơn vị|Unit)\s*[:.]\s*(.+)/i);
          if (m) unit = m[1].trim();
        } else if (/^(?:Chấp nhận thêm|Chấp nhận|Accepted)\s*[:.]\s*(.+)/i.test(l)) {
          const m = l.match(/^(?:Chấp nhận thêm|Chấp nhận|Accepted)\s*[:.]\s*(.+)/i);
          if (m) {
            acceptedAnswers = m[1].split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
      }

      if (!shortAnswer) {
        errors.push({
          row: block.startLine,
          reason: `Câu ${bIdx + 1} (Phần III): Thiếu dòng 'Đáp án: [giá trị]'`,
        });
        return;
      }

      if (!acceptedAnswers.includes(shortAnswer)) {
        acceptedAnswers.push(shortAnswer);
      }

      validQuestions.push({
        id: qId,
        lessonId,
        part: "PART_3",
        type: "SHORT_ANSWER",
        level,
        questionText: questionContent || "Nội dung câu hỏi tính toán:",
        shortAnswer,
        correctAnswerText: shortAnswer,
        unit: unit || undefined,
        acceptableAnswers: acceptedAnswers,
        acceptedAnswers: acceptedAnswers,
        explanation,
      });
    }
  });

  return {
    validQuestions,
    errors,
    totalQuestionsParsed: blocks.length,
  };
}

/**
 * Extracts text from an uploaded .docx file and parses it into Question[]
 */
export async function parseWordQuestionBank(
  file: File,
  lessons?: Lesson[]
): Promise<WordImportValidationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  return parseRawTextToQuestions(rawText, lessons);
}

export const wordService = {
  downloadSampleTemplate: generateSampleWordTemplate,
  exportQuestionBankToWord,
  parseWordFile: parseWordQuestionBank,
  parseRawText: parseRawTextToQuestions,
};
