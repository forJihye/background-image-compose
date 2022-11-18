import './style.css'
import axios from 'axios';
import FormData from 'form-data';
import CanvasImageRatio from './canvas-image';

/**
 * 1. 이미지 파일 업로드
 * 2. 폼데이터 remove.bg API 요청
 * 3. 결과 이미지 출력
 * 4. 여러 합성 배경 이미지 썸네일 중 선택 합성
 */
const IMG_WIDTH = 900;
const IMG_HEIGHT = 600;

const randomImgList = (length: number) => Array.from({length}, (_, i) => `https://picsum.photos/${IMG_WIDTH}/${IMG_HEIGHT}?random=${i+1}`);
const getBlob = (object: (File|HTMLCanvasElement|ArrayBuffer), options: {type: string}): Promise<Blob> => new Promise(res => res(new Blob([object as any], options)));
const loadImage = (src: string) => new Promise(res => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => res(img)
  img.onerror = () => res(null);
  img.src = src;
});

const axiosRemoval = async (formData: FormData) => { try {
  const response = await axios({
    method: 'post',
    url: "https://api.remove.bg/v1.0/removebg",
    data: formData,
    responseType: "arraybuffer",
    headers: {
      "Content-Type": "multipart/form-data",
      'X-Api-Key': import.meta.env.VITE_REMOVE_BG_KEY
    },
  });
  return response;
} catch (err) {
  console.error(err);
  return null;
}}

const data: {
  img: null|HTMLImageElement;
  width: number;
  height: number;
  x: number;
  y: number;
} = {
  img: null,
  width: IMG_WIDTH,
  height: IMG_HEIGHT,
  x: 0,
  y: 0,
}
const canvasImage = new CanvasImageRatio();
const app = document.getElementById('app') as HTMLDivElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const inputEl = Object.assign(document.createElement('input'), {type: 'file', id: 'file', style: "margin-bottom: 20px;"}) as HTMLInputElement;
const bgContainer = Object.assign(document.createElement('div'), {style: 'display: grid; grid-template-columns: repeat(5, 1fr); grid-gap: 5px;'}) as HTMLDivElement;
const preview = Object.assign(document.createElement('div'), {style: 'width: 450px; margin: 20px auto; padding: 15px; border: 1px dashed #888; border-radius: 5px;'}) as HTMLDivElement;
const canvas = Object.assign(document.createElement('canvas'), {width: IMG_WIDTH, height: IMG_HEIGHT, style: "width: 100%; height: auto;"}) as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const fileChangeHandler = async (ev: Event) => {
  const target = ev.target as HTMLInputElement;
  const fileList = target.files as FileList;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (fileList.length) {
    loading.style.display = 'flex';
    const file = fileList[0];
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', file);
    const response = await axiosRemoval(formData) as any;
    if (response) {
      const blob = await getBlob(response.data, {type: 'image/png'});
      const url = URL.createObjectURL(blob);
      data.img = await loadImage(url) as HTMLImageElement;
      canvasImage.init(data);
      ctx.drawImage(canvasImage.canvas, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '70px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('Oops...😨 Error.', canvas.width/2, canvas.height/2 + 35);
    }
    loading.style.display = 'none';
  }
}

const backgroundHandler = (ev: MouseEvent): void => {
  const targetBgImg = ev.target as HTMLImageElement;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(targetBgImg, 0, 0, canvas.width, canvas.height);
  if (data.img) {
    canvasImage.drawImage(); 
    ctx.drawImage(canvasImage.canvas, 0, 0, canvas.width, canvas.height);
  }
};

const main = async () => { try {
  const bgImages = await Promise.all(randomImgList(5).map(async (imgSrc) =>  await loadImage(imgSrc)).filter(img => img)) as HTMLImageElement[];
  bgImages.map((img: HTMLImageElement) => Object.assign(img, {style: 'width: 150px; cursor: pointer;'})).forEach((img: HTMLImageElement) => bgContainer.appendChild(img));

  inputEl.addEventListener('change', fileChangeHandler);
  bgContainer.onclick = backgroundHandler 
  
  preview.appendChild(canvas);
  app.appendChild(inputEl);
  app.appendChild(bgContainer);
  app.appendChild(preview);
} catch (err) {
  console.error(err)
}}
main();