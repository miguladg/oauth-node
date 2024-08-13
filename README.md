# OAuth 2.0 Token Automation with JavaScript

This project provides a JavaScript-based solution to automate the process of obtaining and renewing OAuth 2.0 tokens for the Mercado Libre API. By using this script, you can easily manage the authorization code flow to get the initial access token and use the refresh token to renew the access token when needed.

## Features

- Initial Token Acquisition: Obtain the access token using an authorization code.
- Token Renewal: Automatically renew the access token using the refresh token.
- Environment Variable Management: Automatically manage and store tokens in the .env file, making them easily accessible and reusable.

## Project Files

- **.env**: This file contains the environment variables required by the script. It is automatically updated with new tokens when they are obtained or renewed.
- **.env.template**: A template file that outlines the necessary environment variables. Use this as a starting point to create your own .env file.
- **.gitignore**: Specifies which files and directories should be ignored in the Git repository, including the .env file to protect sensitive information.
- **index.js**: he main script that handles the process of obtaining and renewing OAuth 2.0 tokens.
- **package.json**: Contains the project's dependencies and scripts for npm.
- **package-lock.json**: Ensures that npm installs the exact versions of dependencies used in the project.
- **test.js**: A placeholder file for testing (test specifications to be added).

## Requirements

- Node.js installed on your system.

## Installation

1. Clone this repository to your local machine.
	```bash git clone https://github.com/miguladg/oauth-node```
2. Install the necessary dependencies.
	```bash npm install```
3.  Create a .env file based on the provided .env.template and fill in your Mercado Libre credentials.
### .env
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
REDIRECT_URI=tu_redirect_uri
AUTHORIZATION_CODE=tu_authorization_code


## Usage
 To obtain or renew the access token, simply run the main script. Ensure that your .env file is correctly configured before running the script.
 
```bash node index.js```

By running this command, the script will either obtain a new access token (if one does not exist) or renew the existing token using the refresh token stored in your .env file. The updated tokens will be saved back to the .env file for future use.