const axios = require('axios');

const BASE_URL = 'http://192.168.0.104:8000';

async function testEndpoints() {
  console.log('🧪 Testing Profile Endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running:', testResponse.data);
    console.log('');

    // Test 2: Test products endpoint (no auth required)
    console.log('2. Testing products endpoint...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products endpoint working:', productsResponse.data.length, 'products found');
    console.log('');

    // Test 3: Test profile update with invalid token
    console.log('3. Testing profile update with invalid token...');
    try {
      await axios.put(`${BASE_URL}/update-profile`, {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Profile update correctly rejects invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 4: Test image upload with invalid token
    console.log('4. Testing image upload with invalid token...');
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('image', Buffer.from('fake-image-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      });

      await axios.post(`${BASE_URL}/upload-profile-image`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Image upload correctly rejects invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    console.log('🎉 All basic tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure you have a valid JWT token from login');
    console.log('2. Test with real authentication token');
    console.log('3. Check the React Native app console for detailed error messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints(); 