const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express(); // Certifique-se de que o Express seja inicializado aqui
const PORT = 3333;

// Configuração do parser para JSON e x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Definição do token de acesso e URL da API do Kommo
const KOMMO_API_URL = "https://instneurociencia.kommo.com";
const KOMMO_ACCESS_TOKEN = process.env.KOMMO_SUBDOMAIN;

// Função para buscar detalhes do lead
async function getLeadDetails(leadId) {
  try {
    const response = await axios.get(
      `${KOMMO_API_URL}/api/v4/leads/${leadId}`,
      {
        headers: {
          Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
        },
      }
    );

    console.log("Detalhes do lead:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do lead:", error.message);
    return null;
  }
}

// Função para extrair o número de telefone
function extractPhoneNumber(contact) {
  const customFields = contact.custom_fields_values || [];
  const phoneField = customFields.find((field) => field.field_name === "Phone");

  if (phoneField) {
    const phoneValue = phoneField.values?.find((value) => value.enum_code === "WORK");
    return phoneValue?.value || "Telefone não encontrado!";
  }

  return "Telefone não encontrado!!!";
}

// Rota do webhook
app.post("/kommowebhook", async (req, res) => {
  try {
    console.log("Cabeçalhos da requisição:", req.headers);
    console.log("Payload recebido:", JSON.stringify(req.body, null, 2));

    const leadsArray = req.body.leads?.add;
    if (!leadsArray || leadsArray.length === 0) {
      console.error("Nenhum lead recebido!");
      return res.status(400).send("Nenhum lead recebido.");
    }

    for (const lead of leadsArray) {
      const leadDetails = await getLeadDetails(lead.id);
      const contact = leadDetails?._embedded?.contacts?.[0];
      const phone = contact ? extractPhoneNumber(contact) : "Contato não encontrado";

      console.log("Telefone extraído:", phone);
    }

    res.status(200).send("Webhook recebido com sucesso!");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).send("Erro no processamento do webhook.");
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});