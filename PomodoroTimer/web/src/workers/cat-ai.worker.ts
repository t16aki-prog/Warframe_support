// cat-ai.worker.ts
// 猫の自律移動と状態判定をメインスレッド（UI）から切り離して処理します。

export type CatState = 'sit' | 'walk' | 'sleep' | 'stretch' | 'groom' | 'play' | 'dash' | 'pounce';
export type Facing = 'l' | 'r';

export interface CatData {
  id: string;
  type: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  state: CatState;
  facing: Facing;
  stateTimer: number;
}

let cats: CatData[] = [
  { id: 'cat1', type: 'calico', x: 200, y: 50, dx: 1, dy: 0, state: 'sit', facing: 'r', stateTimer: 60 }
];
let isWorking = false;
let loopId: NodeJS.Timeout | null = null;
let animTick = 0;

function updateAI() {
  animTick++;
  
  cats.forEach(cat => {
    if (!isWorking) {
      cat.state = 'sleep';
      return;
    }

    if (cat.stateTimer <= 0) {
      // 状態のランダム遷移 (歩く、走る、座る、毛づくろい等)
      const states: CatState[] = ['walk', 'sit', 'dash', 'groom', 'stretch', 'play'];
      const weights = [30, 20, 10, 15, 10, 15];
      // 簡易的な重み付き抽選
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalWeight;
      let nextState: CatState = 'sit';
      for (let i = 0; i < states.length; i++) {
        if (r < weights[i]) {
          nextState = states[i];
          break;
        }
        r -= weights[i];
      }
      
      cat.state = nextState;
      if (nextState === 'walk') {
        cat.dx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random());
        cat.facing = cat.dx > 0 ? 'r' : 'l';
        cat.stateTimer = 60 + Math.random() * 120;
      } else if (nextState === 'dash') {
        cat.dx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
        cat.facing = cat.dx > 0 ? 'r' : 'l';
        cat.stateTimer = 30 + Math.random() * 30;
      } else {
        cat.dx = 0;
        cat.stateTimer = 60 + Math.random() * 120;
      }
    } else {
      cat.stateTimer--;
    }

    if (cat.state === 'walk' || cat.state === 'dash') {
      // 60FPS基準での滑らかな移動
      cat.x += cat.dx * (60 / 60); 
      
      // 壁での反射判定 (キャンバスサイズを 400x150 と仮定)
      if (cat.x < 30) {
        cat.x = 30;
        cat.dx = Math.abs(cat.dx);
        cat.facing = 'r';
      } else if (cat.x > 370) {
        cat.x = 370;
        cat.dx = -Math.abs(cat.dx);
        cat.facing = 'l';
      }
    }
  });

  // 計算結果を毎フレーム（約16msごとに）メインスレッドへ送信
  self.postMessage({ type: 'SYNC', cats, animTick });
}

self.onmessage = (e: MessageEvent) => {
  const { command, workingState, initCats } = e.data;

  if (command === 'INIT') {
    if (initCats) cats = initCats;
    if (loopId) clearInterval(loopId);
    loopId = setInterval(updateAI, 16); // 60FPS
  } else if (command === 'SET_WORK_STATE') {
    isWorking = workingState;
  }
};
