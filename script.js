// TPE Suzano — Script Principal v6.4.6

const API_URL = "https://script.google.com/macros/s/AKfycbzKn4WUAvN_VOzHmf2Wh2jmw3XLXVpyxfDOWYV_K0ilgKCdIDUnXbHAwf3wvLAH6oNHvA/exec";

let contatosDB = [];
let designacoesSalvas = {};

const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const padraoSemanal = {
    "Segunda": [{ local: "Praça dos Correios", turnos: ["09h às 12h", "12h às 15h", "15h às 17h"] }],
    "Terça": [{ local: "Estação CPTM (Terminal)", turnos: ["09h às 12h", "12h às 15h", "15h às 17h"] }],
    "Quarta": [{ local: "Praça da Igreja", turnos: ["09h às 12h", "12h às 15h", "15h às 17h"] }],
    "Quinta": [{ local: "Estação CPTM (Centro)", turnos: ["09h às 12h", "12h às 15h", "15h às 17h"] }],
    "Sexta": [{ local: "Hospital Santa Casa", turnos: ["09h às 12h", "12h às 15h", "15h às 18h", "18h às 20h"] }],
    "Sábado": [
        { local: "Parque Max Feffer", turnos: ["09h às 11h", "11h às 13h", "13h às 15h", "15h às 17h"] },
        { local: "Estação CPTM (Centro)", turnos: ["09h às 11h", "11h às 13h", "13h às 15h", "15h às 17h"] },
        { local: "Feira Miguel Badra", turnos: ["08h às 10h", "10h às 12h", "12h às 14h"] }
    ],
    "Domingo": [
        { local: "Parque Max Feffer", turnos: ["09h às 11h", "11h às 13h", "13h às 15h", "15h às 17h"] },
        { local: "Hospital Santa Casa", turnos: ["09h às 11h"] },
        { local: "Feira Dona Benta", turnos: ["08h às 10h", "10h às 12h", "12h às 14h"] }
    ]
};

const fdsMapping = {
    "Manhã (08h às 13h)": ["08h às 10h", "09h às 11h", "10h às 12h", "11h às 13h"],
    "Tarde (12h às 17h)": ["12h às 14h", "13h às 15h", "15h às 17h"]
};

let dataHoje = new Date();
let dataHomeVisao = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1);

const SVG_CHECK = `<svg class="inline-icon" style="color:var(--primary);" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const SVG_PIN = `<svg class="inline-icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
const SVG_CLOCK = `<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const SVG_USER = `<svg class="inline-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

function localLink(nomeLocal) {
    const loc = locaisCache.find(l => l.nome === nomeLocal);
    if (loc) {
        return `<button class="local-link-btn" onclick="abrirLocalModal('${loc.id}')">${SVG_PIN}${nomeLocal}</button>`;
    }
    return `${SVG_PIN} ${nomeLocal}`;
}


