#pragma once
#include <raylib.h>
#include <vector>

enum class EnemyType {
    RUSHER,   // 突進するだけの敵
    SHOOTER   // 弾を出す敵
};

struct EnemyBullet {
    Vector2 position;
    Vector2 velocity;
    float radius;
    bool active;
};

class EnemyManager {
public:
    struct Enemy {
        EnemyType type;
        Vector2 position;
        Vector2 velocity;
        float radius;
        bool active;
        float fireTimer;
        float hp;
    };

    std::vector<Enemy> enemies;
    std::vector<EnemyBullet> bullets;
    
    float spawnTimer;
    float spawnRate;
    
    Texture2D* rammerTex;
    Texture2D* shooterTex;
    
    EnemyManager();
    
    void Clear();
    void Update(float enemyDt, Vector2 playerPos, int screenWidth, int screenHeight);
    void Draw();
    
    void SpawnEnemy(int screenWidth, int screenHeight, Vector2 playerPos);
};
