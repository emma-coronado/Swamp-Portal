# 🌊 Swamp Portal

**Collaborative Dashboard for [Operation Duloc](https://github.com/sskonda/AWS-Vanderbilt-hackathon/)**

A full-stack web application displaying real-time information from Operation Duloc alongside other Mission Autonomy Team dashboards.

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Angular 20.3.0
- TypeScript
- HTML5/CSS3
- Nginx (development server)

**Backend:**
- Spring Boot 3.5.6
- Java 21
- Maven build system
- RESTful API architecture

**Infrastructure:**
- Docker & Docker Compose
- AWS Integration (DynamoDB, ECR, App Runner)
- Environment-based configuration
- Github Actions (automatic deployment)

### Project Structure

```
swamp-portal/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/       # Angular components and services
│   │   ├── pages/     # Main application pages
│   │   └── guards/    # Route protection
├── backend/           # Spring Boot application
│   └── src/main/java/ # Java source code
├── docker-compose.yml # Container orchestration
└── Dockerfile         # Container definitions
```

## 🛠️ Getting Started

### Prerequisites

- **Docker Desktop** (required)
- **Git** (for cloning)
- **Web Browser** (Chrome recommended for development)

### Quick Start

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/emma-coronado/Swamp-Portal.git
   cd Swamp-Portal
   ```

2. **Set up environment variables** (optional):
   ```powershell
   # Copy and modify environment file
   # Set AWS credentials if using AWS services
   $env:AWS_DEFAULT_REGION="us-east-1"
   $env:ADMIN_PASSWORD="your-admin-password"
   ```

3. **Build and start the application:**
   ```powershell
   docker compose build
   docker compose up -d
   ```

4. **Access the application:**

    Development:
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:8080

   Production:
   - https://www.swamp-portal.com/

### Default Credentials

**Development Login:**
- Username: `admin`
- Password: `admin`

**Production Guest Login:**
- Username: `guest`
- Password: `password`

## 🔧 Development Setup

### IDE-Specific Instructions

#### IntelliJ IDEA
1. Open `docker-compose.yml`
2. Click the double play symbol (▶▶) next to "services"
3. Access the application at the URLs above

#### VS Code
1. Install Docker extension
2. Right-click `docker-compose.yml` → "Compose Up"
3. Use integrated terminal for additional commands

### Local Development Commands

```powershell
# Stop all containers
docker compose down

# View logs
docker compose logs -f

# Rebuild containers
docker compose build --no-cache

# Run all containers
docker compose up -d
```

## 🌐 API Documentation

https://www.swamp-portal.com/swagger-ui/index.html

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Spring Boot profile | `development` |
| `ADMIN_PASSWORD` | Admin user password | `admin` |
| `AWS_DEFAULT_REGION` | AWS region | `us-east-1` |
| `DDB_ENDPOINT` | DynamoDB endpoint | `http://host.docker.internal:9000` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow Angular style guide for frontend code
- Use Java coding conventions for backend code
- Write unit tests for new features
- Ensure Docker builds pass before submitting PRs
- **NEVER** commit API keys.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 📊 Related Projects

- [Operation Duloc](https://github.com/sskonda/AWS-Vanderbilt-hackathon/) - Base project infrastructure

---

**Built for the AWS Mission Autonomy Hackathon** 🚢⚓
