const nodemailer = require('nodemailer');

const sendWaitlistConfirmation = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // URLs de recursos públicos
        const logoUrl = 'https://raw.githubusercontent.com/JoanAquinoVasquez/MuchIQ/main/src/assets/icono_muchiq_landing.png';
        const mascotUrl = 'https://raw.githubusercontent.com/JoanAquinoVasquez/MuchIQ/main/src/assets/MuchIQ_mascota.png';
        
        // Personalizamos el saludo si el nombre existe
        const greeting = name ? `¡Hola ${name}!` : '¡Hola!';

        const mailOptions = {
            from: `"MuchIQ Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `¡Bienvenido a la expedición MuchIQ, ${name || 'Explorador'}! 🚀🏛️`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        .body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 10px; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                        .header { padding: 40px; text-align: center; }
                        .logo { width: 60px; height: auto; margin-bottom: 20px; }
                        .hero { background: linear-gradient(135deg, #1A9B8E 0%, #D4AF37 100%); padding: 40px 20px; color: white; text-align: center; }
                        .mascot { width: 180px; height: auto; margin-bottom: 20px; border-radius: 20px; }
                        .content { padding: 40px; color: #333333; line-height: 1.6; }
                        .footer { padding: 30px; text-align: center; font-size: 12px; color: #999999; background: #fdfdfd; }
                        .button { display: inline-block; padding: 14px 30px; background-color: #1A9B8E; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
                        .social-links { margin-top: 20px; }
                        .social-icon { margin: 0 10px; text-decoration: none; color: #1A9B8E; font-weight: bold; }
                    </style>
                </head>
                <body class="body">
                    <div class="container">
                        <div class="header">
                            <img src="${logoUrl}" alt="MuchIQ Logo" class="logo">
                            <h1 style="margin:0; font-size: 28px; letter-spacing: -1px; color: #1A9B8E;">MuchIQ</h1>
                        </div>
                        
                        <div class="hero">
                            <img src="${mascotUrl}" alt="MuchIQ Mascot" class="mascot">
                            <h2 style="margin:0; font-size: 24px;">${greeting} Ya eres parte de la lista de espera exclusiva</h2>
                        </div>

                        <div class="content">
                            <p>¡Qué alegría tenerte con nosotros!</p>
                            <p>Te has unido oficialmente a la lista de espera de <strong>MuchIQ</strong>. Estamos utilizando inteligencia artificial avanzada para llevar la milenaria cultura del norte peruano directo a tu smartphone.</p>
                            
                            <p>Como miembro de la lista de espera, tu nombre ya está registrado para:</p>
                            <ul style="padding-left: 20px;">
                                <li>Acceso prioritario al lanzamiento de la Beta.</li>
                                <li>Obtener 100 puntos de bienvenida.</li>
                                <li>Recompensas exclusivas en nuestra red de aliados culturales.</li>
                            </ul>

                            <p style="margin-top: 30px;">Estamos trabajando duro para que la experiencia sea mágica. ¡Muy pronto recibirás noticias nuestras!</p>
                            
                            <div style="text-align: center;">
                                <a href="https://muchiq-mobile.vercel.app/" class="button">Probar Demo</a>
                            </div>
                        </div>

                        <div class="footer">
                            <div class="social-links">
                                <a href="https://tiktok.com/@muchiq.pe" class="social-icon">TikTok</a> • 
                                <a href="https://instagram.com/muchiq.pe" class="social-icon">Instagram</a> • 
                                <a href="https://facebook.com/muchiq.pe" class="social-icon">Facebook</a>
                            </div>
                            <p style="margin-top: 20px;">© 2026 MuchIQ Team • Lambayeque, Perú<br>Reinventando el turismo cultural.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error enviando email:', error);
        return false;
    }
};

module.exports = {
    sendWaitlistConfirmation
};

