# 🚀 NOFX 快速部署指南

## 三步完成部署

### 第一步: 推送代码到 GitHub

```bash
# 在本地项目目录执行
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 第二步: 等待镜像构建

1. 访问 GitHub Actions: https://github.com/1160209918/20251212/actions
2. 查看 "Build and Push Docker Images" 工作流
3. 等待构建完成 (约 5-10 分钟)
4. 看到绿色 ✅ 表示成功

### 第三步: 服务器一键部署

```bash
curl -fsSL https://raw.githubusercontent.com/1160209918/20251212/main/install.sh | bash
```

## 访问应用

```
Web 界面: http://YOUR_SERVER_IP:3000
API 端点: http://YOUR_SERVER_IP:8080
```

## 常用命令

```bash
# 查看日志
cd ~/nofx && docker compose logs -f

# 重启服务
cd ~/nofx && docker compose restart

# 更新到最新版本
cd ~/nofx && docker compose pull && docker compose up -d

# 停止服务
cd ~/nofx && docker compose down
```

## 首次配置 GitHub

如果是第一次部署,需要配置 GitHub Actions 权限:

1. 进入仓库 Settings → Actions → General
2. "Workflow permissions" 选择 "Read and write permissions"
3. 勾选 "Allow GitHub Actions to create and approve pull requests"
4. 点击 Save

## 故障排查

**镜像拉取失败?**
```bash
# 检查镜像是否存在
docker pull ghcr.io/1160209918/20251212/nofx-backend:latest
```

**端口被占用?**
```bash
# 修改端口
cd ~/nofx
nano .env
# 修改 NOFX_FRONTEND_PORT=8888
docker compose up -d
```

**查看详细日志?**
```bash
cd ~/nofx
docker compose logs nofx        # 后端日志
docker compose logs nofx-frontend  # 前端日志
```

---

详细文档请查看: [DEPLOYMENT.md](./DEPLOYMENT.md)