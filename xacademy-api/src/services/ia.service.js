import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

class IAService {
  async analyzePlayer(jugador, trayectoria) {
    const resumen = trayectoria.map(row =>
      `${row.AnioJuego} (${row.Juego}) - ${row.Skill}: ${row.ValorSkill}`
    ).join('\n');

    const prompt = `
Eres un analista de datos de fútbol profesional. Analiza la evolución de habilidades del siguiente jugador a lo largo del tiempo:

Jugador: ${jugador.Nombre} ${jugador.Apellido}

Historial de habilidades:
${resumen}

Devuelve un párrafo resumen en español que detalle cómo varían las habilidades del jugador a lo largo del tiempo. 
Menciona picos de rendimiento, declives y transiciones importantes. 
Por ejemplo: "A partir de 2019 se nota una baja en su aceleración, compensada por una mejora en la visión de juego".
Sé específico con los años y los valores. No uses listas, solo un párrafo fluido y natural.`;

    const response = await ollama.chat({
      model: 'gemma3',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.message.content;
  }
}

export default IAService;