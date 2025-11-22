const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // TU API KEY DE GOOGLE
    const GOOGLE_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";
    
    // VERIFICAR API KEY
    const clientKey = event.headers['x-api-key'] || event.headers['authorization'];
    
    if (!clientKey || !clientKey.includes(GOOGLE_API_KEY)) {
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
        password: "0d398958b", // ⚠️ PON AQUÍ TU PASSWORD
        database: "ezyro_39974526_usuarios",
        port: 3306
    };

    try {
        console.log("🔐 API Key válida, conectando a BD...");
        const connection = await mysql.createConnection(dbConfig);
        
        const request = JSON.parse(event.body);
        const intent = request.queryResult.intent.displayName;
        
        let responseText = "";
        
        if (intent === 'consultar_usuarios') {
            const [usuarios] = await connection.execute(
                'SELECT id, nombre, email, estado FROM usuarios ORDER BY id DESC LIMIT 15'
            );
            
            responseText = "👥 **USUARIOS REGISTRADOS:**\n\n";
            usuarios.forEach(user => {
                const estado = user.estado === 'Activo' ? '✅' : '❌';
                responseText += `${estado} ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n\n`;
            });
            
            responseText += `📊 **Total:** ${usuarios.length} usuarios`;
        }
        
        await connection.end();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: responseText,
                fulfillmentMessages: [
                    {
                        text: {
                            text: [responseText]
                        }
                    }
                ]
            })
        };
        
    } catch (error) {
        console.error("❌ Error:", error);
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: "❌ Error en el servidor: " + error.message
            })
        };
    }
};
