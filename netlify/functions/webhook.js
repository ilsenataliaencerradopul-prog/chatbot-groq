exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText;
    
    // ⚠️ REEMPLAZA ESTA API KEY CON TU KEY VÁLIDA ⚠️
    const GROQ_API_KEY = "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";
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{role: 'user', content: userMessage}],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Error Groq API: ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const botReply = data.choices[0].message.content;
      return {
        statusCode: 200,
        body: JSON.stringify({ fulfillmentText: botReply })
      };
    } else {
      throw new Error('Respuesta inválida de Groq');
    }
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `Error: ${error.message}` 
      })
    };
  }
};
