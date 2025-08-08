// Frontend Configuration - Only secrets needed for React Native app
// Backend secrets (like JWT secrets, MongoDB URI) are not included here

const config = {
  // Firebase Configuration (needed for frontend auth)
  firebase: {
    apiKey: "AIzaSyDdGFXIK6B_UJrt25XQvVDlaFln3RI2Fc0",
    authDomain: "plant-disease-detection-22117.firebaseapp.com",
    projectId: "plant-disease-detection-22117",
    storageBucket: "plant-disease-detection-22117.firebasestorage.app",
    messagingSenderId: "284341709761",
    appId: "1:284341709761:web:fe6085083f535237e0dd40",
    measurementId: "G-PZSGLGMDKH",
  },

  // Stripe Configuration (needed for frontend payments)
  stripe: {
    publishableKey:
      "pk_test_51RrapwF3HAo508cLPgOEi6dABLM2ZSyzSROTOdiZEvw3K3juBOuffnhz2H1Vdb7eZ38vA6bloKgba6GCgSjMGphz00F6deJulp",
  },

  // API Keys (needed for frontend API calls)
  api: {
    huggingFaceApiKey: "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",
    googleAiApiKey: "AIzaSyBH6s86iQs4RMWQHTwT4UGa-eSBD8hDz3I",
  },

  // Server Configuration (needed for frontend API endpoints)
  server: {
    ipAddress: "your_server_ip_address_here",
    userPort: 8000,
    adminPort: 9000,
  },
};

// CommonJS export for both frontend and backend compatibility
module.exports = { config };
module.exports.default = config;
