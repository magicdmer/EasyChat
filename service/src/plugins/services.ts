import type { UserInfo } from '../storage/model'
import { Status } from '../storage/model'
import { getCacheApiKeys } from '../storage/config'
import { generateImage } from '../imageGeneration'

// 插件的 model 类型设置由管理员全局下发，不继承调用用户的聊天 Key 角色限制。
async function selectPluginModelKey(model: string) {
  const keys = (await getCacheApiKeys())
    .filter(key => key.status !== Status.Disabled)
    .filter((key) => {
      const availableModels = key.availableModels || []
      return availableModels.length > 0
        ? availableModels.includes(model)
        : (key.chatModels || []).includes(model)
    })
    .sort((left, right) => Number(left.id || 0) - Number(right.id || 0))

  if (keys.length === 0)
    throw new Error(`未找到支持生图模型 ${model} 的 Key`)
  return keys[0]
}

export function createPluginServices(_user: UserInfo, signal: AbortSignal) {
  return {
    images: {
      async generate(input: { prompt: string; model: string }): Promise<string> {
        return generateImage(input, signal, () => selectPluginModelKey(input.model.trim()))
      },
    },
  }
}
