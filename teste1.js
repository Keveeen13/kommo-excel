const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Configurações do Kommo
const KOMMO_API_URL = "https://instneurociencia.kommo.com"; // Substitua pelo seu subdomínio
const KOMMO_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZlYThiN2Y4Y2UwYzE4ZmY2Mjc5YTM3ZDBiYTNkNWEzY2E3NWJhNTkwZDk0ZjJmYzRmYzYzZTlhYjAwYjU5NzQ3ZTU1ZTlhYzJkYjRkZWZhIn0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiJmZWE4YjdmOGNlMGMxOGZmNjI3OWEzN2QwYmEzZDVhM2NhNzViYTU5MGQ5NGYyZmM0ZmM2M2U5YWIwMGI1OTc0N2U1NWU5YWMyZGI0ZGVmYSIsImlhdCI6MTczNDcyMzAyMiwibmJmIjoxNzM0NzIzMDIyLCJleHAiOjE4OTI0MTkyMDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiIzYzA2OTQ2Mi0zNDkwLTRlODktYmU5MC01MjQ0ZjA5Y2QyNGQiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.Wv-FmVj61UQ_kB537xpBPfd7SzLYWSTbG1OelIUuMIXQExCmwfDsjiGbN8wtv_jPoYCpBhLk6IrkJocSM400dyAsjvrtQ2Re6pPQoDP9NzjblmRZfioJka_wMFrJm3gQtSpbxWo0QzHfYxopRVFADEBVZicPOXhaxaBuFv2jHCpLvgS983mpuq2Rc9MAxItJNWWQZHsc7IO7Si_IMlRJZ0JxokbYUlPRDjUtkheStgK2R9Z57-fLz-ywprQG5BmQqHPPVL6RLgaiHpK23RYSm3rshxgMyD79HbAi8ULt4Rykftk7cdBCmwuSSHn6REPwB-F7YJk_XoAMETYlYy_0Gg"; // Adicione o token de acesso da API do Kommo

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

// Função para buscar detalhes do lead
async function getLeadDetails(leadId) {
  try {
    const response = await axios.get(`${KOMMO_API_URL}/api/v4/leads/${leadId}`, {
      headers: {
        Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
      },
    });

    console.log("Detalhes do lead:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do lead:", error.message);
    return null;
  }
}

// Função para extrair o número de telefone
function extractPhoneNumber(contact) {
  // Verifique se há um campo de telefone padrão no contato
  if (contact.phones && contact.phones.length > 0) {
    const workPhone = contact.phones.find((phone) => phone.type === 'WORK');
    if (workPhone) {
      return workPhone.number || "Campo do telefone não encontrado!";
    }
  }

  // Caso não encontre no campo de telefone, verifica campos personalizados
  const customFields = contact.custom_fields_values || [];
  const phoneField = customFields.find((field) => field.field_name === "Phone");

  if (phoneField) {
    const phoneValue = phoneField.values?.find((value) => value.enum_code === "WORK");
    return phoneValue?.value || "Telefone não encontrado!";
  }

  return "Telefone não encontrado!";
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
      const price = lead.price || "sem valor"; // Preencher com 0 caso não tenha preço
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

        // Buscar detalhes do lead e contato
        const leadDetails = await getLeadDetails(id);
        const contact = leadDetails?._embedded?.contacts?.[0]; // Busca o primeiro contato associado
        const phone = contact ? extractPhoneNumber(contact) : "Contato não encontrado";

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