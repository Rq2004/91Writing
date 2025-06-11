import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api.js'

export const useNovelStore = defineStore('novel', () => {
  // 状态
  const currentNovel = ref('')
  const generatedContent = ref('')
  const outline = ref('')
  const isGeneratingOutline = ref(false)
  const chapters = ref([])
  const selectedChapter = ref(null)
  const isGeneratingChapter = ref(false)
  const aiChatHistory = ref([])
  const currentChatInput = ref('')
  const isAiChatting = ref(false)
  const templates = ref([
    { 
      id: 1, 
      name: '玄幻小说', 
      description: '包含修仙、异世界等元素',
      style: '宏大叙事，想象丰富',
      audience: '喜欢奇幻冒险的读者',
      keywords: ['修仙', '异世界', '法宝', '灵气', '境界', '天劫', '仙人', '妖兽'],
      plotElements: ['主角获得奇遇', '修炼突破', '门派争斗', '寻宝历险', '渡劫成仙'],
      characterTypes: ['天才少年', '神秘师父', '美丽师姐', '邪恶反派', '忠诚伙伴'],
      writingTips: '注重世界观构建，描写修炼体系要清晰，战斗场面要震撼'
    },
    { 
      id: 2, 
      name: '都市言情', 
      description: '现代都市背景的爱情故事',
      style: '细腻温馨，贴近生活',
      audience: '都市白领，年轻女性',
      keywords: ['爱情', '职场', '都市', '豪门', '契约', '误会', '重逢', '甜宠'],
      plotElements: ['初遇心动', '误会分离', '事业发展', '感情纠葛', '幸福结局'],
      characterTypes: ['霸道总裁', '独立女性', '温柔暖男', '闺蜜好友', '恶毒女配'],
      writingTips: '对话要自然，情感描写要细腻，现代都市背景要真实'
    },
    { 
      id: 3, 
      name: '悬疑推理', 
      description: '充满悬念和推理的故事',
      style: '紧张刺激，逻辑严密',
      audience: '喜欢烧脑情节的读者',
      keywords: ['推理', '悬疑', '案件', '线索', '真相', '密室', '凶手', '动机'],
      plotElements: ['案件发生', '现场勘查', '证据收集', '推理分析', '真相大白'],
      characterTypes: ['聪明侦探', '神秘凶手', '关键证人', '警察助手', '受害者'],
      writingTips: '逻辑要严密，线索要合理，悬念要适度，结局要意外但合理'
    },
    { 
      id: 4, 
      name: '科幻未来', 
      description: '未来科技和太空探索',
      style: '想象超前，科技感强',
      audience: '科幻爱好者，理工男',
      keywords: ['科技', '未来', '星际', '机器人', '时空', '外星人', '基因', '虚拟现实'],
      plotElements: ['科技发现', '太空探索', '外星接触', '时空穿越', '拯救世界'],
      characterTypes: ['天才科学家', '勇敢探险家', '智能机器人', '外星生物', '未来战士'],
      writingTips: '科技设定要有依据，未来世界要有逻辑，保持科学性和想象力的平衡'
    },
    { 
      id: 5, 
      name: '历史穿越', 
      description: '穿越到古代的故事',
      style: '古韵悠长，历史厚重',
      audience: '历史爱好者，古装剧粉',
      keywords: ['穿越', '古代', '宫廷', '江湖', '权谋', '武功', '才子佳人', '改变历史'],
      plotElements: ['意外穿越', '适应古代', '卷入历史', '改变命运', '功成身退'],
      characterTypes: ['现代穿越者', '古代帝王', '江湖侠客', '才子佳人', '奸臣权贵'],
      writingTips: '历史背景要考证，古代语言要适度，现代知识运用要合理'
    },
    {
      id: 6,
      name: '校园青春',
      description: '校园生活和青春成长',
      style: '青春活力，纯真美好',
      audience: '学生群体，怀念青春的读者',
      keywords: ['校园', '青春', '友情', '初恋', '成长', '梦想', '考试', '社团'],
      plotElements: ['校园生活', '友情建立', '初恋萌芽', '挫折成长', '梦想实现'],
      characterTypes: ['阳光少年', '文静少女', '学霸同桌', '体育健将', '严厉老师'],
      writingTips: '要有青春气息，情感要纯真，校园细节要真实，成长主题要积极'
    },
    {
      id: 7,
      name: '武侠江湖',
      description: '江湖恩怨和武侠传奇',
      style: '豪情万丈，侠义精神',
      audience: '武侠迷，传统文化爱好者',
      keywords: ['武功', '江湖', '侠客', '门派', '恩怨', '宝剑', '绝学', '正邪'],
      plotElements: ['初入江湖', '学艺成长', '江湖恩怨', '正邪对决', '侠之大者'],
      characterTypes: ['少年侠客', '武林高手', '美丽侠女', '邪派魔头', '世外高人'],
      writingTips: '武功描写要精彩，江湖规矩要明确，侠义精神要突出，文字要有古韵'
    }
  ])
  const selectedTemplate = ref(null)
  const keywords = ref('')
  const isGenerating = ref(false)
  const corpus = ref([])
  
  // 写作工具数据
  const characters = ref([])
  const worldSettings = ref([])
  
  // API配置
  const apiConfig = ref({
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    selectedModel: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7
  })
  const isApiConfigured = ref(false)
  
  // 初始化时检查API配置
  const initializeApiConfig = () => {
    try {
      const saved = localStorage.getItem('apiConfig')
      if (saved) {
        const config = JSON.parse(saved)
        apiConfig.value = { ...apiConfig.value, ...config }
        isApiConfigured.value = !!config.apiKey
        apiService.updateConfig(config)
      }
    } catch (error) {
      console.error('初始化API配置失败:', error)
    }
  }
  
  // 立即执行初始化
  initializeApiConfig()
  
  // 摘要功能
  const articleSummary = ref('')
  const isGeneratingSummary = ref(false)
  
  // 写作建议
  const writingAdvice = ref('')
  const isGeneratingAdvice = ref(false)
  
  // 文章统计信息
  const articleStats = ref({
    wordCount: 0,
    readingTime: 0,
    sentiment: '',
    tags: [],
    category: '',
    score: 0
  })

  // 计算属性
  const wordCount = computed(() => {
    // 去除HTML标签，计算纯文本字数，与文章统计保持一致
    return currentNovel.value.replace(/<[^>]*>/g, '').length
  })

  const readingTime = computed(() => {
    // 按照每分钟200字的阅读速度计算
    return Math.ceil(wordCount.value / 200)
  })

  // 方法
  const setCurrentNovel = async (content) => {
    currentNovel.value = content
    await updateStats()
  }

  const setGeneratedContent = (content) => {
    generatedContent.value = content
  }

  const addToNovel = async () => {
    if (generatedContent.value) {
      // 如果当前内容为空，直接设置
      if (!currentNovel.value || currentNovel.value === '<p><br></p>') {
        currentNovel.value = `<p>${generatedContent.value}</p>`
      } else {
        // 如果有内容，添加新段落
        currentNovel.value += `<p><br></p><p>${generatedContent.value}</p>`
      }
      await updateStats()
    }
  }

  const clearNovel = async () => {
    currentNovel.value = ''
    await updateStats()
  }

  const setOutline = (content) => {
    outline.value = content
  }

  const setGeneratingOutline = (status) => {
    isGeneratingOutline.value = status
  }

  const clearOutline = () => {
    outline.value = ''
    chapters.value = []
  }

  // 章节管理方法
  const parseOutlineToChapters = () => {
    const outlineText = outline.value
    const chapterRegex = /###\s*(.+?)\n([\s\S]*?)(?=###|$)/g
    const newChapters = []
    let match
    let index = 1
    
    while ((match = chapterRegex.exec(outlineText)) !== null) {
      newChapters.push({
        id: index++,
        title: match[1].trim(),
        content: match[2].trim(),
        generatedText: '',
        isCompleted: false
      })
    }
    
    chapters.value = newChapters
  }

  const setSelectedChapter = (chapter) => {
    selectedChapter.value = chapter
  }

  const updateChapterContent = (chapterId, content) => {
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      chapter.content = content
    }
  }

  const setChapterGenerated = (chapterId, text) => {
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      chapter.generatedText = text
      chapter.isCompleted = true
    }
  }

  const setGeneratingChapter = (status) => {
    isGeneratingChapter.value = status
  }

  // AI对话功能
  const addChatMessage = (message, isUser = true) => {
    aiChatHistory.value.push({
      id: Date.now(),
      content: message,
      isUser,
      timestamp: new Date().toLocaleTimeString()
    })
  }

  const setChatInput = (input) => {
    currentChatInput.value = input
  }

  const setAiChatting = (status) => {
    isAiChatting.value = status
  }

  const clearChatHistory = () => {
    aiChatHistory.value = []
  }

  const setTemplate = (template) => {
    selectedTemplate.value = template
  }

  const setKeywords = (kw) => {
    keywords.value = kw
  }

  const setGenerating = (status) => {
    isGenerating.value = status
  }

  const addCorpus = (text) => {
    corpus.value.push({
      id: Date.now(),
      content: text,
      createdAt: new Date().toISOString()
    })
  }

  const removeCorpus = (id) => {
    const index = corpus.value.findIndex(item => item.id === id)
    if (index > -1) {
      corpus.value.splice(index, 1)
    }
  }

  const updateStats = async () => {
    // 从HTML中提取纯文本进行统计
    const content = currentNovel.value.replace(/<[^>]*>/g, '')
    
    // 基础统计（立即更新）
    articleStats.value = {
      wordCount: content.length,
      readingTime: Math.ceil(content.length / 200),
      sentiment: analyzeSentiment(content),
      tags: generateTags(content),
      category: categorizeContent(content),
      score: calculateScore(content)
    }
    
    // 如果配置了API且内容足够长，使用AI进行深度分析
    if (isApiConfigured.value && content.length > 100) {
      try {
        await updateStatsWithAI(content)
      } catch (error) {
        console.log('AI分析失败，使用本地分析结果:', error.message)
      }
    }
  }
  
  // 使用AI进行深度文章分析
  const updateStatsWithAI = async (content) => {
    try {
      const analysis = await apiService.analyzeArticle(content)
      
      // 更新AI分析结果
      articleStats.value = {
        ...articleStats.value,
        sentiment: analysis.sentiment || articleStats.value.sentiment,
        tags: analysis.tags || articleStats.value.tags,
        category: analysis.category || articleStats.value.category,
        score: analysis.score || articleStats.value.score,
        aiAnalysis: analysis // 保存完整的AI分析结果
      }
    } catch (error) {
      console.error('AI文章分析失败:', error)
      throw error
    }
  }

  // API配置方法
  const updateApiConfig = (config) => {
    apiConfig.value = { ...apiConfig.value, ...config }
    apiService.updateConfig(apiConfig.value)
    // 检查完整的apiConfig而不只是传入的config
    isApiConfigured.value = !!apiConfig.value.apiKey
  }

  const validateApiKey = async () => {
    try {
      const isValid = await apiService.validateAPIKey()
      isApiConfigured.value = isValid
      return isValid
    } catch (error) {
      console.error('API密钥验证失败:', error)
      isApiConfigured.value = false
      return false
    }
  }

  // 使用真实API生成大纲
  const generateOutlineWithAPI = async (theme) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingOutline(true)
    try {
      const result = await apiService.generateOutline(theme, keywords.value, selectedTemplate.value)
      setOutline(result)
      parseOutlineToChapters()
      return result
    } catch (error) {
      console.error('生成大纲失败:', error)
      throw error
    } finally {
      setGeneratingOutline(false)
    }
  }

  // 流式生成大纲
  const generateOutlineWithAPIStream = async (theme, onChunk = null) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingOutline(true)
    setOutline('')
    
    try {
      const result = await apiService.generateOutlineStream(theme, keywords.value, selectedTemplate.value, (chunk, fullContent) => {
        setOutline(fullContent)
        if (onChunk) onChunk(chunk, fullContent)
      })
      parseOutlineToChapters()
      return result
    } catch (error) {
      console.error('生成大纲失败:', error)
      throw error
    } finally {
      setGeneratingOutline(false)
    }
  }

  // 使用真实API生成章节内容
  const generateChapterWithAPI = async (chapter) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingChapter(true)
    try {
      const previousContent = currentNovel.value.replace(/<[^>]*>/g, '')
      const result = await apiService.generateChapterContent(
        chapter.title,
        chapter.content,
        previousContent,
        selectedTemplate.value,
        characters.value,
        worldSettings.value
      )
      setChapterGenerated(chapter.id, result)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成章节内容失败:', error)
      throw error
    } finally {
      setGeneratingChapter(false)
    }
  }

  // AI对话功能
  const sendChatMessageWithAPI = async (message) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setAiChatting(true)
    
    try {
      const response = await apiService.chatWithAI(message, aiChatHistory.value)
      addChatMessage(response, false)
      return response
    } catch (error) {
      console.error('AI对话失败:', error)
      addChatMessage('抱歉，AI暂时无法回应，请稍后再试。', false)
      throw error
    } finally {
      setAiChatting(false)
    }
  }

  // 摘要相关方法
  const setGeneratingSummary = (status) => {
    isGeneratingSummary.value = status
  }

  const setArticleSummary = (summary) => {
    articleSummary.value = summary
  }

  // 生成文章摘要
  const generateSummaryWithAPI = async (options = {}) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (!currentNovel.value) {
      throw new Error('请先输入文章内容')
    }
    
    isGeneratingSummary.value = true
    try {
      const content = currentNovel.value.replace(/<[^>]*>/g, '')
      const summary = await apiService.generateSummary(content, options)
      articleSummary.value = summary
      return summary
    } catch (error) {
      console.error('生成摘要失败:', error)
      throw error
    } finally {
      isGeneratingSummary.value = false
    }
  }

  // 获取写作建议
  const getWritingAdviceWithAPI = async () => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (!currentNovel.value) {
      throw new Error('请先输入文章内容')
    }
    
    isGeneratingAdvice.value = true
    try {
      const content = currentNovel.value.replace(/<[^>]*>/g, '')
      const advice = await apiService.getWritingAdvice(content)
      writingAdvice.value = advice
      return advice
    } catch (error) {
      console.error('获取写作建议失败:', error)
      throw error
    } finally {
      isGeneratingAdvice.value = false
    }
  }

  // 基于语料库生成个性化内容
  const generatePersonalizedContent = async (prompt) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (corpus.value.length === 0) {
      throw new Error('请先添加语料库内容')
    }
    
    setGenerating(true)
    try {
      const result = await apiService.generatePersonalizedContent(prompt, corpus.value)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成个性化内容失败:', error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // 使用真实API生成通用内容
  const generateContentWithAPI = async (keywords, template, outline, wordLimit) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    try {
      const result = await apiService.generateGeneralContent(keywords, template, outline, wordLimit)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成内容失败:', error)
      throw error
    }
  }

  // 流式生成内容
  const generateContentWithAPIStream = async (keywords, template, outline, wordLimit, onChunk = null) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGenerating(true)
    setGeneratedContent('') // 清空之前的内容
    
    try {
      const result = await apiService.generateGeneralContentStream(keywords, template, outline, wordLimit, (chunk, fullContent) => {
        // 实时更新生成的内容
        setGeneratedContent(fullContent)
        console.log('流式内容更新:', chunk) // 添加调试日志
        if (onChunk) onChunk(chunk, fullContent)
      })
      console.log('流式生成完成:', result) // 添加调试日志
      return result
    } catch (error) {
      console.error('生成内容失败:', error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // 语料库管理
  const addCorpusFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        addCorpus(content)
        resolve(content)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const exportCorpus = () => {
    const data = JSON.stringify(corpus.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'corpus.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCorpus = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          corpus.value = data
          resolve(data)
        } catch (error) {
          reject(new Error('语料库文件格式错误'))
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // 简单的情感分析
  const analyzeSentiment = (content) => {
    const positiveWords = ['快乐', '幸福', '美好', '成功', '胜利', '爱', '喜欢']
    const negativeWords = ['悲伤', '痛苦', '失败', '死亡', '恐惧', '愤怒', '绝望']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      positiveCount += (content.match(new RegExp(word, 'g')) || []).length
    })
    
    negativeWords.forEach(word => {
      negativeCount += (content.match(new RegExp(word, 'g')) || []).length
    })
    
    if (positiveCount > negativeCount) return '积极'
    if (negativeCount > positiveCount) return '消极'
    return '中性'
  }

  // 生成标签
  const generateTags = (content) => {
    const tags = []
    if (content.includes('修仙') || content.includes('仙人')) tags.push('修仙')
    if (content.includes('爱情') || content.includes('恋人')) tags.push('爱情')
    if (content.includes('悬疑') || content.includes('推理')) tags.push('悬疑')
    if (content.includes('科幻') || content.includes('未来')) tags.push('科幻')
    if (content.includes('古代') || content.includes('穿越')) tags.push('古代')
    return tags
  }

  // 内容分类
  const categorizeContent = (content) => {
    if (content.includes('修仙') || content.includes('异世界')) return '玄幻'
    if (content.includes('都市') || content.includes('现代')) return '都市'
    if (content.includes('悬疑') || content.includes('推理')) return '悬疑'
    if (content.includes('科幻') || content.includes('未来')) return '科幻'
    if (content.includes('古代') || content.includes('历史')) return '历史'
    return '其他'
  }

  // 计算文章评分
  const calculateScore = (content) => {
    let score = 50 // 基础分
    
    // 根据字数调整分数
    if (content.length > 1000) score += 10
    if (content.length > 3000) score += 10
    if (content.length > 5000) score += 10
    
    // 根据段落数调整分数
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    if (paragraphs.length > 3) score += 5
    if (paragraphs.length > 6) score += 5
    
    // 根据对话调整分数
    const dialogues = (content.match(/[""]/g) || []).length
    if (dialogues > 4) score += 5
    
    return Math.min(100, score)
  }

  // 人物管理方法
  const addCharacter = (character) => {
    characters.value.push({
      id: Date.now(),
      ...character,
      traits: character.traitsInput ? character.traitsInput.split(',').map(t => t.trim()).filter(t => t) : []
    })
  }
  
  const removeCharacter = (id) => {
    characters.value = characters.value.filter(char => char.id !== id)
  }
  
  // 世界观设定管理方法
  const addWorldSetting = (setting) => {
    worldSettings.value.push({
      id: Date.now(),
      ...setting
    })
  }
  
  const removeWorldSetting = (id) => {
    worldSettings.value = worldSettings.value.filter(setting => setting.id !== id)
  }

  return {
    // 状态
    currentNovel,
    generatedContent,
    outline,
    isGeneratingOutline,
    chapters,
    selectedChapter,
    isGeneratingChapter,
    aiChatHistory,
    currentChatInput,
    isAiChatting,
    templates,
    selectedTemplate,
    keywords,
    isGenerating,
    corpus,
    characters,
    worldSettings,
    articleStats,
    apiConfig,
    isApiConfigured,
    articleSummary,
    isGeneratingSummary,
    writingAdvice,
    isGeneratingAdvice,
    
    // 计算属性
    wordCount,
    readingTime,
    
    // 方法
    setCurrentNovel,
    setGeneratedContent,
    addToNovel,
    clearNovel,
    setOutline,
    setGeneratingOutline,
    clearOutline,
    parseOutlineToChapters,
    setSelectedChapter,
    updateChapterContent,
    setChapterGenerated,
    setGeneratingChapter,
    addChatMessage,
    setChatInput,
    setAiChatting,
    clearChatHistory,
    setTemplate,
    setKeywords,
    setGenerating,
    addCorpus,
    removeCorpus,
    addCharacter,
    removeCharacter,
    addWorldSetting,
    removeWorldSetting,
    updateStats,
    
    // API相关方法
    updateApiConfig,
    validateApiKey,
    generateOutlineWithAPI,
    generateOutlineWithAPIStream,
    generateChapterWithAPI,
    sendChatMessageWithAPI,
    generateSummaryWithAPI,
    getWritingAdviceWithAPI,
    generatePersonalizedContent,
    generateContentWithAPI,
    generateContentWithAPIStream,
    addCorpusFromFile,
    exportCorpus,
    importCorpus,
    setGeneratingSummary,
    setArticleSummary
  }
})