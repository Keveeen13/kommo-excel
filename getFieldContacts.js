const axios = require("axios");

const KOMMO_ACCESS_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;
const LEAD_ID = process.env.LEAD_ID;
// Função para buscar detalhes do lead e obter o telefone associado
async function getLeadDetails(leadId, subdomain, token) {
  try {
    const response = await axios.get(
      `https://${KOMMO_SUBDOMAIN}.amocrm.com/api/v4/leads/${LEAD_ID}?with=contacts`,
      {
        headers: {
          Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`, // Substitua pelo token de acesso válido
        },
      }
    );

    const lead = response.data;

    // Obter contatos associados ao lead
    const contact = lead._embedded?.contacts?.[0];
    if (contact) {
      const contactId = contact.id;

      // Buscar dados do contato
      const contactResponse = await axios.get(
        `https://${KOMMO_SUBDOMAIN}.amocrm.com/api/v4/contacts/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
          },
        }
      );

      const contactDetails = contactResponse.data;
      const phoneField = contactDetails.custom_fields_values?.find(
        (field) => field.field_name === "Tel. comercial"
      );

      const phone = phoneField?.values?.[0]?.value || "Não informado";
      return phone;
    }

    return "Não informado";
  } catch (error) {
    console.error("Erro ao buscar detalhes do lead:", error.message);
    return "Erro ao buscar telefone";
  }
}

// Exportar a função para uso em outros arquivos
module.exports = {
  getLeadDetails,
};