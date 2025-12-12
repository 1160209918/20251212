# NOFX 一键部署指南

本文档说明如何将你修改后的 NOFX 项目部署到服务器。

## 📋 部署流程概览

```
本地修改代码 → 推送到 GitHub → GitHub Actions 自动构建镜像 → 服务器一键部署
```

## 🔧 前置准备

### 1. GitHub 仓库设置

你的仓库地址: `https://github.com/1160209918/20251212`

确保已完成:
- ✅ 代码已推送到 GitHub
- ✅ 仓库设置为 Public (或配置 GHCR 访问权限)

### 2. 启用 GitHub Container Registry (GHCR)

GitHub Actions 会自动将构建的 Docker 镜像推送到 GHCR。

**配置步骤:**

1. 进入仓库 Settings → Actions → General
2. 找到 "Workflow permissions"
3. 选择 "Read and write permissions"
4. 勾选 "Allow GitHub Actions to create and approve pull requests"
5. 点击 Save

### 3. 触发镜像构建

推送代码到 `main` 分支会自动触发构建:

```bash
git add .
git commit -m "Update deployment configuration"
git push origin main
```

或手动触发:
1. 进入 GitHub 仓库
2. 点击 Actions 标签
3. 选择 "Build and Push Docker Images"
4. 点击 "Run workflow"

### 4. 查看构建状态

在 Actions 页面查看构建进度:
- ✅ 绿色勾号 = 构建成功
- ❌ 红色叉号 = 构建失败 (查看日志排查)

构建完成后,镜像会推送到:
- `ghcr.io/1160209918/20251212/nofx-backend:latest`
- `ghcr.io/1160209918/20251212/nofx-frontend:latest`

## 🚀 服务器部署

### 方式一: 一键部署脚本 (推荐)

在服务器上执行:

```bash
curl -fsSL https://raw.githubusercontent.com/1160209918/20251212/main/install.sh | bash
```

**自定义安装目录:**

```bash
curl -fsSL https://raw.githubusercontent.com/1160209918/20251212/main/install.sh | bash -s -- /opt/nofx
```

### 方式二: 手动部署

```bash
# 1. 创建安装目录
mkdir -p ~/nofx && cd ~/nofx

# 2. 下载 docker-compose 配置
curl -O https://raw.githubusercontent.com/1160209918/20251212/main/docker-compose.prod.yml

# 3. 创建 .env 文件 (自动生成密钥)
cat > .env << 'EOF'
NOFX_BACKEND_PORT=8080
NOFX_FRONTEND_PORT=3000
TZ=Asia/Shanghai
JWT_SECRET=$(openssl rand -base64 32)
DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)
RSA_PRIVATE_KEY=$(openssl genrsa 2048 2>/dev/null | tr '\n' '\\' | sed 's/\\/\\n/g')
EOF

# 4. 拉取镜像并启动
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 🌐 访问应用

部署成功后,通过以下地址访问:

- **Web 界面**: `http://YOUR_SERVER_IP:3000`
- **API 端点**: `http://YOUR_SERVER_IP:8080`

## 🔄 更新部署

### 更新代码后重新部署

```bash
# 1. 本地推送代码
git push origin main

# 2. 等待 GitHub Actions 构建完成 (约 5-10 分钟)

# 3. 服务器上更新
cd ~/nofx
docker compose pull
docker compose up -d
```

### 快速更新命令

```bash
cd ~/nofx && docker compose pull && docker compose up -d
```

## 📊 管理命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 查看后端日志
docker compose logs -f nofx

# 查看前端日志
docker compose logs -f nofx-frontend

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 停止并删除数据
docker compose down -v
```

## 🐛 故障排查

### 问题 1: 镜像拉取失败

**错误信息**: `Error response from daemon: manifest unknown`

**原因**: GitHub Actions 还未构建镜像,或镜像仓库权限问题

**解决方案**:
1. 检查 GitHub Actions 是否构建成功
2. 确保仓库为 Public,或配置 GHCR 访问令牌
3. 手动拉取测试: `docker pull ghcr.io/1160209918/20251212/nofx-backend:latest`

### 问题 2: 服务无法访问

**检查步骤**:

```bash
# 1. 检查容器是否运行
docker compose ps

# 2. 检查端口是否监听
netstat -tlnp | grep -E '3000|8080'

# 3. 检查防火墙
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 8080

# 4. 查看容器日志
docker compose logs
```

### 问题 3: 后端健康检查失败

```bash
# 查看后端日志
docker compose logs nofx

# 手动测试健康检查
curl http://localhost:8080/api/health

# 进入容器调试
docker compose exec nofx sh
```

### 问题 4: 数据库初始化失败

```bash
# 删除旧数据库重新初始化
cd ~/nofx
docker compose down
rm -rf data/
docker compose up -d
```

## 🔐 安全建议

1. **修改默认端口** (可选):
   ```bash
   # 编辑 .env 文件
   NOFX_FRONTEND_PORT=8888
   NOFX_BACKEND_PORT=9999
   ```

2. **配置 HTTPS** (生产环境推荐):
   使用 Nginx 反向代理 + Let's Encrypt SSL 证书

3. **备份数据**:
   ```bash
   # 备份数据库和配置
   tar -czf nofx-backup-$(date +%Y%m%d).tar.gz ~/nofx/data ~/nofx/.env
   ```

4. **定期更新**:
   ```bash
   # 每周检查更新
   cd ~/nofx
   docker compose pull
   docker compose up -d
   ```

## 📦 镜像信息

**后端镜像**: `ghcr.io/1160209918/20251212/nofx-backend:latest`
- 基于 Go 1.25 + Alpine
- 包含 TA-Lib 技术指标库
- 支持 amd64 和 arm64 架构

**前端镜像**: `ghcr.io/1160209918/20251212/nofx-frontend:latest`
- 基于 Nginx + Alpine
- React 18 + TypeScript 5 + Vite
- 支持 amd64 和 arm64 架构

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/1160209918/20251212
- **镜像仓库**: https://github.com/1160209918/20251212/pkgs/container/20251212
- **原项目**: https://github.com/NoFxAiOS/nofx

## ❓ 常见问题

**Q: 需要上传依赖库吗?**

A: 不需要!Docker 镜像已经包含所有依赖:
- Go 依赖通过 `go.mod` 自动下载
- Node 依赖通过 `package.json` 自动安装
- 系统依赖 (TA-Lib) 在构建时编译

**Q: 如何验证部署的是我的版本?**

A: 检查镜像标签和构建时间:
```bash
docker images | grep nofx
docker inspect ghcr.io/1160209918/20251212/nofx-backend:latest | grep Created
```

**Q: 可以使用 Docker Hub 代替 GHCR 吗?**

A: 可以!修改 `.github/workflows/docker-build.yml`,添加 Docker Hub 凭据到 GitHub Secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

**Q: 如何回滚到之前的版本?**

A: 使用特定的镜像标签:
```bash
# 查看可用标签
docker images ghcr.io/1160209918/20251212/nofx-backend

# 修改 docker-compose.prod.yml 中的镜像标签
image: ghcr.io/1160209918/20251212/nofx-backend:main-abc1234

# 重新部署
docker compose up -d
```

## 📝 下一步

1. ✅ 推送代码到 GitHub
2. ✅ 等待 GitHub Actions 构建镜像
3. ✅ 在服务器上运行一键部署脚本
4. ✅ 访问 `http://YOUR_SERVER_IP:3000` 开始使用

祝部署顺利! 🎉