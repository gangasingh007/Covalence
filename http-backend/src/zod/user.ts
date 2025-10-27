import { z } from "zod";

export const userRegestrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  course: z.enum(["Btech", "Mtech"]),
  semester: z.enum([
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
  ]),
  section: z.enum(["A", "B", "C", "D", "CE"]),
});
  

export const userLoginSchema = z.object({
    email : z.email("The email format is wrong"),
    password : z.string().min(6, "The password should be at least 6 characters long"),
})