function getWaIcon() {
    return `<svg class="wa-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
}

function formatarNome(nomeStr) {
    if (!nomeStr || nomeStr === "Vazio") return "Vazio";
    let c = contatosDB.find(x => x.nome === nomeStr);
    let nomeLimpo = nomeStr.replace(/\s*\([^)]+\)/g, '').trim();
    let cong = (c && c.congregacao && c.congregacao.trim() !== "Outros") ? c.congregacao.trim() : extrairCongregacaoDoNome(nomeStr);

    if (!cong || cong === "Outros") return nomeLimpo;
    return `${nomeLimpo} <span class="cong-badge">(${cong})</span>`;
}

function mostrarLoading(mostrar, texto = "Carregando...") {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingText').textContent = texto;
    overlay.style.display = mostrar ? 'flex' : 'none';
}

function mostrarModalInfoCustom(htmlContent, showButton = true, autoCloseSeconds = 0) {
    const modal = document.getElementById('modalGenericInfo');
    const body = document.getElementById('modalGenericBody');
    const footer = document.getElementById('modalGenericFooter');

    body.innerHTML = htmlContent;
    footer.style.display = showButton ? 'flex' : 'none';
    modal.classList.add('active');
    const box = modal.querySelector('.modal-box');
    if (box) box.scrollTop = 0;
    body.scrollTop = 0;

    if (autoCloseSeconds > 0) {
        setTimeout(() => {
            modal.classList.remove('active');
        }, autoCloseSeconds * 1000);
    }
}

function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('svg');
    if (input.type === 'password') {
        input.type = 'text';
        icon.style.color = 'var(--primary)';
    } else {
        input.type = 'password';
        icon.style.color = 'var(--text-muted)';
    }
}


function _migrarHorarioSexta(designacoes) {
    let alterou = false;
    Object.keys(designacoes).forEach(chaveMes => {
        const mes = designacoes[chaveMes];
        Object.keys(mes).forEach(dia => {
            if (!Array.isArray(mes[dia])) return;
            mes[dia].forEach(turno => {
                if (turno.local === 'Hospital Santa Casa' && turno.horario === '15h às 17h') {
                    turno.horario = '15h às 18h';
                    alterou = true;
                }
            });
        });
    });
    return alterou;
}

async function carregarDadosDaNuvem() {
    const cacheContatos = localStorage.getItem('tpe_contatos');
    const cacheDesignacoes = localStorage.getItem('tpe_designacoes');

    const cacheLocais = localStorage.getItem('tpe_locais_cache');

    if (cacheContatos && cacheDesignacoes) {
        contatosDB = JSON.parse(cacheContatos);
        designacoesSalvas = JSON.parse(cacheDesignacoes);
        if (cacheLocais) locaisCache = JSON.parse(cacheLocais);

        if (_migrarHorarioSexta(designacoesSalvas)) {
            localStorage.setItem('tpe_designacoes', JSON.stringify(designacoesSalvas));
        }

        popularCongregacoes();
        filtrarContatos();
        renderizarHome();
        console.log("App carregado via cache local (Instantâneo)");
    } else {
        mostrarLoading(true, "Primeiro acesso: baixando dados...");
    }

    try {
        let res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "getDados" }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        let data = JSON.parse(await res.text());

        if (data.status === "error") throw new Error(data.message);

        contatosDB = (data.contatos || []).filter(c => c && c.nome);
        designacoesSalvas = data.designacoes || {};
        _migrarHorarioSexta(designacoesSalvas);
        if (Array.isArray(data.locais)) {
            locaisCache = data.locais;
            try { localStorage.setItem('tpe_locais_cache', JSON.stringify(locaisCache)); } catch (e) { }
        }

        localStorage.setItem('tpe_contatos', JSON.stringify(contatosDB));
        localStorage.setItem('tpe_designacoes', JSON.stringify(designacoesSalvas));

        popularCongregacoes();
        filtrarContatos();
        renderizarHome();

    } catch (erro) {
        console.error("Erro ao atualizar dados da nuvem:", erro);
        if (!cacheContatos) {
            mostrarModalInfoCustom('<h3 style="color:var(--danger);">Erro de Conexão</h3><p>Verifique sua internet.</p>');
        }
    }
    mostrarLoading(false);
}

function getCongregacao(c) {
    if (!c) return "Outros";
    if (c.congregacao && c.congregacao.trim()) return c.congregacao.trim();
    return extrairCongregacaoDoNome(c.nome);
}
function extrairCongregacaoDoNome(nome) {
    if (!nome || typeof nome !== 'string') return "Outros";
    const match = String(nome).match(/\(([^)]+)\)/);
    return match ? match[1].trim() : "Outros";
}
function removerAcentos(txt) {
    if (!txt) return '';
    return String(txt).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function limparTelefone(tel) {
    if (!tel) return '';
    return String(tel).replace(/\D/g, '');
}
function mascaraTelefone(event) {
    let input = event.target;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = '(' + val.substring(0, 2) + ') ' + val.substring(2);
    if (val.length > 10) val = val.substring(0, 10) + '-' + val.substring(10);
    else if (val.length > 9) val = val.substring(0, 9) + '-' + val.substring(9);
    input.value = val;
}

function formatarData(data) { return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`; }
function formatarChaveMes(ano, mes) { return `${ano}-${mes}`; }

function getInitials(nome) {
    if (!nome || typeof nome !== 'string') return "?";
    const parts = nome.trim().split(' ').filter(p => !p.startsWith('('));
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0].substring(0, 2).toUpperCase();
    return "?";
}

const pageTitles = { pageHome: "Início", pageAtualizacao: "Disponibilidades", pageContatos: "Contatos", pageLocais: "Locais" };

const pageScrollPositions = {};

