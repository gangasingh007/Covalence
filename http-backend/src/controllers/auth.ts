import { Request,Response } from "express";

export const register = (req : Request, res : Response) => {
    // Registration logic here
    res.status(201).send({ message: "User registered successfully" });
}