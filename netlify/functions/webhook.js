// netlify/functions/webhook.js
const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    // TUS CREDENCIALES REALES - DIRECTAMENTE
    const dbConfig = {
        host: "sql107.ezyro.com	",
        user: "ezyro_39974526",
        password: "0d398958b", // PON TU PASSWORD REAL
        database: "ezyro_39974526_usuarios",
        ssl: {
            rejectUnauthorized: false
        }
    };

    // TU API KEY SI LA NECESITAS
    const API_KEY = "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";

    try {
        const connection = await mysql.createConnection(dbConfig);
        const request = JSON.parse(event.body);
        const intent = request.queryResult.intent.displayName;
        
        let responseText = "";
        
        switch(intent) {
            case 'consultar_usuarios':
                const [usuarios] = await connection.execute(
                    'SELECT id, nombre, email, estado, fecha_registro FROM usuarios ORDER BY fecha_registro DESC'
                );
                
                responseText = "👥 **USUARIOS REGISTRADOS:**\n\n";
                usuarios.forEach(user => {
                    const estado = user.estado === 'Activo' ? '✅' : '❌';
                    responseText += `${estado} ${user.nombre}\n📧 ${user.email}\n🆔 ID: ${user.id}\n📅 ${user.fecha_registro}\n\n`;
                });
                break;
                
            case 'estadisticas':
                const [total] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
                const [activos] = await connection.execute('SELECT COUNT(*) as count FROM usuarios WHERE estado = "Activo"');
                const [ofertas] = await connection.execute('SELECT COUNT(*) as count FROM ofertas');
                const [ultimo] = await connection.execute('SELECT nombre FROM usuarios ORDER BY fecha_registro DESC LIMIT 1');
                
                responseText = `📊 **ESTADÍSTICAS EN TIEMPO REAL:**\n\n` +
                              `• 👥 Usuarios registrados: ${total[0].count}\n` +
                              `• ✅ Usuarios activos: ${activos[0].count}\n` +
                              `• ❌ Usuarios suspendidos: ${total[0].count - activos[0].count}\n` +
                              `• 📋 Ofertas publicadas: ${ofertas[0].count}\n` +
                              `• 👤 Último registro: ${ultimo[0].nombre}`;
                break;
                
            case 'consultar_ofertas':
                const [ofertasList] = await connection.execute(
                    'SELECT id, titulo, descripcion, estado FROM ofertas ORDER BY id DESC'
                );
                
                responseText = "📋 **OFERTAS DE TRABAJO:**\n\n";
                ofertasList.forEach(oferta => {
                    const estado = oferta.estado === 'Disponible' ? '🟢' : '🔴';
                    responseText += `${estado} ${oferta.titulo}\n📝 ${oferta.descripcion}\n🆔 ID: ${oferta.id}\n\n`;
                });
                break;
                
            default:
                responseText = "🤖 **CHATBOT ADMINISTRATIVO**\n\nUsa comandos como:\n• \"usuarios\"\n• \"estadísticas\"\n• \"ofertas\"";
        }
        
        await connection.end();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                fulfillmentText: responseText,
                source: "webhook"
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                fulfillmentText: "❌ Error: " + error.message
            })
        };
    }
};
