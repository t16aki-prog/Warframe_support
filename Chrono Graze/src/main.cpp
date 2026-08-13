#include <raylib.h>
#include "Player.h"
#include "JustDodgeSystem.h"
#include "UpgradeSystem.h"
#include "Enemy.h"
#include <string>
#include <cmath>


enum class GameState {
    TITLE,
    IN_GAME,
    UPGRADE
};

int main() {
    const int screenWidth = 800;
    const int screenHeight = 600;

    InitWindow(screenWidth, screenHeight, "Chrono Graze - Prototype");
    SetTargetFPS(60);

    Texture2D spriteSheet = LoadTexture("../art/Project_Graze_Ghost_Sprites.png");

    GameState currentState = GameState::TITLE;
    
    Player player({ (float)screenWidth / 2, (float)screenHeight - 100 });
    player.spriteSheet = &spriteSheet;
    
    JustDodgeSystem dodgeSystem;
    UpgradeSystem upgradeSystem;
    
    EnemyManager enemyManager;
    enemyManager.spriteSheet = &spriteSheet;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        float enemyDt = dt;

        // タイムスロー演出 (ジャスト回避時)
        if (dodgeSystem.IsTriggered()) {
            enemyDt *= 0.3f; // 敵のみ0.3倍速
        }

        switch (currentState) {
            case GameState::TITLE:
                if (IsKeyPressed(KEY_ENTER)) currentState = GameState::IN_GAME;
                break;

            case GameState::IN_GAME:
                player.Update(dt);
                dodgeSystem.Update(dt);
                enemyManager.Update(enemyDt, player.position, screenWidth, screenHeight);

                // Collision: Player bullets vs Enemies
                for (auto& pb : player.bullets) {
                    if (!pb.active) continue;
                    for (auto& e : enemyManager.enemies) {
                        if (!e.active) continue;
                        if (CheckCollisionCircles(pb.position, pb.radius, e.position, e.radius)) {
                            pb.active = false;
                            e.hp -= 1.0f; // Player damage
                            if (e.hp <= 0.0f) {
                                e.active = false;
                                upgradeSystem.AddPoints(50.0); // Reward for kill
                            }
                        }
                    }
                }

                // Collision: Enemies vs Player
                for (auto& e : enemyManager.enemies) {
                    if (!e.active) continue;
                    bool hitCore = CheckCollisionCircles(player.position, player.hitboxRadius, e.position, e.radius);
                    bool hitGraze = CheckCollisionCircles(player.position, player.grazeRadius, e.position, e.radius);

                    if (hitCore) {
                        e.active = false;
                        currentState = GameState::UPGRADE; // Death
                    } else if (hitGraze) {
                        if (!dodgeSystem.IsTriggered()) dodgeSystem.TriggerGraze();
                    }
                }

                // Collision: Enemy bullets vs Player
                for (auto& eb : enemyManager.bullets) {
                    if (!eb.active) continue;
                    bool hitCore = CheckCollisionCircles(player.position, player.hitboxRadius, eb.position, eb.radius);
                    bool hitGraze = CheckCollisionCircles(player.position, player.grazeRadius, eb.position, eb.radius);

                    if (hitCore) {
                        eb.active = false;
                        currentState = GameState::UPGRADE; // Death
                    } else if (hitGraze) {
                        if (!dodgeSystem.IsTriggered()) dodgeSystem.TriggerGraze();
                    }
                }

                // 常時ポイント獲得 (テスト用)
                upgradeSystem.AddPoints(10.0 * dodgeSystem.GetPointMultiplier() * dt);

                if (IsKeyPressed(KEY_ESCAPE)) currentState = GameState::UPGRADE;
                break;

            case GameState::UPGRADE:
                if (IsKeyPressed(KEY_ENTER)) currentState = GameState::IN_GAME;
                
                // アップグレードの購入処理
                if (IsKeyPressed(KEY_ONE)) {
                    if (upgradeSystem.PurchaseUpgrade(0)) player.gunCount = 1 + upgradeSystem.upgrades[0].current_level;
                }
                if (IsKeyPressed(KEY_TWO)) {
                    if (upgradeSystem.PurchaseUpgrade(1)) player.fireRate = 0.1f * std::pow(0.9f, upgradeSystem.upgrades[1].current_level);
                }
                break;
        }

        // --- 描画 ---
        BeginDrawing();
        ClearBackground(YELLOW);

        switch (currentState) {
            case GameState::TITLE:
                DrawText("CHRONO GRAZE", screenWidth/2 - MeasureText("CHRONO GRAZE", 40)/2, screenHeight/2 - 40, 40, BLACK);
                DrawText("Press ENTER to Start", screenWidth/2 - MeasureText("Press ENTER to Start", 20)/2, screenHeight/2 + 20, 20, GRAY);
                break;

            case GameState::IN_GAME:
                player.Draw();
                enemyManager.Draw();

                // UI
                DrawText(TextFormat("Points: %s", upgradeSystem.FormatNumber(upgradeSystem.current_points).c_str()), 10, 10, 20, BLACK);
                
                if (dodgeSystem.IsTriggered()) {
                    DrawText(TextFormat("GRAZE! x%.0f", dodgeSystem.GetPointMultiplier()), screenWidth / 2 - 50, 50, 30, BLUE);
                    DrawRectangle(0, 0, screenWidth, screenHeight, Fade(BLUE, 0.1f)); // 画面エフェクト
                }
                break;

            case GameState::UPGRADE:
                DrawText("UPGRADE SCREEN", 10, 10, 30, BLACK);
                DrawText(TextFormat("Points: %s", upgradeSystem.FormatNumber(upgradeSystem.current_points).c_str()), 10, 50, 20, BLACK);
                
                for (int i = 0; i < upgradeSystem.upgrades.size(); ++i) {
                    auto& upg = upgradeSystem.upgrades[i];
                    std::string text = TextFormat("[%d] %s (Lv %d/%d) - Cost: %s", 
                        i+1, upg.name.c_str(), upg.current_level, upg.max_level, upgradeSystem.FormatNumber(upg.GetCost()).c_str());
                    DrawText(text.c_str(), 50, 100 + i * 40, 20, DARKGRAY);
                }

                DrawText("Press ENTER to return to Game", 10, screenHeight - 40, 20, GRAY);
                break;
        }

        EndDrawing();
    }

    UnloadTexture(spriteSheet);
    CloseWindow();
    return 0;
}
