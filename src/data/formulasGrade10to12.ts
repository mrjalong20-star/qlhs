import { Formula } from "../types";

export const FORMULAS_GRADE_10: Formula[] = [
  { id: "f10_01", grade: 10, chapter: "Mệnh đề", title: "Mệnh đề phủ định", formula: "¬(p ∧ q) = ¬p ∨ ¬q", explanation: "Định luật De Morgan", example: "¬(A>2 ∧ B<5) = A≤2 ∨ B≥5", order: 1, published: true },
  { id: "f10_02", grade: 10, chapter: "Tập hợp", title: "Phép toán tập hợp", formula: "A ∪ B, A ∩ B, A \\ B, A'", explanation: "Hội, giao, hiệu, bù", example: "A={1,2,3}, B={2,3,4} → A∩B={2,3}", order: 2, published: true },
  { id: "f10_03", grade: 10, chapter: "Lượng giác", title: "Công thức lượng giác cơ bản", formula: "sin²α + cos²α = 1", explanation: "Bình phương lượng giác", example: "sin30°=1/2, cos30°=√3/2 → (1/2)²+(√3/2)²=1", order: 3, published: true },
  { id: "f10_04", grade: 10, chapter: "Lượng giác", title: "Cộng lượng giác", formula: "sin(a±b) = sin a·cos b ± cos a·sin b", explanation: "Công thức cộng sin", example: "sin(60°+45°)=sin60·cos45+cos60·sin45", order: 4, published: true },
  { id: "f10_05", grade: 10, chapter: "Lượng giác", title: "Nhân lượng giác", formula: "2sin a·cos b = sin(a+b) + sin(a-b)", explanation: "Tích heoσα sang tổng", example: "2sin30·cos10=sin40+sin20", order: 5, published: true },
  { id: "f10_06", grade: 10, chapter: "Hàm số bậc hai", title: "Hàm số bậc hai", formula: "y = ax² + bx + c", explanation: "Đỉnh: x₀=-b/2a, y₀=c-b²/4a", example: "y=x²-4x+5: đỉnh (2,1)", order: 6, published: true },
  { id: "f10_07", grade: 10, chapter: "Tọa độ", title: "Phương trình đường thẳng", formula: "ax + by + c = 0", explanation: "Hoặc y = mx + n", example: "2x + 3y - 6 = 0", order: 7, published: true },
  { id: "f10_08", grade: 10, chapter: "Tổ hợp", title: "Hoán vị", formula: "P(n) = n!", explanation: "Sắp xếp n phần tử", example: "P(5)=5!=120", order: 8, published: true },
  { id: "f10_09", grade: 10, chapter: "Tổ hợp", title: "Chỉnh hợp", formula: "A(n,k) = n!/(n-k)!", explanation: "Chọn k từ n, có thứ tự", example: "A(5,3)=5!/(5-3)!=60", order: 9, published: true },
  { id: "f10_10", grade: 10, chapter: "Tổ hợp", title: "Tổ hợp", formula: "C(n,k) = n!/[k!(n-k)!]", explanation: "Chọn k từ n, không thứ tự", example: "C(5,3)=5!/(3!·2!)=10", order: 10, published: true },
  { id: "f10_11", grade: 10, chapter: "Tổ hợp", title: "Nhị thức Newton", formula: "(a+b)^n = Σ C(n,k)·a^(n-k)·b^k", explanation: "Mở rộng lũy thừa nhị thức", example: "(x+1)³=x³+3x²+3x+1", order: 11, published: true },
];

