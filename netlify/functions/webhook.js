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
        model: 'llama-3.1-8b-instant',
        messages: [{role: 'user', content: userMessage}],
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();
    console.log("Respuesta de Groq:", data);

    // Verificar que la respuesta tiene la estructura esperada
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Respuesta inválida de Groq API');
    }

    const botReply = data.choices[0].message.content;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: botReply 
      })
    };
    
  } catch (error) {
    console.error("Error completo:", error);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `Lo siento, hubo un error: ${error.message}` 
      })
    };
  }
};
