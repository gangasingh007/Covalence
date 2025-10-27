import zod from "zod";

// Zod type shchema checking

export const userRegestrationSchema = zod.object({
    firstName : zod.string().min(3, "The first Name is too short"),
    lastName : zod.string().min(3, "The last Name is too short"),
    email : zod.email("The email format is wrong"),
    password : zod.string().min(6, "The password should be at least 6 characters long"),
})    

export const userLoginSchema = zod.object({
    email : zod.email("The email format is wrong"),
    password : zod.string().min(6, "The password should be at least 6 characters long"),
})
