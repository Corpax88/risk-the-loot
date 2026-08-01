const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const zlib=require('zlib');

const ASSET_DIR=path.join(__dirname,'..','assets');
const HANDLAVA_PHASES=['idle','extend','grab','swing','throw','retract'];
const ASSETS=[
  ...HANDLAVA_PHASES.map(phase=>({name:'handlava-'+phase+'-v1.png',width:1024,height:256,frames:4})),
  {name:'lava-gear-icons-v1.png',width:1280,height:256,frames:5},
  {name:'lava-gear-drops-v1.png',width:400,height:80,frames:5}
];

function paeth(left,up,upperLeft){
  const estimate=left+up-upperLeft;
  const leftDistance=Math.abs(estimate-left),upDistance=Math.abs(estimate-up),upperLeftDistance=Math.abs(estimate-upperLeft);
  return leftDistance<=upDistance&&leftDistance<=upperLeftDistance?left:upDistance<=upperLeftDistance?up:upperLeft;
}

function decodeRgbaPng(file){
  const bytes=fs.readFileSync(file);
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),path.basename(file)+' is not a PNG');
  let offset=8,width=0,height=0,bitDepth=0,colorType=-1,interlace=-1;
  const compressed=[];
  while(offset<bytes.length){
    const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,offset+8+length);
    offset+=length+12;
    if(type==='IHDR'){
      width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];interlace=data[12]
    }else if(type==='IDAT')compressed.push(data);
    else if(type==='IEND')break;
  }
  assert.equal(bitDepth,8,path.basename(file)+' must use 8-bit channels');
  assert.equal(colorType,6,path.basename(file)+' must preserve an RGBA alpha channel');
  assert.equal(interlace,0,path.basename(file)+' must be non-interlaced for predictable mobile decoding');
  const bytesPerPixel=4,rowBytes=width*bytesPerPixel,raw=zlib.inflateSync(Buffer.concat(compressed));
  assert.equal(raw.length,height*(rowBytes+1),path.basename(file)+' has an unexpected decoded size');
  const pixels=Buffer.alloc(width*height*bytesPerPixel);
  let source=0;
  for(let y=0;y<height;y++){
    const filter=raw[source++],rowOffset=y*rowBytes,previousOffset=(y-1)*rowBytes;
    assert(filter>=0&&filter<=4,path.basename(file)+' uses an unsupported PNG filter');
    for(let x=0;x<rowBytes;x++){
      const value=raw[source++],left=x>=bytesPerPixel?pixels[rowOffset+x-bytesPerPixel]:0,up=y?pixels[previousOffset+x]:0,upperLeft=y&&x>=bytesPerPixel?pixels[previousOffset+x-bytesPerPixel]:0;
      const prediction=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,upperLeft);
      pixels[rowOffset+x]=(value+prediction)&255;
    }
  }
  return {width,height,pixels};
}

function framePixels(image,frameIndex,frameCount){
  const frameWidth=image.width/frameCount,frame=Buffer.alloc(frameWidth*image.height*4);
  for(let y=0;y<image.height;y++){
    const source=(y*image.width+frameIndex*frameWidth)*4,destination=y*frameWidth*4;
    image.pixels.copy(frame,destination,source,source+frameWidth*4);
  }
  return frame;
}

const sheetHashes=new Map();
for(const asset of ASSETS){
  const file=path.join(ASSET_DIR,asset.name);
  assert(fs.existsSync(file),'Lava asset is missing: '+asset.name);
  const image=decodeRgbaPng(file);
  assert.deepEqual([image.width,image.height],[asset.width,asset.height],asset.name+' dimensions are wrong');
  assert.equal(image.width%asset.frames,0,asset.name+' cannot be split into equal horizontal frames');
  const hashes=[];
  for(let frameIndex=0;frameIndex<asset.frames;frameIndex++){
    const frame=framePixels(image,frameIndex,asset.frames),pixelCount=frame.length/4;
    let transparent=0,visible=0,maxAlpha=0;
    for(let alphaIndex=3;alphaIndex<frame.length;alphaIndex+=4){
      const alpha=frame[alphaIndex];if(alpha===0)transparent++;else visible++;if(alpha>maxAlpha)maxAlpha=alpha
    }
    assert(visible>pixelCount*.01,asset.name+' frame '+frameIndex+' has no readable silhouette');
    assert(transparent>pixelCount*.01,asset.name+' frame '+frameIndex+' lost its transparent background');
    assert.equal(maxAlpha,255,asset.name+' frame '+frameIndex+' has no fully opaque visual foundation');
    hashes.push(crypto.createHash('sha256').update(frame).digest('hex'));
  }
  assert.equal(new Set(hashes).size,asset.frames,asset.name+' contains duplicate animation/item frames');
  sheetHashes.set(asset.name,crypto.createHash('sha256').update(image.pixels).digest('hex'));
}
assert.equal(new Set(HANDLAVA_PHASES.map(phase=>sheetHashes.get('handlava-'+phase+'-v1.png'))).size,HANDLAVA_PHASES.length,'Handlava phases reuse a duplicate spritesheet');

console.log('Handlava asset smoke passed: 6 four-frame ability sheets and 2 five-item Lava gear strips retain alpha and unique silhouettes.');
