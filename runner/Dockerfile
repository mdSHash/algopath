# Multi-language image for AlgoPath's code runner.
# Base: Node 20 on Debian (bookworm slim).
# Layered on top: Python 3 and OpenJDK 17 so we can compile + run all three
# user languages.

FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Python + OpenJDK + minimal cleanup. JRE alone isn't enough — we need javac.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        openjdk-17-jdk-headless \
        ca-certificates \
        tini \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Run the service as a non-root user.
RUN groupadd --system runner && useradd --system --gid runner --create-home runner

WORKDIR /app

COPY --chown=runner:runner package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY --chown=runner:runner server.js ./

USER runner

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# tini reaps zombie children left behind by killed user processes.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
