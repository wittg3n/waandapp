import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any
from sources import PDFS
import fitz
import requests


# =========================================================
# Configuration
# =========================================================

BASE_URL = "https://dl.heyvagroup.com/admin/Files/upload/"

ROOT_DIR = Path(__file__).resolve().parent
PDF_DIR = ROOT_DIR / "pdf"
OUTPUT_PATH = ROOT_DIR / "sanjesh_universities.json"



    


# =========================================================
# Persian normalization
# =========================================================

FA_TO_EN_DIGITS = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹",
    "0123456789",
)


def normalize(text: str) -> str:
    text = text.translate(FA_TO_EN_DIGITS)

    replacements = {
        "ي": "ی",
        "ى": "ی",
        "ك": "ک",
        "\u200c": " ",
        "\u200f": "",
        "\u200e": "",
        "\ufeff": "",
        "ۀ": "ه",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return " ".join(text.split())


# =========================================================
# Download
# =========================================================

def ensure_directories() -> None:
    PDF_DIR.mkdir(parents=True, exist_ok=True)


def download_pdf(filename: str) -> Path:
    """
    Downloads PDF only if it does not already exist.
    """

    destination = PDF_DIR / filename

    if destination.exists():
        print(f"[SKIP] {filename}")
        return destination

    url = BASE_URL + filename

    print(f"[DOWNLOAD] {url}")

    try:
        with requests.get(
            url,
            stream=True,
            timeout=120,
        ) as response:
            response.raise_for_status()

            total = int(
                response.headers.get(
                    "content-length",
                    0,
                )
            )

            downloaded = 0

            with destination.open("wb") as file:
                for chunk in response.iter_content(
                    chunk_size=1024 * 1024
                ):
                    if not chunk:
                        continue

                    file.write(chunk)
                    downloaded += len(chunk)

                    if total:
                        percent = downloaded / total * 100

                        print(
                            f"\r    {percent:6.2f}% "
                            f"({downloaded / 1024 / 1024:.1f} MB)",
                            end="",
                        )

        print()
        print(f"[DONE] {filename}")

        return destination

    except Exception:
        # جلوگیری از باقی ماندن فایل ناقص
        if destination.exists():
            destination.unlink()

        raise


def download_all_pdfs() -> list[dict[str, Any]]:
    downloaded = []

    for pdf_config in PDFS:
        try:
            path = download_pdf(
                pdf_config["filename"]
            )

            downloaded.append({
                **pdf_config,
                "path": path,
            })

        except requests.RequestException as error:
            print(
                f"[ERROR] Failed to download "
                f"{pdf_config['filename']}: {error}"
            )

    return downloaded


# =========================================================
# PDF line extraction
# =========================================================

def get_visual_lines(
    page,
    y_tolerance: float = 3,
) -> list[list[str]]:
    """
    Groups PDF words by their visual Y coordinate.

    Persian text is RTL, so words inside each line are
    sorted from right to left.
    """

    words = page.get_text("words")

    rows = []

    for word in words:
        x0, y0, x1, y1, text, *_ = word

        text = normalize(text)

        if not text:
            continue

        y_center = (y0 + y1) / 2

        row = None

        for candidate in rows:
            if abs(candidate["y"] - y_center) <= y_tolerance:
                row = candidate
                break

        if row is None:
            row = {
                "y": y_center,
                "words": [],
            }

            rows.append(row)

        row["words"].append({
            "text": text,
            "x0": x0,
            "x1": x1,
        })

    rows.sort(
        key=lambda item: item["y"]
    )

    result = []

    for row in rows:
        row["words"].sort(
            key=lambda word: word["x0"],
            reverse=True,
        )

        result.append([
            word["text"]
            for word in row["words"]
        ])

    return result


# =========================================================
# University detection
# =========================================================

UNIVERSITY_KEYWORDS = (
    "دانشگاه",
    "موسسه آموزش عالی",
    "مؤسسه آموزش عالی",
    "موسسه غیرانتفاعی",
    "مؤسسه غیرانتفاعی",
    "دانشکده",
    "مرکز آموزش عالی",
)


def is_university_heading(text: str) -> bool:
    text = normalize(text)

    has_keyword = any(
        keyword in text
        for keyword in UNIVERSITY_KEYWORDS
    )

    if not has_keyword:
        return False

    # ساختار رایج دفترچه سنجش:
    #
    # استان تهران - دانشگاه صنعتی شریف - تهران

    if text.startswith("استان "):
        return True

    return False


def clean_university_name(text: str) -> str:
    text = normalize(text)

    text = re.sub(
        r"^استان\s+.*?\s*-\s*",
        "",
        text,
        count=1,
    )

    return text.strip(" -")


# =========================================================
# Major / code detection
# =========================================================

CODE_RE = re.compile(r"^\d{5}$")


STOP_WORDS = {
    "-",
    "زن",
    "مرد",
    "زن-مرد",
    "زن و مرد",
    "مرد و زن",
}


def is_number(value: str) -> bool:
    return bool(
        re.fullmatch(
            r"\d+",
            value,
        )
    )


def extract_major_from_row(
    tokens: list[str],
) -> dict[str, str] | None:

    tokens = [
        normalize(token)
        for token in tokens
    ]

    code_index = None
    code = None

    for index, token in enumerate(tokens):
        if CODE_RE.fullmatch(token):
            code_index = index
            code = token
            break

    if code_index is None:
        return None

    major_tokens = []

    for token in tokens[code_index + 1:]:

        if token in STOP_WORDS:
            break

        if is_number(token):
            break

        if CODE_RE.fullmatch(token):
            break

        major_tokens.append(token)

    major = normalize(
        " ".join(major_tokens)
    )

    if not major:
        return None

    forbidden = (
        "عنوان رشته",
        "کدرشته",
        "نحوه پذیرش",
        "ظرفیت",
    )

    if any(
        item in major
        for item in forbidden
    ):
        return None

    return {
        "code": code,
        "major": major,
    }


# =========================================================
# Parse one PDF
# =========================================================

def parse_pdf(
    pdf_config: dict[str, Any],
) -> list[dict[str, Any]]:

    path: Path = pdf_config["path"]

    year = pdf_config["year"]
    exam_group = pdf_config["exam_group"]
    filename = pdf_config["filename"]

    print()
    print("=" * 70)
    print(f"[PARSE] {filename}")
    print(f"[YEAR] {year}")
    print(f"[GROUP] {exam_group}")
    print("=" * 70)

    document = fitz.open(path)

    records = []

    current_university = None

    total_pages = len(document)

    for page_index, page in enumerate(document):

        print(
            f"\rPage "
            f"{page_index + 1}/{total_pages}",
            end="",
        )

        rows = get_visual_lines(page)

        for tokens in rows:

            line = normalize(
                " ".join(tokens)
            )

            # -----------------------------------------
            # University
            # -----------------------------------------

            if is_university_heading(line):
                current_university = (
                    clean_university_name(line)
                )

                continue

            if not current_university:
                continue

            # -----------------------------------------
            # Major
            # -----------------------------------------

            extracted = extract_major_from_row(
                tokens
            )

            if not extracted:
                continue

            records.append({
                "year": year,
                "examGroup": exam_group,
                "university": current_university,
                "major": extracted["major"],
                "code": extracted["code"],
                "source": filename,
                "page": page_index + 1,
            })

    document.close()

    print()
    print(
        f"[FOUND] {len(records)} records"
    )

    return records


# =========================================================
# Remove duplicate records
# =========================================================

def deduplicate_records(
    records: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    unique = {}

    for record in records:

        key = (
            record["year"],
            record["examGroup"],
            record["code"],
        )

        if key not in unique:
            unique[key] = record

    return list(
        unique.values()
    )


# =========================================================
# Build university view
# =========================================================

def build_university_index(
    records: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    universities = defaultdict(
        lambda: {
            "majors": set(),
            "examGroups": set(),
            "years": set(),
            "codes": set(),
        }
    )

    for record in records:

        university = record["university"]

        universities[university]["majors"].add(
            record["major"]
        )

        universities[university]["examGroups"].add(
            record["examGroup"]
        )

        universities[university]["years"].add(
            record["year"]
        )

        universities[university]["codes"].add(
            record["code"]
        )

    output = []

    for name, data in sorted(
        universities.items()
    ):

        output.append({
            "name": name,

            "majors": sorted(
                data["majors"]
            ),

            "examGroups": sorted(
                data["examGroups"]
            ),

            "years": sorted(
                data["years"]
            ),

            "programCount": len(
                data["codes"]
            ),
        })

    return output


# =========================================================
# Save JSON
# =========================================================

def save_json(
    records: list[dict[str, Any]],
) -> None:

    university_index = (
        build_university_index(records)
    )

    result = {
        "metadata": {
            "source": "sanjesh",
            "baseUrl": BASE_URL,
            "pdfCount": len(PDFS),
            "universityCount": len(
                university_index
            ),
            "programCount": len(records),
        },

        "universities": university_index,

        "programs": records,
    }

    with OUTPUT_PATH.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print()
    print("=" * 70)
    print("[SUCCESS]")
    print(
        f"Universities : "
        f"{len(university_index)}"
    )
    print(
        f"Programs     : "
        f"{len(records)}"
    )
    print(
        f"Output       : "
        f"{OUTPUT_PATH}"
    )
    print("=" * 70)


# =========================================================
# Main
# =========================================================

def main() -> None:

    ensure_directories()

    # -----------------------------------------
    # Download
    # -----------------------------------------

    pdfs = download_all_pdfs()

    if not pdfs:
        print(
            "[ERROR] No PDFs available."
        )
        return

    # -----------------------------------------
    # Parse
    # -----------------------------------------

    all_records = []

    for pdf_config in pdfs:

        try:
            records = parse_pdf(
                pdf_config
            )

            all_records.extend(
                records
            )

        except Exception as error:
            print()
            print(
                f"[ERROR] Failed to parse "
                f"{pdf_config['filename']}"
            )
            print(error)

    # -----------------------------------------
    # Deduplicate
    # -----------------------------------------

    all_records = deduplicate_records(
        all_records
    )

    # -----------------------------------------
    # Save
    # -----------------------------------------

    save_json(
        all_records
    )


if __name__ == "__main__":
    main()