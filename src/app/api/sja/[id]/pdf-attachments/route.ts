import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import prisma from '@/lib/db'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Storage } from '@google-cloud/storage'
import { Readable } from 'stream'

const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
}) : null;

const googleStorage = process.env.GOOGLE_CLOUD_PROJECT ? new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
}) : null;

const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.GOOGLE_CLOUD_BUCKET_NAME || '';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Ikke autentisert' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const sjaId = params.id;
    
    // Sjekk at SJA-en tilhører brukerens firma
    const sja = await prisma.sJA.findFirst({
      where: {
        id: sjaId,
        companyId: session.user.companyId
      },
      include: {
        vedlegg: true
      }
    });

    if (!sja) {
      return new Response(JSON.stringify({ error: 'SJA ikke funnet eller ingen tilgang' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const requestData = await request.json();
    const { paths } = requestData;

    if (!Array.isArray(paths) || paths.length === 0) {
      return new Response(JSON.stringify({ error: 'Ingen vedleggsbaner angitt' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Vi må ha en av S3 eller Google Storage konfigurert
    if (!s3Client && !googleStorage) {
      return new Response(JSON.stringify({ error: 'Ingen lagringsløsning konfigurert' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generate signed URL-er (5 minutter utløpstid)
    const urls = await Promise.all(
      paths.map(async (path) => {
        try {
          let signedUrl = '';
          
          if (s3Client) {
            // AWS S3
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: path
            });
            signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
          } else if (googleStorage) {
            // Google Cloud Storage
            const options = {
              version: 'v4',
              action: 'read',
              expires: Date.now() + 5 * 60 * 1000, // 5 minutter
            };
            
            [signedUrl] = await googleStorage.bucket(bucketName).file(path).getSignedUrl(options);
          }
          
          return {
            path,
            signedUrl
          };
        } catch (error) {
          console.error(`Error generating signed URL for ${path}:`, error);
          return {
            path,
            signedUrl: ''
          };
        }
      })
    );

    return new Response(JSON.stringify({ urls }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error i PDF vedlegg API:', error);
    return new Response(JSON.stringify({ error: 'Intern serverfeil' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
} 