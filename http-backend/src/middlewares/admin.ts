import { Request, Response, NextFunction } from 'express';


const adminMiddleware = (req : Request, res : Response, next : NextFunction) => {
    const { role  } : any= req.user;
    if (role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied' });
    }
  };
  
  export default adminMiddleware;