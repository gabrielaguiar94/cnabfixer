from app.models.layout import LayoutField
from app.core.utils import fit_value


def blank_value(length: int) -> str:
    return " " * length


def zero_value(length: int) -> str:
    return "0" * length


def normalize_field(raw_value: str, field: LayoutField) -> str:
    length = field.end - field.start + 1

    if field.fixed_value is not None:
        if field.fixed_value == "":
            return blank_value(length)
        return fit_value(field.fixed_value, length, field.type)

    if not raw_value.strip():
        if field.blank_when_empty:
            return blank_value(length)

        if field.zeros_when_empty:
            return zero_value(length)

        if field.default is not None:
            if field.default == "":
                return blank_value(length)
            return fit_value(field.default, length, field.type)

        if field.type == "num":
            return zero_value(length)

        return blank_value(length)

    return fit_value(raw_value, length, field.type)