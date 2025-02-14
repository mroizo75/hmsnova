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

export async function uploadToStorage(file: File, path: string, companyId: string) {
  try {
    // Strukturer filbanen med companyId
    const fullPath = `companies/${companyId}/deviations/${path}`
    console.log('Uploading file to path:', fullPath)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = bucket.file(fullPath)
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    })

    return new Promise<string>((resolve, reject) => {
      blobStream.on('error', reject)
      blobStream.on('finish', async () => {
        // Generer full URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`
        resolve(publicUrl)
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

export async function uploadProfileImage(file: File, companyId: string, employeeId: string) {
  try {
    const path = `companies/${companyId}/profile/${employeeId}/profileImg`
    console.log('Uploading profile image:', path)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = bucket.file(path)
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    })

    return new Promise<string>((resolve, reject) => {
      blobStream.on('error', reject)
      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`
        resolve(publicUrl)
      })
      blobStream.end(buffer)
    })
  } catch (error) {
    console.error('Profile image upload error:', error)
    throw error
  }
} 