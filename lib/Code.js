const crypto = require('crypto');

// Function to generate a code_verifier
const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64url');  // Using base64url encoding
};

// Function to generate a code_challenge from a code_verifier
const generateCodeChallenge = (codeVerifier) => {
  const codeChallenge = crypto.createHash('sha256')
                              .update(codeVerifier)
                              .digest('base64url');  // Using base64url encoding
  return codeChallenge;
};

// Generate code_verifier
const codeVerifier = generateCodeVerifier();
console.log('code_verifier:', codeVerifier);

// Generate code_challenge based on code_verifier
const codeChallenge = generateCodeChallenge(codeVerifier);
console.log('code_challenge:', codeChallenge);
