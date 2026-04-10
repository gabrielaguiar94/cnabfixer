from typing import List


def replace_slice(original: str, start: int, end: int, new_value: str) -> str:
    start_idx = start - 1
    end_idx = end
    field_length = end - start + 1
    adjusted_value = str(new_value)[:field_length].ljust(field_length, " ")
    return original[:start_idx] + adjusted_value + original[end_idx:]


def ensure_line_length(line: str, length: int) -> str:
    if len(line) > length:
        return line[:length]
    if len(line) < length:
        return line.ljust(length, " ")
    return line


def write_cnab_bytes(lines: List[str]) -> bytes:
    content = "\r\n".join(lines) + "\r\n"
    return content.encode("latin-1")