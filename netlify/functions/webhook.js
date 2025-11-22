const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // TUS CREDENCIALES DE ezyro.com
    const dbConfig = {
        host: "sql107.ezyro.com",
        user: "ezyro_39974526", 
        password: "0d398958b", // ⚠️ PON TU PASSWORD AQUÍ
        database: "ezyro_39974526_usuarios",
        port: 3306
    };

    try {
        console.log("🔌 Conectando a la base de datos...");
        const connection = await mysql.createConnection(dbConfig);
        console.log("✅ Conexión exitosa!");
        
        const request = JSON.parse(event.body);
        const intent = request.queryResult.intent.displayName;
        console.log("🎯 Intención detectada:", intent);
        
        let responseText = "";
        
        if (intent === 'consultar_usuarios') {
            const [usuarios] = await connection.execute(
                'SELECT id, nombre, email, estado FROM usuarios ORDER BY id DESC'
            );
            console.log("📊 Usuarios encontrados:", usuarios.length);
            
            responseText = "👥 **USUARIOS REGISTRADOS:**\n\n";
            usuarios.forEach(user => {
                const estado = user.estado === 'Activo' ? '✅' : '❌';
                responseText += `${estado} ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n\n`;
            });
        } else {
            responseText = "🤖 Comando no reconocido. Usa 'usuarios' para ver la lista.";
        }
        
        await connection.end();
        console.log("✅ Respuesta enviada a DialogFlow");
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: responseText
            })
        };
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: "❌ Error de conexión: " + error.message
            })
        };
    }
};
