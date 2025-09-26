// admin.js - manage categories, subcategories, servers, videos, password
document.addEventListener('DOMContentLoaded', ()=>{
  const KEYS = {cats:'mk_cats_v14', servers:'mk_servers_v14', videos:'mk_videos_v14', admin:'mk_admin_v14'};
  function load(k){ return JSON.parse(localStorage.getItem(k) || 'null'); }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }

  const authSection = document.getElementById('authSection');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('adminLoginBtn');
  const passInput = document.getElementById('adminPassInput');
  const authMsg = document.getElementById('authMsg');

  // login
  loginBtn.addEventListener('click', ()=>{
    const admin = load(KEYS.admin) || {pass:'admin123'};
    if(passInput.value === admin.pass){ authSection.classList.add('hidden'); adminPanel.classList.remove('hidden'); renderAdmin(); }
    else authMsg.textContent='Wrong password';
  });

  // render admin data
  function renderAdmin(){
    const cats = load(KEYS.cats) || {};
    const servers = load(KEYS.servers) || [];
    const videos = load(KEYS.videos) || [];

    // populate category selects
    const catSelect = document.getElementById('selectCategoryForSub');
    const videoCat = document.getElementById('videoCategorySelect');
    catSelect.innerHTML=''; videoCat.innerHTML='';
    Object.keys(cats).forEach(c=>{ const o1=document.createElement('option'); o1.value=c; o1.textContent=c; catSelect.appendChild(o1); const o2=o1.cloneNode(true); videoCat.appendChild(o2); });

    // servers list
    const serversList = document.getElementById('serversList'); serversList.innerHTML='';
    servers.forEach((s,i)=>{ const li=document.createElement('li'); li.textContent = s.name + ' - ' + s.url; const rem=document.createElement('button'); rem.textContent='Remove'; rem.onclick = ()=>{ servers.splice(i,1); save(KEYS.servers,servers); renderAdmin(); }; li.appendChild(rem); serversList.appendChild(li); });

    // videos list
    const videosList = document.getElementById('videosList'); videosList.innerHTML='';
    videos.forEach((v,i)=>{ const li=document.createElement('li'); li.innerHTML = `<strong>${v.title}</strong> (${v.category}/${v.subcategory||'N/A'}) - eps:${v.episodes}`; const del=document.createElement('button'); del.textContent='Delete'; del.onclick=()=>{ videos.splice(i,1); save(KEYS.videos,videos); renderAdmin(); }; li.appendChild(del); videosList.appendChild(li); });
  }

  // add category
  document.getElementById('addCategoryBtn').addEventListener('click', ()=>{
    const name = document.getElementById('newCategoryName').value.trim(); if(!name) return alert('Enter category name');
    const cats = load(KEYS.cats) || {}; if(cats[name]) return alert('Category exists');
    cats[name]=[]; save(KEYS.cats,cats); renderAdmin();
    renderTopCategories(); alert('Category added');
  });

  // add subcategory
  document.getElementById('addSubBtn').addEventListener('click', ()=>{
    const parent = document.getElementById('selectCategoryForSub').value; const sub = document.getElementById('newSubName').value.trim();
    if(!parent || !sub) return alert('Choose category & enter sub name');
    const cats = load(KEYS.cats) || {}; cats[parent] = cats[parent] || []; if(cats[parent].includes(sub)) return alert('Sub exists');
    cats[parent].push(sub); save(KEYS.cats,cats); renderAdmin(); renderTopCategories(); alert('Subcategory added');
  });

  // add server
  document.getElementById('addServerBtn').addEventListener('click', ()=>{
    const name = document.getElementById('serverNameInput').value.trim(); const url = document.getElementById('serverUrlInput').value.trim();
    if(!name || !url) return alert('Enter server name & url');
    const servers = load(KEYS.servers) || []; servers.push({name,url}); save(KEYS.servers,servers); renderAdmin(); alert('Server added');
  });

  // add video
  document.getElementById('addVideoBtn').addEventListener('click', ()=>{
    const title = document.getElementById('videoTitleInput').value.trim();
    const thumb = document.getElementById('videoThumbInput').value.trim();
    const category = document.getElementById('videoCategorySelect').value;
    const sub = document.getElementById('videoSubSelect').value;
    const episodes = parseInt(document.getElementById('videoEpisodes').value)||1;
    const url = document.getElementById('videoUrlInput').value.trim();
    if(!title||!url) return alert('Title and URL required');
    const videos = load(KEYS.videos) || [];
    const id = videos.length? (Math.max(...videos.map(v=>v.id))+1) : 1;
    videos.push({id,title,thumb,category,subcategory:sub,episodes,sources:[{label:'default',url}],subs:[],views:0,uploaded:Date.now()});
    save(KEYS.videos,videos); renderAdmin(); alert('Video added');
  });

  // change admin password
  document.getElementById('changePassBtn').addEventListener('click', ()=>{
    const np = document.getElementById('changePassInput').value.trim(); if(!np) return alert('Enter new password');
    const admin = load(KEYS.admin) || {pass:'admin123'}; admin.pass = np; save(KEYS.admin,admin); alert('Password updated');
  });

  // export/import data
  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const data = {cats:load(KEYS.cats),servers:load(KEYS.servers),videos:load(KEYS.videos),admin:load(KEYS.admin)};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mkstream-data.json'; a.click();
  });
  document.getElementById('importFile').addEventListener('change', (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader(); reader.onload = ()=>{
      try{ const data = JSON.parse(reader.result); if(data.cats) save(KEYS.cats,data.cats); if(data.servers) save(KEYS.servers,data.servers); if(data.videos) save(KEYS.videos,data.videos); if(data.admin) save(KEYS.admin,data.admin); alert('Imported'); renderAdmin(); renderTopCategories(); }catch(err){ alert('Invalid JSON'); }
    }; reader.readAsText(file);
  });

  // populate video sub select when category changes in admin add video form
  document.getElementById('videoCategorySelect').addEventListener('change', ()=>{
    const cats = JSON.parse(localStorage.getItem(KEYS.cats)||'{}');
    const sel = document.getElementById('videoSubSelect'); sel.innerHTML = '<option value="">(none)</option>';
    (cats[document.getElementById('videoCategorySelect').value]||[]).forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; sel.appendChild(o); });
  });

  // initial render
  function renderAdmin(){ return; } // placeholder, renderAdmin called after login
});
