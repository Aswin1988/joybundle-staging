import { validateServerEnv } from '../lib/config/env.js';

try {
  const requireSheets = process.env.JOYBUNDLE_VALIDATE_ENV === 'true';
  validateServerEnv({ requireProduction: requireSheets });
  console.log(requireSheets ? 'JoyBundle Google Sheets production configuration is complete.' : 'JoyBundle environment syntax is valid.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
