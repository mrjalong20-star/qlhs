import { Lesson } from "../types";

// HÀM TIỆN TẠO BÀI HỌC
function L(
  id: string,
  lessonNumber: number,
  title: string,
  chapter: string,
  grade: 6 | 7 | 8 | 9 | 10 | 11 | 12,
  semester: 1 | 2
): Lesson {
  return {
    id,
    lessonNumber,
    title,
    chapter,
    grade,
    semester,
    durationMinutes: 45,
    allowReview: true,
    reviewMode: "FULL",
  };
}

// ============================================================
// TOÁN 6 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN6: Lesson[] = [
  // Học kì I
  L("6_01", 1, "Tập hợp, phần tử của tập hợp", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_02", 2, "Cách ghi số tự nhiên", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_03", 3, "Thứ tự trong tập hợp các số tự nhiên", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_04", 4, "Phép cộng và phép trừ số tự nhiên", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_05", 5, "Phép nhân và phép chia số tự nhiên", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_06", 6, "Lũy thừa với số mũ tự nhiên", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_07", 7, "Thứ tự thực hiện các phép tính", "Chương 1: Tập hợp các số tự nhiên", 6, 1),
  L("6_08", 8, "Quan hệ chia hết và tính chất", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_09", 9, "Dấu hiệu chia hết", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_10", 10, "Số nguyên tố", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_11", 11, "Phân tích một số ra thừa số nguyên tố", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_12", 12, "Ước chung, ƯCLN", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_13", 13, "Bội chung, BCNN", "Chương 2: Tính chia hết trong tập hợp các số tự nhiên", 6, 1),
  L("6_14", 14, "Số nguyên âm và tập hợp các số nguyên", "Chương 3: Số nguyên", 6, 1),
  L("6_15", 15, "Phép cộng các số nguyên", "Chương 3: Số nguyên", 6, 1),
  L("6_16", 16, "Phép trừ số nguyên, Quy tắc dấu ngoặc", "Chương 3: Số nguyên", 6, 1),
  L("6_17", 17, "Phép nhân, chia số nguyên", "Chương 3: Số nguyên", 6, 1),
  L("6_18", 18, "Tam giác đều, hình vuông, lục giác đều", "Chương 4: Một số hình phẳng trong thực tiễn", 6, 1),
  L("6_19", 19, "Hình chữ nhật, hình thoi, hình bình hành, hình thang cân", "Chương 4: Một số hình phẳng trong thực tiễn", 6, 1),
  L("6_20", 20, "Chu vi và diện tích của một số tứ giác đã học", "Chương 4: Một số hình phẳng trong thực tiễn", 6, 1),
  L("6_21", 21, "Tính đối xứng của hình phẳng trong tự nhiên", "Chương 5: Tính đối xứng của hình phẳng", 6, 1),
  // Học kì II
  L("6_22", 22, "Phân số với tử số và mẫu số là số nguyên", "Chương 6: Phân số", 6, 2),
  L("6_23", 23, "Tính chất cơ bản của phân số", "Chương 6: Phân số", 6, 2),
  L("6_24", 24, "So sánh phân số", "Chương 6: Phân số", 6, 2),
  L("6_25", 25, "Phép cộng, phép trừ phân số", "Chương 6: Phân số", 6, 2),
  L("6_26", 26, "Phép nhân, phép chia phân số", "Chương 6: Phân số", 6, 2),
  L("6_27", 27, "Hỗn số dương", "Chương 6: Phân số", 6, 2),
  L("6_28", 28, "Giá trị phân số của một số", "Chương 6: Phân số", 6, 2),
  L("6_29", 29, "Số thập phân", "Chương 7: Số thập phân", 6, 2),
  L("6_30", 30, "Phép tính với số thập phân", "Chương 7: Số thập phân", 6, 2),
  L("6_31", 31, "Tỉ số, tỉ số phần trăm", "Chương 7: Số thập phân", 6, 2),
  L("6_32", 32, "Điểm, đường thẳng, tia, đoạn thẳng", "Chương 8: Những hình hình học cơ bản", 6, 2),
  L("6_33", 33, "Độ dài đoạn thẳng, trung điểm", "Chương 8: Những hình hình học cơ bản", 6, 2),
  L("6_34", 34, "Góc, số đo góc", "Chương 8: Những hình hình học cơ bản", 6, 2),
  L("6_35", 35, "Dữ liệu và thu thập dữ liệu", "Chương 9: Dữ liệu và xác suất thực nghiệm", 6, 2),
  L("6_36", 36, "Bảng thống kê, biểu đồ", "Chương 9: Dữ liệu và xác suất thực nghiệm", 6, 2),
  L("6_37", 37, "Xác suất thực nghiệm", "Chương 9: Dữ liệu và xác suất thực nghiệm", 6, 2),
];

