/**
 * =========================================================================
 * GOOGLE APPS SCRIPT BACKEND API - HỆ THỐNG LUYỆN TẬP TOÁN 11 (GDPT 2018)
 * Năm học 2026–2027
 * =========================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở Google Sheets của bạn.
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết code mặc định và dán toàn bộ nội dung file này vào.
 * 4. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 * 5. Loại: Ứng dụng web (Web app).
 * 6. Thực thi dưới dạng (Execute as): "Tôi" (Me).
 * 7. Người có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 8. Bấm Triển khai và Copy Web App URL dán vào Cài đặt của Website.
 */

export const APPS_SCRIPT_CODE = `/**
 * Google Apps Script API cho Hệ thống Luyện tập Toán 11
 * Phiên bản: 2.0 (Chương trình GDPT 2018)
 */

// Cấu hình mật khẩu Admin mặc định (Có thể thay đổi trong Script Properties: ADMIN_PASSWORD)
var DEFAULT_ADMIN_PASSWORD = "admin@123456";

/**
 * Xử lý HTTP GET
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "ping";
    
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Google Apps Script Backend Toán 11 đang hoạt động tốt.",
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === "getSummary") {
      var summaryData = getSummaryData();
      return jsonResponse({ success: true, data: summaryData });
    }
    
    if (action === "getLessonResults") {
      var lessonId = params.lessonId || "BAI_01";
      var results = getLessonData(lessonId);
      return jsonResponse({ success: true, data: results });
    }
    
    if (action === "getStudentResults") {
      var studentName = params.studentName || "";
      var className = params.className || "";
      var studentData = getStudentData(studentName, className);
      return jsonResponse({ success: true, data: studentData });
    }
    
    if (action === "getQuestionStatistics") {
      var stats = calculateQuestionStatistics();
      return jsonResponse({ success: true, data: stats });
    }

    return jsonResponse({ success: false, message: "Action không hợp lệ: " + action });
  } catch (err) {
    logSystemError("doGet_Error", err.toString());
    return jsonResponse({ success: false, message: "Lỗi máy chủ Apps Script: " + err.toString() });
  }
}

/**
 * Xử lý HTTP POST
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Chống xung đột khi nhiều học sinh nộp bài cùng lúc (Lock 10 giây)
    lock.waitLock(10000);
    
    var requestData = {};
    if (e && e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.payload) {
      requestData = JSON.parse(e.parameter.payload);
    } else {
      return jsonResponse({ success: false, message: "Không tìm thấy dữ liệu yêu cầu (empty payload)." });
    }

    var action = requestData.action || "SUBMIT_EXAM";

    // 1. Xác thực đăng nhập giáo viên
    if (action === "ADMIN_LOGIN") {
      var inputPass = requestData.password || "";
      var validPass = getAdminPassword();
      if (inputPass === validPass) {
        return jsonResponse({
          success: true,
          message: "Đăng nhập quản trị thành công.",
          token: "auth_" + Utilities.getUuid()
        });
      } else {
        return jsonResponse({ success: false, message: "Mật khẩu quản trị không chính xác." });
      }
    }

    // 2. Học sinh nộp bài luyện tập / thi thử
    if (action === "SUBMIT_EXAM") {
      return handleSubmission(requestData);
    }

    return jsonResponse({ success: false, message: "Action POST không được hỗ trợ: " + action });
  } catch (err) {
    logSystemError("doPost_Error", err.toString());
    return jsonResponse({ success: false, message: "Lỗi xử lý nộp bài: " + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xử lý nộp bài thi và chấm điểm an toàn trên Server
 */
function handleSubmission(payload) {
  var attemptId = payload.attemptId;
  var studentName = (payload.studentName || "").trim();
  var className = (payload.className || "").trim();
  var lessonId = (payload.lessonId || "").trim().toUpperCase();
  var lessonTitle = payload.lessonTitle || lessonId;
  var answers = payload.answers || {};
  var timeSpent = payload.timeSpentSeconds || 0;

  // Validation
  if (!attemptId || !studentName || !className || !lessonId) {
    logSystemError("VALIDATION_FAIL", "Thiếu thông tin bắt buộc: " + JSON.stringify(payload));
    return jsonResponse({ success: false, message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin học sinh." });
  }

  // 1. Kiểm tra sheet bài học, tự động tạo nếu chưa tồn tại
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = sanitizeSheetName(lessonId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = createLessonSheet(ss, sheetName, lessonTitle);
  }

  // 2. Chống nộp trùng (Idempotency check qua attemptId)
  if (isDuplicateAttempt(sheet, attemptId)) {
    logSystemError("DUPLICATE_ATTEMPT", "Lượt làm bài trùng lặp: " + attemptId + " (" + studentName + " - " + className + ")");
    return jsonResponse({
      success: true,
      message: "Lượt làm bài này đã được ghi nhận trước đó.",
      data: { attemptId: attemptId, status: "ALREADY_SUBMITTED" }
    });
  }

  // 3. Tính số lần làm bài của học sinh đối với bài này
  var attemptNumber = getStudentAttemptCount(sheet, studentName, className) + 1;

  // 4. Chấm điểm trực tiếp tại Server dựa trên payload chuẩn
  var scoreResult = gradeSubmissionServer(payload, answers);

  // 5. Ghi dòng dữ liệu vào Sheet Bài học
  var submittedAt = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  
  var rowData = [
    new Date(),                       // A: Timestamp
    attemptId,                        // B: attemptId
    studentName,                      // C: Họ và tên
    className,                        // D: Lớp
    lessonTitle,                      // E: Bài học
    attemptNumber,                    // F: Lần làm
    scoreResult.totalScore,           // G: Điểm tổng
    scoreResult.part1Score,           // H: Điểm Phần I
    scoreResult.part2Score,           // I: Điểm Phần II
    scoreResult.part3Score,           // J: Điểm Phần III
    scoreResult.correctQuestionsCount,// K: Số câu đúng
    scoreResult.wrongQuestionsCount,  // L: Số câu sai
    scoreResult.unansweredCount,      // M: Số câu bỏ trống
    timeSpent,                        // N: Thời gian làm bài (giây)
    JSON.stringify(answers),          // O: Answers Raw JSON
    JSON.stringify(scoreResult.wrongQuestionIds), // P: WrongQuestions
    submittedAt                       // Q: SubmittedAt
  ];

  sheet.appendRow(rowData);

  // 6. Cập nhật Bảng Tổng Hợp (TONG_HOP)
  updateSummarySheet(ss, studentName, className, lessonId, scoreResult.totalScore);

  return jsonResponse({
    success: true,
    message: "Nộp bài thành công và đã ghi nhận vào Google Sheets.",
    data: {
      attemptId: attemptId,
      studentName: studentName,
      className: className,
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      totalScore: scoreResult.totalScore,
      part1Score: scoreResult.part1Score,
      part2Score: scoreResult.part2Score,
      part3Score: scoreResult.part3Score,
      maxScore: 10,
      correctQuestionsCount: scoreResult.correctQuestionsCount,
      totalQuestionsCount: scoreResult.totalQuestionsCount,
      wrongQuestionsCount: scoreResult.wrongQuestionsCount,
      unansweredCount: scoreResult.unansweredCount,
      timeSpentSeconds: timeSpent,
      submittedAt: submittedAt,
      attemptNumber: attemptNumber,
      details: scoreResult.details,
      wrongQuestionIds: scoreResult.wrongQuestionIds
    }
  });
}

/**
 * Thuật toán chấm điểm an toàn tại Server theo Chuẩn GDPT 2018
 */
function gradeSubmissionServer(payload, answers) {
  // Điểm được chấm dựa trên chi tiết câu hỏi gửi kèm hoặc ngân hàng câu hỏi
  // Chuẩn hóa GDPT 2018:
  // Phần 1: Trắc nghiệm 4 lựa chọn (A, B, C, D)
  // Phần 2: Đúng/Sai (Đúng 1 ý: 0.1đ, Đúng 2 ý: 0.25đ, Đúng 3 ý: 0.5đ, Đúng 4 ý: 1.0đ)
  // Phần 3: Trả lời ngắn số học / từ khóa chuẩn hóa
  
  var questions = payload.questions || [];
  var totalQuestionsCount = questions.length;
  var correctQuestionsCount = 0;
  var wrongQuestionsCount = 0;
  var unansweredCount = 0;
  var wrongQuestionIds = [];
  var details = [];

  var p1Earned = 0, p1Max = 0;
  var p2Earned = 0, p2Max = 0;
  var p3Earned = 0, p3Max = 0;

  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var userAns = answers[q.id];

    if (q.part === "PART_1") {
      var chosen = userAns ? userAns.part1Answer : null;
      var isAnswered = chosen ? true : false;
      var isCorrect = isAnswered && (chosen === q.answer);
      var weight = 1.0;
      p1Max += weight;

      if (!isAnswered) {
        unansweredCount++;
        wrongQuestionIds.push(q.id);
      } else if (isCorrect) {
        p1Earned += weight;
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(q.id);
      }

      details.push({
        questionId: q.id,
        part: "PART_1",
        type: "MULTIPLE_CHOICE",
        isCorrect: isCorrect,
        studentAnswerDisplay: chosen || "(Chưa chọn)",
        correctAnswerDisplay: q.answer || "N/A",
        explanation: q.explanation || ""
      });
    } else if (q.part === "PART_2") {
      var subAns = (userAns && userAns.part2Answers) ? userAns.part2Answers : {};
      var subStatements = q.subAnswers || [];
      var subCorrect = 0;
      var hasAnyAnswer = false;

      for (var s = 0; s < subStatements.length; s++) {
        var sub = subStatements[s];
        var userChoice = subAns[sub.id];
        if (userChoice !== undefined && userChoice !== null) hasAnyAnswer = true;
        if (userChoice === sub.correctAnswer) {
          subCorrect++;
        }
      }

      // Thang điểm Phần II chuẩn GDPT 2018
      var qScore = 0;
      if (subCorrect === 1) qScore = 0.1;
      else if (subCorrect === 2) qScore = 0.25;
      else if (subCorrect === 3) qScore = 0.5;
      else if (subCorrect === 4) qScore = 1.0;

      p2Earned += qScore;
      p2Max += 1.0;

      if (!hasAnyAnswer) {
        unansweredCount++;
        wrongQuestionIds.push(q.id);
      } else if (subCorrect === 4) {
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(q.id);
      }

      details.push({
        questionId: q.id,
        part: "PART_2",
        type: "TRUE_FALSE_GROUP",
        isCorrect: subCorrect === 4,
        earnedScore: qScore,
        maxScore: 1.0,
        studentAnswerDisplay: "Đúng " + subCorrect + "/4 ý",
        explanation: q.explanation || ""
      });
    } else if (q.part === "PART_3") {
      var rawInput = (userAns && userAns.part3Answer) ? String(userAns.part3Answer).trim() : "";
      var isAns = rawInput.length > 0;
      var isMatch = isAns && compareShortAnswer(rawInput, q.shortAnswer, q.acceptableAnswers, q.tolerance);
      var w3 = 1.0;
      p3Max += w3;

      if (!isAns) {
        unansweredCount++;
        wrongQuestionIds.push(q.id);
      } else if (isMatch) {
        p3Earned += w3;
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(q.id);
      }

      details.push({
        questionId: q.id,
        part: "PART_3",
        type: "SHORT_ANSWER",
        isCorrect: isMatch,
        studentAnswerDisplay: rawInput || "(Chưa điền)",
        correctAnswerDisplay: q.shortAnswer || "N/A",
        explanation: q.explanation || q.formula || ""
      });
    }
  }

  // Quy đổi về thang điểm 10
  var totalMax = p1Max + p2Max + p3Max;
  var totalScore = 0;
  if (totalMax > 0) {
    totalScore = Math.round(((p1Earned + p2Earned + p3Earned) / totalMax) * 10 * 100) / 100;
  }

  return {
    totalScore: Math.min(10, Math.max(0, totalScore)),
    part1Score: Math.round(p1Earned * 100) / 100,
    part2Score: Math.round(p2Earned * 100) / 100,
    part3Score: Math.round(p3Earned * 100) / 100,
    correctQuestionsCount: correctQuestionsCount,
    totalQuestionsCount: totalQuestionsCount,
    wrongQuestionsCount: wrongQuestionsCount,
    unansweredCount: unansweredCount,
    wrongQuestionIds: wrongQuestionIds,
    details: details
  };
}

function compareShortAnswer(studentVal, correctVal, acceptableList, tolerance) {
  if (!studentVal) return false;
  var sClean = String(studentVal).trim().toLowerCase().replace(/\\s+/g, "").replace(/,/g, ".");
  var cClean = String(correctVal).trim().toLowerCase().replace(/\\s+/g, "").replace(/,/g, ".");

  if (sClean === cClean) return true;

  if (acceptableList && acceptableList.length) {
    for (var i = 0; i < acceptableList.length; i++) {
      var altClean = String(acceptableList[i]).trim().toLowerCase().replace(/\\s+/g, "").replace(/,/g, ".");
      if (sClean === altClean) return true;
    }
  }

  var sNum = parseFloat(sClean);
  var cNum = parseFloat(cClean);
  if (!isNaN(sNum) && !isNaN(cNum)) {
    var tol = tolerance !== undefined ? tolerance : 0.05;
    if (Math.abs(sNum - cNum) <= tol) return true;
  }

  return false;
}

/**
 * Kiểm tra xem attemptId đã được ghi nhận trước đó chưa
 */
function isDuplicateAttempt(sheet, attemptId) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  
  // Cột B chứa attemptId
  var ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === attemptId) {
      return true;
    }
  }
  return false;
}

/**
 * Đếm số lần làm bài trước đó của học sinh
 */
function getStudentAttemptCount(sheet, studentName, className) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;
  
  var data = sheet.getRange(2, 3, lastRow - 1, 2).getValues(); // Cột C (Tên) và D (Lớp)
  var count = 0;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === studentName.toLowerCase() && String(data[i][1]) === className) {
      count++;
    }
  }
  return count;
}

/**
 * Tạo mới Sheet cho một bài học với Header chuẩn và định dạng đẹp
 */
function createLessonSheet(ss, sheetName, lessonTitle) {
  var sheet = ss.insertSheet(sheetName);
  
  var headers = [
    "Timestamp",
    "attemptId",
    "Họ và tên",
    "Lớp",
    "Bài học",
    "Lần làm",
    "Điểm tổng",
    "Điểm Phần I",
    "Điểm Phần II",
    "Điểm Phần III",
    "Số câu đúng",
    "Số câu sai",
    "Số câu bỏ trống",
    "Thời gian (giây)",
    "Answers Raw",
    "Wrong Questions",
    "Submitted At"
  ];
  
  sheet.appendRow(headers);
  
  // Định dạng hàng tiêu đề
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1e3a8a"); // Xanh Navy đậm
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  // Tự động căn chỉnh độ rộng cột
  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
  
  logSystemError("SHEET_CREATED", "Tự động khởi tạo sheet bài học: " + sheetName + " (" + lessonTitle + ")");
  return sheet;
}

/**
 * Cập nhật bảng tổng hợp TONG_HOP
 */
function updateSummarySheet(ss, studentName, className, lessonId, newScore) {
  var sheetName = "TONG_HOP";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, 0); // Đặt ở vị trí đầu tiên
    var initialHeaders = ["Họ và tên", "Lớp", "Điểm TB", "Số bài đã làm", "Lần cập nhật cuối"];
    // Thêm các cột bài học từ BAI_01 đến BAI_32
    for (var i = 1; i <= 32; i++) {
      var bName = "Bài " + (i < 10 ? "0" + i : i);
      initialHeaders.splice(2 + (i - 1), 0, bName);
    }
    sheet.appendRow(initialHeaders);
    var hRange = sheet.getRange(1, 1, 1, initialHeaders.length);
    hRange.setBackground("#065f46"); // Xanh Emerald
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var lastRow = sheet.getLastRow();
  var studentRow = -1;

  if (lastRow > 1) {
    var names = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var r = 0; r < names.length; r++) {
      if (String(names[r][0]).toLowerCase() === studentName.toLowerCase() && String(names[r][1]) === className) {
        studentRow = r + 2;
        break;
      }
    }
  }

  // Tìm vị trí cột của bài học
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIndex = -1;
  var lessonNumMatch = lessonId.match(/\\d+/);
  var targetLabel = lessonNumMatch ? "Bài " + (parseInt(lessonNumMatch[0], 10) < 10 ? "0" + parseInt(lessonNumMatch[0], 10) : lessonNumMatch[0]) : lessonId;

  for (var c = 0; c < headers.length; c++) {
    if (headers[c] === targetLabel || headers[c] === lessonId) {
      colIndex = c + 1;
      break;
    }
  }

  var nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

  if (studentRow === -1) {
    // Thêm học sinh mới vào bảng tổng hợp
    var newRow = new Array(headers.length).fill("");
    newRow[0] = studentName;
    newRow[1] = className;
    if (colIndex !== -1) newRow[colIndex - 1] = newScore;
    newRow[headers.length - 3] = newScore; // Điểm TB tạm thời
    newRow[headers.length - 2] = 1;        // 1 bài hoàn thành
    newRow[headers.length - 1] = nowStr;
    sheet.appendRow(newRow);
  } else {
    // Cập nhật điểm (lấy điểm cao nhất)
    if (colIndex !== -1) {
      var currentScoreVal = sheet.getRange(studentRow, colIndex).getValue();
      if (currentScoreVal === "" || Number(newScore) > Number(currentScoreVal)) {
        sheet.getRange(studentRow, colIndex).setValue(newScore);
      }
    }
    sheet.getRange(studentRow, headers.length).setValue(nowStr);
  }
}

/**
 * Ghi log lỗi hệ thống vào sheet SYSTEM_LOG
 */
function logSystemError(eventType, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName("SYSTEM_LOG");
    if (!logSheet) {
      logSheet = ss.insertSheet("SYSTEM_LOG");
      logSheet.appendRow(["Timestamp", "Event Type", "Details"]);
      var r = logSheet.getRange(1, 1, 1, 3);
      r.setBackground("#7f1d1d");
      r.setFontColor("#ffffff");
      r.setFontWeight("bold");
    }
    logSheet.appendRow([new Date(), eventType, String(details)]);
  } catch (e) {
    Logger.log("Lỗi ghi log: " + e.toString());
  }
}

/**
 * Lấy mật khẩu quản trị từ Properties
 */
function getAdminPassword() {
  var props = PropertiesService.getScriptProperties();
  var pass = props.getProperty("ADMIN_PASSWORD");
  return pass ? pass : DEFAULT_ADMIN_PASSWORD;
}

function sanitizeSheetName(name) {
  var clean = name.replace(/[/\\\\?*\\[\\]:]/g, "_").trim();
  return clean.length > 30 ? clean.substring(0, 30) : clean;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
