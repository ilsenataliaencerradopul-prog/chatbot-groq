const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    const dbConfig = {
        host: "sql107.ezyro.com",
        user: "ezyro_39974526", 
        password: "0d398958b", // ⚠️ PON TU PASSWORD
        database: "ezyro_39974526_usuarios",
        port: 3306
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [usuarios] = await connection.execute('SELECT nombre, email FROM usuarios');
        await connection.end();
        
        let respuesta = "👥 USUARIOS:\n\n";
        usuarios.forEach(user => {
            respuesta += `• ${user.nombre} (${user.email})\n`;
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ fulfillmentText: respuesta })
        };
        
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify({ fulfillmentText: "Error: " + error.message })
        };
    }
};
