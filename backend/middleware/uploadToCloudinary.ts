import type { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

import { assertObjectExists } from "../utils/common.utils";
import {
  isMulterFileArray,
  uploadFile,
  uploadFiles,
  type UploadApiResponseUrl,
} from "../utils/cloudinary.utils";
import type { SafeDbUser } from "../schemas/user.zod";

type UserKey = keyof SafeDbUser;

async function uploadFilesAndAttachUrlsToRequest(
  req: Request<object, object, Record<string, UploadApiResponseUrl>>,
  user: SafeDbUser,
  files: Express.Multer.File[],
) {
  const fieldName = files[0].fieldname as UserKey;
  const imageUrls = user[fieldName] as string | string[];
  const responseUrls = await uploadFiles(files, imageUrls);

  const param = fieldName;
  req.body[param] = responseUrls;

  if (req.body[param]?.length === 1) {
    req.body[param] = req.body[param].at(0);
  }
}

const uploadToCloudinary = asyncHandler(
  async (
    req: Request<object, object, Record<string, UploadApiResponseUrl>>,
    res: Response,
    next: NextFunction,
  ) => {
    // Check if any files are present in the request
    if (!req.file && (!req.files || req.files.length === 0)) return next();

    assertObjectExists(res.locals.user);
    const { user } = res.locals;

    if (req.file) {
      // For multer function: upload.single('field')
      const fieldName = req.file.fieldname as UserKey;
      const imageUrl = user[fieldName] as string;
      const response = await uploadFile(req.file.buffer, imageUrl);

      req.body[fieldName] = response.secure_url;
    } else if (req.files && isMulterFileArray(req.files)) {
      // For multer function: upload.array('field', count)
      await uploadFilesAndAttachUrlsToRequest(req, user, req.files);
    } else if (req.files) {
      // For multer function: upload.fields([{ name: 'field1'}, {name: 'field2'}])
      // req.files is represented as { 'field1': files[], 'field2': files[] }
      for await (const files of Object.values(req.files)) {
        await uploadFilesAndAttachUrlsToRequest(req, user, files);
      }
    }

    return next();
  },
);

export default uploadToCloudinary;
