const fourthSchedule = require("../../../rules/schedules/fourth-schedule.json");


// ==========================================
// NORMALIZE TEXT
// ==========================================

const normalizeText = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};


// ==========================================
// FIND FOURTH SCHEDULE ENTRY
// ==========================================

const findFourthScheduleEntry = (commodityName) => {

  if (!commodityName) {
    return null;
  }

  const normalizedCommodity =
    normalizeText(commodityName);


  // ========================================
  // EXACT MATCH
  // ========================================

  const exactMatch =
    fourthSchedule.entries.find((entry) => {

      const scheduleCommodity =
        normalizeText(entry.commodity);

      return (
        normalizedCommodity ===
        scheduleCommodity
      );

    });


  if (exactMatch) {
    return exactMatch;
  }


  // ========================================
  // PARTIAL MATCH
  // ========================================

  const partialMatch =
    fourthSchedule.entries.find((entry) => {

      const scheduleCommodity =
        normalizeText(entry.commodity);


      return (

        scheduleCommodity.includes(
          normalizedCommodity
        ) ||

        normalizedCommodity.includes(
          scheduleCommodity
        )

      );

    });


  if (partialMatch) {
    return partialMatch;
  }


  // ========================================
  // KEYWORD MATCHING
  // ========================================

  const keywordMatch =
    fourthSchedule.entries.find((entry) => {

      const scheduleWords =
        normalizeText(entry.commodity)
          .split(/[\s,()/-]+/)
          .filter(
            (word) =>
              word.length > 3
          );


      return scheduleWords.some(
        (word) =>
          normalizedCommodity.includes(word)
      );

    });


  return keywordMatch || null;

};

module.exports = { findFourthScheduleEntry };