function abrirPagina(id, btn) {
    const paginaAtiva = document.querySelector('.page.active');
    if (paginaAtiva) {
        pageScrollPositions[paginaAtiva.id] = paginaAtiva.scrollTop;
        paginaAtiva.classList.remove('active');
    }

    requestAnimationFrame(() => {
        const novaPagina = document.getElementById(id);
        novaPagina.classList.add('active');
        novaPagina.scrollTop = pageScrollPositions[id] || 0;

        document.querySelectorAll('.nav-btn, .b-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.nav-btn[data-page="' + id + '"], .b-nav-btn[data-page="' + id + '"]').forEach(b => b.classList.add('active'));
        if (btn && !btn.getAttribute('data-page')) {
            btn.classList.add('active');
        }

        document.getElementById('topbarTitle').textContent = pageTitles[id] || 'TPE Suzano';

        if (id === 'pageHome') { document.getElementById('pageHome').scrollTop = 0; renderizarHome(); }
        if (id === 'pageAtualizacao') {
            document.getElementById('buscaAtualizar').value = '';
            document.getElementById('listaBuscaAtualizacao').innerHTML = '';
            document.getElementById('listaBuscaAtualizacao').style.display = 'none';
            document.getElementById('formAtualizacao').style.display = 'none';
        }
        if (id === 'pageContatos') { document.getElementById('pageContatos').scrollTop = 0; filtrarContatos(); }
        if (id === 'pageLocais') renderizarLocaisPublico();
    });
}

function fecharModal(id) { document.getElementById(id).classList.remove('active'); }

function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('active');
    const box = modal.querySelector('.modal-box');
    const body = modal.querySelector('.modal-body');
    if (box) box.scrollTop = 0;
    if (body) body.scrollTop = 0;
}

function preencherCheckboxes(c, checkboxClass) {
    document.querySelectorAll('.' + checkboxClass).forEach(chk => {
        const dia = chk.getAttribute('data-dia');
        const val = chk.value;
        if (c.disp && c.disp[dia]) {
            if (dia === "Sábado" || dia === "Domingo") {
                const mappedSlots = fdsMapping[val] || [];
                if (mappedSlots.some(slot => c.disp[dia].includes(slot))) chk.checked = true;
            } else {
                if (c.disp[dia].includes(val)) chk.checked = true;
            }
        }
    });
}

function extrairDisponibilidades(checkboxClass) {
    let novaDisp = { "Segunda": [], "Terça": [], "Quarta": [], "Quinta": [], "Sexta": [], "Sábado": [], "Domingo": [] };
    let fdsSets = { "Sábado": new Set(), "Domingo": new Set() };

    document.querySelectorAll('.' + checkboxClass + ':checked').forEach(chk => {
        const dia = chk.getAttribute('data-dia');
        const val = chk.value;
        if (dia === "Sábado" || dia === "Domingo") {
            const mappedSlots = fdsMapping[val] || [];
            mappedSlots.forEach(slot => fdsSets[dia].add(slot));
        } else {
            novaDisp[dia].push(val);
        }
    });

    novaDisp["Sábado"] = Array.from(fdsSets["Sábado"]);
    novaDisp["Domingo"] = Array.from(fdsSets["Domingo"]);
    return novaDisp;
}

function filtrarBuscaAtualizacao() {
    const termo = removerAcentos(document.getElementById('buscaAtualizar').value.trim());
    const ul = document.getElementById('listaBuscaAtualizacao');
    document.getElementById('formAtualizacao').style.display = 'none';

    if (termo.length < 2) { ul.innerHTML = ''; ul.style.display = 'none'; return; }

    const filtrados = contatosDB.filter(c => c && c.nome && removerAcentos(c.nome).includes(termo));

    if (filtrados.length > 0) {
        ul.style.display = 'block';
        ul.innerHTML = filtrados.map(c => `
            <li class="list-item" onclick="abrirFormAtualizacao('${c.nome.replace(/'/g, "\\'")}')">
                <div class="item-info">
                    <div class="item-avatar">${getInitials(c.nome)}</div>
                    <div>
                        <div class="item-name" style="margin:0; display:flex; align-items:center; flex-wrap:wrap; gap:4px;">${formatarNome(c.nome)}</div>
                        <div class="item-sub">Toque para atualizar</div>
                    </div>
                </div>
            </li>`).join('');
    } else {
        ul.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.9rem;">Nenhum nome encontrado.</p>';
        ul.style.display = 'block';
    }
}

