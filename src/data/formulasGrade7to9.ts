import { Formula } from "../types";

export const FORMULAS_GRADE_7: Formula[] = [
  { id: "f7_01", grade: 7, chapter: "Số hữu tỉ", title: "Phép cộng số hữu tỉ", formula: "a/b + c/d = (ad + bc)/(bd)", explanation: "Đưa về cùng mẫu rồi cộng tử", example: "1/3 + 2/5 = (5+6)/15 = 11/15", order: 1, published: true },
  { id: "f7_02", grade: 7, chapter: "Số thực", title: "Căn bậc hai", formula: "√a ≥ 0 và (√a)² = a (a ≥ 0)", explanation: "Căn bậc hai của số không âm", example: "√9 = 3 vì 3² = 9", order: 2, published: true },
  { id: "f7_03", grade: 7, chapter: "Số thực", title: "Giá trị tuyệt đối", formula: "|a| = a nếu a ≥ 0; |a| = -a nếu a < 0", explanation: "Khoảng cách từ a đến 0 trên trục số", example: "|-5| = 5, |3| = 3", order: 3, published: true },
  { id: "f7_04", grade: 7, chapter: "Góc và đường thẳng", title: "Góc đối đỉnh", formula: "Hai góc đối đỉnh bằng nhau", explanation: "Góc đối đỉnh luôn bằng nhau", example: "∠1 = ∠3, ∠2 = ∠4", order: 4, published: true },
  { id: "f7_05", grade: 7, chapter: "Góc và đường thẳng", title: "Hai đường thẳng song song", formula: "a // b → góc so le trong bằng nhau", explanation: "Nếu song song thì góc so le trong bằng nhau", example: "a//b, t cắt a,b → ∠1 = ∠5", order: 5, published: true },
  { id: "f7_06", grade: 7, chapter: "Tam giác", title: "Tổng 3 góc tam giác", formula: "∠A + ∠B + ∠C = 180°", explanation: "Tổng ba góc trong một tam giác", example: "∠A=60°, ∠B=70° → ∠C=50°", order: 6, published: true },
  { id: "f7_07", grade: 7, chapter: "Tam giác", title: "Tam giác cân", formula: "AB=AC → ∠B = ∠C", explanation: "Đường phân góc đồng thời là đường trung trực", example: "AB=AC=5, ∠A=40° → ∠B=∠C=70°", order: 7, published: true },
  { id: "f7_08", grade: 7, chapter: "Tỉ lệ thức", title: "Tỉ lệ thức", formula: "a/b = c/d ⟺ ad = bc", explanation: "Tích ngoài bằng tích trong", example: "2/3 = 4/6 → 2×6 = 3×4 = 12", order: 8, published: true },
  { id: "f7_09", grade: 7, chapter: "Tỉ lệ thức", title: "Đại lượng tỉ lệ thuận", formula: "y/x = k (k ≠ 0) → y = kx", explanation: "Khi x tăng thì y tăng theo", example: "Giá 1kg táo = 30k → y=30x", order: 9, published: true },
  { id: "f7_10", grade: 7, chapter: "Đa thức", title: "Phép cộng đơn thức", formula: "ax^n ± bx^n = (a ± b)x^n", explanation: "Cộng/trừ hệ số của cùng hạng tử", example: "3x² + 5x² = 8x²", order: 10, published: true },
];

export const FORMULAS_GRADE_8: Formula[] = [
  { id: "f8_01", grade: 8, chapter: "Đa thức", title: "Cộng đa thức", formula: "Thu gọn同类项 (hạng tử同同类)", explanation: "Gom các hạng tử cùng bậc", example: "(3x²+2x-1)+(x²-4x+5)=4x²-2x+4", order: 1, published: true },
  { id: "f8_02", grade: 8, chapter: "Đa thức", title: "Nhân đơn thức với đa thức", formula: "ax^n × (bx^m + cx^k) = abx^(n+m) + acx^(n+k)", explanation: "Nhân từng đơn thức", example: "2x(x²+3x-1)=2x³+6x²-2x", order: 2, published: true },
  { id: "f8_03", grade: 8, chapter: "Đa thức", title: "Hằng đẳng thức (a+b)²", formula: "(a+b)² = a² + 2ab + b²", explanation: "Bình phương tổng", example: "(x+3)² = x²+6x+9", order: 3, published: true },
  { id: "f8_04", grade: 8, chapter: "Đa thức", title: "Hằng đẳng thức (a-b)²", formula: "(a-b)² = a² - 2ab + b²", explanation: "Bình phương hiệu", example: "(x-2)² = x²-4x+4", order: 4, published: true },
  { id: "f8_05", grade: 8, chapter: "Đa thức", title: "Hằng đẳng thức (a+b)(a-b)", formula: "(a+b)(a-b) = a² - b²", explanation: "Hiệu hai bình phương", example: "(x+5)(x-5)=x²-25", order: 5, published: true },
  { id: "f8_06", grade: 8, chapter: "Tứ giác", title: "Diện tích hình bình hành", formula: "S = a × h (a=đáy, h=chiều cao)", explanation: "Hoặc S = ab·sin(α)", example: "a=8, h=5 → S=40", order: 6, published: true },
  { id: "f8_07", grade: 8, chapter: "Tứ giác", title: "Diện tích hình thoi", formula: "S = (d₁ × d₂) / 2", explanation: "d₁, d₂ là hai đường chéo", example: "d₁=6, d₂=8 → S=24", order: 7, published: true },
  { id: "f8_08", grade: 8, chapter: "Định lí Thalès", title: "Định lí Thalès", formula: "a//b → AA'/A'B' = BB'/B'C'", explanation: "Tỉ lệ đoạn thẳng khi song song", example: "AB/BC = DE/EF nếu a//b", order: 8, published: true },
  { id: "f8_09", grade: 8, chapter: "Pythagore", title: "Định lí Pythagore", formula: "a² + b² = c² (c là cạnh huyền)", explanation: "Trong tam giác vuông: bình phương cạnh huyền = tổng bình phương 2 cạnh góc vuông", example: "3²+4²=9+16=25=5²", order: 9, published: true },
  { id: "f8_10", grade: 8, chapter: "Tam giác đồng dạng", title: "Tam giác đồng dạng", formula: "△ABC ~ △A'B'C' (g.g hoặc c.c.c)", explanation: "2 góc bằng nhau hoặc 3 cạnh tỉ lệ", example: "AB/A'B' = AC/A'C' = BC/B'C'", order: 10, published: true },
  { id: "f8_11", grade: 8, chapter: "Hàm số", title: "Hàm số bậc nhất", formula: "y = ax + b (a ≠ 0)", explanation: "Đồ thị là đường thẳng", example: "y=2x+1: khi x=0→y=1, x=1→y=3", order: 11, published: true },
  { id: "f8_12", grade: 8, chapter: "Hàm số", title: "Hàm số y = ax²", formula: "y = ax² (a ≠ 0)", explanation: "Đồ thị là parabol, đỉnh tại O(0,0)", example: "y=x²: (-2,4), (-1,1), (0,0), (1,1), (2,4)", order: 12, published: true },
];

