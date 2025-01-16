export function getDigestEmailTemplate(
  notifications: any[],
  type: 'daily' | 'weekly'
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
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
          .notification {
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .notification-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .notification-meta {
            color: #666;
            font-size: 0.9em;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${type === 'daily' ? 'Daglig' : 'Ukentlig'} HMS-oppsummering</h1>
            <p>Her er en oversikt over dine HMS-varsler.</p>
          </div>
          
          ${notifications.map(notification => `
            <div class="notification">
              <div class="notification-title">${notification.title}</div>
              <div class="notification-content">${notification.message}</div>
              <div class="notification-meta">
                ${formatDate(notification.createdAt)}
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>
              Du mottar denne e-posten fordi du har aktivert 
              ${type === 'daily' ? 'daglige' : 'ukentlige'} 
              varsler i HMS-systemet.
            </p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications">
                Endre varslingsinnstillinger
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
} 