const { createClient } = require("@supabase/supabase-js");
const { createClient: createRealtimeClient } = require("@supabase/realtime-js");

// Configuración del cliente de Supabase
const supabaseUrl = "https://patuzkpzaxwsemhdnjmc.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhdHV6a3B6YXh3c2VtaGRuam1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUwMTI1NTIsImV4cCI6MjAyMDU4ODU1Mn0.9g4LLrPpAmVqK1vi4rEi6OJ1oYaAJ_84jicvjzC-0gA";
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración del cliente de Supabase Realtime
const realtime = createRealtimeClient(supabaseUrl, supabaseKey);

// Nombre de la tabla que quieres observar
const tableName = "Rooms";

// Configuración de la suscripción en tiempo real
const subscription = realtime
    .from(tableName)
    .on("INSERT", (payload) => {
        // Ejecutar tu método cuando se inserta una fila
        const newRow = payload.new;
        ejecutarMetodo(newRow);
    })
    .subscribe();

// Función para ejecutar tu método
function ejecutarMetodo(row) {
    // Aquí puedes realizar acciones específicas con la fila recién insertada
    console.log("Nueva fila insertada:", row);
}

// Maneja eventos de desconexión
subscription.onClose(() => {
    console.log("Desconexión de Supabase Realtime");
});

// Cierre adecuado de la aplicación
process.on("SIGINT", async () => {
    await subscription.unsubscribe();
    process.exit();
});
