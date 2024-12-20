const axios = require('axios');

// Configuração da Kommo API
const KOMMO_ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImYzYTdhYTU5ZjBjNGIwZDQ3ZDdkZThjMjIzOTgxNzBhYWFmZTM3MjYzYWY4ZjRmZDU3ODcwMTIxZWY5MDVkNDZjYTRkMzNkNDJhOTE4ZTEyIn0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiJmM2E3YWE1OWYwYzRiMGQ0N2Q3ZGU4YzIyMzk4MTcwYWFhZmUzNzI2M2FmOGY0ZmQ1Nzg3MDEyMWVmOTA1ZDQ2Y2E0ZDMzZDQyYTkxOGUxMiIsImlhdCI6MTczNDcxOTYzNSwibmJmIjoxNzM0NzE5NjM1LCJleHAiOjE4OTI0MTkyMDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiIxNGEyYzhhOS1kNjI5LTQ3YWItYjNmZi0xNzNlZmI5YjkxMDEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.Js_icxM1Nb8E6bTqKrNlkk2AXnNCRfn2iLKykeNXzHino2z32DBQCQST6Q39SLWDF5o-jiTN4meo5J-fgtocQq29OdbUhAipct9641E68H6X3ouSf6H-i7AfgDTLq9wHclltBwz2gStvK1SyID8wuKr5JTUNVVCF400vRrLB3CbygTkmglzoYM9yESQgeK0TCYEbukDT1DIC0qf0Zfc2KOO3Hu5NM1Twzs6WfrojV_BFSR2mIHUrTx_qdbTThTnHHfoWJCNRIh6YZk1OXxcReNMYgIaGJhJJmJdsNmFiON0KqvHtaSxtmnVVq91CFn6N8MzAmDt-P_oI3LD7VPFbDQ'; // Token de acesso da Kommo
const KOMMO_API_URL = 'https://instneurociencia.kommo.com/api/v4'; // URL do subdomínio da Kommo

// ID do funil específico
const FUNIL_ID = 'SEU_FUNIL_ID'; // Substitua pelo ID do seu funil

// Função para buscar as etapas de um funil
async function fetchStagesFromPipeline() {
    try {
        const response = await axios.get(`${KOMMO_API_URL}/pipelines/${FUNIL_ID}/stages`, {
            headers: {
                Authorization: `Bearer ${KOMMO_ACCESS_TOKEN}`,
            },
        });

        // Retornar as etapas
        return response.data._embedded.stages || [];
    } catch (error) {
        console.error('Erro ao buscar etapas do funil:', error.response?.data || error.message);
    }
}

// Testando a função para obter as etapas
fetchStagesFromPipeline().then(stages => {
    if (stages && stages.length > 0) {
        stages.forEach((stage, index) => {
            console.log(`Etapa #${index + 1}:`);
            console.log(`ID: ${stage.id}`);
            console.log(`Nome: ${stage.name}`);
            console.log('-------------------------');
        });
    } else {
        console.log('Nenhuma etapa encontrada.');
    }
});