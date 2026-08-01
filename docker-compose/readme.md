### docker-compose 部署教程
- 将 `docker-compose.yml` 放入独立部署目录，并在同级创建 `plugins/` 目录。
- 镜像自带绘图插件；`./plugins:/app/plugins:ro` 只读挂载同级外挂插件目录，不会遮盖镜像内置插件。
- 部署或更新外挂插件时，将完整插件目录复制到 `plugins/` 中，然后在管理页面刷新插件，无需重新构建镜像。
- 外挂插件与内置插件 ID 相同时，优先加载外挂版本，可用于独立更新内置插件。
- ```shell
  # 启动
  docker-compose up -d
  ```
- ```shell
  # 查看运行状态
  docker ps
  ```
- ```shell
  # 结束运行
  docker-compose down
  ```
