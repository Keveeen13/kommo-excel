const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Configurações gerais
const KOMMO_API_URL = "https://instneurociencia.kommo.com";
const KOMMO_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdmNzg2ODJhYzNlYzNiNzY0N2NkOGFhMTY5YTkzNjhhN2ExZmY5ZWJlNTA5OWNlYTJlNjExZTkwYWIzZTBlNzhhNWIxMzhiOTk2NjFlNWU5In0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiI3Zjc4NjgyYWMzZWMzYjc2NDdjZDhhYTE2OWE5MzY4YTdhMWZmOWViZTUwOTljZWEyZTYxMWU5MGFiM2UwZTc4YTViMTM4Yjk5NjYxZTVlOSIsImlhdCI6MTczNjc5NTY5MiwibmJmIjoxNzM2Nzk1NjkyLCJleHAiOjE4OTQ0OTI4MDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJkN2FkZmRmNC0wYzhlLTQ5ZjQtYmQyZi1kZDIxYzk2ZjU2YmEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.pEFmKQIgTONKvu_ArutOx4dTfBhYkDLfdEdMguYNyc-vn1SeiWykkxqR0pufschYRDpk7qEGmG0OeG-xJVupyovAcvQjQ1MH8T8ltLCnbOk-btYgs5tL5kzW__5CAKQAQcqIarwPYDv30uncWzx0EICy8N6IDMB2eGx7Qa9Pt0RXkRPD4P3Y_ce1ijJc0e9HEPKAqU4_uiU8OrlOX30rxSbS8bIeyGYqWPDE8VTNw0xdDPabRCzgxW2JRweFFAI1myqECr-zHG1n7ZvZrq4rcCRT7elOEWQppZp5mC_GqfAzjUliTU7wb4aqurPqF8bWE1CCCbYKrgJN1g6MIV3Uug"; // Substitua pelo seu token
const CREDENTIALS_PATH = path.join(__dirname, "kommo-integration-445219-6d9f443e8383.json");
const SPREADSHEET_ID = "1DUDR6hxit1mbTlUYA50qgN2zk_lL0YfPjfcbQ-nxtcU"; // Substitua pelo ID da sua planilha
const TARGET_PIPELINE_ID = "7808323"; // ID do funil
const TARGET_STAGE_ID = "79289360"; // ID da etapa
const PHONE_FIELD_ID = 638908; // ID do campo personalizado "Telefone"
const WORK_ENUM_ID = 491686; // ID do enum "WORK"

// Conjunto para armazenar IDs de leads processados
const processedLeads = new Set();

// Configuração do parser para JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Funções auxiliares

/**
 * Autentica com a API do Google
 */
async function authenticateGoogle() {
  return google.auth.getClient({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/**
 * Adiciona dados na planilha do Google Sheets
 * @param {Object} data Dados a serem adicionados
 */
async function appendToSheet(data) {
  const auth = await authenticateGoogle();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [[data.id, data.name, data.phone, data.price, data.date]];
  const resource = { values };

  try {
    console.log("Adicionando dados à planilha:", values);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Página1!A:E",
      valueInputOption: "RAW",
      resource,
    });
    console.log("Dados adicionados com sucesso:", data);
  } catch (error) {
    console.error("Erro ao adicionar dados à planilha:", error);
  }
}

/**
 * Busca detalhes de um lead na API do Kommo
 * @param {number} leadId ID do lead
 */
async function getLeadDetails(leadId) {
  try {
    const response = await axios.get(`${KOMMO_API_URL}/api/v4/leads/${leadId}`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do lead:", error.message);
    return null;
  }
}

/**
 * Busca detalhes de um contato na API do Kommo
 * @param {number} contactId ID do contato
 */
async function getContactDetails(contactId) {
  try {
    const response = await axios.get(`${KOMMO_API_URL}/api/v4/contacts/${contactId}`, {
      headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do contato:", error.message);
    return null;
  }
}

/**
 * Extrai o número de telefone de um contato
 * @param {Object} contact Objeto de contato
 */
function extractPhoneNumber(contact) {
  const customFields = contact.custom_fields_values || [];
  const phoneField = customFields.find((field) => field.field_id === PHONE_FIELD_ID);

  if (phoneField) {
    const phoneValue = phoneField.values.find((value) => value.enum_id === WORK_ENUM_ID);
    return phoneValue?.value || "Telefone não encontrado.";
  }

  return "Telefone não encontrado.";
}

// Rota principal

/**
 * Processa os dados recebidos do webhook do Kommo
 */
app.post("/kommowebhook", async (req, res) => {
  try {
    console.log("Payload recebido:", JSON.stringify(req.body, null, 2));

    const leadsArray = req.body.leads?.add || [];
    const updatedLeadsArray = req.body.leads?.update || [];
    const allLeads = [...leadsArray, ...updatedLeadsArray];

    if (allLeads.length === 0) {
      console.error("Nenhum lead recebido!");
      return res.status(400).send("Nenhum lead recebido.");
    }

    for (const lead of allLeads) {
      const { id, name, price = "sem valor", pipeline_id, status_id, updated_at } = lead;

      // Verifica se o lead está no pipeline e estágio desejado
      if (pipeline_id === TARGET_PIPELINE_ID && status_id === TARGET_STAGE_ID) {
        if (processedLeads.has(id)) {
          console.log(`Lead ${id} já processado.`);
          continue;
        }

        processedLeads.add(id);

        const leadDetails = await getLeadDetails(id);
        const contact = leadDetails?._embedded?.contacts?.[0];
        let phone = "Contato não encontrado";

        if (contact) {
          const contactDetails = await getContactDetails(contact.id);
          phone = extractPhoneNumber(contactDetails);
        }

        const leadData = {
          id,
          name,
          phone,
          price,
          date: new Date(updated_at * 1000).toISOString().split("T")[0],
        };

        console.log("Dados para planilha:", leadData);
        await appendToSheet(leadData);
      } else {
        console.log(`Lead ${id} ignorado (pipeline ou status diferente).`);
      }
    }

    res.status(200).send("Webhook recebido com sucesso!");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).send("Erro no processamento do webhook.");
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
