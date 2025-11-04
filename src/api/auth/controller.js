import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils.js";

export const register = async (req, res, next) => {
  try {
    const { userName, email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { userName }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or userName already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        userName,
        email,
        password: hashedPassword,
        displayName: displayName || userName,
      },
    });

    // Create "Liked Songs" playlist
    await prisma.playlist.create({
      data: {
        userId: user.id,
        title: "Bài hát đã thích",
        isFavorite: true,
      },
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

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
      },
    });
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

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
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

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};
