export const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'TELEGRAM_BOT_TOKEN'
    // 'FRONTEND_URL' // Optional in dev, required in prod usually
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ FATAL ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate Node Env
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.warn('⚠️  Warning: NODE_ENV is not set to development, production, or test. Defaulting to development.');
  }

  console.log('✅ Environment variables validated');
};