// ============================================================
// TOÁN 7 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN7: Lesson[] = [
  // Học kì I
  L("7_01", 1, "Tập hợp các số hữu tỉ", "Chương 1: Số hữu tỉ", 7, 1),
  L("7_02", 2, "Cộng, trừ, nhân, chia số hữu tỉ", "Chương 1: Số hữu tỉ", 7, 1),
  L("7_03", 3, "Lũy thừa của một số hữu tỉ", "Chương 1: Số hữu tỉ", 7, 1),
  L("7_04", 4, "Số vô tỉ. Căn bậc hai số học", "Chương 2: Số thực", 7, 1),
  L("7_05", 5, "Số thực. Giá trị tuyệt đối của số thực", "Chương 2: Số thực", 7, 1),
  L("7_06", 6, "Làm tròn số và ước lượng", "Chương 2: Số thực", 7, 1),
  L("7_07", 7, "Tỉ lệ thức", "Chương 6: Tỉ lệ thức và đại lượng tỉ lệ", 7, 2),
  L("7_08", 8, "Tính chất dãy tỉ số bằng nhau", "Chương 6: Tỉ lệ thức và đại lượng tỉ lệ", 7, 2),
  L("7_09", 9, "Đại lượng tỉ lệ thuận", "Chương 6: Tỉ lệ thức và đại lượng tỉ lệ", 7, 2),
  L("7_10", 10, "Đại lượng tỉ lệ nghịch", "Chương 6: Tỉ lệ thức và đại lượng tỉ lệ", 7, 2),
  L("7_11", 11, "Đơn thức, đa thức một biến", "Chương 7: Biểu thức đại số và đa thức một biến", 7, 2),
  L("7_12", 12, "Phép cộng, phép trừ đa thức một biến", "Chương 7: Biểu thức đại số và đa thức một biến", 7, 2),
  L("7_13", 13, "Phép nhân, phép chia đa thức", "Chương 7: Biểu thức đại số và đa thức một biến", 7, 2),
  L("7_14", 14, "Nghiệm của đa thức một biến", "Chương 7: Biểu thức đại số và đa thức một biến", 7, 2),
  L("7_15", 15, "Góc ở vị trí đặc biệt. Tia phân giác của góc", "Chương 3: Góc và đường thẳng song song", 7, 1),
  L("7_16", 16, "Hai đường thẳng song song", "Chương 3: Góc và đường thẳng song song", 7, 1),
  L("7_17", 17, "Định lí và chứng minh định lí", "Chương 3: Góc và đường thẳng song song", 7, 1),
  L("7_18", 18, "Tam giác bằng nhau", "Chương 4: Tam giác bằng nhau", 7, 1),
  L("7_19", 19, "Tam giác cân. Đường trung trực của đoạn thẳng", "Chương 4: Tam giác bằng nhau", 7, 1),
  L("7_20", 20, "Ba đường trung tuyến, ba đường phân giác", "Chương 5: Quan hệ giữa các yếu tố trong tam giác", 7, 2),
  L("7_21", 21, "Ba đường trung trực, ba đường cao", "Chương 5: Quan hệ giữa các yếu tố trong tam giác", 7, 2),
  L("7_22", 22, "Xác suất của biến cố", "Chương 8: Làm quen với biến cố và xác suất", 7, 2),
];

