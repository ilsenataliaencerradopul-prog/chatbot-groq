exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const userMessage = body.queryResult.queryText;
  
  try {
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
    const botReply = data.choices[0].message.content;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ fulfillmentText: botReply })
    };
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ fulfillmentText: "Error: " + error.message })
    };
  }
};
