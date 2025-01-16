import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!)

export async function getSignedUrl(filePath: string) {
  try {
    // Fjern eventuell bucket prefix
    const cleanPath = filePath.replace(/^https?:\/\/storage\.googleapis\.com\/[^/]+\//, '')
    console.log('Getting signed URL for:', cleanPath)
    
    const file = bucket.file(cleanPath)
    const exists = await file.exists()
    
    if (!exists[0]) {
      console.error(`File ${cleanPath} does not exist in bucket`)
      throw new Error(`File ${cleanPath} does not exist in bucket`)
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 time
    })

    console.log('Generated signed URL:', url)
    return url

  } catch (error) {
    console.error('Error getting signed URL:', error)
    throw error
  }
}

export async function uploadToStorage(file: File, path: string) {
  try {
    console.log('Uploading file to path:', path)
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const blob = bucket.file(path)
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    })

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Upload error:', err)
        reject(err)
      })

      blobStream.on('finish', async () => {
        // Returner filstien i stedet for URL
        resolve(path)
      })

      blobStream.end(buffer)
    })
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFromStorage(filePath: string) {
  try {
    // Fjern eventuell bucket prefix
    const cleanPath = filePath.replace(/^https?:\/\/storage\.googleapis\.com\/[^/]+\//, '')
    console.log('Deleting file:', cleanPath)
    
    const file = bucket.file(cleanPath)
    const exists = await file.exists()
    
    if (!exists[0]) {
      console.error(`File ${cleanPath} does not exist in bucket`)
      return false
    }

    await file.delete()
    console.log('File deleted successfully')
    return true

  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
} 