import { Resend } from 'resend';
import config from '../../config';

export const resend = new Resend(config.resend.api_key);

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const data = await resend.emails.send({
            from: config.resend.from_email || 'onboarding@resend.dev',
            to: [to],
            subject: subject,
            html: html
        });
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

