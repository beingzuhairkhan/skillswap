export function getForgotPasswordEmailTemplate(
  OTP: string | number 
): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    
    <h2 style="text-align: center; color: #333;">🔐 Reset Your Password</h2>

    <p style="text-align: center; font-size: 14px; color: #555;">
      We received a request to reset your password.
    </p>

    <p style="text-align: center; font-size: 14px; color: #555;">
      Use the OTP below to proceed:
    </p>

    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; padding: 12px 20px; font-size: 24px; letter-spacing: 4px; font-weight: bold; background-color: #f4f4f4; border-radius: 6px; border: 1px dashed #ccc;">
        ${OTP}
      </span>
    </div>

    <p style="text-align: center; font-size: 13px; color: #888;">
      This OTP is valid for <strong>5 minutes</strong>.
    </p>

    <p style="text-align: center; font-size: 13px; color: #888;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

    <p style="text-align: center; font-size: 13px; color: #888;">
      Stay secure 🔒 <br/>
      <strong>SkillSwap Team</strong>
    </p>

  </div>`;
}