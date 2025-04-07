import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import './Test3.css';

const Test3 = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current || undefined,
      backgroundColor: '#000000',
      scene: {
        preload() {
          const cardNames = [
            'ek_bomb', 'ek_attack', 'ek_back', 'ek_bread', 'ek_favor',
            'ek_future', 'ek_hairy', 'ek_melon', 'ek_ralping', 'ek_shuffle',
            'ek_skip', 'ek_taco', 'ek_explotion_1', 'ek_explotion_2'
          ];

          cardNames.forEach(name => {
            const ext = name.includes('1') ? 'jpg' : 'png';
            this.load.image(name, `/assets/images/explodingkittens/${name}.${ext}`);
          });

          this.load.audio('explode_sound', '/assets/sounds/explodingkittens/explosion_Sound_Effects.wav');
        },

        create() {
          const screenWidth = this.scale.width;
          const screenHeight = this.scale.height;
          const isMobile = screenWidth <= 1080;

          const cardKeys = ['ek_attack', 'ek_skip', 'ek_bomb', 'ek_attack', 'ek_skip'];

          // ✅ 카드 통일 사이즈 (가로 * 세로)
          const cardWidth = screenWidth * (isMobile ? 0.16 : 0.10);
          const cardHeight = cardWidth * 1.4; // 5:7 비율

          const spacing = cardWidth * 0.6;
          const centerX = screenWidth / 2;
          const baseY = screenHeight - cardHeight * 0.6;

          const angleStep = 10;
          const verticalCurve = 15;

          const totalCards = cardKeys.length;
          const startIndex = -Math.floor((totalCards - 1) / 2);

          cardKeys.forEach((key, index) => {
            const offset = startIndex + index;

            const x = centerX + offset * spacing;
            const y = baseY + Math.pow(offset, 2) * verticalCurve; // ✅ 볼록한 곡선

            const angle = offset * angleStep;

            const card = this.add.image(x, y, key);
            card.setDisplaySize(cardWidth, cardHeight); // ✅ 강제 사이즈 통일
            card.setAngle(angle);
            card.setInteractive();
            this.input.setDraggable(card);
          });

          this.input.on('drag', (_pointer: any, gameObject: { x: any; y: any; setAngle: (arg0: number) => void; }, dragX: any, dragY: any) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setAngle(0); // 드래그 시 회전 초기화
          });
        }
      }
    };

    const game = new Phaser.Game(config);

    const handleResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      game.destroy(true);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="game-container" style={{ width: '100vw', height: '100vh' }}>
      <div ref={gameRef} />
    </div>
  );
};

export default Test3;
