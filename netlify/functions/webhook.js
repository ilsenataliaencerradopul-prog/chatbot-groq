exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText;
    
    // Tu API Key de Google
    const GEMINI_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userMessage
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const botReply = data.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          fulfillmentText: botReply 
        })
      };
    } else {
      throw new Error('Respuesta inválida de Google Gemini');
    }
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `¡Hola! Soy tu chatbot. Me dijiste: "${event.body && JSON.parse(event.body).queryResult ? JSON.parse(event.body).queryResult.queryText : 'hola'}"` 
      })
    };
  }
};
