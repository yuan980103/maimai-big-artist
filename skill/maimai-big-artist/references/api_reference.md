# 订单工具边界

当前已知只读能力为 mcp__mcd-mcp__order-list，无参数；mcp__mcd-mcp__query-order，参数orderId字符串。始终先加载当前宿主工具声明，使用本次列表返回的真实orderId查询详情。

本发行包不提供认证凭证。官方 MCP Server 地址为 https://mcp.mcd.cn，使用 Streamable HTTP，并通过 `Authorization: Bearer <个人 MCP Token>` 认证。每位用户在 https://open.mcd.cn/mcp 登录并申请自己的 Token，再按 https://github.com/M-China/mcd-mcp-server 在自己的 MCP Client 中配置。无工具时不得声称已经联网同步，不得要求用户在对话中粘贴 Token，也不要生成虚构安装链接。

公开文档描述的是 MCP Client 持有 Token 并代为调用的接入方式，不是网页 OAuth。不得从浏览器 HTML 直接携带个人长期 Token 请求 MCP，也不得在公开前端中保存 Token。此 Skill 完成的是当前授权会话中的订单读取与个人网页生成/打开。

完整数据格式参见 order-contract.md。只将筛选脱敏后的白名单数据交给本地构建器。
