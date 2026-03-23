// Debug script to check the actual response from SWMS areas API
import { getAreas } from './src/services/api.js';

async function debugAreas() {
  try {
    console.log('Fetching areas from SWMS API...');
    const data = await getAreas();
    console.log('Raw response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array?', Array.isArray(data));
    if (data && typeof data === 'object') {
      console.log('Object keys:', Object.keys(data));
      if (Array.isArray(data)) {
        console.log('Array length:', data.length);
        if (data.length > 0) {
          console.log('First item:', data[0]);
          console.log('First item type:', typeof data[0]);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching areas:', error);
  }
}

debugAreas();
