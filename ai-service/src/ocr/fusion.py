from difflib import SequenceMatcher
import re
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class OCRPass:
    text: str
    confidence: float
    variant_name: str

def string_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def fuse_ocr_results(passes: List[OCRPass]) -> Dict[str, Any]:
    """
    Fuse multiple OCR readings into the best supported result.
    Uses confidence and agreement across variants.
    """
    if not passes:
        return {"text": "", "confidence": 0.0, "agreement": 0.0}

    # Clean up texts for comparison
    for p in passes:
        p.text = p.text.strip()

    # If only one pass, return it
    if len(passes) == 1:
        return {
            "text": passes[0].text,
            "confidence": passes[0].confidence,
            "agreement": 1.0,
            "best_variant": passes[0].variant_name
        }

    # Group similar results
    groups = []
    for p in passes:
        if not p.text: continue
        found = False
        for group in groups:
            if string_similarity(p.text, group['representative']) > 0.85:
                group['items'].append(p)
                # Update representative to the most confident one
                if p.confidence > group['max_conf']:
                    group['max_conf'] = p.confidence
                    group['representative'] = p.text
                found = True
                break
        if not found:
            groups.append({
                'representative': p.text,
                'items': [p],
                'max_conf': p.confidence
            })

    if not groups:
        return {"text": "", "confidence": 0.0, "agreement": 0.0}

    # Score groups based on agreement and max confidence
    for group in groups:
        agreement_score = len(group['items']) / len(passes)
        # Final score is weighted combination
        group['score'] = (group['max_conf'] * 0.6) + (agreement_score * 0.4)

    # Pick the best group
    best_group = max(groups, key=lambda x: x['score'])
    
    return {
        "text": best_group['representative'],
        "confidence": best_group['max_conf'],
        "agreement": len(best_group['items']) / len(passes),
        "all_candidates": [g['representative'] for g in groups],
        "best_variant": best_group['items'][0].variant_name # Just pick one from best group
    }

def contextual_correction(text: str, field_type: str) -> str:
    """
    Apply character-level recovery based on field context.
    Example: O -> 0 in numeric fields.
    """
    if field_type in ['MRP', 'NET_QTY', 'DATE']:
        # Common numeric confusions
        replacements = {
            'O': '0',
            'o': '0',
            'I': '1',
            'l': '1',
            'S': '5',
            's': '5',
            'B': '8',
            'G': '6',
            'Z': '2',
        }
        # Only replace if it looks like it should be numeric
        # This is a bit risky if done globally, so we should be careful
        if field_type == 'MRP':
            # Example: MRP ₹12O -> MRP ₹120
            parts = re.split(r'(\d+)', text)
            new_parts = []
            for part in parts:
                if any(c.isdigit() for c in part):
                    new_parts.append(part)
                else:
                    # If this part is between digits or at the end of a digit string, try replacing
                    # For simplicity, we just check if it's a single character from the list
                    if len(part) == 1 and part in replacements:
                        new_parts.append(replacements[part])
                    else:
                        new_parts.append(part)
            return "".join(new_parts)
            
    return text
