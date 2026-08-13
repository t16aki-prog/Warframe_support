#include "Enemy.h"
#include <cmath>

EnemyManager::EnemyManager() {
    spawnTimer = 0.0f;
    spawnRate = 2.0f;
    spriteSheet = nullptr;
    rusherRect = { 32, 0, 64, 64 };
    shooterRect = { 64, 0, 64, 64 };
}

void EnemyManager::Clear() {
    enemies.clear();
    bullets.clear();
    spawnTimer = 0.0f;
    spawnRate = 2.0f; // Reset difficulty
}

void EnemyManager::SpawnEnemy(int screenWidth, int screenHeight, Vector2 playerPos) {
    Enemy e;
    e.active = true;
    e.radius = 15.0f;
    e.fireTimer = 1.0f;
    e.hp = 3.0f;
    
    // 50% chance for Rusher or Shooter
    e.type = (GetRandomValue(0, 1) == 0) ? EnemyType::RUSHER : EnemyType::SHOOTER;
    
    // Spawn location: Top (0), Left (1), Right (2)
    int spawnSide = GetRandomValue(0, 2);
    
    if (spawnSide == 0) {
        // Top
        e.position = { (float)GetRandomValue(50, screenWidth - 50), -50.0f };
    } else if (spawnSide == 1) {
        // Left
        e.position = { -50.0f, (float)GetRandomValue(50, screenHeight / 2) };
    } else {
        // Right
        e.position = { screenWidth + 50.0f, (float)GetRandomValue(50, screenHeight / 2) };
    }
    
    // Calculate velocity towards player
    float dx = playerPos.x - e.position.x;
    float dy = playerPos.y - e.position.y;
    float dist = sqrtf(dx*dx + dy*dy);
    
    float speed = (e.type == EnemyType::RUSHER) ? 200.0f : 100.0f;
    
    if (dist > 0) {
        e.velocity = { (dx / dist) * speed, (dy / dist) * speed };
    } else {
        e.velocity = { 0.0f, speed };
    }
    
    enemies.push_back(e);
}

void EnemyManager::Update(float enemyDt, Vector2 playerPos, int screenWidth, int screenHeight) {
    // Spawning
    spawnTimer -= enemyDt;
    if (spawnTimer <= 0.0f) {
        SpawnEnemy(screenWidth, screenHeight, playerPos);
        spawnTimer = spawnRate;
        if (spawnRate > 0.5f) spawnRate -= 0.05f; // Gradually increase difficulty
    }
    
    // Update enemies
    for (auto& e : enemies) {
        if (!e.active) continue;
        
        e.position.x += e.velocity.x * enemyDt;
        e.position.y += e.velocity.y * enemyDt;
        
        // Out of bounds check
        if (e.position.y > screenHeight + 100.0f || e.position.x < -100.0f || e.position.x > screenWidth + 100.0f) {
            e.active = false;
        }
        
        // Shooter logic
        if (e.type == EnemyType::SHOOTER) {
            e.fireTimer -= enemyDt;
            if (e.fireTimer <= 0.0f) {
                // Fire bullet at player
                float dx = playerPos.x - e.position.x;
                float dy = playerPos.y - e.position.y;
                float dist = sqrtf(dx*dx + dy*dy);
                
                if (dist > 0) {
                    EnemyBullet b;
                    b.position = e.position;
                    float bSpeed = 250.0f;
                    b.velocity = { (dx / dist) * bSpeed, (dy / dist) * bSpeed };
                    b.radius = 5.0f;
                    b.active = true;
                    bullets.push_back(b);
                }
                e.fireTimer = 1.5f; // Fire every 1.5s
            }
        }
    }
    
    // Update bullets
    for (auto& b : bullets) {
        if (!b.active) continue;
        b.position.x += b.velocity.x * enemyDt;
        b.position.y += b.velocity.y * enemyDt;
        
        if (b.position.y > screenHeight + 50.0f || b.position.y < -50.0f || b.position.x < -50.0f || b.position.x > screenWidth + 50.0f) {
            b.active = false;
        }
    }
}

void EnemyManager::Draw() {
    for (const auto& e : enemies) {
        if (!e.active) continue;
        
        if (spriteSheet) {
            Rectangle sourceRect = (e.type == EnemyType::RUSHER) ? rusherRect : shooterRect;
            Rectangle destRect = { e.position.x, e.position.y, 64.0f, 64.0f };
            Vector2 origin = { 32.0f, 32.0f };
            DrawTexturePro(*spriteSheet, sourceRect, destRect, origin, 0.0f, WHITE);
        } else {
            if (e.type == EnemyType::RUSHER) {
                DrawCircle(e.position.x, e.position.y, e.radius, RED); // Rusher
            } else {
                DrawCircle(e.position.x, e.position.y, e.radius, PURPLE); // Shooter
            }
        }
    }
    
    for (const auto& b : bullets) {
        if (!b.active) continue;
        DrawCircle(b.position.x, b.position.y, b.radius, ORANGE);
    }
}
