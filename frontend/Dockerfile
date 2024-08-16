# Dockerfile

FROM node:18.16.0-alpine3.17
RUN mkdir -p /swecha/ehrs/frontend
WORKDIR /swecha/ehrs/frontend

# Access the environment variable passed by Docker Compose
ARG PORT
ENV PORT=$PORT

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_PREVIEW_PORT
ENV VITE_PREVIEW_PORT=$VITE_PREVIEW_PORT

ARG HOST
ENV HOST=$HOST

# Copy the complete backend
COPY . .

# Install the prerequisites
RUN npm install --location=global pnpm
RUN npx update-browserslist-db@latest
# RUN npm install --location=global nodemon

# Install the dependencies
RUN pnpm i

EXPOSE $PORT
CMD [ "pnpm", "dev", "--host"]