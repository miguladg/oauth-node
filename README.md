# OAuth 2.0 Token Automation with JavaScript

This project provides a robust JavaScript-based solution to automate the process of obtaining and renewing OAuth 2.0 tokens for the Mercado Libre API. By leveraging this script, developers can effortlessly manage the authorization code flow to acquire initial access tokens and utilize refresh tokens for seamless token renewal.

## Features

- **Initial Token Acquisition**: Securely obtain access tokens using the authorization code flow.
- **Automatic Token Renewal**: Implement a system to automatically renew access tokens using refresh tokens.
- **Environment Variable Management**: Efficiently manage and store tokens in the `.env` file, ensuring easy accessibility and reusability.
- **Error Handling**: Robust error handling to manage potential issues during the token acquisition and renewal processes.
- **Code Verifier Generation**: Automatic generation and management of code verifiers for enhanced security.

## Project Structure

- `.env`: Contains environment variables required by the script. Automatically updated with new tokens.
- `.env.template`: Template file outlining necessary environment variables. Use as a base for creating your `.env` file.
- `.gitignore`: Specifies files and directories to be ignored in the Git repository, including the `.env` file for security.
- `index.js`: Main script handling the OAuth 2.0 token management process.
- `package.json`: Defines project dependencies and npm scripts.
- `package-lock.json`: Ensures consistent dependency versions across installations.
- `test.js`: Placeholder for future test specifications.

## Prerequisites

- Node.js (v12.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/miguladg/oauth-node
   ```

2. Navigate to the project directory:
   ```bash
   cd oauth-node
   ```

3. Install dependencies:
   ```bash
   Copynpm install dotenv axios querystring
   ```

4. Create a `.env` file based on `.env.template` and populate it with your Mercado Libre API credentials:
   ```
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   REDIRECT_URI=your_redirect_uri
   AUTHORIZATION_CODE=your_authorization_code
   ```

## Usage

To obtain or renew the access token:

```bash
node index.js
```

This command will:
- Obtain a new access token if one doesn't exist
- Renew the existing token using the stored refresh token
- Update the `.env` file with the latest token information

## API Reference

### `tokenManagement()`

The main function to handle the token acquisition and renewal process.

```javascript
const { tokenManagement } = require('./index');

tokenManagement()
  .then(() => console.log('Token management complete'))
  .catch(error => console.error('Error in token management:', error));
```

### `getToken()`

Retrieves the initial access token using the authorization code.

### `refreshTokenFn(refreshToken)`

Renews the access token using the provided refresh token.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Mercado Libre for providing the OAuth 2.0 API
- The Node.js community for excellent documentation and support
