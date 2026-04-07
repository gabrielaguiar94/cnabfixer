from typing import Dict, List, Literal, Optional
from pydantic import BaseModel


FieldType = Literal["num", "alpha"]


class LayoutField(BaseModel):
    name: str
    start: int
    end: int
    type: FieldType
    required: bool = False
    default: Optional[str] = None
    fixed_value: Optional[str] = None
    allowed_values: Optional[List[str]] = None
    blank_when_empty: bool = False
    zeros_when_empty: bool = False
    date_format: Optional[str] = None
    money_decimals: Optional[int] = None
    autocorrect: bool = False
    description: Optional[str] = None


class RecordLayout(BaseModel):
    name: str
    fields: List[LayoutField]


class LayoutSchema(BaseModel):
    name: str
    line_length: int
    file_name_pattern: Optional[str] = None
    records: Dict[str, RecordLayout]