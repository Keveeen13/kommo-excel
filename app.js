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

// ID do Funil e da Etapa
const PIPELINE_ID = 7808323; // Substitua pelo ID do funil específico
const STAGE_ID = 78412656; // Substitua pelo ID da etapa específica

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

// Função para buscar os leads de uma etapa específica no Kommo
async function fetchLeadsFromKommo() {
  try {
    const response = await axios.get(`${KOMMO_BASE_URL}/api/v4/leads`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
      params: {
        filter: { pipeline_id: PIPELINE_ID, status_id: STAGE_ID },
      },
    });

    return response.data._embedded.leads || [];
  } catch (error) {
    console.error('Erro ao buscar leads do Kommo:', error);
    return [];
  }
}

// Função para buscar detalhes de um contato no Kommo
async function fetchContactDetails(contactId) {
  if (!contactId) return {};
  try {
    const response = await axios.get(`${KOMMO_BASE_URL}/api/v4/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
    });
    const contact = response.data;
    return {
      name: contact.name || '',
      phone: contact.custom_fields_values?.find(field => field.field_code === 'PHONE')?.values[0]?.value || '',
      email: contact.custom_fields_values?.find(field => field.field_code === 'EMAIL')?.values[0]?.value || '',
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do contato ${contactId}:`, error);
    return {};
  }
}

// Função para atualizar o Google Sheets com dados dos leads
async function updateGoogleSheet(auth, leads) {
  const values = [];

  for (const lead of leads) {
    const contactDetails = await fetchContactDetails(lead._embedded?.contacts?.[0]?.id);

    values.push([
      lead.id || 'Sem ID',
      contactDetails.name || 'Sem Nome',
      contactDetails.phone || 'Sem Telefone',
      contactDetails.email || 'Sem E-mail',
      lead.name || 'Sem Título',
      lead.price || '0',
    ]);
  }

  const request = {
    spreadsheetId: SPREADSHEET_ID,
    range: GOOGLE_SHEET_RANGE,
    valueInputOption: 'RAW',
    resource: { values },
    auth,
  };

  try {
    await sheets.spreadsheets.values.update(request);
    console.log('Dados enviados para o Google Sheets com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar o Google Sheets:', error);
  }
}

// Função principal para executar o webhook
async function main() {
  const auth = await authenticateGoogle();
  const leads = await fetchLeadsFromKommo();

  if (leads.length) {
    await updateGoogleSheet(auth, leads);
  } else {
    console.log('Nenhum lead encontrado no Kommo.');
  }
}

// Endpoint para receber notificações do Kommo
app.post('/kommowebhook', async (req, res) => {
  try {
    console.log('Notificação recebida do Kommo:', req.body);

    // Reexecuta a função para atualizar o Google Sheets
    await main();
    res.status(200).send('Google Sheets atualizado com sucesso.');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Erro ao atualizar o Google Sheets');
  }
});

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});