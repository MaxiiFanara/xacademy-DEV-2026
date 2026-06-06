import ClubRepository from '../repositories/club.repository.js';
import ClubService from '../services/club.service.js';
import ClubController from '../controllers/club.controller.js';

const clubRepository = new ClubRepository();
const clubService = new ClubService(clubRepository);
const clubController = new ClubController(clubService);

export default clubController;