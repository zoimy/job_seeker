import nodemailer from 'nodemailer';

/**
 * NotificationService - Handles sending notifications via Email
 */
class NotificationService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter
   */
  async initialize(config) {
    try {
      // Create transporter based on config
      if (config.service === 'gmail') {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: config.email,
            pass: config.password // App-specific password for Gmail
          }
        });
      } else {
        // Generic SMTP config
        this.transporter = nodemailer.createTransporter({
          host: config.host,
          port: config.port || 587,
          secure: config.secure || false,
          auth: {
            user: config.email,
            pass: config.password
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Email notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Send email notification with vacancy matches
   */
  async sendEmail(userEmail, vacancies, userProfile) {
    if (!this.initialized || !this.transporter) {
      console.warn('Email service not initialized, skipping notification');
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const subject = `🎯 ${vacancies.length} New Job Match${vacancies.length > 1 ? 'es' : ''} Found!`;
      const html = this.generateEmailHTML(vacancies, userProfile);

      const info = await this.transporter.sendMail({
        from: `"Job Tracker" <${process.env.NOTIFICATION_EMAIL || 'noreply@jobtracker.com'}>`,
        to: userEmail,
        subject: subject,
        html: html
      });

      console.log(`✅ Email sent to ${userEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML email content
   */
  generateEmailHTML(vacancies, userProfile) {
    const topMatches = vacancies
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Show top 10

    const vacancyCards = topMatches.map(match => `
      <div style="background: #f8f9fa; border-left: 4px solid #7c3aed; padding: 16px; margin: 12px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">
          <a href="${match.vacancy.url}" style="color: #7c3aed; text-decoration: none;">
            ${match.vacancy.title}
          </a>
        </h3>
        <p style="margin: 4px 0; color: #6b7280;">
          <strong>${match.vacancy.company}</strong> • ${match.vacancy.location}
        </p>
        <div style="margin: 8px 0;">
          <span style="background: #7c3aed; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
            ${match.matchScore}% Match
          </span>
          ${match.vacancy.salaryMin ? `
            <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; margin-left: 8px;">
              ${match.vacancy.salaryMin}${match.vacancy.salaryMax ? `-${match.vacancy.salaryMax}` : '+'} ${match.vacancy.currency}
            </span>
          ` : ''}
        </div>
        ${match.breakdown.skillsMatch.length > 0 ? `
          <p style="margin: 8px 0 0 0; color: #059669; font-size: 14px;">
            ✓ Skills: ${match.breakdown.skillsMatch.join(', ')}
          </p>
        ` : ''}
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">
          ${match.vacancy.description.substring(0, 150)}...
        </p>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🎯 New Job Matches Found!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">
            We found ${vacancies.length} new job${vacancies.length > 1 ? 's' : ''} matching your profile
          </p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Top Matches</h2>
          ${vacancyCards}
        </div>

        ${vacancies.length > 10 ? `
          <p style="text-align: center; color: #6b7280;">
            + ${vacancies.length - 10} more match${vacancies.length - 10 > 1 ? 'es' : ''} in your Job Tracker dashboard
          </p>
        ` : ''}

        <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
            You're receiving this because you have notifications enabled in Job Tracker
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">
            Profile: ${userProfile.role || 'Not specified'} • ${userProfile.location || 'Any location'}
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send test notification
   */
  async sendTestEmail(userEmail) {
    if (!this.initialized || !this.transporter) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Job Tracker" <${process.env.NOTIFICATION_EMAIL || 'noreply@jobtracker.com'}>`,
        to: userEmail,
        subject: '✅ Job Tracker Notifications - Test Email',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">✅ Test Successful!</h2>
            <p>Your Job Tracker notification settings are working correctly.</p>
            <p>You will receive email notifications when new job vacancies matching your profile are found.</p>
          </div>
        `
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const notificationService = new NotificationService();
