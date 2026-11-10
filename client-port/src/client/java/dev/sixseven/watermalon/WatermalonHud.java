package dev.sixseven.watermalon;

import dev.sixseven.ui.design.HudLayout;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.DeltaTracker;
import net.minecraft.world.entity.player.Player;

/** A lightweight, local HUD example drawn through Minecraft's existing GUI renderer. */
final class WatermalonHud {
    private static final HudLayout.Size WATERMARK_SIZE = new HudLayout.Size(158f, 30f);
    private static final HudLayout.Size COORD_SIZE = new HudLayout.Size(174f, 22f);
    private static final HudLayout.Size SPOTIFY_SIZE = new HudLayout.Size(226f, 48f);

    private WatermalonHud() {}

    static void render(GuiGraphics graphics, DeltaTracker tickCounter) {
        if (!WatermalonClient.isHudEnabled()) return;
        Minecraft minecraft = Minecraft.getInstance();
        Player player = minecraft.player;
        if (player == null) return;

        int screenWidth = minecraft.getWindow().getGuiScaledWidth();
        int screenHeight = minecraft.getWindow().getGuiScaledHeight();
        HudLayout.Size viewport = new HudLayout.Size(screenWidth, screenHeight);
        int accent = WatermalonClient.accent();

        if (WatermalonClient.isWatermarkEnabled()) {
            HudLayout.Rect mark = HudLayout.place(new HudLayout.Position(.018f, .025f, 1f, true), viewport, WATERMARK_SIZE);
            int x = Math.round(mark.x()), y = Math.round(mark.y());
            graphics.fill(x, y, x + 158, y + 30, 0xD90B0B0E);
            graphics.fill(x, y, x + 2, y + 30, accent);
            graphics.fill(x + 6, y + 5, x + 25, y + 24, 0xFF171C1D);
            draw(graphics, minecraft, "W", x + 12, y + 10, accent);
            draw(graphics, minecraft, "WATERMALON", x + 32, y + 6, 0xFFEFF4F1);
            draw(graphics, minecraft, "1.21.11  |  CLIENT PREVIEW", x + 32, y + 18, 0xFF9BA8A1);
        }

        if (WatermalonClient.isArrayListEnabled()) {
            String[] demoModules = { "CustomCrosshair", "FullBright", "Zoom" };
            int right = screenWidth - 10;
            int y = 10;
            for (String module : demoModules) {
                int textWidth = minecraft.font.width(module);
                int left = right - textWidth - 18;
                graphics.fill(left, y, right, y + 16, 0xC90B0B0E);
                draw(graphics, minecraft, module, left + 6, y + 4, 0xFFEFF4F1);
                graphics.fill(right - 3, y + 3, right - 1, y + 13, accent);
                y += 19;
            }
        }

        HudLayout.Rect coordinates = HudLayout.place(
                new HudLayout.Position(.018f, .94f, 1f, true), viewport, COORD_SIZE);
        int x = Math.round(coordinates.x()), y = Math.round(coordinates.y());
        graphics.fill(x, y, x + 174, y + 22, 0xC90B0B0E);
        draw(graphics, minecraft, "XYZ", x + 7, y + 7, accent);
        draw(graphics, minecraft,
                player.getBlockX() + "  " + player.getBlockY() + "  " + player.getBlockZ(),
                x + 34, y + 7, 0xFFEFF4F1);

        if (WatermalonClient.isSpotifyHudEnabled()) {
            HudLayout.Rect spotify = HudLayout.place(
                    new HudLayout.Position(.018f, .78f, 1f, true), viewport, SPOTIFY_SIZE);
            int sx = Math.round(spotify.x()), sy = Math.round(spotify.y());
            graphics.fill(sx, sy, sx + 226, sy + 48, 0xE60B0B0E);
            graphics.fill(sx, sy, sx + 2, sy + 48, accent);
            draw(graphics, minecraft, "SPOTIFY HUD", sx + 9, sy + 7, 0xFF9BA8A1);
            draw(graphics, minecraft, "Playback bridge not connected", sx + 9, sy + 20, 0xFFEFF4F1);
            graphics.fill(sx + 9, sy + 37, sx + 217, sy + 39, 0xFF343B3A);
            graphics.fill(sx + 9, sy + 37, sx + 54, sy + 39, accent);
        }
    }

    private static void draw(GuiGraphics graphics, Minecraft minecraft, String text, int x, int y, int color) {
        graphics.drawString(minecraft.font, text, x, y, color, false);
    }
}