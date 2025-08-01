# Node.js 公式イメージをベースとして使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# libvips（sharpに必要）をインストール
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 実行ユーザを非rootに変更
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# ポートの露出（必要に応じて）
# EXPOSE 3000

# 実行ディレクトリとしてマウントポイントを作成
VOLUME ["/input", "/output"]

# エントリーポイントを設定
ENTRYPOINT ["node", "dist/bin/index.js"]

# デフォルト引数
CMD ["/input", "--output", "/output"]
