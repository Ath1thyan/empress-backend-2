import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from 'dotenv';

dotenv.config();

let nodeConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: process.env.TEST_EMAIL,
        pass: process.env.TEST_EMAIL_PASSWORD
    }
};

let mailconfig = {
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASSWORD
    }
}

let transporter = nodemailer.createTransport(mailconfig);

// let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Empress",
        link: 'https://your-domain.com/'  // Use your actual domain
    }
});

/**
 * Function to send registration email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // body of the email
    var email = {
        body : {
            name: username,
            intro : text || 'Welcome to Empress! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
        }
    };

    var emailBody = MailGenerator.generate(email);

    let message = {
        from: process.env.TEST_EMAIL,
        to: userEmail,
        subject: subject || "Signup Successful",
        html: emailBody
    };

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us."});
        })
        .catch(error => res.status(500).send({ error }));
};

/**
 * Send generic mail to a user
 * @param {Object} options - contains the email options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - subject of the email
 * @param {string} options.text - text of the email
 * @returns {Promise<Object>} - mail sending result
 */
export async function sendMail({ to, subject, text }) {
    try {
        // Create the email body using Mailgen
        const email = {
            body: {
                name: to,
                intro: text,
                outro: "Need help? Reply to this email, we'd love to assist you."
            }
        };

        const emailBody = MailGenerator.generate(email);

        // Define the email options
        let message = {
            from: process.env.MAILGUN_USER,
            to,
            subject,
            html: emailBody
        };

        // Log the email details
        console.log("Attempting to send email to:", to);
        console.log("Email subject:", subject);
        console.log("Email content:", text);

        // Send the email
        let info = await transporter.sendMail(message);

        console.log("Email sent successfully:", info);

        return {
            success: true,
            message: `Email sent successfully to ${to}`,
            info,
        };

    } catch (error) {
        console.error("Error in sendMail:", error);
        return {
            success: false,
            message: "Failed to send email",
            error,
        };
    }
}

