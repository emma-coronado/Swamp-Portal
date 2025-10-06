# Swamp-Portal

UI for https://github.com/sskonda/AWS-Vanderbilt-hackathon/tree/main

### Running
#### General
Build and run the Docker image forwarding port 8080 to your port of choice.

#### Windows
Required: **IntelliJ IDEA**, **Docker**

1. Clone project into a local directory, and open it in IntelliJ. Ensure you have the Docker addon.
2. Run Docker App
3. Open the Dockerfile in IntelliJ, click the run button, and click build.
4. Once the build completes, open Services at the bottom of the page, and select it.
Click "Docker", then "Containers", then the new container.
5. Click Dashboard, scroll down until you see the "Ports" section. Click "Add".
6. Click "modify options", "host port". There should be two spaces, enter "8080" into both. Ensure it says "Protocol: TCP" at the bottom. Click "Recreate Container".
7. Run Docker again, if it is not already running.
8. Go to Chrome (any browser works but front-end development will be built around Chrome, so that is recommended), go to "localhost:8080".
9. Username: ```root```, Password: ```gogators```.
10. You should have full access to the front-end now!