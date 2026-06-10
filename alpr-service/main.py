import cv2
import numpy as np
import re
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR

app = FastAPI(title="ALPR Service")

# ── Model init (PaddleOCR v3.6 + PaddlePaddle 3.3 CPU) ─────────────────────
try:
    ocr = PaddleOCR(
        use_textline_orientation=False,   # Bien so khong can xoay → tiet kiem thoi gian
        lang='en',
        text_det_thresh=0.2,
        text_det_box_thresh=0.3,
        det_limit_side_len=480,           # Giam kich thuoc detection → nhanh hon
    )
    print("[OK] PaddleOCR v3.6 loaded (CPU)")
except Exception as e:
    print(f"[FAIL] PaddleOCR load error: {e}")
    ocr = None


# ── Preprocessing cho cac dieu kien anh sang ────────────────────────────────

def preprocess_normal(img):
    h, w = img.shape[:2]
    if h < 100:
        scale = 100 / h
        img = cv2.resize(img, (int(w * scale), 100), interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    # Bo fastNlMeansDenoising — rat cham (~200ms) va khong can thiet cho bien so
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    gray = cv2.filter2D(gray, -1, kernel)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)


def preprocess_glare(img):
    """Xu ly choi sang: giam highlights, adaptive threshold"""
    h, w = img.shape[:2]
    if h < 100:
        scale = 100 / h
        img = cv2.resize(img, (int(w * scale), 100), interpolation=cv2.INTER_CUBIC)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
    l = clahe.apply(l)
    lab = cv2.merge([l, a, b])
    result = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY, 21, 10)
    return cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)


def preprocess_dark(img):
    """Xu ly thieu sang: tang gamma + CLAHE manh"""
    h, w = img.shape[:2]
    if h < 100:
        scale = 100 / h
        img = cv2.resize(img, (int(w * scale), 100), interpolation=cv2.INTER_CUBIC)
    gamma = 2.0
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype("uint8")
    bright = cv2.LUT(img, table)
    gray = cv2.cvtColor(bright, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    # Bo fastNlMeansDenoising — rat cham va khong can thiet cho bien so
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    gray = cv2.filter2D(gray, -1, kernel)
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)


# ── Parse PaddleOCR v3.6 output ─────────────────────────────────────────────

def parse_paddle_result(result):
    """
    PaddleOCR v3.6 tra ve dict voi key 'rec_texts', 'rec_scores', 'dt_polys'
    hoac list of [bbox, (text, conf)] tuy version.
    Ham nay xu ly ca 2 format.
    """
    items = []

    if result is None:
        return items

    # Format v3.6: dict voi 'rec_texts', 'rec_scores', 'dt_polys'
    if isinstance(result, dict):
        texts = result.get('rec_texts', [])
        scores = result.get('rec_scores', [])
        polys = result.get('dt_polys', [])
        for i in range(len(texts)):
            bbox = polys[i] if i < len(polys) else [[0,0],[0,0],[0,0],[0,0]]
            conf = scores[i] if i < len(scores) else 0.5
            text = texts[i] if i < len(texts) else ''
            y_center = sum(pt[1] for pt in bbox) / 4 if len(bbox) >= 4 else 0
            x_center = sum(pt[0] for pt in bbox) / 4 if len(bbox) >= 4 else 0
            items.append((y_center, x_center, str(text).strip(), float(conf)))
        return items

    # Format v2.x compat: list of lists
    if isinstance(result, list):
        data = result
        # Unwrap if nested: [[line1, line2, ...]]
        if len(data) == 1 and isinstance(data[0], list) and len(data[0]) > 0:
            if isinstance(data[0][0], list):
                data = data[0]

        for line in data:
            if isinstance(line, (list, tuple)) and len(line) >= 2:
                bbox = line[0]
                text_info = line[1]
                if isinstance(text_info, (list, tuple)) and len(text_info) >= 2:
                    text = str(text_info[0]).strip()
                    conf = float(text_info[1])
                elif isinstance(text_info, str):
                    text = text_info.strip()
                    conf = 0.5
                else:
                    continue
                y_center = sum(pt[1] for pt in bbox) / 4 if len(bbox) >= 4 else 0
                x_center = sum(pt[0] for pt in bbox) / 4 if len(bbox) >= 4 else 0
                items.append((y_center, x_center, text, conf))

    return items


