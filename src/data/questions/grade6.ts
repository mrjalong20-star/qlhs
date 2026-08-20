import { Question } from "../../types";

export const GRADE_6_QUESTIONS: Question[] = [
  // Bài 01: Tập hợp số tự nhiên
  { id: "Q_G6_01_01", lessonId: "6_01", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Tập hợp các số tự nhiên nhỏ hơn 5 là?", optionA: "{0,1,2,3,4}", optionB: "{1,2,3,4}", optionC: "{0,1,2,3,4,5}", optionD: "{1,2,3,4,5}", answer: "A", explanation: "Số tự nhiên bắt đầu từ 0. Nhỏ hơn 5 nghĩa là 0,1,2,3,4." },
  { id: "Q_G6_01_02", lessonId: "6_01", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Ký hiệu a ∈ A có nghĩa là?", optionA: "a là tập hợp con của A", optionB: "a là phần tử của A", optionC: "A là phần tử của a", optionD: "a bằng A", answer: "B", explanation: "∈ đọc là 'thuộc', biểu thị a là phần tử của tập hợp A." },
  // Bài 04: Phép cộng trừ số tự nhiên
  { id: "Q_G6_04_01", lessonId: "6_04", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "245 + 378 = ?", optionA: "613", optionB: "623", optionC: "633", optionD: "643", answer: "B", explanation: "245+378: 5+8=13 ( viết 3 nhớ 1), 4+7+1=12 (viết 2 nhớ 1), 2+3+1=6. Kết quả: 623." },
  { id: "Q_G6_04_02", lessonId: "6_04", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "Tính: 1000 - 367 = ?", optionA: "633", optionB: "643", optionC: "733", optionD: "743", answer: "A", explanation: "1000-367: mượn 1 từ hàng nghìn → 10-7=3, 9-6=3, 9-3=6 → 633." },
  // Bài 08: Chia hết
  { id: "Q_G6_08_01", lessonId: "6_08", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Số nào sau đây chia hết cho 3?", optionA: "245", optionB: "356", optionC: "357", optionD: "458", answer: "C", explanation: "357: 3+5+7=15, 15 chia hết cho 3 nên 357 chia hết cho 3." },
  { id: "Q_G6_08_02", lessonId: "6_08", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "ƯCLN của 12 và 18 là?", optionA: "3", optionB: "6", optionC: "9", optionD: "36", answer: "B", explanation: "12=2²×3, 18=2×3² → ƯCLN = 2×3 = 6." },
  { id: "Q_G6_08_03", lessonId: "6_08", part: "PART_3", type: "SHORT_ANSWER", level: "Thông hiểu", questionText: "Tìm BCNN của 4 và 6.", shortAnswer: "12", acceptableAnswers: ["12"], explanation: "4=2², 6=2×3 → BCNN=2²×3=12." },
  // Bài 14: Số nguyên
  { id: "Q_G6_14_01", lessonId: "6_14", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "(-5) + (-3) = ?", optionA: "-8", optionB: "8", optionC: "-2", optionD: "2", answer: "A", explanation: "Cộng hai số âm: cộng hai giá trị tuyệt đối rồi giữ dấu âm. 5+3=8, kết quả: -8." },
  { id: "Q_G6_14_02", lessonId: "6_14", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "7 - (-4) = ?", optionA: "3", optionB: "11", optionC: "-3", optionD: "-11", answer: "B", explanation: "Trừ đi một số âm: cộng với giá trị tuyệt đối. 7+4=11." },
  // Bài 20: Diện tích tứ giác
  { id: "Q_G6_20_01", lessonId: "6_20", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Diện tích hình chữ nhật có chiều dài 8cm, chiều rộng 5cm là:", optionA: "13cm²", optionB: "26cm²", optionC: "40cm²", optionD: "80cm²", answer: "C", explanation: "S = a × b = 8 × 5 = 40cm²." },
  { id: "Q_G6_20_02", lessonId: "6_20", part: "PART_3", type: "SHORT_ANSWER", level: "Thông hiểu", questionText: "Hình tam giác có đáy 6cm, chiều cao 4cm. Tính diện tích.", shortAnswer: "12", acceptableAnswers: ["12", "12cm²"], explanation: "S = a×h/2 = 6×4/2 = 12cm²." },
  // Bài 25: Phép cộng phân số
  { id: "Q_G6_25_01", lessonId: "6_25", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "2/5 + 1/5 = ?", optionA: "3/5", optionB: "3/10", optionC: "2/25", optionD: "1/5", answer: "A", explanation: "Cùng mẫu số: cộng tử số. 2/5 + 1/5 = (2+1)/5 = 3/5." },
  { id: "Q_G6_25_02", lessonId: "6_25", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "1/3 + 1/4 = ?", optionA: "2/7", optionB: "7/12", optionC: "1/12", optionD: "4/7", answer: "B", explanation: "Khác mẫu: 1/3+1/4 = (4+3)/12 = 7/12." },
  // Bài 30: Phép tính thập phân
  { id: "Q_G6_30_01", lessonId: "6_30", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "3,5 × 2 = ?", optionA: "5,0", optionB: "6,0", optionC: "7,0", optionD: "7,5", answer: "C", explanation: "3,5 × 2 = 7,0." },
];

// Questions for Toan 8 — Dinh ly Pythagore
export const GRADE_8_QUESTIONS: Question[] = [
  { id: "Q_G8_18_01", lessonId: "8_18", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Trong tam giác vuông, định lí Pythagore phát biểu rằng:", optionA: "a + b = c", optionB: "a² + b² = c²", optionC: "a² - b² = c²", optionD: "a × b = c²", answer: "B", explanation: "Định lí Pythagore: a² + b² = c², với c là cạnh huyền." },
  { id: "Q_G8_18_02", lessonId: "8_18", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "Tam giác vuông có 2 cạnh góc vuông bằng 3cm và 4cm. Cạnh huyền bằng:", optionA: "6cm", optionB: "7cm", optionC: "5cm", optionD: "12cm", answer: "C", explanation: "c² = 3² + 4² = 9 + 16 = 25 → c = 5cm." },
  { id: "Q_G8_18_03", lessonId: "8_18", part: "PART_3", type: "SHORT_ANSWER", level: "Thông hiểu", questionText: "Tam giác vuông có cạnh huyền 10cm, một cạnh góc vuông 6cm. Cạnh góc vuông còn lại bằng bao nhiêu?", shortAnswer: "8", acceptableAnswers: ["8", "8cm"], explanation: "b² = 10² - 6² = 100 - 36 = 64 → b = 8cm." },
  // Định lí Thalès
  { id: "Q_G8_17_01", lessonId: "8_17", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Định lí Thalès liên quan đến:", optionA: "Tam giác cân", optionB: "Hai đường thẳng song song cắt hai cát tuyến", optionC: "Đường tròn", optionD: "Diện tích tam giác", answer: "B", explanation: "Định lí Thalès: nếu hai đường thẳng song song cắt hai cát tuyến thì tạo thành các đoạn thẳng tương ứng tỉ lệ." },
  { id: "Q_G8_17_02", lessonId: "8_17", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Vận dụng", questionText: "Cho tam giác ABC, D thuộc AB, E thuộc AC, DE//BC. Nếu AD=2, DB=3, AE=4 thì AC bằng:", optionA: "8", optionB: "10", optionC: "6", optionD: "12", answer: "B", explanation: "Theo Thalès: AD/DB = AE/EC → 2/3 = 4/EC → EC=6. AC = AE+EC = 4+6 = 10." },
];

// Questions for Toan 12 — Dao ham
export const GRADE_12_QUESTIONS: Question[] = [
  { id: "Q_G12_01_01", lessonId: "12_01", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "Đạo hàm của f(x) = x³ là:", optionA: "3x", optionB: "3x²", optionC: "x²", optionD: "3x³", answer: "B", explanation: "f'(x) = 3x^(3-1) = 3x²." },
  { id: "Q_G12_01_02", lessonId: "12_01", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "Cho f(x) = x² - 4x + 3. f'(2) = ?", optionA: "0", optionB: "-1", optionC: "1", optionD: "3", answer: "A", explanation: "f'(x) = 2x - 4. f'(2) = 2(2) - 4 = 0." },
  { id: "Q_G12_01_03", lessonId: "12_01", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Vận dụng", questionText: "Cho f(x) = x³ - 3x. f(x tăng trên khoảng nào?", optionA: "(-∞, -1) ∪ (1, +∞)", optionB: "(-1, 1)", optionC: "(0, +∞)", optionD: "(-∞, 0)", answer: "A", explanation: "f'(x)=3x²-3=3(x²-1). f'(x)>0 khi x<-1 hoặc x>1." },
  { id: "Q_G12_08_01", lessonId: "12_09", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Nhận biết", questionText: "log₂8 = ?", optionA: "2", optionB: "3", optionC: "4", optionD: "8", answer: "B", explanation: "log₂8 = 3 vì 2³ = 8." },
  { id: "Q_G12_09_01", lessonId: "12_09", part: "PART_1", type: "MULTIPLE_CHOICE", level: "Thông hiểu", questionText: "∫2x dx = ?", optionA: "x² + C", optionB: "2x² + C", optionC: "x + C", optionD: "2 + C", answer: "A", explanation: "∫2x dx = 2·x²/2 + C = x² + C." },
  { id: "Q_G12_09_02", lessonId: "12_09", part: "PART_3", type: "SHORT_ANSWER", level: "Thông hiểu", questionText: "Tính ∫[0,2] x dx.", shortAnswer: "2", acceptableAnswers: ["2"], explanation: "∫[0,2] x dx = x²/2 |₀² = 4/2 - 0 = 2." },
];
