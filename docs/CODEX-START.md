# Codex 启动指令

把本目录放入项目仓库，例如 `docs/design/`。请阅读 `DESIGN.md` 全文及其中链接的 `assets/*.png` 页面设计图，再按其中的 P0 需求执行开发。

先检查当前仓库与运行环境，列出实现计划后直接实施，不要只输出建议或静态 UI 截图。采用 Next.js + TypeScript + Tailwind CSS，静态导出到 Cloudflare Pages，EN/ES/AR 三种语言，12 个核心页面，两套独立检测规则，共享本地硬件库。无数据库、无后台服务。确保阿拉伯语 RTL 与 SEO self-canonical、hreflang 正确。图片仅是 UI 示意，不得当成生产性能分数；不可伪造官方配置、游戏 FPS、硬件基准或 Leonida 可玩性。缺失依据返回 Unknown，标注证据及数据版本。实现前复核文档 §12 动态资料。

完成 P0 后执行文档 §10 验收矩阵及构建测试，输出实际实现清单、数据覆盖数、测试结果、静态部署方式、已知限制。P1 在 P0 验收后再执行，P2 暂不开发。
