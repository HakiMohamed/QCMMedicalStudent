// Preload qs module to ensure it's available when body-parser needs it
const path = require('path');
const qsPath = path.resolve(__dirname, 'node_modules', 'qs');
try {
  require(qsPath);
  // Also try to load from body-parser's node_modules
  const bodyParserQsPath = path.resolve(__dirname, 'node_modules', 'body-parser', 'node_modules', 'qs');
  try {
    require(bodyParserQsPath);
  } catch (e) {
    // Ignore if not found
  }
} catch (e) {
  console.warn('⚠️ Could not preload qs:', e.message);
}