// ============================================================
// TOÁN 8 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN8: Lesson[] = [
  // Học kì I
  L("8_01", 1, "Đơn thức, đa thức", "Chương 1: Đa thức", 8, 1),
  L("8_02", 2, "Phép cộng, trừ đa thức", "Chương 1: Đa thức", 8, 1),
  L("8_03", 3, "Phép nhân đa thức", "Chương 1: Đa thức", 8, 1),
  L("8_04", 4, "Phép chia đa thức", "Chương 1: Đa thức", 8, 1),
  L("8_05", 5, "Hằng đẳng thức đáng nhớ", "Chương 1: Đa thức", 8, 1),
  L("8_06", 6, "Phân tích đa thức thành nhân tử", "Chương 1: Đa thức", 8, 1),
  L("8_07", 7, "Phân thức đại số", "Chương 6: Phân thức đại số", 8, 2),
  L("8_08", 8, "Tính chất cơ bản của phân thức", "Chương 6: Phân thức đại số", 8, 2),
  L("8_09", 9, "Các phép toán trên phân thức đại số", "Chương 6: Phân thức đại số", 8, 2),
  L("8_10", 10, "Hàm số bậc nhất", "Chương 7: Hàm số bậc nhất và hàm số y = ax²", 8, 2),
  L("8_11", 11, "Đồ thị hàm số bậc nhất", "Chương 7: Hàm số bậc nhất và hàm số y = ax²", 8, 2),
  L("8_12", 12, "Hàm số y = ax²", "Chương 7: Hàm số bậc nhất và hàm số y = ax²", 8, 2),
  L("8_13", 13, "Tứ giác", "Chương 3: Tứ giác", 8, 1),
  L("8_14", 14, "Hình thang, hình thang cân", "Chương 3: Tứ giác", 8, 1),
  L("8_15", 15, "Hình bình hành", "Chương 3: Tứ giác", 8, 1),
  L("8_16", 16, "Hình chữ nhật, hình thoi, hình vuông", "Chương 3: Tứ giác", 8, 1),
  L("8_17", 17, "Định lí Thalès trong tam giác", "Chương 4: Định lí Thalès và định lí Pythagore", 8, 1),
  L("8_18", 18, "Định lí Pythagore", "Chương 4: Định lí Thalès và định lí Pythagore", 8, 1),
  L("8_19", 19, "Tam giác đồng dạng", "Chương 5: Tam giác đồng dạng", 8, 2),
  L("8_20", 20, "Hình đồng dạng, hình vị tự", "Chương 5: Tam giác đồng dạng", 8, 2),
  L("8_21", 21, "Thu thập và phân loại dữ liệu", "Chương 8: Mở đầu về xác suất của biến cố", 8, 2),
  L("8_22", 22, "Xác suất của biến cố", "Chương 8: Mở đầu về xác suất của biến cố", 8, 2),
];

// ============================================================
// TOÁN 9 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN9: Lesson[] = [
  // Học kì I
  L("9_01", 1, "Căn bậc hai. Căn bậc ba", "Chương 1: Căn bậc hai và căn bậc ba", 9, 1),
  L("9_02", 2, "Tính chất và phép tính với căn thức", "Chương 1: Căn bậc hai và căn bậc ba", 9, 1),
  L("9_03", 3, "Phương trình bậc nhất hai ẩn", "Chương 2: Hệ hai phương trình bậc nhất hai ẩn", 9, 1),
  L("9_04", 4, "Hệ hai phương trình bậc nhất hai ẩn", "Chương 2: Hệ hai phương trình bậc nhất hai ẩn", 9, 1),
  L("9_05", 5, "Hàm số y = ax²", "Chương 7: Hàm số y = ax² và phương trình bậc hai một ẩn", 9, 2),
  L("9_06", 6, "Phương trình bậc hai một ẩn", "Chương 7: Hàm số y = ax² và phương trình bậc hai một ẩn", 9, 2),
  L("9_07", 7, "Hệ thức Vi-ét", "Chương 7: Hàm số y = ax² và phương trình bậc hai một ẩn", 9, 2),
  L("9_08", 8, "Hệ thức lượng trong tam giác vuông", "Chương 4: Hệ thức lượng trong tam giác vuông", 9, 1),
  L("9_09", 9, "Tỉ số lượng giác của góc nhọn", "Chương 4: Hệ thức lượng trong tam giác vuông", 9, 1),
  L("9_10", 10, "Đường tròn", "Chương 5: Đường tròn", 9, 1),
  L("9_11", 11, "Góc với đường tròn", "Chương 5: Đường tròn", 9, 1),
  L("9_12", 12, "Hình trụ, hình nón, hình cầu", "Chương 6: Hình trụ, hình nón, hình cầu", 9, 2),
  L("9_13", 13, "Phép thử và biến cố", "Chương 8: Xác suất của biến cố", 9, 2),
  L("9_14", 14, "Xác suất của biến cố", "Chương 8: Xác suất của biến cố", 9, 2),
];

