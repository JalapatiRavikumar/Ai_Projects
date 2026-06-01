import  jwt  from 'jsonwebtoken';
import { config } from '../config/config.js';

const authMiddleware = async (req, res, next) =>{
    const {token} = req.headers;
    if(!token){
        return res.json({success:false, message:'Not Authorized, login again'})
    }

    try {
        const token_decode = jwt.verify(token, config.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Error'})
    }
}

export default authMiddleware;