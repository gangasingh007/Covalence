import express from 'express';
import { Request, Response } from 'express';
import { userRegestrationSchema } from 'src/zod/user';
import * as  bcrypt from "bcryptjs"
import prisma from 'src/utils/prisma';
import {Course, Semester, Section} from "@prisma/client";
import jwt from "jsonwebtoken";
import { regestraionSchema } from 'src/types';

const router = express.Router();

router.post("/user/register", async (req: Request, res: Response) => {
  try {
    // zod type checking
    const isAdmin : boolean= false
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

    const existingAdmin = await prisma.admin.findUnique({
        where :{
            email : email
        }
    })

    if (existingUser) {
      return res.status(409).json({ msg: "User with this email already exists" });
    }
    if (existingAdmin) {
      return res.status(409).json({ msg: "User with this email already exists" });
    }

    // password hashing
    const hashPassword = await bcrypt.hash(password, 10);

    // creating the user with initializing the prisma trancaction
    const user = await prisma.$transaction(async (tx) => {
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

      if(!isAdmin){
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
            newUser,
            token : token 
        });
      }
        
      else {
        const newAdmin = await tx.admin.create({
          data: {
            email,
            firstName,
            lastName,
            password: hashPassword,
            classId: classEntity.id,
          },
        });

        
        const token = jwt.sign(newAdmin.id,process.env.JWT_SECRET as string)

        return res.status(200).json({
            newAdmin,
            token : token 
        });
      }

    });

    return res.status(201).json({ msg: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Internal Server Error in the registration block",
    });
  }
});

export default router;