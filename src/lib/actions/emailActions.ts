'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(data: {
  to: string;
  guestName: string;
  eventName: string;
  eventDate: string;
  rsvpLink: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Eventia <onboarding@resend.dev>', // En producción usar un dominio verificado
      to: [data.to],
      subject: `¡Te invitamos a ${data.eventName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h1 style="color: #8b5cf6; text-align: center; text-transform: uppercase; font-style: italic;">¡Hola, ${data.guestName}!</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Te invitamos cordialmente a nuestro evento: <strong>${data.eventName}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>Fecha:</strong> ${new Date(data.eventDate).toLocaleDateString()}
          </p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${data.rsvpLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Confirmar Asistencia
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
          <p style="font-size: 12px; color: #666; text-align: center;">
            Enviado desde Eventia - Tu gestor de eventos premium.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return { success: false, error: 'No se pudo enviar el correo.' };
    }

    return { success: true, data: emailData };
  } catch (error: any) {
    console.error('Error al enviar correo:', error);
    return { success: false, error: error.message || 'Error desconocido al enviar el mensaje.' };
  }
}
