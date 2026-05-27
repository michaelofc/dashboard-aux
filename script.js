      // --- EFEITOS ESPECIAIS DE PARABÉNS E ALERTA ---
      try {
        const filialUser = ranking[0]?.nome || '';
        const inad = ranking[0]?.inadimplencia || 0;
        // Sempre mostra o efeito ao entrar/atualizar a aba
        if (inad < 0.3) {
          showSpecialCongrats(filialUser);
        }
        if (inad >= 0.3) {
          showSpecialAlert(filialUser, inad);
        }
      } catch(e) { /* ignora erros de efeito especial */ }

// --- Função para parabéns animado ---
function showSpecialCongrats(filial) {
  const el = document.getElementById('specialCongrats');
  if (!el) return;
  el.innerHTML = `
    <div style="width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;pointer-events:none;">
      <div id="congratsModal" style="background:rgba(255,255,255,0.98);border-radius:32px;padding:48px 64px;box-shadow:0 8px 64px #00d4ff55,0 0 0 9999px #0f172a88;display:flex;flex-direction:column;align-items:center;gap:24px;animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1);position:relative;pointer-events:auto;z-index:10001;">
        <button id="closeCongrats" style="position:absolute;top:18px;right:18px;background:rgba(0,0,0,0.08);border:none;border-radius:50%;width:38px;height:38px;font-size:1.5rem;cursor:pointer;z-index:10002;display:flex;align-items:center;justify-content:center;color:#00d4ff;transition:background .2s;pointer-events:auto;">
          &times;
        </button>
        <div style="font-size:3.5rem;animation:championPulse 2s infinite alternate;">🎉🥳🎊</div>
        <h2 style="font-size:2.2rem;font-weight:900;background:linear-gradient(90deg,#06ffa5,#00d4ff,#a78bfa,#fb7185);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;">Parabéns, ${filial}!</h2>
        <div style="font-size:1.3rem;color:#06ffa5;font-weight:700;text-align:center;">Sua filial está abaixo de 30% de inadimplência!<br>Continue assim!</div>
      </div>
    </div>
    <canvas id="confettiCanvas" style="position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:10000;"></canvas>
  `;
  el.style.display = 'flex';
  el.style.pointerEvents = 'auto';
  startConfetti('confettiCanvas');
  // Força z-index e pointer-events após inserir
  setTimeout(() => {
    const modal = document.getElementById('congratsModal');
    const btn = document.getElementById('closeCongrats');
    if (modal) { modal.style.zIndex = '10001'; modal.style.pointerEvents = 'auto'; }
    if (btn) { btn.style.zIndex = '10002'; btn.style.pointerEvents = 'auto'; btn.onclick = ()=>{ el.style.display='none'; stopConfetti(); }; }
  }, 10);
}

// --- Função para alerta especial ---
function showSpecialAlert(filial, inad) {
  const el = document.getElementById('specialAlert');
  if (!el) return;
  el.innerHTML = `
    <div id="alertFlashBg" style="width:100vw;height:100vh;position:fixed;top:0;left:0;z-index:10000;"></div>
    <div style="width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;pointer-events:none;">
      <div id="alertModal" style="background:rgba(255,0,64,0.98);border-radius:32px;padding:48px 64px;box-shadow:0 8px 64px #ef444499,0 0 0 9999px #0f172a88;display:flex;flex-direction:column;align-items:center;gap:24px;animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1);border:4px solid #fff;position:relative;pointer-events:auto;z-index:10001;">
        <button id="closeAlert" style="position:absolute;top:18px;right:18px;background:rgba(0,0,0,0.08);border:none;border-radius:50%;width:38px;height:38px;font-size:1.5rem;cursor:pointer;z-index:10002;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .2s;pointer-events:auto;">
          &times;
        </button>
        <div style="font-size:3.5rem;animation:championPulse 1.2s infinite alternate;">🚨⚠️🔥</div>
        <h2 style="font-size:2.2rem;font-weight:900;color:#fff;text-shadow:0 0 24px #ef4444;">Atenção, ${filial}!</h2>
        <div style="font-size:1.3rem;color:#fff;font-weight:700;text-align:center;">Sua filial está acima de <b>30%</b> de inadimplência!<br>É hora de agir!</div>
        <div style="font-size:1.1rem;color:#fff;font-weight:600;">Inadimplência: <span style="color:#ffd700;font-size:1.3em;">${(inad*100).toFixed(1)}%</span></div>
      </div>
    </div>
  `;
  el.style.display = 'flex';
  el.style.pointerEvents = 'auto';
  // Piscar tela de vermelho
  const flash = document.getElementById('alertFlashBg');
  if (flash) {
    let flashes = 0;
    const doFlash = () => {
      flash.style.background = 'rgba(255,0,64,0.35)';
      setTimeout(()=>{
        flash.style.background = 'transparent';
        flashes++;
        if (flashes < 6) setTimeout(doFlash, 180);
      }, 120);
    };
    doFlash();
  }
  // Força z-index e pointer-events após inserir
  setTimeout(() => {
    const modal = document.getElementById('alertModal');
    const btn = document.getElementById('closeAlert');
    if (modal) { modal.style.zIndex = '10001'; modal.style.pointerEvents = 'auto'; }
    if (btn) { btn.style.zIndex = '10002'; btn.style.pointerEvents = 'auto'; btn.onclick = ()=>{ el.style.display='none'; } }
  }, 10);
}

// --- Confete animado simples ---
let confettiInterval = null;
function startConfetti(canvasId, danger) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  let confs = Array.from({length: 120},()=>({
    x: Math.random()*W, y: Math.random()*-H, r: 6+Math.random()*10, d: Math.random()*H, color: danger?
      ['#fff','#ef4444','#ffd700','#fff','#ef4444'][Math.floor(Math.random()*5)] :
      ['#06ffa5','#00d4ff','#a78bfa','#fb7185','#fff'][Math.floor(Math.random()*5)], tilt:Math.random()*10, tiltAngle:0, tiltAngleInc:Math.random()*0.07+0.05
  }));
  function draw() {
    ctx.clearRect(0,0,W,H);
    confs.forEach(c=>{
      ctx.beginPath();
      ctx.ellipse(c.x,c.y,c.r,c.r/2,Math.PI/4,0,2*Math.PI);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
    });
  }
  function update() {
    confs.forEach(c=>{
      c.y += 2 + Math.random()*2;
      c.x += Math.sin(c.d);
      c.tiltAngle += c.tiltAngleInc;
      c.x += Math.sin(c.tiltAngle)*2;
      if (c.y > H+20) { c.y = -10; c.x = Math.random()*W; }
    });
  }
  function loop() { draw(); update(); confettiInterval = requestAnimationFrame(loop); }
  loop();
  window.addEventListener('resize', resizeConfetti, {once:true});
  function resizeConfetti() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
}
function stopConfetti() { if (confettiInterval) cancelAnimationFrame(confettiInterval); confettiInterval = null; }

