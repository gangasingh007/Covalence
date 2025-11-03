import express from 'express';
import { Request, Response } from 'express';
import * as  bcrypt from "bcryptjs"
import {Course, Semester, Section} from "@prisma/client";
import jwt from "jsonwebtoken";
import { loginSchema, regestraionSchema } from '../types';
import prisma  from '../utils/prisma';
import { userRegestrationSchema } from '../zod/user';
import { adminRegestrationSchema } from '../zod/admin';
import { adminDetails } from '../data';

const router = express.Router();

router.post("/user/register", async (req: Request, res: Response) => {
  try {
    // zod type checking
    const payload = req.body as regestraionSchema;
    const parsedPayload = userRegestrationSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return res.status(400).json({
        msg: "Type Error in the User fields",
        errors: parsedPayload.error.flatten().fieldErrors,
      });
    }

    const { email, firstName, lastName, password, course, semester, section } = parsedPayload.data;
    
    // finding the existing user
    const existingUser = await prisma.user.findUnique({
      where: { 
        email : email 
    },
    });

    if (existingUser) {
      return res.status(409).json({ msg: "User with this email already exists" });
    }
  
    // password hashing
    const hashPassword = await bcrypt.hash(password, 10);

    // creating the user with initializing the prisma trancaction
    const user : any = await prisma.$transaction(async (tx) => {
      let classEntity = await tx.class.findFirst({
        where: {
          course: course as Course,
          semester: semester as Semester,
          section: section as Section,
        },
      });

      if (!classEntity) {
        classEntity = await tx.class.create({
          data: {
            course: course as Course,
            semester: semester as Semester,
            section: section as Section,
          },
        });
      }

    
      const newUser = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashPassword,
          classId: classEntity.id,
          },
        });

      const token = jwt.sign(newUser.id,process.env.JWT_SECRET as string)

      return res.status(200).json({
            firstName : newUser.firstName,
            lastName : newUser.lastName,
            email : newUser.email,
            course : classEntity.course,
            section : classEntity.section,
            semester : classEntity.semester,
            profileImage : newUser.profileImage,
            token : token 
        });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error in the registration block",
    });
  }
});

router.post("/admin/register",async(req :Request,res : Response)=>{
  const payload = req.body as regestraionSchema;

  // zod type checking
  const parsedPayload = adminRegestrationSchema.safeParse(payload);

   if (!parsedPayload.success) {
      return res.status(400).json({
        msg: "Type Error in the User fields",
        errors: parsedPayload.error.flatten().fieldErrors,
      });
    }

    // destructring the user object
    const {email,firstName,lastName,password,course,semester,section} = parsedPayload.data;

    // finding if the admin exists or not
    const isExisting = await prisma.admin.findUnique(
      {
        where : {
          email : email
        }
      }
    )

    if(isExisting){
      return res.status(403).json({
        msg : "The user already exists"
      })
    }

    // if the email and the password in the data then anly assign the admin role

    const isadmin : boolean = adminDetails.map((admin)=>{
      if(admin.email === email && admin.password === password){
        return true
      }
      else {
        return false
      }
    }
    ).includes(true)
    
    if(!isadmin){
      return res.status(403).json({
        msg : "Not Allowed to be admin"
      })
    }
  
     // password hashing
    const hashPassword = await bcrypt.hash(password, 10);

    // creating the user with initializing the prisma trancaction
    const admin : any = await prisma.$transaction(async (tx) => {
      let classEntity = await tx.class.findFirst({
        where: {
          course: course as Course,
          semester: semester as Semester,
          section: section as Section,
        },
      });

      if (!classEntity) {
        classEntity = await tx.class.create({
          data: {
            course: course as Course,
            semester: semester as Semester,
            section: section as Section,
          },
        });
      }

    
      const newAdmin = await tx.admin.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashPassword,
          classId: classEntity.id,
          },
        });

      const token = jwt.sign(newAdmin.id,process.env.JWT_SECRET as string )

      return res.status(200).json({
            firstName : newAdmin.firstName,
            lastName : newAdmin.lastName,
            email : newAdmin.email,
            course : classEntity.course,
            semester : classEntity.semester,
            section : classEntity.section,
            token : token 
        });
    });
})

router.post("/login",async(req : Request ,res : Response)=>{
  const  payload = req.body as loginSchema;

  
})

export default router;