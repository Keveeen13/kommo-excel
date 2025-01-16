const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = 3000;

// Definir um conjunto para armazenar IDs de leads processados
const processedLeads = new Set();

// Configuração do parser para JSON e x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Rota para receber os dados do webhook
app.post("/kommowebhook", async (req, res) => {
  try {
    console.log("Cabeçalhos da requisição:", req.headers);
    console.log("Payload recebido:", JSON.stringify(req.body, null, 2));

    // Verifique se leads foram enviados
    const leadsArray = req.body.leads?.add;
    if (!leadsArray || leadsArray.length === 0) {
      console.error("Nenhum lead recebido!");
      return res.status(400).send("Nenhum lead recebido.");
    }

    // Substitua pelos IDs do funil e etapa desejados
    const TARGET_PIPELINE_ID = "7808323";
    const TARGET_STAGE_ID = "79289360";

    for (const lead of leadsArray) {
      const id = lead.id;
      const name = lead.name;
      const phone = lead.phone || "Não informado";
      const price = lead.price || 0; // Preencher com 0 caso não tenha preço
      const pipeline_id = lead.pipeline_id;
      const status_id = lead.status_id;
      const created_at = lead.created_at;

      // Filtrar leads pelo funil e etapa específicos
      if (pipeline_id === TARGET_PIPELINE_ID && status_id === TARGET_STAGE_ID) {
        if (processedLeads.has(id)) {
          console.log(`Lead ${id} já processado.`);
          continue; // Ignorar leads já processados
        }

        processedLeads.add(id);

        const leadData = {
          id,
          name,
          phone,
          price,
          date: new Date(created_at * 1000).toISOString().split("T")[0], // Converte timestamp para YYYY-MM-DD
        };

        console.log("Dados para planilha:", leadData);

        // Adiciona os dados na planilha
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