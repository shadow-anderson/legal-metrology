from typing import List, Dict, Any, Optional
import re
from ..ocr.fusion import fuse_ocr_results, OCRPass

def verify_with_ai(
    field_name: str,
    original_crop: Any,
    enhanced_crops: List[Any],
    ocr_candidates: List[str],
    fused_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Placeholder for AI/VLM verification.
    In a real implementation, this would call a Multimodal LLM.
    Currently, it performs a strict consistency check.
    """
    # Rules:
    # - use only visible evidence (from OCR candidates)
    # - do not invent unreadable characters
    # - prefer agreement across OCR observations
    
    confidence = fused_result.get("confidence", 0.0)
    agreement = fused_result.get("agreement", 0.0)
    text = fused_result.get("text", "")
    
    # Simple heuristic "AI" verification:
    # If agreement is high and confidence is decent, it's verified.
    # If agreement is low but one OCR variant is very high confidence, it's verified.
    
    is_verified = False
    if agreement >= 0.5 and confidence > 0.4:
        is_verified = True
    elif confidence > 0.8:
        is_verified = True
    
    # If conflicting readings have similar scores, mark as conflicting
    if not is_verified and len(ocr_candidates) > 1:
        return {
            "text": text,
            "status": "CONFLICTING",
            "confidence": confidence * 0.5,
            "verified": False
        }

    if not text:
        return {
            "text": "",
            "status": "NOT_DETECTED",
            "confidence": 0.0,
            "verified": False
        }

    return {
        "text": text,
        "status": "DETECTED" if is_verified else "UNREADABLE",
        "confidence": confidence,
        "verified": is_verified
    }

def extract_regulatory_fields(fusion_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Final extraction of fields using fused OCR results.
    """
    extracted = {}
    for field, result in fusion_results.items():
        # result is the output of verify_with_ai
        text = result.get("text", "")
        extracted[field] = {
            "raw_text": text,
            "confidence": result.get("confidence", 0.0),
            "status": result.get("status", "NOT_DETECTED")
        }
    return extracted
