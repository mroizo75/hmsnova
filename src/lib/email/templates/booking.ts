export const getBookingConfirmationEmail = ({
  name,
  date,
  time,
  meetingType,
  participants
}: {
  name: string
  date: string
  time: string
  meetingType: string
  participants: string
}) => ({
  subject: `Møtebekreftelse - HMS Nova`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2C435F; margin-bottom: 24px;">Takk for din møteforespørsel</h1>
      
      <p>Hei ${name},</p>
      
      <p>Vi har mottatt din forespørsel om møte og kommer til å kontakte deg snart for å bekrefte tidspunktet.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h2 style="color: #2C435F; margin-top: 0;">Møtedetaljer:</h2>
        <p><strong>Dato:</strong> ${date}</p>
        <p><strong>Tid:</strong> ${time}</p>
        <p><strong>Type:</strong> ${meetingType}</p>
        <p><strong>Antall deltakere:</strong> ${participants}</p>
      </div>
      
      <p>Hvis du har spørsmål i mellomtiden, ikke nøl med å kontakte oss på:</p>
      <p>Telefon: +47 99 11 29 16<br>
      E-post: post@kksas.no</p>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea;">
        <p style="color: #666;">Med vennlig hilsen,<br>
        HMS Nova Team</p>
      </div>
    </div>
  `
})

export const getInternalBookingNotificationEmail = ({
  name,
  email,
  company,
  phone,
  date,
  time,
  meetingType,
  participants
}: {
  name: string
  email: string
  company: string
  phone: string
  date: string
  time: string
  meetingType: string
  participants: string
}) => ({
  subject: `Ny møteforespørsel fra ${company}`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2C435F; margin-bottom: 24px;">Ny møteforespørsel</h1>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h2 style="color: #2C435F; margin-top: 0;">Kundedetaljer:</h2>
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Bedrift:</strong> ${company}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h2 style="color: #2C435F; margin-top: 0;">Møtedetaljer:</h2>
        <p><strong>Dato:</strong> ${date}</p>
        <p><strong>Tid:</strong> ${time}</p>
        <p><strong>Type:</strong> ${meetingType}</p>
        <p><strong>Antall deltakere:</strong> ${participants}</p>
      </div>
    </div>
  `
}) 