// 公共的方法
// 设置样式
/*d:DOM元素 styleObject:样式对象 */
function setStyle(d, styleObject) {
  for (const key in styleObject) {
    d["style"][key] = styleObject[key];
  }
  d["style"]["transition"] = ".225s";
}

// 在规定的min~max范围内：生成随机的坐标
function randomPosition(min, max) {
  return randomKey(min, max);
}

// 生成在min~max范围内随机的数字 (min,max)
function randomKey(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min);
}

// 打乱数组document
function randomSort(a, b) {
  return Math.random() > 0.5 ? -1 : 1;
}

//定义与设置变量
// 获取dom元素
const app = document.querySelector("#app");
const box = document.querySelector("#box");
console.log(box.style);
// 设置图片的大小
const $width = 60;
const $height = 60;
// 多少组 ：这个数字必须是 3 的倍数，BlockNums *7=页面上一共生成多少张图片
const BlockNums = 3;
// 存放所有的Block块，存放页面上所有的图片，然后进行渲染
const allBlock = [];
// 图片的地址
const IMGS = [
  "./img/1.png",
  "./img/2.jpg",
  "./img/3.gif",
  "./img/4.png",
  "./img/5.png",
  "./img/6.png",
  "./img/7.png",
];
// 游戏是否结束
let gameOver = false;

// 定义收集盒的数组，存放放进来的图片
const hasBlockArr = [];
// 获取收集盒的位置信息
var storageBoxPostion;
// 获取收集盒中存放第一张图片的位置
var startLeft;

/**
 * 计算渲染区域的位置，将对应数组的图片展示在页面中
 * @returns AppPosition对象 可以放图片的渲染区域
 */
function calPosition() {
  // 获取app的位置信息
  const { x, y } = app.getBoundingClientRect();
  const AppPosition = {
    x,
    y,
    drawStartX: 20,
    drawStartY: 20,
    drawEndX: app.offsetWidth - $width -20,
    drawEndY: app.offsetHeight - 200,
  };
  return AppPosition;
}
const AppPosition = calPosition();

// 将块放入到收集盒中
function computedBoxPosition(target, targetDomClass) {
  // console.log(target);
  // console.log(targetDomClass);
  // 当前元素设置在最顶层，移动的时候，可以看见路线
  setStyle(target, {
    zIndex: 9999,
  });
  const Item = { target, targetDomClass };
  storageBoxPostion = storageBox.getBoundingClientRect();
  // console.log( storageBoxPostion);//收集盒的位置信息
  // startLeft = storageBoxPostion.x + 10;
  startLeft = storageBoxPostion.x - AppPosition.x + 10;
  const top = storageBoxPostion.y - AppPosition.y + 10 + "px";
  if (!hasBlockArr.length) {
    setStyle(target, {
      left: startLeft + "px",
      top,
    });
    targetDomClass.left = startLeft;
    hasBlockArr.push(Item);
    console.log(Item);
  } else {
    // 查找是否有相同的元素存在
    const hasIndex = hasBlockArr.findIndex((v) => {
      return v.targetDomClass.n == targetDomClass.n;
    });
    if (hasIndex === -1) {
      //没有相同的元素存在
      const left = startLeft + hasBlockArr.length * targetDomClass.width;
      setStyle(target, {
        left: left + "px",
        top,
      });
      // 实例对象也要修改
      targetDomClass.left = left;
      hasBlockArr.push(Item);
    } else {
      //有相同的元素
      //  将后面所有的元素包括自身都要后退一个位置
      for (let index = hasBlockArr.length - 1; index >= hasIndex; index--) {
        const newleft = startLeft + (index + 1) * $width;
        setStyle(hasBlockArr[index].target, {
          left: newleft + "px",
        });
        hasBlockArr[index].targetDomClass.left = newleft;
      }
      setStyle(target, {
        left: startLeft + hasIndex * targetDomClass.width + "px",
        top,
      });
      targetDomClass.left = startLeft + hasIndex * targetDomClass.width;
      hasBlockArr.splice(hasIndex, 0, Item); //插入
    }
  }
  //image元素被选中之后，将其从allBlock中删除掉
  Item.target.classList.remove("noSelect"); //没有被选中，删除
  Item.target.classList.add("isSelect"); //添加，表示被选中的
  const removeIndex = allBlock.findIndex((v) => {
    return v.index === Item.targetDomClass.index;
  });
  // 删除allBock中的对应的对象
  allBlock.splice(removeIndex, 1);
  // 暴力高亮，重新渲染
  const noSelect = document.querySelectorAll(".noSelect");
  // 全部删除剩余所有的元素
  for (let i = 0; i < noSelect.length; i++) {
    box.removeChild(noSelect[i]);
  }
  // 重新渲染
  allBlock.forEach((item) => {
    box.appendChild(item.draw());
  });
}
// 验证输赢
function GameState() {
  if (hasBlockArr.length === 7) {
    alert("不好意思，你输了，有点小菜鸡哈，继续加油！！！");
    gameOver = true;
  }
  if (!allBlock.length && !hasBlockArr.length) {
    alert("哇，好厉害，恭喜你赢得胜利！！！");
    gameOver = true;
  }
  // 判断游戏结束
  if (gameOver) {
    window.location.reload(false);
  }
}