# ── Sap xep text theo dong (Y) roi theo cot (X) ─────────────────────────────

def assemble_rows(items, row_gap_ratio=0.4):
    """Sap xep theo Y-center (dong) roi X-center (cot)."""
    if not items:
        return ""

    items.sort(key=lambda i: i[0])
    y_values = [i[0] for i in items]
    y_range = max(y_values) - min(y_values) if len(y_values) > 1 else 0
    threshold = y_range * row_gap_ratio if y_range > 10 else 999

    rows = []
    current_row = [items[0]]
    for item in items[1:]:
        if item[0] - current_row[-1][0] > threshold:
            rows.append(current_row)
            current_row = [item]
        else:
            current_row.append(item)
    rows.append(current_row)

    lines = []
    for row in rows:
        row.sort(key=lambda i: i[1])
        lines.append(" ".join(i[2] for i in row))

    return " ".join(lines)


def avg_confidence(items):
    if not items:
        return 0.0
    confs = [i[3] for i in items]
    return sum(confs) / len(confs)


# ── Chuan hoa bien so VN ─────────────────────────────────────────────────────

def fix_vn_plate(raw):
    s = raw.strip().upper()
    s = re.sub(r'[*#@\\/]', '-', s)
    s = re.sub(r'\s*-\s*', '-', s)
    s = re.sub(r'[^A-Z0-9\s.\-]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'^(\d{2})([A-Z])', r'\1-\2', s)

    def fix_after_dash(m):
        zone = m.group(1)
        fixed = list(zone)
        if fixed[0] == '8':
            fixed[0] = 'B'
        elif fixed[0] == '0':
            fixed[0] = 'D'
        elif fixed[0] == '6':
            fixed[0] = 'G'
        return '-' + ''.join(fixed)

    s = re.sub(r'-([A-Z0-9]{1,2})(?=\d)', fix_after_dash, s)
    return s


# ── OCR multi-pass ───────────────────────────────────────────────────────────

def _resize_for_ocr(img, max_w=640):
    """Thu nho anh lon de tang toc OCR, giu nguyen anh nho."""
    h, w = img.shape[:2]
    if w > max_w:
        scale = max_w / w
        img = cv2.resize(img, (max_w, int(h * scale)), interpolation=cv2.INTER_AREA)
    return img


# Nguong confidence de dung som — khong can chay them cac pass con lai
_EARLY_EXIT_CONF = 0.75


def ocr_image(img):
    """Chay PaddleOCR voi chien luoc early-exit: dung ngay khi du tot."""

    img = _resize_for_ocr(img)

    # Lazy preprocessors: chi tinh khi can
    preprocessors = [
        ("original", lambda: img),
        ("normal",   lambda: preprocess_normal(img)),
        ("glare",    lambda: preprocess_glare(img)),
        ("dark",     lambda: preprocess_dark(img)),
    ]

    best = None  # (text, conf, name)

    for name, make_img in preprocessors:
        try:
            processed = make_img()
            result = ocr.ocr(processed, cls=False)
            items = parse_paddle_result(result)
            if items:
                raw_text = assemble_rows(items)
                fixed = fix_vn_plate(raw_text)
                conf = avg_confidence(items)
                alphanum = re.sub(r'[^A-Z0-9]', '', fixed)
                if len(alphanum) >= 4:
                    print(f"  [{name}] -> {fixed} (conf={conf:.3f})")
                    if best is None or conf > best[1]:
                        best = (fixed, conf, name)
                    # Early exit neu da du tot
                    if conf >= _EARLY_EXIT_CONF:
                        print(f"  [early-exit] conf {conf:.3f} >= {_EARLY_EXIT_CONF}")
                        return best[0], best[1]
        except Exception as e:
            print(f"  [{name}] OCR error: {e}")

    if best:
        return best[0], best[1]

    return "", 0.0


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "engine": "PaddleOCR-v3.6-CPU"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Not an image")

    if ocr is None:
        raise HTTPException(503, "OCR engine not initialized")

    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Cannot decode image")

        print(f"\n[ALPR] Image: {img.shape[1]}x{img.shape[0]}")

        text, conf = ocr_image(img)

        plates = []
        if text:
            plates.append({"text": text, "confidence": round(conf, 4)})

        print(f"[ALPR] Final: {plates}")
        return JSONResponse({"results": plates})

    except Exception as e:
        print(f"[ALPR] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
