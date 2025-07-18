<template>
  <div class="api-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>API配置</span>
          <el-tag :type="isApiConfigured ? 'success' : 'danger'" size="small">
            {{ isApiConfigured ? '已配置' : '未配置' }}
          </el-tag>
        </div>
      </template>
      
      <el-form :model="configForm" label-width="100px" size="small">
        <el-form-item label="API密钥">
          <el-input
            v-model="configForm.apiKey"
            type="password"
            placeholder="请输入OpenAI API密钥"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item label="API地址">
          <el-input
            v-model="configForm.baseURL"
            placeholder="https://api.openai.com/v1"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="模型选择">
          <el-select v-model="configForm.selectedModel" placeholder="选择模型">
            <el-option
              v-for="model in availableModels"
              :key="model.id"
              :label="model.name"
              :value="model.id"
            >
              <span>{{ model.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">
                {{ model.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="自定义模型">
          <div style="display: flex; gap: 8px; align-items: center;">
            <el-input
              v-model="customModelInput"
              placeholder="输入自定义模型名称，如：gpt-4o-mini"
              style="flex: 1;"
            />
            <el-button 
              type="primary" 
              size="small" 
              @click="addCustomModel"
              :disabled="!customModelInput.trim()"
            >
              添加
            </el-button>
          </div>
          <div v-if="customModels.length > 0" style="margin-top: 8px;">
            <el-tag
              v-for="model in customModels"
              :key="model.id"
              closable
              @close="removeCustomModel(model.id)"
              style="margin-right: 8px; margin-bottom: 4px;"
            >
              {{ model.name }}
            </el-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="最大Token">
          <el-input-number
            v-model="configForm.maxTokens"
            :min="100"
            :max="4000"
            :step="100"
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="创造性">
          <el-slider
            v-model="configForm.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-tooltip
            :format-tooltip="formatTemperature"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveConfig" :loading="validating">
            {{ validating ? '验证中...' : '保存配置' }}
          </el-button>
          <el-button @click="testConnection" :loading="validating">
            测试连接
          </el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-divider />
      
      <div class="config-tips">
        <h4>配置说明：</h4>
        <ul>
          <li><strong>模型选择：</strong>推荐使用gemini2.5pro、claude3.7/4</li>
          <li><strong>国产模型：</strong>国产模型推荐使用阿里百炼API速度比较快</li>
          <li><strong>最佳模型：</strong><span style="color: red;">gemini、claude中转可以联系作者微信1090879115</span></li>
          <li><strong>最大Token：</strong>控制生成内容的长度</li>
          <li><strong>创造性：</strong>0表示更准确，1表示更有创意</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useNovelStore } from '../stores/novel.js'
import apiService from '../services/api.js'

const store = useNovelStore()
const validating = ref(false)
const customModelInput = ref('')
const customModels = ref([])

const configForm = reactive({
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  selectedModel: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7
})

const defaultModels = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '快速且经济'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '更强大的模型'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: '最新版本'
  }
]

const availableModels = computed(() => {
  return [...defaultModels, ...customModels.value]
})

const isApiConfigured = computed(() => store.isApiConfigured)

const formatTemperature = (value) => {
  if (value <= 0.3) return '保守'
  if (value <= 0.7) return '平衡'
  return '创新'
}

const addCustomModel = () => {
  const modelName = customModelInput.value.trim()
  if (!modelName) return
  
  // 检查是否已存在
  const exists = availableModels.value.some(model => model.id === modelName)
  if (exists) {
    ElMessage.warning('该模型已存在')
    return
  }
  
  // 添加自定义模型
  customModels.value.push({
    id: modelName,
    name: modelName,
    description: '自定义模型'
  })
  
  customModelInput.value = ''
  ElMessage.success('自定义模型添加成功')
  
  // 保存到本地存储
  saveCustomModels()
}

const removeCustomModel = (modelId) => {
  const index = customModels.value.findIndex(model => model.id === modelId)
  if (index > -1) {
    customModels.value.splice(index, 1)
    
    // 如果当前选中的模型被删除，重置为默认模型
    if (configForm.selectedModel === modelId) {
      configForm.selectedModel = 'gpt-3.5-turbo'
    }
    
    ElMessage.success('自定义模型删除成功')
    saveCustomModels()
  }
}

const saveCustomModels = () => {
  localStorage.setItem('customModels', JSON.stringify(customModels.value))
}

const loadCustomModels = () => {
  const saved = localStorage.getItem('customModels')
  if (saved) {
    try {
      customModels.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载自定义模型失败:', error)
    }
  }
}

const saveConfig = async () => {
  if (!configForm.apiKey) {
    ElMessage.warning('请输入API密钥')
    return
  }
  
  validating.value = true
  try {
    // 更新配置
    store.updateApiConfig(configForm)
    
    // 验证API密钥
    const isValid = await store.validateApiKey()
    
    if (isValid) {
      ElMessage.success('API配置保存成功')
      // 保存到本地存储
      localStorage.setItem('apiConfig', JSON.stringify(configForm))
    } else {
      ElMessage.error('API密钥验证失败，请检查配置')
    }
  } catch (error) {
    ElMessage.error('配置保存失败：' + error.message)
  } finally {
    validating.value = false
  }
}

const testConnection = async () => {
  if (!configForm.apiKey) {
    ElMessage.warning('请先输入API密钥')
    return
  }
  
  validating.value = true
  try {
    store.updateApiConfig(configForm)
    const isValid = await store.validateApiKey()
    
    if (isValid) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.error('连接测试失败')
    }
  } catch (error) {
    ElMessage.error('连接测试失败：' + error.message)
  } finally {
    validating.value = false
  }
}

const resetConfig = () => {
  Object.assign(configForm, {
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    selectedModel: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7
  })
  localStorage.removeItem('apiConfig')
  ElMessage.success('配置已重置')
}

// 加载保存的配置
const loadSavedConfig = () => {
  const saved = localStorage.getItem('apiConfig')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      Object.assign(configForm, config)
      store.updateApiConfig(config)
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }
}

onMounted(() => {
  loadCustomModels()
  loadSavedConfig()
})
</script>

<style scoped>
.api-config {
  padding: 20px;
}

.config-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-tips {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.config-tips h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.config-tips ul {
  margin: 0;
  padding-left: 20px;
}

.config-tips li {
  margin-bottom: 8px;
  color: #606266;
  line-height: 1.5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-slider__runway) {
  margin: 16px 0;
}
</style>