const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText.toLowerCase();
    
    const GEMINI_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";

    // CONFIGURACIÓN DE LA BASE DE DATOS REAL
    const dbConfig = {
      host: process.env.DB_HOST || "sql107.ezyro.com",
      user: process.env.DB_USER || "ezyro_39974526",
      password: process.env.DB_PASS || "0d398958b",
      database: process.env.DB_NAME || "ezyro_39974526_usuarios",
      port: process.env.DB_PORT || 3306
    };

    let dbInfo = {};
    let connection;

    try {
      // CONECTAR A LA BASE DE DATOS REAL
      connection = await mysql.createConnection(dbConfig);
      
      // DETECTAR QUÉ CONSULTAR Y EJECUTAR SQL REAL
      if (userMessage.includes('usuario') || userMessage.includes('user') || userMessage.includes('registrado')) {
        const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        const [activeUsers] = await connection.execute('SELECT COUNT(*) as activos FROM usuarios WHERE estado = "Activo"');
        const [lastUser] = await connection.execute('SELECT fecha_registro FROM usuarios ORDER BY id DESC LIMIT 1');
        
        dbInfo = {
          tipo: 'usuarios',
          total: users[0].total,
          activos: activeUsers[0].activos,
          ultimo_registro: lastUser[0]?.fecha_registro
        };
      } 
      else if (userMessage.includes('oferta') || userMessage.includes('empleo') || userMessage.includes('trabajo')) {
        const [offers] = await connection.execute('SELECT COUNT(*) as total FROM ofertas');
        const [available] = await connection.execute('SELECT COUNT(*) as disponibles FROM ofertas WHERE estado = "Disponible"');
        const [titles] = await connection.execute('SELECT titulo FROM ofertas LIMIT 5');
        
        dbInfo = {
          tipo: 'ofertas',
          total: offers[0].total,
          disponibles: available[0].disponibles,
          puestos: titles.map(t => t.titulo)
        };
      }
      else if (userMessage.includes('postulación') || userMessage.includes('aplicación')) {
        const [applications] = await connection.execute('SELECT COUNT(*) as total FROM postulaciones');
        const [popular] = await connection.execute(`
          SELECT o.titulo, COUNT(p.id) as postulaciones 
          FROM postulaciones p 
          JOIN ofertas o ON p.id_oferta = o.id 
          GROUP BY o.id 
          ORDER BY postulaciones DESC 
          LIMIT 1
        `);
        
        dbInfo = {
          tipo: 'postulaciones',
          total: applications[0].total,
          oferta_mas_popular: popular[0] ? `${popular[0].titulo} (${popular[0].postulaciones} postulaciones)` : 'No hay datos'
        };
      }
      else if (userMessage.includes('administrador') || userMessage.includes('admin')) {
        const [admins] = await connection.execute('SELECT COUNT(*) as total FROM administradores');
        const [adminNames] = await connection.execute('SELECT nombre FROM administradores LIMIT 3');
        
        dbInfo = {
          tipo: 'administradores',
          total: admins[0].total,
          nombres: adminNames.map(a => a.nombre)
        };
      }
      else if (userMessage.includes('estadística') || userMessage.includes('resumen')) {
        const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        const [offers] = await connection.execute('SELECT COUNT(*) as total FROM ofertas');
        const [applications] = await connection.execute('SELECT COUNT(*) as total FROM postulaciones');
        const [admins] = await connection.execute('SELECT COUNT(*) as total FROM administradores');
        
        dbInfo = {
          tipo: 'resumen_general',
          total_usuarios: users[0].total,
          total_ofertas: offers[0].total,
          total_postulaciones: applications[0].total,
          total_administradores: admins[0].total
        };
      }

      await connection.end();

    } catch (dbError) {
      console.error("Error DB:", dbError);
      dbInfo = { error: "Error conectando a la base de datos" };
    }

    // USAR GEMINI CON LA INFORMACIÓN REAL DE LA DB
    let prompt = `El usuario preguntó: "${userMessage}".`;
    
    if (Object.keys(dbInfo).length > 0 && !dbInfo.error) {
      prompt += `\n\nINFORMACIÓN REAL DE LA BASE DE DATOS:\n${JSON.stringify(dbInfo, null, 2)}\n\nResponde como asistente de recursos humanos usando esta información.`;
    } else if (dbInfo.error) {
      prompt += `\n\nNo pude acceder a la base de datos. Responde como asistente general de recursos humanos.`;
    } else {
      prompt += ` Responde como asistente de recursos humanos.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const botReply = data.candidates[0].content.parts[0].text;
        return {
          statusCode: 200,
          body: JSON.stringify({ fulfillmentText: botReply })
        };
      }
    }

    // RESPUESTA POR DEFECTO
    const defaultReply = Object.keys(dbInfo).length > 0 && !dbInfo.error
      ? `Según nuestros registros: ${JSON.stringify(dbInfo)}. ¿En qué más puedo ayudarte?`
      : `¡Hola! Soy tu asistente del sistema de bolsa de trabajo. ¿En qué puedo ayudarte?`;

    return {
      statusCode: 200,
      body: JSON.stringify({ fulfillmentText: defaultReply })
    };
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: `¡Hola! Soy tu asistente. Hubo un error: ${error.message}` 
      })
    };
  }
};
