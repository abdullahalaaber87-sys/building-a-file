# Watermalon Fabric build kit

This folder is a complete, GitHub-ready Fabric 1.21.11 project. It contains a small runnable Watermalon UI/HUD starter, the renderer-independent layout utilities, a licensed Inter Variable TTF, a Gradle wrapper, and a GitHub Actions workflow that builds and uploads a remapped mod JAR.

## Build it on GitHub

1. Download `client-port.zip` from the Watermalon preview and extract it.
2. Create a new empty GitHub repository (do not add a README or license yet).
3. Open a terminal in the extracted folder and run the commands below, replacing the URL with your repository's URL.
4. Open the repository's **Actions** tab and select **Build Watermalon**.
5. When the workflow finishes, download the `watermalon-fabric-1.21.11` artifact. It contains `watermalon-1.0.0.jar`.

```sh
git init -b main
git add .
git commit -m "Add Watermalon Fabric starter"
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

The GitHub runner installs Java 25 for the current Fabric Loom plugin, downloads Gradle through the included wrapper, runs the layout checks, and builds Java 21-compatible bytecode. No GitHub secret is required.

## Build locally

Install a Java 25 JDK to run the current Fabric Loom plugin, then run from this folder:

```sh
./gradlew clean check build
```

On Windows, use `gradlew.bat clean check build`. The remapped JAR is written to `build/libs/watermalon-1.0.0.jar`.

## Install the JAR

The mod bytecode targets Java 21. Install Java 21 or newer, Fabric Loader for Minecraft 1.21.11, and Fabric API `0.141.6+1.21.11`, then put the JAR in the Minecraft `mods` folder. Press **Right Shift** in-game to open the starter screen. The sample HUD renders in a world.

## What's in this starter

- A real Fabric client entrypoint and Right Shift key mapping.
- A compact in-game Watermalon screen with accent and HUD-preview toggles.
- A HUD layer that uses Fabric's `HudElementRegistry`, the Minecraft GUI renderer, and the player's live coordinates.
- `HudLayout`, `SpotifyHudLayout`, `PlaybackSnapshot`, `UiMotion`, and `UiTheme` utility classes, with executable checks.
- Inter Variable TTF and the SIL Open Font License.
- A GitHub Actions build that uploads the remapped mod JAR.

## Important limitation

This builds a **standalone UI starter**, not a repackaged PrivateClient JAR. The Gofile JAR could not be fetched in this session, and its original Gradle source project was not provided. The starter's three HUD toggles and the labels shown in its array list are demo UI state; they do not implement or control the original client's modules. Spotify is a placeholder and does not connect to an account. Integrate the starter with the original mapped source project to retain the actual modules and Spotify service.

Keep the original client's license, credits, API keys, and access controls intact. Do not publish a JAR containing code or credentials you are not allowed to redistribute.