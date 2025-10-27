import express from 'express';
import { Request, Response } from 'express';
import { userRegestrationSchema } from 'src/types/user';
import prisma from 'src/utils/prisma';

const router = express.Router();

interface regestartionSchma {
    firstName : string,
    lastName : string,
    email : string,
    password : string
}

router.post("/register",async(req:Request , res:Response)=>{
    try {
     // type checking of the user inputs during the regestration   
    const payload = req.body as regestartionSchma;

    if(!payload){
        return res.status(403).json({
            msg : "Type Error in the User fields"
        })
    }
    const {email,firstName,lastName,password} = payload;

    if(!email || !firstName || !lastName || !password){
        return res.status(403).json({
            msg : "Missing felids"
        })
    }

    const parsedPayload = userRegestrationSchema.safeParse(payload);
    
    if(!parsedPayload.success){
        return res.status(403).json({
            msg : "Type Error in the User fields"
        })
    }

    const isExistinguser = await prisma.user.findFirst({
       where : {
        email : email
       }
    })

    if(isExistinguser){
        res.status(404).json({
            msg : "User Already exists"
        })
    }

    } catch (error) {
        res.status(500).json({
            msg : "Internal Server Error in the regestraion block"
        })
        console.log(error)
    }

});


router.post("/login",);
router.put("/update");
router.get("/me");

export default router;