const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3333;

// Configurações do Kommo
const KOMMO_API_URL = process.KOMMO_BASE_URL; // Substitua pelo seu subdomínio
const KOMMO_ACCESS_TOKEN = process.KOMMO_ACCESS_TOKEN; // Adicione o token de acesso da API do Kommo

// Definir um conjunto para armazenar IDs de leads processados
const processedLeads = new Set();

// Configuração do parser para JSON e x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Caminho do o arquivo de credenciais da conta de serviço do Google
const CREDENTIALS_PATH = path.join(__dirname, process.GOOGLE_KEY_FILE);

// ID da planilha do Google
const SPREADSHEET_ID = process.SPREADSHEET_ID;

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
      range: "Página1!A:E", // Nome da página da planilha
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
      params: {
        with: 'contacts'
      },
      headers: {
        Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
      },
    });

    console.log("Detalhes do lead:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do lead:", error.message);
    return null;
  }
}

// Função para extrair o número de telefone
function extractPhoneNumber(contact) {
  // Verificar se o contato possui campos personalizados
  const customFields = contact.custom_fields_values || [];

  // Logar a estrutura de custom_fields_values para ver onde está o telefone
  console.log("Custom Fields:", JSON.stringify(customFields, null, 2));

  // Procurar pelo campo de telefone com o enum_id "WORK"
  const phoneField = customFields.find((field) => field.field_id === process.PHONE_FIELD_ID); // Verifique o ID do campo

  if (phoneField) {
    console.log("Phone Field:", JSON.stringify(phoneField, null, 2)); // Logar o campo de telefone encontrado
    // Procurar pelo valor dentro do campo, com enum_id "WORK"
    const phoneValue = phoneField.values.find((value) => value.enum_id === process.WORK_ENUM_ID);
    return phoneValue?.value || "Telefone não encontrado.";  // Retorna o número de telefone ou mensagem padrão
  }

  return "Telefone não encontrado!!";  // Se não encontrar o telefone
}


// Rota para receber os dados do webhook
app.post("/kommowebhook", async (req, res) => {
  try {
    console.log("Cabeçalhos da requisição:", req.headers);
    console.log("Payload recebido:", JSON.stringify(req.body, null, 2));

    const leadsArray = req.body.leads?.add || [];  // Leads criados
    const updatedLeadsArray = req.body.leads?.update || [];  // Leads atualizados
    const allLeads = [...leadsArray, ...updatedLeadsArray];  // Combina leads criados e atualizados

    if (allLeads.length === 0) {
      console.error("Nenhum lead recebido!");
      return res.status(400).send("Nenhum lead recebido.");
    }

    for (const lead of allLeads) {
      const { id, name, price = "sem valor", pipeline_id, status_id, created_at, updated_at } = lead;

      // Verificar se o lead está no pipeline e estágio desejado
      if (pipeline_id === process.TARGET_PIPELINE_ID && status_id === process.TARGET_STAGE_ID) {
        if (processedLeads.has(id)) {
          console.log(`Lead ${id} já processado.`);
          continue;
        }

        processedLeads.add(id);

        // Busca detalhes do lead
        const leadDetails = await getLeadDetails(id);

        const contact = leadDetails?._embedded?.contacts?.[0];
        let phone = "Contato não encontrado";

        if (contact) {
          const contactId = contact.id;
          const contactDetailsResponse = await axios.get(
            `${KOMMO_API_URL}/api/v4/contacts/${contactId}`,
            { headers: { Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}` } }
          );

          const contactDetails = contactDetailsResponse.data;
          phone = extractPhoneNumber(contactDetails);
        }

        const leadData = {
          id,
          name,
          phone,
          price,
          date: new Date(updated_at * 1000).toISOString().split("T")[0],  // Usa o timestamp atualizado
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

// Inicia o servidor na porta 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});