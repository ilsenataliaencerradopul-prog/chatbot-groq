const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    const dbConfig = {
        host: "sql107.ezyro.com	",
        user: "ezyro_39974526", 
        password: "0d398958b", // PON AQUÍ TU PASSWORD
        database: "ezyro_39974526_usuarios",
        ssl: { rejectUnauthorized: false }
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
                const estado = user.estado === 'Activo' ? '✅' : '❌';
                responseText += `${estado} ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n\n`;
            });
        }
        
        await connection.end();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: responseText
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
