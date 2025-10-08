# Production instructions

# --- Build Angular (prod) ---
FROM node:20 AS webbuild
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# This triggers Angular production build -> uses environment.prod.ts
RUN npm run build -- --configuration=production

# --- Build Spring Boot (package JAR) ---
FROM maven:3.9-eclipse-temurin-21 AS backendbuild
WORKDIR /app
COPY backend/pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
# Copy Angular dist INTO Spring's static dir BEFORE packaging
# Replace <your-app-name> with actual folder name under frontend/dist/
COPY --from=webbuild /web/dist/frontend/browser/ ./src/main/resources/static/
COPY backend/src ./src
RUN mvn -DskipTests package

# --- Runtime image ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backendbuild /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]