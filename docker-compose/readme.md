### docker-compose 部署教程
- 将 `docker-compose.yml` 放入独立部署目录，并在同级创建 `plugins/` 目录。
- `./plugins:/app/plugins:ro` 会将同级插件目录只读挂载到容器；部署或更新插件时，将完整插件目录复制到其中。
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
