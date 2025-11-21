exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText;
    
    console.log("Mensaje recibido:", userMessage);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',  // ← MODELO ALTERNATIVO
        messages: [{role: 'user', content: userMessage}],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    // Verificar si la respuesta HTTP es exitosa
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
    }

    const data = await groqResponse.json();
    console.log("Respuesta de Groq:", JSON.stringify(data, null, 2));

    // Verificar estructura de respuesta
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const botReply = data.choices[0].message.content;
      return {
        statusCode: 200,
        body: JSON.stringify({ fulfillmentText: botReply })
      };
    } else {
      throw new Error('Estructura de respuesta inválida: ' + JSON.stringify(data));
    }
    
  } catch (error) {
    console.error("Error completo:", error);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `Error: ${error.message}. Por favor intenta más tarde.` 
      })
    };
  }
};
