// Basic Validations

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 4;

const isValidOTP = (otp) => /^\d{6}$/.test(String(otp));

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidEnum = (value, validValues) =>
  validValues.includes(value);

const isValidId = (id) =>
  Number.isInteger(Number(id)) && Number(id) > 0;


const isValidPostalcode = (postalcode) => {
  return /^[A-Za-z0-9\s]{4,7}$/.test(String(postalcode).trim());
};


const isValidPhoneNumber = (phone) => {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return /^1?\d{10}$/.test(String(cleaned));
};


// Validation For time and date

const isNotEmptyDate = (date) =>
  date !== undefined &&
  date !== null &&
  String(date).trim() !== "";

const isStartDateInFutureOrToday = (start_date) => {
  if (!start_date) return false;

  const start = new Date(start_date);
  if (isNaN(start.getTime())) return false;

  const now = new Date();

  // Optional: ignore time, compare only date
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return start >= now;
};


const isEndDateAfterStart = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return endDate >= startDate;
};


const isValidTime = (time) => {
  if (typeof time !== "string") return false;

  // Matches "HH:MM" (24-hour format)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

  return timeRegex.test(time);
};

const isEndTimeAfterStart = (start, end) => {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);

  // Ensure both get hours, minutes, seconds
  const [sh, sm, ss = 0] = startParts;
  const [eh, em, es = 0] = endParts;

  const startSeconds = sh * 3600 + sm * 60 + ss;
  const endSeconds = eh * 3600 + em * 60 + es;

  return endSeconds > startSeconds;
};

const isEndTimeWithinSameDay = (endTime) => {
  const [h, m, s = 0] = endTime.split(':').map(Number);

  // max allowed is 23:59:59
  return (
    h >= 0 && h <= 23 &&
    m >= 0 && m <= 59 &&
    s >= 0 && s <= 59
  );
};

// Validation for digits
const isValidNumber = (value) =>
  !isNaN(value);

const isValidNonNegativeNumber = (value) =>
  !isNaN(value) && Number(value) >= 0;


const isValidPositiveNumber = (value) =>
  !isNaN(value) && Number(value) > 0;




module.exports = {
  isValidEmail,
  isValidPassword,
  isValidOTP,
  isNonEmptyString,
  isValidEnum,
  isValidId,
  isValidPostalcode,
  isValidPhoneNumber,

  isValidTime,
  isNotEmptyDate,
  isStartDateInFutureOrToday,
  isEndDateAfterStart,
  isEndTimeAfterStart,
  isEndTimeWithinSameDay,


  isValidNumber,
  isValidNonNegativeNumber,
  isValidPositiveNumber
};
