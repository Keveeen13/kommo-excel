const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuração do parser JSON
app.use(bodyParser.json());

// Caminho para o arquivo de credenciais da conta de serviço do Google
const CREDENTIALS_PATH = path.join(__dirname, "kommo-integration-445219-6d9f443e8383.json");
const SPREADSHEET_ID = "1DUDR6hxit1mbTlUYA50qgN2zk_lL0YfPjfcbQ-nxtcU"; // Substitua pelo ID da sua planilha do Google

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

  const values = [[data.id, data.name, data.price, data.date]];
  const resource = { values };

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Página1!A:E", // Substitua "Sheet1" pelo nome da aba da planilha
      valueInputOption: "RAW",
      resource,
    });
    console.log("Dados adicionados à planilha com sucesso:", data);
  } catch (error) {
    console.error("Erro ao adicionar dados à planilha:", error);
  }
}

// Rota para receber os dados do webhook
app.post("/kommowebhook", async (req, res) => {
  try {
    const { pipeline_id, stage_id, id, name, price, created_at } = req.body;

    // Substitua pelos IDs do funil e etapa desejados
    const TARGET_PIPELINE_ID = "7808323";
    const TARGET_STAGE_ID = "79289360";

    // Filtrar leads pelo funil e etapa específicos
    if (pipeline_id === TARGET_PIPELINE_ID && stage_id === TARGET_STAGE_ID) {
      const leadData = {
        id,
        name,
        price,
        date: new Date(created_at * 1000).toISOString().split("T")[0], // Converte timestamp para YYYY-MM-DD
      };

      // Adiciona os dados na planilha
      await appendToSheet(leadData);
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