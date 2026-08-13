#include "Player.h"
#include <cmath>

Player::Player(Vector2 startPos) {
    position = startPos;
    speed = 300.0f;
    hitboxRadius = 4.0f;
    grazeRadius = 25.0f;
    
    fireRate = 0.1f;
    fireTimer = 0.0f;
    gunCount = 1;
    
    maxHp = 3;
    hp = maxHp;
    maxSpecialGauge = 50;
    specialGauge = 0;
    
    spriteSheet = nullptr;
    spriteRect = { 0, 0, 64, 64 };
}

void Player::Update(float dt) {
    if (IsKeyDown(KEY_LEFT) || IsKeyDown(KEY_A)) position.x -= speed * dt;
    if (IsKeyDown(KEY_RIGHT) || IsKeyDown(KEY_D)) position.x += speed * dt;
    if (IsKeyDown(KEY_UP) || IsKeyDown(KEY_W)) position.y -= speed * dt;
    if (IsKeyDown(KEY_DOWN) || IsKeyDown(KEY_S)) position.y += speed * dt;

    // Screen bounds
    if (position.x < grazeRadius) position.x = grazeRadius;
    if (position.x > GetScreenWidth() - grazeRadius) position.x = GetScreenWidth() - grazeRadius;
    if (position.y < grazeRadius) position.y = grazeRadius;
    if (position.y > GetScreenHeight() - grazeRadius) position.y = GetScreenHeight() - grazeRadius;

    // Firing logic
    if (IsMouseButtonDown(MOUSE_BUTTON_LEFT)) {
        fireTimer -= dt;
        if (fireTimer <= 0.0f) {
            Fire();
            fireTimer = fireRate;
        }
    } else {
        fireTimer = 0.0f; // Reset so it fires immediately when pressed
    }

    UpdateBullets(dt);
}

void Player::Fire() {
    float spread = 10.0f;
    float startX = position.x - (spread * (gunCount - 1)) / 2.0f;
    
    for (int i = 0; i < gunCount; ++i) {
        Bullet b;
        b.position = { startX + i * spread, position.y - 15.0f }; // 発射位置を少し前方に
        b.velocity = { 0.0f, -600.0f };
        b.radius = 3.0f;
        b.active = true;
        bullets.push_back(b);
    }
}

bool Player::TryFireSpecial() {
    if (specialGauge >= maxSpecialGauge) {
        specialGauge = 0;
        return true;
    }
    return false;
}

void Player::UpdateBullets(float dt) {
    for (auto& b : bullets) {
        if (b.active) {
            b.position.x += b.velocity.x * dt;
            b.position.y += b.velocity.y * dt;
            if (b.position.y < -10.0f) {
                b.active = false;
            }
        }
    }
}

void Player::Draw() {
    // Graze box (青い半透明)
    DrawCircle(position.x, position.y, grazeRadius, Fade(BLUE, 0.3f));
    DrawCircleLines(position.x, position.y, grazeRadius, BLUE);
    
    if (spriteSheet) {
        Rectangle destRect = { position.x, position.y, 64.0f, 64.0f }; // size to draw
        Vector2 origin = { 32.0f, 32.0f }; // center
        DrawTexturePro(*spriteSheet, spriteRect, destRect, origin, 0.0f, WHITE);
    } else {
        // Core Hitbox (赤・発光)
        DrawCircle(position.x, position.y, hitboxRadius, RED);
        DrawCircle(position.x, position.y, hitboxRadius * 1.5f, Fade(RED, 0.5f)); // 発光エフェクト
    }

    DrawBullets();
}

void Player::DrawBullets() {
    for (const auto& b : bullets) {
        if (b.active) {
            DrawCircle(b.position.x, b.position.y, b.radius, BLACK);
        }
    }
}
