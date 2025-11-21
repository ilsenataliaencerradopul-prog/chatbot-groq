exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText;
    
    const GEMINI_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";

    // CONEXIÓN A BASE DE DATOS PROFREEHOST
    let dbData = null;
    
    // Consultar la base de datos según el mensaje
    if (userMessage.toLowerCase().includes('usuario') || userMessage.toLowerCase().includes('base de datos')) {
      try {
        // Aquí va tu conexión MySQL a ProFreeHost
        // Ejemplo con datos simulados:
        dbData = {
          total_usuarios: 15,
          usuarios_activos: 12,
          ultimo_registro: "2024-01-15"
        };
        
        // En producción, reemplaza con:
        /*
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: 'sql107.ezyro.com',
          user: 'ezyro_39974526',
          password: '0d398958b',
          database: 'ezyro_39974526_usuarios'
        });
        
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        dbData = { total_usuarios: rows[0].total };
        await connection.end();
        */
        
      } catch (dbError) {
        console.log("Error DB:", dbError.message);
        dbData = { error: "Error conectando a la base de datos" };
      }
    }

    // USAR GEMINI CON LOS DATOS DE LA DB
    let prompt = userMessage;
    
    if (dbData) {
      prompt = `El usuario preguntó: "${userMessage}". 
      
      Datos de la base de datos: ${JSON.stringify(dbData)}
      
      Responde usando esta información de manera natural:`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const botReply = data.candidates[0].content.parts[0].text;
        return {
          statusCode: 200,
          body: JSON.stringify({ fulfillmentText: botReply })
        };
      }
    }

    // Respuesta por defecto
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: dbData ? 
          `Base de datos: ${JSON.stringify(dbData)}. Mensaje: ${userMessage}` :
          `Recibí: "${userMessage}". ¿Necesitas información de la base de datos?`
      })
    };
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `Error: ${error.message}` 
      })
    };
  }
};
