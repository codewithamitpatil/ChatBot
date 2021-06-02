
const joi = require('@hapi/joi');

const CreateTeam =joi.object({

        banner_id:joi.number().optional().allow(null, ''),
        description:joi.string().optional().allow(null, ''),
        image:joi.string().optional().allow(null, ''),
        is_banner:joi.boolean(),
        service_id:joi.number().required().allow(null, ''),
        sub_service_id:joi.number().optional().allow(null, '')
        
});
 

const FetchByServiceId = joi.object({

    subservice_id:joi.number().optional().allow(null, ''),
    service_id:joi.number().required()

}); 

module.exports ={

    CreateTeam,
    FetchByServiceId
}