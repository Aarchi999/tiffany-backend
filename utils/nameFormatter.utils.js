// for single value
function formatNameToSlug(name) {
  return name.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const commaSeparatortoNumberArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(Number); // already array
  if (typeof value === "string") {
    return value
      .split(",")        // split by comma
      .map(item => item.trim()) // remove extra spaces
      .filter(item => item !== "") // remove empty strings
      .map(Number);      // convert to number
  }
  return [Number(value)]; // single number
};


const commaSeparatorToStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim());
  if (typeof value === "string") {
    return value
      .split(",")
      .map(v => v.trim())
      .filter(v => v !== "");
  }
  return [String(value).trim()];
};

// console.log(formatNameToSlug("View Orders"));

module.exports = {
  formatNameToSlug,
  commaSeparatortoNumberArray,
  commaSeparatorToStringArray
}
