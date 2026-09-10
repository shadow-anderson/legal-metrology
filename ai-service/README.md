# METRA AI service

Independent image-to-evidence service. It has no imports from the rule engine, backend, database, or frontend.

## Run

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --app-dir . --reload
```

The service exposes `GET /health`, `GET /version`, and `POST /analyze` as multipart form data with `image` and optional UUID `image_id` fields. The response is validated against `schema/ai-output.schema.json` before it is returned and saved as `output/<image-id>.json`.

OCR prefers Tesseract through the optional `pytesseract` adapter when a native executable is available, and falls back to in-process `rapidocr-onnxruntime` without requiring an external executable. The image loader supports JPEG, PNG, WebP, and AVIF through Pillow and `pillow-avif-plugin`. If no OCR backend is installed or OCR finds no text, the service returns schema-valid null observations and an empty evidence list; it never creates a compliance decision.

## Pipeline output

`POST /analyze` returns one JSON document containing the complete METRA AI Output contract: `product`, `regions`, `imageQuality`, and `scale`. OCR observations are kept internal; extracted declarations are linked to their source image with schema-valid evidence regions. The service does not call the rule engine, database, frontend, or report system.

The pipeline runs EXIF orientation correction, image-quality measurement, original OCR, and adaptive upscaled/contrast-enhanced OCR recovery. It reconstructs reading order from bounding boxes, extracts contextual declarations, normalizes MRP and quantity units, and validates the final object against `schema/ai-output.schema.json` before returning it.