// ============================================================
// TOÁN 10 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN10: Lesson[] = [
  // Học kì I
  L("10_01", 1, "Mệnh đề", "Chương 1: Mệnh đề và tập hợp", 10, 1),
  L("10_02", 2, "Tập hợp và các phép toán trên tập hợp", "Chương 1: Mệnh đề và tập hợp", 10, 1),
  L("10_03", 3, "Bất phương trình bậc nhất hai ẩn", "Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn", 10, 1),
  L("10_04", 4, "Hệ bất phương trình bậc nhất hai ẩn", "Chương 2: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn", 10, 1),
  L("10_05", 5, "Giá trị lượng giác của góc lượng giác", "Chương 3: Cung và góc lượng giác. Công thức lượng giác", 10, 1),
  L("10_06", 6, "Công thức lượng giác", "Chương 3: Cung và góc lượng giác. Công thức lượng giác", 10, 1),
  L("10_07", 7, "Hàm số lượng giác và đồ thị", "Chương 3: Cung và góc lượng giác. Công thức lượng giác", 10, 1),
  L("10_08", 8, "Hàm số và đồ thị", "Chương 4: Hàm số bậc hai và hàm số y = ax²", 10, 1),
  L("10_09", 9, "Hàm số bậc hai", "Chương 4: Hàm số bậc hai và hàm số y = ax²", 10, 1),
  L("10_10", 10, "Thống kê các số đặc trưng của mẫu số liệu", "Chương 5: Mẫu số liệu và các đặc trưng của mẫu số liệu", 10, 1),
  L("10_11", 11, "Đường thẳng trong mặt phẳng tọa độ", "Chương 7: Phương pháp tọa độ trong mặt phẳng", 10, 2),
  L("10_12", 12, "Phương trình đường tròn", "Chương 7: Phương pháp tọa độ trong mặt phẳng", 10, 2),
  L("10_13", 13, "Ba đường conic", "Chương 7: Phương pháp tọa độ trong mặt phẳng", 10, 2),
  L("10_14", 14, "Hoán vị, chỉnh hợp, tổ hợp", "Chương 8: Đại số tổ hợp", 10, 2),
  L("10_15", 15, "Nhị thức Newton", "Chương 8: Đại số tổ hợp", 10, 2),
  L("10_16", 16, "Đường thẳng và mặt phẳng trong không gian", "Chương 9: Quan hệ vuông góc trong không gian", 10, 2),
  L("10_17", 17, "Góc giữa đường thẳng và mặt phẳng", "Chương 9: Quan hệ vuông góc trong không gian", 10, 2),
];

