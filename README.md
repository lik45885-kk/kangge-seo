# 康哥搜索笔记｜kangge-seo

个人搜索营销作品集与经验分享站。

**在线地址：https://lik45885-kk.github.io/kangge-seo/**

## 这是什么

一个长期维护的个人 SEO 实践项目：通过持续发布原创内容、完善技术 SEO、推动搜索引擎发现与收录，积累个人专业展示与自然搜索流量。

内容聚焦 B2B 搜索营销，包括关键词与搜索意图、账户结构、广告创意、落地页承接、数据复盘与投放协作。

## 站点结构

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：个人介绍与网站定位 |
| `/resources/` | 资源中心：31 篇搜索营销实践笔记 |
| `/about/` | 我的经历 |
| `/about/photography/` | 我的摄影 |
| `/contact/` | 微信、电话与邮箱 |

## 技术说明

- 纯静态站点，HTML / CSS / JavaScript，无构建依赖
- 由 GitHub Pages 发布，`main` 分支每次推送后自动更新
- `sitemap.xml` 覆盖全部 105 个可索引 URL，含 `lastmod`
- `robots.txt` 全站放行并声明 sitemap
- 每篇文章含 `canonical`、Open Graph、BlogPosting 与 BreadcrumbList 结构化数据
- `scripts/seo-preflight.py` 在每次推送时检查 sitemap、canonical、标题与描述
- `scripts/submit_indexnow.py` 在 Pages 发布后向 IndexNow 提交变更 URL

## 目录

```
├── index.html            首页
├── resources/            资源中心（31 篇笔记 + 列表页）
├── about/                经历与摄影
├── contact/              联系方式
├── assets/               样式、脚本与图片
├── content/              文章系列源数据（JSON）
├── scripts/              SEO 校验与 IndexNow 提交脚本
├── sitemap.xml
└── robots.txt
```

## 说明

文章均为个人实践中的方法总结，涉及示例词或数字用于说明思路，并非具体客户的真实投放结果。广告平台功能与规则以官方最新说明为准。
