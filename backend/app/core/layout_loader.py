import json
from pathlib import Path
from app.models.layout import LayoutSchema


def load_layout(layout_path: str) -> LayoutSchema:
    path = Path(layout_path)
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return LayoutSchema.model_validate(data)