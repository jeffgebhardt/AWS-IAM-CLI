'use strict'; //eslint-disable-line

const fs = require('fs');
const os = require('os');

module.exports = {
  parseFile: () => {
    // Find home directory
    const homeDir = os.homedir();
    const file = `${homeDir}/.aws/credentials`;

    const profiles = [];
    const parsedProfiles = [];

    // Read AWS credentials file
    fs.readFileSync(file).toString().split('\n').forEach((line) => {
      if (line.charAt(0) === '[') {
        profiles.push(line);
      }
    });

    // Parse profile names
    for (let i = 0; i < profiles.length; i += 1) {
      parsedProfiles.push(profiles[i].replace(/[\[\]']+/g,'')); //eslint-disable-line
    }
    return parsedProfiles;
  },
};
