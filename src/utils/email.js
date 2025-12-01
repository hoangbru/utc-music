/**
 * Email Service (Mock)
 * In production, integrate with SendGrid, Nodemailer, or similar
 */

export const sendVerificationEmail = async (email, code) => {
  console.log(`[Email Service] Sending verification email to ${email}`)
  console.log(`[Email Service] Verification Code: ${code}`)
  // In production: await emailProvider.send({ to: email, subject: '...', html: '...' })
}

export const sendPasswordResetEmail = async (email, resetLink) => {
  console.log(`[Email Service] Sending password reset email to ${email}`)
  console.log(`[Email Service] Reset Link: ${resetLink}`)
}
