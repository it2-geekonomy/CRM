import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

export const multerProjectStorage = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const projectId = req.params.id;
            const uploadPath = `./uploads/projects/${projectId}`;

            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuid()}${extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    }),

    limits: {
        fileSize: 10 * 1024 * 1024, 
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|pdf|docx)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    },
};