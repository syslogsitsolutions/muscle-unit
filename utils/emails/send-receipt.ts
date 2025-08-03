"use server";

import { transporter } from "@/lib/nodemailer";

export async function sendReceiptEmail({
  to,
  name,
  amount,
  date,
  receiptId,
  membershipName,
  validFrom,
  validTo,
}: {
  to: string;
  name: string;
  amount: number;
  date: string;
  receiptId: string;
  membershipName: string;
  validFrom: string;
  validTo: string;
}) {
  const mailOptions = {
    from: `"Muscle Unit" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🏋️ Payment Receipt - Welcome to Muscle Unit!",
    html: `
         <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.2);
          }
          
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .tagline {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          
          .content {
            background: white;
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
          }
          
          .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          
          .receipt-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          
          .receipt-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .receipt-details {
            width: 100%;
          }
          
          .detail-row {
            width: 100%;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
          }
          
          .detail-row-last {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 600;
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-value {
            font-weight: bold;
            color: #2c3e50;
            font-size: 15px;
          }
          
          .amount {
            font-size: 20px !important;
            color: #28a745 !important;
          }
          
          .membership-highlight {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            text-align: center;
          }
          
          .membership-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .validity-period {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .footer {
            background: #2c3e50;
            padding: 25px;
            text-align: center;
            color: white;
          }
          
          .footer-text {
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .team-signature {
            font-style: italic;
            opacity: 0.9;
          }
          
          .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #667eea, transparent);
            margin: 20px 0;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 12px;
            }
            
            .content {
              padding: 25px 20px;
            }
            
            .header {
              padding: 25px 20px;
            }
            
            .receipt-card {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💪 MUSCLE UNIT</div>
            <div class="tagline">Your Fitness Journey Starts Here</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${name}! 👋</div>
            <div class="message">
              Thank you for choosing Muscle Unit! We're excited to have you join our fitness community. Your payment has been successfully processed and your membership is now active.
            </div>
            
            <div class="membership-highlight">
              <div class="membership-name">${membershipName}</div>
              <div class="validity-period">
                Valid from <strong>${validFrom}</strong> to <strong>${validTo}</strong>
              </div>
            </div>
            
            <div class="receipt-card">
              <div class="receipt-title">📋 Payment Receipt</div>
              
              <div class="receipt-details">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Receipt ID</td>
                          <td align="right" class="detail-value">#${receiptId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Payment Date</td>
                          <td align="right" class="detail-value">${date}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Member Name</td>
                          <td align="right" class="detail-value">${name}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Membership Type</td>
                          <td align="right" class="detail-value">${membershipName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Valid From</td>
                          <td align="right" class="detail-value">${validFrom}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Valid To</td>
                          <td align="right" class="detail-value">${validTo}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <div class="divider"></div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="detail-row detail-row-last">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="detail-label">Amount Paid</td>
                          <td align="right" class="detail-value amount">₹${amount.toLocaleString("en-IN")}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          
          </div>
          
          <div class="footer">
            <div class="footer-text">
              Welcome to the Muscle Unit family! 💪<br>
              Ready to transform your fitness journey?
            </div>
            <div class="team-signature">
              Best regards,<br>
              <strong>The Muscle Unit Team</strong>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Email sending failed:", error.message);
    return { success: false, error: error.message };
  }
}
