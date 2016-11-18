'use strict'; // eslint-disable-line

// dependencies
const vorpal = require('vorpal');
const chalk = require('chalk');
const asyncblock = require('asyncblock');
const exec = require('child_process').exec;

// files
const tools = require('./modules/tools');
const questions = require('./modules/questions');

// colors
const title = chalk.bold.underline.yellow;
const red = chalk.bold.red;
const blue = chalk.bold.blue;
const yellow = chalk.bold.yellow;

// Banner
console.log(title('Hello, welcome to the AWS IAM User removal tool!'));
console.log(yellow('Type the command "help" to see available commands.'));

const cli = vorpal();

cli
  .command('delete-user', 'Search for a IAM user and delete from selected accounts.')
  .action(
    function deleteUser(args, callback) {
      this.prompt(questions.deleteUser, (answers) => {
        const input = tools.inputVer(answers);
        if (input === true) {
          this.log(red('Invalid input, exiting command!'));
          return callback();
        }

        if (answers.accountNames.length < 1) {
          console.log(red('You must select atleast one account, exiting command!'));
          return callback();
        }

        const confirm = tools.confirmParser(answers.confirm);

        if (confirm !== 'y') {
          console.log(red('Please enter "y", to delete user from accounts. Exiting command...'));
          return callback();
        }

        const userName = answers.userName;
        const awsAccounts = answers.accountNames;

        asyncblock((flow) => {
          console.log(blue('Gathering information...'));
          console.log('####');
          console.log('####');

          // Loop through accoutns and delete user if found
          for (let i = 0; i < awsAccounts.length; i += 1) {
            const currentAccount = awsAccounts[i];

            // Search for user
            exec(`aws iam get-user --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
            const getUserResult = flow.wait();
            const parsedUserResult = tools.safeJson(getUserResult);
            if (parsedUserResult.hasOwnProperty('User') === true) { //eslint-disable-line
              console.log(blue(`Match found for ${userName} in the ${currentAccount} account!`));
              console.log(blue(getUserResult));

              // List access key
              exec(`aws iam list-access-keys --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const getKeyResult = flow.wait();
              const parsedKeyResult = tools.safeJson(getKeyResult);
              if (parsedKeyResult.AccessKeyMetadata[0] != null) {
                console.log('Key found!');
                for (let j = 0; j < parsedKeyResult.AccessKeyMetadata.length; j += 1) {
                  const keyId = parsedKeyResult.AccessKeyMetadata[j].AccessKeyId;

                  // Delete keys
                  exec(`aws iam delete-access-key --access-key ${keyId} --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
                  flow.wait();
                  console.log(red(`Key ${(j + 1)} deleted!`));
                }
              } else {
                console.log('No key found...');
              }

              // List signing certificate
              exec(`aws iam list-signing-certificates --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const getCertResults = flow.wait();
              const parsedCertResults = tools.safeJson(getCertResults);
              if (parsedCertResults.Certificates[0] != null) {
                console.log('Certificate found!');

                // Delete signing certificates
                for (let s = 0; s < parsedCertResults.Certificates.length; s += 1) {
                  const certId = parsedCertResults.Certificates[s].CertificateId;
                  exec(`aws iam delete-signing-certificate --user-name ${userName} --certificate-id ${certId} --profile ${currentAccount}`, flow.addIgnoreError());
                  flow.wait();
                  console.log(red(`Certificate ${(s + 1)} deleted!`));
                }
              } else {
                console.log('No certificate found...');
              }

              // Check for MFA Device
              exec(`aws iam list-mfa-devices --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const getMfaResult = flow.wait();
              const parsedMfaResult = tools.safeJson(getMfaResult);
              if (parsedMfaResult.MFADevices[0] != null) {
                console.log('MFA Device found!');

                // Delete MFA Device
                const mfaArn = parsedMfaResult.MFADevices[0].SerialNumber;
                exec(`aws iam deactivate-mfa-device --user-name ${userName} --serial-number ${mfaArn} --profile ${currentAccount}`, flow.addIgnoreError());
                flow.wait();
                console.log(red('MFA device deactivated!'));
              } else {
                console.log('No MFA Device found...');
              }

              // Check for Login profile
              exec(`aws iam get-login-profile --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const findLoginProfileResults = flow.wait();
              const parsedLoginProfileResults = tools.safeJson(findLoginProfileResults);
              if (parsedLoginProfileResults.hasOwnProperty('LoginProfile') === true) { //eslint-disable-line
                console.log('Login profile found!');

                // Delete login profile
                exec(`aws iam delete-login-profile --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
                flow.wait();
                console.log(red('Login Profile deleted!'));
              } else {
                console.log('No login profile...');
              }

              // List user policies
              exec(`aws iam list-attached-user-policies --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const findUserPolicies = flow.wait();
              const parsedUserPolicies = tools.safeJson(findUserPolicies);
              if (parsedUserPolicies.AttachedPolicies[0] != null) {
                console.log('Polices found for user!');

                // Detatch user from policies
                for (let t = 0; t < parsedUserPolicies.AttachedPolicies.length; t += 1) {
                  const policyArn = parsedUserPolicies.AttachedPolicies[t].PolicyArn;
                  exec(`aws iam detach-user-policy --user-name ${userName} --policy-arn ${policyArn} --profile ${currentAccount}`, flow.addIgnoreError());
                  flow.wait();
                  console.log(red(`User detatched from policy ${(t + 1)}!`));
                }
              } else {
                console.log('No policies found for user...');
              }

              // Search for groups
              exec(`aws iam list-groups-for-user --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const findUserGroups = flow.wait();
              const parsedUserGroups = tools.safeJson(findUserGroups);
              if (parsedUserGroups.Groups[0] != null) {
                console.log('Groups found for user!');

                // Remove user from groups
                for (let w = 0; w < parsedUserGroups.Groups.length; w += 1) {
                  const groupName = parsedUserGroups.Groups[w].GroupName;
                  exec(`aws iam remove-user-from-group --user-name ${userName} --group-name ${groupName} --profile ${currentAccount}`, flow.addIgnoreError());
                  flow.wait();
                  console.log(red(`User removed from group ${(w + 1)}!`));
                }
              } else {
                console.log('No group associations found for user...');
              }

              // Search for SSH keys
              exec(`aws iam list-ssh-public-keys --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const findUserSshKeys = flow.wait();
              const parsedUserSshKeys = tools.safeJson(findUserSshKeys);
              if (parsedUserSshKeys.SSHPublicKeys[0] != null) {
                console.log('SSH keys found for user!');

                // Delete SSH keys
                for (let x = 0; x < parsedUserSshKeys.SSHPublicKeys.length; x += 1) {
                  const sshKeyId = parsedUserSshKeys.SSHPublicKeys[x].SSHPublicKeyId;
                  exec(`aws iam delete-ssh-public-key --user-name ${userName} --ssh-public-key-id ${sshKeyId} --profile ${currentAccount}`, flow.addIgnoreError());
                  flow.wait();
                  console.log(red(`SSH key ${(x + 1)} deleted!`));
                }
              } else {
                console.log('No SSH keys found for user...');
              }

              // Delete User
              exec(`aws iam delete-user --user-name ${userName} --profile ${currentAccount}`, flow.addIgnoreError());
              const deleteUserResults = flow.wait();
              console.log(yellow(deleteUserResults));

              // Delete verification
              if (deleteUserResults === '') {
                console.log(red(`User ${userName} deleted from the ${currentAccount} account!`));
              } else {
                console.log(red(`Error while trying to delete the user ${userName} in the ${currentAccount} account!`));
              }
            } else {
              console.log(blue(`No match found for ${userName} in the ${currentAccount} account...`));
            }

            console.log('#####');
            console.log('#####');
            console.log('#####');
          }
          console.log('Command completed, press any key to continue.');
        });
        return callback();
      });
    });

cli
  .delimiter('aws-iam-cli$ ')
  .show();
