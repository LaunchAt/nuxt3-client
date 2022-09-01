import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  return {
    provide: {
      s3: new S3ClientService({
        bucketName: config.public.AWS_S3_BUCKET_NAME,
        region: config.public.AWS_S3_REGION,
      }),
    },
  }
})

class S3ClientService {
  #bucketName: string
  #region: string
  #s3Client: S3Client | null

  constructor ({ bucketName, region }) {
    this.#bucketName = bucketName
    this.#region = region
  }

  setCredential (credentials) {
    this.#s3Client = new S3Client({
      credentials,
      region: this.#region,
    })
  }

  getFile (key: string) {
    const command = new GetObjectCommand({ Bucket: this.#bucketName, Key: key })
    return this.#s3Client.send(command)
  }

  uploadFile (key: string, file: File) {
    const command = new PutObjectCommand({
      Body: file,
      Bucket: this.#bucketName,
      Key: key,
    })
    return this.#s3Client.send(command)
  }
}
