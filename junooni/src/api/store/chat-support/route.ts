import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import nodemailer from "nodemailer";

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const { name, email, orderNumber, category, message } = req.body;

    // Validate required fields
    if (!name || !email || !category || !message) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, category, and message are required"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
      return;
    }

    // Email configuration from environment variables
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@junooni.com";

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('Email configuration is missing');
      res.status(500).json({
        success: false,
        error: 'Email system configuration error. Please contact support directly at support@junooni.com'
      });
      return;
    }

    console.log('=== EMAIL CONFIG ===');
    console.log('SMTP Host:', SMTP_HOST);
    console.log('SMTP Port:', SMTP_PORT);
    console.log('SMTP User:', SMTP_USER);
    console.log('SMTP Pass:', SMTP_PASS);
    console.log('Support Email:', SUPPORT_EMAIL);

    // Create email transporter
   const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // SSL for 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  authMethod: "LOGIN", // <-- IMPORTANT: Fixes 535 incorrect auth
  tls: {
    // many cPanel / Hostinger mail servers require this
    rejectUnauthorized: false,
  },
});


    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ Email server connection verified');
    } catch (error) {
      console.error('❌ Email server verification failed:', error);
      throw new Error('Email server connection failed');
    }

    // Email content for support team
    const supportEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .field {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
          .value {
            margin-top: 5px;
          }
          .message-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #007bff;">📋 New Support Request</h2>
          </div>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          
          ${orderNumber ? `
          <div class="field">
            <div class="label">Order Number:</div>
            <div class="value">${orderNumber}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">Category:</div>
            <div class="value">${category}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="footer">
            <p>Submitted via Junooni Support Request Form</p>
            <p>Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email content for customer (confirmation email)
    const customerEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Junooni Support</h2>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            
            <p>We've received your support request and our team will get back to you within 24-48 hours.</p>
            
            <p><strong>Your Request Details:</strong></p>
            <ul>
              <li><strong>Category:</strong> ${category}</li>
              ${orderNumber ? `<li><strong>Order Number:</strong> ${orderNumber}</li>` : ''}
              <li><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
            </ul>
            
            <p><strong>Your Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
            
            <p>If you need immediate assistance, please reply to this email or contact us at <a href="mailto:support@junooni.com">support@junooni.com</a>.</p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Junooni Team</p>
            <p>&copy; ${new Date().getFullYear()} Junooni. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to support team
    console.log('\n=== SENDING EMAIL TO SUPPORT ===');
    const supportEmailInfo = await transporter.sendMail({
      from: `"Junooni Support Form" <${SMTP_USER}>`,
      to: SUPPORT_EMAIL,
      replyTo: email, // Allow direct reply to customer
      subject: `[Support] ${category} - ${name}`,
      html: supportEmailHTML,
      text: `
New Support Request

Name: ${name}
Email: ${email}
${orderNumber ? `Order Number: ${orderNumber}` : ''}
Category: ${category}

Message:
${message}

---
Submitted via Junooni Support Request Form
Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `.trim()
    });

    console.log('✅ Support email sent:', supportEmailInfo.messageId);

    // Send confirmation email to customer
    console.log('\n=== SENDING CONFIRMATION EMAIL TO CUSTOMER ===');
    const customerEmailInfo = await transporter.sendMail({
      from: `"Junooni Support" <${SMTP_USER}>`,
      to: email,
      subject: 'We received your support request - Junooni',
      html: customerEmailHTML,
      text: `
Hi ${name},

We've received your support request and our team will get back to you within 24-48 hours.

Your Request Details:
- Category: ${category}
${orderNumber ? `- Order Number: ${orderNumber}` : ''}
- Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Your Message:
${message}

If you need immediate assistance, please reply to this email or contact us at support@junooni.com.

Best regards,
The Junooni Team
      `.trim()
    });

    console.log('✅ Customer confirmation email sent:', customerEmailInfo.messageId);

    console.log('\n=== SUCCESS ===');
    res.status(200).json({ 
      success: true, 
      message: 'Support request submitted successfully. Check your email for confirmation.'
    });

  } catch (error) {
    console.error('\n=== FINAL ERROR ===');
    console.error(error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit support request. Please try again or contact us directly at support@junooni.com'
    });
  }
};