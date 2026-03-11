# website/Dockerfile
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量，加速 npm 安装 (使用淘宝镜像/华为镜像)
# RUN npm config set registry https://registry.npmmirror.com/

# 拷贝依赖配置
COPY package*.json ./

# 仅安装生产环境依赖
RUN npm install --production

# 拷贝项目文件
COPY . .

# 暴露 server.js 监听的 3000 端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
