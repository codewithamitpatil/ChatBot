
const mongoose   = require('mongoose');
 
const TeamSchema = mongoose.Schema({

      banner_id :{
          type:Number,
          required:true
      },
      description:{
          type:String,
          trim:true
      },
      image:{
          type:String,
          trim:true
       },
       is_banner:{
           type:Boolean
       },
       service_id:{
           type:Number
       },
       sub_service_id:{
           type:Number
       }    

});


const Team = mongoose.model('team',TeamSchema);

module.exports = Team ;

















