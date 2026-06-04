import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

class IAService {

  async analyzePlayer(jugador, trayectoria) {
    const resumen = trayectoria
      .map(row => `${row.AnioJuego} (${row.Juego}) - ${row.Skill}: ${row.ValorSkill}`)
      .join('\n');

    const prompt = `Eres un analista de datos de futbol profesional. Analiza la evolucion de habilidades del siguiente jugador a lo largo del tiempo:

Jugador: ${jugador.Nombre} ${jugador.Apellido}

Historial de habilidades:
${resumen}

Devuelve un parrafo resumen en espanol que detalle como varian las habilidades del jugador a lo largo del tiempo.
Menciona picos de rendimiento, declives y transiciones importantes.
Por ejemplo: "A partir de 2019 se nota una baja en su aceleracion, compensada por una mejora en la vision de juego".
Se especifico con los anos y los valores. No uses listas, solo un parrafo fluido y natural.`;

    const response = await ollama.chat({
      model: 'gemma3',
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.7, num_predict: 400 },
    });
    return response.message.content;
  }
}

export default IAService;
