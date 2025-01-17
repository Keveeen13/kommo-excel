const axios = require("axios");

async function getCustomFields(subdomain, token) {
  try {
    const response = await axios.get(
      `https://${subdomain}.amocrm.com/api/v4/contacts/custom_fields`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const customFields = response.data._embedded.custom_fields;

    console.log("Lista de campos personalizados:");
    customFields.forEach((field) => {
      console.log(`ID: ${field.id}, Nome: ${field.name}`);
    });

    // Retornar a lista de campos personalizados
    return customFields;
  } catch (error) {
    console.error("Erro ao buscar os campos personalizados:", error.message);
  }
}

// Substitua pelos valores corretos
const SUBDOMAIN = "instneurociencia"; // Subdomínio da sua conta
const API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZlYThiN2Y4Y2UwYzE4ZmY2Mjc5YTM3ZDBiYTNkNWEzY2E3NWJhNTkwZDk0ZjJmYzRmYzYzZTlhYjAwYjU5NzQ3ZTU1ZTlhYzJkYjRkZWZhIn0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiJmZWE4YjdmOGNlMGMxOGZmNjI3OWEzN2QwYmEzZDVhM2NhNzViYTU5MGQ5NGYyZmM0ZmM2M2U5YWIwMGI1OTc0N2U1NWU5YWMyZGI0ZGVmYSIsImlhdCI6MTczNDcyMzAyMiwibmJmIjoxNzM0NzIzMDIyLCJleHAiOjE4OTI0MTkyMDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiIzYzA2OTQ2Mi0zNDkwLTRlODktYmU5MC01MjQ0ZjA5Y2QyNGQiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.Wv-FmVj61UQ_kB537xpBPfd7SzLYWSTbG1OelIUuMIXQExCmwfDsjiGbN8wtv_jPoYCpBhLk6IrkJocSM400dyAsjvrtQ2Re6pPQoDP9NzjblmRZfioJka_wMFrJm3gQtSpbxWo0QzHfYxopRVFADEBVZicPOXhaxaBuFv2jHCpLvgS983mpuq2Rc9MAxItJNWWQZHsc7IO7Si_IMlRJZ0JxokbYUlPRDjUtkheStgK2R9Z57-fLz-ywprQG5BmQqHPPVL6RLgaiHpK23RYSm3rshxgMyD79HbAi8ULt4Rykftk7cdBCmwuSSHn6REPwB-F7YJk_XoAMETYlYy_0Gg"; // Token de acesso à API do Kommo

getCustomFields(SUBDOMAIN, API_TOKEN);