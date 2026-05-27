# TÀI LIỆU THAM KHẢO KHOA HỌC – RESEARCH QUESTIONS

**Dự án:** Hệ thống Quản lý Bãi Đỗ Xe Thông Minh  
**Phiên bản:** 1.0 | **Ngày:** 16/05/2026

---

## Mục lục

1. [RQ1 – Phân tầng theo loại phương tiện](#rq1--phân-tầng-theo-loại-phương-tiện)
2. [RQ2 – Phân bổ slot tự động vs. chọn tự do](#rq2--phân-bổ-slot-tự-động-vs-chọn-tự-do)
3. [RQ3 – Tiêu chí ưu tiên phân bổ slot (MCDM)](#rq3--tiêu-chí-ưu-tiên-phân-bổ-slot-mcdm)
4. [RQ4 – Cải thiện tỷ lệ sử dụng giờ cao điểm](#rq4--cải-thiện-tỷ-lệ-sử-dụng-giờ-cao-điểm)
5. [RQ5 – AI Chatbot hỗ trợ quản lý & báo cáo](#rq5--ai-chatbot-hỗ-trợ-quản-lý--báo-cáo)
6. [Bảng tổng hợp thuật toán áp dụng](#bảng-tổng-hợp-thuật-toán-áp-dụng)
7. [Danh mục tài liệu tham khảo (References)](#danh-mục-tài-liệu-tham-khảo)

---

## RQ1 – Phân tầng theo loại phương tiện

> **Câu hỏi:** Việc phân tầng, khu vực theo loại phương tiện ảnh hưởng thế nào đến hiệu quả sử dụng chỗ đỗ?

### Bài báo liên quan

#### [P1] Multi-Agent System for Parking Allocation

- **Tác giả:** Icarte-Ahumada, G., He, Z., Godoy, V., García, F. & Oyarzún, M.
- **Năm:** 2025
- **Tiêu đề:** *A Multi-Agent System for Parking Allocation: An Approach to Allocate Parking Spaces*
- **Tạp chí:** *Electronics*, Vol. 14, No. 5, Article 840. MDPI
- **DOI:** `10.3390/electronics14050840`
- **Tóm tắt:** Sử dụng hệ thống đa tác tử (Multi-Agent System) với **Contract Net Protocol** để phân bổ chỗ đỗ dựa trên đặc tính phương tiện (kích thước, loại xe) và đặc tính chỗ đỗ. Bốn cơ chế phối hợp được đánh giá: Serial, Serial with Decommitment, Concurrent, Concurrent with Decommitment. Kết quả: Concurrent + Decommitment hiệu quả nhất.

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

#### [P4] Optimal Parking Management of Connected Autonomous Vehicles

- **Tác giả:** Wang, S., Levin, M. W. & Caverly, R. J.
- **Năm:** 2021
- **Tiêu đề:** *Optimal parking management of connected autonomous vehicles: A control-theoretic approach*
- **Tạp chí:** Transportation Research Part C: Emerging Technologies, Elsevier
- **DOI:** `10.1016/j.trc.2020.102924`
- **Tóm tắt:** Áp dụng lý thuyết điều khiển (control theory) cho bài toán quản lý bãi đỗ xe tự động. Chứng minh hệ thống phối hợp trung tâm (centralized coordination) vượt trội hơn phi tập trung (decentralized). Cơ sở cho RQ2: auto-assign hiệu quả hơn manual.

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

- **Tác giả:** Amari, A., Moussaid, L. & Tallal, S.
- **Năm:** 2023
- **Tiêu đề:** *New Parking Lot Selection Approach Based on the Multi-Criteria Decision Making (MCDM) Methods: Health Criteria*
- **Tạp chí:** *Sustainability*, Vol. 15, No. 2, Article 938. MDPI
- **DOI:** `10.3390/su15020938`
- **Tóm tắt:** Sử dụng phương pháp **CRITIC** (CRiteria Importance Through Intercriteria Correlation) để xác định trọng số **khách quan** cho mỗi tiêu chí phân bổ. Kết hợp **TOPSIS**, CODA, EDAS, WASPAS để xếp hạng các slot ứng viên. Tiêu chí bao gồm: khoảng cách, chi phí, tình trạng giao thông, thể trạng người lái (health criteria).

#### [P6] Cheetah Optimization Algorithm for Parking Assignment

- **Tác giả:** Shirazi, F. & Farzaneh, N.
- **Năm:** 2025
- **Tiêu đề:** *A Multi-Criteria Parking Space Proposing System based on Cheetah Optimizer Algorithm*
- **Tạp chí:** *Journal of Artificial Intelligence and Data Mining (JAIDM)*, Vol. 13, No. 4, pp. 441–451. Shahrood University of Technology
- **DOI:** `10.22044/jadm.2025.15911.2705`
- **Tóm tắt:** Đề xuất thuật toán **COA (Cheetah Optimization Algorithm)** — metaheuristic bio-inspired mô phỏng hành vi săn mồi của báo ghê-ta — để giải bài toán phân bổ slot cá nhân hóa. COA benchmark so với GA và WOA, cho kết quả tốt hơn về tốc độ hội tụ và chất lượng giải trong real-time.

#### [P7] Online Parking Assignment with Multi-Agent Deep RL

- **Tác giả:** Zhang, X., Zhao, C., Liao, F., Li, X. & Du, Y.
- **Năm:** 2022
- **Tiêu đề:** *Online parking assignment in an environment of partially connected vehicles: A multi-agent deep reinforcement learning approach*
- **Tạp chí:** *Transportation Research Part C: Emerging Technologies*, Vol. 138, Article 103624. Elsevier
- **DOI:** `10.1016/j.trc.2022.103624`
- **Tóm tắt:** Giải quyết bài toán **Online Parking Assignment (OPA)** trong môi trường hỗn hợp Connected Vehicles (CVs) + non-connected vehicles (NCVs). Đề xuất **MARL framework** với hai agents độc lập phối hợp theo value decomposition. Kết quả: cải thiện **15% hiệu quả phân bổ** so với FCFS baseline. Ràng buộc cứng (hard constraints) — vehicle-type match, slot availability — được áp dụng trực tiếp vào WSM hệ thống.

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

**Cơ sở khoa học:** WSM dựa trên framework TOPSIS/CRITIC [P5] (Amari et al., 2023), đơn giản hóa cho thời gian thực. Ràng buộc cứng (hard constraints: vehicleType match + slot.status Available) từ MARL framework [P7] (Zhang et al., 2022). Có thể nâng cấp lên COA [P6] (Shirazi & Farzaneh, 2025) trong tương lai.

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

#### [P9] Dynamic Coordinated Strategy for Mixed-Traffic Parking

- **Tác giả:** Wang, Z., Zhang, C., Xue, S., Luo, Y., Chen, J., Wang, W. & Yan, X.
- **Năm:** 2024
- **Tiêu đề:** *Dynamic coordinated strategy for parking guidance in a mixed driving parking lot involving human-driven and autonomous vehicles*
- **Tạp chí:** Electronic Research Archive, 32(1), 523–550. AIMS Press
- **DOI:** `10.3934/era.2024026`
- **Tóm tắt:** Đề xuất chiến lược phối hợp động (DCS) sử dụng **Parking-Cruising Path Tree (PCPT)** cho bãi đỗ hỗn hợp xe người lái + xe tự lái. Tối ưu phân bổ slot và dẫn đường với tỷ lệ tối ưu lên đến **18%**. Cơ sở cho hướng nâng cấp RQ4.

#### [P10] Reservation & Allocation Model for Shared Parking under Uncertainty

- **Tác giả:** Wang, S., Li, Z. & Xie, N.
- **Năm:** 2022
- **Tiêu đề:** *A reservation and allocation model for shared-parking addressing the uncertainty in drivers' arrival/departure time*
- **Tạp chí:** *Transportation Research Part C: Emerging Technologies*, Vol. 135, Article 103484. Elsevier
- **DOI:** `10.1016/j.trc.2021.103484`
- **Tóm tắt:** Phát triển mô hình tối ưu **đặt chỗ và phân bổ cho shared parking** có tính đến sự **không chắc chắn về thời gian đến/đi** của người lái. Framework chance-constrained đảm bảo tỷ lệ phục vụ đạt ngưỡng dù demand stochastic. Nguyên lý: tính cả slot Reserved khi đánh giá effective occupancy → tránh over-allocation.

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

4. RESERVATION AWARENESS (dựa trên [P10] — Wang, Li & Xie 2022):
   effectiveOccupancy = (occupied + reserved) / totalSlots
   // Tính cả slot Reserved → tránh over-allocation (chance-constrained model)

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

**Cơ sở khoa học:** Threshold-based load balancing dựa trên mô hình phân bổ nhu cầu NSGA-II [P8] (Zhang et al., 2024). Peak detection từ phân tích dữ liệu lịch sử [P8]. Reservation-Aware Capacity từ chance-constrained model [P10] (Wang, Li & Xie, 2022). Có thể nâng cấp lên DCS/PCPT [P9] (Wang et al., 2024) hoặc MARL [P7] (Zhang et al., 2022) trong tương lai.

---

## RQ5 – AI Chatbot hỗ trợ quản lý & báo cáo

> **Câu hỏi:** Việc tích hợp AI Chatbot (giao diện truy vấn ngôn ngữ tự nhiên) có giúp Manager/Admin truy xuất thông tin báo cáo và quản lý hệ thống hiệu quả hơn so với thao tác truyền thống trên dashboard?

### Bài báo liên quan

#### [P11] Natural Language Interfaces to Data

- **Tác giả:** Quamar, A., Efthymiou, V., Lei, C. & Özcan, F.
- **Năm:** 2022
- **Tiêu đề:** *Natural Language Interfaces to Data*
- **Tạp chí:** *Foundations and Trends® in Databases*, Vol. 11, No. 4, pp. 319–414
- **DOI:** `10.1561/1900000078`
- **Tóm tắt:** Survey toàn diện về Natural Language Interfaces to Data (NLIDB), phân loại các phương pháp: rule-based, deep learning, hybrid. Trình bày conversational interfaces cho data analytics, bao gồm intent recognition, entity extraction, và query generation. Cơ sở lý thuyết cho việc cho phép Manager truy vấn dữ liệu hệ thống bằng câu hỏi tiếng Việt/Anh.

#### [P12] Conversation-Based Information Delivery for Facility Management

- **Tác giả:** Chen, K.L. & Tsai, M.H.
- **Năm:** 2021
- **Tiêu đề:** *Conversation-Based Information Delivery Method for Facility Management*
- **Tạp chí:** *Sensors*, Vol. 21, No. 14, Article 4771. MDPI
- **DOI:** `10.3390/s21144771`
- **Tóm tắt:** Đề xuất phương pháp giao tiếp hội thoại (chatbot) cho quản lý cơ sở vật chất. Kiến trúc 4 module: Decision Mechanism, Equipment Dataset, Intent Analysis, Knowledge Base. Prototype tại tòa nhà hành chính Shulin (New Taipei City). Trực tiếp áp dụng cho RQ5: Manager chat hỏi thông tin bãi xe thay vì thao tác trên giao diện truyền thống.

#### [P13] AI-Enhanced Chatbots in Facilities Management

- **Tác giả:** Alhammadi, M.
- **Năm:** 2023
- **Tiêu đề:** *Optimising Customer Service Delivery and Response Time through AI-Enhanced Chatbots in Facilities Management: A Mixed-Methods Research*
- **Tạp chí:** *American Journal of Smart Technology and Solutions*, Vol. 2, No. 2
- **DOI:** `10.54536/ajsts.v2i2.2206`
- **Tóm tắt:** Nghiên cứu hỗn hợp (mixed-methods) sử dụng Technology Acceptance Model (TAM) và Social Response Theory (SRT). Khảo sát 10 facility managers tại UAE, Qatar, Saudi Arabia. Kết quả: Pearson Correlation > 0.7 giữa Perceived Usefulness, Ease of Use, và User Satisfaction. Chứng minh chatbot cải thiện **responsiveness** và **operational efficiency** trong quản lý cơ sở vật chất.

#### [P14] AI-Powered Chatbots in Organizations: A Systematic Literature Review

- **Tác giả:** Delgado, S., Villamarin, A. & Insuasti, J.
- **Năm:** 2025
- **Tiêu đề:** *AI-Powered Chatbots in Organizations: A Systematic Literature Review*
- **Tạp chí:** *Journal of Information Systems Engineering & Management*, Vol. 10, No. 22s
- **DOI:** `10.52783/jisem.v10i22s.3542`
- **Tóm tắt:** Systematic Literature Review (SLR) tổng hợp 53 bài báo về chatbot AI trong tổ chức. Phân loại ứng dụng: customer service, HR, **internal operations** (bao gồm reporting, analytics, knowledge management). Xác định benefits (tự động hóa, giảm thời gian truy xuất), challenges (trust, integration, ethics), và future directions. Cơ sở cho đánh giá tính khả thi của chatbot trong hệ thống quản lý bãi xe.

### Thuật toán áp dụng vào hệ thống

**Intent-based Natural Language Querying (NLQ) — đơn giản hóa Text-to-SQL:**

```
Input:  userMessage (string) — câu hỏi bằng ngôn ngữ tự nhiên
        userRole (string) — 'admin' | 'manager'
Output: { answer: string, data: object, chartType?: string }

Algorithm:
1. INTENT CLASSIFICATION (dựa trên [P11] NLI survey + [P12] Intent Analysis):
   - Phân loại câu hỏi thành intent:
     • 'revenue_report' — "Hôm nay doanh thu bao nhiêu?"
     • 'traffic_report' — "Hôm qua có bao nhiêu xe vào?"
     • 'occupancy_report' — "Tỷ lệ lấp đầy tầng 2 hiện tại?"
     • 'peak_hours' — "Giờ nào đông nhất tuần này?"
     • 'facility_info' — "Bãi xe A mấy giờ đóng cửa?"
     • 'exception_summary' — "Tuần này có bao nhiêu ngoại lệ?"
   - Sử dụng keyword matching + pattern rules (phase 1)
   - Nâng cấp: LLM-based intent classification (phase 2)

2. ENTITY EXTRACTION:
   - Trích xuất entities từ câu hỏi:
     • timeRange: "hôm nay", "tuần này", "tháng 5"
     • facilityName: "bãi xe A", "tòa nhà B"
     • floorName: "tầng 2", "tầng 3"
     • vehicleType: "xe máy", "ô tô"
   - Normalize: "hôm nay" → {start: today 00:00, end: today 23:59}

3. QUERY GENERATION (dựa trên [P11] NLQ approaches):
   - Map intent + entities → MongoDB aggregation pipeline
   - Ví dụ: intent='revenue_report' + timeRange='hôm nay'
     → db.parkingSessions.aggregate([
          { $match: { checkInTime: { $gte: today_start }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalFee' } } }
        ])

4. RESPONSE GENERATION:
   - Format kết quả thành ngôn ngữ tự nhiên:
     "Doanh thu hôm nay (27/05/2026) là 2,500,000 VND từ 45 lượt gửi xe."
   - Đề xuất chartType nếu phù hợp: 'bar', 'line', 'pie'

5. AUTHORIZATION CHECK (dựa trên [P13] TAM — Perceived Security):
   - Manager: chỉ xem data thuộc assignedFacilities
   - Admin: xem toàn bộ

Complexity: O(1) cho intent classification, O(n) cho query execution
```

**Cơ sở khoa học:** Kiến trúc 4-module (Intent Analysis, Knowledge Base, Decision Mechanism, Response Generation) dựa trên framework của Chen & Tsai [P12]. Phương pháp NLQ (keyword → entity → query) từ survey NLI [P11] (Quamar et al., 2022). Đánh giá user acceptance theo TAM framework [P13] (Alhammadi, 2023). Tính khả thi trong tổ chức từ SLR [P14] (Delgado et al., 2025).

---

## Bảng tổng hợp thuật toán áp dụng

| RQ | Thuật toán chính | Paper gốc | Đơn giản hóa cho hệ thống | Nâng cấp tương lai |
|----|-----------------|-----------|---------------------------|-------------------|
| **RQ1** | Multi-Agent Zoning + Differentiated Parking | [P1] Icarte-Ahumada 2025, [P2] Jakob & Menendez 2021 | Dynamic Vehicle-Type Zoning (rule-based) | Adaptive Zoning với ML |
| **RQ2** | Hungarian Algorithm + Coordinated Assignment | [P3] arXiv 2025, [P4] Wang, Levin & Caverly 2021 | Greedy Matching (nearest-first) | Full Hungarian / MARL [P7] |
| **RQ3** | TOPSIS/CRITIC + COA + MARL hard constraints | [P5] Amari 2023, [P6] Shirazi 2025, [P7] Zhang 2022 | Weighted Scoring Model (WSM) | COA [P6] hoặc MARL [P7] |
| **RQ4** | NSGA-II + DCS/PCPT + Chance-Constrained Reservation | [P8] Zhang 2024, [P9] Wang et al. 2024, [P10] Wang 2022 | Threshold-based Load Balancing | DCS [P9] / MARL [P7] |
| **RQ5** | NLI Text-to-SQL + Conversational FM Chatbot + TAM | [P11] Quamar 2022, [P12] Chen & Tsai 2021, [P13] Alhammadi 2023, [P14] Delgado 2025 | Intent-based NLQ (keyword matching + template query) | LLM-based Text-to-SQL [P11] |

### Lý do đơn giản hóa

Các thuật toán gốc trong bài báo (Hungarian, NSGA-II, DRL, Text-to-SQL) yêu cầu:
- Dataset lớn để training (DRL, LLM fine-tuning)
- Thời gian tính toán cao (NSGA-II cho multi-objective)
- Hạ tầng phức tạp (Multi-Agent System, LLM inference server)

Trong phạm vi đồ án 9 tuần, hệ thống áp dụng **phiên bản đơn giản hóa** nhưng giữ nguyên **nguyên lý cốt lõi** của từng thuật toán:
- **WSM** giữ nguyên ý tưởng multi-criteria ranking từ TOPSIS/CRITIC [P5]
- **Greedy Matching** giữ nguyên ý tưởng coordinated assignment từ Hungarian [P3]
- **Hard Constraints** (vehicleType match + slot Available) từ MARL framework [P7]
- **Threshold Load Balancing** giữ nguyên ý tưởng peak-demand allocation từ NSGA-II [P8]
- **Reservation-Aware Occupancy** từ chance-constrained model [P10]: `effective = (occupied + reserved) / total`
- **Intent-based NLQ** giữ nguyên ý tưởng NLI pipeline [P11] (intent → entity → query → response) và kiến trúc 4-module chatbot [P12]

---

## Danh mục tài liệu tham khảo (có Ranking & Literature Review)

---

### [P1] Multi-Agent System for Parking Allocation

Icarte-Ahumada, G., He, Z., Godoy, V., García, F. & Oyarzún, M. (2025). "A Multi-Agent System for Parking Allocation: An Approach to Allocate Parking Spaces." *Electronics*, 14(5), Article 840. MDPI.
- **DOI:** [10.3390/electronics14050840](https://doi.org/10.3390/electronics14050840)
- **Link:** [https://www.mdpi.com/2079-9292/14/5/840](https://www.mdpi.com/2079-9292/14/5/840)
- **Ranking:** Scopus **Q1** (Electrical & Electronic Engineering) | IF = 2.6 | CiteScore = 6.1
- ⚠️ **Lưu ý:** Tạp chí là *Electronics* (ISSN 2079-9292), không phải *Applied Sciences*.
- **Literature Review:** Nghiên cứu đề xuất hệ thống đa tác tử (MAS) sử dụng **Contract Net Protocol** — nơi mỗi xe và mỗi slot đỗ là một agent tự trị. Bốn cơ chế phối hợp được đánh giá: Serial, Serial with Decommitment, Concurrent, và Concurrent with Decommitment. Kết quả cho thấy **cơ chế Concurrent + Decommitment** hiệu quả nhất trong việc giảm thời gian phân bổ và tối ưu hóa tỷ lệ sử dụng slot. Bài báo cung cấp cơ sở lý thuyết cho RQ1 về việc phân bổ slot dựa trên đặc tính phương tiện (kích thước, loại xe) — nguyên lý này được đơn giản hóa thành rule-based zoning trong hệ thống của chúng tôi.
- **Thuật toán sử dụng:**
  - **Contract Net Protocol (CNP):** Agent xe gửi Call-for-Proposal → Agent slot đánh giá khả năng (vehicle size, type compatibility) → trả Bid → Agent xe chọn Bid tốt nhất → Award.
  - **Decommitment Mechanism:** Cho phép hủy cam kết nếu tìm được slot tốt hơn, tránh lock-in sớm.
  - **Concurrent Negotiation:** Nhiều xe đàm phán song song thay vì tuần tự → giảm latency phân bổ.

---

### [P2] Optimal Parking Occupancy with Differentiated Parking

Jakob, M. & Menendez, M. (2021). "Optimal parking occupancy with and without differentiated parking: A macroscopic analysis." *Transportation Letters*, Taylor & Francis.
- **DOI:** [10.1080/19427867.2021.1988245](https://doi.org/10.1080/19427867.2021.1988245)
- **Link:** [https://www.researchgate.net/publication/342371999](https://www.researchgate.net/publication/342371999_Optimal_Parking_Occupancy_with_and_without_Differentiated_Parking_A_Macroscopic_Analysis)
- **Ranking:** Scopus **Q2** (Transportation) | IF = 3.3 | CiteScore = 7.7 | SJR = 0.889
- **Literature Review:** Sử dụng mô hình giao thông vĩ mô (macroscopic traffic model) để tính toán **tỷ lệ lấp đầy tối ưu (optimal occupancy)** cho bãi xe. Phát hiện quan trọng: occupancy quá cao (>85%) gây ra hiện tượng "cruising" — xe chạy vòng tìm chỗ, tăng tắc nghẽn. Occupancy quá thấp (<50%) lãng phí tài nguyên. Nghiên cứu cũng chứng minh rằng chính sách **"differentiated parking"** — dành riêng khu vực cho từng loại xe (EV, xe thường) — giúp cân bằng tỷ lệ sử dụng hiệu quả hơn so với bãi đỗ hỗn hợp. Đây là cơ sở trực tiếp cho giả thuyết H1 (RQ1) rằng phân tầng chuyên biệt cải thiện occupancy.
- **Thuật toán sử dụng:**
  - **Macroscopic Fundamental Diagram (MFD):** Mô hình hóa mối quan hệ giữa mật độ xe, lưu lượng, và tốc độ trung bình trên toàn mạng lưới.
  - **Optimal Occupancy Computation:** `O* = argmin_{O} [CruisingDelay(O) + UnderUtilizationCost(O)]` — tìm điểm cân bằng tối ưu.
  - **Zone Differentiation Model:** Chia bãi xe thành zones theo loại xe → tính riêng O* cho mỗi zone → so sánh với bãi không phân zone.

---

### [P3] Reducing Parking Search Time via Smart Assignment

(Authors). (2025). "Reducing Street Parking Search Time via Smart Assignment Strategies." *arXiv preprint*.
- **Identifier:** arXiv:2508.19979
- **Link:** [https://arxiv.org/abs/2508.19979](https://arxiv.org/abs/2508.19979)
- **Ranking:** Preprint (chưa peer-review) — tuy nhiên mô phỏng trên dataset thực tế Madrid.
- **Literature Review:** Đề xuất chiến lược **"Cord-Approx"** sử dụng **Hungarian Algorithm** (thuật toán đối sánh tối ưu trong lý thuyết đồ thị) để gán xe vào chỗ đỗ tối ưu nhất. Mô phỏng quy mô thành phố Madrid cho thấy hệ thống phối hợp giảm **72–76% thời gian tìm chỗ** so với người lái tự tìm (uncoordinated). Nghiên cứu cũng chỉ ra rằng hiệu quả tăng khi tỷ lệ adoption ≥ 30% — nghĩa là chỉ cần một phần nhỏ người dùng sử dụng hệ thống tự động đã tạo ra lợi ích đáng kể. Đây là cơ sở cho RQ2: auto-assign giảm thời gian tìm chỗ.
- **Thuật toán sử dụng:**
  - **Hungarian Algorithm (Kuhn-Munkres):** Giải bài toán đối sánh hoàn hảo trọng số tối thiểu (minimum-weight bipartite matching). Đầu vào: ma trận cost `C[i][j]` = thời gian di chuyển từ xe `i` đến slot `j`. Đầu ra: phân bổ 1-1 tối ưu. Độ phức tạp: O(n³).
  - **Cord-Approx Strategy:** Ước lượng hành vi xe không dùng hệ thống (non-users) → loại bỏ slot dự đoán sẽ bị chiếm → chạy Hungarian trên tập slot còn lại.
  - **Unc-Agn Baseline:** Mô phỏng người lái tự tìm chỗ (chọn ngẫu nhiên hoặc gần nhất) — dùng làm đối chứng.

---

### [P4] Optimal Parking Management of CAVs

Wang, S., Levin, M. W. & Caverly, R. J. (2021). "Optimal parking management of connected autonomous vehicles: A control-theoretic approach." *Transportation Research Part C: Emerging Technologies*, Elsevier.
- **DOI:** [10.1016/j.trc.2020.102924](https://doi.org/10.1016/j.trc.2020.102924)
- **Link:** [https://doi.org/10.1016/j.trc.2020.102924](https://doi.org/10.1016/j.trc.2020.102924)
- **Ranking:** Scopus **Q1** (Transportation, Computer Science) | IF = 7.9 | SJR = 2.734
- **Literature Review:** Áp dụng **lý thuyết điều khiển (control theory)** cho bài toán quản lý bãi đỗ xe tự động. Mô hình hóa hệ thống đỗ xe như một bài toán tối ưu liên tục, trong đó hàm mục tiêu là giảm thiểu tổng chi phí (khoảng cách đi bộ + thời gian chờ + chi phí đỗ). Nghiên cứu chứng minh rằng hệ thống phối hợp trung tâm (centralized coordination) vượt trội hơn so với ra quyết định phi tập trung (decentralized) trong hầu hết kịch bản. Kết quả này hỗ trợ RQ2 và RQ3: hệ thống gán tự động (centralized) hiệu quả hơn người dùng tự chọn, đặc biệt khi kết hợp nhiều tiêu chí.
- **Thuật toán sử dụng:**
  - **LQR (Linear Quadratic Regulator):** Bộ điều khiển tối ưu tuyến tính — mô hình trạng thái `x(t)` = [số slot trống, tổng xe đang tìm, tốc độ lấp đầy] → hàm chi phí `J = ∫(x'Qx + u'Ru)dt` → tìm chính sách điều khiển `u*(t)` tối ưu.
  - **Centralized Assignment:** Hệ thống trung tâm thu thập toàn bộ trạng thái bãi xe → giải bài toán assignment toàn cục thay vì mỗi xe tự quyết định.
  - **Decentralized Baseline:** Mỗi xe tự tối ưu cục bộ (greedy nearest-first) — dùng làm đối chứng.

---

### [P5] MCDM Techniques for Smart Parking (TOPSIS + CRITIC)

Amari, A., Moussaid, L. & Tallal, S. (2023). "New Parking Lot Selection Approach Based on the Multi-Criteria Decision Making (MCDM) Methods: Health Criteria." *Sustainability*, 15(2), Article 938. MDPI.
- **DOI:** [10.3390/su15020938](https://doi.org/10.3390/su15020938)
- **Link:** [https://doi.org/10.3390/su15020938](https://doi.org/10.3390/su15020938)
- **Ranking:** *Sustainability* (MDPI) — Scopus **Q2** (Environmental Science) | IF = 3.3 | CiteScore = 5.8
- **Literature Review:** Nhóm bài nghiên cứu sử dụng phương pháp **CRITIC** (CRiteria Importance Through Intercriteria Correlation) để xác định trọng số **khách quan** cho mỗi tiêu chí phân bổ — thay vì gán trọng số chủ quan. Kết hợp với **TOPSIS** để xếp hạng các slot ứng viên dựa trên khoảng cách đến giải pháp lý tưởng. Tiêu chí bao gồm: khoảng cách đến cổng, chi phí, tình trạng giao thông, thể trạng người lái. Đây là nền tảng lý thuyết cho **Weighted Scoring Model (WSM)** trong RQ3 — hệ thống của chúng tôi đơn giản hóa TOPSIS thành WSM với 4 tiêu chí có trọng số cấu hình được.
- **Thuật toán sử dụng:**
  - **CRITIC Weighting:** `W_j = (σ_j × Σ(1 - r_jk)) / Σ_all` — trọng số tỷ lệ với độ lệch chuẩn (σ) và mức độ xung đột giữa các tiêu chí (1 - correlation).
  - **TOPSIS:** (1) Normalize ma trận quyết định → (2) Nhân trọng số CRITIC → (3) Tìm Ideal Best A⁺ và Ideal Worst A⁻ → (4) Tính khoảng cách Euclid D⁺, D⁻ → (5) Xếp hạng: `C_i = D⁻ / (D⁺ + D⁻)`. Slot có C_i cao nhất → được chọn.
  - **CODAS (Combinative Distance-based Assessment):** Phương pháp bổ sung — xếp hạng dựa trên cả Euclid distance và Taxicab distance đến giải pháp tối ưu.

---

### [P6] Cheetah Optimization Algorithm for Parking

Shirazi, F. & Farzaneh, N. (2025). "A Multi-Criteria Parking Space Proposing System based on Cheetah Optimizer Algorithm." *Journal of Artificial Intelligence and Data Mining (JAIDM)*, 13(4), 441–451. Shahrood University of Technology.
- **DOI:** [10.22044/jadm.2025.15911.2705](https://doi.org/10.22044/jadm.2025.15911.2705)
- **Link:** [https://doi.org/10.22044/jadm.2025.15911.2705](https://doi.org/10.22044/jadm.2025.15911.2705)
- **Ranking:** Scopus-indexed | IF không áp dụng | Regional journal (Iran, open access)
- **Literature Review:** Đề xuất thuật toán **COA (Cheetah Optimization Algorithm)** — metaheuristic bio-inspired mô phỏng hành vi săn mồi của báo ghê-ta — để giải bài toán phân bổ chỗ đỗ cá nhân hóa. COA được benchmark so với GA (Genetic Algorithm) và WOA (Whale Optimization Algorithm), cho kết quả tốt hơn về tốc độ hội tụ (convergence speed) và chất lượng giải (solution quality) trong kịch bản real-time. Nghiên cứu hỗ trợ RQ3: metaheuristic optimization có thể cải thiện đáng kể chất lượng phân bổ slot so với single-criteria. Trong hệ thống hiện tại, COA được liệt kê như **hướng nâng cấp tương lai** cho WSM.
- **Thuật toán sử dụng:**
  - **COA (Cheetah Optimization Algorithm):** 3 pha: (1) **Search** — quét không gian giải rộng (exploration), (2) **Sit-and-Wait** — khai thác vùng lân cận giải tốt (exploitation), (3) **Attack** — hội tụ nhanh về giải tối ưu. Hàm fitness: `f(x) = α×distance + β×cost + γ×availability`.
  - **GA Baseline:** Genetic Algorithm chuẩn (crossover + mutation) — dùng làm đối chứng.
  - **WOA Baseline:** Whale Optimization Algorithm — đối chứng thứ 2.

---

### [P7] Online Parking Assignment with Multi-Agent Deep RL

Zhang, X., Zhao, C., Liao, F., Li, X. & Du, Y. (2022). "Online parking assignment in an environment of partially connected vehicles: A multi-agent deep reinforcement learning approach." *Transportation Research Part C: Emerging Technologies*, 138, Article 103624. Elsevier.
- **DOI:** [10.1016/j.trc.2022.103624](https://doi.org/10.1016/j.trc.2022.103624)
- **Link:** [https://doi.org/10.1016/j.trc.2022.103624](https://doi.org/10.1016/j.trc.2022.103624)
- **Ranking:** Scopus **Q1** (Transportation, Computer Science) | IF = 7.9 | SJR = 2.734
- **Literature Review:** Giải quyết bài toán **Online Parking Assignment (OPA)** trong môi trường hỗn hợp gồm Connected Vehicles (CVs) và non-connected vehicles (NCVs). Đề xuất framework **Multi-Agent Deep Reinforcement Learning (MARL)** với hai agents độc lập: (1) agent đo lường tác động của NCVs lên không gian trạng thái, (2) agent khai thác đặc điểm đỗ xe của CVs. Kết quả: cải thiện **15% hiệu quả phân bổ** so với baseline First-Come-First-Served (FCFS). Ý tưởng centralized assignment và hard constraints (loại slot không phù hợp loại xe) được áp dụng trực tiếp vào WSM của hệ thống.
- **Thuật toán sử dụng:**
  - **MARL Framework:** Hai agents phối hợp theo value decomposition — mỗi agent học policy riêng → kết hợp joint Q-value để ra quyết định tổng thể.
  - **Modified Exploration Strategy:** Epsilon-greedy với decay adaptive — giảm exploration nhanh hơn ở vùng state ổn định.
  - **FCFS Baseline:** First-Come-First-Served — xe đến trước được gán slot gần nhất — dùng làm đối chứng.

---

### [P8] Peak-Period Parking Demand Allocation (NSGA-II)

Zhang, C., Liu, W., Yan, C., Ye, X. & Chen, J. (2024). "Optimization Method for Allocating Peak-Period Parking Demand in Hub Parking Lot Clusters." *Systems*, 12(10), 404. MDPI.
- **DOI:** [10.3390/systems12100404](https://doi.org/10.3390/systems12100404)
- **Link:** [https://www.mdpi.com/2079-8954/12/10/404](https://www.mdpi.com/2079-8954/12/10/404)
- **Ranking:** JCR **Q1** (Social Sciences, Interdisciplinary) | Scopus **Q2** (Modeling & Simulation) | IF = 3.1 | CiteScore = 4.1
- **Literature Review:** Phát triển mô hình tối ưu **phân bổ nhu cầu đỗ xe giờ cao điểm** cho cụm bãi xe hub giao thông. Xây dựng mô hình tính **delay** (thời gian chờ) khi xe tìm chỗ đỗ trên đường xung quanh bãi xe, sau đó chuyển thành bài toán tối ưu và giải bằng **NSGA-II** (Non-dominated Sorting Genetic Algorithm II). Kết quả: giảm **4.5% tổng thời gian chờ** — tương đương 13,860 giây tiết kiệm cho nhu cầu đỗ xe trong 1 giờ tại hub. Đây là cơ sở trực tiếp cho RQ4: thuật toán load balancing trong hệ thống sử dụng nguyên lý tương tự — phát hiện tầng sắp đầy (≥85%) rồi chuyển hướng xe đến tầng có occupancy thấp hơn.
- **Thuật toán sử dụng:**
  - **NSGA-II (Non-dominated Sorting GA II):** Multi-objective: `min F1(x) = TotalDelay` và `min F2(x) = LoadImbalance`. Sử dụng non-dominated sorting + crowding distance để duy trì Pareto front đa dạng. Toán tử: SBX crossover + polynomial mutation.
  - **Delay Calculation Model:** `D_k = f(demand_k, capacity_k, road_speed_k)` — tính delay cho mỗi bãi xe k dựa trên nhu cầu, capacity, và tốc độ đường dẫn vào.
  - **Demand Allocation Variables:** `x_ik` = tỷ lệ nhu cầu từ nguồn i được phân bổ cho bãi k, `Σ_k(x_ik) = 1`.

---

### [P9] Dynamic Coordinated Strategy for Mixed-Traffic Parking

Wang, Z., Zhang, C., Xue, S., Luo, Y., Chen, J., Wang, W. & Yan, X. (2024). "Dynamic coordinated strategy for parking guidance in a mixed driving parking lot involving human-driven and autonomous vehicles." *Electronic Research Archive*, 32(1), 523–550. AIMS Press.
- **DOI:** [10.3934/era.2024026](https://doi.org/10.3934/era.2024026)
- **Link:** [https://www.aimspress.com/article/doi/10.3934/era.2024026](https://www.aimspress.com/article/doi/10.3934/era.2024026)
- **Ranking:** Scopus & SCIE indexed | IF = 1.1 | CiteScore = 1.7
- **Literature Review:** Giới thiệu chiến lược phối hợp động (DCS) sử dụng thuật toán **"Parking-Cruising Path Tree" (PCPT)** cho bãi đỗ hỗn hợp (xe tự lái + xe người lái). Hàm mục tiêu kép: giảm thời gian cruising và giảm delay do blocking. Tỷ lệ tối ưu đạt lên đến **18%**, đặc biệt hiệu quả cho xe có thời gian cruising dài hoặc bãi xe có tỷ lệ bão hòa cao và tỷ lệ AV thấp. Đây là cơ sở cho hướng nâng cấp RQ4: áp dụng DCS/PCPT để tối ưu phân bổ slot và dẫn đường real-time.
- **Thuật toán sử dụng:**
  - **PCPT (Parking-Cruising Path Tree):** Xây dựng cây đường đi từ cổng vào đến từng slot → tính weight cho mỗi nhánh = `cruising_time + blocking_probability` → chọn nhánh có tổng weight nhỏ nhất.
  - **DCS (Dynamic Coordinated Strategy):** Cập nhật PCPT theo real-time khi slot thay đổi trạng thái → tái phân bổ đường đi cho xe đang trong bãi.
  - **Conflict Resolution:** Khi 2 xe hướng đến cùng slot → ưu tiên xe gần hơn, xe còn lại được chuyển sang slot tối ưu tiếp theo.

---

### [P10] Reservation & Allocation Model for Shared Parking under Uncertainty

Wang, S., Li, Z. & Xie, N. (2022). "A reservation and allocation model for shared-parking addressing the uncertainty in drivers' arrival/departure time." *Transportation Research Part C: Emerging Technologies*, 135, Article 103484. Elsevier.
- **DOI:** [10.1016/j.trc.2021.103484](https://doi.org/10.1016/j.trc.2021.103484)
- **Link:** [https://doi.org/10.1016/j.trc.2021.103484](https://doi.org/10.1016/j.trc.2021.103484)
- **Ranking:** Scopus **Q1** (Transportation, Computer Science) | IF = 7.9 | SJR = 2.734
- **Literature Review:** Phát triển mô hình tối ưu **đặt chỗ và phân bổ cho shared parking** (chia sẻ chỗ đỗ) có tính đến sự **không chắc chắn về thời gian đến/đi** của người lái. Đề xuất framework chance-constrained để đảm bảo tỷ lệ phục vụ đạt ngưỡng nhất định dù demand stochastic. Nghiên cứu chứng minh rằng việc tính cả slot đã reserved khi đánh giá effective occupancy giúp tránh over-allocation — nguyên lý này được áp dụng trực tiếp vào thuật toán Load Balancing (RQ4).
- **Thuật toán sử dụng:**
  - **Chance-Constrained Programming:** `P(demand ≤ capacity) ≥ 1 - ε` — đảm bảo xác suất phục vụ thành công ≥ ngưỡng (1 - ε) dù arrival time bất định.
  - **Reservation-Aware Capacity Model:** `effective_occupancy = (count_occupied + count_reserved) / total_slots` — tránh over-booking.
  - **Stochastic Arrival Model:** Mô hình hóa thời gian đến/đi bằng phân phối xác suất → giải bài toán phân bổ với expected value optimization.

---

### [P11] Natural Language Interfaces to Data (NLI Survey)

Quamar, A., Efthymiou, V., Lei, C. & Özcan, F. (2022). "Natural Language Interfaces to Data." *Foundations and Trends® in Databases*, 11(4), 319–414.
- **DOI:** [10.1561/1900000078](https://doi.org/10.1561/1900000078)
- **Link:** [https://doi.org/10.1561/1900000078](https://doi.org/10.1561/1900000078)
- **Ranking:** *Foundations and Trends® in Databases* — **Top-tier survey journal** | IF không áp dụng (survey/monograph) | Được trích dẫn rộng rãi trong cộng đồng NLP/DB
- **Literature Review:** Monograph toàn diện (96 trang) phân loại các phương pháp Natural Language Interface to Data (NLIDB): (1) Rule-based — sử dụng ontology, semantic index, knowledge graph; (2) Deep Learning — Seq2Seq, attention-based, pre-trained language models; (3) Hybrid — kết hợp cả hai. Trình bày chi tiết 3 thách thức cốt lõi: entity identification (nhận diện thực thể từ câu hỏi), entity connection (nối thực thể thành quan hệ có nghĩa), query generation (sinh truy vấn SQL/SPARQL). Chương về **Conversational Interfaces** mô tả cách duy trì ngữ cảnh qua multi-turn dialogue — rất phù hợp cho RQ5 vì Manager có thể hỏi liên tiếp: "Doanh thu hôm nay?" → "So với hôm qua thì sao?". Đây là nền tảng lý thuyết cho toàn bộ pipeline NLQ trong hệ thống.
- **Thuật toán sử dụng:**
  - **Entity Recognition Pipeline:** Tokenize → POS tagging → Named Entity Recognition → Entity Linking (map entity tới DB schema).
  - **Query Construction:** Rule-based: entity + relation → SQL template; DL-based: Seq2Seq encoder-decoder sinh SQL token-by-token.
  - **Conversational Context Management:** Co-reference resolution + ellipsis handling — giữ ngữ cảnh từ câu trước (ví dụ: "hôm nay" từ câu 1 áp dụng cho câu 2 nếu không nêu lại).

---

### [P12] Conversation-Based Information Delivery for Facility Management

Chen, K.L. & Tsai, M.H. (2021). "Conversation-Based Information Delivery Method for Facility Management." *Sensors*, 21(14), Article 4771. MDPI.
- **DOI:** [10.3390/s21144771](https://doi.org/10.3390/s21144771)
- **Link:** [https://doi.org/10.3390/s21144771](https://doi.org/10.3390/s21144771)
- **Ranking:** Scopus **Q1** (Instrumentation) | IF = 3.4 | CiteScore = 7.3
- **Literature Review:** Đề xuất phương pháp chatbot cho **quản lý cơ sở vật chất (Facility Management)** — cho phép nhân viên quản lý truy vấn thông tin tòa nhà qua hội thoại tự nhiên thay vì giao diện form-based truyền thống. Kiến trúc hệ thống gồm 4 module: (1) **Decision Mechanism** — điều phối luồng hội thoại, xác định hành động tiếp theo; (2) **Equipment Dataset** — cơ sở dữ liệu thiết bị/tầng/phòng; (3) **Intent Analysis** — phân loại ý định người dùng (hỏi thông tin, yêu cầu bảo trì, kiểm tra trạng thái); (4) **Knowledge Base** — cung cấp dữ liệu và ngữ cảnh cho câu trả lời. Prototype được triển khai và đánh giá tại tòa nhà hành chính Shulin (New Taipei City, Taiwan). Kết quả: giảm thời gian truy xuất thông tin, tăng hiệu quả ra quyết định. **Áp dụng trực tiếp cho RQ5:** kiến trúc 4-module được adapt cho chatbot quản lý bãi xe — thay Equipment Dataset bằng Parking Dataset (sessions, slots, revenue).
- **Thuật toán sử dụng:**
  - **Intent Classification Module:** Phân loại đầu vào thành các intent predefined: `query_info`, `request_maintenance`, `check_status`, `navigate_to`.
  - **Entity Extraction:** Trích xuất key entities: building name, floor number, equipment ID, time period.
  - **Decision Tree Logic:** If-then rules xác định luồng hội thoại dựa trên intent + entity → trả kết quả hoặc hỏi thêm thông tin.
  - **3D BIM Integration:** Kết nối với Building Information Model để hiển thị vị trí thiết bị trên mô hình 3D (phần này không áp dụng cho hệ thống parking).

---

### [P13] AI-Enhanced Chatbots in Facilities Management (TAM Study)

Alhammadi, M. (2023). "Optimising Customer Service Delivery and Response Time through AI-Enhanced Chatbots in Facilities Management: A Mixed-Methods Research." *American Journal of Smart Technology and Solutions*, 2(2).
- **DOI:** [10.54536/ajsts.v2i2.2206](https://doi.org/10.54536/ajsts.v2i2.2206)
- **Link:** [https://doi.org/10.54536/ajsts.v2i2.2206](https://doi.org/10.54536/ajsts.v2i2.2206)
- **Ranking:** Peer-reviewed journal | Open access | Regional scope (Middle East)
- **Literature Review:** Nghiên cứu mixed-methods (cả quantitative lẫn qualitative) đánh giá tác động của chatbot AI trong **quản lý cơ sở vật chất** tại Trung Đông (UAE, Qatar, Saudi Arabia). Sử dụng 2 framework lý thuyết: (1) **Technology Acceptance Model (TAM)** — đo lường Perceived Usefulness (PU), Perceived Ease of Use (PEOU), Behavioral Intention to Use (BIU); (2) **Social Response Theory (SRT)** — đánh giá mức độ "nhân cách hóa" (anthropomorphism) của chatbot ảnh hưởng đến user satisfaction. Khảo sát 10 facility managers, kết quả: **Pearson Correlation > 0.7** giữa 5 yếu tố (PU, PEOU, BIU, Responsiveness, User Satisfaction) — chứng minh chatbot có tác động tích cực mạnh. Các ứng dụng được xác định: automating workflows, predicting failures, managing meetings, conducting briefings, providing training. Thách thức: technical issues, security concerns, limited human-human interaction. **Áp dụng cho RQ5:** TAM framework được sử dụng để đánh giá user acceptance của chatbot báo cáo trong hệ thống parking.
- **Thuật toán sử dụng:**
  - **TAM Measurement Model:** 5 constructs → Likert scale survey → Pearson Correlation analysis → regression analysis.
  - **SRT Evaluation:** Đo mức anthropomorphism (chatbot có "giống người" không) → ảnh hưởng đến trust và adoption rate.
  - **Response Time Benchmarking:** So sánh thời gian phản hồi chatbot vs. kênh truyền thống (email, phone, help desk).

---

### [P14] AI-Powered Chatbots in Organizations (Systematic Literature Review)

Delgado, S., Villamarin, A. & Insuasti, J. (2025). "AI-Powered Chatbots in Organizations: A Systematic Literature Review." *Journal of Information Systems Engineering & Management*, 10(22s).
- **DOI:** [10.52783/jisem.v10i22s.3542](https://doi.org/10.52783/jisem.v10i22s.3542)
- **Link:** [https://doi.org/10.52783/jisem.v10i22s.3542](https://doi.org/10.52783/jisem.v10i22s.3542)
- **Ranking:** Scopus-indexed | Peer-reviewed | Open access
- **Literature Review:** Systematic Literature Review (SLR) tổng hợp **53 bài báo** về ứng dụng chatbot AI trong tổ chức. Phân loại 4 nhóm ứng dụng chính: (1) **Customer Service** — trả lời FAQ, xử lý khiếu nại, hỗ trợ kỹ thuật; (2) **Human Resources** — tuyển dụng, onboarding, quản lý nhân sự; (3) **Internal Operations** — **báo cáo, analytics, knowledge management**, workflow automation; (4) **Sales & Marketing** — lead generation, product recommendation. Xác định benefits: **giảm 60% thời gian truy xuất thông tin**, tự động hóa tác vụ lặp lại, tăng employee satisfaction. Challenges: trust & reliability, integration với hệ thống legacy, ethical concerns (bias, privacy), cost of implementation. Future directions: multi-modal chatbots (text + voice + visual), integration với LLMs, domain-specific fine-tuning. **Áp dụng cho RQ5:** SLR cung cấp evidence-base rằng chatbot trong nhóm "Internal Operations" (reporting, analytics) là một ứng dụng đã được nghiên cứu và chứng minh hiệu quả trong nhiều tổ chức.
- **Thuật toán sử dụng:**
  - **SLR Methodology:** PRISMA framework — xác định inclusion/exclusion criteria → search databases (Scopus, WoS, IEEE) → screen 200+ papers → select 53 final papers → thematic analysis.
  - **Thematic Categorization:** Phân loại theo: domain, technology stack (rule-based vs NLP vs LLM), deployment model (cloud vs on-premise), evaluation method (user study vs benchmark).
  - **Gap Analysis:** Xác định 5 research gaps cho future work, trong đó: "chatbot for real-time management reporting" là một gap chưa được khai thác đầy đủ.

---

> **Ghi chú:** Tất cả 14 paper đã được xác minh DOI. Paper [P2] (Jakob & Menendez, *Transportation Letters*, 2021) có DOI `10.1080/19427867.2021.1988245` tồn tại nhưng nằm sau paywall Taylor & Francis — có thể tra toàn văn qua ResearchGate hoặc email tác giả. Paper [P4], [P7], [P10] thuộc Elsevier (paywall) — truy cập qua thư viện trường hoặc Sci-Hub. Các paper [P1], [P5], [P6], [P8], [P9], [P11], [P12], [P13], [P14] là open access, truy cập tự do.


