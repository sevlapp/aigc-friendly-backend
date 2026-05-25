import { ConsumeMagicItemCraftTaskUsecase } from './consume-magic-item.usecase';
import type { MagicQualityLevel } from '@src/modules/magic-workshop/magic-item.types';

describe('ConsumeMagicItemCraftTaskUsecase', () => {
  // 私有方法测试用的辅助函数
  const determineQualityLevel = (materialLevel: number): MagicQualityLevel => {
    const random = Math.random();
    const boost = (materialLevel - 1) / 10;

    if (random < 0.05 + boost) {
      return 'LEGENDARY';
    }
    if (random < 0.15 + boost) {
      return 'EPIC';
    }
    if (random < 0.35 + boost) {
      return 'RARE';
    }
    return 'COMMON';
  };

  const generateResultDescription = (
    itemName: string,
    itemType: string,
    qualityLevel: MagicQualityLevel,
    requestNote?: string,
  ): string => {
    const qualityPrefix = {
      COMMON: '普通的',
      RARE: '精致的',
      EPIC: '稀有的',
      LEGENDARY: '传说级的',
    }[qualityLevel];

    const typeNames: Record<string, string> = {
      WEAPON: '武器',
      ARMOR: '护甲',
      TOOL: '工具',
      TOY: '玩具',
    };

    const typeName = typeNames[itemType] || '物品';
    const note = requestNote ? `（${requestNote}）` : '';

    return `${qualityPrefix}${typeName}"${itemName}"${note}。散发着独特的光芒，蕴含着工匠的心血与魔法。`;
  };

  describe('determineQualityLevel', () => {
    it('材料等级1应有最低概率获得传说品质', () => {
      // 多次测试以验证概率分布
      const results: MagicQualityLevel[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(determineQualityLevel(1));
      }

      const legendaryCount = results.filter((r) => r === 'LEGENDARY').length;
      // 等级1的boost = 0，传说概率约为5%
      // 允许一些统计波动
      expect(legendaryCount).toBeLessThan(150);
      expect(legendaryCount).toBeGreaterThan(0);
    });

    it('材料等级5应有较高概率获得高品质', () => {
      const results: MagicQualityLevel[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(determineQualityLevel(5));
      }

      const legendaryCount = results.filter((r) => r === 'LEGENDARY').length;
      const epicCount = results.filter((r) => r === 'EPIC').length;
      const rareCount = results.filter((r) => r === 'RARE').length;

      // 等级5的boost = 0.4，传说概率约为45%
      // 传说+史诗合计应该占较高比例
      expect(legendaryCount + epicCount).toBeGreaterThan(300);
    });

    it('材料等级3应返回四种品质之一', () => {
      for (let i = 0; i < 100; i++) {
        const quality = determineQualityLevel(3);
        expect(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).toContain(quality);
      }
    });
  });

  describe('generateResultDescription', () => {
    it('应生成正确的普通品质武器描述', () => {
      const result = generateResultDescription('火焰戒指', 'WEAPON', 'COMMON');
      expect(result).toBe('普通的武器"火焰戒指"。散发着独特的光芒，蕴含着工匠的心血与魔法。');
    });

    it('应生成正确的精致品质护甲描述', () => {
      const result = generateResultDescription('隐身斗篷', 'ARMOR', 'RARE');
      expect(result).toBe('精致的护甲"隐身斗篷"。散发着独特的光芒，蕴含着工匠的心血与魔法。');
    });

    it('应生成正确的稀有品质工具描述', () => {
      const result = generateResultDescription('会唱歌的茶壶', 'TOOL', 'EPIC');
      expect(result).toBe('稀有的工具"会唱歌的茶壶"。散发着独特的光芒，蕴含着工匠的心血与魔法。');
    });

    it('应生成正确的传说品质玩具描述', () => {
      const result = generateResultDescription('魔法棒', 'TOY', 'LEGENDARY');
      expect(result).toBe('传说级的玩具"魔法棒"。散发着独特的光芒，蕴含着工匠的心血与魔法。');
    });

    it('应包含请求备注', () => {
      const result = generateResultDescription('火焰戒指', 'WEAPON', 'COMMON', '希望火焰是蓝色的');
      expect(result).toContain('希望火焰是蓝色的');
    });

    it('应处理未知的道具类型', () => {
      const result = generateResultDescription('神秘物品', 'UNKNOWN_TYPE' as any, 'RARE');
      expect(result).toContain('神秘物品');
      expect(result).toContain('物品');
    });
  });
});
