const axios = require('axios');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const express = require('express');
const app = express();

require('dotenv').config();

app.use(express.json());

// Configurações Kommo
const KOMMO_BASE_URL = process.env.KOMMO_BASE_URL; // URL base da API do Kommo
const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN; // Token de acesso do Kommo
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;

// ID do Funil e da Etapa
const PIPELINE_ID = 7808323; // Substitua pelo ID do funil específico
const STAGE_ID = 79289360; // Substitua pelo ID da etapa específica

// Configurações Google Sheets
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // ID da planilha
const GOOGLE_SHEET_RANGE = 'Página1!A2'; // Nome da sua aba e intervalo desejado

// Autenticação do Google Sheets
async function authenticateGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

// Função para buscar leads do Kommo no funil e etapa específicos
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

// Função para enviar dados ao Google Sheets
async function updateGoogleSheet(auth, leads) {
  const values = leads.map((lead) => [
    lead.id || 'Sem ID',
    lead.name || 'Sem Nome',
    lead.price || 'Sem Valor',
    lead.created_at
      ? new Date(lead.created_at * 1000).toLocaleString()
      : 'Sem Data',
  ]);

  console.log(`Enviando dados para o Google Sheets: ${JSON.stringify(values, null, 2)}`);

  const request = {
    spreadsheetId: SPREADSHEET_ID,
    range: GOOGLE_SHEET_RANGE,
    valueInputOption: 'RAW',
    resource: { values },
    auth,
  };

  try {
    const response = await sheets.spreadsheets.values.update(request);
    console.log('Google Sheets atualizado:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar o Google Sheets:', error.message);
  }
}

// Endpoint para receber notificações do Kommo
app.post('/kommowebhook', async (req, res) => {
  try {
    console.log('Notificação recebida do Kommo:', req.body);

    // Buscar leads e enviar ao Google Sheets
    const auth = await authenticateGoogle();
    const leads = await fetchLeadsFromKommo();

    if (leads.length > 0) {
      await updateGoogleSheet(auth, leads);
    } else {
      console.log('Nenhum lead encontrado para o funil e etapa especificados.');
    }

    res.status(200).send('Google Sheets atualizado com sucesso.');
  } catch (error) {
    console.error('Erro ao processar webhook:', error.message);
    res.status(500).send('Erro ao processar webhook.');
  }
});

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});