/**
 * Módulo de Autenticação - Frontend
 * Gerencia login, registro e sessão
 */

import apiClient from './api/client.js';

export const Auth = {
  /**
   * Renderizar página de login
   */
  renderLogin() {
    return `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 212, 255, 0.2);
          width: 100%;
          max-width: 420px;
        ">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="
              font-size: 2rem;
              font-weight: 900;
              margin: 0;
              background: linear-gradient(135deg, #4ade80, #22d3ee, #a78bfa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              Dashboard
            </h1>
            <p style="color: #cbd5e1; margin-top: 8px; margin-bottom: 0;">Inadimplência 8-2</p>
          </div>

          <form id="loginForm" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="
                display: block;
                color: #cbd5e1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.9rem;
              ">Email</label>
              <input 
                type="email" 
                id="loginEmail" 
                placeholder="seu@email.com" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(0, 212, 255, 0.2);
                  border-radius: 12px;
                  color: #f8fafc;
                  font-size: 1rem;
                  transition: all 0.3s;
                  box-sizing: border-box;
                "
                onblur="this.style.boxShadow=''"
                onfocus="this.style.boxShadow='0 0 0 2px rgba(0, 212, 255, 0.3)'; this.style.background='rgba(255, 255, 255, 0.1)'"
              />
            </div>

            <div>
              <label style="
                display: block;
                color: #cbd5e1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.9rem;
              ">Senha</label>
              <input 
                type="password" 
                id="loginPassword" 
                placeholder="••••••••" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(0, 212, 255, 0.2);
                  border-radius: 12px;
                  color: #f8fafc;
                  font-size: 1rem;
                  transition: all 0.3s;
                  box-sizing: border-box;
                "
                onblur="this.style.boxShadow=''"
                onfocus="this.style.boxShadow='0 0 0 2px rgba(0, 212, 255, 0.3)'; this.style.background='rgba(255, 255, 255, 0.1)'"
              />
            </div>

            <div id="errorMessage" style="
              display: none;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              color: #fca5a5;
              padding: 12px;
              border-radius: 8px;
              font-size: 0.9rem;
              text-align: center;
            "></div>

            <button 
              type="submit" 
              id="loginBtn"
              style="
                padding: 12px;
                background: linear-gradient(135deg, #00d4ff, #7c3aed);
                border: none;
                border-radius: 12px;
                color: #fff;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 8px;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0, 212, 255, 0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''"
            >
              Entrar
            </button>

            <button 
              type="button" 
              id="toggleRegister"
              style="
                padding: 12px;
                background: transparent;
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 12px;
                color: #00d4ff;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
              "
              onmouseover="this.style.background='rgba(0, 212, 255, 0.05)'"
              onmouseout="this.style.background='transparent'"
            >
              Criar Conta
            </button>
          </form>

          <div style="
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem;
            color: #94a3b8;
            text-align: center;
          ">
            <p style="margin: 0;">Credenciais de teste:</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>admin@dashboard.com</strong> / Admin@123456</p>
            <p style="margin: 0;">ou</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>manager@dashboard.com</strong> / Manager@12345</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderizar página de registro
   */
  renderRegister() {
    return `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 212, 255, 0.2);
          width: 100%;
          max-width: 420px;
        ">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="
              font-size: 2rem;
              font-weight: 900;
              margin: 0;
              background: linear-gradient(135deg, #4ade80, #22d3ee, #a78bfa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              Criar Conta
            </h1>
            <p style="color: #cbd5e1; margin-top: 8px; margin-bottom: 0;">Registre-se para acessar</p>
          </div>

          <form id="registerForm" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="
                display: block;
                color: #cbd5e1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.9rem;
              ">Nome Completo</label>
              <input 
                type="text" 
                id="registerName" 
                placeholder="Seu Nome" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(0, 212, 255, 0.2);
                  border-radius: 12px;
                  color: #f8fafc;
                  font-size: 1rem;
                  transition: all 0.3s;
                  box-sizing: border-box;
                "
                onfocus="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.boxShadow='0 0 0 2px rgba(0, 212, 255, 0.3)'"
                onblur="this.style.boxShadow=''; this.style.background='rgba(255, 255, 255, 0.05)'"
              />
            </div>

            <div>
              <label style="
                display: block;
                color: #cbd5e1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.9rem;
              ">Email</label>
              <input 
                type="email" 
                id="registerEmail" 
                placeholder="seu@email.com" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(0, 212, 255, 0.2);
                  border-radius: 12px;
                  color: #f8fafc;
                  font-size: 1rem;
                  transition: all 0.3s;
                  box-sizing: border-box;
                "
                onfocus="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.boxShadow='0 0 0 2px rgba(0, 212, 255, 0.3)'"
                onblur="this.style.boxShadow=''; this.style.background='rgba(255, 255, 255, 0.05)'"
              />
            </div>

            <div>
              <label style="
                display: block;
                color: #cbd5e1;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 0.9rem;
              ">Senha</label>
              <input 
                type="password" 
                id="registerPassword" 
                placeholder="Mín. 8 caracteres com maiúscula e número" 
                required
                style="
                  width: 100%;
                  padding: 12px 16px;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(0, 212, 255, 0.2);
                  border-radius: 12px;
                  color: #f8fafc;
                  font-size: 1rem;
                  transition: all 0.3s;
                  box-sizing: border-box;
                "
                onfocus="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.boxShadow='0 0 0 2px rgba(0, 212, 255, 0.3)'"
                onblur="this.style.boxShadow=''; this.style.background='rgba(255, 255, 255, 0.05)'"
              />
            </div>

            <div id="registerError" style="
              display: none;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              color: #fca5a5;
              padding: 12px;
              border-radius: 8px;
              font-size: 0.9rem;
            "></div>

            <button 
              type="submit" 
              id="registerBtn"
              style="
                padding: 12px;
                background: linear-gradient(135deg, #06ffa5, #00d4ff);
                border: none;
                border-radius: 12px;
                color: #0f172a;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 8px;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(6, 255, 165, 0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''"
            >
              Criar Conta
            </button>

            <button 
              type="button" 
              id="toggleLogin"
              style="
                padding: 12px;
                background: transparent;
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 12px;
                color: #00d4ff;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
              "
              onmouseover="this.style.background='rgba(0, 212, 255, 0.05)'"
              onmouseout="this.style.background='transparent'"
            >
              Voltar para Login
            </button>
          </form>
        </div>
      </div>
    `;
  },

  /**
   * Inicializar listeners de autenticação
   */
  initListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRegister();
      });
    }

    // Toggle buttons
    const toggleRegister = document.getElementById('toggleRegister');
    if (toggleRegister) {
      toggleRegister.addEventListener('click', () => {
        this.showRegister();
      });
    }

    const toggleLogin = document.getElementById('toggleLogin');
    if (toggleLogin) {
      toggleLogin.addEventListener('click', () => {
        this.showLogin();
      });
    }
  },

  /**
   * Processar login
   */
  async handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('errorMessage');
    const btn = document.getElementById('loginBtn');

    if (!email || !password) {
      if (errorDiv) errorDiv.style.display = 'block';
      if (errorDiv) errorDiv.textContent = 'Preencha todos os campos';
      return;
    }

    try {
      if (btn) btn.disabled = true;
      if (btn) btn.textContent = 'Entrando...';

      await apiClient.login(email, password);

      // Redirecionar para dashboard
      window.location.href = '/';
    } catch (error) {
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message || 'Erro ao fazer login';
      }
    } finally {
      if (btn) btn.disabled = false;
      if (btn) btn.textContent = 'Entrar';
    }
  },

  /**
   * Processar registro
   */
  async handleRegister() {
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const errorDiv = document.getElementById('registerError');
    const btn = document.getElementById('registerBtn');

    if (!name || !email || !password) {
      if (errorDiv) errorDiv.style.display = 'block';
      if (errorDiv) errorDiv.textContent = 'Preencha todos os campos';
      return;
    }

    try {
      if (btn) btn.disabled = true;
      if (btn) btn.textContent = 'Criando conta...';

      await apiClient.register(email, password, name);

      // Redirecionar para dashboard
      window.location.href = '/';
    } catch (error) {
      if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message || 'Erro ao criar conta';
      }
    } finally {
      if (btn) btn.disabled = false;
      if (btn) btn.textContent = 'Criar Conta';
    }
  },

  /**
   * Mostrar página de login
   */
  showLogin() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = this.renderLogin();
      this.initListeners();
    }
  },

  /**
   * Mostrar página de registro
   */
  showRegister() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = this.renderRegister();
      this.initListeners();
    }
  }
};

export default Auth;