function abrirFormAtualizacao(nome) {
    document.getElementById('listaBuscaAtualizacao').innerHTML = '';
    document.getElementById('listaBuscaAtualizacao').style.display = 'none';
    document.getElementById('buscaAtualizar').value = nome;

    const c = contatosDB.find(x => x.nome === nome);
    if (!c) return;

    const tituloElement = document.getElementById('tituloAtualizacaoNome');
    tituloElement.innerHTML = formatarNome(c.nome);
    tituloElement.setAttribute('data-nome-real', c.nome);

    document.getElementById('attTelefone').value = c.telefone;

    const attCong = document.getElementById('attCongregacao');
    if (attCong) attCong.value = getCongregacao(c);

    document.getElementById('attObservacoes').value = c.observacoes || "";

    construirGridHorarios('gridDisponibilidadesAtualizacao', 'chk-disp-user');
    preencherCheckboxes(c, 'chk-disp-user');

    document.getElementById('formAtualizacao').style.display = 'block';
}

async function enviarSolicitacaoAtualizacao() {
    const nomeReal = document.getElementById('tituloAtualizacaoNome').getAttribute('data-nome-real') || document.getElementById('buscaAtualizar').value;

    const telefone = document.getElementById('attTelefone').value;
    const observacoes = document.getElementById('attObservacoes').value;

    const attCong = document.getElementById('attCongregacao');
    const congregacao = attCong ? attCong.value : "Outros";

    let novaDisp = extrairDisponibilidades('chk-disp-user');

    mostrarLoading(true, "Enviando solicitação...");
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "solicitarAtualizacao",
                nome: nomeReal,
                telefone: telefone,
                observacoes: observacoes,
                disp: novaDisp,
                congregacao: congregacao
            }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        mostrarLoading(false);

        const msgWa = encodeURIComponent("Olá irmão! Atualizei meu perfil no TPE Suzano, por gentileza, solicito que seja verificado!");
        const waLink = `https://wa.me/5511978756527?text=${msgWa}`;

        const htmlSucesso = `
            <svg class="icon-svg" style="width:50px;height:50px;color:var(--primary);margin-bottom:20px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <h3 style="color:var(--primary-dark);">Solicitação Enviada!</h3>
            <p style="margin: 15px 0 25px; color:var(--text-main); line-height:1.5;">Sua solicitação de atualização foi enviada. Por gentileza, <strong>solicite a verificação</strong> com o irmão responsável clicando abaixo:</p>
            
            <div class="list-item" style="text-align:left; border-color:var(--primary); background:var(--primary-light);">
                <div class="item-info">
                    <div class="item-avatar">JC</div>
                    <div>
                        <div class="item-name" style="margin:0;">João Carlos <span class="cong-badge">(Colorado)</span></div>
                        <div class="item-sub">(11) 97875-6527</div>
                    </div>
                </div>
                <a href="${waLink}" target="_blank" class="wa-btn">${getWaIcon()}</a>
            </div>
        `;
        mostrarModalInfoCustom(htmlSucesso, true);
        abrirPagina('pageHome', document.querySelector('.b-nav-btn'));
    } catch (e) {
        mostrarLoading(false);
        mostrarModalInfoCustom('<h3 style="color:var(--danger);">Erro</h3><p style="margin-top:10px;">Não foi possível enviar sua solicitação. Tente novamente.</p>');
    }
}

function renderizarHome() {
    document.getElementById('txtDataHoje').textContent = formatarData(dataHoje);
    renderizarCalendarioHome();
    renderizarDesignacoesHoje();
}

function mudarMesHome(delta) {
    dataHomeVisao.setMonth(dataHomeVisao.getMonth() + delta);
    renderizarCalendarioHome();
    document.getElementById('buscaHome').value = '';
    document.getElementById('listaBuscaHome').innerHTML = '';
    document.getElementById('listaBuscaHome').style.display = 'none';
    document.getElementById('cardDesignacoesHome').style.display = 'none';
}

