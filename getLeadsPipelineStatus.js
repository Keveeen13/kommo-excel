const axios = require('axios');

const getLeads = async (pipelineId, statusId, token) => {
  try {
    const response = await axios.get('https://instneurociencia.kommo.com/api/v4/leads/', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        pipeline_id: pipelineId,
        status_id: statusId
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
  }
};

const pipelineId = '7808323';
const statusId = '79289360';
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdmNzg2ODJhYzNlYzNiNzY0N2NkOGFhMTY5YTkzNjhhN2ExZmY5ZWJlNTA5OWNlYTJlNjExZTkwYWIzZTBlNzhhNWIxMzhiOTk2NjFlNWU5In0.eyJhdWQiOiI5YWE3YjQ5NC05ZGMwLTQ0ODctOTViNC02MzY0MGRiZWY2NDUiLCJqdGkiOiI3Zjc4NjgyYWMzZWMzYjc2NDdjZDhhYTE2OWE5MzY4YTdhMWZmOWViZTUwOTljZWEyZTYxMWU5MGFiM2UwZTc4YTViMTM4Yjk5NjYxZTVlOSIsImlhdCI6MTczNjc5NTY5MiwibmJmIjoxNzM2Nzk1NjkyLCJleHAiOjE4OTQ0OTI4MDAsInN1YiI6Ijc1MzY5NjgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MzIwNjUyOTEsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJkN2FkZmRmNC0wYzhlLTQ5ZjQtYmQyZi1kZDIxYzk2ZjU2YmEiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.pEFmKQIgTONKvu_ArutOx4dTfBhYkDLfdEdMguYNyc-vn1SeiWykkxqR0pufschYRDpk7qEGmG0OeG-xJVupyovAcvQjQ1MH8T8ltLCnbOk-btYgs5tL5kzW__5CAKQAQcqIarwPYDv30uncWzx0EICy8N6IDMB2eGx7Qa9Pt0RXkRPD4P3Y_ce1ijJc0e9HEPKAqU4_uiU8OrlOX30rxSbS8bIeyGYqWPDE8VTNw0xdDPabRCzgxW2JRweFFAI1myqECr-zHG1n7ZvZrq4rcCRT7elOEWQppZp5mC_GqfAzjUliTU7wb4aqurPqF8bWE1CCCbYKrgJN1g6MIV3Uug';

getLeads(pipelineId, statusId, token);