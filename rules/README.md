# Legal Metrology Rule Engine - Complete M2 Rule Pack

## Folder structure

### definitions/
One JSON file per Rule:
- R1.json to R34.json
- The original curated machine-readable files for R3, R6, R7, R8, R9, R10, R12 and R13 are preserved.
- Remaining rules contain rule metadata, status values, engine purpose and input groups for further executable logic.

### schedules/
Legal schedule data:
- first-schedule.json
- second-schedule.json
- third-schedule.json
- fourth-schedule.json
- fifth-schedule.json
- sixth-schedule.json
- seventh-schedule.json
- exceptions.json is preserved from the starter.

### test-cases/
- R1.test.json to R34.test.json
- schedules.test.json
- Existing detailed test cases for R3, R6, R7, R8, R9, R10, R12 and R13 are preserved.

## Status values

PASS
FAIL
VERIFY
NOT_APPLICABLE

## Recommended M2 implementation order

1. R3 - applicability
2. R6 - mandatory declarations
3. R10 - name/address validation
4. R12 - quantity manner
5. R13 - units
6. R7 - font/numeral size
7. R8 - declaration placement
8. R9 - readability/display
9. R18 onwards - sale price and inspection/testing workflow
10. Schedules 1, 5, 6 and 7 - error, sampling, testing and reporting

## Important

These JSON files are rule data and test definitions, not the executable JavaScript engine.
The backend rule engine should load these files and evaluate structured package data produced by the AI/OCR layer.
