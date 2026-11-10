package dev.sixseven.watermalon;

import com.mojang.blaze3d.platform.InputConstants;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.fabricmc.fabric.api.client.rendering.v1.hud.HudElementRegistry;
import net.fabricmc.fabric.api.client.rendering.v1.hud.VanillaHudElements;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.resources.Identifier;
import org.lwjgl.glfw.GLFW;

/**
 * Small, runnable Fabric entrypoint for the downloadable UI starter.
 * Connect the original Watermalon modules and Spotify service here when their
 * mapped source project is available; the buttons in this starter are previews.
 */
public final class WatermalonClient implements ClientModInitializer {
    private static boolean hudEnabled = true;
    private static boolean watermarkEnabled = true;
    private static boolean arrayListEnabled = true;
    private static boolean spotifyHudEnabled = true;
    private static int accentIndex;
    private static final int[] ACCENTS = { 0xFFFF6B8A, 0xFF70EADB, 0xFFC9F36B, 0xFFB7D8E8 };

    private KeyMapping openGui;

    @Override
    public void onInitializeClient() {
        KeyMapping.Category category = KeyMapping.Category.register(
                Identifier.fromNamespaceAndPath("watermalon", "main"));
        openGui = KeyBindingHelper.registerKeyBinding(new KeyMapping(
                "key.watermalon.open_gui",
                InputConstants.Type.KEYSYM,
                GLFW.GLFW_KEY_RIGHT_SHIFT,
                category));

        HudElementRegistry.attachElementAfter(
                VanillaHudElements.HOTBAR,
                Identifier.fromNamespaceAndPath("watermalon", "watermalon_hud"),
                WatermalonHud::render);

        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            while (openGui.consumeClick()) {
                client.setScreen(client.screen instanceof WatermalonScreen
                        ? null
                        : new WatermalonScreen(client.screen));
            }
        });
    }

    public static boolean isHudEnabled() { return hudEnabled; }
    public static boolean isWatermarkEnabled() { return watermarkEnabled; }
    public static boolean isArrayListEnabled() { return arrayListEnabled; }
    public static boolean isSpotifyHudEnabled() { return spotifyHudEnabled; }
    public static int accent() { return ACCENTS[accentIndex]; }

    public static void toggleHud() { hudEnabled = !hudEnabled; }
    public static void toggleWatermark() { watermarkEnabled = !watermarkEnabled; }
    public static void toggleArrayList() { arrayListEnabled = !arrayListEnabled; }
    public static void toggleSpotifyHud() { spotifyHudEnabled = !spotifyHudEnabled; }
    public static void cycleAccent() { accentIndex = (accentIndex + 1) % ACCENTS.length; }
}