import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for andre porter
  auth: {
    user: 'apikey', // SendGrid bruker 'apikey' som brukernavn
    pass: process.env.SENDGRID_API_KEY,
  }
})

// Legg til en retry-mekanisme
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryOperation(operation, retries - 1, delay * 2)
    }
    throw error
  }
}

interface WelcomeEmailProps {
  to: string
  name: string
  password: string
  companyName: string
}

export async function sendWelcomeEmail({ to, name, password, companyName }: WelcomeEmailProps) {
  try {
    // Prøv å sende e-post med retry
    const info = await retryOperation(() => 
      transporter.sendMail({
        from: `"innut.io" <${process.env.SMTP_FROM}>`,
        to,
        subject: 'Velkommen til innut.io',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #15803d;">Velkommen til innut.io</h1>
            <p>Hei ${name},</p>
            <p>Du har blitt lagt til som bruker i ${companyName} sitt HMS-system.</p>
            <p>Her er din innloggingsinformasjon:</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>E-post:</strong> ${to}</p>
              <p style="margin: 8px 0 0;"><strong>Passord:</strong> ${password}</p>
            </div>
            <p>Du kan logge inn på <a href="${process.env.NEXTAUTH_URL}/login" style="color: #15803d;">innut.io</a></p>
            <p>Av sikkerhetsmessige årsaker anbefaler vi at du endrer passordet ditt ved første innlogging.</p>
            <p>Vennlig hilsen<br>innut.io</p>
          </div>
        `,
      })
    )

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Email service error:', {
      error,
      errorMessage: error.message
    })
    
    return {
      success: false,
      error: error.message
    }
  }
} 