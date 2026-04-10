from pathlib import Path
from typing import Any, Dict

from app.core.business_view import build_business_view
from app.core.corrector import normalize_field
from app.core.layout_loader import load_layout
from app.core.parser_cnab import read_cnab_lines, validate_line_lengths, get_record_type
from app.core.parser_structured import parse_cnab_to_json
from app.core.validator import validate_and_fix_lines, validate_file_name
from app.core.writer import write_cnab_bytes, replace_slice, ensure_line_length
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


def extract_field_value(line: str, field) -> str:
    return line[field.start - 1:field.end]


def apply_corrections(lines, layout: LayoutSchema):
    corrected_lines = []

    for line in lines:
        corrected_line = ensure_line_length(line, layout.line_length)
        record_type = get_record_type(corrected_line)

        if record_type not in layout.records:
            corrected_lines.append(corrected_line)
            continue

        record_layout = layout.records[record_type]

        for field in record_layout.fields:
            original_value = extract_field_value(corrected_line, field)
            normalized_value = normalize_field(original_value, field)

            if field.autocorrect and original_value != normalized_value:
                corrected_line = replace_slice(
                    corrected_line,
                    field.start,
                    field.end,
                    normalized_value,
                )

        corrected_lines.append(corrected_line)

    return corrected_lines


def process_cnab_file(file_name: str, file_bytes: bytes) -> Dict[str, Any]:
    layout = load_default_layout()
    lines = read_cnab_lines(file_bytes)

    file_name_issues = validate_file_name(file_name, layout.file_name_pattern)
    length_issues = validate_line_lengths(lines, layout.line_length)

    validated_lines, issues, summary = validate_and_fix_lines(lines, layout)
    parsed = parse_cnab_to_json(validated_lines, layout)
    business_view = build_business_view(parsed)

    all_issues = file_name_issues + length_issues + issues

    return {
        "success": True,
        "layout": layout.name,
        "input_file": file_name,
        "summary": summary,
        "issues": all_issues,
        "parsed": parsed,
        "business_view": business_view,
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
    return process_cnab_file(file_name, file_bytes)


def generate_corrected_cnab_file(file_name: str, file_bytes: bytes) -> Dict[str, Any]:
    layout = load_default_layout()
    lines = read_cnab_lines(file_bytes)

    corrected_lines = apply_corrections(lines, layout)

    corrected_name = build_corrected_file_name(file_name)
    corrected_path = OUTPUT_DIR / corrected_name

    corrected_bytes = write_cnab_bytes(corrected_lines)
    corrected_path.write_bytes(corrected_bytes)

    return {
        "success": True,
        "layout": layout.name,
        "input_file": file_name,
        "output_file": corrected_name,
        "output_path": str(corrected_path),
    }