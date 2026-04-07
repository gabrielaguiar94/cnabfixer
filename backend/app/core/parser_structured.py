from typing import Any, Dict, List
from app.models.layout import LayoutSchema
from app.core.parser_cnab import get_record_type


def extract_raw_value(line: str, start: int, end: int) -> str:
    return line[start - 1:end]


def display_value(raw: str, field_type: str) -> str:
    if field_type == "num":
        return raw
    return raw.rstrip()


def parse_cnab_to_json(lines: List[str], layout: LayoutSchema) -> Dict[str, Any]:
    records: List[Dict[str, Any]] = []
    header: Dict[str, Any] | None = None
    detalhes: List[Dict[str, Any]] = []
    trailer: Dict[str, Any] | None = None

    for line_number, line in enumerate(lines, start=1):
        record_type = get_record_type(line)
        record_layout = layout.records.get(record_type)

        if not record_layout:
            records.append(
                {
                    "line_number": line_number,
                    "record_type": record_type,
                    "record_name": "unknown",
                    "raw_line": line,
                    "fields": {}
                }
            )
            continue

        field_map: Dict[str, Any] = {}
        flat_map: Dict[str, Any] = {}

        for field in record_layout.fields:
            raw = extract_raw_value(line, field.start, field.end)
            field_map[field.name] = {
                "raw": raw,
                "display": display_value(raw, field.type),
                "start": field.start,
                "end": field.end,
                "type": field.type
            }
            flat_map[field.name] = display_value(raw, field.type)

        record_obj = {
            "line_number": line_number,
            "record_type": record_type,
            "record_name": record_layout.name,
            "raw_line": line,
            "fields": field_map,
            "flat": flat_map
        }

        records.append(record_obj)

        if record_type == "0":
            header = flat_map
        elif record_type == "1":
            detalhes.append(flat_map)
        elif record_type == "9":
            trailer = flat_map

    return {
        "layout": layout.name,
        "line_length": layout.line_length,
        "records": records,
        "grouped": {
            "header": header,
            "detalhes": detalhes,
            "trailer": trailer
        }
    }