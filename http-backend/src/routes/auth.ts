import express from 'express';
import { Request, Response } from 'express';
import * as  bcrypt from "bcryptjs"
import {Course, Semester, Section} from "@prisma/client";
import jwt from "jsonwebtoken";
import { loginSchema, regestraionSchema } from '../types';
import prisma  from '../utils/prisma';
import { userLoginSchema, userRegestrationSchema } from '../zod/user';
import { adminRegestrationSchema } from '../zod/admin';
import { adminDetails } from '../data';
import authMiddleware from '../middlewares/auth';

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

      const token = jwt.sign(newUser.id,process.env.JWT_SECRET as string,{expiresIn : "30d"})

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

      const token = jwt.sign(newAdmin.id,process.env.JWT_SECRET as string,{expiresIn : "30d"} )

      return res.status(200).json({
            firstName : newAdmin.firstName,
            lastName : newAdmin.lastName,
            email : newAdmin.email,
            course : classEntity.course,
            semester : classEntity.semester,
            section : classEntity.section,
            profileImage : newAdmin.profileImage,
            token : token,
             
        });
    });
})

router.post("/login",async(req : Request ,res : Response)=>{
  try {
    const payload = req.body as loginSchema;

    const parsedPayload = userLoginSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return res.status(400).json({
        msg: "Type Error in the User fields",
        errors: parsedPayload.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsedPayload.data;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { class: true },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET as string,{expiresIn : "30d"});
        return res.status(200).json({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          course: user.class.course,
          section: user.class.section,
          semester: user.class.semester,
          profileImage: user.profileImage,
          token,
        });
      }
    }

    // If not a user, check if it's an admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (isPasswordValid) {
        const adminClass = await prisma.class.findUnique({
          where: { id: admin.classId },
        });

        if (!adminClass) {
          return res.status(404).json({ msg: "Admin class not found" });
        }

        const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET as string,{expiresIn:"30d"});
        return res.status(200).json({
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          course: adminClass.course,
          semester: adminClass.semester,
          section: adminClass.section,
          token,
        });
      }
    }

    // If neither user nor admin, or if password was wrong
    return res.status(401).json({ msg: "Invalid email or password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error in the login block" });
  }
})

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, role } = req.user as { id: string; role: string };

    if (role === 'user') {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { class: true },
      });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      return res.status(200).json({
        role: 'user',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        course: user.class.course,
        semester: user.class.semester,
        section: user.class.section,
        profileImage: user.profileImage,
      });
    } else if (role === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id } });
      if (!admin) {
        return res.status(404).json({ msg: "Admin not found" });
      }
      const adminClass = await prisma.class.findUnique({ where: { id: admin.classId } });

      return res.status(200).json({
        role: 'admin',
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        course: adminClass?.course,
        semester: adminClass?.semester,
        section: adminClass?.section,
        profileImage: admin.profileImage,
      });
    } else {
      return res.status(403).json({ msg: "Invalid role" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error in the me block" });
  }
})

export default router;