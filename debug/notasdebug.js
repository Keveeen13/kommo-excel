// const express = require('express');
// const axios = require('axios'); 
// const { google } = require('googleapis');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // Configuração do middleware
// app.use(express.json());

// // Caminho para o arquivo JSON da conta de serviço
// const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'kommo-integration-445219-6d9f443e8383.json');

// // Configuração da Google Sheets
// const SPREADSHEET_ID = '1DUDR6hxit1mbTlUYA50qgN2zk_lL0YfPjfcbQ-nxtcU'; // ID da planilha
// const RANGE = 'Página1!A1'; // Nome e intervalo da aba

// // Autenticação da Conta de Serviço
// const auth = new google.auth.GoogleAuth({
//     keyFile: SERVICE_ACCOUNT_FILE,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets']
// });

// // Função para adicionar dados à planilha
// async function appendToSheet(data) {
//     const sheets = google.sheets({ version: 'v4', auth });
//     await sheets.spreadsheets.values.append({
//         spreadsheetId: SPREADSHEET_ID,
//         range: RANGE,
//         valueInputOption: 'RAW',
//         resource: { values: [data] },
//     });
// }

// // Configuração da Kommo API
// const KOMMO_ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImVkZTZkYzlkYmQ3MmIxMzg2YmRhZmJlYWI0OWI1YjdhNTcwMGIxMjczNWEwYjdhYWNmYzAyNDZhYWRkMjE4Y2MxOTI3MTQyNDY0ZDkxMjkwIn0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiJlZGU2ZGM5ZGJkNzJiMTM4NmJkYWZiZWFiNDliNWI3YTU3MDBiMTI3MzVhMGI3YWFjZmMwMjQ2YWFkZDIxOGNjMTkyNzE0MjQ2NGQ5MTI5MCIsImlhdCI6MTczNDcyMTQ1NCwibmJmIjoxNzM0NzIxNDU0LCJleHAiOjE4OTI0MTkyMDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiI0MjQyZjRkNS1jNmVmLTRhNWUtYWI0MC0xZGYxMzhlMjBlY2YiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.J2rUIpE0MViAeX8R1VFVUfo2sCS1xLFH44RSFPU3UVFFcPMpbuxDb1WBlJaTV0FcOQK1bjZ47eyy3UNHPrkTalci6YXtmzNCQF9ox76u7GMu7OPfTM9oaYncMglkPFXUT3nkLLNSjEAeKX19qDIB-43PP68ZvsPLgeVZQ48KlOX9fVdcKnKJle9aP8DFbsB3cFfjmWeywxa2CHN87Z6eyZJOmLpZf9zmodWZ7kVV6gUUskZdhn88b5topDQSBWpEdUDIIKpCRL0cJygtPGDgSXC1B02EwXYzY3UuX4ha1Ht5EcTPFaftuHkZNUazml1mSYu8LtToabhyJelzPZxefg'; // Token da Kommo
// const KOMMO_API_URL = 'https://instneurociencia.kommo.com/api/v4'; // URL da API da Kommo
// const FUNIL_ID = '7808323'; // ID do funil específico

// // Função para buscar leads do funil específico
// async function fetchLeadsFromPipeline() {
//     try {
//         const response = await axios.get(`${KOMMO_API_URL}/leads`, {
//             headers: {
//                 Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
//             },
//             params: {
//                 pipeline_id: FUNIL_ID, // Filtra leads pelo funil
//             },
//         });

//         return response.data._embedded.leads || [];
//     } catch (error) {
//         console.error('Erro ao buscar leads:', error.response?.data || error.message);
//     }
// }

// // Rota do Webhook
// app.get('/kommowebhook', async (req, res) => {
//     try {
//         const leads = await fetchLeadsFromPipeline();

//         for (const lead of leads) {
//             const { name, custom_fields_values, id, price } = lead;

//             // Processar campos personalizados
//             const customFields = custom_fields_values
//                 ? custom_fields_values.map((field) => `${field.field_name}: ${field.values.map((v) => v.value).join(', ')}`).join('; ')
//                 : 'Sem campos personalizados';

//             // Dados para a planilha (Campos padrões: ID, Nome, Preço e Campos Personalizados)
//             const row = [id, name, price, customFields];

//             // Enviar para o Google Sheets
//             await appendToSheet(row);
//         }

//         res.status(200).send('Leads sincronizados com sucesso.');
//     } catch (error) {
//         console.error('Erro na sincronização:', error.message);
//         res.status(500).send('Erro na sincronização de leads.');
//     }
// });

// // Inicializa o servidor
// app.listen(PORT, () => {
//     console.log(`Servidor rodando na porta ${PORT}`);
// });
