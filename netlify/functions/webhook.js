// netlify/functions/webhook.js
exports.handler = async (event) => {
    console.log("🔔 Webhook llamado");
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            fulfillmentText: "✅ CHATBOT FUNCIONANDO - 9 usuarios registrados en sistema",
            fulfillmentMessages: [
                {
                    text: {
                        text: ["✅ CHATBOT FUNCIONANDO - 9 usuarios registrados en sistema"]
                    }
                }
            ]
        })
    };
};
