import axios from 'axios';

async function checkRetailers() {
  try {
    console.log('Querying store/retailers...');
    const response = await axios.get('https://bigcompanybackend-production-458c.up.railway.app/store/retailers', {
      params: {
        district: 'Gasabo',
        sector: '1'
      }
    });
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('Response Error Status:', error.response.status);
      console.error('Response Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkRetailers();
