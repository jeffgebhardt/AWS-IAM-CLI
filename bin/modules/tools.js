'use strict'; // eslint-disable-line

module.exports = {
  // Verify input is not empty
  inputVer: (input) => {
    let badInput = false;
    Object.keys(input).forEach((key) => {
      if (input[key] === '') {
        badInput = true;
      }
    });
    return badInput;
  },

  // Parse yes or no questions
  confirmParser: input => input.toLowerCase().charAt(0),

  // Parse JSON safely
  safeJson: (input) => {
    let parsed;

    try {
      parsed = JSON.parse(input);
    } catch (error) {
      return {};
    }

    return parsed;
  },
};
