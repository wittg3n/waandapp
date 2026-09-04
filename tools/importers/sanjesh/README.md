# Sanjesh PDF Extractor

ابزار استخراج اطلاعات دانشگاه‌ها و رشته‌ها از دفترچه انتخاب رشته ریاضی سازمان سنجش و تبدیل آن‌ها به JSON.

این ابزار برای استفاده در پروژه **Waand** به‌عنوان بخشی از Data Ingestion Pipeline طراحی شده است.

---

## هدف

ورودی:

- PDF دفترچه انتخاب رشته
- مثال:
  `entekhabreste-ryazi-1404.pdf`

خروجی:

- فایل JSON شامل دانشگاه‌ها و رشته‌های استخراج‌شده

نمونه خروجی:

```json
[
  {
    "university": "دانشگاه صنعتی شریف - تهران",
    "majors": [
      "مهندسی برق",
      "مهندسی کامپیوتر",
      "مهندسی مکانیک"
    ]
  }
]
```

---

## ساختار پیشنهادی در Waand

```text
waand/
├── apps/
│   ├── web/
│   ├── admin-dashboard/
│   └── api/
│
├── packages/
│   └── database/
│
└── tools/
    └── importers/
        └── sanjesh/
            ├── extract.py
            ├── requirements.txt
            ├── README.md
            └── output/
                └── universities.json
```

این extractor نباید در runtime اپلیکیشن اجرا شود.

بهتر است فقط برای:

1. دریافت داده خام از PDF
2. استخراج و normalize کردن اطلاعات
3. تولید JSON
4. اعتبارسنجی داده
5. import به دیتابیس Waand

استفاده شود.

---

## پیش‌نیازها

- Python 3.11 یا جدیدتر
- pip

بررسی نسخه Python:

```bash
python --version
```

---

## نصب

ابتدا وارد پوشه ابزار شوید:

```bash
cd tools/importers/sanjesh
```

سپس dependencyها را نصب کنید:

```bash
pip install -r requirements.txt
```

محتوای `requirements.txt`:

```txt
pymupdf>=1.24.0,<2.0.0
requests>=2.32.0,<3.0.0
```

---

## اجرا

```bash
python extract.py
```

اسکریپت:

1. PDF را دانلود می‌کند.
2. صفحات را با PyMuPDF پردازش می‌کند.
3. خطوط و کلمات فارسی را normalize می‌کند.
4. نام دانشگاه‌ها را شناسایی می‌کند.
5. رشته‌ها و کدرشته‌محل‌ها را استخراج می‌کند.
6. خروجی JSON تولید می‌کند.

---

## فایل‌های تولیدشده

بعد از اجرا معمولاً فایل‌های زیر ساخته می‌شوند:

```text
entekhabreste-ryazi-1404.pdf
universities.json
```

---

## فرمت فعلی خروجی

```json
[
  {
    "university": "دانشگاه صنعتی امیرکبیر - تهران",
    "majors": [
      "مهندسی برق",
      "مهندسی کامپیوتر",
      "مهندسی مکانیک"
    ]
  }
]
```

---

## فرمت پیشنهادی برای Waand

برای استفاده واقعی در Waand بهتر است در نسخه بعدی extractor هر `کدرشته‌محل` به‌عنوان یک record مستقل استخراج شود.

مثال:

```json
[
  {
    "year": 1404,
    "examGroup": "ریاضی",
    "code": "12345",
    "university": "دانشگاه صنعتی شریف",
    "province": "تهران",
    "city": "تهران",
    "major": "مهندسی کامپیوتر",
    "admissionType": "با آزمون",
    "semester": 1,
    "capacity": 40
  }
]
```

این مدل داده برای query، filtering، ranking و سیستم پیشنهاد انتخاب رشته مناسب‌تر است.

---

## معماری پیشنهادی Pipeline

```text
Sanjesh PDF
     │
     ▼
PDF Extractor
     │
     ▼
Raw JSON
     │
     ▼
Normalization
     │
     ▼
Validation
     │
     ▼
Database Import
     │
     ▼
Waand API
     │
     ├── Web
     ├── Admin Dashboard
     └── Recommendation Engine
```

---

## نکات مهم درباره PDF فارسی

PDFهای فارسی همیشه متن را به ترتیب بصری صحیح ذخیره نمی‌کنند.

به همین دلیل این extractor به‌جای اتکا صرف به:

```python
page.get_text("text")
```

از اطلاعات مکانی کلمات استفاده می‌کند:

```python
page.get_text("words")
```

و کلمات را بر اساس مختصات صفحه بازسازی می‌کند.

---

## Normalization فارسی

هنگام استخراج، موارد زیر normalize می‌شوند:

- `ي` → `ی`
- `ك` → `ک`
- اعداد فارسی → اعداد انگلیسی
- نیم‌فاصله‌ها
- کاراکترهای کنترل RTL/LTR
- فاصله‌های اضافی

این مرحله برای جلوگیری از duplicate شدن نام رشته‌ها و دانشگاه‌ها ضروری است.

---

## محدودیت‌ها

ساختار جدول‌ها ممکن است بین دفترچه‌های مختلف یا سال‌های مختلف تغییر کند.

بنابراین قبل از import داده به دیتابیس باید خروجی validate شود.

مواردی که باید بررسی شوند:

- تعداد دانشگاه‌های استخراج‌شده
- رشته‌های بدون دانشگاه
- نام دانشگاه‌های ناقص
- کدرشته‌های تکراری
- رشته‌های نامعتبر
- ظرفیت‌های اشتباه
- تغییر ساختار صفحات دفترچه

---

## پیشنهاد برای توسعه بعدی

نسخه‌های بعدی extractor می‌توانند اطلاعات زیر را نیز استخراج کنند:

- کدرشته‌محل
- استان
- شهر
- نوع دانشگاه
- نوع دوره
- نوبت پذیرش
- ظرفیت
- جنسیت پذیرش
- نوع پذیرش
- توضیحات
- شرایط خاص
- سال دفترچه
- گروه آزمایشی

---

## Data Model پیشنهادی

### universities

```text
id
name
province
city
type
```

### majors

```text
id
name
group
```

### university_programs

```text
id
university_id
major_id
admission_code
admission_type
study_period
capacity
year
source
```

---

## Source

دفترچه نمونه:

```text
https://dl.heyvagroup.com/admin/Files/upload/entekhabreste-ryazi-1404.pdf
```

---

## وضعیت

این ابزار در حال حاضر یک extractor اولیه است و قبل از استفاده production باید خروجی آن روی نمونه‌های واقعی دفترچه اعتبارسنجی شود.