function filtrarBuscaHome() {
    const termo = removerAcentos(document.getElementById('buscaHome').value.trim());
    const ul = document.getElementById('listaBuscaHome');
    const cardDesignacoes = document.getElementById('cardDesignacoesHome');

    cardDesignacoes.style.display = 'none';

    if (termo.length < 2) { ul.innerHTML = ''; ul.style.display = 'none'; return; }

    const filtrados = contatosDB.filter(c => c && c.nome && removerAcentos(c.nome).includes(termo));

    if (filtrados.length > 0) {
        ul.style.display = 'block';
        ul.innerHTML = filtrados.map(c => `
            <li class="list-item" style="padding: 10px 15px; margin-bottom:5px;" onclick="mostrarDesignacoesHome('${c.nome.replace(/'/g, "\\'")}')">
                <div class="item-info" style="gap:10px;">
                    <div class="item-avatar" style="width:30px; height:30px; font-size:0.8rem;">${getInitials(c.nome)}</div>
                    <div class="item-name" style="margin:0; font-size:0.9rem;">${formatarNome(c.nome)}</div>
                </div>
            </li>`).join('');
    } else {
        ul.innerHTML = '<p style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.8rem;">Nenhum nome encontrado.</p>';
        ul.style.display = 'block';
    }
}


function mostrarDesignacoesHome(nome) {
    document.getElementById('listaBuscaHome').innerHTML = '';
    document.getElementById('listaBuscaHome').style.display = 'none';
    document.getElementById('buscaHome').value = nome;

    const card = document.getElementById('cardDesignacoesHome');
    let encontrouHtml = "";

    const chavesMeses = Object.keys(designacoesSalvas).sort((a, b) => {
        const [anoA, mesA] = a.split('-').map(Number);
        const [anoB, mesB] = b.split('-').map(Number);
        return new Date(anoA, mesA) - new Date(anoB, mesB);
    });

    chavesMeses.forEach(chaveMes => {
        const [ano, mes] = chaveMes.split('-').map(Number);
        const dataFoco = new Date(ano, mes, 1);

        if (dataFoco < new Date(dataHomeVisao.getFullYear(), dataHomeVisao.getMonth(), 1)) return;

        const designacoesMes = designacoesSalvas[chaveMes] || {};
        if (designacoesMes._fechado === true || designacoesMes._fechado === "true") {
            let itensMes = "";

            Object.keys(designacoesMes).forEach(dia => {
                if (dia === "_fechado" || String(dia).startsWith("_ov_")) return;
                if (!designacoesMes[dia]) return;

                designacoesMes[dia].forEach(t => {
                    if (t.i1 === nome || t.i2 === nome) {
                        const dataObj = new Date(ano, mes, dia);
                        const diaSemana = nomesDias[dataObj.getDay()];
                        const parceiro = (t.i1 === nome) ? (t.i2 || "Vazio") : (t.i1 || "Vazio");
                        const dataFormatada = formatarData(dataObj);

                        itensMes += `
                            <div class="turno-card" style="border-left: 4px solid var(--primary); background: white; margin-bottom: 12px;">
                                <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <strong style="color:var(--text-main); font-size:0.85rem;">${dia} de ${mesesNomes[mes]} (${diaSemana})</strong>
                                    <span style="font-size:0.75rem; background: var(--primary-light); color: var(--primary-dark); padding: 2px 8px; border-radius: 10px; font-weight:700;">${t.horario}</span>
                                </div>
                                <div style="font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px;">
                                    <span>${localLink(t.local)}</span>
                                    <span style="margin-top:2px; font-weight:600; color:var(--primary-dark);">${SVG_USER} Parceiro(a): ${formatarNome(parceiro)}</span>
                                </div>
                                
                                <div style="display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid var(--border); padding-top: 10px;">
                                    <button class="btn-small" style="background: var(--bg-color); color: var(--text-main); border: 1px solid var(--border); flex: 1;" 
                                        onclick="gerarLembreteCalendario('${dataFormatada}', '${t.horario}', '${t.local}')">
                                        📅 Calendário
                                    </button>
                                    ${parceiro !== "Vazio" ? `
                                    <button class="btn-small" style="background: #25D366; color: white; border: none; flex: 1;" 
                                        onclick="notificarParceiro('${parceiro.replace(/'/g, "\\'")}', '${dataFormatada}', '${t.horario}', '${t.local}')">
                                        ${getWaIcon()} WhatsApp
                                    </button>` : ''}
                                </div>
                            </div>`;
                    }
                });
            });

            if (itensMes) {
                encontrouHtml += `<div class="section-title" style="margin-top:20px; color: var(--primary-dark);">${mesesNomes[mes]} de ${ano}</div>${itensMes}`;
            }
        }
    });

    card.style.display = 'block';
    if (encontrouHtml) {
        card.innerHTML = `<div class="section-title">Minhas Designações</div>` + encontrouHtml;
    } else {
        card.innerHTML = `<div class="section-title">${nome}</div><p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding: 20px;">Nenhuma designação encontrada para os próximos meses.</p>`;
    }
}

