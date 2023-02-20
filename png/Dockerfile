# Define global args
ARG FUNCTION_DIR="/home/app"
ARG RUNTIME_VERSION="18"
ARG DISTRO_VERSION="bullseye-slim"
ARG NPM_CONFIG_PREFIX="/home/node/.npm-global"

# Stage 1 - bundle base image + runtime
# Grab a fresh copy of the image and install GCC
FROM node:${RUNTIME_VERSION}-${DISTRO_VERSION} AS build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install GCC (Alpine uses musl but we compile and link dependencies with GCC)
RUN apk update --no-cache
RUN apk add --no-cache \
    libstdc++ \
    g++ \
    make \
    cmake \
    unzip \
    libcurl \
    autoconf \
    automake \
    libtool \
    curl-dev \
    libexecinfo-dev \
    python3

ARG NPM_CONFIG_PREFIX

ENV PATH=$PATH:${NPM_CONFIG_PREFIX}/bin

WORKDIR ${NPM_CONFIG_PREFIX}
RUN npm install --global aws-lambda-ric

# Create app workdir
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}


# Stage 2
# copy just insatlled lambda dependency
FROM build-image AS lambda-runtime

ARG NPM_CONFIG_PREFIX
COPY --from=build-image ${NPM_CONFIG_PREFIX} ${NPM_CONFIG_PREFIX}


# Stage 3
# Install inkscape to docker image
FROM lambda-runtime AS lambda-inkscape-alpine

RUN apk update --no-cache
RUN apk add \
    --no-cache \
    ttf-freefont \
    ttf-ubuntu-font-family \
    inkscape

RUN mkdir -p /usr/share/fonts/custom
COPY ./png/fonts /usr/share/fonts/custom

RUN rm -rf /var/cache/* && \
    fc-cache -f


# Stage 4
# Grab a fresh slim copy of the image to reduce the final size
FROM lambda-inkscape-alpine

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

COPY ./package*.json ./
COPY ./png ./png

RUN npm install --prod

WORKDIR ${FUNCTION_DIR}/png/dist

ENV NODE_ENV=production

ENTRYPOINT ["aws-lambda-ric"]
CMD ["handler.svgToPngHandler"]
