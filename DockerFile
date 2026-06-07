# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first so Maven dependency layer is cached
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the fat JAR (skip tests — they need a live DB)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=build /app/target/moodtunes-0.0.1-SNAPSHOT.jar app.jar

# Render injects PORT at runtime; Spring reads it via ${PORT:8082}
EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]