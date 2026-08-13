#pragma once
#include <string>
#include <vector>

using BigNumber = double; // 簡易的なBigNumber実装 (本来は文字列ベースや多倍長整数の実装が必要)

enum class UpgradeType {
    GunCount,
    FireRate,
    AttackPower
};

struct Upgrade {
    UpgradeType type;
    std::string name;
    int current_level;
    int max_level;
    BigNumber base_cost;
    double growth_rate;
    
    BigNumber GetCost() const;
};

class UpgradeSystem {
public:
    std::vector<Upgrade> upgrades;
    BigNumber current_points;
    
    UpgradeSystem();
    
    void AddPoints(BigNumber points);
    bool PurchaseUpgrade(int index);
    
    std::string FormatNumber(BigNumber num) const;
};
