#pragma once

class JustDodgeSystem {
private:
    float buff_timer;
    double point_multiplier;
    float boost_factor;
    float duration;

public:
    JustDodgeSystem();
    
    void Update(float dt);
    void TriggerGraze();
    
    double GetPointMultiplier() const;
    bool IsTriggered() const;
    float GetRemainingTime() const;
};