function gerarLembreteCalendario(dataStr, horarioStr, local) {
    const [dia, mes, ano] = dataStr.split('/');
    const horaInicio = parseInt(horarioStr.split('h')[0]);
    const horaFim = horaInicio + 2;

    const pad = (n) => String(n).padStart(2, '0');
    const dtStart = `${ano}${mes}${dia}T${pad(horaInicio)}0000`;
    const dtEnd = `${ano}${mes}${dia}T${pad(horaFim)}0000`;

    const uid = `tpe-${ano}${mes}${dia}-${horaInicio}@suzano`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TPE Suzano//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStart}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:TPE: ${local}`,
        `DESCRIPTION:Designação de Testemunho Público Especial em Suzano.`,
        `LOCATION:${local}, Suzano - SP`,
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Lembrete: Designação TPE em 30 minutos',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TPE_${dia}-${mes}-${ano}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function notificarParceiro(nomeParceiro, data, horario, local) {
    const parceiroObj = contatosDB.find(c => c.nome === nomeParceiro);
    if (!parceiroObj || !parceiroObj.telefone) {
        mostrarModalInfoCustom('<h3>Erro</h3><p>Não foi possível encontrar o telefone do parceiro.</p>');
        return;
    }

    const tel = limparTelefone(parceiroObj.telefone);
    const saudacao = (new Date().getHours() < 12) ? "Bom dia" : (new Date().getHours() < 18 ? "Boa tarde" : "Boa noite");

    const mensagem = encodeURIComponent(`Olá ${nomeParceiro}, ${saudacao.toLowerCase()}! Tudo bem?\nVi aqui que fomos designados para o TPE:\n\n*• Data:* ${data}\n*• Horário:* ${horario}\n*• Local:* ${local}\n\nPodemos confirmar?`);

    window.open(`https://wa.me/55${tel}?text=${mensagem}`, '_blank');
}

function renderizarCalendarioHome() {
    const ano = dataHomeVisao.getFullYear();
    const mes = dataHomeVisao.getMonth();
    const chaveMes = formatarChaveMes(ano, mes);

    document.getElementById('labelMesHome').textContent = `${mesesNomes[mes]} ${ano}`;
    const grid = document.getElementById('gridCalendarioHome');

    let gridHtml = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<div class="cal-day-name">${d}</div>`).join('');

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaSemana; i++) { gridHtml += `<div class="cal-cell empty"></div>`; }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        let cellClass = "cal-cell";
        if (dia === dataHoje.getDate() && mes === dataHoje.getMonth() && ano === dataHoje.getFullYear()) cellClass += " today";

        gridHtml += `<div class="${cellClass}" onclick="abrirModalDiaHome(${ano}, ${mes}, ${dia})">${dia}</div>`;
    }
    grid.innerHTML = gridHtml;
}

function abrirModalDiaHome(ano, mes, dia) {
    const chaveMes = formatarChaveMes(ano, mes);
    const diaDaSemana = nomesDias[new Date(ano, mes, dia).getDay()];
    document.getElementById('modalDiaTitle').textContent = `${dia} de ${mesesNomes[mes]} (${diaDaSemana})`;
    const content = document.getElementById('modalDiaContent');

    const mesFechado = designacoesSalvas[chaveMes] && (designacoesSalvas[chaveMes]._fechado === true || designacoesSalvas[chaveMes]._fechado === "true");
    const turnosSalvos = (mesFechado && designacoesSalvas[chaveMes][dia]) ? designacoesSalvas[chaveMes][dia] : [];

    if (turnosSalvos.length === 0) {
        content.innerHTML = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);"><svg class="icon-svg" style="width:40px;height:40px;margin-bottom:15px;opacity:0.4;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><p>Nenhuma designação.</p></div>`;
    } else {
        content.innerHTML = renderizarTurnosPorLocal(turnosSalvos);
    }
    abrirModal('modalDiaHome');
}

