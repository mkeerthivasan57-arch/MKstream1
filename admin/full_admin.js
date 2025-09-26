
/* MKstream v22 full admin wiring */
document.addEventListener('DOMContentLoaded', ()=>{
  const KEYS = {ads:'mk_ads', theme:'mk_theme', tele:'mk_tele', videos:'mk_videos', servers:'mk_servers', cats:'mk_cats', views:'mk_views'};
  function load(k){ return JSON.parse(localStorage.getItem(k) || 'null'); }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  if(!load(KEYS.ads)) save(KEYS.ads, []);
  if(!load(KEYS.theme)) save(KEYS.theme, {primary:'#052e8c', logo:''});
  if(!load(KEYS.tele)) save(KEYS.tele, {api:'', chat:''});
  if(!load(KEYS.servers)) save(KEYS.servers, [{name:'Server 1',url:''}]);
  if(!load(KEYS.cats)) save(KEYS.cats, {"Anime":[], "Donghua":[], "Cartoon":[], "Drama":[], "Serial":[], "Web Series":[]});
  if(!load(KEYS.videos)) save(KEYS.videos, []);

  // Ads manager
  const adName = document.getElementById('adName'), adPlacement = document.getElementById('adPlacement'), adCode = document.getElementById('adCode'), addAdBtn = document.getElementById('addAdBtn'), adsList = document.getElementById('adsList');
  function renderAds(){ const ads = load(KEYS.ads) || []; adsList.innerHTML=''; ads.forEach((a,i)=>{ const d=document.createElement('div'); d.className='admin-ad'; d.innerHTML = '<strong>'+a.name+'</strong> ('+a.placement+') <div>'+a.code+'</div>'; const t=document.createElement('button'); t.textContent = a.enabled ? 'Disable' : 'Enable'; t.onclick = ()=>{ a.enabled = !a.enabled; save(KEYS.ads, ads); renderAds(); }; const r=document.createElement('button'); r.textContent='Remove'; r.onclick = ()=>{ ads.splice(i,1); save(KEYS.ads,ads); renderAds(); }; d.appendChild(t); d.appendChild(r); adsList.appendChild(d); }); }
  addAdBtn?.addEventListener('click', ()=>{ const name = adName.value.trim(); const placementV = adPlacement.value; const codeV = adCode.value.trim(); if(!name||!codeV) return alert('Ad name and code required'); const ads = load(KEYS.ads)||[]; ads.push({name,placement:placementV,code:codeV,enabled:true}); save(KEYS.ads,ads); renderAds(); adName.value=''; adCode.value=''; alert('Ad added'); });
  renderAds();

  // Theme & logo
  const themeColor = document.getElementById('themeColor'), logoUrl = document.getElementById('logoUrl'), applyThemeBtn = document.getElementById('applyThemeBtn');
  const themeObj = load(KEYS.theme) || {primary:'#052e8c', logo:''};
  if(themeObj.primary) themeColor.value = themeObj.primary;
  if(themeObj.logo) logoUrl.value = themeObj.logo;
  function applyTheme(color, logo){ document.documentElement.style.setProperty('--accent', color); const t = load(KEYS.theme)||{}; t.primary = color; if(logo) t.logo = logo; save(KEYS.theme,t); alert('Theme saved'); }
  applyThemeBtn?.addEventListener('click', ()=>{ applyTheme(themeColor.value, logoUrl.value.trim()); });

  // Telegram test
  const tgApiKey = document.getElementById('tgApiKey'), tgChatId = document.getElementById('tgChatId'), tgTestBtn = document.getElementById('tgTestBtn');
  const tele = load(KEYS.tele) || {}; if(tele.api) tgApiKey.value = tele.api; if(tele.chat) tgChatId.value = tele.chat;
  tgApiKey?.addEventListener('change', ()=>{ const t = load(KEYS.tele)||{}; t.api = tgApiKey.value; save(KEYS.tele,t); });
  tgChatId?.addEventListener('change', ()=>{ const t = load(KEYS.tele)||{}; t.chat = tgChatId.value; save(KEYS.tele,t); });
  tgTestBtn?.addEventListener('click', async ()=>{
    const t = load(KEYS.tele) || {}; if(!t.api || !t.chat) return alert('Set API and Chat ID in fields first'); try{
      const res = await fetch('https://api.telegram.org/bot'+t.api+'/sendMessage', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({chat_id:t.chat, text:'Test message from MKstream Admin.'})});
      const j = await res.json(); if(j.ok) alert('Telegram message sent'); else alert('Telegram returned error: '+ JSON.stringify(j));
    }catch(e){ alert('Telegram test failed (CORS if using browser). If blocked, use server-side telegram_update.php on your own host.'); }
  });

  // expose saving functions
  window.mk_save_ads = ()=> save(KEYS.ads, load(KEYS.ads)||[]);
  window.mk_apply_theme = applyTheme;
  renderAds();
});
