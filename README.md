# OAuth 2.0 Token Automation with JavaScript

This project contains a JavaScript script that automates the process of obtaining and renewing OAuth 2.0 tokens fof API. It uses the authorization code to get the initial access token and the refresh token to renew the access token when needed.

## Features

- Obtain access token using an authorization code.
- Renew access token using the refresh token.
- Automatically write tokens to the `.env` file for easy access and reuse.

## Project Files

- **.env**: Configuration file containing the environment variables needed for the script.
- **.env.template**: Template of the `.env` configuration file.
- **.gitignore**: File to ignore files and directories in the Git repository.
- **index.js**: Main script file that handles obtaining and renewing tokens.
- **package.json**: npm configuration file that contains the project's dependencies and scripts.
- **package-lock.json**: File that ensures npm installations are reproducible.
- **test.js**: Test file (yet to be specified).

## Requirements

- Node.js installed on your system.
- Mercado Libre application credentials (Client ID and Client Secret).

## Installation

1. Clone this repository to your local machine.
	```bash git clone https://github.com/your-username/oauth-mercadolibre.git```
2. Install the necessary dependencies.
	```bash npm install```
3.  Create a .env file based on the .env.template and configure your Mercado Libre credentials.
### .env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=your_redirect_uri
AUTHORIZATION_CODE=your_authorization_code
CODE_VERIFIER=your_code_verifier

## Usage
 Run the main script to obtain or renew the access token and don't foget the .env
```bash node index.js```

