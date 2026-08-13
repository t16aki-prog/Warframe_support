#pragma once
#include <raylib.h>
#include <vector>

struct Bullet {
    Vector2 position;
    Vector2 velocity;
    float radius;
    bool active;
};

class Player {
public:
    Vector2 position;
    float speed;
    float hitboxRadius;
    float grazeRadius;
    
    std::vector<Bullet> bullets;
    float fireRate;
    float fireTimer;
    int gunCount; // 銃口の数
    
    int hp;
    int maxHp;
    int specialGauge;
    int maxSpecialGauge;
    
    Texture2D* spriteSheet;
    Rectangle spriteRect;

    Player(Vector2 startPos);
    
    void Update(float dt);
    void Draw();
    
    void Fire();
    bool TryFireSpecial();
    void UpdateBullets(float dt);
    void DrawBullets();
};
