import { Request, Response } from 'express';
import { ROOMS_DATA } from '../globalConstants';
import IUser from '../interfaces/IUser';
const { v4: uuidv4 } = require('uuid');

const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;
const config = require ('config');

cloudinary.config({
    cloud_name: config.get('cloudName'),
    api_key: config.get('cloudinaryApiKey'),
    api_secret: config.get('cloudinaryApiSecretKey')
});


class AuthControlleres{  
    async login(req: any, res: Response) {        
        let image = '';  
        if (Object.keys(req.files).length !== 0) {
            const imgFile = `tmp/${req.files.addAvatar[0].originalname}`;
            fs.rename(req.files.addAvatar[0].path, imgFile);
            try {
                const img = await cloudinary.uploader.upload(imgFile, { folder: 'new-img', resource_type: "auto"});
                image = img.url 
                fs.unlink(imgFile);
            } catch (error) {
                console.log(error); 
                res.status(500).json({message: 'Что-то пошло не так. Попробуйте снова'});
            }
        }
        
        const createId = () => {
            return uuidv4()
        }
        
        const createRoomId = (isAdmin: string, isPlayer: string, request: any): string => {
            let id: string = ''
            if (isAdmin === 'true') id = uuidv4()
            if (isPlayer === 'true') id = request.body.roomId
            return id
        }
       
        const createNewUser = (request: any): IUser => {
            const roomId = createRoomId(request.body.isAdmin, request.body.isPlayer, request)
            const user: IUser = {
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                jobPossition: request.body.jobPossition,
                image: image,
                isAdmin: request.body.isAdmin === 'true' ? true : false,
                isObserver: request.body.isObserver === 'true' ? true : false,
                isPlayer: request.body.isPlayer === 'true' ? true : false,
                userId: createId(),
                roomId: roomId,
                authentification: true
            }
            return user
        }

        
        const user = createNewUser(req)
        if (user.isAdmin) {
            ROOMS_DATA[user.roomId] = {members: []}
            ROOMS_DATA[user.roomId].members.push(user)
        }

        if (user.isPlayer) {
            if(!Object.keys(ROOMS_DATA).includes(user.roomId)) res.status(500).json({message: 'Entered ID does not exist'});
            ROOMS_DATA[user.roomId].members.push(user)
        }

        console.log('ROOMS: ', ROOMS_DATA);
        console.log('Members: ', ROOMS_DATA[user.roomId].members);
        
        res.status(200).json({...user});        
    }
}

export default new AuthControlleres();