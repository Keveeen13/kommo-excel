const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const PIPELINE_ID = 7808323;
const STAGE_ID = 63169047;

async function fetchLeadsFromKommo() {
  try {
    const response = await axios.get(`https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`, accept: 'application/json' },
      params: {
        pipeline_id: PIPELINE_ID,
        status_id: STAGE_ID,
      },
    });

    console.log('Resposta da API do Kommo:', JSON.stringify(response.data, null, 2));
    const leads = response.data._embedded?.leads || [];
    console.log(`Leads encontrados: ${leads.length}`);
  } catch (error) {
    console.error('Erro ao buscar leads do Kommo:', error.response?.data || error.message);
  }
}

fetchLeadsFromKommo();