import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
) {
  const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"GoRide" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Redefinição de senha — GoRide",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1D3557;">Redefinir senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta GoRide.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>15 minutos</strong>.</p>
        <a href="${resetUrl}"
          style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                 background-color: #1D3557; color: white; text-decoration: none;
                 border-radius: 8px; font-weight: bold;">
          Redefinir senha
        </a>
        <p style="color: #666; font-size: 13px;">
          Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.
        </p>
      </div>
    `,
  });
}