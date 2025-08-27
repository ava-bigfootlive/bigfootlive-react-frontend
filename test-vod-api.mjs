#!/usr/bin/env node

// Simple test script to verify VOD upload API endpoints
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000';

async function testMediaEndpoints() {
  console.log('Testing Media API endpoints...\n');

  // Test 1: Get presigned URL
  console.log('1. Testing /api/v1/media/upload/presigned-url');
  try {
    const response = await fetch(`${API_URL}/api/v1/media/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'test-video.mp4',
        content_type: 'video/mp4'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`   ❌ Failed: ${response.status} - ${error}`);
    } else {
      const data = await response.json();
      console.log(`   ✓ Success: Got presigned URL`);
      console.log(`   - Upload URL: ${data.upload_url ? 'Present' : 'Missing'}`);
      console.log(`   - Object Key: ${data.object_key ? 'Present' : 'Missing'}`);
      console.log(`   - Fields: ${data.fields ? 'Present' : 'Missing'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: List user media
  console.log('\n2. Testing /api/v1/media/user/media');
  try {
    const response = await fetch(`${API_URL}/api/v1/media/user/media?page=1&limit=10`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`   ❌ Failed: ${response.status} - ${error}`);
    } else {
      const data = await response.json();
      console.log(`   ✓ Success: Got media list`);
      console.log(`   - Total items: ${data.total || 0}`);
      console.log(`   - Items returned: ${data.items?.length || 0}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Check health endpoint
  console.log('\n3. Testing /health');
  try {
    const response = await fetch(`${API_URL}/health`);
    
    if (!response.ok) {
      console.log(`   ❌ Failed: ${response.status}`);
    } else {
      const data = await response.json();
      console.log(`   ✓ Success: Backend is healthy`);
      console.log(`   - Status: ${data.status || 'unknown'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n✅ API endpoint tests complete!');
  console.log('Note: Authentication may be required for some endpoints in production.');
}

testMediaEndpoints().catch(console.error);