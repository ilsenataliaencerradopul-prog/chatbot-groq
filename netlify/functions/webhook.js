// netlify/functions/webhook.js
import fetch from "node-fetch";
import mysql from "mysql2/promise";

export const handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const intent = body?.queryResult?.intent?.displayName || "none";

    // ============================
    // 1. Conexion MySQL (profreehost)
    // ============================
    const conn = await mysql.createConnection({
      host: "sql107.ezyro.com",   // Cambia si tu host es distinto
      user: "ezyro_39974526",
      password: "0d398958b",
      database: "ezyro_39974526_usuarios"
    });

    // ============================
    // 2. INTENT: CUÁNTOS USUARIOS
    // ============================
    if (intent === "usuario_count") {
      const [rows] = await conn.execute(
        "SELECT COUNT(*) AS total FROM usuarios"
      );
      await conn.end();

      return respuesta(`Actualmente hay **${rows[0].total} usuarios** registrados.`);
    }

    // ==========================================================
    // 3. INTENT: USUARIOS POR ÁREA (Ventas, Compras, RH, Conta)
    // ==========================================================
    if (intent === "usuarios_por_area") {
      const [rows] = await conn.execute(`
        SELECT area_interes AS area, COUNT(*) AS total
        FROM usuarios
        GROUP BY area_interes
      `);

      await conn.end();

      if (!rows.length) {
        return respuesta("No hay usuarios registrados por área.");
      }

      let msg = "Usuarios registrados por área:\n\n";
      rows.forEach(r => {
        msg += `• **${r.area}**: ${r.total}\n`;
      });

      return respuesta(msg);
    }

    // ============================
    // 4. INTENT: TOTAL DE OFERTAS
    // ============================
    if (intent === "ofertas_count") {
      const [rows] = await conn.execute(
        "SELECT COUNT(*) AS total FROM ofertas"
      );
      await conn.end();

      return respuesta(`Hay **${rows[0].total} ofertas** creadas.`);
    }

    // ============================
    // INTENT NO RECONOCIDO
    // ============================
    await conn.end();
    return respuesta("No entendí la solicitud del administrador.");

  } catch (e) {
    console.error("Error en webhook:", e);
    return respuesta("Ocurrió un error interno en el webhook.");
  }
};

// ==================================================
// FUNCION FORMATEADORA PARA DIALOGFLOW
// ==================================================
function respuesta(texto) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fulfillmentText: texto
    })
  };
}
