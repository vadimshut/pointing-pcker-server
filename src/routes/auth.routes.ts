import Router from 'express';
import {check} from 'express-validator';
import AuthController from '../controllers/authControllers';


const multer  = require('multer')
var loader = multer({ dest: 'tmp/' })

const authRouter = Router();
const cpUpload = loader.fields([{ name: 'addAvatar', maxCount: 1 }]);


//api/auth
authRouter.post(
    '/login', 
    cpUpload,
    AuthController.login
);

export default authRouter;