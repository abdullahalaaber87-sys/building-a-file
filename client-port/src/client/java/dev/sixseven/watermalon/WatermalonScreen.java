package dev.sixseven.watermalon;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;

/** A compact in-game control surface; behavior is explicitly marked as starter UI. */
public final class WatermalonScreen extends Screen {
    private static final int PANEL_WIDTH = 430;
    private static final int PANEL_HEIGHT = 282;
    private final Screen parent;

    public WatermalonScreen(Screen parent) {
        super(Component.literal("Watermalon"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        int left = (width - PANEL_WIDTH) / 2;
        int top = (height - PANEL_HEIGHT) / 2;
        int buttonWidth = 180;
        int buttonHeight = 22;

        addRenderableWidget(Button.builder(toggleMessage("Watermark", WatermalonClient.isWatermarkEnabled()), button -> {
            WatermalonClient.toggleWatermark();
            button.setMessage(toggleMessage("Watermark", WatermalonClient.isWatermarkEnabled()));
        }).bounds(left + 22, top + 90, buttonWidth, buttonHeight).build());

        addRenderableWidget(Button.builder(toggleMessage("ArrayList", WatermalonClient.isArrayListEnabled()), button -> {
            WatermalonClient.toggleArrayList();
            button.setMessage(toggleMessage("ArrayList", WatermalonClient.isArrayListEnabled()));
        }).bounds(left + 22, top + 119, buttonWidth, buttonHeight).build());

        addRenderableWidget(Button.builder(toggleMessage("Spotify HUD preview", WatermalonClient.isSpotifyHudEnabled()), button -> {
            WatermalonClient.toggleSpotifyHud();
            button.setMessage(toggleMessage("Spotify HUD preview", WatermalonClient.isSpotifyHudEnabled()));
        }).bounds(left + 22, top + 148, buttonWidth, buttonHeight).build());

        addRenderableWidget(Button.builder(Component.literal("Change accent"), button -> WatermalonClient.cycleAccent())
                .bounds(left + 22, top + 183, buttonWidth, buttonHeight).build());

        addRenderableWidget(Button.builder(Component.literal("Done"), button -> onClose())
                .bounds(left + PANEL_WIDTH - 112, top + PANEL_HEIGHT - 34, 88, 22).build());
    }

    private static Component toggleMessage(String label, boolean enabled) {
        return Component.literal(label + ": " + (enabled ? "ON" : "OFF"));
    }

    @Override
    public void render(GuiGraphics graphics, int mouseX, int mouseY, float partialTick) {
        int left = (width - PANEL_WIDTH) / 2;
        int top = (height - PANEL_HEIGHT) / 2;
        int accent = WatermalonClient.accent();

        graphics.fill(0, 0, width, height, 0xA6000000);
        graphics.fill(left, top, left + PANEL_WIDTH, top + PANEL_HEIGHT, 0xF20B0B0E);
        graphics.fill(left, top, left + PANEL_WIDTH, top + 1, 0x28FFFFFF);
        graphics.fill(left, top, left + 2, top + PANEL_HEIGHT, accent);
        graphics.fill(left + 18, top + 19, left + 36, top + 37, 0xFF171C1D);
        graphics.drawString(Minecraft.getInstance().font, "W", left + 24, top + 24, accent, false);
        graphics.drawString(Minecraft.getInstance().font, "WATERMALON", left + 46, top + 19, 0xFFEFF4F1, false);
        graphics.drawString(Minecraft.getInstance().font, "CLICK GUI  /  1.21.11", left + 46, top + 31, 0xFF85928D, false);
        graphics.fill(left + 22, top + 67, left + PANEL_WIDTH - 22, top + 68, 0x20FFFFFF);
        graphics.drawString(Minecraft.getInstance().font, "HUD PREVIEW", left + 22, top + 53, accent, false);
        graphics.drawString(Minecraft.getInstance().font,
                "UI toggles are ready to connect to the original module system.",
                left + 22, top + 224, 0xFF9BA8A1, false);

        super.render(graphics, mouseX, mouseY, partialTick);
    }

    @Override
    public void onClose() {
        Minecraft.getInstance().setScreen(parent);
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }
}