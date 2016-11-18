#**AWS-IAM-CLI**

![RhythmOne Logo](./resources/rhythmone-logo.png)

*Supports OSX/Linux (Not fully tested in Linux)*

*Developed in `NodeJS 6.91` and `aws-cli 1.11.8`*

###**Download**
- Clone down this repository.

###**Configuration**
- Ensure `NodeJS` is installed on your machine. Run `which node` from your terminal.
- Ensure `npm` is installed on your machine. Run `which npm` from your terminal.
- Install dependencies by entering the following command `npm i` from the projects root directory. (Note you will get some deprecation warnings from the dependency `asyncblock`, just ignore them.)
- Ensure the AWS CLI is installed on your machine. Run `which aws` from your terminal.
- This tool utilizes "profiles" to access your AWS accounts. Setup your account profiles by running the following command, `aws configure --profile awsAccountName`. Ensure when creating profiles to set the default output to "json".
-  Ensure the file `.aws/credentials` is in your home directory, as the tool will look there to populate accounts.


###**Usage**
- Run the tool by entering the following command `node bin/main.js` from the projects root directory.
- Type help to see available commands (as of now their is only 1).
- When using the `delete-user` command enter the name of the user exactly as it appears in the AWS IAM management console. Then select the accounts you want to delete the user from (this will populate from the profiles your configured earlier). Confirm you actually want to delete that user from the accounts selected. The tool will then systematically iterate through all of the selected accounts, by first searching for the user, then removing all of their access and resources (IE: MFA device, login profile, security groups, etc.), and finally attempting to delete the user.
