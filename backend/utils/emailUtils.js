/**
 * Email utility functions for the Tech Innovators Club Platform
 */

const nodemailer = require('nodemailer');

/**
 * Creates a transporter for sending emails
 * @returns {Object} - Nodemailer transporter
 */
const createTransporter = () => {
  // Use environment variables for email configuration
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

/**
 * Sends a welcome email to a new user
 * @param {String} email - Recipient email address
 * @param {String} fullName - Recipient's full name
 * @returns {Promise<Object>} - Result of email sending
 */
const sendWelcomeEmail = async (email, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@techinnovators.com',
      to: email,
      subject: 'Welcome to Tech Innovators Club!',
      html: `
        <h2>Welcome to Tech Innovators Club, ${fullName}!</h2>
        <p>We're excited to have you join our community of technology enthusiasts.</p>
        <p>Here are some tips to get you started:</p>
        <ul>
          <li>Complete your profile to connect with like-minded innovators</li>
          <li>Explore projects shared by other members</li>
          <li>Submit your own projects to showcase your innovations</li>
          <li>Join our upcoming events and hackathons</li>
        </ul>
        <p>Happy innovating!</p>
        <p>The Tech Innovators Club Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Sends a project approval notification
 * @param {String} email - Recipient email address
 * @param {String} fullName - Recipient's full name
 * @param {String} projectName - Name of the approved project
 * @returns {Promise<Object>} - Result of email sending
 */
const sendProjectApprovalEmail = async (email, fullName, projectName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@techinnovators.com',
      to: email,
      subject: 'Your Project Has Been Approved!',
      html: `
        <h2>Congratulations, ${fullName}!</h2>
        <p>Your project "<strong>${projectName}</strong>" has been approved by our moderation team.</p>
        <p>Your project is now visible to the entire Tech Innovators Club community.</p>
        <p>Keep up the great work and continue innovating!</p>
        <p>The Tech Innovators Club Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending project approval email:', error);
    throw error;
  }
};

/**
 * Sends a project rejection notification
 * @param {String} email - Recipient email address
 * @param {String} fullName - Recipient's full name
 * @param {String} projectName - Name of the rejected project
 * @param {String} reason - Reason for rejection
 * @returns {Promise<Object>} - Result of email sending
 */
const sendProjectRejectionEmail = async (email, fullName, projectName, reason = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@techinnovators.com',
      to: email,
      subject: 'Project Submission Update',
      html: `
        <h2>Hello, ${fullName}</h2>
        <p>We've reviewed your project "<strong>${projectName}</strong>" and have decided not to approve it at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please feel free to revise your project and resubmit it for review.</p>
        <p>If you have any questions, please reach out to our support team.</p>
        <p>The Tech Innovators Club Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending project rejection email:', error);
    throw error;
  }
};

/**
 * Sends a notification when a user receives a like on their project
 * @param {String} email - Recipient email address
 * @param {String} fullName - Recipient's full name
 * @param {String} likerName - Name of the person who liked the project
 * @param {String} projectName - Name of the liked project
 * @returns {Promise<Object>} - Result of email sending
 */
const sendLikeNotificationEmail = async (email, fullName, likerName, projectName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@techinnovators.com',
      to: email,
      subject: 'Someone Liked Your Project!',
      html: `
        <h2>Great news, ${fullName}!</h2>
        <p><strong>${likerName}</strong> liked your project "<strong>${projectName}</strong>".</p>
        <p>Your project is gaining attention in our community!</p>
        <p>Keep building amazing things!</p>
        <p>The Tech Innovators Club Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending like notification email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendProjectApprovalEmail,
  sendProjectRejectionEmail,
  sendLikeNotificationEmail
};