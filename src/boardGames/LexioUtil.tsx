const importAllImages = () => {
const context = import.meta.glob('../assets/images/*.{jpg,png}', { eager: true });

const cardImages: { [key: string]: string } = {};
for (const path in context) {
    const fileName = path.split('/').pop()?.replace(/\.(jpg|png)$/, '');
    if (fileName) {
    cardImages[fileName] = (context[path] as { default: string }).default;
    }
}
return cardImages;
};

// 카드 생성용
const generateDeck = (images: { [key: string]: string }) => {
const deck = Object.entries(images).map(([name, url]) => {
    const match = name.match(/(Red|Blue|Green|Yellow)(\d+)/);
    if (!match) return null;
    const [, color, number] = match;
    return {
    id: name,
    color,
    number: Number(number),
    image: url
    };
});
return deck.filter(Boolean);
};