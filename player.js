// player.js - player interactions: sources, servers, qualities, subtitles, episodes, gestures
document.addEventListener('DOMContentLoaded', ()=>{
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id')) || null;
  const videos = JSON.parse(localStorage.getItem('mk_videos_v14')||'[]');
  const servers = JSON.parse(localStorage.getItem('mk_servers_v14')||'[]');
  const videoEl = document.getElementById('mainVideo');
  const serverSelect = document.getElementById('serverSelect');
  const qualitySelect = document.getElementById('qualitySelect');
  const subtitleSelect = document.getElementById('subtitleSelect');
  const downloadBtn = document.getElementById('downloadBtn');
  const episodeRange = document.getElementById('episodeRange');
  const episodeList = document.getElementById('episodeList');
  const gestureOverlay = document.getElementById('gestureOverlay');

  if(!videoEl) return;

  // populate servers
  servers.forEach(s=>{ const o=document.createElement('option'); o.value=s.url; o.textContent=s.name; serverSelect.appendChild(o); });

  const selected = videos.find(v=>v.id===id) || videos[0];
  if(!selected) return;

  function loadSource(url){ while(videoEl.firstChild) videoEl.removeChild(videoEl.firstChild); const s=document.createElement('source'); s.src=url; s.type='video/mp4'; videoEl.appendChild(s); videoEl.load(); }

  // populate quality, subtitles
  qualitySelect.innerHTML=''; subtitleSelect.innerHTML='';
  (selected.sources||[]).forEach(src=>{ const o=document.createElement('option'); o.value=src.url; o.textContent=src.label; qualitySelect.appendChild(o); });
  const off = document.createElement('option'); off.value='none'; off.textContent='No subtitles'; subtitleSelect.appendChild(off);
  (selected.subs||[]).forEach(sub=>{ const o=document.createElement('option'); o.value=sub.url; o.textContent=sub.lang; subtitleSelect.appendChild(o); });

  if(selected.sources && selected.sources[0]) loadSource(selected.sources[0].url);

  qualitySelect.addEventListener('change', ()=> loadSource(qualitySelect.value));
  serverSelect.addEventListener('change', ()=> loadSource(serverSelect.value));
  subtitleSelect.addEventListener('change', ()=> {
    Array.from(videoEl.querySelectorAll('track')).forEach(t=>t.remove());
    if(subtitleSelect.value !== 'none'){ const tr=document.createElement('track'); tr.kind='subtitles'; tr.src=subtitleSelect.value; tr.srclang='en'; tr.label='Sub'; videoEl.appendChild(tr); }
  });

  downloadBtn.addEventListener('click', ()=>{
    const a = document.createElement('a'); a.href = videoEl.currentSrc; a.download = selected.title + '.mp4'; document.body.appendChild(a); a.click(); a.remove();
  });

  // episodes ranges and list
  function setupRanges(total){
    episodeRange.innerHTML='';
    const per = 100;
    for(let i=1;i<=total;i+=per){ const end=Math.min(i+per-1,total); const o=document.createElement('option'); o.value = `${i}-${end}`; o.textContent = `${i}-${end}`; episodeRange.appendChild(o); }
    populateEpisodesFromRange(episodeRange.value || `1-${Math.min(per,total)}`, total);
  }
  function populateEpisodesFromRange(range, total){
    episodeList.innerHTML='';
    const [s,e] = range.split('-').map(Number);
    for(let i=s;i<=e;i++){ const b=document.createElement('button'); b.textContent = `Ep ${i}`; b.onclick = ()=> { videoEl.currentTime = 0; alert('Play episode ' + i); }; episodeList.appendChild(b); }
  }
  setupRanges(selected.episodes||1);
  episodeRange.addEventListener('change', ()=> populateEpisodesFromRange(episodeRange.value));

  // gestures: double tap skip, swipe fast-forward/rewind
  let lastTap=0, touchStartX=0;
  videoEl.addEventListener('touchstart', e=> { if(e.touches.length===1) touchStartX = e.touches[0].clientX; });
  videoEl.addEventListener('touchend', e=> {
    const touchEndX = e.changedTouches[0].clientX; const now = Date.now();
    if(now - lastTap < 300){
      // double tap -> skip 15s forward
      if(touchEndX < window.innerWidth/2){ videoEl.currentTime = Math.max(0, videoEl.currentTime - 15); showOverlay('-15s'); }
      else { videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 15); showOverlay('+15s'); }
    } else {
      const dx = touchEndX - touchStartX;
      if(Math.abs(dx) > 80){
        if(dx > 0){ videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 10); showOverlay('+10s'); }
        else { videoEl.currentTime = Math.max(0, videoEl.currentTime - 10); showOverlay('-10s'); }
      }
    }
    lastTap = now;
  });
  function showOverlay(txt){ gestureOverlay.textContent = txt; gestureOverlay.style.display='block'; setTimeout(()=> gestureOverlay.style.display='none',700); }
});
