from typing import List, Dict, Any


def read_cnab_lines(file_bytes: bytes) -> List[str]:
    content = file_bytes.decode("latin-1")
    lines = []
    for raw_line in content.splitlines():
        line = raw_line.rstrip("\r\n")
        if line != "":
            lines.append(line)
    return lines


def get_record_type(line: str) -> str:
    return line[0:1] if line else ""


def validate_line_lengths(lines: List[str], expected_length: int) -> List[Dict[str, Any]]:
    issues = []

    for index, line in enumerate(lines, start=1):
        if len(line) != expected_length:
            issues.append(
                {
                    "line": index,
                    "field": "__line_length__",
                    "positions": f"1-{expected_length}",
                    "severity": "error",
                    "action": "not_corrected",
                    "from": len(line),
                    "to": expected_length,
                    "reason": f"Linha com tamanho {len(line)} diferente de {expected_length}",
                }
            )

    return issues