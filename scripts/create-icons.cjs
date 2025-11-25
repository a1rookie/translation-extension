const fs = require('fs');
const path = require('path');

// 简单的 PNG 占位符（1x1 透明像素）然后用 Canvas 绘制
// 这是一个基本的紫色方块 Base64 PNG

// 16x16 紫色渐变图标
const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABzSURBVDiNrdOxCQJBDATAXUEsbMBSLMUObEEsbOL+BixFLCzAm5OTv4FNvC0mmM0OhARJVSVJ05r2qup7VdVX3VfVz6qqpqr6rqpqquqnqn5X1c+qqo+qvq6q3lddTVX1XVV9X1V9VlXfVNV3VfVdVT2vqt5W1ddR+gN8+xvhAAAAAElFTkSuQmCC';

// 48x48 紫色渐变图标
const icon48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADESURBVGiB7ZmxDYQwDEV/RAOsQMsKjMAIbMAGjMAKlLRQ0gMFBeKS/1P+k65Idp5tyZYcY4yZmZmZvQNg7+v6LM/yrM/y7Pou3/osP8uzPKuzzPIsf5Zn+bM8y53lWf5ZnuXP8ix3lme5s/xdnuXP8ix3lme5szzLn+VZ7izPcmd5lj/Ls9xZnuXP8ix3lme5szzLneVZ/izPcmd5ljvLs9xZnuXO8ix3lme5szzLneVZ7izPcme5s9xZnuXO8ix3lme5s9xZbs/MzMzs3wBcAbkCu1szxVcAAAAASUVORK5CYII=';

// 128x128 紫色渐变图标
const icon128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHMSURBVHic7doxCoBADADBvP8/azewsLEQrOxuZqBNczBBICIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIvJvgAt4At/RHcgPcAEv4D66g/yAC3gCt9EdpA+4gCtwG91B/oAb8ACO0R3kH7gBN+AY3UH+gBtwAY7RHeQXuAE34BzdQf6AG3ADrtEd5Be4AXfgHN1B/oA7cAOu0R3kD7gDN+Aa3UH+gDtwB+7RHeQPuAN34BrdQX6BO/AA7tEd5A+4Aw/gHt1B/oA78AAe0R3kF7gDD+AR3UH+gAfwBN7RHeQXeABP4B3dQf6AJ/AE3tEd5Bd4Ak/gHd1BfoEn8ATe0R3kF3gCL+Ad3UH+gCfwAt7RHeQXeAIv4B3dQf6AF/AC3tEd5Bd4AS/gE91B/oAX8AI+0R3kF3gBb+AT3UF+gTfwAt7RHeQXeANv4BvdQX6BN/AG3tEd5Bd4A2/gHd1BfoE38Abe0R3kF3gDb+AT3UH+gA/wBj7RHeQP+ABv4BPdQf6AD/ABftEd5A/4AB/gF91B/oAP8AF+0R3kD/gAP+AX3UH+gB/wA37RHeQP+AE/4BfdQf6AH/ADftEd5A/4AX/gH91BREREREREREREREREREREREREROQrfgDBvMUVItJV8gAAAABJRU5ErkJggg==';

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 写入图标文件
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), Buffer.from(icon16Base64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), Buffer.from(icon48Base64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), Buffer.from(icon128Base64, 'base64'));

console.log('✅ 图标文件已创建！');
console.log('  - icon16.png');
console.log('  - icon48.png');
console.log('  - icon128.png');
console.log('\n现在可以运行: npm run build');
