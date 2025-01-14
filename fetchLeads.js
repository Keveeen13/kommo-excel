const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const PIPELINE_ID = 7808323;
const STAGE_ID = 63169047;

async function fetchLeadsFromKommo() {
  try {
    console.log('Pipeline ID:', PIPELINE_ID);
    console.log('Stage ID:', STAGE_ID);

    const response = await axios.get(`https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
      params: {
        pipeline_id: PIPELINE_ID,
        status_id: STAGE_ID,
      },
    });

    console.log('Resposta da API do Kommo:', JSON.stringify(response.data, null, 2));

    // Filtrar leads da etapa e funil específicos
    const leads = (response.data._embedded?.leads || []).filter(
      (lead) => lead.pipeline_id === PIPELINE_ID && lead.status_id === STAGE_ID
    );

    console.log(`Total de leads encontrados: ${leads.length}`);
    return leads;
  } catch (error) {
    console.error('Erro ao buscar leads do Kommo:', error.response?.data || error.message);
    return [];
  }
}

fetchLeadsFromKommo();