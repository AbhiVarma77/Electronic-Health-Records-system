# Dockerfile

FROM node:18.16.0-alpine3.17
RUN mkdir -p /swecha/ehrs/backend
WORKDIR /swecha/ehrs/backend

# Access the environment variable passed by Docker Compose
ARG PORT
ENV PORT=$PORT

ARG PRISMA_PORT
ENV PRISMA_PORT=$PRISMA_PORT

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG PROCESS_PREFIX
ENV PROCESS_PREFIX=$PROCESS_PREFIX

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN echo "con str: $DATABASE_URL"

# Copy the complete backend
COPY . .

# Install the prerequisites
RUN npm install --location=global pnpm
RUN npm install --location=global nodemon

# Install the dependencies
RUN pnpm i
RUN npx prisma generate
RUN chmod +x script.sh

EXPOSE $PORT
EXPOSE $PRISMA_PORT
# Run the shell script when the container starts
#  CMD ["sh", "-c", "sleep 5 && npx prisma db push && nodemon index.js"]
CMD ["sh","script.sh"]