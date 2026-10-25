# 订单数据契约

每个字段由当前会话订单详情转写并核实，不直接接受工具原始对象。只保留本契约白名单。

```json
{
  "workspaceKey": "random-local-studio-id",
  "orders": [
    {
      "id": "order_hash_1",
      "date": "2026-10-25",
      "label": "10 月 25 日",
      "title": "我的订单",
      "lines": [
        {
          "id": "line_hash_1",
          "name": "中薯条",
          "quantity": 1,
          "recipe": [
            {"name":"单根薯条","color":"fries","shape":"singleFry","count":30},
            {"name":"中薯纸盒","color":"red","shape":"friesBox","count":1}
          ]
        }
      ]
    }
  ]
}
```

本例为虚构输入，不是真实订单，也不作为默认订单注入。套餐 line 含 children 数组，每个子项结构同单品，仅支持一层 children。父套餐不提供 recipe。只生成用户已选择的子项，数量按父份数乘子份数计算。

支持的常用已确认外形：singleFry、friesBox、iceCube、liquid、cup、cone、softServe、plainBunTop、bunBottom、singlePatty、slice、sauce、wing、honeyVWing；其他键先在模板中检查，不猜测。

color 可选：bun、beef、cheese、sauce、cola、paper、fries、red、ice、cream、lettuce、tomato、onion、chicken、fish。count 为1至100整数；零数量不输出对应行。

ID 使用ASCII字母、数字、下划线或短横线，最长80；所有订单和餐品ID全局不重复。保留稳定ID与旧recipe次序；新增配料应追加，不能悄悄重排旧索引。workspaceKey 是随机本地命名空间，不是身份认证或账号密钥。

当前模板仅实现已注入目录的作品续作，不具备联网刷新菜单/订单或账户登录。更新同一工作室时需要保留旧目录，以免旧参考来源缺失。用户在同一浏览器同一来源下打开时可以读取相同workspaceKey的参考；跨设备、跨域或file来源策略不同不保证自动迁移。
