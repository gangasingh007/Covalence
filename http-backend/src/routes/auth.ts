import express from 'express';
import { Request, Response } from 'express';
import { userRegestrationSchema } from 'src/types/user';
import * as  bcrypt from "bcryptjs"
import prisma from 'src/utils/prisma';

const router = express.Router();

interface regestartionSchma {
    firstName : string
    lastName : string
    email : string,
    password : string,
    course : string,
    semester : string,
    section : string
}

router.post("/register",async(req:Request , res:Response)=>{
    try {
    const isAdmin : boolean = false ;   
     // type checking of the user inputs during the regestration   
    const payload = req.body as regestartionSchma;

    if(!payload){
        return res.status(403).json({
            msg : "Type Error in the User fields"
        })
    }
    const {email,firstName ,lastName,password,semester,section,course} = req.body as regestartionSchma;

    if(!email || !firstName || !lastName || !password || semester || section || course){
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
    const id =  "12334"
    const hashPassword = await bcrypt.hash(password,10);


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