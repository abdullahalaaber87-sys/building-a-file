# Watermalon GitHub Build Kit

The downloadable `client-port.zip` is a complete Fabric 1.21.11 starter project. Upload its contents to a GitHub repository and the included workflow builds a remapped JAR and publishes it as an Actions artifact.

## Build it on GitHub

1. Download and extract `client-port.zip`.
2. Create an empty GitHub repository; do not initialize it with a README.
3. Open a terminal in the extracted folder, then run these commands with your repository URL:
4. In GitHub, open **Actions → Build Watermalon** and wait for the job to finish.
5. Download the `watermalon-fabric-1.21.11` artifact from the completed workflow run. The installable file is `watermalon-1.0.0.jar`.

```sh
git init -b main
git add .
git commit -m "Add Watermalon Fabric starter"
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

No repository secrets are needed. The current Fabric Loom plugin requires Java 25 to build; the mod's bytecode still targets Java 21. The workflow installs Java 25 and builds with the included Gradle wrapper. It runs `clean check build`, including the HUD layout and playback utility checks.

## Build it locally

Install a Java 25 JDK for Fabric Loom and run this from the extracted project folder:

```sh
./gradlew clean check build
```

On Windows:

```bat
gradlew.bat clean check build
```

The remapped Fabric mod is created at `build/libs/watermalon-1.0.0.jar`. Runtime target: Minecraft 1.21.11, Fabric Loader 0.20.1 or newer, Fabric API 0.141.6+1.21.11, Java 21 or newer.

## What the starter contains

- Fabric Loom Gradle project and Gradle 9.8.2 wrapper.
- `fabric.mod.json`, client initializer, Right Shift key mapping, and a sample Click GUI screen.
- A `HudElementRegistry` HUD layer with Watermalon watermark, live coordinates, module-list preview, and Spotify placeholder.
- Design utilities and a runnable verification task under `src/test/java`.
- Inter Variable TTF and its SIL Open Font License.
- GitHub Actions workflow that uploads the built JAR.

## What's not included

This is a **standalone UI starter**, not a rebuilt copy of the original client. The Gofile JAR could not be downloaded here, and the original mapped Gradle source project was not supplied. The sample GUI buttons are not connected to the original module implementations; array-list names are examples, and the Spotify HUD says "Playback bridge not connected". The original client's 58 module implementations, Spotify authentication/service, and existing settings are not in this starter.

To produce the redesigned original client while preserving its features, place these UI components in the original mapped source project and connect them to its real module registry, settings, HUD manager, and Spotify service. Do not redistribute the original JAR or source unless its license allows it.