const jobsData = {
  "2026-07-21": {
    total: 6,
    newCompanies: ["追觅科技", "Urbanic", "Canva可画"],
    top5: [
      {
        company: "追觅科技",
        title: "品牌营销总监",
        city: "苏州",
        salary: "面议",
        url: "https://www.liepin.com/job/1978228547.shtml",
        source: "猎聘",
        isNewCompany: true,
        notes: "全球品牌定位+视觉体系搭建，8年+经验，3年+海外市场（欧美），英语流利"
      },
      {
        company: "追觅科技",
        title: "品牌营销经理",
        city: "苏州/深圳",
        salary: "面议",
        url: "https://www.liepin.com/job/1976340821.shtml",
        source: "猎聘",
        isNewCompany: true,
        notes: "3-5年经验，品牌传播+公关策略+社媒运营，3C/消费电子经验优先"
      },
      {
        company: "Urbanic",
        title: "品牌/市场相关岗位",
        city: "杭州/广州",
        salary: "面议",
        url: "https://www.liepin.com/company-jobs/9700081/",
        source: "猎聘",
        isNewCompany: true,
        notes: "跨境电商独角兽，专注新兴市场时尚品牌，团队来自Alibaba/Google/Zara"
      },
      {
        company: "Canva可画",
        title: "Creative Strategist, Growth Marketing",
        city: "米兰（远程/全球）",
        salary: "面议",
        url: "https://www.lifeatcanva.com/zh/%E5%9C%A8%E6%8B%9B%E8%81%8C%E4%BD%8D/",
        source: "Canva官网",
        isNewCompany: true,
        notes: "全球知名设计平台，Growth Marketing方向，12个月合同制"
      },
      {
        company: "Mondelez亿滋国际",
        title: "Brand Manager, Chocolate and Imports",
        city: "上海",
        salary: "面议",
        url: "https://mdlz.wd3.myworkdayjobs.com/external/job/Brand-Manager--Chocolate-and-Imports--Marketing---Growth--China_R-171129",
        source: "Mondelez官网",
        isNewCompany: false,
        notes: "7天前新发布，巧克力及进口品类品牌管理，500强外企"
      },
      {
        company: "壹贰壹营销咨询(EXE Group)",
        title: "中国品牌出海主管/经理",
        city: "深圳",
        salary: "面议",
        url: "https://www.zhipin.com/job_detail/ed98f20d7e8bf58603V73NW5FVtT.html",
        source: "BOSS直聘",
        isNewCompany: true,
        notes: "专注中国品牌出海营销咨询，3-10年经验，科技/生活方式领域，双语工作"
      }
    ]
  }
};

// 如果 dashboard/jobs-data.js 已存在，追加数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = jobsData;
}
