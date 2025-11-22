const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // API KEY PARA VALIDACIÓN
    const API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA"; // TU API KEY PERSONALIZADA
    
    // VERIFICAR API KEY EN HEADERS
    const clientApiKey = event.headers['x-api-key'] || event.headers['authorization'];
    
    if (!clientApiKey || clientApiKey !== API_KEY) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                fulfillmentText: "❌ No autorizado - API Key inválida"
            })
        };
    }

    // TUS CREDENCIALES DE BASE DE DATOS
    const dbConfig = {
        host: "sql107.ezyro.com",
        user: "ezyro_39974526", 
        password: "0d398958b", // PON AQUÍ TU PASSWORD
        database: "ezyro_39974526_usuarios",
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const request = JSON.parse(event.body);
        const intent = request.queryResult.intent.displayName;
        
        let responseText = "";
        
        if (intent === 'consultar_usuarios') {
            const [usuarios] = await connection.execute(
                'SELECT id, nombre, email, estado FROM usuarios ORDER BY id DESC'
            );
            
            responseText = "👥 **USUARIOS REGISTRADOS:**\n\n";
            usuarios.forEach(user => {
                responseText += `✅ ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n\n`;
            });
        }
        
        await connection.end();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: responseText,
                payload: {
                    google: {
                        expectUserResponse: true,
                        richResponse: {
                            items: [{
                                simpleResponse: {
                                    textToSpeech: responseText.replace(/\*\*/g, '')
                                }
                            }]
                        }
                    }
                }
            })
        };
        
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: "❌ Error: " + error.message
            })
        };
    }
};
