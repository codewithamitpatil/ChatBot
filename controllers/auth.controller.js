
const httpErrors       = require('http-errors');
const nodemailer       = require('nodemailer');
const otp              = require('in-memory-otp');

// includes
const AuthValidations  = require('../validations/auth.validation');
const UserModel        = require('../models/user.model'); 
const AdminModel       = require('../models/admin.model');
const redisClient      = require('../config/init_redis');
const jwtToken         = require('../helpers/jwt.helpers'); 
const mailtrap         = require('../middlewares/emailsender.middleware');
const otptem           = require('../middlewares/otptemp.middleware'); 

module.exports = {

//  Login Middleware (Admin)   
    Admin_Login:async(req,res,next)=>
    {

    const result = await AuthValidations.Login.validateAsync(req.body).
                  catch((err)=>
                  {
                    throw new httpErrors.BadRequest('All fields are required');
                  });
   
    const uid          = await AdminModel.Authentication(result);
 
    const AccessToken  = await jwtToken.SignAccessToken(uid); 

    const RefreshToken = await jwtToken.SignRefreshToken(uid); 

    res.send({ AccessToken , RefreshToken });

    return ;

    }
,

//  Reset Password Middleware (Admin) 
    Admin_Reset_Password:async(req,res,next)=>{
     
      
      const uid =req.payload.aud;

      const result = await AuthValidations.Change_Password.
                            validateAsync(req.body);

      const data = { 
                     id:uid,
                     password:result.OldPassword ,
                     newpassword:result.NewPassword 
                   };
      
      const HashPass = await AdminModel.OldPassWordCheck(data);
     
      if(HashPass)
      {
        const UpdatePass = await AdminModel.findOneAndUpdate({_id:data.id},{password:HashPass});
        res.json({status:'200',msg:'Password Updated Successfully'});
      }


      return;
    }  
,

//  Signup Middleware (User)   
    User_Signup:async(req,res,next)=>{

    const result = await AuthValidations.Signup.validateAsync(req.body);

    // duplicate email check
    const doesEmailExist = await UserModel.findOne({email:result.email});
                      
    if(doesEmailExist)
    {
     return next(new httpErrors.Conflict(`Email : ${result.email} is already exist .plz try another email`));
    }

   // duplicate username check 
   const doesUsernameExist = await UserModel.findOne({username:result.username});
                            
    if(doesUsernameExist)
    {
      return next(new httpErrors.Conflict(`Username : ${result.username} is already exist .plz try another username`));
    }    

    const user         = new   UserModel(result);
    const savedUser    = await user.save();                     

  
   otp.startOTPTimer(new Date().getTime());

   const userOTP = otp.generateOTP(result.email, 5);

   mailtrap.SendMail(result.email,userOTP );

     
   res.status(200).json({"status":200,"msg":"Your Account created successfully.Please Verify Email To Activate your acount ","email":result.email});
       
    return ;

    }
,

//  Login Middleware (User)  
    User_Login:async(req,res,next)=>
    {



    const result = await AuthValidations.Login.validateAsync(req.body).
                         catch((err)=>
                         {
                           throw new httpErrors.BadRequest('All fields are required');
                         });
   
    const uid = await UserModel.Authentication(result);    

   
    const AccessToken  = await jwtToken.SignAccessToken(uid); 

    const RefreshToken = await jwtToken.SignRefreshToken(uid); 
                 
    res.send({ AccessToken , RefreshToken });
    
    return ;
      
    }
,

//  Reset Password Middleware (User) 
    User_Reset_Password:async(req,res,next)=>{
     
      
      const uid =req.payload.aud;

      const result = await AuthValidations.Change_Password.
                            validateAsync(req.body);

      const data = { 
                     id:uid,
                     password:result.OldPassword ,
                     newpassword:result.NewPassword 
                   };
      
      const HashPass = await UserModel.OldPassWordCheck(data);
     
      if(HashPass)
      {
        const UpdatePass = await UserModel.findOneAndUpdate({_id:data.id},{password:HashPass});
        res.json({status:'200',msg:'Password Updated Successfully'});
      }
      return;
      
    }    
,

//  Delete Account Middleware (User) 
    User_Delete_Account:async(req,res,next)=>{
      
      const uid = req.payload.aud;
      const temp = await UserModel.findOneAndDelete({_id:uid});
      res.json({'status':'200','msg':'Account Deleted Successfully'});
      return;
    }
,
//  Logout Middleware (User/Admin) 
    Logout:async(req,res,next)=>
    {
        const result = await AuthValidations.Refresh_Token.validateAsync(req.body);

        const uid = await jwtToken.VerifyRefreshToken(result.RefreshToken);                     
        console.log('amit is = ');
        console.log(uid);
        
        redisClient.del(uid,(err,replay)=>{
            if(err)
            {
            //  return next(new httpErrors.Unauthorized());
            }
            
        });
        
     return   res.send({
                  'status':200,
                  'msg':'user logged out successfully'
                });
        
    }
,

//  Refresh-Token Middleware (User/Admin) 
    Refresh_Token:async(req,res,next)=>
  {
    
    const result = await AuthValidations.Refresh_Token.validateAsync(req.body);
              
    const uid   = await jwtToken.VerifyRefreshToken(result.RefreshToken);                     
    
    const data =  {
                    _id:uid.aud ,
                    username :uid.username,
                    email:uid.email
                  };


    const AccessToken  = await jwtToken.SignAccessToken(data); 
    const RefreshToken = await jwtToken.SignRefreshToken(data); 
      
    res.send({ AccessToken , RefreshToken });
    
    return ;

    }
,

//  Admin Forgot Password Middleware
    Admin_Forgot_Password:async(req,res,next)=>{


    const result = await AuthValidations.ForgotPass.validateAsync(req.body);  

    const doesEmailExist = await AdminModel.findOne({email:result.email});
              
    if(!doesEmailExist)
    {
    return next(new httpErrors.Unauthorized(`SORRY WE DID NOT FIND AN ACCOUNT WITH ${result.email} THIS  EMAIL ADDRESS"`));
    }


    otp.startOTPTimer(new Date().getTime());

    const userOTP = otp.generateOTP(result.email, 5);

    const mail = await mailtrap.SendMail(result.email,userOTP );


    res.json({"status":200,"msg":"Check Your Email For The OTP ","email":result.email});


    }
,

//  User Forgot Password Middleware
    User_Forgot_Password:async(req,res,next)=>{


    const result = await AuthValidations.ForgotPass.validateAsync(req.body);  

    const doesEmailExist = await UserModel.findOne({email:result.email});
              
    if(!doesEmailExist)
    {
    return next(new httpErrors.Unauthorized(`SORRY WE DID NOT FIND AN ACCOUNT WITH ${result.email} THIS  EMAIL ADDRESS"`));
    }


    otp.startOTPTimer(new Date().getTime());

    const userOTP = otp.generateOTP(result.email, 5);

    const mail = await mailtrap.SendMail(result.email,userOTP );


    res.json({"status":200,"msg":"Check Your Email For The OTP ","email":result.email});


    }
,


//  Admin New Password Middleware 
    Admin_New_Password:async(req,res,next)=>{
        
          
      const uid =req.payload.aud;

      const result = await AuthValidations.NewPass.
                            validateAsync(req.body);

      const HashPass = await UserModel.HashPass(result.newpass);

      if(true)
      {
      
        const UpdatePass = await AdminModel.findOneAndUpdate({_id:uid},{password:HashPass});
        
        console.log(UpdatePass);

      }
      return res.status(200).json({'status':200,'msg':'Your Password Changed SuccessFully.Now You Can Login With New Password'});
      
    }  
,

//  User New Password Middleware
    User_New_Password:async(req,res,next)=>{
     
      
      const uid =req.payload.aud;

      const result = await AuthValidations.NewPass.
                            validateAsync(req.body);

      const HashPass = await UserModel.HashPass(result.newpass);

      if(true)
      {
      
        const UpdatePass = await UserModel.findOneAndUpdate({_id:uid},{password:HashPass});
        
        console.log(UpdatePass);
    
      }
      return res.status(200).json({'status':200,'msg':'Your Password Changed SuccessFully.Now You Can Login With New Password'});
      
    }  
,

//  Admin Verify Otp Middleware 
    Admin_Verify_Otp:async(req,res,next)=>{

    const result    = await AuthValidations.VerifyOtp.validateAsync(req.body);  
   
 
    const Otpresult = otp.validateOTP(result.email, result.otp);
    
    if(Otpresult)
    {
      const UpdateStaus = await AdminModel.findOne({email:result.email});
      const AccessToken  = await jwtToken.SignAccessToken(UpdateStaus); 

      const RefreshToken = await jwtToken.SignRefreshToken(UpdateStaus); 


      return res.json( {'status':200,'msg':'Otp Verified Successfully',AccessToken,RefreshToken});
     
    }else
    {
      return next(new httpErrors.Unauthorized(`The OTP You Entered Is Invalid .Plz Enter The Correct Otp`));
   
    }

  
  
  

    }
    
,

//  User Verify Otp Middleware 
    User_Verify_Otp:async(req,res,next)=>{

    const result    = await AuthValidations.VerifyOtp.validateAsync(req.body);  


    const Otpresult = otp.validateOTP(result.email, result.otp);

    if(Otpresult)
    {
    const UpdateStaus = await UserModel.findOneAndUpdate({email:result.email},{account:'verified'},{new:true});
    const AccessToken  = await jwtToken.SignAccessToken(UpdateStaus); 

    const RefreshToken = await jwtToken.SignRefreshToken(UpdateStaus); 


    return res.json( {'status':200,'msg':'Your Account Has Been Verified Successfully',AccessToken,RefreshToken});

    }else
    {
    return next(new httpErrors.Unauthorized(`The OTP You Entered Is Invalid .Plz Enter The Correct Otp`));

    }





    }    
    
}




















