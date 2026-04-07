from datetime import datetime


def only_digits(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def is_valid_ddmmaa(value: str) -> bool:
    if not value or not value.isdigit() or len(value) != 6:
        return False
    if value == "000000":
        return True
    try:
        datetime.strptime(value, "%d%m%y")
        return True
    except ValueError:
        return False


def fit_num(value: str, length: int) -> str:
    digits = only_digits(value)
    return digits[:length].rjust(length, "0")


def fit_alpha(value: str, length: int) -> str:
    value = value or ""
    return value[:length].ljust(length, " ")


def fit_value(value: str, length: int, field_type: str) -> str:
    if field_type == "num":
        return fit_num(value, length)
    return fit_alpha(value, length)