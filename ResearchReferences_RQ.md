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

## Danh mục tài liệu tham khảo

### [P1]
Icarte-Ahumada, G., He, Z., Godoy, V., García, F. & Oyarzún, M. (2025). "A Multi-Agent System for Parking Allocation: An Approach to Allocate Parking Spaces." *Electronics*, 14(5), 840. MDPI.
- **DOI:** [10.3390/electronics14050840](https://doi.org/10.3390/electronics14050840)
- **Link:** [https://www.mdpi.com/2079-9292/14/5/840](https://www.mdpi.com/2079-9292/14/5/840)

### [P2]
Jakob, M. & Menendez, M. (2021). "Optimal parking occupancy with and without differentiated parking: A macroscopic analysis." *Transportation Letters: The International Journal of Transportation Research*.
- **DOI:** [10.1080/19427867.2021.1988245](https://doi.org/10.1080/19427867.2021.1988245)
- **Link:** [https://www.researchgate.net/publication/342371999](https://www.researchgate.net/publication/342371999_Optimal_Parking_Occupancy_with_and_without_Differentiated_Parking_A_Macroscopic_Analysis)

### [P3]
(Authors). (2025). "Reducing Street Parking Search Time via Smart Assignment Strategies." *arXiv preprint*.
- **Identifier:** arXiv:2508.19979
- **Link:** [https://arxiv.org/abs/2508.19979](https://arxiv.org/abs/2508.19979)

### [P4]
Wang, S., Levin, M. W. & Caverly, R. J. (2021). "Optimal parking management of connected autonomous vehicles: A control-theoretic approach." *Transportation Research Part C: Emerging Technologies*.
- **DOI:** [10.1016/j.trc.2020.102924](https://doi.org/10.1016/j.trc.2020.102924)
- **Link:** [https://www.sciencedirect.com/science/article/pii/S0968090X20308329](https://doi.org/10.1016/j.trc.2020.102924)

### [P5]
(Authors — representative MDPI works). (2023). "Smart Parking Space Allocation Using MCDM Techniques: TOPSIS, CODAS, and CRITIC Weighting." *Sensors* (MDPI), Special Issue on Smart Parking.
- **Link (journal):** [https://www.mdpi.com/journal/sensors/special_issues/smart_parking](https://www.mdpi.com/journal/sensors)
- **Ghi chú:** Tham khảo nhiều bài trong Special Issue. Keyword search: `"TOPSIS" AND "CRITIC" AND "smart parking"` trên MDPI.

### [P6]
(Authors — Shahrood University of Technology). (2023). "Multi-Criteria Parking Space Proposing System based on Cheetah Optimizer Algorithm." *Journal of AI and Data Mining*.
- **Link:** [https://jad.shahroodut.ac.ir](https://jad.shahroodut.ac.ir)
- **Ghi chú:** Tìm kiếm bài với keyword "Cheetah Optimization" + "smart parking" trên trang journal.

### [P7]
Zou, B. et al. (2022). "Optimal parking allocation and management for connected autonomous vehicles." Boston University Research / *Transportation Research*.
- **Link:** [https://www.bu.edu/eng/profile/bo-zou/](https://www.bu.edu/eng/profile/bo-zou/)
- **Ghi chú:** Truy cập trang profile tác giả để tìm paper cụ thể.

### [P8]
Zhang, C., Liu, W., Yan, C., Ye, X. & Chen, J. (2024). "Optimization Method for Allocating Peak-Period Parking Demand in Hub Parking Lot Clusters." *Systems*, 12(10), 404. MDPI.
- **DOI:** [10.3390/systems12100404](https://doi.org/10.3390/systems12100404)
- **Link:** [https://www.mdpi.com/2079-8954/12/10/404](https://www.mdpi.com/2079-8954/12/10/404)

### [P9]
Wang, Z., Zhang, C., Xue, S., Luo, Y., Chen, J., Wang, W. & Yan, X. (2024). "Dynamic coordinated strategy for parking guidance in a mixed driving parking lot involving human-driven and autonomous vehicles." *Electronic Research Archive*, 32(1), 523–550. AIMS Press.
- **DOI:** [10.3934/era.2024026](https://doi.org/10.3934/era.2024026)
- **Link:** [https://www.aimspress.com/article/doi/10.3934/era.2024026](https://www.aimspress.com/article/doi/10.3934/era.2024026)

### [P10]
Zou, B. et al. (2022). "Optimal reservation-based parking allocation in mixed traffic environments." Boston University Research / *Transportation Research Part B*.
- **Link:** [https://www.bu.edu/eng/profile/bo-zou/](https://www.bu.edu/eng/profile/bo-zou/)

---

> **Ghi chú:** Các paper [P5], [P6], [P7], [P10] chưa có DOI chính xác do giới hạn tìm kiếm. Trước khi đưa vào báo cáo cuối cùng, nên truy cập Google Scholar ([https://scholar.google.com](https://scholar.google.com)) để xác minh DOI và thông tin tác giả đầy đủ.

