import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto'
import * as dotenv from 'dotenv'
import { getCacheConfig } from '../storage/config'

dotenv.config()

export function md5(input: string) {
  input = input + process.env.PASSWORD_MD5_SALT
  const md5 = createHash('md5')
  md5.update(input)
  return md5.digest('hex')
}

const PASSWORD_HASH_PREFIX = 'scrypt'

function derivePasswordKey(password: string, salt: string): Promise<Buffer> {
  const pepper = process.env.PASSWORD_MD5_SALT || ''
  return new Promise((resolve, reject) => {
    scrypt(`${password}${pepper}`, salt, 64, (error, derivedKey) => {
      if (error)
        reject(error)
      else resolve(derivedKey)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await derivePasswordKey(password, salt)
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`))
    return storedHash === md5(password)

  const [, salt, encodedKey] = storedHash.split('$')
  if (!salt || !encodedKey)
    return false

  const actualKey = await derivePasswordKey(password, salt)
  const expectedKey = Buffer.from(encodedKey, 'hex')
  return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey)
}

export function needsPasswordRehash(storedHash: string): boolean {
  return !storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)
}

// 可以换 aes 等方式
export async function getUserVerifyUrl(username: string) {
  const sign = getUserVerify(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/#/chat/?verifytoken=${sign}`
}

function getUserVerify(username: string) {
  return getVerify(username, '')
}
function getVerify(username: string, key: string) {
  const expired = new Date().getTime() + (12 * 60 * 60 * 1000)
  const sign = `${username}${key}-${expired}`
  return `${sign}-${md5(sign)}`
}

function checkVerify(verify: string) {
  const vs = verify.split('-')
  const sign = vs[vs.length - 1]
  const expired = vs[vs.length - 2]
  vs.splice(vs.length - 2, 2)
  const prefix = vs.join('-')
  const expiresAt = Number(expired)
  const expectedSign = md5(`${prefix}-${expired}`)
  const actualBuffer = Buffer.from(sign || '', 'utf8')
  const expectedBuffer = Buffer.from(expectedSign, 'utf8')
  const signatureMatches = actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
  if (Number.isFinite(expiresAt) && expiresAt > Date.now() && signatureMatches)
    return prefix.split('|')[0]
  throw new Error('Verify failed')
}

export function checkUserVerify(verify: string) {
  return checkVerify(verify)
}

// 可以换 aes 等方式
export async function getUserVerifyUrlAdmin(username: string) {
  const sign = getUserVerifyAdmin(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/#/chat/?verifytokenadmin=${sign}`
}

function getUserVerifyAdmin(username: string) {
  return getVerify(username, `|${process.env.ROOT_USER}`)
}

export function checkUserVerifyAdmin(verify: string) {
  return checkVerify(verify)
}

export async function getUserResetPasswordUrl(username: string) {
  const sign = getUserResetPassword(username)
  const config = await getCacheConfig()
  return `${config.siteConfig.siteDomain}/#/chat/?verifyresetpassword=${sign}`
}

function getUserResetPassword(username: string) {
  return getVerify(username, '|rp')
}

export function checkUserResetPassword(verify: string, username: string) {
  const name = checkVerify(verify)
  if (name === username)
    return name
  throw new Error('Verify failed')
}
