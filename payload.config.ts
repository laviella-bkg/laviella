import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { ContactMessages } from './cms/collections/ContactMessages'
import { Domos } from './cms/collections/Domos'
import { Guests } from './cms/collections/Guests'
import { Media } from './cms/collections/Media'
import { Pages } from './cms/collections/Pages'
import { Reservations } from './cms/collections/Reservations'
import { Seasons } from './cms/collections/Seasons'
import { Testimonials } from './cms/collections/Testimonials'
import { Users } from './cms/collections/Users'
import { HomePage } from './cms/globals/HomePage'
import { migrations } from './cms/migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  routes: {
    admin: '/cms',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
      importMapFile: path.resolve(dirname, 'app/(payload)/cms/importMap.js'),
    },
  },
  collections: [Domos, Reservations, Seasons, Testimonials, Pages, ContactMessages, Media, Guests, Users],
  globals: [HomePage],
  editor: lexicalEditor(),
  // Sin GMAIL_APP_PASSWORD los emails se escriben en la consola
  email: process.env.GMAIL_APP_PASSWORD
    ? nodemailerAdapter({
        defaultFromAddress: process.env.GMAIL_USER || 'laviella.glamp@gmail.com',
        defaultFromName: 'La Viella Glamping',
        skipVerify: true,
        transportOptions: {
          service: 'gmail',
          auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'cms/payload-types.ts'),
  },
  graphQL: {
    disable: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, 'cms/migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
