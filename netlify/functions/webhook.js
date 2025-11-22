const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // TU PASSWORD DE EZYRO - PONLO AQUÍ
    const DB_PASSWORD = "0d398958b";
    
    const dbConfig = {
        host: "sql107.ezyro.com",
        user: "ezyro_39974526", 
        password: DB_PASSWORD,
        database: "ezyro_39974526_usuarios",
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [usuarios] = await connection.execute(
            'SELECT id, nombre, email, estado FROM usuarios ORDER BY id DESC'
        );
        
        await connection.end();
        
        let responseText = "👥 **USUARIOS REGISTRADOS:**\n\n";
        usuarios.forEach(user => {
            responseText += `✅ ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n\n`;
        });
        
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
