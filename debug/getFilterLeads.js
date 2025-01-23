const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const PIPELINE_ID = 7886771;
const STAGE_ID = 63616275;

async function fetchFilteredLeads() {
    try {
      console.log('Pipeline ID:', PIPELINE_ID);
      console.log('Stage ID:', STAGE_ID);
  
      // Fazendo a requisição para buscar todos os leads no pipeline
      const response = await axios.get(
        `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads`,
        {
          headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
          params: { pipeline_id: PIPELINE_ID, limit: 250 },
        }
      );
  
      const allLeads = response.data._embedded?.leads || [];
      console.log(`Total de leads retornados: ${allLeads.length}`);
  
      // Filtrar manualmente os leads pela etapa correta
      const filteredLeads = allLeads.filter(
        (lead) => lead.status_id === STAGE_ID
      );
  
      console.log(`Total de leads filtrados na etapa ${STAGE_ID}: ${filteredLeads.length}`);
      return filteredLeads;
    } catch (error) {
      console.error('Erro ao buscar leads:', error.response?.data || error.message);
      return [];
    }
  }
  
  (async () => {
    await fetchFilteredLeads();
  })();