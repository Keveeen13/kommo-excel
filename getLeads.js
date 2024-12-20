const axios = require('axios');

const KOMMO_SUBDOMINIO = 'instneurociencia';  // Substitua com seu subdomínio
const ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImYzYTdhYTU5ZjBjNGIwZDQ3ZDdkZThjMjIzOTgxNzBhYWFmZTM3MjYzYWY4ZjRmZDU3ODcwMTIxZWY5MDVkNDZjYTRkMzNkNDJhOTE4ZTEyIn0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiJmM2E3YWE1OWYwYzRiMGQ0N2Q3ZGU4YzIyMzk4MTcwYWFhZmUzNzI2M2FmOGY0ZmQ1Nzg3MDEyMWVmOTA1ZDQ2Y2E0ZDMzZDQyYTkxOGUxMiIsImlhdCI6MTczNDcxOTYzNSwibmJmIjoxNzM0NzE5NjM1LCJleHAiOjE4OTI0MTkyMDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiIxNGEyYzhhOS1kNjI5LTQ3YWItYjNmZi0xNzNlZmI5YjkxMDEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.Js_icxM1Nb8E6bTqKrNlkk2AXnNCRfn2iLKykeNXzHino2z32DBQCQST6Q39SLWDF5o-jiTN4meo5J-fgtocQq29OdbUhAipct9641E68H6X3ouSf6H-i7AfgDTLq9wHclltBwz2gStvK1SyID8wuKr5JTUNVVCF400vRrLB3CbygTkmglzoYM9yESQgeK0TCYEbukDT1DIC0qf0Zfc2KOO3Hu5NM1Twzs6WfrojV_BFSR2mIHUrTx_qdbTThTnHHfoWJCNRIh6YZk1OXxcReNMYgIaGJhJJmJdsNmFiON0KqvHtaSxtmnVVq91CFn6N8MzAmDt-P_oI3LD7VPFbDQ'; // Substitua com seu token de longa duração

async function getLeads() {
  try {
    const response = await axios.get(`https://${KOMMO_SUBDOMINIO}.kommo.com/api/v4/leads`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    // Exibir as informações dos leads
    const leads = response.data._embedded.leads;
    leads.forEach((lead, index) => {
      console.log(`Lead #${index + 1}:`);
      console.log(`ID: ${lead.id}`);
      console.log(`Nome: ${lead.name}`);
      console.log(`Telefone: ${lead.phone}`);
      console.log('-------------------------');
    });

  } catch (error) {
    console.error('Erro ao buscar leads:', error.response?.data || error.message);
  }
}

getLeads();
