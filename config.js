// Environment Configuration
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:8000',
        DEBUG: true
    },
    production: {
        API_BASE_URL: 'https://api-eky0.onrender.com',
        DEBUG: false
    }
};

const getEnvironment = () => {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '') {
        return 'development';
    }
    return 'production';
};

const ENV = getEnvironment();
const API_CONFIG = CONFIG[ENV];

// Log environment info
console.log(`🌍 Environment: ${ENV}`);
console.log(`📡 API URL: ${API_CONFIG.API_BASE_URL}`);
