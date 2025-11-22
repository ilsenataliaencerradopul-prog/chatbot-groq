<?php
/**
 * ChatBot Administrativo - Sistema de Bolsa de Trabajo
 * Conexión directa a base de datos MySQL
 */

class AdminChatbot {
    private $conexion;
    
    public function __construct() {
        // CONFIGURACIÓN - ACTUALIZA ESTOS DATOS
        $host = "sql107.byetcluster.com";
        $usuario = "ezyro_39974526"; // TU USUARIO
        $password = "tu_password"; // TU PASSWORD
        $basedatos = "ezyro_39974526_usuarios";
        
        $this->conexion = new mysqli($host, $usuario, $password, $basedatos);
        
        if ($this->conexion->connect_error) {
            die("Error de conexión: " . $this->conexion->connect_error);
        }
    }
    
    /**
     * 📊 Obtener estadísticas en tiempo real
     */
    public function getEstadisticas() {
        $response = "📊 **ESTADÍSTICAS EN TIEMPO REAL:**\n\n";
        
        // Total usuarios
        $query = "SELECT COUNT(*) as total FROM usuarios";
        $result = $this->conexion->query($query);
        $total_usuarios = $result->fetch_assoc()['total'];
        $response .= "• 👥 Usuarios registrados: $total_usuarios\n";
        
        // Usuarios activos
        $query = "SELECT COUNT(*) as activos FROM usuarios WHERE estado = 'Activo'";
        $result = $this->conexion->query($query);
        $usuarios_activos = $result->fetch_assoc()['activos'];
        $response .= "• ✅ Usuarios activos: $usuarios_activos\n";
        
        // Usuarios suspendidos
        $suspendidos = $total_usuarios - $usuarios_activos;
        $response .= "• ❌ Usuarios suspendidos: $suspendidos\n";
        
        // Último usuario
        $query = "SELECT nombre, fecha_registro FROM usuarios ORDER BY fecha_registro DESC LIMIT 1";
        $result = $this->conexion->query($query);
        $ultimo = $result->fetch_assoc();
        $response .= "• 👤 Último registro: {$ultimo['nombre']} - {$ultimo['fecha_registro']}\n";
        
        // Total ofertas
        $query = "SELECT COUNT(*) as total FROM ofertas";
        $result = $this->conexion->query($query);
        $total_ofertas = $result->fetch_assoc()['total'];
        $response .= "• 📋 Ofertas publicadas: $total_ofertas\n";
        
        return $response;
    }
    
    /**
     * 👥 Listar usuarios con filtros
     */
    public function listarUsuarios($filtro = 'todos') {
        switch($filtro) {
            case 'activos':
                $query = "SELECT id, nombre, email, estado, fecha_registro FROM usuarios WHERE estado = 'Activo'";
                break;
            case 'suspendidos':
                $query = "SELECT id, nombre, email, estado, fecha_registro FROM usuarios WHERE estado = 'Suspendido'";
                break;
            default:
                $query = "SELECT id, nombre, email, estado, fecha_registro FROM usuarios";
        }
        
        $result = $this->conexion->query($query);
        $response = "👥 **LISTA DE USUARIOS ($filtro):**\n\n";
        
        while($usuario = $result->fetch_assoc()) {
            $estado_emoji = $usuario['estado'] == 'Activo' ? '✅' : '❌';
            $response .= "• {$estado_emoji} **{$usuario['nombre']}** (ID: {$usuario['id']})\n";
            $response .= "  📧 {$usuario['email']}\n";
            $response .= "  📅 {$usuario['fecha_registro']}\n\n";
        }
        
        return $response;
    }
    
    /**
     * ⚡ Suspender/Activar usuario
     */
    public function cambiarEstadoUsuario($usuario_id, $accion) {
        $nuevo_estado = $accion == 'suspender' ? 'Suspendido' : 'Activo';
        
        $query = "UPDATE usuarios SET estado = ? WHERE id = ?";
        $stmt = $this->conexion->prepare($query);
        $stmt->bind_param("si", $nuevo_estado, $usuario_id);
        
        if($stmt->execute()) {
            $this->registrarLog("Cambio estado usuario_id=$usuario_id a $nuevo_estado");
            return "✅ Usuario ID $usuario_id ahora está $nuevo_estado";
        } else {
            return "❌ Error al cambiar estado";
        }
    }
    
    /**
     * 🗑️ Eliminar usuario
     */
    public function eliminarUsuario($usuario_id) {
        // Eliminar dependencias primero
        $this->conexion->query("DELETE FROM postulaciones WHERE id_usuario = $usuario_id");
        $this->conexion->query("DELETE FROM cvs WHERE usuario_id = $usuario_id");
        
        $query = "DELETE FROM usuarios WHERE id = ?";
        $stmt = $this->conexion->prepare($query);
        $stmt->bind_param("i", $usuario_id);
        
        if($stmt->execute()) {
            $this->registrarLog("Eliminación usuario_id=$usuario_id");
            return "✅ Usuario ID $usuario_id eliminado";
        } else {
            return "❌ Error al eliminar usuario";
        }
    }
    
    /**
     * 📋 Listar ofertas de trabajo
     */
    public function listarOfertas() {
        $query = "SELECT id, titulo, descripcion, estado FROM ofertas";
        $result = $this->conexion->query($query);
        
        $response = "📋 **LISTA DE OFERTAS:**\n\n";
        
        while($oferta = $result->fetch_assoc()) {
            $estado_emoji = $oferta['estado'] == 'Disponible' ? '🟢' : '🔴';
            $response .= "• {$estado_emoji} **{$oferta['titulo']}** (ID: {$oferta['id']})\n";
            $response .= "  📝 {$oferta['descripcion']}\n\n";
        }
        
        return $response;
    }
    
