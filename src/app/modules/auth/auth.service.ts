import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { Secret } from "jsonwebtoken";
import { jwtHelper } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import config from "../../../config";

const register = async (payload: { email: string; password: string; fullName: string }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email!"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_round) || 10
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash: hashedPassword,
      fullName: payload?.fullName,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const login = async (payload: { email: string; password: string }) => {
  // Find user
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  // Verify password
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect!");
  }

  // Generate tokens
  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role, userId: user.id },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in || "1h"
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role, userId: user.id },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in || "90d"
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      status: user.status,
    },
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelper.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token!");
  }

  // Verify user still exists and is active
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
    },
  });

  // Generate new access token
  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
      userId: userData.id,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in || "1h"
  );

  return {
    accessToken,
  };
};

const getMe = async (user: { email: string; userId: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      profileImage: true,
      bio: true,
      location: true,
      interests: true,
      visitedCountries: true,
      isVerified: true,
      status: true,
      role: true,
      createdAt: true,
    },
  });

  return userData;
};

export const AuthService = {
  register,
  login,
  refreshToken,
  getMe,
};
