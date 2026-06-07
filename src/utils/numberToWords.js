/**
 * Converts a numeric amount into Indian English Words (Rupees and Paise).
 * Example: 123456.78 -> Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six and Seventy Eight Paise Only.
 */
export function numberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return "";

  // Split integer and decimal parts
  const parts = parseFloat(num).toFixed(2).split(".");
  const rupeesVal = parseInt(parts[0], 10);
  const paiseVal = parseInt(parts[1], 10);

  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const doubleDigits = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tensDigits = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(val) {
    if (val < 10) return singleDigits[val];
    if (val < 20) return doubleDigits[val - 10];
    const tens = Math.floor(val / 10);
    const ones = val % 10;
    return tensDigits[tens] + (ones ? " " + singleDigits[ones] : "");
  }

  function convertThreeDigits(val) {
    const hundreds = Math.floor(val / 100);
    const rest = val % 100;
    let str = "";
    if (hundreds > 0) {
      str += singleDigits[hundreds] + " Hundred";
    }
    if (rest > 0) {
      str += (str ? " " : "") + convertTwoDigits(rest);
    }
    return str;
  }

  function convertNumber(val) {
    if (val === 0) return "Zero";

    let result = "";

    // Crores (1,00,00,000)
    const crores = Math.floor(val / 10000000);
    let remaining = val % 10000000;
    if (crores > 0) {
      result += convertThreeDigits(crores) + " Crore ";
    }

    // Lakhs (1,00,000)
    const lakhs = Math.floor(remaining / 100000);
    remaining = remaining % 100000;
    if (lakhs > 0) {
      result += convertTwoDigits(lakhs) + " Lakh ";
    }

    // Thousands (1,000)
    const thousands = Math.floor(remaining / 1000);
    remaining = remaining % 1000;
    if (thousands > 0) {
      result += convertTwoDigits(thousands) + " Thousand ";
    }

    // Hundreds and tens
    if (remaining > 0) {
      result += convertThreeDigits(remaining);
    }

    return result.trim();
  }

  let words = "Rupees ";
  if (rupeesVal === 0) {
    words += "Zero";
  } else {
    words += convertNumber(rupeesVal);
  }

  if (paiseVal > 0) {
    words += " and " + convertTwoDigits(paiseVal) + " Paise";
  }

  words += " Only";
  return words;
}
