import axios from 'axios'
import type { KeyConfig } from './storage/model'
import { getCacheConfig } from './storage/config'

interface ImageGenerationInput {
  prompt: string
  model: string
}

type ResolveImageKey = () => Promise<KeyConfig | undefined>

function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '').replace(/\/v1$/i, '')
}

function normalizeImageSource(value: string): string {
  const source = value.trim()
  if (/^(?:https?:\/\/|data:image\/|\/)/i.test(source))
    return source
  return `data:image/png;base64,${source}`
}

function toImageMarkdown(source: string): string {
  return `![我的图片](${normalizeImageSource(source)})`
}

export async function generateImage(
  input: ImageGenerationInput,
  signal: AbortSignal,
  resolveKey: ResolveImageKey,
): Promise<string> {
  const prompt = input.prompt.trim()
  const model = input.model.trim()
  if (!prompt)
    throw new Error('生图提示词不能为空')
  if (!model)
    throw new Error('生图模型不能为空')

  const mgApiKey = process.env.MG_API_KEY
  const mgApiUrl = process.env.MG_API_BASE_URL
  if (mgApiKey && mgApiUrl) {
    const response = await axios.post(`${normalizeApiBaseUrl(mgApiUrl)}/private/ai_draw`, {
      model,
      prompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': mgApiKey,
      },
      signal,
    })
    if (response.data?.code !== 0)
      throw new Error(response.data?.message || 'Image generation failed')
    if (!response.data?.image)
      throw new Error('No image data in response')
    return toImageMarkdown(String(response.data.image))
  }

  const key = await resolveKey()
  if (!key)
    throw new Error(`未找到支持生图模型 ${model} 的 Key`)

  const config = await getCacheConfig()
  const configuredBaseUrl = key.apiBaseUrl || config.apiBaseUrl || ''
  if (!configuredBaseUrl)
    throw new Error('生图 Key 未配置 API Base URL')

  const payload = {
    model,
    prompt,
    n: 1,
    size: model === 'dall-e-2' ? '512x512' : '1024x1024',
  }
  const response = await axios.post(`${normalizeApiBaseUrl(configuredBaseUrl)}/v1/images/generations`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key.key}`,
    },
    signal,
  })
  const image = response.data?.data?.[0]
  const source = image?.url || (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : '')
  if (!source)
    throw new Error('No image data in response')
  return toImageMarkdown(String(source))
}