function renderizarTurnosPorLocal(turnos) {
    const grupos = [];
    const indexMap = {};
    turnos.forEach(t => {
        const local = t.local || "Local não informado";
        if (indexMap[local] === undefined) {
            indexMap[local] = grupos.length;
            grupos.push({ local, turnos: [] });
        }
        grupos[indexMap[local]].turnos.push(t);
    });

    return grupos.map(g => {
        const linhasTurnos = g.turnos.map((t, i) => `
            <div class="turno-por-local-row" style="${i > 0 ? 'border-top: 1px solid rgba(18,140,126,0.10); margin-top:10px; padding-top:10px;' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">${SVG_CLOCK} ${t.horario}</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    <span class="irmao-badge">${SVG_USER} ${formatarNome(t.i1)}</span>
                    <span class="irmao-badge">${SVG_USER} ${formatarNome(t.i2)}</span>
                </div>
            </div>`).join('');

        return `
            <div class="local-group-card">
                <div class="local-group-header">
                    ${localLink(g.local)}
                </div>
                <div class="local-group-body">
                    ${linhasTurnos}
                </div>
            </div>`;
    }).join('');
}

function renderizarDesignacoesHoje() {
    const container = document.getElementById('listaDesignacoesHoje');
    const chaveMes = formatarChaveMes(dataHoje.getFullYear(), dataHoje.getMonth());
    const dia = dataHoje.getDate();

    const mesFechado = designacoesSalvas[chaveMes] && (designacoesSalvas[chaveMes]._fechado === true || designacoesSalvas[chaveMes]._fechado === "true");
    const turnosHoje = (mesFechado && designacoesSalvas[chaveMes][dia]) ? designacoesSalvas[chaveMes][dia] : [];

    if (turnosHoje.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted); margin-top:20px;"><svg class="icon-svg" style="width:40px;height:40px;margin-bottom:15px;opacity:0.4;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><p style="font-size:0.9rem;">Nenhuma designação para hoje.</p></div>`;
        return;
    }

    container.innerHTML = renderizarTurnosPorLocal(turnosHoje);
}

function limparBuscaContatos() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.value = '';
    filtrarContatos();
}

function filtrarContatos() {
    const input = document.getElementById('searchInput');
    // indexadm.html: a página de Contatos foi removida, então esses elementos
    // não existem mais nesse contexto — retorna silenciosamente sem erro.
    if (!input) return;
    const termo = removerAcentos(input.value);
    const clearBtn = document.getElementById('clearContatos');

    if (clearBtn) clearBtn.style.display = input.value.length > 0 ? 'flex' : 'none';

    let filtrados = contatosDB.filter(c => removerAcentos(c.nome).includes(termo) || limparTelefone(c.telefone).includes(termo));
    filtrados.sort((a, b) => a.nome.localeCompare(b.nome));

    const ul = document.getElementById('listaContatos');
    document.getElementById('contadorContatos').textContent = `${filtrados.length} de ${contatosDB.length} contatos`;

    let htmlContatos = '';
    filtrados.forEach(c => {
        htmlContatos += `
        <div class="list-item">
            <div class="item-info">
                <div class="item-avatar ${c.sexo === 'F' ? 'female' : ''}">${getInitials(c.nome)}</div>
                <div><div class="item-name" style="margin:0;">${formatarNome(c.nome)}</div><div class="item-sub">${c.telefone}</div></div>
            </div>
            <a href="https://wa.me/55${limparTelefone(c.telefone)}" target="_blank" class="wa-btn">${getWaIcon()}</a>
        </div>`;
    });
    ul.innerHTML = htmlContatos;
}

function popularCongregacoes() {
    const selectAtt = document.getElementById('attCongregacao');
    if (!selectAtt) return;

    const unicas = new Set();
    contatosDB.forEach(c => unicas.add(getCongregacao(c)));

    let htmlSelects = '';
    Array.from(unicas).sort().forEach(cong => htmlSelects += `<option value="${cong}">${cong}</option>`);

    selectAtt.innerHTML = htmlSelects;
}

function obterHorariosPossiveisDoDia(dia) {
    const locais = padraoSemanal[dia]; const todosTurnos = [];
    locais.forEach(l => { l.turnos.forEach(t => { if (!todosTurnos.includes(t)) todosTurnos.push(t); }) });
    return todosTurnos;
}

function construirGridHorarios(containerId, checkboxClass) {
    const container = document.getElementById(containerId);
    let htmlGrid = '';
    const diasOrdenados = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    diasOrdenados.forEach(dia => {
        let htmlHorarios = '';
        if (dia === "Sábado" || dia === "Domingo") {
            const periodos = ["Manhã (08h às 13h)", "Tarde (12h às 17h)"];
            htmlHorarios = periodos.map(p => `<label><input type="checkbox" class="${checkboxClass}" data-dia="${dia}" value="${p}"> ${p}</label>`).join('');
        } else {
            const horarios = obterHorariosPossiveisDoDia(dia);
            htmlHorarios = horarios.map(h => `<label><input type="checkbox" class="${checkboxClass}" data-dia="${dia}" value="${h}"> ${h}</label>`).join('');
        }
        htmlGrid += `<div class="disp-day"><span class="day-title">${dia}</span><div class="disp-hours">${htmlHorarios}</div></div>`;
    });
    container.innerHTML = htmlGrid;
}

window.onload = () => {
    carregarDadosDaNuvem();
    const ajustarSpacer = () => {
        const banner = document.getElementById('updateBannerMobile');
        const spacer = document.querySelector('.banner-spacer');
        if (banner && spacer) {
            const h = banner.offsetHeight;
            if (h > 0) spacer.style.height = h + 'px';
        }
    };
    ajustarSpacer();
    window.addEventListener('resize', ajustarSpacer);
};

let locaisCache = [];

function renderizarLocaisPublico() {
    const container = document.getElementById('listaLocaisPublico');
    const empty = document.getElementById('locaisEmptyState');
    if (!container) return;

    if (!locaisCache.length) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'flex';
        return;
    }
    if (empty) empty.style.display = 'none';

    container.innerHTML = `<div class="locais-grid">${locaisCache.map(loc => `
        <div class="local-name-card" onclick="abrirLocalModal('${loc.id}')">
            <div class="local-name-card-icon">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div class="local-name-card-text">
                <div class="local-name-card-nome">${escHtml(loc.nome)}</div>
                ${loc.apoioNome ? `<div class="local-name-card-hint">Apoio: ${escHtml(loc.apoioNome)}</div>` : ''}
            </div>
            <svg class="local-name-card-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>`).join('')
        }</div>`;
}

function abrirLocalModal(id) {
    const loc = locaisCache.find(l => l.id === id);
    if (!loc) return;

    document.getElementById('modalLocalNome').innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        ${escHtml(loc.nome)}`;

    let html = '';

    if (loc.endereco) {
        html += `
        <p class="ml-section-label">📍 Local de Trabalho</p>
        <div class="ml-address-row">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span class="ml-address-text">${escHtml(loc.endereco)}</span>
        </div>`;
    }
    if (loc.mapsLink) {
        html += `<a class="ml-maps-btn" href="${loc.mapsLink}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            Abrir Rota no Maps
        </a>`;
    }
    if (loc.mapsEmbed) {
        html += `<div class="ml-embed"><iframe src="${loc.mapsEmbed}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
    }

    if (loc.apoioNome || loc.apoioEndereco) {
        html += `<hr class="ml-divider"><div class="ml-apoio-block">
            <div class="ml-apoio-chip">🏠 Ponto de Apoio</div>
            <div class="ml-apoio-titulo">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                ${loc.apoioNome ? escHtml(loc.apoioNome) : ''}
            </div>`;
        if (loc.apoioEndereco) {
            html += `<div class="ml-address-row">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span class="ml-address-text">${escHtml(loc.apoioEndereco)}</span>
            </div>`;
        }
        if (loc.apoioMapsLink) {
            html += `<a class="ml-maps-btn" href="${loc.apoioMapsLink}" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                Abrir Rota no Maps
            </a>`;
        }
        if (loc.apoioMapsEmbed) {
            html += `<div class="ml-embed"><iframe src="${loc.apoioMapsEmbed}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
        }
        html += `</div>`;
    }

    document.getElementById('modalLocalBody').innerHTML = html;
    abrirModal('modalLocalDetalhe');
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
