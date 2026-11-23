function database() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('hobbymaxing-photos',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('pictures');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function transact(mode,operate) {
  const db=await database();
  try {
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction('pictures',mode);
      const request=operate(tx.objectStore('pictures'));
      tx.oncomplete=()=>resolve(request.result);
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
    });
  } finally { db.close(); }
}

export async function preparePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12000000) {
    throw new Error('Wähle ein JPG-, PNG- oder WebP-Foto bis 12 MB.');
  }
  const image=await createImageBitmap(file);
  try {
    const factor=Math.min(1,900/Math.max(image.width,image.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.width*factor));
    canvas.height=Math.max(1,Math.round(image.height*factor));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Das Foto konnte nicht verarbeitet werden.')),'image/jpeg',.78));
  } finally { image.close(); }
}
export const putPhoto=(id,blob)=>transact('readwrite',store=>store.put(blob,id));
export const deletePhoto=id=>transact('readwrite',store=>store.delete(id));
export const clearPhotos=()=>transact('readwrite',store=>store.clear());
export function showPhotos(root) {
  for(const holder of root.querySelectorAll('[data-photo]')) {
    transact('readonly',store=>store.get(holder.dataset.photo)).then(blob=>{
      if(!blob||!holder.isConnected) return;
      const image=document.createElement('img');
      const url=URL.createObjectURL(blob);
      image.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
      image.addEventListener('error',()=>URL.revokeObjectURL(url),{once:true});
      image.src=url;
      image.alt=holder.dataset.photoAlt||'Dein privates Quest-Foto';
      holder.append(image);
    }).catch(()=>{});
  }
}
