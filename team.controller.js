
const HttpErrors = require('http-errors');

// includes
   const TeamValidations = require('../validations/team.validation'); 
   const TeamModel       = require('../models/demo.model');


module.exports =
{

// get all teams    
GetAllTeams:async(req,res,next)=>{

  res.send('hi');

}
,

// get team by service id
GetTeamById:async(req,res,next)=>{
 

  const result = await  TeamValidations.FetchByServiceId.validateAsync(req.body).
                         catch((err)=>{ next(new HttpErrors.BadRequest('The browser (or proxy) sent a request that this server could not understand.')); });
  
  const temp = await TeamModel.find({ "sub_service_id" :result.subservice_id ,"service_id":result.service_id });                       
console.log(temp);
  res.send(temp);

}
,

// create team 
CreateTeam:async(req,res,next)=>{

    const result = await  TeamValidations.CreateTeam.validateAsync(req.body);
                         
    
    const temp = new TeamModel(result);
    const SavedTeam = await temp.save();

res.status(200).send({
"banner id":SavedTeam.banner_id,
"decription": SavedTeam.decription,
"image": SavedTeam.image,
"is banner": SavedTeam.is_banner,
"service id": SavedTeam.service_id,
"sub service id": SavedTeam.sub_service_id,
"temp":`<img src='${SavedTeam.image}' width='200px'/>`
});


}
,

// update team
UpdateTeam:async(req,res,next)=>{


}
,

// delete team
DeleteTeam:async(req,res,next)=>{


}


};

















