# Home Automation Docker boilerplate

Includes:
 - HomeAssistant with a few interesting configurations:
  - Heaters and thermostats, Arduino based, open sourced in my repos.
  - Presence notification scripts, including messaging over Slack
 - Nginx proxy as TLS termination (SSL)
 - Mosquitto MQTT Broker, private and not exposed to the world.
 - OwnTracks Proxy over SSL, to expose OwnTracks server to the world as a separate app, so to not expose HomeAssistant (unless required)

 This is work in progress and might become unstable.

 # Requirements
 - Docker and Docker-compose

 # Setup
 `git clone git@github.com:nicoandra/home-assistant-setup.git
docker-compose up
 `
