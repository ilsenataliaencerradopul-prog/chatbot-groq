exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText;
    
    const GEMINI_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";
    
    // Solo usar Gemini para mensajes más complejos
    if (userMessage.toLowerCase() === 'hola') {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          fulfillmentText: "¡Hola! 😊 Soy tu asistente con IA. ¿En qué puedo ayudarte hoy?" 
        })
      };
    }
    
    // Para otros mensajes, intentar con Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Responde como un asistente útil: ${userMessage}`
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

    // Si Gemini falla, respuesta por defecto
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `Entendí que dijiste: "${userMessage}". ¿En qué más puedo ayudarte?` 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `¡Hola! Recibí tu mensaje: "${event.body && JSON.parse(event.body).queryResult ? JSON.parse(event.body).queryResult.queryText : 'hola'}"` 
      })
    };
  }
};
