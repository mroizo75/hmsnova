import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'HMS Nova - Norges ledende HMS-system'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // Henter logoen (vi antar at den finnes i public-mappen)
  const logoUrl = new URL('HMSNova-logo.svg', process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  ).toString()

  // Prøver å laste logo, men håndterer også om den feiler
  let logo;
  try {
    logo = await fetch(logoUrl).then(res => res.arrayBuffer());
  } catch (e) {
    console.error('Kunne ikke laste logo for OpenGraph-bildet:', e);
    // Vi fortsetter uten logo hvis den ikke kan lastes
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#2C435F',
          backgroundImage: 'linear-gradient(to bottom right, #2C435F, #17304F)',
          padding: '40px',
          position: 'relative',
        }}
      >
        {/* Dekorative elementer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translate(200px, -200px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            transform: 'translate(-100px, 100px)',
          }}
        />
        
        {/* Logo og tekst */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            maxWidth: '900px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {logo && (
            <img
              src={`data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`}
              alt="HMS Nova Logo"
              width={250}
              height={80}
              style={{ objectFit: 'contain', marginBottom: '20px' }}
            />
          )}
          
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.1,
              margin: 0,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            Norges ledende HMS-system
          </h1>
          
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '10px 0 30px',
            }}
          >
            Komplett løsning for trygge arbeidsplasser
          </p>
          
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            {['Avviksbehandling', 'Risikovurdering', 'Stoffkartotek', 'SJA', 'Kompetanse'].map((text, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '30px',
                  padding: '10px 20px',
                  fontSize: '20px',
                  color: 'white',
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
        
        {/* Bunnlinje */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          www.hmsnova.no
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
          ).then(res => res.arrayBuffer()),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: await fetch(
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2'
          ).then(res => res.arrayBuffer()),
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )
} 