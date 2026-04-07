from app.core.business_view import build_business_view
from app.core.parser_structured import parse_cnab_to_json
from pathlib import Path
from typing import Any, Dict

from app.core.layout_loader import load_layout
from app.core.parser_cnab import read_cnab_lines, validate_line_lengths
from app.core.validator import validate_and_fix_lines, validate_file_name
from app.core.writer import write_cnab_bytes
from app.models.layout import LayoutSchema


BASE_DIR = Path(__file__).resolve().parent.parent
LAYOUT_PATH = BASE_DIR / "layouts" / "cnab_444.json"
OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "outputs"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def build_corrected_file_name(file_name: str) -> str:
    path = Path(file_name)
    suffix = path.suffix or ".REM"
    return f"{path.stem}_CORRIGIDO{suffix}"


def load_default_layout() -> LayoutSchema:
    return load_layout(str(LAYOUT_PATH))


def process_cnab_file(file_name: str, file_bytes: bytes) -> Dict[str, Any]:
    layout = load_default_layout()
    lines = read_cnab_lines(file_bytes)

    file_name_issues = validate_file_name(file_name, layout.file_name_pattern)
    length_issues = validate_line_lengths(lines, layout.line_length)

    corrected_lines, issues, summary = validate_and_fix_lines(lines, layout)
    corrected_name = build_corrected_file_name(file_name)
    corrected_path = OUTPUT_DIR / corrected_name

    corrected_bytes = write_cnab_bytes(corrected_lines)
    corrected_path.write_bytes(corrected_bytes)

    all_issues = file_name_issues + length_issues + issues

    return {
        "success": True,
        "layout": layout.name,
        "input_file": file_name,
        "output_file": corrected_name,
        "output_path": str(corrected_path),
        "summary": summary,
        "issues": all_issues,
    }

def parse_cnab_file(file_name: str, file_bytes: bytes) -> Dict[str, Any]:
    layout = load_default_layout()
    lines = read_cnab_lines(file_bytes)

    parsed = parse_cnab_to_json(lines, layout)
    business_view = build_business_view(parsed)

    return {
        "success": True,
        "input_file": file_name,
        "layout": layout.name,
        "parsed": parsed,
        "business_view": business_view,
    }

def process_and_parse_cnab_file(file_name: str, file_bytes: bytes) -> Dict[str, Any]:
    result = process_cnab_file(file_name, file_bytes)
    corrected_bytes = Path(result["output_path"]).read_bytes()
    layout = load_default_layout()
    corrected_lines = read_cnab_lines(corrected_bytes)
    parsed = parse_cnab_to_json(corrected_lines, layout)
    business_view = build_business_view(parsed)

    result["parsed"] = parsed
    result["business_view"] = business_view
    return result