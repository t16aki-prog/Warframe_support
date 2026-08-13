#include "UpgradeSystem.h"
#include <cmath>
#include <sstream>
#include <iomanip>

BigNumber Upgrade::GetCost() const {
    return base_cost * std::pow(growth_rate, current_level);
}

UpgradeSystem::UpgradeSystem() {
    current_points = 0.0;
    
    upgrades.push_back({UpgradeType::GunCount, "銃口増設", 0, 10, 100.0, 2.5});
    upgrades.push_back({UpgradeType::FireRate, "連射速度UP", 0, 20, 50.0, 1.5});
    upgrades.push_back({UpgradeType::AttackPower, "攻撃力UP", 0, 50, 10.0, 1.2});
}

void UpgradeSystem::AddPoints(BigNumber points) {
    current_points += points;
}

bool UpgradeSystem::PurchaseUpgrade(int index) {
    if (index >= 0 && index < upgrades.size()) {
        auto& upg = upgrades[index];
        if (upg.current_level < upg.max_level) {
            BigNumber cost = upg.GetCost();
            if (current_points >= cost) {
                current_points -= cost;
                upg.current_level++;
                return true;
            }
        }
    }
    return false;
}

std::string UpgradeSystem::FormatNumber(BigNumber num) const {
    // 簡易的なフォーマット (1.00K, 1.00M など)
    const char* suffixes[] = {"", "K", "M", "B", "T", "aa", "ab"};
    int suffixIndex = 0;
    
    while (num >= 1000.0 && suffixIndex < 6) {
        num /= 1000.0;
        suffixIndex++;
    }
    
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << num << suffixes[suffixIndex];
    return out.str();
}
