'use strict'; // eslint-disable-line

const fr = require('./file-read');

module.exports = {
  // questions for inquirer prompt
  deleteUser: [
    {
      type: 'input',
      name: 'userName',
      message: 'Enter the name of the user you would like to delete: ',
    },
    {
      type: 'checkbox',
      name: 'accountNames',
      message: 'Select the AWS CLI profile(s) you would like to delete the user from: ',
      choices: fr.parseFile(),
    },
    {
      type: 'input',
      name: 'confirm',
      message: 'Are you sure you want to delete the user from all the accounts selected above ("y" or "n")? ',
    },
  ],
};
