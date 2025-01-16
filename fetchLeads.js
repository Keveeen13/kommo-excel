const axios = require('axios');
require('dotenv').config();

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const PIPELINE_ID = 7808323;
const STAGE_ID = 79289360;

async function fetchLeadsFromKommo() {
  try {
    console.log('Pipeline ID:', PIPELINE_ID);
    console.log('Stage ID:', STAGE_ID);

    // Fazendo a requisição para buscar todos os leads no pipeline
    const response = await axios.get(
      `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads`,
      {
        headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
        params: {
          pipeline_id: PIPELINE_ID,
          status_id: STAGE_ID,
          limit: 250,              // Limite de leads por página
        },
      }
    );

    const allLeads = response.data._embedded?.leads || [];
    console.log(`Total de leads no pipeline ${PIPELINE_ID}: ${allLeads.length}`);

    // Filtrar apenas os leads da etapa especificada
    const filteredLeads = allLeads.filter(
      (lead) => lead.status_id === STAGE_ID
    );

    console.log(`Total de leads na etapa ${STAGE_ID}: ${filteredLeads.length}`);
    return filteredLeads;
  } catch (error) {
    console.error('Erro ao buscar leads:', error.response?.data || error.message);
    return [];
  }
}

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
    allLeads.forEach((lead) => {
      console.log(`Lead ID: ${lead.id}, Status ID: ${lead.status_id}, Name: ${lead.name}`);
    });
  } catch (error) {
    console.error('Erro ao depurar leads:', error.response?.data || error.message);
  }
}

debugLeads();
fetchLeadsFromKommo();