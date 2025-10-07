# Swamp-Portal

UI for https://github.com/sskonda/AWS-Vanderbilt-hackathon/tree/main

### Running
#### General
Build and run the Docker images using docker compose

#### Windows
Required: **Docker**

1. Clone project into a local directory, and open it in your prefered editor (tested in IntelliJ and VS Code)
2. Run Docker App
3. In the project's root directory run ```docker compose build``` to build
4. Then run ```docker compose up -d```
5. Open Chrome (any browser works but front-end development will be built around Chrome, so that is recommended)and go to "localhost:8080" to access the Spring backend
6. Username: ```root```, Password: ```gogators```
7. Navigate to "localhost:4200" to access the front end

#### IntelliJ-Specific Shortcut
Required: **Docker**, **Docker Extension**

1. Clone the project into a local directory, and open it in IntelliJ.
2. Open docker-compose.yml and click the double play symbol next to "services" and press it.
3. Then follow steps 5-7 above. :) <3
