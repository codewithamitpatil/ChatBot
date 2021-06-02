
const express = require('express');
const router  = express.Router();

// includes 
 
   const asyncHandler    = require('../middlewares/async.middleware');
   const teamController  = require('../controllers/team.controller');
// get all teams
   router.get('/teams',asyncHandler(teamController.GetAllTeams));

// get single team
   router.get('/team',asyncHandler(teamController.GetTeamById));

// create team
   router.post('/team',asyncHandler(teamController.CreateTeam));

// update team
   router.post('/team/:id',asyncHandler(teamController.UpdateTeam));   

// delete team    
   router.delete('/team/:id',asyncHandler(teamController.DeleteTeam));   

// export router
   module.exports = router;   