// 用户偏好学习系统
// 根据用户的标记行为（适合投递/不合适）学习偏好，迭代优化推荐

const PreferenceEngine = {
  // 加载用户偏好数据
  loadPreferences() {
    try {
      const saved = localStorage.getItem('jobPreferences');
      if (!saved || saved === '{}') {
        return this.getDefaultPreferences();
      }
      return JSON.parse(saved);
    } catch(e) {
      return this.getDefaultPreferences();
    }
  },

  // 默认偏好（新用户）
  getDefaultPreferences() {
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      liked: {
        companies: [],      // 喜欢的公司
        titles: [],         // 喜欢的岗位关键词
        types: [],          // 喜欢的岗位类型
        cities: ['深圳', '上海'],  // 默认偏好
        salaryMin: 20,      // 最低薪资要求(k)
        keywords: [],       // JD中出现的高频正向关键词
        industries: []      // 行业偏好
      },
      disliked: {
        companies: [],      // 不喜欢的公司
        titles: [],         // 不喜欢的岗位关键词
        types: [],          // 不喜欢的岗位类型
        keywords: [],       // JD中出现的高频负向关键词
        requirements: []    // 硬性要求（如5年以上）
      },
      weights: {
        company: 3,         // 公司权重
        title: 2,           // 岗位名权重
        type: 2,            // 岗位类型权重
        city: 2,            // 城市权重
        salary: 1.5,        // 薪资权重
        keywords: 2,        // 关键词权重
        industry: 1.5       // 行业权重
      },
      // 统计
      stats: {
        totalMarked: 0,
        likedCount: 0,
        dislikedCount: 0,
        pendingCount: 0
      }
    };
  },

  // 保存偏好
  savePreferences(prefs) {
    prefs.lastUpdated = new Date().toISOString();
    localStorage.setItem('jobPreferences', JSON.stringify(prefs));
  },

  // 提取文本关键词（简单分词）
  extractKeywords(text, minLength = 2) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= minLength)
      .filter(w => !this.stopWords.includes(w));
  },

  // 停用词
  stopWords: ['的', '了', '和', '是', '在', '有', '被', '与', '及', '或', 'the', 'and', 'for', 'with', 'you', 'your', 'our', 'we', 'to', 'of', 'a', 'an', 'is', 'are', 'be', 'this', 'that'],

  // 分析岗位特征
  analyzeJob(job) {
    const titleKeywords = this.extractKeywords(job.title);
    const descKeywords = this.extractKeywords(job.desc);
    const jdKeywords = this.extractKeywords(job.jd);
    const allKeywords = [...new Set([...titleKeywords, ...descKeywords, ...jdKeywords])];
    
    // 提取行业信息
    const industries = [];
    if (job.jd.includes('AI') || job.jd.includes('人工智能') || job.jd.includes('大模型')) industries.push('AI');
    if (job.jd.includes('电商') || job.jd.includes('电商') || job.title.includes('电商')) industries.push('电商');
    if (job.jd.includes('品牌') || job.title.includes('品牌')) industries.push('品牌');
    if (job.jd.includes('出海') || job.jd.includes('国际化') || job.jd.includes('海外')) industries.push('出海');
    if (job.jd.includes('消费品') || job.jd.includes('快消')) industries.push('消费品');
    if (job.jd.includes('SaaS') || job.jd.includes('B端')) industries.push('SaaS');
    
    return {
      company: job.company,
      title: job.title,
      type: job.type,
      city: job.city,
      salaryMin: this.extractMinSalary(job.salary),
      keywords: allKeywords.slice(0, 20),
      industries
    };
  },

  // 提取最低薪资
  extractMinSalary(salary) {
    const m = salary.match(/(\d+)/);
    return m ? parseInt(m[1]) : 0;
  },

  // 用户标记岗位时调用
  onJobMarked(jobIndex, status) {
    const prefs = this.loadPreferences();
    const job = window.jobs[jobIndex];
    if (!job) return;

    const features = this.analyzeJob(job);
    prefs.stats.totalMarked++;

    if (status === 'good') {
      prefs.stats.likedCount++;
      // 添加到喜欢
      this.addToLiked(prefs.liked, features);
    } else if (status === 'bad') {
      prefs.stats.dislikedCount++;
      // 添加到不喜欢
      this.addToDisliked(prefs.disliked, features);
    } else {
      prefs.stats.pendingCount++;
    }

    // 重新计算权重
    this.recalculateWeights(prefs);
    
    // 保存
    this.savePreferences(prefs);
    
    // 触发推荐更新
    this.updateRecommendations();
  },

  // 添加到喜欢列表
  addToLiked(liked, features) {
    // 公司
    if (!liked.companies.includes(features.company)) {
      liked.companies.push(features.company);
    }
    // 岗位类型
    if (!liked.types.includes(features.type)) {
      liked.types.push(features.type);
    }
    // 城市
    if (!liked.cities.includes(features.city)) {
      liked.cities.push(features.city);
    }
    // 关键词
    features.keywords.forEach(kw => {
      if (!liked.keywords.includes(kw)) {
        liked.keywords.push(kw);
      }
    });
    // 行业
    features.industries.forEach(ind => {
      if (!liked.industries.includes(ind)) {
        liked.industries.push(ind);
      }
    });
  },

  // 添加到不喜欢列表
  addToDisliked(disliked, features) {
    // 公司
    if (!disliked.companies.includes(features.company)) {
      disliked.companies.push(features.company);
    }
    // 岗位类型
    if (!disliked.types.includes(features.type)) {
      disliked.types.push(features.type);
    }
    // 关键词
    features.keywords.forEach(kw => {
      if (!disliked.keywords.includes(kw)) {
        disliked.keywords.push(kw);
      }
    });
  },

  // 重新计算权重（基于正反馈/负反馈比例）
  recalculateWeights(prefs) {
    const total = prefs.stats.likedCount + prefs.stats.dislikedCount;
    if (total < 5) return; // 数据不足，保持默认权重

    const ratio = prefs.stats.likedCount / total;
    
    // 根据反馈调整权重
    if (ratio > 0.7) {
      // 用户很挑剔，提高匹配严格度
      prefs.weights.company = 4;
      prefs.weights.keywords = 3;
    } else if (ratio < 0.3) {
      // 用户很宽松，降低匹配严格度
      prefs.weights.company = 2;
      prefs.weights.keywords = 1.5;
    }
  },

  // 计算岗位匹配分数
  calculateScore(job) {
    const prefs = this.loadPreferences();
    const features = this.analyzeJob(job);
    let score = 0;
    let maxScore = 0;

    // 公司匹配
    if (prefs.liked.companies.includes(features.company)) {
      score += prefs.weights.company;
    }
    if (prefs.disliked.companies.includes(features.company)) {
      score -= prefs.weights.company * 2;
    }
    maxScore += prefs.weights.company;

    // 岗位类型匹配
    if (prefs.liked.types.includes(features.type)) {
      score += prefs.weights.type;
    }
    if (prefs.disliked.types.includes(features.type)) {
      score -= prefs.weights.type * 2;
    }
    maxScore += prefs.weights.type;

    // 城市匹配
    if (prefs.liked.cities.includes(features.city)) {
      score += prefs.weights.city;
    }
    maxScore += prefs.weights.city;

    // 关键词匹配
    const likedKeywordMatches = features.keywords.filter(kw => prefs.liked.keywords.includes(kw)).length;
    const dislikedKeywordMatches = features.keywords.filter(kw => prefs.disliked.keywords.includes(kw)).length;
    score += (likedKeywordMatches / Math.max(features.keywords.length, 1)) * prefs.weights.keywords;
    score -= (dislikedKeywordMatches / Math.max(features.keywords.length, 1)) * prefs.weights.keywords * 2;
    maxScore += prefs.weights.keywords;

    // 行业匹配
    const likedIndustryMatches = features.industries.filter(ind => prefs.liked.industries.includes(ind)).length;
    score += (likedIndustryMatches / Math.max(features.industries.length, 1)) * prefs.weights.industry;
    maxScore += prefs.weights.industry;

    // 薪资匹配（高于最低要求加分）
    if (features.salaryMin >= prefs.liked.salaryMin) {
      score += prefs.weights.salary * 0.5;
    }
    maxScore += prefs.weights.salary;

    // 归一化到 0-100
    const normalizedScore = Math.max(0, Math.min(100, (score / maxScore) * 50 + 50));
    
    return {
      score: Math.round(normalizedScore),
      features,
      matchedKeywords: features.keywords.filter(kw => prefs.liked.keywords.includes(kw)),
      dislikedKeywords: features.keywords.filter(kw => prefs.disliked.keywords.includes(kw))
    };
  },

  // 获取推荐排序后的岗位列表
  getRecommendedJobs(jobs) {
    const scored = jobs.map((job, index) => ({
      ...job,
      index,
      ...this.calculateScore(job)
    }));

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    return scored;
  },

  // 获取不推荐原因（用于调试）
  getNotRecommendedReason(job) {
    const prefs = this.loadPreferences();
    const features = this.analyzeJob(job);
    const reasons = [];

    if (prefs.disliked.companies.includes(features.company)) {
      reasons.push(`公司"${features.company}"被标记为不喜欢`);
    }
    if (prefs.disliked.types.includes(features.type)) {
      reasons.push(`岗位类型"${features.type}"被标记为不喜欢`);
    }
    const badKeywords = features.keywords.filter(kw => prefs.disliked.keywords.includes(kw));
    if (badKeywords.length > 0) {
      reasons.push(`包含不喜欢的关键词: ${badKeywords.join(', ')}`);
    }

    return reasons;
  },

  // 更新推荐（重新渲染看板）
  updateRecommendations() {
    // 触发看板重新渲染
    if (typeof render === 'function') {
      render();
    }
  },

  // 导出偏好数据（用于飞书推送时的搜集优化）
  exportPreferences() {
    const prefs = this.loadPreferences();
    return {
      likedCompanies: prefs.liked.companies,
      likedTypes: prefs.liked.types,
      likedCities: prefs.liked.cities,
      likedKeywords: prefs.liked.keywords,
      likedIndustries: prefs.liked.industries,
      dislikedCompanies: prefs.disliked.companies,
      dislikedTypes: prefs.disliked.types,
      dislikedKeywords: prefs.disliked.keywords,
      stats: prefs.stats
    };
  },

  // 重置偏好
  reset() {
    localStorage.removeItem('jobPreferences');
    localStorage.removeItem('jobStatuses');
  }
};

// 暴露到全局
window.PreferenceEngine = PreferenceEngine;