export const FORMULAS_GRADE_9: Formula[] = [
  { id: "f9_01", grade: 9, chapter: "Căn bậc hai, ba", title: "Căn bậc hai", formula: "√(a²) = |a|, √(ab) = √a × √b", explanation: "Tính chất căn bậc hai", example: "√(4×9)=√4×√9=2×3=6", order: 1, published: true },
  { id: "f9_02", grade: 9, chapter: "Căn bậc hai, ba", title: "Phép tính căn", formula: "√a ± √b (không rút được nếu a≠b)", explanation: "Chỉ cộng/trừ được cùng loại căn", example: "2√3 + 3√3 = 5√3", order: 2, published: true },
  { id: "f9_03", grade: 9, chapter: "Hệ phương trình", title: "Phương pháp thế", formula: "Từ (1) rút y=f(x), thế vào (2)", explanation: "Thế biến để giải hệ", example: "y=x+1 và 2x+y=5 → 2x+x+1=5 → x=4/3", order: 3, published: true },
  { id: "f9_04", grade: 9, chapter: "Hệ phương trình", title: "Phương pháp cộng trừ", formula: "Cộng/trừ 2 phương trình để loại biến", explanation: "Loại biến bằng phép cộng/trừ", example: "x+y=5, x-y=1 → cộng: 2x=6 → x=3", order: 4, published: true },
  { id: "f9_05", grade: 9, chapter: "Tam giác vuông", title: "Hệ thức lượng", formula: "sin A = a/c, cos A = b/c, tan A = a/b", explanation: "a=cạnh đối, b=cạnh kề, c=cạnh huyền", example: "△ABC vuông A, AB=3, AC=4, BC=5: sin B=4/5", order: 5, published: true },
  { id: "f9_06", grade: 9, chapter: "Tam giác vuông", title: "Định lí Sin", formula: "a/sin A = b/sin B = c/sin C = 2R", explanation: "R = bán kính đường tròn ngoại tiếp", example: "a=5, A=30° → 2R=5/sin30°=10", order: 6, published: true },
  { id: "f9_07", grade: 9, chapter: "Tam giác vuông", title: "Định lí Cos", formula: "a² = b² + c² - 2bc·cos A", explanation: "Liên hệ giữa cạnh và góc trong tam giác", example: "a²=3²+4²-2·3·4·cos60°=9+16-12=13", order: 7, published: true },
  { id: "f9_08", grade: 9, chapter: "Đường tròn", title: "Diện tích đường tròn", formula: "S = πr²", explanation: "r = bán kính", example: "r=5 → S=25π ≈ 78,54", order: 8, published: true },
  { id: "f9_09", grade: 9, chapter: "Đường tròn", title: "Chu vi đường tròn", formula: "C = 2πr = πd", explanation: "d = đường kính", example: "r=7 → C=14π ≈ 43,98", order: 9, published: true },
  { id: "f9_10", grade: 9, chapter: "Phương trình", title: "Phương trình bậc hai", formula: "ax² + bx + c = 0 (a≠0)", explanation: "Có thể giải bằng nghiệm ■", example: "Δ = b²-4ac, x = (-b ± √Δ)/2a", order: 10, published: true },
  { id: "f9_11", grade: 9, chapter: "Phương trình", title: "Hệ thức Vi-ét", formula: "x₁ + x₂ = -b/a; x₁·x₂ = c/a", explanation: "Tổng và tích nghiệm phương trình bậc hai", example: "x²-5x+6=0: x₁+x₂=5, x₁·x₂=6", order: 11, published: true },
  { id: "f9_12", grade: 9, chapter: "Hình học không gian", title: "Thể tích hình trụ", formula: "V = πr²h", explanation: "r=bán kính đáy, h=chiều cao", example: "r=3, h=10 → V=90π", order: 12, published: true },
  { id: "f9_13", grade: 9, chapter: "Hình học không gian", title: "Thể tích hình nón", formula: "V = πr²h/3", explanation: "r=bán kính đáy, h=chiều cao", example: "r=3, h=9 → V=27π", order: 13, published: true },
  { id: "f9_14", grade: 9, chapter: "Hình học không gian", title: "Thể tích hình cầu", formula: "V = 4πr³/3", explanation: "r=bán kính", example: "r=3 → V=36π", order: 14, published: true },
];
