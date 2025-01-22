const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;

async function getPipelinesAndStages() {
    try {
      const response = await axios.get(
        `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads/pipelines`,
        { headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` } }
      );
  
      console.log('Funis e etapas disponíveis:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Erro ao buscar funis e etapas:', error.message);
    }
  }
  
  // Chamada para verificar os IDs
  (async () => {
    await getPipelinesAndStages();
  })();