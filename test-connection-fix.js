/**
 * Test script to verify the multi-connection fix
 * This script tests that calling connect() multiple times on an already connected device
 * does not cause unnecessary reconnections.
 */

import { XL2Connection } from './src/devices/XL2Connection.js';
import { logger } from './src/utils/logger.js';

async function testMultiConnectionFix() {
  console.log('🧪 Testing XL2 Multi-Connection Fix...\n');
  
  const xl2 = new XL2Connection();
  
  try {
    // Test 1: Initial connection
    console.log('📋 Test 1: Initial connection');
    console.log('Scanning for XL2 devices...');
    
    const devices = await xl2.scanAllPortsForXL2();
    const xl2Device = devices.find(d => d.isXL2);
    
    if (!xl2Device) {
      console.log('❌ No XL2 devices found. Connect an XL2 device and try again.');
      return;
    }
    
    console.log(`Found XL2 device at: ${xl2Device.port}`);
    
    // Connect for the first time
    console.log('\n🔌 Connecting for the first time...');
    const port1 = await xl2.connect(xl2Device.port);
    console.log(`✅ Connected to: ${port1}`);
    console.log(`Connection status: ${xl2.isConnected}`);
    
    // Test 2: Call connect() again with same port (should skip reconnection)
    console.log('\n📋 Test 2: Call connect() again with same port');
    console.log('This should NOT cause a reconnection...');
    const port2 = await xl2.connect(xl2Device.port);
    console.log(`✅ Result: ${port2}`);
    console.log(`Connection status: ${xl2.isConnected}`);
    
    // Test 3: Call connect() without port parameter (should skip reconnection)
    console.log('\n📋 Test 3: Call connect() without port parameter');
    console.log('This should NOT cause a reconnection...');
    const port3 = await xl2.connect();
    console.log(`✅ Result: ${port3}`);
    console.log(`Connection status: ${xl2.isConnected}`);
    
    // Test 4: Multiple rapid calls (stress test)
    console.log('\n📋 Test 4: Multiple rapid calls (stress test)');
    console.log('Making 5 rapid connect() calls...');
    
    for (let i = 1; i <= 5; i++) {
      console.log(`Call ${i}...`);
      const portN = await xl2.connect(xl2Device.port);
      console.log(`  Result: ${portN}, Connected: ${xl2.isConnected}`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Expected behavior:');
    console.log('- First connect() should establish connection');
    console.log('- Subsequent connect() calls should return immediately without reconnection');
    console.log('- No "disconnecting first" messages should appear');
    console.log('- Connection should remain stable throughout all tests');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    if (xl2.isConnected) {
      console.log('\n🧹 Cleaning up - disconnecting...');
      await xl2.disconnect();
      console.log('✅ Disconnected');
    }
  }
}

// Run the test
testMultiConnectionFix().catch(console.error);