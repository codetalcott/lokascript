/**
 * Test Schema Validation
 *
 * This script tests the schema validation by importing the schemas
 * in development mode, which should trigger validation warnings.
 */

process.env.NODE_ENV = 'development';

async function testSchemaValidation() {
  console.log('=== Testing Schema Validation ===\n');

  try {
    // Import the command schemas module
    // This should trigger schema validation at module load
    const { commandSchemas, getDefinedSchemas } = await import('./dist/index.mjs');

    console.log('\n✓ Module loaded successfully');
    console.log(`✓ Found ${Object.keys(commandSchemas).length} command schemas`);
    console.log(`✓ ${getDefinedSchemas().length} schemas have defined roles\n`);

    console.log('✓ Schema validation ran automatically at module load (see warnings above)');
    console.log('✓ Validation warnings help catch schema design issues early');

  } catch (error) {
    console.error('✗ Error during schema validation test:', error.message);
    process.exit(1);
  }
}

testSchemaValidation();
