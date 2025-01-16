const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const PIPELINE_ID = 7886771;

async function debugLeads() {
    try {
      const response = await axios.get(
        `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads`,
        {
          headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
          params: { pipeline_id: PIPELINE_ID, limit: 250 },
        }
      );
  
      const allLeads = response.data._embedded?.leads || [];
      console.log(`Total de leads retornados: ${allLeads.length}`);
  
      allLeads.forEach((lead) => {
        console.log(
          `Lead ID: ${lead.id}, Status ID: ${lead.status_id}, Nome: ${lead.name}`
        );
      });
    } catch (error) {
      console.error('Erro ao depurar leads:', error.response?.data || error.message);
    }
  }
  
  debugLeads();
  