// ============================================================
// TOÁN 11 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN11: Lesson[] = [
  // Học kì I
  L("BAI_01", 1, "Giá trị lượng giác của góc lượng giác", "Chương 1: Hàm số lượng giác và phương trình lượng giác", 11, 1),
  L("BAI_02", 2, "Công thức lượng giác", "Chương 1: Hàm số lượng giác và phương trình lượng giác", 11, 1),
  L("BAI_03", 3, "Hàm số lượng giác", "Chương 1: Hàm số lượng giác và phương trình lượng giác", 11, 1),
  L("BAI_04", 4, "Phương trình lượng giác cơ bản", "Chương 1: Hàm số lượng giác và phương trình lượng giác", 11, 1),
  L("BAI_05", 5, "Luyện tập chung", "Chương 1: Hàm số lượng giác và phương trình lượng giác", 11, 1),
  L("BAI_06", 6, "Dãy số", "Chương 2: Dãy số. Cấp số cộng và cấp số nhân", 11, 1),
  L("BAI_07", 7, "Cấp số cộng", "Chương 2: Dãy số. Cấp số cộng và cấp số nhân", 11, 1),
  L("BAI_08", 8, "Cấp số nhân", "Chương 2: Dãy số. Cấp số cộng và cấp số nhân", 11, 1),
  L("BAI_09", 9, "Luyện tập chung", "Chương 2: Dãy số. Cấp số cộng và cấp số nhân", 11, 1),
  L("BAI_10", 10, "Mẫu số liệu ghép nhóm", "Chương 3: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm", 11, 1),
  L("BAI_11", 11, "Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm", "Chương 3: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm", 11, 1),
  L("BAI_12", 12, "Luyện tập chung", "Chương 3: Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm", 11, 1),
  L("BAI_13", 13, "Hai đường thẳng song song", "Chương 4: Quan hệ song song trong không gian", 11, 1),
  L("BAI_14", 14, "Đường thẳng và mặt phẳng song song", "Chương 4: Quan hệ song song trong không gian", 11, 1),
  L("BAI_15", 15, "Hai mặt phẳng song song", "Chương 4: Quan hệ song song trong không gian", 11, 1),
  L("BAI_16", 16, "Luyện tập chung", "Chương 4: Quan hệ song song trong không gian", 11, 1),
  // Học kì II
  L("BAI_17", 17, "Giới hạn của dãy số", "Chương 5: Giới hạn. Hàm số liên tục", 11, 2),
  L("BAI_18", 18, "Giới hạn của hàm số", "Chương 5: Giới hạn. Hàm số liên tục", 11, 2),
  L("BAI_19", 19, "Hàm số liên tục", "Chương 5: Giới hạn. Hàm số liên tục", 11, 2),
  L("BAI_20", 20, "Luyện tập chung", "Chương 5: Giới hạn. Hàm số liên tục", 11, 2),
  L("BAI_21", 21, "Đường thẳng và mặt phẳng trong không gian", "Chương 6: Đường thẳng và mặt phẳng trong không gian. Quan hệ song song", 11, 2),
  L("BAI_22", 22, "Hai đường thẳng song song", "Chương 6: Đường thẳng và mặt phẳng trong không gian. Quan hệ song song", 11, 2),
  L("BAI_23", 23, "Đường thẳng và mặt phẳng song song", "Chương 6: Đường thẳng và mặt phẳng trong không gian. Quan hệ song song", 11, 2),
  L("BAI_24", 24, "Hai mặt phẳng song song", "Chương 6: Đường thẳng và mặt phẳng trong không gian. Quan hệ song song", 11, 2),
  L("BAI_25", 25, "Luyện tập chung", "Chương 6: Đường thẳng và mặt phẳng trong không gian. Quan hệ song song", 11, 2),
  L("BAI_26", 26, "Khoảng cách", "Chương 7: Quan hệ vuông góc trong không gian", 11, 2),
  L("BAI_27", 27, "Góc", "Chương 7: Quan hệ vuông góc trong không gian", 11, 2),
  L("BAI_28", 28, "Luyện tập chung", "Chương 7: Quan hệ vuông góc trong không gian", 11, 2),
];

// ============================================================
// TOÁN 12 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
// ============================================================
const TOAN12: Lesson[] = [
  // Học kì I
  L("12_01", 1, "Tính đơn điệu của hàm số", "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", 12, 1),
  L("12_02", 2, "Cực trị của hàm số", "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", 12, 1),
  L("12_03", 3, "Giá trị lớn nhất, giá trị nhỏ nhất", "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", 12, 1),
  L("12_04", 4, "Khảo sát và vẽ đồ thị hàm số", "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", 12, 1),
  L("12_05", 5, "Nguyên hàm", "Chương 4: Nguyên hàm và tích phân", 12, 2),
  L("12_06", 6, "Tích phân", "Chương 4: Nguyên hàm và tích phân", 12, 2),
  L("12_07", 7, "Ứng dụng của tích phân trong hình học", "Chương 4: Nguyên hàm và tích phân", 12, 2),
  L("12_08", 8, "Lũy thừa với số mũ thực", "Chương 2: Hàm số lũy thừa, hàm số mũ và hàm số lôgarit", 12, 1),
  L("12_09", 9, "Lôgarit", "Chương 2: Hàm số lũy thừa, hàm số mũ và hàm số lôgarit", 12, 1),
  L("12_10", 10, "Hàm số mũ và hàm số lôgarit", "Chương 2: Hàm số lũy thừa, hàm số mũ và hàm số lôgarit", 12, 1),
  L("12_11", 11, "Phương trình, bất phương trình mũ và lôgarit", "Chương 2: Hàm số lũy thừa, hàm số mũ và hàm số lôgarit", 12, 1),
  L("12_12", 12, "Xác suất có điều kiện", "Chương 6: Xác suất có điều kiện", 12, 2),
  L("12_13", 13, "Thống kê về mẫu số liệu", "Chương 5: Một số yếu tố thống kê và xác suất", 12, 2),
];

export const DEFAULT_LESSONS: Lesson[] = [
  ...TOAN6,
  ...TOAN7,
  ...TOAN8,
  ...TOAN9,
  ...TOAN10,
  ...TOAN11,
  ...TOAN12,
];

export const curriculumLessons = DEFAULT_LESSONS;