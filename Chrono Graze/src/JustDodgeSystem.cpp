#include "JustDodgeSystem.h"

JustDodgeSystem::JustDodgeSystem() {
    buff_timer = 0.0f;
    point_multiplier = 1.0;
    boost_factor = 20.0f;
    duration = 5.0f;
}

void JustDodgeSystem::Update(float dt) {
    if (buff_timer > 0.0f) {
        buff_timer -= dt;
        if (buff_timer <= 0.0f) {
            buff_timer = 0.0f;
            point_multiplier = 1.0;
        }
    }
}

void JustDodgeSystem::TriggerGraze() {
    buff_timer = duration;
    point_multiplier = boost_factor;
    // 実際にはここでサウンドエフェクトなども再生可能
}

double JustDodgeSystem::GetPointMultiplier() const {
    return point_multiplier;
}

bool JustDodgeSystem::IsTriggered() const {
    return buff_timer > 0.0f;
}

float JustDodgeSystem::GetRemainingTime() const {
    return buff_timer;
}
