const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Configurações do Kommo
const KOMMO_API_URL = "https://instneurociencia.kommo.com"; // Substitua pelo seu subdomínio
const KOMMO_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdmNzg2ODJhYzNlYzNiNzY0N2NkOGFhMTY5YTkzNjhhN2ExZmY5ZWJlNTA5OWNlYTJlNjExZTkwYWIzZTBlNzhhNWIxMzhiOTk2NjFlNWU5In0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiI3Zjc4NjgyYWMzZWMzYjc2NDdjZDhhYTE2OWE5MzY4YTdhMWZmOWViZTUwOTljZWEyZTYxMWU5MGFiM2UwZTc4YTViMTM4Yjk5NjYxZTVlOSIsImlhdCI6MTczNjc5NTY5MiwibmJmIjoxNzM2Nzk1NjkyLCJleHAiOjE4OTQ0OTI4MDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJkN2FkZmRmNC0wYzhlLTQ5ZjQtYmQyZi1kZDIxYzk2ZjU2YmEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.pEFmKQIgTONKvu_ArutOx4dTfBhYkDLfdEdMguYNyc-vn1SeiWykkxqR0pufschYRDpk7qEGmG0OeG-xJVupyovAcvQjQ1MH8T8ltLCnbOk-btYgs5tL5kzW__5CAKQAQcqIarwPYDv30uncWzx0EICy8N6IDMB2eGx7Qa9Pt0RXkRPD4P3Y_ce1ijJc0e9HEPKAqU4_uiU8OrlOX30rxSbS8bIeyGYqWPDE8VTNw0xdDPabRCzgxW2JRweFFAI1myqECr-zHG1n7ZvZrq4rcCRT7elOEWQppZp5mC_GqfAzjUliTU7wb4aqurPqF8bWE1CCCbYKrgJN1g6MIV3Uug"; // Adicione o token de acesso da API do Kommo

// Definir um conjunto para armazenar IDs de leads processados
const processedLeads = new Set();

// Configuração do parser para JSON e x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Caminho para o arquivo de credenciais da conta de serviço do Google
const CREDENTIALS_PATH = path.join(__dirname, "kommo-integration-445219-6d9f443e8383.json");
const SPREADSHEET_ID = "1DUDR6hxit1mbTlUYA50qgN2zk_lL0YfPjfcbQ-nxtcU"; // ID da sua planilha do Google

// Função para autenticar com a API do Google
async function authenticateGoogle() {
  return google.auth.getClient({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Função para inserir dados na planilha
async function appendToSheet(data) {
  const auth = await authenticateGoogle();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [[data.id, data.name, data.phone, data.price, data.date]];
  const resource = { values };

  try {
    console.log("Tentando adicionar os dados à planilha:", values);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Página1!A:E", // Substitua "Página1" pelo nome da aba da planilha
      valueInputOption: "RAW",
      resource,
    });

    console.log("Dados adicionados à planilha com sucesso:", data);
  } catch (error) {
    console.error("Erro ao adicionar dados à planilha:", error);
  }
}

// Get dos detalhes do lead
const options = {
    method: 'GET',
    url: 'https://instneurociencia.kommo.com/api/v4/leads/17521097',
    params: {with: 'contacts'},
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`
    }
  };
  
  axios
    .request(options)
    .then(res => console.log(res.data))
    .catch(err => console.error(err));