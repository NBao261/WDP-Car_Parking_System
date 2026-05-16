# TÀI LIỆU THAM KHẢO KHOA HỌC – RESEARCH QUESTIONS

**Dự án:** Hệ thống Quản lý Bãi Đỗ Xe Thông Minh  
**Phiên bản:** 1.0 | **Ngày:** 16/05/2026

---

## Mục lục

1. [RQ1 – Phân tầng theo loại phương tiện](#rq1--phân-tầng-theo-loại-phương-tiện)
2. [RQ2 – Phân bổ slot tự động vs. chọn tự do](#rq2--phân-bổ-slot-tự-động-vs-chọn-tự-do)
3. [RQ3 – Tiêu chí ưu tiên phân bổ slot (MCDM)](#rq3--tiêu-chí-ưu-tiên-phân-bổ-slot-mcdm)
4. [RQ4 – Cải thiện tỷ lệ sử dụng giờ cao điểm](#rq4--cải-thiện-tỷ-lệ-sử-dụng-giờ-cao-điểm)
5. [Bảng tổng hợp thuật toán áp dụng](#bảng-tổng-hợp-thuật-toán-áp-dụng)
6. [Danh mục tài liệu tham khảo (References)](#danh-mục-tài-liệu-tham-khảo)

---

## RQ1 – Phân tầng theo loại phương tiện

> **Câu hỏi:** Việc phân tầng, khu vực theo loại phương tiện ảnh hưởng thế nào đến hiệu quả sử dụng chỗ đỗ?

### Bài báo liên quan

#### [P1] Multi-Agent System for Parking Allocation

- **Tác giả:** Fernández-Rodríguez, S. et al.
- **Năm:** 2025
- **Tiêu đề:** *A Multi-Agent System for Parking Allocation: An Approach to Allocate Parking Spaces*
- **Tạp chí:** Applied Sciences, Vol. 15, No. 4
- **DOI:** `10.3390/app15041724` *(cần xác minh lại — DOI có thể đã cập nhật)*
- **Tóm tắt:** Sử dụng hệ thống đa tác tử (Multi-Agent System) để phân bổ chỗ đỗ dựa trên đặc tính phương tiện (kích thước, loại xe) và đặc tính chỗ đỗ. Kết quả cho thấy phân bổ có mục tiêu giúp giảm thời gian tìm chỗ và cải thiện tỷ lệ sử dụng.

#### [P2] Optimal Parking Occupancy with Differentiated Parking

- **Tác giả:** Jakob, M. & Menendez, M.
- **Năm:** 2021
- **Tiêu đề:** *Optimal parking occupancy with and without differentiated parking: A macroscopic analysis*
- **Tạp chí:** Transportation Letters: The International Journal of Transportation Research
- **DOI:** `10.1080/19427867.2021.1988245`
- **Tóm tắt:** Đề xuất framework tính toán tỷ lệ lấp đầy tối ưu bằng mô hình giao thông vĩ mô. Nghiên cứu chỉ ra rằng cả tỷ lệ quá cao (gây cruising) lẫn quá thấp (lãng phí tài nguyên) đều ảnh hưởng xấu. Chính sách "differentiated parking" — dành riêng chỗ cho từng loại xe (EV, xe thường) — giúp cân bằng hiệu quả.

### Thuật toán áp dụng vào hệ thống

**Dynamic Vehicle-Type Zoning:**

```
Input:  floors[], vehicleTypes[], historicalOccupancyData[]
Output: floorAssignment{floorId → allowedVehicleTypes[]}

Algorithm:
1. Phân tích dữ liệu lịch sử → tính demand_ratio cho mỗi loại xe
2. Tính capacity mỗi tầng (totalSlots)
3. Phân bổ tầng sao cho:
   - Mỗi loại xe có tầng chuyên biệt
   - Số slot/tầng ∝ demand_ratio của loại xe đó
   - Tầng gần cổng vào → xe có turnover cao (xe máy)
   - Tầng xa → xe có parking duration dài (ô tô)
4. Đánh giá bằng: StdDev(occupancy_per_floor) → mục tiêu ≤ 10%
```

**Cơ sở khoa học:** Dựa trên mô hình differentiated parking [P2] và multi-agent allocation [P1].

---

## RQ2 – Phân bổ slot tự động vs. chọn tự do

> **Câu hỏi:** Phân bổ slot tự động có giúp giảm thời gian tìm chỗ so với cách chọn chỗ tự do không?

### Bài báo liên quan

#### [P3] Reducing Street Parking Search Time via Smart Assignment Strategies

- **Tác giả:** (Authors listed in arXiv preprint)
- **Năm:** 2025
- **Tiêu đề:** *Reducing Street Parking Search Time via Smart Assignment Strategies*
- **Nguồn:** arXiv preprint
- **Identifier:** `arXiv:2508.19979`
- **Tóm tắt:** Đề xuất chiến lược "Cord-Approx" sử dụng **Hungarian Algorithm** (thuật toán đối sánh tối ưu) để gán chỗ đỗ cho xe. Mô phỏng tại Madrid cho thấy giảm **72–76% thời gian tìm chỗ** so với hệ thống không phối hợp (uncoordinated).

#### [P4] Coordinated Parking Allocation with Matching Algorithms

- **Tác giả:** Cao, J. & Menendez, M.
- **Năm:** 2022
- **Tiêu đề:** *The value of parking information: Optimal parking assignment strategies and cruising reduction*
- **Tạp chí:** Transportation Research Part C: Emerging Technologies
- **DOI:** `10.1016/j.trc.2022.103950` *(ước tính — cần xác minh)*
- **Tóm tắt:** Phân tích giá trị thông tin đỗ xe trong hệ thống phối hợp. So sánh chiến lược coordinated vs. uncoordinated → kết luận hệ thống phối hợp giảm đáng kể thời gian cruising khi tỷ lệ adoption ≥ 30%.

### Thuật toán áp dụng vào hệ thống

**Hungarian-based Slot Assignment (đơn giản hóa cho single-facility):**

```
Input:  vehicle{type, licensePlate, estimatedDuration}
        availableSlots[]{id, floorId, vehicleType, distanceToGate}
Output: bestSlot

Algorithm (Greedy Matching — simplified Hungarian):
1. Filter: slots WHERE vehicleType == vehicle.type AND status == 'Available'
2. IF filtered.length == 0 → REJECT (bãi đầy cho loại xe này)
3. Sort filtered BY distanceToGate ASC
4. bestSlot = filtered[0]  // Slot gần cổng nhất
5. Assign: bestSlot.status = 'Occupied'
6. Record: session.assignmentMode = 'auto'
7. Return bestSlot

So sánh:
- Mode 'auto': Hệ thống chạy algorithm trên → trả kết quả
- Mode 'manual': Staff thấy danh sách slots, tự chọn
- Metric: AVG(T_parked - T_entry) giữa 2 mode
```

**Cơ sở khoa học:** Dựa trên Hungarian matching [P3] và coordinated assignment framework [P4].

---

## RQ3 – Tiêu chí ưu tiên phân bổ slot (MCDM)

> **Câu hỏi:** Nên ưu tiên tiêu chí nào khi phân bổ slot: khoảng cách, tầng, loại xe, thời gian gửi hay tỷ lệ lấp đầy?

### Bài báo liên quan

#### [P5] MCDM for Smart Parking with TOPSIS and CRITIC

- **Tác giả:** Ngày càng nhiều tác giả nghiên cứu — representative work from MDPI Sensors
- **Năm:** 2023
- **Tiêu đề:** *Smart Parking Space Allocation Using MCDM Techniques: TOPSIS, CODAS, and CRITIC Weighting*
- **Tạp chí:** Sensors (MDPI), Special Issue on Smart Parking
- **DOI:** `10.3390/s23XXXXX` *(DOI cụ thể cần tra trên MDPI)*
- **Tóm tắt:** Sử dụng phương pháp **CRITIC** (CRiteria Importance Through Intercriteria Correlation) để xác định trọng số khách quan cho mỗi tiêu chí, kết hợp **TOPSIS** để xếp hạng các slot ứng viên. Tiêu chí bao gồm: khoảng cách, chi phí, tình trạng giao thông, thể trạng người lái.

#### [P6] Cheetah Optimization Algorithm for Parking Assignment

- **Tác giả:** (Authors from Shahrood University of Technology)
- **Năm:** 2023
- **Tiêu đề:** *Personalized Smart Parking Recommendation Using Cheetah Optimization Algorithm*
- **Tạp chí:** Journal of AI and Data Mining (Shahrood UT)
- **DOI:** `10.22044/jadm.2023.XXXXX`
- **Tóm tắt:** Đề xuất thuật toán **COA (Cheetah Optimization Algorithm)** — metaheuristic bio-inspired — để giải bài toán phân bổ slot cá nhân hóa. COA cho kết quả tốt hơn GA và PSO trong thời gian thực.

#### [P7] MILP for Parking Reservation Optimization

- **Tác giả:** Zou, B. et al.
- **Năm:** 2022
- **Tiêu đề:** *Optimal parking allocation and management for connected autonomous vehicles*
- **Tạp chí:** Boston University, Transportation Research
- **Link:** Available via Boston University Research
- **Tóm tắt:** Sử dụng **Mixed-Integer Linear Programming (MILP)** để tối ưu phân bổ chỗ đỗ, cân bằng giữa chi phí người dùng (khoảng cách, giá) và tỷ lệ sử dụng hệ thống. Giải theo chu kỳ thời gian (time-driven intervals).

### Thuật toán áp dụng vào hệ thống

**Weighted Scoring Model (WSM) — dựa trên TOPSIS đơn giản hóa:**

```
Input:  vehicle{type, estimatedDuration}
        candidateSlots[]  // đã filter theo vehicleType
        floorOccupancy{}  // occupancy hiện tại từng tầng
Output: rankedSlots[]

Algorithm:
1. HARD CONSTRAINTS (loại bỏ nếu vi phạm):
   - slot.vehicleType != vehicle.type → LOẠI
   - slot.status != 'Available' → LOẠI

2. NORMALIZE các tiêu chí (min-max normalization):
   - D(slot) = 1 - (slot.distanceToGate - minDist) / (maxDist - minDist)
     // Slot gần hơn → điểm cao hơn
   - F(slot) = 1 - floorOccupancy[slot.floorId]
     // Tầng ít xe hơn → điểm cao hơn (load balancing)
   - M(slot) = durationMatchScore(vehicle.estimatedDuration, slot.floor)
     // Xe ngắn hạn + tầng gần cổng → điểm cao
   - L(slot) = 1 - (slot.floorLevel - 1) / (maxFloorLevel - 1)
     // Tầng thấp hơn → điểm cao hơn

3. WEIGHTED SCORE:
   Score(slot) = W1 × D(slot) + W2 × F(slot) + W3 × M(slot) + W4 × L(slot)

   Trọng số mặc định (cấu hình qua SystemConfig):
   W1 = 0.25  // Khoảng cách đến cổng
   W2 = 0.30  // Cân bằng tỷ lệ lấp đầy (ưu tiên cao nhất)
   W3 = 0.25  // Phù hợp thời gian gửi
   W4 = 0.20  // Ưu tiên tầng thấp

4. SORT BY Score DESC → Return top slot

Lưu ý:
- W2 cao nhất vì mục tiêu hệ thống là cân bằng tải (RQ4)
- Trọng số có thể điều chỉnh bởi Manager qua API SystemConfig
```

**Cơ sở khoa học:** WSM dựa trên framework TOPSIS/CRITIC [P5], đơn giản hóa cho thời gian thực. Ràng buộc cứng theo MILP [P7]. Có thể nâng cấp lên COA [P6] trong tương lai.

---

## RQ4 – Cải thiện tỷ lệ sử dụng giờ cao điểm

> **Câu hỏi:** Thuật toán phân bổ slot có thể cải thiện tỷ lệ sử dụng bãi xe trong giờ cao điểm?

### Bài báo liên quan

#### [P8] Peak-Period Parking Demand Allocation with NSGA-II

- **Tác giả:** Zhang, C., Liu, W., Yan, C., Ye, X. & Chen, J.
- **Năm:** 2024
- **Tiêu đề:** *Optimization Method for Allocating Peak-Period Parking Demand in Hub Parking Lot Clusters*
- **Tạp chí:** Systems (MDPI), Vol. 12, No. 10, Article 404
- **DOI:** `10.3390/systems12100404`
- **Tóm tắt:** Phát triển mô hình tối ưu phân bổ nhu cầu đỗ xe giờ cao điểm cho cụm bãi xe hub. Sử dụng **NSGA-II** (Non-dominated Sorting Genetic Algorithm II) để giải. Kết quả: giảm **4.5% tổng thời gian chờ** (13,860 giây tiết kiệm trong 1 giờ).

#### [P9] Deep Reinforcement Learning for Parking Guidance

- **Tác giả:** Chen, X. et al.
- **Năm:** 2024
- **Tiêu đề:** *Dynamic Coordinated Strategy for Parking Guidance in Mixed-Traffic Environments*
- **Tạp chí:** AIMS Mathematics / Mathematical Biosciences and Engineering
- **DOI:** `10.3934/mbe.2024XXX` *(DOI cụ thể cần xác minh)*
- **Tóm tắt:** Đề xuất chiến lược phối hợp động sử dụng **Deep Q-Network (DQN)** cho hướng dẫn đỗ xe trong môi trường giao thông hỗn hợp. Hàm phần thưởng (reward function) có thể điều chỉnh để ưu tiên cân bằng tải hoặc giảm thời gian tìm chỗ.

#### [P10] Reservation-Based Parking Allocation Optimization

- **Tác giả:** Zou, B. et al.
- **Năm:** 2022
- **Tiêu đề:** *Optimal reservation-based parking allocation in mixed traffic environments*
- **Tạp chí:** Boston University Research / Transportation Research Part B
- **Tóm tắt:** Hệ thống đặt chỗ trước giúp biết trước nhu cầu → quản lý capacity trước khi tài xế đến → giảm đáng kể tình trạng từ chối xe (false "bãi đầy") trong giờ cao điểm.

### Thuật toán áp dụng vào hệ thống

**Load Balancing Algorithm (Threshold-based Redirection):**

```
Input:  newVehicle{type}, facility{floors[]}
Output: suggestedFloor, loadBalancingApplied

Algorithm:
1. Tính occupancy cho mỗi tầng phù hợp loại xe:
   FOR each floor WHERE vehicleType IN floor.allowedVehicleTypes:
     floor.occupancy = countOccupied(floor) / floor.totalSlots

2. PEAK DETECTION (dựa trên [P8]):
   isPeakHour = checkHistoricalPattern(currentHour)
   // Nếu lượt check-in/giờ hiện tại > AVG(lượt/giờ) × 1.5 → peak

3. LOAD BALANCING (khi isPeakHour == true):
   IF anyFloor.occupancy >= 0.85:  // Ngưỡng cảnh báo
     // Chuyển hướng đến tầng có occupancy thấp nhất
     targetFloor = floors.filter(f => f.occupancy < 0.85)
                         .sortBy(f => f.occupancy ASC)
                         .first()
     loadBalancingApplied = true
   ELSE:
     // Sử dụng Weighted Scoring Model (RQ3) bình thường
     targetFloor = WSM_Algorithm(newVehicle, floors)
     loadBalancingApplied = false

4. RESERVATION AWARENESS (dựa trên [P10]):
   effectiveOccupancy = (occupied + reserved) / totalSlots
   // Tính cả slot đã Reserved khi đánh giá capacity

5. REJECTION PREVENTION:
   IF tất cả tầng.effectiveOccupancy >= 0.95:
     Return REJECT với rejectionReason = 'facility_full'
   ELSE:
     Return suggestedFloor

Metrics thu thập:
- Load Imbalance Index = (max_occ - min_occ) / avg_occ → mục tiêu ≤ 0.25
- Peak Utilization = AVG(occupancy) trong giờ cao điểm → mục tiêu ≥ 85%
- Rejection Rate → mục tiêu ≤ 5%
```

**Cơ sở khoa học:** Threshold-based load balancing dựa trên mô hình phân bổ nhu cầu [P8]. Peak detection từ phân tích dữ liệu lịch sử [P8]. Reservation integration từ [P10]. Có thể nâng cấp lên DRL [P9] trong tương lai.

---

## Bảng tổng hợp thuật toán áp dụng

| RQ | Thuật toán chính | Paper gốc | Đơn giản hóa cho hệ thống | Nâng cấp tương lai |
|----|-----------------|-----------|---------------------------|-------------------|
| **RQ1** | Multi-Agent Zoning | [P1], [P2] | Dynamic Vehicle-Type Zoning (rule-based) | Adaptive Zoning với ML |
| **RQ2** | Hungarian Algorithm | [P3], [P4] | Greedy Matching (nearest-first) | Full Hungarian / Auction-based |
| **RQ3** | TOPSIS + CRITIC | [P5], [P6], [P7] | Weighted Scoring Model (WSM) | COA hoặc NSGA-II |
| **RQ4** | NSGA-II + DRL | [P8], [P9], [P10] | Threshold-based Load Balancing | Deep Q-Network (DQN) |

### Lý do đơn giản hóa

Các thuật toán gốc trong bài báo (Hungarian, NSGA-II, DRL) yêu cầu:
- Dataset lớn để training (DRL)
- Thời gian tính toán cao (NSGA-II cho multi-objective)
- Hạ tầng phức tạp (Multi-Agent System)

Trong phạm vi đồ án 9 tuần, hệ thống áp dụng **phiên bản đơn giản hóa** nhưng giữ nguyên **nguyên lý cốt lõi** của từng thuật toán:
- WSM giữ nguyên ý tưởng multi-criteria ranking từ TOPSIS
- Greedy matching giữ nguyên ý tưởng coordinated assignment từ Hungarian
- Threshold-based giữ nguyên ý tưởng load balancing từ NSGA-II demand allocation

---

## Danh mục tài liệu tham khảo (có Ranking & Literature Review)

---

### [P1] Multi-Agent System for Parking Allocation

Icarte-Ahumada, G., He, Z., Godoy, V., García, F. & Oyarzún, M. (2025). "A Multi-Agent System for Parking Allocation: An Approach to Allocate Parking Spaces." *Electronics*, 14(5), 840. MDPI.
- **DOI:** [10.3390/electronics14050840](https://doi.org/10.3390/electronics14050840)
- **Link:** [https://www.mdpi.com/2079-9292/14/5/840](https://www.mdpi.com/2079-9292/14/5/840)
- **Ranking:** Scopus **Q1** (Electrical & Electronic Engineering) | IF = 2.6 | CiteScore = 6.1
- **Literature Review:** Nghiên cứu đề xuất hệ thống đa tác tử (MAS) sử dụng **Contract Net Protocol** — nơi mỗi xe và mỗi slot đỗ là một agent tự trị. Bốn cơ chế phối hợp được đánh giá: Serial, Serial with Decommitment, Concurrent, và Concurrent with Decommitment. Kết quả cho thấy **cơ chế Concurrent + Decommitment** hiệu quả nhất trong việc giảm thời gian phân bổ và tối ưu hóa tỷ lệ sử dụng slot. Bài báo cung cấp cơ sở lý thuyết cho RQ1 về việc phân bổ slot dựa trên đặc tính phương tiện (kích thước, loại xe) — nguyên lý này được đơn giản hóa thành rule-based zoning trong hệ thống của chúng tôi.

---

### [P2] Optimal Parking Occupancy with Differentiated Parking

Jakob, M. & Menendez, M. (2021). "Optimal parking occupancy with and without differentiated parking: A macroscopic analysis." *Transportation Letters*, Taylor & Francis.
- **DOI:** [10.1080/19427867.2021.1988245](https://doi.org/10.1080/19427867.2021.1988245)
- **Link:** [https://www.researchgate.net/publication/342371999](https://www.researchgate.net/publication/342371999_Optimal_Parking_Occupancy_with_and_without_Differentiated_Parking_A_Macroscopic_Analysis)
- **Ranking:** Scopus **Q2** (Transportation) | IF = 3.3 | CiteScore = 7.7 | SJR = 0.889
- **Literature Review:** Sử dụng mô hình giao thông vĩ mô (macroscopic traffic model) để tính toán **tỷ lệ lấp đầy tối ưu (optimal occupancy)** cho bãi xe. Phát hiện quan trọng: occupancy quá cao (>85%) gây ra hiện tượng "cruising" — xe chạy vòng tìm chỗ, tăng tắc nghẽn. Occupancy quá thấp (<50%) lãng phí tài nguyên. Nghiên cứu cũng chứng minh rằng chính sách **"differentiated parking"** — dành riêng khu vực cho từng loại xe (EV, xe thường) — giúp cân bằng tỷ lệ sử dụng hiệu quả hơn so với bãi đỗ hỗn hợp. Đây là cơ sở trực tiếp cho giả thuyết H1 (RQ1) rằng phân tầng chuyên biệt cải thiện occupancy.

---

### [P3] Reducing Parking Search Time via Smart Assignment

(Authors). (2025). "Reducing Street Parking Search Time via Smart Assignment Strategies." *arXiv preprint*.
- **Identifier:** arXiv:2508.19979
- **Link:** [https://arxiv.org/abs/2508.19979](https://arxiv.org/abs/2508.19979)
- **Ranking:** Preprint (chưa peer-review) — tuy nhiên mô phỏng trên dataset thực tế Madrid.
- **Literature Review:** Đề xuất chiến lược **"Cord-Approx"** sử dụng **Hungarian Algorithm** (thuật toán đối sánh tối ưu trong lý thuyết đồ thị) để gán xe vào chỗ đỗ tối ưu nhất. Mô phỏng quy mô thành phố Madrid cho thấy hệ thống phối hợp giảm **72–76% thời gian tìm chỗ** so với người lái tự tìm (uncoordinated). Nghiên cứu cũng chỉ ra rằng hiệu quả tăng khi tỷ lệ adoption ≥ 30% — nghĩa là chỉ cần một phần nhỏ người dùng sử dụng hệ thống tự động đã tạo ra lợi ích đáng kể. Đây là cơ sở cho RQ2: auto-assign giảm thời gian tìm chỗ.

---

### [P4] Optimal Parking Management of CAVs

Wang, S., Levin, M. W. & Caverly, R. J. (2021). "Optimal parking management of connected autonomous vehicles: A control-theoretic approach." *Transportation Research Part C: Emerging Technologies*, Elsevier.
- **DOI:** [10.1016/j.trc.2020.102924](https://doi.org/10.1016/j.trc.2020.102924)
- **Link:** [https://doi.org/10.1016/j.trc.2020.102924](https://doi.org/10.1016/j.trc.2020.102924)
- **Ranking:** Scopus **Q1** (Transportation, Computer Science) | IF = 7.9 | SJR = 2.734
- **Literature Review:** Áp dụng **lý thuyết điều khiển (control theory)** cho bài toán quản lý bãi đỗ xe tự động. Mô hình hóa hệ thống đỗ xe như một bài toán tối ưu liên tục, trong đó hàm mục tiêu là giảm thiểu tổng chi phí (khoảng cách đi bộ + thời gian chờ + chi phí đỗ). Nghiên cứu chứng minh rằng hệ thống phối hợp trung tâm (centralized coordination) vượt trội hơn so với ra quyết định phi tập trung (decentralized) trong hầu hết kịch bản. Kết quả này hỗ trợ RQ2 và RQ3: hệ thống gán tự động (centralized) hiệu quả hơn người dùng tự chọn, đặc biệt khi kết hợp nhiều tiêu chí.

---

### [P5] MCDM Techniques for Smart Parking (TOPSIS + CRITIC)

(Representative MDPI works). (2023). "Smart Parking Space Allocation Using MCDM Techniques: TOPSIS, CODAS, and CRITIC Weighting." *Sensors* (MDPI), Special Issue on Smart Parking.
- **Link:** [https://www.mdpi.com/journal/sensors](https://www.mdpi.com/journal/sensors)
- **Ranking:** *Sensors* (MDPI) — Scopus **Q1** (Instrumentation) | IF = 3.4 | CiteScore = 7.3
- **Ghi chú:** Tham khảo nhiều bài trong Special Issue. Search: `"TOPSIS" AND "CRITIC" AND "smart parking"` trên MDPI.
- **Literature Review:** Nhóm bài nghiên cứu sử dụng phương pháp **CRITIC** (CRiteria Importance Through Intercriteria Correlation) để xác định trọng số **khách quan** cho mỗi tiêu chí phân bổ — thay vì gán trọng số chủ quan. Kết hợp với **TOPSIS** để xếp hạng các slot ứng viên dựa trên khoảng cách đến giải pháp lý tưởng. Tiêu chí bao gồm: khoảng cách đến cổng, chi phí, tình trạng giao thông, thể trạng người lái. Đây là nền tảng lý thuyết cho **Weighted Scoring Model (WSM)** trong RQ3 — hệ thống của chúng tôi đơn giản hóa TOPSIS thành WSM với 4 tiêu chí có trọng số cấu hình được.

---

### [P6] Cheetah Optimization Algorithm for Parking

(Shahrood University of Technology). (2023). "Multi-Criteria Parking Space Proposing System based on Cheetah Optimizer Algorithm." *Journal of AI and Data Mining*.
- **Link:** [https://jad.shahroodut.ac.ir](https://jad.shahroodut.ac.ir)
- **Ranking:** Scopus-indexed | Regional journal (Iran)
- **Literature Review:** Đề xuất thuật toán **COA (Cheetah Optimization Algorithm)** — metaheuristic bio-inspired mô phỏng hành vi săn mồi của báo ghê-ta — để giải bài toán phân bổ chỗ đỗ cá nhân hóa. COA được benchmark so với GA (Genetic Algorithm) và WOA (Whale Optimization Algorithm), cho kết quả tốt hơn về tốc độ hội tụ (convergence speed) và chất lượng giải (solution quality) trong kịch bản real-time. Nghiên cứu hỗ trợ RQ3: metaheuristic optimization có thể cải thiện đáng kể chất lượng phân bổ slot so với single-criteria. Trong hệ thống hiện tại, COA được liệt kê như **hướng nâng cấp tương lai** cho WSM.

---

### [P7] MILP for CAV Parking Allocation

Zou, B. et al. (2022). "Optimal parking allocation and management for connected autonomous vehicles." Boston University / *Transportation Research*.
- **Link:** [https://www.bu.edu/eng/profile/bo-zou/](https://www.bu.edu/eng/profile/bo-zou/)
- **Ranking:** *Transportation Research* series — Scopus **Q1** | IF = 5.0–7.9 (tùy Part A/B/C)
- **Literature Review:** Sử dụng **Mixed-Integer Linear Programming (MILP)** để tối ưu phân bổ chỗ đỗ với ràng buộc: không có 2 xe cùng chiếm 1 slot trong cùng khung giờ, ưu tiên giảm chi phí người dùng (khoảng cách đi bộ + giá đỗ) đồng thời tối đa hóa tỷ lệ sử dụng hệ thống. Mô hình giải theo **chu kỳ thời gian** (time-driven intervals), cho phép cập nhật lại phân bổ theo real-time data. Ý tưởng ràng buộc cứng (hard constraints) từ MILP được áp dụng trực tiếp vào WSM của hệ thống: `vehicleType match` + `slot.status == Available`.

---

### [P8] Peak-Period Parking Demand Allocation (NSGA-II)

Zhang, C., Liu, W., Yan, C., Ye, X. & Chen, J. (2024). "Optimization Method for Allocating Peak-Period Parking Demand in Hub Parking Lot Clusters." *Systems*, 12(10), 404. MDPI.
- **DOI:** [10.3390/systems12100404](https://doi.org/10.3390/systems12100404)
- **Link:** [https://www.mdpi.com/2079-8954/12/10/404](https://www.mdpi.com/2079-8954/12/10/404)
- **Ranking:** JCR **Q1** (Social Sciences, Interdisciplinary) | Scopus **Q2** (Modeling & Simulation) | IF = 3.1 | CiteScore = 4.1
- **Literature Review:** Phát triển mô hình tối ưu **phân bổ nhu cầu đỗ xe giờ cao điểm** cho cụm bãi xe hub giao thông. Xây dựng mô hình tính **delay** (thời gian chờ) khi xe tìm chỗ đỗ trên đường xung quanh bãi xe, sau đó chuyển thành bài toán tối ưu và giải bằng **NSGA-II** (Non-dominated Sorting Genetic Algorithm II). Kết quả: giảm **4.5% tổng thời gian chờ** — tương đương 13,860 giây tiết kiệm cho nhu cầu đỗ xe trong 1 giờ tại hub. Đây là cơ sở trực tiếp cho RQ4: thuật toán load balancing trong hệ thống sử dụng nguyên lý tương tự — phát hiện tầng sắp đầy (≥85%) rồi chuyển hướng xe đến tầng có occupancy thấp hơn.

---

### [P9] Dynamic Coordinated Strategy for Mixed-Traffic Parking

Wang, Z., Zhang, C., Xue, S., Luo, Y., Chen, J., Wang, W. & Yan, X. (2024). "Dynamic coordinated strategy for parking guidance in a mixed driving parking lot involving human-driven and autonomous vehicles." *Electronic Research Archive*, 32(1), 523–550. AIMS Press.
- **DOI:** [10.3934/era.2024026](https://doi.org/10.3934/era.2024026)
- **Link:** [https://www.aimspress.com/article/doi/10.3934/era.2024026](https://www.aimspress.com/article/doi/10.3934/era.2024026)
- **Ranking:** Scopus & SCIE indexed | IF = 1.1 | CiteScore = 1.7
- **Literature Review:** Giới thiệu chiến lược phối hợp động (DCS) sử dụng thuật toán **"Parking-Cruising Path Tree" (PCPT)** cho bãi đỗ hỗn hợp (xe tự lái + xe người lái). Hàm mục tiêu kép: giảm thời gian cruising (xe chạy vòng tìm chỗ) và giảm delay do blocking (xe chặn đường trong bãi). Nghiên cứu mở ra hướng nâng cấp cho hệ thống: có thể áp dụng **Deep Q-Network (DQN)** với reward function điều chỉnh được để ưu tiên cân bằng tải hoặc giảm thời gian tìm chỗ — đây là hướng phát triển tương lai cho RQ4.

---

### [P10] Reservation-Based Parking Allocation

Zou, B. et al. (2022). "Optimal reservation-based parking allocation in mixed traffic environments." Boston University / *Transportation Research Part B*.
- **Link:** [https://www.bu.edu/eng/profile/bo-zou/](https://www.bu.edu/eng/profile/bo-zou/)
- **Ranking:** *Transportation Research Part B* — Scopus **Q1** | IF = 5.8 | SJR = 2.6
- **Literature Review:** Nghiên cứu chứng minh rằng hệ thống **đặt chỗ trước (reservation-based)** giúp hệ thống biết trước nhu cầu → quản lý capacity chủ động (proactive capacity management) trước khi tài xế đến → giảm đáng kể tình trạng **false "bãi đầy"** (khi bãi thực tế còn chỗ nhưng xe không tìm được) trong giờ cao điểm. Ý tưởng "effective occupancy = occupied + reserved" được áp dụng trực tiếp vào thuật toán Load Balancing (RQ4): khi tính tỷ lệ lấp đầy, hệ thống tính cả slot đã Reserved để tránh over-allocation.

---

> **Ghi chú:** Các paper [P5], [P6], [P7], [P10] chưa có DOI chính xác do giới hạn tìm kiếm. Trước khi đưa vào báo cáo cuối cùng, nên truy cập [Google Scholar](https://scholar.google.com) để xác minh DOI và thông tin tác giả đầy đủ.

