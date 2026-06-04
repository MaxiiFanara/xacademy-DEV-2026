class IAController {
  constructor(jugadorService, iaService) {
    this.jugadorService = jugadorService;
    this.iaService = iaService;
  }

  analyzePlayer = async (req, res) => {
    try {
      const { id } = req.params;
      const { IdJugador } = await this.jugadorService.getIdJugador(id);
      const trayectoria = await this.jugadorService.getTrajectory(IdJugador);
      if (!trayectoria || trayectoria.length === 0) {
        return res.status(404).json({ error: 'No se encontró trayectoria para este jugador' });
      }

      const jugador = { Nombre: trayectoria[0].Nombre, Apellido: trayectoria[0].Apellido };
      const analisis = await this.iaService.analyzePlayer(jugador, trayectoria);

      res.status(200).json({ analisis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default IAController;