(function () {
  // Estado compartilhado entre as abas
  window.AppState = window.AppState || { sheetUrl: localStorage.getItem('sheetUrl') || '', uniqueMonths: [], selectedMonth: '', periodo82Text: '' };
  const App = {
    current: 'dashboard',
    el: null,
    init() {
      this.el = document.getElementById('app');
      this.bindTabs();
      this.mount('dashboard');
    },
    bindTabs() {
      const btnDash = document.getElementById('tabDashboard');
      const btnGame = document.getElementById('tabGamificacao');
      const btnAdmin = document.getElementById('tabAdmin');
      if (btnDash) btnDash.addEventListener('click', () => this.mount('dashboard'));
      if (btnGame) btnGame.addEventListener('click', () => this.mount('gamificacao'));
      if (btnAdmin) btnAdmin.addEventListener('click', () => window.location.href = '/admin.html');
    },
    setActive(tab) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'dashboard') document.getElementById('tabDashboard')?.classList.add('active');
      if (tab === 'gamificacao') document.getElementById('tabGamificacao')?.classList.add('active');
      if (tab === 'admin') document.getElementById('tabAdmin')?.classList.add('active');
    },
    mount(view) {
      if (!this.el) return;
      this.current = view;
      this.setActive(view);
      if (view === 'dashboard') {
        this.el.innerHTML = Templates.dashboard();
        Dashboard.init();
        window._specialShown = false; // Reseta flag ao sair da gamificação
      } else {
        this.el.innerHTML = Templates.gamificacao();
        Gamificacao.init();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const Templates = {
    dashboard() {
      return `
      <div id="dashboard-container">
        <div style="display:flex; justify-content: flex-end; align-items:center; gap:12px; margin: 4px 0 12px 0;">
          <input id="sheetUrlInput" type="text" placeholder="Cole o link publicado da planilha" style="padding:8px 10px; border-radius:8px; border:1px solid #e5e7eb; width:420px;" />
          <button id="saveSheetUrl" class="tab-btn" style="background:#0ea5e9;color:#fff;border:none;">Carregar</button>
        </div>
        <div class="controls">
          <div class="control-group">
            <label for="monthSelect">Mês Referência:</label>
            <select id="monthSelect"></select>
          </div>
          <div class="control-group">
            <label for="teamFilter">Equipe:</label>
            <select id="teamFilter"><option value="">Todas</option></select>
          </div>
          <div class="control-group">
            <label for="vendedorFilter">Vendedor:</label>
            <select id="vendedorFilter"><option value="">Todos</option></select>
          </div>
          <div class="control-group">
            <label for="statusFilter">Status:</label>
            <select id="statusFilter">
              <option value="">Atrasados + Cancelados</option>
              <option value="ATRASADO">Somente Atrasados</option>
              <option value="CANCELADO">Somente Cancelados</option>
            </select>
          </div>
          <button id="btnExportPdf" class="tab-btn" style="background:#64748b;color:#fff;border:none;">Imprimir / PDF</button>
          <button id="btnExportExcel" class="tab-btn" style="background:#10b981;color:#fff;border:none;">📊 Excel</button>
          <button id="btnExportPdfApi" class="tab-btn" style="background:#f59e0b;color:#fff;border:none;">📄 PDF</button>
          <button id="refreshBtn" class="tab-btn" style="background:#e9bc29;color:#000;border:none;">Atualizar Dados</button>
        </div>
        <div style="margin-bottom:12px; font-size:1.05rem; color:#e2e8f0;">
          <b>Período 8-2:</b> <span id="periodo82"></span>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="metric-value" id="currentInadimplencia">-</div>
            <div class="metric-label">Inadimplência Atual</div>
            <div class="metric-trend slide-container" id="inadimplenciaTrend">
              <div class="slide-content active" id="slideContent1">Meta: <span id="metaDisplay">25%</span> | Status: <span id="metaStatus">-</span></div>
              <div class="slide-content" id="slideContent2">Diferença: <span id="metaDiferenca">-</span></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-chart-trend-up"></i></div>
            <div class="metric-value" id="projecaoInadimplencia">-</div>
            <div class="metric-label">Projeção Próximo Período</div>
            <div class="metric-trend" id="projecaoTrend"></div>
          </div>
          <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
            <div class="metric-value" id="volumeVendas">-</div>
            <div class="metric-label">Volume de Vendas</div>
            <div class="metric-trend" id="vendasTrend"></div>
          </div>
          <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-shield-alt"></i></div>
            <div class="metric-value" id="riscoPotencial">-</div>
            <div class="metric-label">Risco Potencial</div>
            <div class="metric-trend" id="riscoTrend">Estável</div>
          </div>
        </div>

        <div class="evolution-section" style="margin:20px 0;">
          <div style="background:var(--glass-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px;padding:28px;border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#06ffa5,#00d4ff,#7c3aed,#fb7185);animation:neonPulse 3s ease-in-out infinite;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
              <div>
                <h3 style="margin:0;font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#00d4ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:center;gap:8px;">
                  <i class="fas fa-chart-area" style="-webkit-text-fill-color:#00d4ff;font-size:1.1rem;"></i> Evolução da Inadimplência
                </h3>
                <p style="margin:4px 0 0 0;color:#94a3b8;font-size:0.85rem;">Histórico mensal · <span id="metaLabel">Meta 25%</span></p>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button id="toggle6Months" class="evo-toggle active" style="padding:6px 14px;border-radius:20px;border:1px solid rgba(0,212,255,.3);background:rgba(0,212,255,.15);color:#00d4ff;font-weight:600;font-size:0.8rem;cursor:pointer;transition:all .3s;">6M</button>
                <button id="toggle12Months" class="evo-toggle" style="padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#94a3b8;font-weight:600;font-size:0.8rem;cursor:pointer;transition:all .3s;">12M</button>
                <button id="toggleProduction" class="evo-toggle" style="padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#94a3b8;font-weight:600;font-size:0.8rem;cursor:pointer;transition:all .3s;">Produção</button>
              </div>
            </div>
            <div style="position:relative;height:340px;margin-bottom:20px;">
              <canvas id="evolutionChart"></canvas>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
              <div id="insightBest" style="background:linear-gradient(135deg,rgba(6,255,165,.08),rgba(6,255,165,.02));border:1px solid rgba(6,255,165,.25);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all .3s;cursor:default;">
                <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#06ffa5,#10b981);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;box-shadow:0 0 15px rgba(6,255,165,.3);">🏆</div>
                <div>
                  <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#06ffa5;font-weight:700;margin-bottom:2px;">Mês Campeão</div>
                  <div id="bestMonth" style="color:#e2e8f0;font-weight:600;font-size:0.9rem;line-height:1.3;">-</div>
                </div>
              </div>
              <div id="insightWorst" style="background:linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.02));border:1px solid rgba(239,68,68,.25);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all .3s;cursor:default;">
                <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;box-shadow:0 0 15px rgba(239,68,68,.3);">🔻</div>
                <div>
                  <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#ef4444;font-weight:700;margin-bottom:2px;">Pior Mês</div>
                  <div id="worstMonth" style="color:#e2e8f0;font-weight:600;font-size:0.9rem;line-height:1.3;">-</div>
                </div>
              </div>
              <div id="insightTrend" style="background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(0,212,255,.02));border:1px solid rgba(0,212,255,.25);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all .3s;cursor:default;">
                <div id="trendIcon" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#00d4ff,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;box-shadow:0 0 15px rgba(0,212,255,.3);">📈</div>
                <div>
                  <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#00d4ff;font-weight:700;margin-bottom:2px;">Tendência</div>
                  <div id="trendAnalysis" style="color:#e2e8f0;font-weight:600;font-size:0.9rem;line-height:1.3;">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="team-ranking-section" style="margin:20px 0;">
          <div style="background:var(--glass-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px;padding:28px;border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#fbbf24,#f59e0b,#d97706);animation:neonPulse 3s ease-in-out infinite;"></div>
            <div style="margin-bottom:20px;">
              <h3 style="margin:0;font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.3rem;">🏆</span> Ranking de Equipes — Inadimplência
              </h3>
              <p style="margin:4px 0 0 0;color:#94a3b8;font-size:0.85rem;">Menor inadimplência = melhor posição</p>
            </div>
            <div id="teamRankingPodium" style="display:flex;justify-content:center;align-items:flex-end;gap:16px;margin-bottom:24px;flex-wrap:wrap;"></div>
            <div id="teamRankingList"></div>
          </div>
        </div>

        <div class="vendor-ranking-section" style="margin:20px 0;">
          <div style="background:var(--glass-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px;padding:28px;border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#06ffa5,#00d4ff,#a855f7);animation:neonPulse 3s ease-in-out infinite;"></div>
            <div style="margin-bottom:20px;">
              <h3 style="margin:0;font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#06ffa5,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.3rem;">🏅</span> Ranking de Vendedores — Inadimplência
              </h3>
              <p style="margin:4px 0 0 0;color:#94a3b8;font-size:0.85rem;">Menor inadimplência = melhor posição · Vendedores sem vendas ficam no final</p>
            </div>
            <div id="vendorRankingPodium" style="display:flex;justify-content:center;align-items:flex-end;gap:16px;margin-bottom:24px;flex-wrap:wrap;"></div>
            <div id="vendorRankingList"></div>
          </div>
        </div>

        <div class="loading" id="loadingMsg">Carregando dados da planilha Google...</div>
      </div>`;
    },
    gamificacao() {
      return `
      <div id="gamificacao-container">
        <div class="controls">
          <div class="control-group">
            <label for="monthSelect">Mês Referência:</label>
            <select id="monthSelect"></select>
          </div>
          <div class="control-group">
            <label for="teamFilter">Regional:</label>
            <select id="teamFilter"><option value="">Todos</option></select>
          </div>
          <button id="refreshRankingBtn" class="tab-btn" style="background:#22c55e;color:#fff;border:none;">Atualizar</button>
        </div>
        <div style="margin-bottom:12px; font-size:1.05rem; color:#e2e8f0;">
          <b>Período 8-2:</b> <span id="periodo82"></span>
        </div>
        <div class="regional-highlight-section" style="margin-bottom: 12px; text-align:center;">
          <h2 style="font-size:1.6rem;font-weight:800;color:#FFD700;">Regional: <span id="regionalNameHighlight">-</span></h2>
        </div>

        <div class="filiais-podium-container" id="filiaisPodiumContainer" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
          <div class="filiais-podium-place first" id="filiaisFirstPlace">
            <div class="filiais-podium-info">
              <h3 class="filiais-podium-name">-</h3>
              <div class="filiais-podium-city">-</div>
              <div class="filiais-podium-score">-</div>
            </div>
          </div>
          <div class="filiais-podium-place second" id="filiaisSecondPlace">
            <div class="filiais-podium-info">
              <h3 class="filiais-podium-name">-</h3>
              <div class="filiais-podium-city">-</div>
              <div class="filiais-podium-score">-</div>
            </div>
          </div>
          <div class="filiais-podium-place third" id="filiaisThirdPlace">
            <div class="filiais-podium-info">
              <h3 class="filiais-podium-name">-</h3>
              <div class="filiais-podium-city">-</div>
              <div class="filiais-podium-score">-</div>
            </div>
          </div>
        </div>

        <div class="top10-ranking" style="margin-top:16px;">
          <div class="ranking-header"><h3>Ranking de Filiais</h3></div>
          <div class="ranking-container" id="rankingContainer"></div>
        </div>

        <div class="achievements-section"><div class="achievements-container" id="achievementsContainer"></div></div>
        <div class="alerts-section"><div class="alerts-container" id="alertsContainer"></div></div>
        <div class="statistics-section"><div class="statistics-container" id="statisticsContainer"></div></div>
        <div class="motivation-section"><div id="motivationText">Carregando mensagem motivacional...</div></div>
        <div class="loading" id="loadingMsg">Carregando dados regionais consolidados...</div>
        
        <!-- Gamificação do Usuário -->
        <div id="gamificationContainer" style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #e5e7eb;"></div>
      </div>`;
    }
  };

  // ===== Módulo Dashboard (extraído e reduzido a partir do script original) =====
  const Dashboard = (() => {
    let sheetUrl = localStorage.getItem('sheetUrl');
    let SHEET_CSV_URL = '';
    if (sheetUrl && sheetUrl.includes('/pubhtml')) SHEET_CSV_URL = sheetUrl.replace('/pubhtml', '/pub') + '&output=csv';
    else if (sheetUrl && sheetUrl.includes('output=csv')) SHEET_CSV_URL = sheetUrl;
  // atualizar estado compartilhado
  window.AppState.sheetUrl = sheetUrl || '';

    function csvToArray(str, delimiter = ',') { return str.trim().split('\n').map(r => r.split(delimiter)); }
    function detectDelimiter(csv) {
      const first = (csv.split('\n')[0]||'');
      const cComma = (first.match(/,/g)||[]).length; const cSemi = (first.match(/;/g)||[]).length; return cSemi>cComma ? ';' : ',';
    }
    function formatCurrency(val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
    function formatCurrencyMillion(val) { return `R$ ${val.toFixed(2)}M`; }
    function formatPercent(val) { return (val * 100).toFixed(1) + '%'; }
    function getMonthName(num) { const meses = ['', 'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; return meses[num]; }
    function parseDateFromAta(ata, ano) {
      const meses = { 'jan': '01','fev': '02','mar': '03','abr': '04','mai': '05','jun': '06','jul': '07','ago': '08','set': '09','out': '10','nov': '11','dez': '12' };
      const m = (ata||'').slice(0,3).toLowerCase(); const mes = meses[m] || '01';
      let y = Number(ano);
      if (!isFinite(y) || !y) y = new Date().getFullYear();
      if (y < 100) y = 2000 + y; // trata '25' -> 2025
      return new Date(y, Number(mes)-1, 1);
    }

  let rawData = [], uniqueMonths = [], uniqueTeams = [], uniqueVendedores = [], uniqueSupervisores = [], inadEvolData = [], evolutionData = [];
    let charts = {}, evolutionChart = null, showingMonths = 6, showingProduction = false;
    let showingVencimentoPercentage = true, vencimentoData = [];

    function getPeriodo82(dataRef) {
      let fim = new Date(dataRef.getFullYear(), dataRef.getMonth(), 0);
      let iniMes = fim.getMonth() - 5; let iniAno = fim.getFullYear();
      while (iniMes < 0) { iniMes += 12; iniAno -= 1; }
      let ini = new Date(iniAno, iniMes, 1); return { ini, fim };
    }

    function renderChart(id, config) {
      const canvasElement = document.getElementById(id); if (!canvasElement) return;
      if (charts[id]) { charts[id].destroy(); delete charts[id]; }
      const ctx = canvasElement.getContext('2d');
      charts[id] = new Chart(ctx, config);
    }

    function formatDate(d) {
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }

    async function loadAuxSheet() {
      if (!SHEET_CSV_URL) { // fallback
        inadEvolData = [
          { ata: 'nov./24', inad: 0.3915, producao: 16.13 },
          { ata: 'dez./24', inad: 0.3722, producao: 19.34 },
          { ata: 'jan./25', inad: 0.3483, producao: 6.34 },
          { ata: 'fev./25', inad: 0.3767, producao: 13.76 },
          { ata: 'mar./25', inad: 0.3320, producao: 8.15 },
          { ata: 'abr./25', inad: 0.2457, producao: 14.18 },
          { ata: 'mai./25', inad: 0.2419, producao: 12.16 },
          { ata: 'jun./25', inad: 0.2219, producao: 15.555 }
        ];
        evolutionData = inadEvolData; window.inadEvolData = inadEvolData; createEvolutionChart(); updateEvolutionInsights(); return;
      }
      const GID_AUX = '2018703213';
      let url = SHEET_CSV_URL.replace(/gid=\d+/, 'gid='+GID_AUX); if (!/gid=\d+/.test(url)) url += (url.includes('?')?'&':'?') + 'gid='+GID_AUX;
      try {
        // Usar proxy do backend para evitar CORS na Vercel
        const baseUrl = window.location.origin;
        const proxyUrl = `${baseUrl}/api/sheet?url=` + encodeURIComponent(url);
        console.log('📊 Carregando aba auxiliar via proxy:', proxyUrl);
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error('Erro ao buscar aba Dados_Auxiliares');
        console.log('✅ Aba auxiliar carregada com sucesso');
        const csv = await resp.text();
        let arr = csvToArray(csv, ';');
        if (arr[0].length <= 1) arr = csvToArray(csv, ',');
        inadEvolData = arr.slice(1).map(row => {
          const mes = row[0]?.trim(); if (!mes || mes==='Mês') return null;
          const inadStr = (row[1]||'').toString().replace('%','').replace(',','.');
          const prodStr = (row[2]||'').toString().replace(/[^\d,]/g,'').replace(',','.');
          return { ata: mes, inad: parseFloat(inadStr)/100||0, producao: parseFloat(prodStr)/1000000||0 };
        }).filter(Boolean);
        evolutionData = inadEvolData; window.inadEvolData = inadEvolData; createEvolutionChart(); updateEvolutionInsights();
      } catch(e) {
        console.error(e); // fallback
        inadEvolData = [
          { ata: 'nov./24', inad: 0.3915, producao: 16.13 },
          { ata: 'dez./24', inad: 0.3722, producao: 19.34 },
          { ata: 'jan./25', inad: 0.3483, producao: 6.34 },
          { ata: 'fev./25', inad: 0.3767, producao: 13.76 },
          { ata: 'mar./25', inad: 0.3320, producao: 8.15 },
          { ata: 'abr./25', inad: 0.2457, producao: 14.18 },
          { ata: 'mai./25', inad: 0.2419, producao: 12.16 },
          { ata: 'jun./25', inad: 0.2219, producao: 15.555 }
        ];
        evolutionData = inadEvolData; window.inadEvolData = inadEvolData; createEvolutionChart(); updateEvolutionInsights();
      }
    }

    function createEvolutionChart() {
      const canvas = document.getElementById('evolutionChart'); if (!canvas) return;
      const dataToShow = evolutionData.slice(-showingMonths);
      const labels = dataToShow.map(d => d.ata);
      const inadData = dataToShow.map(d => d.inad * 100);
      const prodData = dataToShow.map(d => d.producao);
      const chartData = showingProduction ? prodData : inadData;
      const yAxisLabel = showingProduction ? 'Produção (R$ Milhões)' : 'Inadimplência (%)';

      // Identificar melhor e pior mês para destacar pontos
      const minVal = Math.min(...chartData);
      const maxVal = Math.max(...chartData);
      const bestIdx = chartData.indexOf(showingProduction ? maxVal : minVal);
      const worstIdx = chartData.indexOf(showingProduction ? minVal : maxVal);

      // Cores dos pontos: verde para melhor, vermelho para pior, azul para demais
      const pointColors = chartData.map((_, i) => {
        if (i === bestIdx) return '#06ffa5';
        if (i === worstIdx) return '#ef4444';
        return '#00d4ff';
      });
      const pointRadius = chartData.map((_, i) => (i === bestIdx || i === worstIdx) ? 8 : 4);
      const pointBorderWidth = chartData.map((_, i) => (i === bestIdx || i === worstIdx) ? 3 : 2);

      const datasets = [{
        label: showingProduction ? 'Produção (R$ Mi)' : 'Inadimplência (%)',
        data: chartData,
        borderColor: showingProduction ? '#10b981' : '#00d4ff',
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (showingProduction) {
            gradient.addColorStop(0, 'rgba(16,185,129,0.35)');
            gradient.addColorStop(0.5, 'rgba(16,185,129,0.1)');
            gradient.addColorStop(1, 'rgba(16,185,129,0)');
          } else {
            gradient.addColorStop(0, 'rgba(0,212,255,0.35)');
            gradient.addColorStop(0.5, 'rgba(124,58,237,0.1)');
            gradient.addColorStop(1, 'rgba(124,58,237,0)');
          }
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors.map(c => c === '#06ffa5' ? '#065f46' : c === '#ef4444' ? '#7f1d1d' : '#0e7490'),
        pointRadius: pointRadius,
        pointBorderWidth: pointBorderWidth,
        pointHoverRadius: 10,
        pointHoverBorderWidth: 3
      }];

      // Linha de meta apenas para inadimplência
      if (!showingProduction) {
        // Buscar meta atual do localStorage
        const currentMetaPercent = window.currentMetaPercent !== undefined ? window.currentMetaPercent : 25;
        datasets.push({
          label: `Meta ${currentMetaPercent.toFixed(1)}%`,
          data: chartData.map(() => currentMetaPercent),
          borderColor: '#fbbf24',
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0
        });
      }

      renderChart('evolutionChart', {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200, easing: 'easeOutQuart' },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: !showingProduction,
              position: 'top',
              align: 'end',
              labels: { color: '#94a3b8', font: { size: 11, weight: '600' }, usePointStyle: true, pointStyle: 'circle', padding: 16 }
            },
            tooltip: {
              backgroundColor: 'rgba(15,23,42,0.95)',
              titleColor: '#e2e8f0',
              bodyColor: '#cbd5e1',
              borderColor: 'rgba(0,212,255,0.3)',
              borderWidth: 1,
              cornerRadius: 10,
              padding: 12,
              titleFont: { weight: '700', size: 13 },
              bodyFont: { size: 12 },
              displayColors: true,
              callbacks: {
                label: (ctx) => {
                  const currentMetaPercent = window.currentMetaPercent !== undefined ? window.currentMetaPercent : 25;
                  if (ctx.dataset.label.includes('Meta')) return `Meta: ${currentMetaPercent.toFixed(1)}%`;
                  const val = ctx.parsed.y;
                  let suffix = showingProduction ? ` R$ ${val.toFixed(2)}M` : ` ${val.toFixed(2)}%`;
                  const i = ctx.dataIndex;
                  if (!showingProduction) {
                    if (i === bestIdx) suffix += ' 🏆 Campeão';
                    if (i === worstIdx) suffix += ' 🔻 Pior';
                  }
                  return ctx.dataset.label + ':' + suffix;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, color: '#94a3b8', font: { size: 11, weight: '600' } },
              grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: yAxisLabel, color: '#94a3b8', font: { size: 11, weight: '600' } },
              ticks: {
                color: '#94a3b8',
                font: { size: 11 },
                callback: v => showingProduction ? `R$${v}M` : `${v}%`
              },
              grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false }
            }
          }
        }
      });

      // Atualizar visual dos botões toggle
      document.querySelectorAll('.evo-toggle').forEach(btn => {
        btn.style.border = '1px solid rgba(255,255,255,.1)';
        btn.style.background = 'rgba(255,255,255,.05)';
        btn.style.color = '#94a3b8';
      });
      const activeId = showingProduction ? 'toggleProduction' : (showingMonths === 12 ? 'toggle12Months' : 'toggle6Months');
      const activeBtn = document.getElementById(activeId);
      if (activeBtn) {
        activeBtn.style.border = '1px solid rgba(0,212,255,.3)';
        activeBtn.style.background = 'rgba(0,212,255,.15)';
        activeBtn.style.color = '#00d4ff';
      }
    }

    function updateEvolutionInsights() {
      if (evolutionData.length < 2) return;
      const sortedByInad = [...evolutionData].sort((a,b)=>a.inad-b.inad);
      const bestMonth = sortedByInad[0]; const worstMonth = sortedByInad[sortedByInad.length-1];
      const last3 = evolutionData.slice(-3); const trendDiff = ((last3[last3.length-1].inad - last3[0].inad)*100);
      const improving = trendDiff < 0;
      const trendText = improving ? `Melhora de ${Math.abs(trendDiff).toFixed(1)}pp nos últimos 3 meses` : `Piora de ${trendDiff.toFixed(1)}pp nos últimos 3 meses`;

      const bestEl = document.getElementById('bestMonth');
      if (bestEl) bestEl.innerHTML = `<strong>${bestMonth.ata}</strong> — ${(bestMonth.inad*100).toFixed(2)}%<br><span style="font-size:0.75rem;color:#94a3b8;">Prod: ${formatCurrencyMillion(bestMonth.producao)}</span>`;

      const worstEl = document.getElementById('worstMonth');
      if (worstEl) worstEl.innerHTML = `<strong>${worstMonth.ata}</strong> — ${(worstMonth.inad*100).toFixed(2)}%<br><span style="font-size:0.75rem;color:#94a3b8;">Prod: ${formatCurrencyMillion(worstMonth.producao)}</span>`;

      const trendEl = document.getElementById('trendAnalysis');
      if (trendEl) trendEl.innerHTML = trendText;

      // Atualizar ícone e cor da tendência
      const trendIcon = document.getElementById('trendIcon');
      const insightTrend = document.getElementById('insightTrend');
      if (trendIcon) {
        trendIcon.textContent = improving ? '📉' : '📈';
        trendIcon.style.background = improving ? 'linear-gradient(135deg,#06ffa5,#10b981)' : 'linear-gradient(135deg,#ef4444,#dc2626)';
      }
      if (insightTrend) {
        insightTrend.style.background = improving ? 'linear-gradient(135deg,rgba(6,255,165,.08),rgba(6,255,165,.02))' : 'linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.02))';
        insightTrend.style.borderColor = improving ? 'rgba(6,255,165,.25)' : 'rgba(239,68,68,.25)';
        const label = insightTrend.querySelector('div > div:first-child');
        if (label) label.style.color = improving ? '#06ffa5' : '#ef4444';
      }
    }

    function fillFilters() {
      const monthSel = document.getElementById('monthSelect'); if (!monthSel) return;
      monthSel.innerHTML=''; uniqueMonths.forEach(m=>{ const [ano,mes]=m.split('-'); const opt=document.createElement('option'); opt.value=m; opt.textContent=`${getMonthName(Number(mes))} ${ano}`; monthSel.appendChild(opt); });
  if (uniqueMonths.length>1) monthSel.value = uniqueMonths[1]; else if (uniqueMonths.length>0) monthSel.value = uniqueMonths[0];
      // sincronizar estado e notificar
      window.AppState.uniqueMonths = uniqueMonths;
      window.AppState.selectedMonth = monthSel.value || '';
      const teamSel = document.getElementById('teamFilter');
      if (teamSel) {
        const prevTeam = teamSel.value || '';
        teamSel.innerHTML='<option value="">Todas</option>';
        uniqueTeams.forEach(t=>{ const opt=document.createElement('option'); opt.value=t; opt.textContent=t; teamSel.appendChild(opt); });
        // restaurar equipe previamente selecionada
        if (prevTeam && uniqueTeams.some(t => t.toLowerCase() === prevTeam.toLowerCase())) {
          teamSel.value = uniqueTeams.find(t => t.toLowerCase() === prevTeam.toLowerCase());
        }
      }
      const btnPdf = document.getElementById('btnExportPdf');
      if (btnPdf && teamSel) btnPdf.disabled = false;
      document.dispatchEvent(new CustomEvent('app:monthsUpdated', { detail: { uniqueMonths, selectedMonth: window.AppState.selectedMonth, periodo82Text: window.AppState.periodo82Text, sheetUrl: window.AppState.sheetUrl } }));
      populateVendedores();
    }

    function populateVendedores() {
      const vendSel = document.getElementById('vendedorFilter'); if (!vendSel) return;
      const prevVend = vendSel.value || '';
      const team = document.getElementById('teamFilter')?.value || '';
      let vendedores;
      if (team) {
        vendedores = [...new Set(rawData.filter(r => r.equipe && r.equipe.toLowerCase() === team.toLowerCase()).map(r => r.vendedor))].filter(Boolean).sort((a,b)=>a.localeCompare(b));
      } else {
        vendedores = uniqueVendedores;
      }
      vendSel.innerHTML = '<option value="">Todos</option>';
      vendedores.forEach(v => { const opt = document.createElement('option'); opt.value = v; opt.textContent = v; vendSel.appendChild(opt); });
      if (prevVend && vendedores.some(v => v.toLowerCase() === prevVend.toLowerCase())) {
        vendSel.value = vendedores.find(v => v.toLowerCase() === prevVend.toLowerCase());
      }
    }

  function processVencimentoData() {
      const selectedMonth = document.getElementById('monthSelect')?.value; const selectedTeam = document.getElementById('teamFilter')?.value; const selectedVendedor = document.getElementById('vendedorFilter')?.value;
      let filteredData = rawData;
      if (selectedMonth) { const [anoRef, mesRef] = selectedMonth.split('-').map(Number); const dataRef = new Date(anoRef, mesRef - 1, 1); const {ini: dataIni, fim: dataFim} = getPeriodo82(dataRef); filteredData = filteredData.filter(item => item.dataVenda >= dataIni && item.dataVenda <= dataFim); }
      if (selectedTeam) filteredData = filteredData.filter(item => item.equipe && item.equipe.toLowerCase() === selectedTeam.toLowerCase());
      if (selectedVendedor) filteredData = filteredData.filter(item => item.vendedor && item.vendedor.toLowerCase() === selectedVendedor.toLowerCase());
      const grupos = { '10': { total:0, inadimplente:0, contratos:0 }, '15': { total:0, inadimplente:0, contratos:0 }, '20': { total:0, inadimplente:0, contratos:0 }, '25': { total:0, inadimplente:0, contratos:0 } };
      filteredData.forEach(registro => {
        let venc = String(registro.vencimento||'').trim(); if (venc && !isNaN(venc)) venc = String(parseInt(venc)).padStart(2,'0');
        if (!['10','15','20','25'].includes(venc)) return; const valor = Number(registro.valor)||0; if (valor<=0) return;
  const status = String(registro.status||'').toUpperCase().trim();
  const inadSet = new Set(['ATRASADO','EM ATRASO','CANCELADO','INADIMPLENTE','VENCIDO']);
  grupos[venc].total += valor; grupos[venc].contratos++; if (inadSet.has(status)) grupos[venc].inadimplente += valor;
      });
      const totalGeralProduzido = Object.values(grupos).reduce((s,g)=>s+g.total,0);
      const totalGeralInadimplente = Object.values(grupos).reduce((s,g)=>s+g.inadimplente,0);
      vencimentoData = ['10','15','20','25'].map(d => ({
        dia: Number(d), label: d,
        percentual: totalGeralProduzido>0 ? (grupos[d].inadimplente/totalGeralProduzido)*100 : 0,
        valorTotal: grupos[d].total,
        valorInadimplente: grupos[d].inadimplente,
        count: grupos[d].contratos,
        proporcaoInadimplencia: totalGeralInadimplente>0 ? (grupos[d].inadimplente/totalGeralInadimplente)*100 : 0
      }));
      createRadialCharts(); createVencimentoComparisonChart(); updateVencimentoInsights();
    }

    function getOverdueSet() {
      // Somente em atraso e não canceladas
      return new Set(['ATRASADO','EM ATRASO','INADIMPLENTE','VENCIDO']);
    }

  function collectInadDataForExport() {
      const monthRef = document.getElementById('monthSelect')?.value || uniqueMonths[uniqueMonths.length - 1];
      const team = document.getElementById('teamFilter')?.value || '';
      const vendedor = document.getElementById('vendedorFilter')?.value || '';
      const statusFiltro = document.getElementById('statusFilter')?.value || '';
      if (!monthRef) return { rows: [], totalVendas: 0 };
      const [anoRef, mesRef] = monthRef.split('-').map(Number); const dataRef = new Date(anoRef, mesRef - 1, 1); const {ini:dataIni, fim:dataFim} = getPeriodo82(dataRef);
      const inadSet = new Set(['ATRASADO','EM ATRASO','CANCELADO','INADIMPLENTE','VENCIDO']);
      const periodData = rawData.filter(r => r.dataVenda >= dataIni && r.dataVenda <= dataFim && (!team || (r.equipe && r.equipe.toLowerCase()===team.toLowerCase())) && (!vendedor || (r.vendedor && r.vendedor.toLowerCase()===vendedor.toLowerCase())));
      const totalVendas = periodData.reduce((s,r) => s + (Number(r.valor)||0), 0);
      const rows = periodData.filter(r => {
        const st = String(r.status||'').toUpperCase();
        if (statusFiltro) return st === statusFiltro;
        return inadSet.has(st);
      });
      return { rows, totalVendas };
    }

    function exportInadReportPdf() {
  const { rows, totalVendas } = collectInadDataForExport();
      if (!rows.length) { alert('Nenhuma cota inadimplente encontrada para os filtros selecionados.'); return; }
      const periodo = document.getElementById('periodo82')?.textContent || '';
      const team = document.getElementById('teamFilter')?.value || 'Todas';
      const vendedor = document.getElementById('vendedorFilter')?.value || 'Todos';
      const statusFiltro = document.getElementById('statusFilter')?.value || 'Atrasados + Cancelados';
      const totalInad = rows.reduce((s,r)=> s + (Number(r.valor)||0), 0);
      const percInad = totalVendas > 0 ? ((totalInad / totalVendas) * 100).toFixed(2) : '0.00';
      const win = window.open('', '_blank');
      if (!win) { alert('Bloqueio de pop-up. Habilite pop-ups para imprimir/baixar.'); return; }
      const style = `
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; color: #111; font-size: 11px; }
          h1 { font-size: 16px; margin: 0 0 8px 0; }
          .meta { font-size: 11px; color: #333; margin-bottom: 10px; }
          .meta div { margin-bottom: 2px; }
          .summary { margin: 12px 0; padding: 10px 14px; background: #f0f4f8; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .summary span { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ccc; padding: 5px 6px; }
          th { background: #e2e8f0; text-align: left; font-weight: 700; }
          tfoot td { font-weight: bold; background: #f8fafc; }
          .right { text-align: right; }
          @media print { .summary { background: #f0f4f8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>`;
      const header = `
        <h1>Relat\u00f3rio de Inadimpl\u00eancia</h1>
        <div class="meta">
          <div><b>Per\u00edodo 8-2:</b> ${periodo}</div>
          <div><b>Equipe:</b> ${team}</div>
          <div><b>Vendedor:</b> ${vendedor}</div>
          <div><b>Status:</b> ${statusFiltro}</div>
          <div><b>Gerado em:</b> ${formatDate(new Date())}</div>
        </div>
        <div class="summary">
          <span>Total Inadimpl\u00eancia: ${totalInad.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span> &nbsp;|&nbsp;
          <span>Volume de Vendas: ${totalVendas.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span> &nbsp;|&nbsp;
          <span>% Inadimpl\u00eancia: ${percInad}%</span> &nbsp;|&nbsp;
          <span>Qtd. Contratos: ${rows.length}</span>
        </div>`;
      const rowsHtml = rows.map(r => `
        <tr>
          <td>${(r.ata||'')}</td>
          <td>${(r.ano||'')}</td>
          <td>${(r.status||'')}</td>
          <td>${(r.equipe||'')}</td>
          <td>${(r.vendedor||'')}</td>
          <td>${(r.cliente||'')}</td>
          <td>${(r.contrato||'')}</td>
          <td>${(r.telefone||'')}</td>
          <td class="right">${(Number(r.valor)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
        </tr>`).join('');
      const html = `
        <!DOCTYPE html><html><head><meta charset="utf-8"><title>Relat\u00f3rio Inadimpl\u00eancia</title>${style}</head>
        <body>
          ${header}
          <table>
            <thead><tr>
              <th>Ata</th><th>Ano</th><th>Status</th><th>Equipe</th><th>Vendedor</th><th>Cliente</th><th>Contrato</th><th>Telefone</th><th class="right">Valor</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot><tr><td colspan="8">Total (${rows.length} contratos)</td><td class="right">${totalInad.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td></tr></tfoot>
          </table>
          <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); window.close(); }, 300); });<\/script>
        </body></html>`;
      win.document.open();
      win.document.write(html);
      win.document.close();
      try { win.focus(); } catch(_) {}
    }

    // ===== EXPORTAÇÃO VIA API =====

    async function exportToExcel() {
      try {
        const periodo = document.getElementById('monthSelect')?.value || '';
        const equipe = document.getElementById('teamFilter')?.value || '';
        const vendedor = document.getElementById('vendedorFilter')?.value || '';
        const statusValue = document.getElementById('statusFilter')?.value || '';
        
        // Mapear valores de status
        let status = 'Atrasados + Cancelados';
        if (statusValue === 'ATRASADO') status = 'Somente Atrasados';
        if (statusValue === 'CANCELADO') status = 'Somente Cancelados';

        const btnExcel = document.getElementById('btnExportExcel');
        btnExcel.disabled = true;
        btnExcel.textContent = '⏳ Gerando...';

        // Usar fetch direto com header de autorização
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token não encontrado. Faça login novamente.');
        }

        const response = await fetch('/api/export/excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            periodo: periodo || undefined,
            equipe: equipe || undefined,
            vendedor: vendedor || undefined,
            status
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Erro HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inadimplencia_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert('✅ Excel exportado com sucesso!');
      } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        alert(`❌ Erro ao exportar Excel: ${error.message}`);
      } finally {
        const btnExcel = document.getElementById('btnExportExcel');
        btnExcel.disabled = false;
        btnExcel.textContent = '📊 Excel';
      }
    }

    async function exportToPdfApi() {
      try {
        const periodo = document.getElementById('monthSelect')?.value || '';
        const equipe = document.getElementById('teamFilter')?.value || '';
        const vendedor = document.getElementById('vendedorFilter')?.value || '';
        const statusValue = document.getElementById('statusFilter')?.value || '';
        
        // Mapear valores de status
        let status = 'Atrasados + Cancelados';
        if (statusValue === 'ATRASADO') status = 'Somente Atrasados';
        if (statusValue === 'CANCELADO') status = 'Somente Cancelados';

        const btnPdfApi = document.getElementById('btnExportPdfApi');
        btnPdfApi.disabled = true;
        btnPdfApi.textContent = '⏳ Gerando...';

        // Usar fetch direto com header de autorização
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token não encontrado. Faça login novamente.');
        }

        const response = await fetch('/api/export/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            periodo: periodo || undefined,
            equipe: equipe || undefined,
            vendedor: vendedor || undefined,
            status
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Erro HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inadimplencia_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert('✅ PDF exportado com sucesso!');
      } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert(`❌ Erro ao exportar PDF: ${error.message}`);
      } finally {
        const btnPdfApi = document.getElementById('btnExportPdfApi');
        btnPdfApi.disabled = false;
        btnPdfApi.textContent = '📄 PDF';
      }
    }

    function createRadialCharts() {
      if (!vencimentoData || vencimentoData.length===0) return;
      const maxPercentualItem = vencimentoData.reduce((max, item)=> item.percentual>max.percentual?item:max, vencimentoData[0]);
      vencimentoData.forEach(item => {
        const radialElement = document.getElementById(`radial${item.dia}`); if (!radialElement) return;
        const canvas = radialElement.querySelector('canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); const centerX=60, centerY=60, radius=45; ctx.clearRect(0,0,120,120);
        const value = showingVencimentoPercentage ? item.percentual : item.valorInadimplente/1000000; const maxValue = showingVencimentoPercentage ? 50 : 5; const percentage = Math.min(value/maxValue,1);
        const color = (item.dia===maxPercentualItem.dia) ? '#EF4444' : '#6B7280';
        ctx.beginPath(); ctx.arc(centerX,centerY,radius,0,2*Math.PI); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=8; ctx.stroke();
        ctx.beginPath(); ctx.arc(centerX,centerY,radius,-Math.PI/2, (-Math.PI/2) + (percentage*2*Math.PI)); ctx.strokeStyle=color; ctx.lineWidth=8; ctx.lineCap='round'; ctx.stroke();
        const valueEl = document.querySelector(`#radial${item.dia} .radial-value`); const statusEl = document.getElementById(`status${item.dia}`);
        if (valueEl) valueEl.textContent = showingVencimentoPercentage ? `${value.toFixed(2)}%` : `R$ ${value.toLocaleString('pt-BR')}`;
        if (statusEl) statusEl.textContent = (item.dia===maxPercentualItem.dia) ? 'Maior Inadimplência' : '';
      });
    }

    function createVencimentoComparisonChart() {
      const canvas = document.getElementById('vencimentoChart'); if (!canvas) return;
      const labels = vencimentoData.map(d => `Dia ${d.label}`);
      const data = showingVencimentoPercentage ? vencimentoData.map(d => d.percentual) : vencimentoData.map(d => d.valorInadimplente);
      const backgroundColors = data.map((value, index) => { const p = vencimentoData[index].percentual; if (p>30) return 'rgba(239,68,68,0.8)'; if (p>20) return 'rgba(245,158,11,0.8)'; return 'rgba(16,185,129,0.8)'; });
      renderChart('vencimentoChart', {
        type:'bar',
        data:{
          labels,
          datasets:[{
            label: showingVencimentoPercentage?'Inadimplência (%)':'Valor Inadimplente (R$)',
            data,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(c=>c.replace('0.8','1')),
            borderWidth:2,
            borderRadius:8,
            borderSkipped:false
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          plugins:{ legend:{display:false} },
          scales:{
            x:{
              ticks:{ autoSkip:false, maxRotation:0, minRotation:0, color:'#e2e8f0' },
              grid:{ color:'rgba(255,255,255,0.08)' }
            },
            y:{
              beginAtZero:true,
              ticks:{
                color:'#e2e8f0',
                callback: v => showingVencimentoPercentage? `${v}%` : `R$ ${(v/1000000).toFixed(1)}M`
              },
              grid:{ color:'rgba(255,255,255,0.08)' }
            }
          }
        }
      });
    }

    function updateVencimentoInsights() {
      if (!vencimentoData || vencimentoData.length===0) return;
      const sorted = [...vencimentoData].sort((a,b)=>a.percentual-b.percentual); const champion = sorted[0]; const critical = sorted[sorted.length-1];
      const championEl = document.getElementById('championVencimento'); const criticalEl = document.getElementById('criticalVencimento'); const challengeEl = document.getElementById('challengeText');
      if (championEl) championEl.textContent = `Dia ${champion.label} apresenta o melhor desempenho: ${champion.percentual.toFixed(2)}% de inadimplência. Produção: R$ ${champion.valorTotal.toLocaleString('pt-BR')} em ${champion.count} contratos.`;
      if (criticalEl) { const impacto = ((critical.valorInadimplente / vencimentoData.reduce((s,d)=>s+d.valorInadimplente,0)) * 100).toFixed(0); criticalEl.textContent = `O Dia ${critical.label} é responsável por ${impacto}% do valor total inadimplente (${critical.percentual.toFixed(2)}%).`; }
      if (challengeEl) challengeEl.textContent = `Reduzir inadimplência do Dia ${critical.label} para abaixo de 20% nos próximos 3 meses`;
    }

    // Função para identificar a filial pelo URL da planilha conectada
    const getFilialBySheetUrl = window.getFilialBySheetUrl = function() {
      const currentSheetUrl = localStorage.getItem('sheetUrl') || '';
      if (!currentSheetUrl) return null;
      
      // Extrair ID da planilha da URL armazenada
      let currentSheetId = null;
      try {
        // Formato: https://docs.google.com/spreadsheets/d/e/SHEET_ID/...
        const match = currentSheetUrl.match(/\/d\/e\/([a-zA-Z0-9\-_]+)/);
        if (match) currentSheetId = match[1];
      } catch (e) {
        console.error('Erro ao extrair ID da planilha:', e);
      }
      
      if (!currentSheetId) {
        console.warn('⚠️ Não foi possível extrair ID da planilha de:', currentSheetUrl.substring(0, 80));
        return null;
      }
      
      // Mapeamento de filiais e seus IDs de planilha
      const Gamificacao_sources = [
        { nome: 'Santo André', sheetId: '2PACX-1vQ3ToD7PGSzSsse2PknRNR1vBzirmngf3g1nbWz9XFGP1_1viVrs0m95zGfS1PiyG2WSKTIIS1xOVHS' },
        { nome: 'São Bernardo do Campo', sheetId: '2PACX-1vRdwCZkmISaGAnFqd9MUdQ7OFlakL0iNQ9v-PMYZirR-W-2s4j_28VuntHG6sYIR1qyqij46LWMsLoA' },
        { nome: 'Guarulhos', sheetId: '2PACX-1vQxYB0l4MSyo7K0xhYmikEXMt5i6DlWMz4B2XYrglNjSpbSyQIOxpB5kkAqIkQd8kXqQCusZ5AfXuC5' },
        { nome: 'Araçatuba', sheetId: '2PACX-1vS0MTiQ1nXBI8HOg3yRVMYacBHXEI7MlBRhzaX52szMllKHdxVlAxE3A8gA5ZDPnFO-yEGDef86QGE0' },
        { nome: 'Ipiranga', sheetId: '2PACX-1vT0NjAK33_Q655P-WuhIjV2G_K3q7uzPXc6PFUnnhonWtu7dWVGJrpO_QP_5mfjRgLTbPnAoyvfOZVB' },
        { nome: 'Mauá', sheetId: '2PACX-1vT1NRT6j0uGUuErHRI1jmYd7Hhtq45XYHjWQtSI384MHMnNHx9j4rKglUR-wkbYN1AJv1eL-7yZgDL2' },
        { nome: 'Mooca', sheetId: '2PACX-1vQavRu_jHblojklrRajiMR7XGpC0dE2M589LZ00UBaDskg3EZIOoj7n4jLCgE-2ODmZktjP_zSb15ND' },
        { nome: 'Santos', sheetId: '2PACX-1vR2ECOHv5SVmxCCZ7ffbxLDb6DY7LKBGg9AuPtoSDZDbBcpni5voiLRAZDvsOUyfqcZ3OSuKgx1J33c' },
        { nome: 'Santo Amaro', sheetId: '2PACX-1vR6-oGCysRnFKZWIVbgHtnSv0qRGDTrQ6cprekhfSJDOAwYu2AdAXmgGJiMAlOvL6K5QS053SeZbqg7' },
        { nome: 'São José dos Campos', sheetId: '2PACX-1vRR_zNtuNCA492DfdbNihCFowj8U43HwyNpD6E-e_XDl7-49nkc9Hska9BzH0e1pNopxVdPsbGi1Wwb' },
        { nome: 'Sorocaba', sheetId: '2PACX-1vRDhQ3IediDw10_VuSCTbt1YLqShu0749nIM2Y5HXaZPrAF9eBV09yPXpkJB-2UYNrJn9ZtSUPozoBB' },
        { nome: 'Suzano', sheetId: '2PACX-1vST4hKhXoz_NGRRUp6aoHr_VGJgQEIVaz3KSVq9KC1riglgNA3HPEOVAQLGFQRLGEFfFHS9xbg0oFoe' },
        { nome: 'Taubaté', sheetId: '2PACX-1vS7RU4Lh1pWXQefdjavaqG8MjUdMRY6N-5a5bp01z5zycuwxCDVS5Gnt2A6kOrjT2Z9DHJ1NjbZrrqt' },
        { nome: 'Americana', sheetId: '2PACX-1vQf0kasU6lnx3CT-HjX_OjOU9UOUnJvGlyOJrVC8zA1L-e5ERtaGffz9X7uFSii0HJIpcfxbNnLEvyG' },
        { nome: 'São José do Rio Preto', sheetId: '2PACX-1vSyCeUtbXYUohS_DRzQnGKC_GdngP0sJISubh7ncWTKMOepSzYCBTFHdqW-FaQs67sMKsR9aOJFj2Lm' },
        { nome: 'Valinhos', sheetId: '2PACX-1vT2t1URWDYKT_fpwsrr-E5japQLeBVkwjSZ-nxkjUQVQrhdPxzgtdH9EAyU4VN8YTBgIr7hOV3I7gCZ' },
        { nome: 'Tatuapé', sheetId: '2PACX-1vTX_srLQozewsTh6l2LAf5UZKp3sqRuJPO7ORpuh4xssYxNxq4pHFR-yqG3yxS4mwacM0IfFtxRPaUY' },
        { nome: 'Piracicaba', sheetId: '2PACX-1vQfet93n1XunJ6BRh3vumZ1jpaD_o-wm4WL6mEnpYK2uvqjT9D2AmJ0n_JgXq5Z99dRLJBBjoMwaXB2' },
        { nome: 'Bauru', sheetId: '2PACX-1vQUZpK5Ix7w-a9Tp1Y0DTlJqIbgtiJJ9jnBzuuvpeoAjhrWgPzOiGhX-7gEXsI_ygqeQcxeFRgN5wlM' }
      ];
      
      // Procurar filial pelo ID da planilha
      for (const filial of Gamificacao_sources) {
        if (currentSheetId === filial.sheetId) {
          console.log(`🏢 Filial identificada: ${filial.nome}`);
          return filial.nome;
        }
      }
      
      console.warn(`⚠️ Filial não encontrada para ID: ${currentSheetId}`);
      return null;
    };

    // Função para buscar a meta do admin panel baseado na filial e período
    const getMetaFromAdmin = window.getMetaFromAdmin = function(selectedTeam, periodo, dataRef) {
      try {
        const adminGoals = JSON.parse(localStorage.getItem('dashboard_goals') || '[]');
        if (!adminGoals || adminGoals.length === 0) return 0.25; // padrão 25%
        
        // NOVO: Identificar a filial pelo URL (isolamento por filial)
        const filialByUrl = getFilialBySheetUrl();
        
        // Determinar qual filial procurar
        let filialToSearch = selectedTeam;
        
        // Se houver filial identificada pelo URL, usar APENAS ela (isolamento garantido)
        if (filialByUrl) {
          filialToSearch = filialByUrl;
          console.log(`🔐 Filial isolada pelo URL: ${filialToSearch}`);
        } else if (!filialToSearch || filialToSearch === 'Todas' || filialToSearch === 'Geral') {
          // Fallback: usar primeira meta do admin panel
          if (adminGoals.length > 0) {
            filialToSearch = adminGoals[0]?.scope;
          }
          
          if (!filialToSearch) return 0.25;
        }
        
        // Procurar meta correspondente APENAS para a filial identificada
        for (const goal of adminGoals) {
          // Procurar meta individual por filial - aceita múltiplos formatos de tipo
          const isIndividualGoal = goal.type === 'individual' || 
                                   goal.type === 'Individual' || 
                                   goal.type === 'Individual (Por Filial)';
          
          if (isIndividualGoal && goal.scope) {
            const goalFilial = goal.scope.toLowerCase().trim();
            const searchFilial = filialToSearch.toLowerCase().trim();
            
            // Comparação flexível
            if (goalFilial === searchFilial || searchFilial.includes(goalFilial) || goalFilial.includes(searchFilial)) {
              // Verificar período (se dataRef é fornecido)
              if (goal.period) {
                // Se o período é 'período 8-2', validar com base no mês de referência
                if (goal.period.toLowerCase().includes('período 8-2') || goal.period.toLowerCase().includes('período-8-2')) {
                  // Para período 8-2, usar o período calculado em vez de datas específicas
                  console.log(`✅ Meta encontrada para ${goal.scope}: ${goal.targetInadempl}% (Período 8-2)`);
                  return (goal.targetInadempl || 25) / 100;
                } else if (goal.startDate && goal.endDate && dataRef) {
                  // Para outros períodos, verificar datas
                  const metaIni = new Date(goal.startDate);
                  const metaFim = new Date(goal.endDate);
                  if (dataRef >= metaIni && dataRef <= metaFim) {
                    console.log(`✅ Meta encontrada para ${goal.scope}: ${goal.targetInadempl}%`);
                    return (goal.targetInadempl || 25) / 100;
                  }
                }
              } else {
                // Se não há período especificado, aceitar a meta
                console.log(`✅ Meta encontrada para ${goal.scope}: ${goal.targetInadempl}%`);
                return (goal.targetInadempl || 25) / 100;
              }
            }
          }
        }
        
        console.log(`⚠️ Nenhuma meta encontrada para ${filialToSearch}, usando padrão 25%`);
      } catch (e) {
        console.warn('Erro ao buscar meta do admin:', e);
      }
      return 0.25; // padrão 25%
    }

    const updateDashboard = window.updateDashboard = function() {
  // Se a view do Dashboard não está montada, não atualiza DOM
  if (!document.getElementById('dashboard-container')) return;
      const monthRef = document.getElementById('monthSelect').value || uniqueMonths[uniqueMonths.length - 1];
      const team = document.getElementById('teamFilter').value;
      const vendedor = document.getElementById('vendedorFilter')?.value || '';
      const [anoRef, mesRef] = monthRef.split('-').map(Number); const dataRef = new Date(anoRef, mesRef - 1, 1); const {ini:dataIni, fim:dataFim} = getPeriodo82(dataRef);
      const proximoMes = new Date(dataRef); proximoMes.setMonth(dataRef.getMonth()+1); const {ini:dataIniProj, fim:dataFimProj} = getPeriodo82(proximoMes);
      const mesesNomes = ['', 'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const iniMes = dataIni.getMonth()+1, iniAno = dataIni.getFullYear(); const fimMes = dataFim.getMonth()+1, fimAno = dataFim.getFullYear();
  const periodoTexto = `${mesesNomes[iniMes]} ${iniAno} a ${mesesNomes[fimMes]} ${fimAno}`;
  const periodo82El = document.getElementById('periodo82'); if (periodo82El) periodo82El.textContent = periodoTexto;
  // atualizar estado compartilhado e notificar
  window.AppState.selectedMonth = monthRef;
  window.AppState.periodo82Text = periodoTexto;
  document.dispatchEvent(new CustomEvent('app:monthsUpdated', { detail: { uniqueMonths: window.AppState.uniqueMonths, selectedMonth: window.AppState.selectedMonth, periodo82Text: window.AppState.periodo82Text, sheetUrl: window.AppState.sheetUrl } }));
      let dataFiltrada = rawData.filter(r => r.dataVenda >= dataIni && r.dataVenda <= dataFim && (!team || (r.equipe && r.equipe.toLowerCase()===team.toLowerCase())) && (!vendedor || (r.vendedor && r.vendedor.toLowerCase()===vendedor.toLowerCase())));
      const totalVendas = dataFiltrada.reduce((acc,r)=>acc+r.valor,0);
      processVencimentoData();
      const totalAtrasado = dataFiltrada.filter(r=>r.status==='ATRASADO').reduce((acc,r)=>acc+r.valor,0);
      const totalCancelado = dataFiltrada.filter(r=>r.status==='CANCELADO').reduce((acc,r)=>acc+r.valor,0);
      const inadimplencia = totalVendas ? (totalAtrasado + totalCancelado) / totalVendas : 0;
      let dataProj = rawData.filter(r => r.dataVenda >= dataIniProj && r.dataVenda <= dataFimProj && (!team || (r.equipe && r.equipe.toLowerCase()===team.toLowerCase())) && (!vendedor || (r.vendedor && r.vendedor.toLowerCase()===vendedor.toLowerCase())));
      const totalVendasProj = dataProj.reduce((acc,r)=>acc+r.valor,0);
      const totalAtrasadoProj = dataProj.filter(r=>r.status==='ATRASADO').reduce((acc,r)=>acc+r.valor,0);
      const totalCanceladoProj = dataProj.filter(r=>r.status==='CANCELADO').reduce((acc,r)=>acc+r.valor,0);
      const inadimplenciaProj = totalVendasProj ? (totalAtrasadoProj + totalCanceladoProj) / totalVendasProj : 0;
      const riscoPotencial = totalVendas * inadimplencia; const metaInadimplencia = getMetaFromAdmin(team || 'Geral', 'periodo-8-2', dataRef); window.currentMetaPercent = metaInadimplencia * 100; const metaAtingida = inadimplencia <= metaInadimplencia; const diferenciaMeta = Math.abs((inadimplencia - metaInadimplencia) * 100);
      const prevRef = new Date(dataRef.getFullYear(), dataRef.getMonth()-1, 1); const {ini:prevIni, fim:prevFim} = getPeriodo82(prevRef);
      const prevData = rawData.filter(r => r.dataVenda >= prevIni && r.dataVenda <= prevFim && (!team || (r.equipe && r.equipe.toLowerCase()===team.toLowerCase())) && (!vendedor || (r.vendedor && r.vendedor.toLowerCase()===vendedor.toLowerCase())));
      const prevVendas = prevData.reduce((acc,r)=>acc+r.valor,0);
  const currInadEl = document.getElementById('currentInadimplencia'); if (currInadEl) currInadEl.textContent = formatPercent(inadimplencia);
      const metaStatusEl = document.getElementById('metaStatus'); const metaDiferencaEl = document.getElementById('metaDiferenca');
      const metaDisplayEl = document.getElementById('metaDisplay'); if (metaDisplayEl) metaDisplayEl.textContent = (metaInadimplencia * 100).toFixed(1) + '%';
      const metaLabelEl = document.getElementById('metaLabel'); if (metaLabelEl) metaLabelEl.textContent = `Meta ${(metaInadimplencia * 100).toFixed(1)}%`;
      if (metaStatusEl) metaStatusEl.textContent = metaAtingida ? 'ATINGIDA ✅' : 'NÃO ATINGIDA ❌';
      if (metaDiferencaEl) metaDiferencaEl.textContent = metaAtingida ? `${diferenciaMeta.toFixed(1)}pp abaixo da meta` : `${diferenciaMeta.toFixed(1)}pp acima da meta`;
      setTimeout(()=>initMetricSlide(), 100);
  const projEl = document.getElementById('projecaoInadimplencia'); if (projEl) projEl.textContent = formatPercent(inadimplenciaProj);
  const volEl = document.getElementById('volumeVendas'); if (volEl) volEl.textContent = formatCurrency(totalVendas);
  const trendEl = document.getElementById('vendasTrend'); if (trendEl) trendEl.textContent = `${formatCurrency(totalVendas - prevVendas)} vs período anterior`;
  const riscoEl = document.getElementById('riscoPotencial'); if (riscoEl) riscoEl.textContent = formatCurrency(riscoPotencial);
      const alertas = [];
      if (inadimplencia > 0.2) alertas.push('🚨 Inadimplência acima de 20%! Ação imediata recomendada.');
      if (inadimplenciaProj > inadimplencia) alertas.push('🔮 Projeção indica aumento de inadimplência no próximo período.');
      if (totalAtrasado > 0) alertas.push(`⚠️ Valor em atraso no período: <b>${formatCurrency(totalAtrasado)}</b>`);
      if (totalCancelado > 0) alertas.push(`❌ Valor cancelado no período: <b>${formatCurrency(totalCancelado)}</b>`);
      if (alertas.length === 0) alertas.push('✅ Nenhum alerta crítico para o período selecionado.');
  const alertEl = document.getElementById('alertSection'); if (alertEl) alertEl.innerHTML = alertas.map(a=>`<div>${a}</div>`).join('');
      const ultimos6 = inadEvolData.slice(-6); const mesesEvol = ultimos6.map(i=>i.ata); const inadEvol = ultimos6.map(i=>Number((i.inad*100).toFixed(2))); window.dashboardData = dataFiltrada; window.evolutionData = inadEvol; window.teamData = {};
      renderTeamRanking(dataIni, dataFim);
      renderVendorRanking(dataIni, dataFim);
    }

    function renderTeamRanking(dataIni, dataFim) {
      const podiumEl = document.getElementById('teamRankingPodium');
      const listEl = document.getElementById('teamRankingList');
      if (!podiumEl || !listEl) return;

      // Agrupar por equipe no período
      const teamMap = new Map();
      rawData.filter(r => r.dataVenda >= dataIni && r.dataVenda <= dataFim && r.equipe).forEach(r => {
        const key = r.equipe;
        const agg = teamMap.get(key) || { nome: key, producao: 0, inadValor: 0 };
        agg.producao += r.valor;
        const st = String(r.status||'').toUpperCase();
        if (['ATRASADO','EM ATRASO','CANCELADO','INADIMPLENTE','VENCIDO'].includes(st)) agg.inadValor += r.valor;
        teamMap.set(key, agg);
      });
      const ranking = Array.from(teamMap.values()).map(t => ({ ...t, inad: t.producao > 0 ? t.inadValor / t.producao : 0 })).sort((a,b) => a.inad - b.inad);

      if (!ranking.length) { podiumEl.innerHTML = ''; listEl.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">Sem dados de equipe no período</div>'; return; }

      // MINIMALISTA: Tabela simples sem cards grandes
      podiumEl.innerHTML = '';
      listEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:0;border:1px solid rgba(255,255,255,.1);border-radius:8px;overflow:hidden;">' + 
        ranking.map((t, i) => {
          const pos = i + 1;
          const inadPerc = (t.inad * 100).toFixed(1);
          const medalIcon = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '';
          const inadColor = t.inad > 0.30 ? '#ef4444' : t.inad > 0.25 ? '#f59e0b' : '#06ffa5';
          const rowBg = i % 2 === 0 ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.1)';
          return `
            <div style="display:grid;grid-template-columns:40px 1fr 100px 120px;gap:12px;align-items:center;padding:12px 16px;background:${rowBg};border-bottom:${i < ranking.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none'};transition:background .2s;">
              <div style="text-align:center;font-weight:800;color:#94a3b8;font-size:0.9rem;">${medalIcon || pos}º</div>
              <div style="font-weight:600;color:#e2e8f0;font-size:0.95rem;">${t.nome}</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:${inadColor};font-size:0.95rem;text-align:right;">${inadPerc}%</div>
              <div style="font-size:0.85rem;color:#94a3b8;text-align:right;">${formatCurrency(t.producao)}</div>
            </div>`;
        }).join('') + '</div>';
    }

    function renderVendorRanking(dataIni, dataFim) {
      const podiumEl = document.getElementById('vendorRankingPodium');
      const listEl = document.getElementById('vendorRankingList');
      if (!podiumEl || !listEl) return;

      const team = document.getElementById('teamFilter')?.value || '';
      const vendedorFilter = document.getElementById('vendedorFilter')?.value || '';

      // Agrupar por vendedor no período
      const vendorMap = new Map();
      rawData.filter(r => r.dataVenda >= dataIni && r.dataVenda <= dataFim && r.vendedor
        && (!team || (r.equipe && r.equipe.toLowerCase() === team.toLowerCase()))
        && (!vendedorFilter || (r.vendedor.toLowerCase() === vendedorFilter.toLowerCase()))
      ).forEach(r => {
        const key = r.vendedor;
        const agg = vendorMap.get(key) || { nome: key, equipe: r.equipe || '', producao: 0, inadValor: 0 };
        agg.producao += r.valor;
        const st = String(r.status || '').toUpperCase();
        if (['ATRASADO','EM ATRASO','CANCELADO','INADIMPLENTE','VENCIDO'].includes(st)) agg.inadValor += r.valor;
        vendorMap.set(key, agg);
      });

      const allVendors = Array.from(vendorMap.values()).map(t => ({ ...t, inad: t.producao > 0 ? t.inadValor / t.producao : 0 }));
      const withSales = allVendors.filter(v => v.producao > 0).sort((a, b) => a.inad - b.inad);
      const noSales = allVendors.filter(v => v.producao === 0).sort((a, b) => a.nome.localeCompare(b.nome));
      const ranking = [...withSales, ...noSales];

      if (!ranking.length) { podiumEl.innerHTML = ''; listEl.innerHTML = '<div style="color:#94a3b8;text-align:center;padding:20px;">Sem dados de vendedores no período</div>'; return; }

      // MINIMALISTA: Grid 2 colunas compacto
      podiumEl.innerHTML = '';
      listEl.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' + 
        ranking.map((t, i) => {
          const pos = i + 1;
          const isZero = t.producao === 0;
          const medalIcon = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '';
          const inadPerc = isZero ? '-' : (t.inad * 100).toFixed(1);
          const inadColor = isZero ? '#475569' : (t.inad > 0.30 ? '#ef4444' : t.inad > 0.25 ? '#f59e0b' : '#06ffa5');
          const bgColor = isZero ? 'rgba(71,85,105,.08)' : 'rgba(255,255,255,.04)';
          const borderColor = isZero ? 'rgba(71,85,105,.2)' : 'rgba(255,255,255,.1)';
          return `
            <div style="display:flex;flex-direction:column;gap:6px;border:1px solid ${borderColor};border-radius:8px;padding:8px 10px;background:${bgColor};transition:all .2s;${isZero ? 'opacity:.7;' : ''}"
                 onmouseenter="this.style.background='${isZero ? 'rgba(71,85,105,.12)' : 'rgba(255,255,255,.08)'}'" onmouseleave="this.style.background='${bgColor}'">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:4px;">
                <div style="font-weight:700;color:#e2e8f0;font-size:0.9rem;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${medalIcon} ${t.nome}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:${inadColor};font-size:0.85rem;flex-shrink:0;">${inadPerc}${isZero ? '' : '%'}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;font-size:0.75rem;">
                <div style="color:#64748b;">${t.equipe}</div>
                <div style="color:#94a3b8;text-align:right;">${formatCurrency(t.producao)}</div>
              </div>
            </div>`;
        }).join('') + '</div>';
    }

    function initMetricSlide() {
      const slides = document.querySelectorAll('.slide-content'); if (!slides.length) return; let current = 0; if (window.metricSlideInterval) clearInterval(window.metricSlideInterval);
      function showSlide(i){ slides.forEach((s,idx)=> s.classList.toggle('active', idx===i)); }
      showSlide(current); window.metricSlideInterval = setInterval(()=>{ current = (current+1)%slides.length; showSlide(current); }, 3000);
    }

    async function loadSheetData() {
      const saveEl = document.getElementById('saveSheetUrl'); const inputEl = document.getElementById('sheetUrlInput'); if (inputEl) inputEl.value = localStorage.getItem('sheetUrl') || '';
      if (!SHEET_CSV_URL) {
        // Dados de teste mínimos
        rawData = [
          { ata:'fev./25', ano:'2025', status:'EM DIA', vencimento:'10', equipe:'EQUIPE A', vendedor:'A', cliente:'X', valor:120000, contrato:'C1', telefone:'', dataVenda:new Date(2025,1,1) },
          { ata:'mar./25', ano:'2025', status:'ATRASADO', vencimento:'20', equipe:'EQUIPE A', vendedor:'B', cliente:'Y', valor:45000, contrato:'C2', telefone:'', dataVenda:new Date(2025,2,1) },
          { ata:'abr./25', ano:'2025', status:'CANCELADO', vencimento:'25', equipe:'EQUIPE B', vendedor:'C', cliente:'Z', valor:60000, contrato:'C3', telefone:'', dataVenda:new Date(2025,3,1) }
        ];
        uniqueMonths = [...new Set(rawData.map(r => `${r.ano}-${String(r.dataVenda.getMonth()+1).padStart(2,'0')}`))].sort((a,b)=>b.localeCompare(a));
        uniqueTeams = [...new Set(rawData.map(r => r.equipe))].filter(Boolean);
        fillFilters(); await loadAuxSheet(); document.getElementById('loadingMsg').style.display='none'; processVencimentoData(); setTimeout(()=>updateDashboard(),100); return;
      }
      try {
        document.getElementById('loadingMsg').style.display = 'block';
        // Usar proxy do backend para evitar CORS na Vercel
        const baseUrl = window.location.origin; // Pega a origem atual (localhost ou Vercel)
        const proxyUrl = `${baseUrl}/api/sheet?url=` + encodeURIComponent(SHEET_CSV_URL);
        console.log('📊 Carregando planilha via proxy:', proxyUrl);
        const resp = await fetch(proxyUrl); 
        if (!resp.ok) throw new Error('Erro ao buscar planilha: ' + resp.statusText); 
        console.log('✅ Planilha carregada com sucesso via proxy');
        const csv = await resp.text();
        const delim = detectDelimiter(csv);
        const rows = csv.trim().split(/\r?\n/).map(l=> l.split(delim));
        const headers = rows[0].map(h => (h||'').toString().trim().toLowerCase());
        const norm = (val) => (val||'').toString().trim();
        const getIdx = (alts) => headers.findIndex(h => alts.includes(h));
        const iAta = getIdx(['ata','mês','mes']);
        const iAno = getIdx(['ano','ano_ref','ano referência','ano referencia']);
        const iStatus = getIdx(['status','situação','situacao']);
        const iVenc = getIdx(['vencimento','dia vencimento','dia_vencimento']);
        const iEquipe = getIdx(['equipe','time','squad']);
        const iVend = getIdx(['vendedor','consultor','colaborador']);
        const iSupervisor = getIdx(['supervisor','gestor','coordenador']);
        const iCliente = getIdx(['cliente','nome_cliente']);
        const iValor = getIdx(['valor','valor_contrato','valor venda','valor_venda','producao','produção']);
        const iContrato = getIdx(['contrato','n_contrato','num_contrato','numero_contrato']);
        const iData = getIdx(['data','data_venda','data venda','dt_venda','dt venda']);
        const iTelefone = getIdx(['telefone','tel','celular','fone','phone','contato']);
        rawData = rows.slice(1).map(cols => {
          const ata = iAta>=0 ? norm(cols[iAta]) : '';
          const ano = iAno>=0 ? norm(cols[iAno]) : '';
          const status = (iStatus>=0 ? norm(cols[iStatus]) : '').toUpperCase();
          const vencimento = iVenc>=0 ? norm(cols[iVenc]) : '';
          const equipe = iEquipe>=0 ? norm(cols[iEquipe]) : '';
          const vendedor = iVend>=0 ? norm(cols[iVend]) : '';
          const supervisor = iSupervisor>=0 ? norm(cols[iSupervisor]) : '';
          const cliente = iCliente>=0 ? norm(cols[iCliente]) : '';
          const rawValor = iValor>=0 ? norm(cols[iValor]) : '0';
          const valor = Number(rawValor.replace(/\./g,'').replace(',','.').replace(/[^\d.-]/g,'')) || 0;
          const contrato = iContrato>=0 ? norm(cols[iContrato]) : '';
          const telefone = iTelefone>=0 ? norm(cols[iTelefone]) : '';
          let dataVenda;
          const dataStr = iData>=0 ? norm(cols[iData]) : '';
          if (dataStr) {
            const ddm = dataStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); if (ddm) dataVenda = new Date(Number(ddm[3].length===2?('20'+ddm[3]):ddm[3]), Number(ddm[2])-1, Number(ddm[1]));
            else { const iso = Date.parse(dataStr); if (!isNaN(iso)) dataVenda = new Date(iso); }
          }
          if (!dataVenda) dataVenda = parseDateFromAta(ata, ano);
          if (!(dataVenda instanceof Date) || isNaN(dataVenda)) dataVenda = new Date();
          return { ata, ano: ano || String(dataVenda.getFullYear()), status, vencimento, equipe, vendedor, supervisor, cliente, valor, contrato, telefone, dataVenda };
        });
        uniqueMonths = [...new Set(rawData.map(r => `${r.ano}-${String(r.dataVenda.getMonth()+1).padStart(2,'0')}`))].sort((a,b)=>b.localeCompare(a));
        uniqueTeams = [...new Set(rawData.map(r => r.equipe))].filter(Boolean);
        uniqueVendedores = [...new Set(rawData.map(r => r.vendedor))].filter(Boolean).sort((a,b)=>a.localeCompare(b));
        uniqueSupervisores = [...new Set(rawData.map(r => r.supervisor))].filter(Boolean).sort((a,b)=>a.localeCompare(b));
        fillFilters(); await loadAuxSheet(); document.getElementById('loadingMsg').style.display='none'; processVencimentoData(); setTimeout(()=>updateDashboard(),100);
      } catch (e) { 
        console.error('❌ Erro ao carregar dados:', e);
        // Usar dados de teste quando há erro
        rawData = [
          { ata:'fev./25', ano:'2025', status:'EM DIA', vencimento:'10', equipe:'EQUIPE A', vendedor:'A', cliente:'X', valor:120000, contrato:'C1', telefone:'', dataVenda:new Date(2025,1,1) },
          { ata:'mar./25', ano:'2025', status:'ATRASADO', vencimento:'20', equipe:'EQUIPE A', vendedor:'B', cliente:'Y', valor:45000, contrato:'C2', telefone:'', dataVenda:new Date(2025,2,1) },
          { ata:'abr./25', ano:'2025', status:'CANCELADO', vencimento:'25', equipe:'EQUIPE B', vendedor:'C', cliente:'Z', valor:60000, contrato:'C3', telefone:'', dataVenda:new Date(2025,3,1) }
        ];
        uniqueMonths = [...new Set(rawData.map(r => `${r.ano}-${String(r.dataVenda.getMonth()+1).padStart(2,'0')}`))].sort((a,b)=>b.localeCompare(a));
        uniqueTeams = [...new Set(rawData.map(r => r.equipe))].filter(Boolean);
        fillFilters(); 
        await loadAuxSheet(); 
        processVencimentoData(); 
        setTimeout(()=>updateDashboard(),100);
        document.getElementById('loadingMsg').innerHTML = `
          <div style="color: #f59e0b; padding: 16px; background: #fef3c7; border-radius: 8px; margin: 12px 0;">
            <strong>⚠️ Erro ao carregar planilha real:</strong><br>
            ${e.message}<br><br>
            <small>Verifique:
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>URL da planilha está correta?</li>
                <li>Planilha está publicada em "Publicar na web"?</li>
                <li>Backend está respondendo em /api/sheet?</li>
              </ul>
              <strong>Usando dados de teste para visualizar o dashboard com a meta do admin panel.</strong>
            </small>
          </div>
        `;
      }
    }

    function setupVencimentoEventListeners() {
      const toggleType = document.getElementById('toggleVencimentoType'); const toggleValue = document.getElementById('toggleVencimentoValue');
      if (toggleType) toggleType.addEventListener('click', ()=>{ showingVencimentoPercentage = true; toggleType.classList.add('active'); toggleValue?.classList.remove('active'); createRadialCharts(); createVencimentoComparisonChart(); });
      if (toggleValue) toggleValue.addEventListener('click', ()=>{ showingVencimentoPercentage = false; toggleValue.classList.add('active'); toggleType?.classList.remove('active'); createRadialCharts(); createVencimentoComparisonChart(); });
    }

    function bindUI() {
  const monthSelect = document.getElementById('monthSelect'); const teamFilter = document.getElementById('teamFilter'); const vendedorFilter = document.getElementById('vendedorFilter'); const refreshBtn = document.getElementById('refreshBtn');
      if (monthSelect) monthSelect.addEventListener('change', updateDashboard);
  if (teamFilter) teamFilter.addEventListener('change', ()=>{ populateVendedores(); updateDashboard(); });
  if (vendedorFilter) vendedorFilter.addEventListener('change', updateDashboard);
  if (refreshBtn) refreshBtn.onclick = async () => { try { refreshBtn.disabled = true; refreshBtn.textContent = 'Atualizando...'; await loadSheetData(); } finally { refreshBtn.disabled = false; refreshBtn.textContent = 'Atualizar Dados'; } };
  const btnPdf = document.getElementById('btnExportPdf');
  if (btnPdf) btnPdf.addEventListener('click', exportInadReportPdf);
  const btnExcel = document.getElementById('btnExportExcel');
  if (btnExcel) btnExcel.addEventListener('click', exportToExcel);
  const btnPdfApi = document.getElementById('btnExportPdfApi');
  if (btnPdfApi) btnPdfApi.addEventListener('click', exportToPdfApi);
      const toggle6 = document.getElementById('toggle6Months'); const toggle12 = document.getElementById('toggle12Months'); const toggleProd = document.getElementById('toggleProduction');
      if (toggle6) toggle6.addEventListener('click', ()=>{ showingMonths=6; showingProduction=false; createEvolutionChart(); });
      if (toggle12) toggle12.addEventListener('click', ()=>{ showingMonths=12; showingProduction=false; createEvolutionChart(); });
      if (toggleProd) toggleProd.addEventListener('click', ()=>{ showingProduction=!showingProduction; createEvolutionChart(); });
      setupVencimentoEventListeners();
      const saveBtn = document.getElementById('saveSheetUrl'); const input = document.getElementById('sheetUrlInput');
    if (saveBtn && input) {
        saveBtn.onclick = () => {
          const url = input.value.trim();
          if (!url.startsWith('http') || !url.includes('docs.google.com/spreadsheets/')) { alert('Cole o link publicado da planilha Google.'); return; }
          localStorage.setItem('sheetUrl', url);
      sheetUrl = url; window.AppState.sheetUrl = url; SHEET_CSV_URL = url.includes('/pubhtml') ? url.replace('/pubhtml','/pub') + '&output=csv' : url;
          loadSheetData();
        };
      }
    }

    return {
      init() {
        bindUI();
        setTimeout(()=> loadSheetData(), 300);
        // atualização automática a cada 5 min
        if (window.__dashAutoTimer) clearInterval(window.__dashAutoTimer);
        window.__dashAutoTimer = setInterval(loadSheetData, 300000);
      }
    };
  })();

  // ===== Módulo Gamificação (versão compacta funcional) =====
  const Gamificacao = (() => {
    // CONFIGURE AQUI: fontes CSV publicadas para a Gamificação
    // Se deixar vazio, a Gamificação tentará usar a mesma planilha do Dashboard (se contiver colunas de filial/regional)
    const GAMIFICACAO_SOURCES = [
      { nome: 'Santo André', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3ToD7PGSzSsse2PknRNR1vBzirmngf3g1nbWz9XFGP1_1viVrs0m95zGfS1PiyG2WSKTIIS1xOVHS/pub?output=csv' },
      { nome: 'São Bernardo do Campo', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdwCZkmISaGAnFqd9MUdQ7OFlakL0iNQ9v-PMYZirR-W-2s4j_28VuntHG6sYIR1qyqij46LWMsLoA/pub?output=csv' },
      { nome: 'Guarulhos', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxYB0l4MSyo7K0xhYmikEXMt5i6DlWMz4B2XYrglNjSpbSyQIOxpB5kkAqIkQd8kXqQCusZ5AfXuC5/pub?output=csv' },
      { nome: 'Araçatuba', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0MTiQ1nXBI8HOg3yRVMYacBHXEI7MlBRhzaX52szMllKHdxVlAxE3A8gA5ZDPnFO-yEGDef86QGE0/pub?output=csv' },
      { nome: 'Ipiranga', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0NjAK33_Q655P-WuhIjV2G_K3q7uzPXc6PFUnnhonWtu7dWVGJrpO_QP_5mfjRgLTbPnAoyvfOZVB/pub?output=csv' },
      { nome: 'Mauá', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1NRT6j0uGUuErHRI1jmYd7Hhtq45XYHjWQtSI384MHMnNHx9j4rKglUR-wkbYN1AJv1eL-7yZgDL2/pub?output=csv' },
      { nome: 'Mooca', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQavRu_jHblojklrRajiMR7XGpC0dE2M589LZ00UBaDskg3EZIOoj7n4jLCgE-2ODmZktjP_zSb15ND/pub?output=csv' },
      { nome: 'Santos', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2ECOHv5SVmxCCZ7ffbxLDb6DY7LKBGg9AuPtoSDZDbBcpni5voiLRAZDvsOUyfqcZ3OSuKgx1J33c/pub?output=csv' },
      { nome: 'Santo Amaro', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6-oGCysRnFKZWIVbgHtnSv0qRGDTrQ6cprekhfSJDOAwYu2AdAXmgGJiMAlOvL6K5QS053SeZbqg7/pub?output=csv' },
      { nome: 'São José dos Campos', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRR_zNtuNCA492DfdbNihCFowj8U43HwyNpD6E-e_XDl7-49nkc9Hska9BzH0e1pNopxVdPsbGi1Wwb/pub?output=csv' },
      { nome: 'Sorocaba', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDhQ3IediDw10_VuSCTbt1YLqShu0749nIM2Y5HXaZPrAF9eBV09yPXpkJB-2UYNrJn9ZtSUPozoBB/pub?output=csv' },
      { nome: 'Suzano', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vST4hKhXoz_NGRRUp6aoHr_VGJgQEIVaz3KSVq9KC1riglgNA3HPEOVAQLGFQRLGEFfFHS9xbg0oFoe/pub?output=csv' },
      { nome: 'Taubaté', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7RU4Lh1pWXQefdjavaqG8MjUdMRY6N-5a5bp01z5zycuwxCDVS5Gnt2A6kOrjT2Z9DHJ1NjbZrrqt/pub?output=csv' },
      { nome: 'Americana', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQf0kasU6lnx3CT-HjX_OjOU9UOUnJvGlyOJrVC8zA1L-e5ERtaGffz9X7uFSii0HJIpcfxbNnLEvyG/pub?output=csv' },
      { nome: 'São José do Rio Preto', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyCeUtbXYUohS_DRzQnGKC_GdngP0sJISubh7ncWTKMOepSzYCBTFHdqW-FaQs67sMKsR9aOJFj2Lm/pub?output=csv' },
      { nome: 'Valinhos', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2t1URWDYKT_fpwsrr-E5japQLeBVkwjSZ-nxkjUQVQrhdPxzgtdH9EAyU4VN8YTBgIr7hOV3I7gCZ/pub?output=csv' },
      { nome: 'Tatuapé', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX_srLQozewsTh6l2LAf5UZKp3sqRuJPO7ORpuh4xssYxNxq4pHFR-yqG3yxS4mwacM0IfFtxRPaUY/pub?output=csv' },
      { nome: 'Piracicaba', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfet93n1XunJ6BRh3vumZ1jpaD_o-wm4WL6mEnpYK2uvqjT9D2AmJ0n_JgXq5Z99dRLJBBjoMwaXB2/pub?output=csv' },
      { nome: 'Bauru', regional: 'Alessandro Valleo', diretoria: 'Tota', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUZpK5Ix7w-a9Tp1Y0DTlJqIbgtiJJ9jnBzuuvpeoAjhrWgPzOiGhX-7gEXsI_ygqeQcxeFRgN5wlM/pub?output=csv' }
    ];

  let filiaisAll = [];
  let filiais = [];
  let reloadTimer = null;
  function monthId(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
  function defaultMonths(n=6){ const arr=[]; const now=new Date(); for(let i=0;i<n;i++){ const d=new Date(now.getFullYear(), now.getMonth()-i, 1); arr.push(monthId(d)); } return arr; }
  function ensureSelectedMonth(){ const v=document.getElementById('monthSelect')?.value || window.AppState.selectedMonth; if (v) return v; return monthId(new Date()); }

    function formatCurrency(val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
    function formatPercent(val) { return (val * 100).toFixed(1) + '%'; }
    function inadColor(p) {
      if (p > 0.30) return '#ef4444';
      if (p > 0.25) return '#f59e0b';
      return '#06ffa5';
    }
    function getMonthName(num) { const meses = ['', 'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; return meses[num]; }
    function getPeriodo82(dataRef) { let fim=new Date(dataRef.getFullYear(),dataRef.getMonth(),0); let iniMes=fim.getMonth()-5; let iniAno=fim.getFullYear(); while(iniMes<0){iniMes+=12;iniAno-=1;} return { ini:new Date(iniAno,iniMes,1), fim }; }
  function parseDateFromAta(ata, ano) { const meses = { 'jan':0,'fev':1,'mar':2,'abr':3,'mai':4,'jun':5,'jul':6,'ago':7,'set':8,'out':9,'nov':10,'dez':11 }; const m=(ata||'').slice(0,3).toLowerCase(); let y = Number(ano||new Date().getFullYear()); if (y<100) y = 2000+y; return new Date(y, meses[m]??0, 1); }

    function detectDelimiter(csv) {
      const first = (csv.split('\n')[0]||'');
      const cComma = (first.match(/,/g)||[]).length; const cSemi = (first.match(/;/g)||[]).length; return cSemi>cComma ? ';' : ',';
    }
  function parseCSV(csv) {
      const delim = detectDelimiter(csv);
      const rows = csv.trim().split(/\r?\n/).map(l=> l.split(delim));
      const headers = rows[0].map(h => (h||'').toString().trim().toLowerCase());
      const data = rows.slice(1).map(cols => {
        const get = (nameList, def='') => {
          const idx = headers.findIndex(h => nameList.includes(h));
          return idx>=0 ? (cols[idx]||'').toString().trim() : def;
        };
        const rawValor = get(['valor','valor_contrato','producao','produção','valor venda','valor_venda']);
        const valor = Number(rawValor.replace(/\./g,'').replace(',','.').replace(/[^\d.-]/g,'')) || 0;
        const status = get(['status','situação','situacao']).toUpperCase();
        const filial = get(['filial','unidade','loja','agencia','agência','filiais','nome_filial']);
        const regional = get(['regional','região','regiao']);
    const diretoria = get(['diretoria','direção','direcao']);
        let dataStr = get(['data','data_venda','data venda','dt_venda','dt venda']);
        let ata = get(['ata']); let ano = get(['ano']);
        let dataVenda;
        if (dataStr) {
          // dd/mm/yyyy ou yyyy-mm-dd
          const ddm = dataStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); if (ddm) dataVenda = new Date(Number(ddm[3].length===2?('20'+ddm[3]):ddm[3]), Number(ddm[2])-1, Number(ddm[1]));
          else {
            const iso = Date.parse(dataStr); if (!isNaN(iso)) dataVenda = new Date(iso);
          }
        }
        if (!dataVenda && (ata||ano)) dataVenda = parseDateFromAta(ata, ano);
        if (!dataVenda) dataVenda = new Date();
  return { filial, regional, diretoria, status, valor, dataVenda };
      });
      return data;
    }

    function fetchWithTimeout(url, ms=12000) {
      const controller = new AbortController();
      // Aumenta timeout para 30 segundos (30000 ms)
      const id = setTimeout(() => controller.abort(), 30000);
      return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
    }
    async function fetchCsv(url) {
      const full = url + (url.includes('?')?'&':'?') + 'cache=' + Date.now();
      const resp = await fetchWithTimeout(full);
      if (!resp.ok) throw new Error('Falha ao baixar CSV: ' + url);
      return await resp.text();
    }

    async function loadFromSources(selectedMonth) {
      if (!selectedMonth) return [];
      const [ano, mes] = selectedMonth.split('-').map(Number);
      const { ini, fim } = getPeriodo82(new Date(ano, mes-1, 1));
      const promises = GAMIFICACAO_SOURCES.map(async (src) => {
        try {
          // Usar proxy do backend para evitar CORS na Vercel
          const baseUrl = window.location.origin;
          const proxyUrl = `${baseUrl}/api/sheet?url=` + encodeURIComponent(src.url);
          const resp = await fetchWithTimeout(proxyUrl);
          const csv = await resp.text();
          const rows = parseCSV(csv).filter(r => r.dataVenda >= ini && r.dataVenda <= fim);
          return rows.map(r => ({ ...r, filial: r.filial || src.nome || 'Filial', regional: r.regional || src.regional || '', diretoria: r.diretoria || src.diretoria || '' }));
        } catch (e) {
          console.error('Erro em fonte Gamificação', src.url, e);
          return [];
        }
      });
      const settled = await Promise.allSettled(promises);
      const items = [];
      settled.forEach(res => { if (res.status === 'fulfilled' && Array.isArray(res.value)) items.push(...res.value); });
      return items;
    }

    async function loadFromDashboardSheet(selectedMonth) {
      // Usa o link da mesma planilha do Dashboard, se houver e contiver colunas necessárias
      const url = window.AppState.sheetUrl || '';
      if (!url) return [];
      if (!selectedMonth) selectedMonth = ensureSelectedMonth();
      try {
        // Usar proxy do backend para evitar CORS na Vercel
        const baseUrl = window.location.origin;
        const proxyUrl = `${baseUrl}/api/sheet?url=` + encodeURIComponent(url);
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error('Falha ao baixar CSV do Dashboard');
        const csv = await resp.text();
        const data = parseCSV(csv);
        const [ano, mes] = selectedMonth.split('-').map(Number);
        const { ini, fim } = getPeriodo82(new Date(ano, mes-1, 1));
        return data.filter(r => r.dataVenda >= ini && r.dataVenda <= fim);
      } catch (e) {
        console.error(e); return [];
      }
    }

    function aggregateFiliais(items) {
      const map = new Map();
      items.forEach(r => {
        const key = (r.filial||'').toString().trim() || 'N/D';
        const agg = map.get(key) || { nome: key, regional: r.regional||'', diretoria: r.diretoria||'', producao: 0, inadValor: 0 };
        agg.producao += r.valor;
        if (['ATRASADO','CANCELADO','EM ATRASO','INADIMPLENTE'].includes(r.status)) agg.inadValor += r.valor;
        if (!agg.regional && r.regional) agg.regional = r.regional;
        if (!agg.diretoria && r.diretoria) agg.diretoria = r.diretoria;
        map.set(key, agg);
      });
      return Array.from(map.values()).map(a => ({ ...a, inadimplencia: a.producao>0 ? (a.inadValor/a.producao) : 0 }));
    }

    function populateFilters(months) {
      const monthSelect = document.getElementById('monthSelect'); if (!monthSelect) return; monthSelect.innerHTML='';
      const useMonths = (months && months.length)? months : defaultMonths(6);
      useMonths.forEach(m => { const [ano, mes] = m.split('-'); const opt=document.createElement('option'); opt.value=m; opt.textContent=`${getMonthName(Number(mes))}/${ano}`; monthSelect.appendChild(opt); });
      if (useMonths.length>0) {
        // preferir seleção do Dashboard
        if (window.AppState.selectedMonth) {
          monthSelect.value = window.AppState.selectedMonth;
        } else if (useMonths.length>1) {
          monthSelect.value = useMonths[1]; // penúltimo
        } else {
          monthSelect.value = useMonths[0];
        }
      }
    }

    function renderTop3AndRanking() {
      const ranking = [...filiais].sort((a,b)=> a.inadimplencia - b.inadimplencia);
      const first = ranking[0], second = ranking[1], third = ranking[2];
      const setPlace = (id, item) => {
        const el = document.getElementById(id); if (!el) return;
        el.querySelector('.filiais-podium-name').textContent = item? item.nome : '-';
        el.querySelector('.filiais-podium-city').textContent = item? (item.regional + (item.diretoria? ' — ' + item.diretoria : '')) : '-';
        el.querySelector('.filiais-podium-score').textContent = item? formatPercent(item.inadimplencia) : '-';
      };
      setPlace('filiaisFirstPlace', first); setPlace('filiaisSecondPlace', second); setPlace('filiaisThirdPlace', third);

      const medal = (i) => {
        if (i === 0) return '<i class="fas fa-crown"></i>';
        if (i === 1) return '<i class="fas fa-medal"></i>';
        if (i === 2) return '<i class="fas fa-star"></i>';
        return i + 1;
      };
      const container = document.getElementById('rankingContainer'); if (!container) return;
      container.innerHTML = ranking.map((f,i)=>{
        const perc = Math.min(100, Math.max(0, f.inadimplencia*100));
        const color = inadColor(f.inadimplencia);
        // Animação de entrada e efeito neon para o top 3
        const animation = i < 3 ? 'style="animation:fadeInUp 0.7s cubic-bezier(.4,0,.2,1) '+(0.1*i)+'s both,glow 2s infinite alternate;box-shadow:0 0 24px '+color+'99;"' : '';
        return `
        <div class="ranking-item" ${animation}>
          <div class="rank-badge ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${medal(i)}</div>
          <div class="branch">
            <div class="branch-top">
              <i class="fas ${i===0?'fa-rocket':i===1?'fa-bolt':i===2?'fa-gem':'fa-store'} branch-icon" style="${i<3?'background:var(--accent-gradient);color:#fff;':''}"></i>
              <div class="branch-info">
                <div class="name" style="font-size:${i===0?'1.15rem':'1rem'};letter-spacing:.5px;">${f.nome}</div>
                <div class="meta">
                  ${f.regional? `<span class="chip"><i class='fas fa-location-dot'></i> ${f.regional}</span>`: ''}
                  ${f.diretoria? `<span class="chip alt"><i class='fas fa-user-tie'></i> ${f.diretoria}</span>`: ''}
                </div>
              </div>
            </div>
            <div class="progress-wrap">
              <div class="progress-track" style="background:linear-gradient(90deg,#22223b 0%,${color} 100%);height:10px;">
                <div class="progress-fill" style="width:${perc.toFixed(1)}%; background:${color};box-shadow:0 0 12px ${color}99;"></div>
              </div>
              <div class="progress-label" style="font-size:0.95rem;gap:8px;">
                <span><i class="fas fa-exclamation-triangle"></i> Inadimplência</span>
                <strong style="color:${color};font-size:1.1em;">${formatPercent(f.inadimplencia)}</strong>
              </div>
            </div>
          </div>
          <div class="numbers">
            <div class="num money" style="font-size:1.1rem;"><i class="fas fa-coins"></i> ${formatCurrency(f.producao)}</div>
          </div>
        </div>`;
      }).join('');
    }

    function populateRegionalFilter(list) {
      const sel = document.getElementById('teamFilter'); if (!sel) return;
      const curr = sel.value;
      const set = new Set();
      list.forEach(f => { const r = (f.regional||'').toString().trim(); if (r) set.add(r); });
      const options = [''].concat([...set].sort());
      sel.innerHTML = options.map(v => `<option value="${v}">${v? v : 'Todos'}</option>`).join('');
      if (options.includes(curr)) sel.value = curr;
    }

    function renderAchievements() {
      // Oculta totalmente a seção de conquistas (cards: Excelência, Na Meta)
      const c = document.getElementById('achievementsContainer');
      if (c && c.parentElement) {
        c.innerHTML = '';
        c.parentElement.style.display = 'none';
      }
    }

    function renderStats() {
      // Oculta totalmente a seção de estatísticas (cards: Críticos, Atenção)
      const c = document.getElementById('statisticsContainer');
      if (c && c.parentElement) {
        c.innerHTML = '';
        c.parentElement.style.display = 'none';
      }
    }

    function renderAlerts() {
      // Oculta totalmente a seção de alertas (cards: Melhor, Atenção)
      const c = document.getElementById('alertsContainer');
      if (c && c.parentElement) {
        c.innerHTML = '';
        c.parentElement.style.display = 'none';
      }
    }

    function renderMotivation() {
      const el = document.getElementById('motivationText'); if (!el) return;
      const msgs = [
        '🌟 Cada ponto percentual de melhoria representa famílias mais seguras!',
        '🚀 O sucesso de uma filial inspira todas as outras. Continue!',
        '💪 Grandes resultados vêm de pequenas melhorias consistentes.'
      ];
      el.textContent = msgs[Math.floor(Math.random()*msgs.length)];
    }

    async function initData() {
      // Sincronizar meses/período e carregar dados reais
      const syncFromDashboard = () => {
        const months = window.AppState.uniqueMonths || [];
        if (months.length) {
          populateFilters(months);
          const sel = document.getElementById('monthSelect')?.value;
          if (sel) {
            const [ano, mes] = sel.split('-').map(Number);
            const { ini, fim } = getPeriodo82(new Date(ano, mes-1, 1));
            const mesesNomes = ['', 'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
            const periodoTexto = `${mesesNomes[ini.getMonth()+1]} ${ini.getFullYear()} a ${mesesNomes[fim.getMonth()+1]} ${fim.getFullYear()}`;
            const periodo82El = document.getElementById('periodo82'); if (periodo82El) periodo82El.textContent = periodoTexto;
          } else if (window.AppState.periodo82Text) {
            const periodo82El = document.getElementById('periodo82'); if (periodo82El) periodo82El.textContent = window.AppState.periodo82Text;
          }
        }
      };
      syncFromDashboard();
      // carregar dados
  const selectedMonth = ensureSelectedMonth();
  const loadingEl = document.getElementById('loadingMsg'); if (loadingEl) loadingEl.style.display = 'block';
  let items = [];
      if (GAMIFICACAO_SOURCES.length) {
        items = await loadFromSources(selectedMonth);
      } else {
        items = await loadFromDashboardSheet(selectedMonth);
      }
  filiaisAll = aggregateFiliais(items);
  populateRegionalFilter(filiaisAll);
  // aplicar filtro inicial
  const regionalSel = document.getElementById('teamFilter');
  const regional = regionalSel?.value || '';
  filiais = regional ? filiaisAll.filter(f => (f.regional||'') === regional) : filiaisAll;
  const regEl = document.getElementById('regionalNameHighlight'); if (regEl) regEl.textContent = regional || (filiais[0]?.regional || '-');
  if (loadingEl) loadingEl.style.display = 'none';
    }

    function bindUI() {
      const monthSelect = document.getElementById('monthSelect'); if (monthSelect) monthSelect.addEventListener('change', async ()=>{
        const sel = monthSelect.value || window.AppState.selectedMonth || ensureSelectedMonth(); if (!sel) return;
        window.AppState.selectedMonth = sel;
        const [ano, mes] = sel.split('-').map(Number);
        const { ini, fim } = getPeriodo82(new Date(ano, mes-1, 1));
        const mesesNomes = ['', 'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const periodoTexto = `${mesesNomes[ini.getMonth()+1]} ${ini.getFullYear()} a ${mesesNomes[fim.getMonth()+1]} ${fim.getFullYear()}`;
        const periodo82El = document.getElementById('periodo82'); if (periodo82El) periodo82El.textContent = periodoTexto;
        // recarregar dados para o novo período
        let items = [];
        try {
          if (GAMIFICACAO_SOURCES.length) items = await loadFromSources(sel); else items = await loadFromDashboardSheet(sel);
          filiais = aggregateFiliais(items);
        } catch(err) { console.error('Erro ao recarregar dados do mês', err); }
        renderAll();
      });
  const refreshBtn = document.getElementById('refreshRankingBtn'); if (refreshBtn) refreshBtn.addEventListener('click', async ()=>{
        const sel = document.getElementById('monthSelect')?.value || window.AppState.selectedMonth || ensureSelectedMonth();
        const loadingEl = document.getElementById('loadingMsg');
        try {
          if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = 'Atualizando...'; }
          if (loadingEl) loadingEl.style.display = 'block';
          let items = [];
          if (GAMIFICACAO_SOURCES.length) items = await loadFromSources(sel); else items = await loadFromDashboardSheet(sel);
          filiaisAll = aggregateFiliais(items);
          populateRegionalFilter(filiaisAll);
          const regional = document.getElementById('teamFilter')?.value || '';
          filiais = regional ? filiaisAll.filter(f => (f.regional||'') === regional) : filiaisAll;
        } catch(err) {
          console.error('Erro ao atualizar ranking', err);
        } finally {
          if (loadingEl) loadingEl.style.display = 'none';
          if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.textContent = 'Atualizar'; }
          renderAll();
        }
      });
      const regSel = document.getElementById('teamFilter'); if (regSel) regSel.addEventListener('change', ()=>{ const regional = regSel.value || ''; filiais = regional ? filiaisAll.filter(f => (f.regional||'') === regional) : filiaisAll; const regEl = document.getElementById('regionalNameHighlight'); if (regEl) regEl.textContent = regional || (filiais[0]?.regional || '-'); renderAll(); });
      // reagir a atualizações do Dashboard (meses/período) e recarregar
    document.addEventListener('app:monthsUpdated', () => {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(async () => {
          const months = window.AppState.uniqueMonths || [];
          if (months.length) populateFilters(months);
      const sel = document.getElementById('monthSelect')?.value || window.AppState.selectedMonth || ensureSelectedMonth();
          const loadingEl = document.getElementById('loadingMsg'); if (loadingEl) loadingEl.style.display = 'block';
          let items = [];
          if (GAMIFICACAO_SOURCES.length) items = await loadFromSources(sel); else items = await loadFromDashboardSheet(sel);
          filiaisAll = aggregateFiliais(items); populateRegionalFilter(filiaisAll);
          const regional = document.getElementById('teamFilter')?.value || '';
          filiais = regional ? filiaisAll.filter(f => (f.regional||'') === regional) : filiaisAll;
          if (loadingEl) loadingEl.style.display = 'none';
          renderAll();
        }, 150);
      });
    }

    function renderAll() {
      if (!filiais.length) {
        const c = document.getElementById('rankingContainer');
        if (c) c.innerHTML = '<div style="opacity:.8">Configure as fontes CSV em script.js (const GAMIFICACAO_SOURCES) ou use a mesma planilha do Dashboard com colunas de filial/regional.</div>';
      }
      renderTop3AndRanking(); renderAchievements(); renderStats(); renderAlerts(); renderMotivation();
      // Força exibição dos efeitos especiais após renderização, caso não tenham sido exibidos
      setTimeout(() => {
        try {
          // Detecta a filial do link inserido na dashboard
          let sheetUrl = localStorage.getItem('sheetUrl') || '';
          let minhaFilial = '';
          if (sheetUrl) {
            // Procura na lista de fontes da gamificação
            if (typeof GAMIFICACAO_SOURCES !== 'undefined') {
              const found = GAMIFICACAO_SOURCES.find(src => src.url && sheetUrl.includes(src.url));
              if (found) minhaFilial = found.nome;
            }
          }
          // Exibe parabéns/alerta apenas uma vez por entrada na aba gamificação
          if (!window._specialShown) {
            window._specialShown = true;
            if (minhaFilial && typeof filiais !== 'undefined' && filiais.length > 0) {
              const minha = filiais.find(f => (f.nome||'').toLowerCase() === minhaFilial.toLowerCase());
              if (minha) {
                if (minha.inadimplencia < 0.3) showSpecialCongrats(minhaFilial);
                if (minha.inadimplencia >= 0.3) showSpecialAlert(minhaFilial, minha.inadimplencia);
              }
            }
          }
        } catch(e) {}
      }, 500);
      const loading = document.getElementById('loadingMsg'); if (loading) loading.style.display='none';
    }

    return { init() { bindUI(); initData().then(()=>{ renderAll(); if (window.GamificationModule) { window.GamificationModule.initialize(); } }); } };
  })();

  // Inicialização do App
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
