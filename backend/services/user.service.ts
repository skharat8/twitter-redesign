import { type FilterQuery, type UpdateQuery } from "mongoose";
import createHttpError from "http-errors";
import util from "node:util";
import UserModel from "../models/user.model";
import type { UserSignup, SafeDbUser } from "../schemas/user.zod";
import StatusCode from "../data/enums";
import logger from "../utils/logger";

type PasswordValidationResult =
  | { valid: true; data: SafeDbUser }
  | { valid: false; error: string };

async function createUser(userData: UserSignup): Promise<SafeDbUser> {
  const user = await UserModel.create(userData);
  return user.toJSON();
}

async function validatePassword(
  email: string,
  password: string,
): Promise<PasswordValidationResult> {
  const errorMessage = "Invalid username or password";
  const user = await UserModel.findOne({ email });
  if (!user) return { valid: false, error: errorMessage };

  const isValid = await user.isValidPassword(password);
  if (!isValid) return { valid: false, error: errorMessage };

  return { valid: true, data: user.toJSON() };
}

async function findUser(query: FilterQuery<SafeDbUser>): Promise<SafeDbUser> {
  const user = await UserModel.findOne(query);

  if (!user) {
    const errorMessage = `User ${util.inspect(query)} not found`;
    throw createHttpError(StatusCode.NOT_FOUND, errorMessage);
  }

  return user.toJSON();
}

async function findByIdAndUpdateUser(
  id: string,
  update: UpdateQuery<SafeDbUser>,
): Promise<SafeDbUser> {
  const user = await UserModel.findByIdAndUpdate(id, update, { new: true });

  if (!user) {
    throw createHttpError(StatusCode.NOT_FOUND, "Updating user data failed");
  }

  return user.toJSON();
}

async function updateUserById(id: string, update: UpdateQuery<SafeDbUser>) {
  const res = await UserModel.updateOne({ _id: id }, update);

  if (res.modifiedCount === 0) {
    logger.warn(
      `No item was modified by updateOne call with query ${util.inspect(update)}`,
    );
  }
}

async function toggleFollowUser(
  currentUser: SafeDbUser,
  targetUser: SafeDbUser,
) {
  // Check if the current user is already following the target user.
  const isFollowing = currentUser.following
    .map((userId) => userId.toString())
    .includes(targetUser.id);

  if (isFollowing) {
    // Unfollow the target user
    await updateUserById(currentUser.id, {
      $pull: { following: targetUser.id },
    });
    await updateUserById(targetUser.id, {
      $pull: { followers: currentUser.id },
    });
  } else {
    // Follow the target user
    await updateUserById(currentUser.id, {
      $addToSet: { following: targetUser.id },
    });
    await updateUserById(targetUser.id, {
      $addToSet: { followers: currentUser.id },
    });
  }
}

export {
  createUser,
  validatePassword,
  findUser,
  findByIdAndUpdateUser,
  updateUserById,
  toggleFollowUser,
};
