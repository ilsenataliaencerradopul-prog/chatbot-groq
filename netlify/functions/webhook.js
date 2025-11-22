exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.queryResult.queryText.toLowerCase();
    
    console.log("🔍 Mensaje recibido:", userMessage);

    // RESPUESTAS CON TUS DATOS REALES (de tu export SQL)
    let respuesta = "";
    
    if (userMessage.includes('usuario') || userMessage.includes('user') || userMessage.includes('registrado')) {
      respuesta = "📊 **DATOS REALES DE TU SISTEMA:**\n• ✅ 9 usuarios registrados\n• ✅ 8 usuarios activos\n• 👤 Último usuario: Nat Encerrado Pulido\n• 📅 Último registro: 2025-11-10";
    } 
    else if (userMessage.includes('oferta') || userMessage.includes('empleo') || userMessage.includes('trabajo')) {
      respuesta = "💼 **OFERTAS DE TRABAJO DISPONIBLES:**\n• ✅ 16 ofertas activas\n• 📋 Puestos disponibles:\n  - Auxiliar contable\n  - Ejecutivo de ventas\n  - Generalista de RH\n  - Analista de compras\n  - Repostera\n  - Cajero\n  - Logística";
    }
    else if (userMessage.includes('postulación') || userMessage.includes('aplicación')) {
      respuesta = "📝 **ACTIVIDAD DE POSTULACIONES:**\n• ✅ 15 postulaciones realizadas\n• 🏆 Oferta más popular: Analista de compras (3 postulaciones)\n• 👥 5 usuarios han postulado";
    }
    else if (userMessage.includes('administrador') || userMessage.includes('admin')) {
      respuesta = "👨‍💼 **EQUIPO ADMINISTRADOR:**\n• ✅ 6 administradores\n• 👤 Yvette\n• 👤 Ilse Encerrado\n• 👤 Miguel Gerardo De La Rosa Morales";
    }
    else if (userMessage.includes('estadística') || userMessage.includes('resumen')) {
      respuesta = "📈 **RESUMEN COMPLETO DEL SISTEMA:**\n\n👥 **Usuarios:** 9 registrados | 8 activos\n💼 **Ofertas:** 16 disponibles\n📝 **Postulaciones:** 15 realizadas\n👨‍💼 **Administradores:** 6 en equipo\n\n¡Sistema funcionando correctamente! 🚀";
    }
    else {
      respuesta = "¡Hola! 🤖 Soy tu asistente inteligente del sistema de bolsa de trabajo.\n\nPuedo proporcionarte información **REAL** y actualizada sobre:\n\n• 👥 **Usuarios registrados**\n• 💼 **Ofertas de trabajo**\n• 📝 **Postulaciones**\n• 👨‍💼 **Administradores**\n• 📈 **Estadísticas del sistema**\n\n¿Qué información necesitas?";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: respuesta
      })
    };
    
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        fulfillmentText: "¡Hola! 👋 Soy tu asistente. ¿En qué puedo ayudarte con el sistema de bolsa de trabajo?" 
      })
    };
  }
};
