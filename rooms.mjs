export function roomSupported() {
  return !location.hostname.endsWith('.github.io');
}
export async function callRoom(path='',{method='GET',body,token}={}) {
  const url=new URL('./api/rooms'+path,location.href);
  const headers={'Accept':'application/json'};
  if(body) headers['Content-Type']='application/json';
  if(token) headers.Authorization='Bearer '+token;
  const response=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(6000)});
  const payload=await response.json();
  if(!response.ok) throw Error(payload.error||'Der Raum ist vorübergehend nicht erreichbar.');
  return payload;
}
export function roomToken() {
  const key='hobbymaxing-room-guest';
  let token=localStorage.getItem(key);
  if(!token) {
    token=crypto.randomUUID();
    localStorage.setItem(key,token);
  }
  return token;
}
export function knownRoomToken() {
  try {return localStorage.getItem('hobbymaxing-room-guest')||'';} catch {return '';}
}