export const FORMULAS_GRADE_11: Formula[] = [
  { id: "f11_01", grade: 11, chapter: "Lượng giác", title: "Giá trị lượng giác", formula: "sin α = tung độ M, cos α = hoành độ M", explanation: "Trên đường tròn đơn vị", example: "sin30°=1/2, cos30°=√3/2", order: 1, published: true },
  { id: "f11_02", grade: 11, chapter: "Lượng giác", title: "Công thức lượng giác", formula: "tan α = sin α / cos α", explanation: "Tính tangent từ sin và cos", example: "sin45°=cos45°=√2/2 → tan45°=1", order: 2, published: true },
  { id: "f11_03", grade: 11, chapter: "Lượng giác", title: "Cộng sin", formula: "sin a + sin b = 2sin[(a+b)/2]·cos[(a-b)/2]", explanation: "Tổng sin thành tích", example: "sin50+sin10=2sin30·cos20=cos20", order: 3, published: true },
  { id: "f11_04", grade: 11, chapter: "Lượng giác", title: "Cộng cos", formula: "cos a + cos b = 2cos[(a+b)/2]·cos[(a-b)/2]", explanation: "Tổng cos thành tích", example: "cos80+cos20=2cos50·cos30", order: 4, published: true },
  { id: "f11_05", grade: 11, chapter: "Dãy số", title: "Cấp số cộng", formula: "u_n = u₁ + (n-1)d", explanation: "d = công sai", example: "u₁=2, d=3 → u₅=2+4·3=14", order: 5, published: true },
  { id: "f11_06", grade: 11, chapter: "Dãy số", title: "Tổng cấp số cộng", formula: "S_n = n(u₁ + u_n)/2 = n·u₁ + n(n-1)d/2", explanation: "Tổng n số hạng đầu", example: "2+5+8+11+14: n=5, S=5·(2+14)/2=40", order: 6, published: true },
  { id: "f11_07", grade: 11, chapter: "Dãy số", title: "Cấp số nhân", formula: "u_n = u₁ · q^(n-1)", explanation: "q = công bội", example: "u₁=2, q=3 → u₄=2·3³=54", order: 7, published: true },
  { id: "f11_08", grade: 11, chapter: "Dãy số", title: "Tổng cấp số nhân", formula: "S_n = u₁(q^n - 1)/(q - 1) (q≠1)", explanation: "Tổng n số hạng cấp số nhân", example: "2+6+18: S₃=2(27-1)/(3-1)=26", order: 8, published: true },
  { id: "f11_09", grade: 11, chapter: "Giới hạn", title: "Giới hạn dãy số", formula: "lim(n→∞) q^n = 0 nếu |q|<1", explanation: "Dãy lũy thừa với |q|<1 hội về 0", example: "lim (1/2)^n = 0", order: 9, published: true },
  { id: "f11_10", grade: 11, chapter: "Không gian", title: "Song song trong KG", formula: "a//b nếu a nằm ngoài α, a//α ∩ α=b", explanation: "a song song mặt phẳng", example: "Định lí: nếu a//α, b⊂α, a∩β=b, α∩β=c thì b//c", order: 10, published: true },
];

export const FORMULAS_GRADE_12: Formula[] = [
  { id: "f12_01", grade: 12, chapter: "Đạo hàm", title: "Đạo hàm", formula: "(x^n)' = nx^(n-1)", explanation: "Quy tắc lũy thừa", example: "(x³)'=3x², (x⁵)'=5x⁴", order: 1, published: true },
  { id: "f12_02", grade: 12, chapter: "Đạo hàm", title: "Đạo hàm tổng", formula: "(u+v)' = u' + v'", explanation: "Đạo hàm tổng bằng tổng đạo hàm", example: "(x²+3x)'=2x+3", order: 2, published: true },
  { id: "f12_03", grade: 12, chapter: "Đạo hàm", title: "Đạo hàm tích", formula: "(u·v)' = u'v + uv'", explanation: "Quy tắc tích", example: "(x·sin x)'=sinx+xcosx", order: 3, published: true },
  { id: "f12_04", grade: 12, chapter: "Đạo hàm", title: "Đạo hàm hợp", formula: "[f(g(x))]' = f'(g(x))·g'(x)", explanation: "Đạo hàm hàm hợp", example: "(sin2x)'=2cos2x", order: 4, published: true },
  { id: "f12_05", grade: 12, chapter: "Đạo hàm", title: "Cực trị", formula: "f'(x₀)=0 + xét dấu f'", explanation: "Tìm điểm cực trị", example: "f(x)=x³-3x: f'(x)=3x²-3=0 → x=±1", order: 5, published: true },
  { id: "f12_06", grade: 12, chapter: "Lũy thừa - Lôgarit", title: "Lũy thừa", formula: "a^x · a^y = a^(x+y)", explanation: "Cùng cơ sở thì cộng số mũ", example: "2³·2⁴=2⁷=128", order: 6, published: true },
  { id: "f12_07", grade: 12, chapter: "Lũy thừa - Lôgarit", title: "Lôgarit", formula: "log_a(x) = y ⟺ a^y = x", explanation: "Định nghĩa lôgarit", example: "log₂8=3 vì 2³=8", order: 7, published: true },
  { id: "f12_08", grade: 12, chapter: "Lũy thừa - Lôgarit", title: "Tính chất lôgarit", formula: "log_a(xy) = log_a(x) + log_a(y)", explanation: "Lôgarit tích bằng tổng lôgarit", example: "log₂(8·4)=log₂8+log₂4=3+2=5", order: 8, published: true },
  { id: "f12_09", grade: 12, chapter: "Nguyên hàm - Tích phân", title: "Nguyên hàm", formula: "∫x^n dx = x^(n+1)/(n+1) + C", explanation: "Nguyên hàm lũy thừa", example: "∫x²dx=x³/3+C", order: 9, published: true },
  { id: "f12_10", grade: 12, chapter: "Nguyên hàm - Tích phân", title: "Tích phân", formula: "∫[a,b] f(x)dx = F(b) - F(a)", explanation: "Công thức Newton – Leibniz", example: "∫[0,1] x²dx = 1/3 - 0 = 1/3", order: 10, published: true },
  { id: "f12_11", grade: 12, chapter: "Xác suất", title: "Xác suất có điều kiện", formula: "P(A|B) = P(A∩B)/P(B)", explanation: "Xác suất A xảy ra khi đã biết B", example: "P(2|màu đỏ) trong bộ bài", order: 11, published: true },
];