    /**
     * ➕ Crear nueva oferta
     */
    public function crearOferta($titulo, $descripcion) {
        $query = "INSERT INTO ofertas (titulo, descripcion, estado) VALUES (?, ?, 'Disponible')";
        $stmt = $this->conexion->prepare($query);
        $stmt->bind_param("ss", $titulo, $descripcion);
        
        if($stmt->execute()) {
            $this->registrarLog("Nueva oferta: $titulo");
            return "✅ Oferta '$titulo' creada correctamente";
        } else {
            return "❌ Error al crear oferta";
        }
    }
    
    /**
     * 🗑️ Eliminar oferta
     */
    public function eliminarOferta($oferta_id) {
        // Eliminar postulaciones primero
        $this->conexion->query("DELETE FROM postulaciones WHERE id_oferta = $oferta_id");
        
        $query = "DELETE FROM ofertas WHERE id = ?";
        $stmt = $this->conexion->prepare($query);
        $stmt->bind_param("i", $oferta_id);
        
        if($stmt->execute()) {
            $this->registrarLog("Eliminación oferta_id=$oferta_id");
            return "✅ Oferta ID $oferta_id eliminada";
        } else {
            return "❌ Error al eliminar oferta";
        }
    }
    
    /**
     * 📝 Registrar en logs
     */
    private function registrarLog($accion) {
        $admin_email = "chatbot@system.com";
        $query = "INSERT INTO admin_logs (admin_email, accion, detalles) VALUES (?, ?, ?)";
        $stmt = $this->conexion->prepare($query);
        $stmt->bind_param("sss", $admin_email, $accion, $accion);
        $stmt->execute();
    }
}

/**
 * 🎯 PROCESAR COMANDOS DEL CHATBOT
 */
function procesarComando($mensaje) {
    $chatbot = new AdminChatbot();
    
    // Convertir mensaje a minúsculas para mejor matching
    $mensaje = strtolower(trim($mensaje));
    
    // 📊 ESTADÍSTICAS
    if (strpos($mensaje, 'estadisticas') !== false || strpos($mensaje, 'estadísticas') !== false) {
        return $chatbot->getEstadisticas();
    }
    
    // 👥 LISTAR USUARIOS
    if (strpos($mensaje, 'listar usuarios') !== false) {
        if (strpos($mensaje, 'activos') !== false) return $chatbot->listarUsuarios('activos');
        if (strpos($mensaje, 'suspendidos') !== false) return $chatbot->listarUsuarios('suspendidos');
        return $chatbot->listarUsuarios('todos');
    }
    
    // ⚡ SUSPENDER USUARIO
    if (preg_match('/suspender usuario (\d+)/', $mensaje, $matches)) {
        return $chatbot->cambiarEstadoUsuario($matches[1], 'suspender');
    }
    
    // ✅ ACTIVAR USUARIO
    if (preg_match('/activar usuario (\d+)/', $mensaje, $matches)) {
        return $chatbot->cambiarEstadoUsuario($matches[1], 'activar');
    }
    
    // 🗑️ ELIMINAR USUARIO
    if (preg_match('/eliminar usuario (\d+)/', $mensaje, $matches)) {
        return $chatbot->eliminarUsuario($matches[1]);
    }
    
    // 📋 LISTAR OFERTAS
    if (strpos($mensaje, 'listar ofertas') !== false) {
        return $chatbot->listarOfertas();
    }
    
    // ➕ CREAR OFERTA
    if (preg_match('/crear oferta "([^"]+)" "([^"]+)"/', $mensaje, $matches)) {
        return $chatbot->crearOferta($matches[1], $matches[2]);
    }
    
    // 🗑️ ELIMINAR OFERTA
    if (preg_match('/eliminar oferta (\d+)/', $mensaje, $matches)) {
        return $chatbot->eliminarOferta($matches[1]);
    }
    
    // 🆘 AYUDA
    return obtenerMenuAyuda();
}

/**
 * 📖 MENÚ DE AYUDA
 */
function obtenerMenuAyuda() {
    return "
🤖 **CHATBOT ADMINISTRATIVO - COMANDOS DISPONIBLES**

📊 **ESTADÍSTICAS:**
• \"estadisticas\" - Ver estadísticas en tiempo real

👥 **GESTIÓN DE USUARIOS:**
• \"listar usuarios\" - Todos los usuarios
• \"listar usuarios activos\" - Solo activos
• \"listar usuarios suspendidos\" - Solo suspendidos
• \"suspender usuario 5\" - Suspender usuario ID 5
• \"activar usuario 3\" - Activar usuario ID 3
• \"eliminar usuario 2\" - Eliminar usuario ID 2

📋 **GESTIÓN DE OFERTAS:**
• \"listar ofertas\" - Todas las ofertas
• \"crear oferta \\\"Título\\\" \\\"Descripción\\\"\" - Nueva oferta
• \"eliminar oferta 10\" - Eliminar oferta ID 10

💡 **Ejemplos:**
• \"estadisticas\"
• \"suspender usuario 5\"
• \"crear oferta \\\"Desarrollador Web\\\" \\\"Buscar desarrollador con experiencia en PHP\\\"\"
    ";
}

// 🚀 EJEMPLO DE USO
// echo procesarComando("estadisticas");
// echo procesarComando("listar usuarios activos");
// echo procesarComando("suspender usuario 3");
?>
