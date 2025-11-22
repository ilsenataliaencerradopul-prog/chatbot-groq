exports.handler = async (event) => {
    console.log("✅ Webhook ejecutándose");
    
    // RESPUESTA FIJA PARA PROBAR
    return {
        statusCode: 200,
        body: JSON.stringify({
            fulfillmentText: "✅ Webhook funcionando - Hay 9 usuarios en el sistema",
            fulfillmentMessages: [
                {
                    text: {
                        text: ["✅ Webhook funcionando - Hay 9 usuarios en el sistema"]
                    }
                }
            ]
        })
    };
};
