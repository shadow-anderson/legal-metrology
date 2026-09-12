const getNestedValue = (object, path) => {
  return path
    .split(".")
    .reduce((current, key) => {
      if (current === undefined || current === null) {
        return undefined;
      }

      return current[key];
    }, object);
};

module.exports = { getNestedValue };