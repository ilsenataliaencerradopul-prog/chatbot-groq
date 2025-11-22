const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText.toLowerCase();
    
    const GEMINI_API_KEY = "AIzaSyDrp1tk0Rp3z-pHUxzM1KSujalywZIItPA";

    // TUS CREDENCIALES REALES DE PROFREEHOST
    const dbConfig = {
      host: "sql107.ezyro.com",
      user: "ezyro_39974526", 
      password: "0d398958b",
      database: "ezyro_39974526_usuarios",
      port: 3306,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    };

    let dbInfo = {};
    let connection;

    try {
      console.log("🔗 Conectando a la base de datos...");
      connection = await mysql.createConnection(dbConfig);
      console.log("✅ Conexión exitosa a la BD");

      // CONSULTAS REALES A TU BASE DE DATOS
      if (userMessage.includes('usuario') || userMessage.includes('user') || userMessage.includes('registrado')) {
        console.log("📊 Consultando usuarios...");
        
        // Consulta REAL de usuarios
        const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        const [activeUsers] = await connection.execute('SELECT COUNT(*) as activos FROM usuarios WHERE estado = "Activo"');
        const [lastUser] = await connection.execute('SELECT nombre, fecha_registro FROM usuarios ORDER BY id DESC LIMIT 1');
        
        dbInfo = {
          tipo: 'usuarios',
          total_usuarios: users[0].total,
          usuarios_activos: activeUsers[0].activos,
          ultimo_usuario: lastUser[0]?.nombre || 'No disponible',
          ultimo_registro: lastUser[0]?.fecha_registro || 'No disponible',
          mensaje: `✅ DATOS REALES: Hay ${users[0].total} usuarios registrados, ${activeUsers[0].activos} activos. Último registro: ${lastUser[0]?.nombre || 'N/A'}`
        };
        
      } 
      else if (userMessage.includes('oferta') || userMessage.includes('empleo') || userMessage.includes('trabajo')) {
        console.log("📊 Consultando ofertas...");
        
        const [offers] = await connection.execute('SELECT COUNT(*) as total FROM ofertas');
        const [available] = await connection.execute('SELECT COUNT(*) as disponibles FROM ofertas WHERE estado = "Disponible"');
        const [titles] = await connection.execute('SELECT titulo FROM ofertas LIMIT 3');
        
        dbInfo = {
          tipo: 'ofertas',
          total_ofertas: offers[0].total,
          ofertas_disponibles: available[0].disponibles,
          algunos_puestos: titles.map(t => t.titulo),
          mensaje: `✅ DATOS REALES: ${offers[0].total} ofertas de trabajo, ${available[0].disponibles} disponibles`
        };
      }
      else if (userMessage.includes('postulación') || userMessage.includes('aplicación')) {
        console.log("📊 Consultando postulaciones...");
        
        const [applications] = await connection.execute('SELECT COUNT(*) as total FROM postulaciones');
        
        dbInfo = {
          tipo: 'postulaciones',
          total_postulaciones: applications[0].total,
          mensaje: `✅ DATOS REALES: ${applications[0].total} postulaciones realizadas`
        };
      }
      else {
        // Consulta general
        const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        const [offers] = await connection.execute('SELECT COUNT(*) as total FROM ofertas');
        const [applications] = await connection.execute('SELECT COUNT(*) as total FROM postulaciones');
        
        dbInfo = {
          tipo: 'resumen',
          total_usuarios: users[0].total,
          total_ofertas: offers[0].total,
          total_postulaciones: applications[0].total,
          mensaje: `📊 RESUMEN REAL: ${users[0].total} usuarios, ${offers[0].total} ofertas, ${applications[0].total} postulaciones`
        };
      }

      await connection.end();
      console.log("✅ Consulta completada");

    } catch (dbError) {
      console.error("❌ Error de base de datos:", dbError);
      dbInfo = { 
        error: true,
        mensaje: "❌ No pude conectar con la base de datos. Error: " + dbError.message
      };
    }

    // ENVIAR RESPUESTA
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: dbInfo.mensaje || `Información: ${JSON.stringify(dbInfo)}` 
      })
    };
    
  } catch (error) {
    console.error("❌ Error general:", error);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: "❌ Error en el servidor: " + error.message 
      })
    };
  }
};
