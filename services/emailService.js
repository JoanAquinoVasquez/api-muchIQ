const nodemailer = require('nodemailer');

const sendWaitlistConfirmation = async (email) => {
    try {
        // Configuramos el transporte (Gmail)
        // NOTA: EMAIL_PASS debe ser una "App Password" de Google si se usa Gmail con 2FA
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"MuchIQ" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Ya estás en la lista de espera de MuchIQ! 🚀',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #bc5e18; margin: 0;">MuchIQ</h1>
                        <p style="color: #666; font-size: 16px;">Turismo Inteligente en el Norte</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #bc5e18 0%, #00878e 100%); padding: 30px; border-radius: 8px; color: white; text-align: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 24px;">¡Bienvenido a la expedición!</h2>
                        <p style="font-size: 18px; margin-top: 10px;">Estamos muy emocionados de tenerte con nosotros.</p>
                    </div>

                    <div style="color: #333; line-height: 1.6;">
                        <p>Hola,</p>
                        <p>Gracias por registrarte en nuestra lista de espera. Te has convertido en uno de los primeros en asegurar su lugar para vivir la experiencia <strong>MuchIQ</strong>.</p>
                        
                        <p><strong>¿Qué sigue ahora?</strong></p>
                        <ul>
                            <li>Te avisaremos antes que a nadie cuando la App esté lista para descargar.</li>
                            <li>Tendrás acceso a beneficios exclusivos para los primeros usuarios (Puntos extra en nuestra plataforma).</li>
                            <li>Serás parte de la comunidad que está transformando el turismo en Lambayeque.</li>
                        </ul>

                        <p>Mientras tanto, prepárate para descubrir la esencia cultural del norte como nunca antes.</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999;">
                        <p>© 2026 MuchIQ - Proyecto de Hackathon Lambayeque</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error enviando email:', error);
        // No lanzamos error para no detener el flujo del registro, 
        // pero lo registramos.
        return false;
    }
};

module.exports = {
    sendWaitlistConfirmation
};