/**
 * 三连完成消消乐
 * 将相同的元素进行消除
 * checkMap：对象 以图片的属性路径(n)为key，key值为数组,数组中存放路径相同的收集框图片元素的下标和图片本身的id
 */
function checkBox() {
  const checkMap = {}; //用来接受收集盒中的相同的图片的数据
  hasBlockArr.forEach((item, index) => {
    if (!checkMap[item.targetDomClass.n]) {
      checkMap[item.targetDomClass.n] = [];
    }
    checkMap[item.targetDomClass.n].push({
      index: index,
      id: item.targetDomClass.index,
    });
    // console.log(checkMap);
    for (const key in checkMap) {
      if (checkMap[key].length === 3) {
        // console.log('可以删除');
        //删除数组中的相同的三个元素
        hasBlockArr.splice(checkMap[key][0].index, 3);
        // 同时删除页面的dom
        setTimeout(() => {
          checkMap[key].forEach((item) => {
            var box = document.getElementById(item.id);
            box.parentNode.removeChild(box);
          });
          // 改变页面其他的dom元素的位置
          hasBlockArr.forEach((item, index) => {
            let left = startLeft + index * item.targetDomClass.width + "px";
            setStyle(item.target, {
              left,
            });
            item.targetDomClass.left = left;
          });
        }, 300);
      }
    }
  });
  // 验证状态
  setTimeout(() => {
    GameState();
  }, 500);
}

/**定义图像的点击事件 */
function clickBlock(target, targetDomClass) {
  if (targetDomClass.blockState) {
    //只有为true，表示未被遮挡，才可以点击
    // 收集元素
    computedBoxPosition(target, targetDomClass);
    // 消除相同的元素
    checkBox();
  }
}

/**
 * 图片的数据结构
 * 定义一个类，类的实例对象上就保存自身的信息，存放路径，位置，大小，是否被隐藏
 * src：图片路径
 *  i ：图片在图片数组里的下标
 *  allBlock:这里的每一个图片对象都会存储到allBlock数组中去
 *  n：对比路径，判断是不是---方便查找相同元素
 *  blockState 可否被隐藏
 * 判断当前元素是否被遮挡
 * 生成image元素  x y width height src index n blockState
 * */
class Block {
  constructor(src, i) {
    this.width = $width;
    this.height = $height;
    this.src = src;
    this.index = i;
    this.n = src;
    this.blockState = false;
    this.x = randomPosition(AppPosition.drawStartX, AppPosition.drawEndX);
    this.y = randomPosition(AppPosition.drawStartY, AppPosition.drawEndY);
  }
  // 判断当前image是否被遮挡，拿到coverstate的值
  isCover() {
    var thatBlock; //表示当前的元素
    var coverState = false; //是否被覆盖
    for (let i = 0; i < allBlock.length; i++) {
      // 在第i轮循环的时候 找到当前元素thatBlock，
      // i+1轮和后面所有的image元素比较一遍
      if (allBlock[i].index === this.index) {
        thatBlock = allBlock[i];
      } else if (thatBlock) {
        // 找到目标元素
        const target = allBlock[i];
        // console.log(thatBlock);
        // console.log(target);
        // 找到目标元素对应的位置
        var xLeft = target.x;
        var xRight = target.x + target.width;
        var yTop = target.y;
        var yBottom = target.y + target.height;
        if (
          !(
            thatBlock.x > xRight ||
            thatBlock.x + thatBlock.width < xLeft ||
            thatBlock.y > yBottom ||
            thatBlock.y + thatBlock.height < yTop
          )
        ) {
          coverState = true;
          break;
        }
      }
    }
    return coverState;
  }
  // 生成img元素和元素属性 将图片渲染
  draw() {
    const imgDom = new Image();
    imgDom.src = this.src;
    imgDom.id = this.index;
    imgDom.classList = "noSelect imgGlobal"; //设定绝对定位
    imgDom.onclick = clickBlock.bind(null, imgDom, this);
    let style = {
      width: this.width + "px",
      height: this.height + "px",
      left: this.x + "px",
      top: this.y + "px",
    };
    if (this.isCover()) {
      imgDom.classList.add("imgFilter");
      this.blockState = false;
    } else {
      imgDom.classList.remove("imgFilter");
      this.blockState = true;
    }
    setStyle(imgDom, style);
    if (this.index == 1) {
      console.log(imgDom);
    }
    return imgDom;
  }
}

/*
 * gloup:组数，是BlockNums中的值，此时这个值等于3
 * 将图片放在数组中
 * 声明image的DOM元素
 *并使用appendChild方法将其放在页面上
 */
function drawBlock(gloup) {
  let virtualArr = [];
  for (let i = 0; i < gloup; i++) {
    virtualArr.push(...IMGS.sort(randomSort));
  }
  //console.log(IMGS.sort(randomSort));
  // console.log(virtualArr);
  virtualArr.forEach((item, index) => {
    const vBlock = new Block(item, index);
    allBlock.push(vBlock);
  });
  // console.log(allBlock);
  // 将图片放在页面上 渲染
  allBlock.forEach((item) => {
    box.appendChild(item.draw());
  });
}
/**
 * 生成图片
 * 为storageBox设置样式
 */
window.onload = () => {
  drawBlock(BlockNums);
  // 给收集盒子定义样式
  setStyle(storageBox, {
    border: "10px solid blue",
  });
};
