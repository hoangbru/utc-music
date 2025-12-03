import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { successResponse } from "../../utils/helpers.js";
import {
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
} from "../../constants/payment.js";

export const register = async (req, res, next) => {
  try {
    const { userName, email, password, displayName } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { userName }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or userName already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const freeTier = await prisma.subscriptionTier.findFirst({
      where: {
        plan: SUBSCRIPTION_PLAN.FREE,
        isActive: true,
      },
    });

    if (!freeTier) {
      return res.status(500).json({
        success: false,
        error: "FREE tier not found. Please contact support.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          userName,
          email,
          password: hashedPassword,
          displayName: displayName || userName,
          isPremium: false,
          premiumUntil: null,
        },
      });

      const subscription = await tx.userSubscription.create({
        data: {
          userId: user.id,
          tierId: freeTier.id,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          startDate: new Date(),
          endDate: new Date("2099-12-31"),
          autoRenew: false,
        },
      });

      const playlist = await tx.playlist.create({
        data: {
          userId: user.id,
          title: "Bài hát đã thích",
          isFavorite: true,
        },
      });

      return { user, subscription, playlist };
    });

    // =========================================================================
    // FEATURE DISABLED
    // =========================================================================
    // TODO: Re-enable email verification feature.
    // Generate verification code
    // const verificationCode = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // await prisma.emailVerification.create({
    //   data: {
    //     email,
    //     code: verificationCode,
    //     expiresAt: expiresAt,
    //   },
    // });

    // Send verification email (mock)
    // await sendVerificationEmail(email, verificationCode)
    // =========================================================================

    const data = {
      id: result.user.id,
      userName: result.user.userName,
      email: result.user.email,
      displayName: result.user.displayName,
      isPremium: result.user.isPremium,
    };
    const message = "Registration successfully";

    successResponse(res, data, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// FEATURE DISABLED
// =========================================================================
// TODO: Re-enable email verification feature.
// export const verifyEmail = async (req, res, next) => {
//   try {
//     const { email, code } = req.body

//     const verification = await prisma.emailVerification.findFirst({
//       where: { email, code },
//     })

//     if (!verification) {
//       return res.status(400).json({ error: "Invalid verification code" })
//     }

//     if (new Date() > verification.expiresAt) {
//       return res.status(400).json({ error: "Verification code expired" })
//     }

//     // Update user status
//     const user = await prisma.user.update({
//       where: { email },
//       data: { status: "ACTIVE" },
//     })

//     // Delete verification record
//     await prisma.emailVerification.delete({
//       where: { id: verification.id },
//     })

//     // Generate tokens
//     const accessToken = generateAccessToken(user.id, user.role)
//     const refreshToken = generateRefreshToken(user.id)

//     res.status(200).json({
//       message: "Email verified successfully",
//       accessToken,
//       refreshToken,
//       user: {
//         id: user.id,
//         userName: user.userName,
//         email: user.email,
//         displayName: user.displayName,
//       },
//     })
//   } catch (error) {
//     next(error)
//   }
// }
// =========================================================================

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === "PENDING") {
      return res.status(403).json({ error: "Please verify your email first" });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({ error: "Your account is inactive" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const message = "Login successfully";
    const data = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        displayName: user.displayName,
        avatarUri: user.avatarUri,
        role: user.role,
      },
    };

    successResponse(res, data, message);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newAccessToken = generateAccessToken(user.id, user.role);

    const data = { accessToken: newAccessToken };

    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};
