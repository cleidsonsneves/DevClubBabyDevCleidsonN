// ===== DADOS INICIAIS =====
const empresaDefault = {
    id: 1,
    nome: "DevRec",
    cnpj: "00.000.000/0001-01",
    endereco: "",
    responsavel: "Cleidson Neves",
    cargo: "Diretor",
    telefone: "",
    email: "",
    ativa: true
};

// ===== VARIÁVEIS GLOBAIS =====
let empresasCadastradas = JSON.parse(localStorage.getItem('empresas') || '[]');
let empresaAtiva = null;
let recibosSalvos = JSON.parse(localStorage.getItem('recibos') || '[]');
let logoEmpresa = localStorage.getItem('logoEmpresa') || '';
let editandoReciboId = null;
let editandoEmpresaId = null;

// ===== INICIALIZAÇÃO =====
if (empresasCadastradas.length === 0) {
    empresasCadastradas.push(empresaDefault);
    localStorage.setItem('empresas', JSON.stringify(empresasCadastradas));
}
empresaAtiva = empresasCadastradas.find(e => e.ativa) || empresasCadastradas[0];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('dataRecibo').value = new Date().toISOString().split('T')[0];
    
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    document.getElementById('filterDataInicio').value = mesPassado.toISOString().split('T')[0];
    document.getElementById('filterDataFim').value = hoje.toISOString().split('T')[0];
    
    updateValorExtenso();
    atualizarVisualizacaoPlanilha();
    carregarTabelaEmpresas();
    atualizarHeaderEmpresa();
    
    if (logoEmpresa) {
        document.getElementById('logoPreviewSmall').src = logoEmpresa;
        document.getElementById('logoPreviewSmall').style.display = 'block';
        document.getElementById('removeLogoBtn').style.display = 'inline-block';
    }
});

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function showTab(tabName, element) {
    document.getElementById('createTab').style.display = tabName === 'create' ? 'block' : 'none';
    document.getElementById('empresaTab').style.display = tabName === 'empresa' ? 'block' : 'none';
    document.getElementById('spreadsheetTab').style.display = tabName === 'spreadsheet' ? 'block' : 'none';
    document.getElementById('reportTab').style.display = tabName === 'report' ? 'block' : 'none';
    
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    if (element) element.classList.add('active');
    
    if (tabName === 'empresa') carregarTabelaEmpresas();
    if (tabName === 'spreadsheet') atualizarVisualizacaoPlanilha();
    if (tabName === 'report') gerarRelatorio();
}

function atualizarHeaderEmpresa() {
    document.getElementById('headerEmpresaNome').textContent = 
        `${empresaAtiva.nome} • Gestão Inteligente de Documentos`;
}

// ===== FUNÇÕES DE EMPRESA =====
function salvarEmpresa() {
    const nome = document.getElementById('empresaNome').value;
    const cnpj = document.getElementById('empresaCnpj').value;
    
    if (!nome || !cnpj) {
        alert('⚠️ Nome e CNPJ são obrigatórios!');
        return;
    }

    const empresa = {
        id: editandoEmpresaId || Date.now(),
        nome: nome,
        cnpj: cnpj,
        endereco: document.getElementById('empresaEndereco').value,
        responsavel: document.getElementById('empresaResponsavel').value,
        cargo: document.getElementById('empresaCargo').value,
        telefone: document.getElementById('empresaTelefone').value,
        email: document.getElementById('empresaEmail').value,
        ativa: editandoEmpresaId ? (empresasCadastradas.find(e => e.id === editandoEmpresaId)?.ativa || false) : false
    };

    if (editandoEmpresaId) {
        const index = empresasCadastradas.findIndex(e => e.id === editandoEmpresaId);
        if (index !== -1) {
            empresa.ativa = empresasCadastradas[index].ativa;
            empresasCadastradas[index] = empresa;
        }
        editandoEmpresaId = null;
        alert('✅ Empresa atualizada com sucesso!');
    } else {
        empresasCadastradas.push(empresa);
        alert('✅ Empresa cadastrada com sucesso!');
    }

    localStorage.setItem('empresas', JSON.stringify(empresasCadastradas));
    limparFormularioEmpresa();
    carregarTabelaEmpresas();
}

function editarEmpresa(id) {
    const empresa = empresasCadastradas.find(e => e.id === id);
    if (empresa) {
        editandoEmpresaId = id;
        document.getElementById('empresaNome').value = empresa.nome;
        document.getElementById('empresaCnpj').value = empresa.cnpj;
        document.getElementById('empresaEndereco').value = empresa.endereco || '';
        document.getElementById('empresaResponsavel').value = empresa.responsavel || '';
        document.getElementById('empresaCargo').value = empresa.cargo || '';
        document.getElementById('empresaTelefone').value = empresa.telefone || '';
        document.getElementById('empresaEmail').value = empresa.email || '';
        
        document.getElementById('empresaTab').scrollIntoView({ behavior: 'smooth' });
    }
}

function excluirEmpresa(id) {
    if (empresasCadastradas.length <= 1) {
        alert('⚠️ Não é possível excluir a única empresa cadastrada!');
        return;
    }
    
    if (confirm('⚠️ Tem certeza que deseja excluir esta empresa?')) {
        const empresaExcluida = empresasCadastradas.find(e => e.id === id);
        empresasCadastradas = empresasCadastradas.filter(e => e.id !== id);
        
        if (empresaExcluida?.ativa && empresasCadastradas.length > 0) {
            empresasCadastradas[0].ativa = true;
            empresaAtiva = empresasCadastradas[0];
            atualizarHeaderEmpresa();
        }
        
        localStorage.setItem('empresas', JSON.stringify(empresasCadastradas));
        carregarTabelaEmpresas();
        alert('🗑️ Empresa excluída com sucesso!');
    }
}

function ativarEmpresa(id) {
    empresasCadastradas.forEach(e => e.ativa = false);
    const empresa = empresasCadastradas.find(e => e.id === id);
    if (empresa) {
        empresa.ativa = true;
        empresaAtiva = empresa;
        localStorage.setItem('empresas', JSON.stringify(empresasCadastradas));
        carregarTabelaEmpresas();
        atualizarHeaderEmpresa();
        alert(`✅ Empresa "${empresa.nome}" ativada! Os recibos usarão estes dados.`);
    }
}

function carregarTabelaEmpresas() {
    const tbody = document.getElementById('empresaTableBody');
    
    if (empresasCadastradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;">📭 Nenhuma empresa cadastrada</td></tr>';
        return;
    }

    tbody.innerHTML = empresasCadastradas.map(e => `
        <tr>
            <td>
                <strong>${e.nome}</strong>
                ${e.ativa ? ' <span class="empresa-ativa">ATIVA</span>' : ''}
            </td>
            <td>${e.cnpj}</td>
            <td>${e.responsavel || '-'}</td>
            <td>${e.cargo || '-'}</td>
            <td>${e.telefone || '-'}</td>
            <td>
                ${e.ativa ? 
                    '<span class="empresa-ativa">Em uso</span>' : 
                    '<span class="empresa-inativa">Inativa</span>'}
            </td>
            <td class="actions-cell">
                <button class="btn btn-info btn-sm" onclick="editarEmpresa(${e.id})" title="Editar">✏️</button>
                ${!e.ativa ? `<button class="btn btn-success btn-sm" onclick="ativarEmpresa(${e.id})" title="Ativar">✅</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="excluirEmpresa(${e.id})" title="Excluir">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function limparFormularioEmpresa() {
    document.getElementById('empresaNome').value = '';
    document.getElementById('empresaCnpj').value = '';
    document.getElementById('empresaEndereco').value = '';
    document.getElementById('empresaResponsavel').value = '';
    document.getElementById('empresaCargo').value = '';
    document.getElementById('empresaTelefone').value = '';
    document.getElementById('empresaEmail').value = '';
    editandoEmpresaId = null;
}

// ===== FUNÇÕES DO RECIBO =====
function updateReciboForm() {
    const tipo = document.getElementById('reciboType').value;
    const textos = {
        'premiacao': {
            referente: 'premiação concedida por meta atingida, conforme critérios internos da empresa',
            observacoes: 'Declaro estar ciente de que este valor tem caráter premial, não se incorporando ao salário nem gerando quaisquer direitos trabalhistas, previdenciários ou fundiários, conforme previsto no artigo 457, §4º da CLT.'
        },
        'pagamento': {
            referente: 'pagamento de serviços prestados',
            observacoes: 'Declaro ter recebido o valor acima especificado, dando plena quitação dos serviços prestados até a presente data.'
        },
        'adiantamento': {
            referente: 'adiantamento de despesas',
            observacoes: 'Comprometo-me a prestar contas do valor adiantado no prazo de 30 dias, mediante apresentação de comprovantes.'
        },
        'reembolso': {
            referente: 'reembolso de despesas',
            observacoes: 'Declaro que as despesas reembolsadas foram realizadas em benefício da empresa, conforme comprovantes em anexo.'
        }
    };
    
    if (textos[tipo]) {
        document.getElementById('referente').value = textos[tipo].referente;
        document.getElementById('observacoes').value = textos[tipo].observacoes;
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ Arquivo muito grande! Máx: 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            logoEmpresa = e.target.result;
            localStorage.setItem('logoEmpresa', logoEmpresa);
            document.getElementById('logoPreviewSmall').src = logoEmpresa;
            document.getElementById('logoPreviewSmall').style.display = 'block';
            document.getElementById('removeLogoBtn').style.display = 'inline-block';
            if (document.getElementById('reciboPreview').style.display === 'block') gerarRecibo();
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    logoEmpresa = '';
    localStorage.removeItem('logoEmpresa');
    document.getElementById('logoPreviewSmall').style.display = 'none';
    document.getElementById('removeLogoBtn').style.display = 'none';
    document.getElementById('logoUpload').value = '';
}

function valorPorExtenso(valor) {
    if (valor === 0) return 'ZERO REAIS';
    const unidades = ['', 'UM', 'DOIS', 'TRÊS', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE'];
    const dezenas = ['', 'DEZ', 'VINTE', 'TRINTA', 'QUARENTA', 'CINQUENTA', 'SESSENTA', 'SETENTA', 'OITENTA', 'NOVENTA'];
    const centenas = ['', 'CENTO', 'DUZENTOS', 'TREZENTOS', 'QUATROCENTOS', 'QUINHENTOS', 'SEISCENTOS', 'SETECENTOS', 'OITOCENTOS', 'NOVECENTOS'];
    const especiais = {10: 'DEZ', 11: 'ONZE', 12: 'DOZE', 13: 'TREZE', 14: 'QUATORZE', 15: 'QUINZE', 16: 'DEZESSEIS', 17: 'DEZESSETE', 18: 'DEZOITO', 19: 'DEZENOVE'};

    function converterNumero(num) {
        if (num === 0) return '';
        if (num === 1) return 'UM';
        if (num === 100) return 'CEM';
        let resultado = '';
        if (num >= 1000) {
            const milhar = Math.floor(num / 1000);
            resultado += (milhar === 1 ? 'MIL ' : converterNumero(milhar) + ' MIL ');
            num %= 1000;
        }
        if (num >= 100) { resultado += centenas[Math.floor(num / 100)] + ' '; num %= 100; }
        if (num >= 10 && num <= 19) return (resultado + especiais[num]).trim();
        if (num >= 20) {
            resultado += dezenas[Math.floor(num / 10)] + ' ';
            num %= 10;
            if (num > 0) resultado += 'E ';
        }
        if (num > 0) resultado += unidades[num] + ' ';
        return resultado.trim();
    }

    const partes = valor.toFixed(2).split('.');
    const reais = parseInt(partes[0]);
    const centavos = parseInt(partes[1]);
    let extenso = converterNumero(reais) + ' REAIS';
    if (centavos > 0) extenso += ' E ' + converterNumero(centavos) + ' CENTAVOS';
    return extenso;
}

function updateValorExtenso() {
    document.getElementById('valorExtenso').value = valorPorExtenso(parseFloat(document.getElementById('valorRecibo').value) || 0);
}

function formatarValorBR(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function gerarRecibo() {
    const tipo = document.getElementById('reciboType').value;
    const nome = document.getElementById('nomeRecebedor').value;
    const cpf = document.getElementById('cpfRecebedor').value;
    const valor = parseFloat(document.getElementById('valorRecibo').value) || 0;
    const extenso = document.getElementById('valorExtenso').value;
    const referente = document.getElementById('referente').value;
    const data = document.getElementById('dataRecibo').value;
    const formaPagamento = document.getElementById('formaPagamento').value;
    const observacoes = document.getElementById('observacoes').value;
    
    if (!nome || !cpf || !valor || !data) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }

    const simboloMoeda = valor === 1800 ? '$' : 'R$';
    const valorFormatado = formatarValorBR(valor);
    const logoHTML = logoEmpresa ? `<div class="recibo-logo"><img src="${logoEmpresa}" alt="Logo"></div>` : '';
    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

    document.getElementById('reciboContent').innerHTML = `
        <div class="recibo-header">
            <div class="recibo-title">RECIBO DE ${tipo.toUpperCase()}</div>
            ${logoHTML}
        </div>
        <div class="company-info">
            <p><strong>Empresa:</strong> ${empresaAtiva.nome}</p>
            <p><strong>CNPJ:</strong> ${empresaAtiva.cnpj}</p>
            <p><strong>Endereço:</strong> ${empresaAtiva.endereco}</p>
        </div>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p>Eu, <strong>${nome}</strong>, inscrito(a) no <strong>CPF nº ${cpf}</strong>, declaro, para os devidos fins, que recebi da empresa <strong>${empresaAtiva.nome}</strong> o valor de <span class="value-highlight">${simboloMoeda} ${valorFormatado} (${extenso})</span>, referente à ${referente}.</p>
        <p>${observacoes}</p>
        <p><strong>Forma de pagamento:</strong></p>
        <p>
            (${formaPagamento === 'transferencia' ? 'X' : ' '}) Transferência bancária &nbsp;&nbsp;
            (${formaPagamento === 'dinheiro' ? 'X' : ' '}) Dinheiro &nbsp;&nbsp;
            (${formaPagamento === 'cartao' ? 'X' : ' '}) Cartão &nbsp;&nbsp;
            (${formaPagamento === 'pix' ? 'X' : ' '}) PIX
        </p>
        <div class="signature-area">
            <div class="signature-line">
                <p>_________________________________________</p>
                <p><strong>Assinatura do Recebedor</strong></p>
                <p>${nome}</p>
            </div>
        </div>
    `;
    document.getElementById('reciboPreview').style.display = 'block';
    document.getElementById('reciboPreview').scrollIntoView({ behavior: 'smooth' });
}

function salvarRecibo() {
    const nome = document.getElementById('nomeRecebedor').value;
    const cpf = document.getElementById('cpfRecebedor').value;
    const valor = parseFloat(document.getElementById('valorRecibo').value) || 0;
    const data = document.getElementById('dataRecibo').value;
    
    if (!nome || !cpf || !valor || !data) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }

    const recibo = {
        id: editandoReciboId || Date.now(),
        tipo: document.getElementById('reciboType').value,
        nome, cpf, valor,
        extenso: document.getElementById('valorExtenso').value,
        referente: document.getElementById('referente').value,
        data,
        formaPagamento: document.getElementById('formaPagamento').value,
        observacoes: document.getElementById('observacoes').value,
        empresaId: empresaAtiva.id,
        dataCriacao: new Date().toISOString()
    };

    if (editandoReciboId) {
        const index = recibosSalvos.findIndex(r => r.id === editandoReciboId);
        if (index !== -1) recibosSalvos[index] = recibo;
        editandoReciboId = null;
        alert('✅ Recibo atualizado!');
    } else {
        recibosSalvos.push(recibo);
        alert('✅ Recibo salvo!');
    }

    localStorage.setItem('recibos', JSON.stringify(recibosSalvos));
    limparFormulario();
    atualizarVisualizacaoPlanilha();
}

function limparFormulario() {
    document.getElementById('reciboType').value = 'premiacao';
    document.getElementById('nomeRecebedor').value = '';
    document.getElementById('cpfRecebedor').value = '';
    document.getElementById('valorRecibo').value = '';
    document.getElementById('valorExtenso').value = '';
    document.getElementById('dataRecibo').value = new Date().toISOString().split('T')[0];
    document.getElementById('formaPagamento').value = 'transferencia';
    document.getElementById('reciboPreview').style.display = 'none';
    editandoReciboId = null;
    updateReciboForm();
}

function imprimirRecibo() {
    if (document.getElementById('reciboPreview').style.display === 'none') {
        alert('⚠️ Visualize o recibo antes de imprimir!');
        return;
    }
    window.print();
}

function imprimirRelatorio() {
    // Verificar se há dados
    if (recibosSalvos.length === 0) {
        alert('⚠️ Não há recibos para gerar o relatório!');
        return;
    }

    // Gerar o relatório primeiro
    gerarRelatorio();
    
    // Aguardar o DOM atualizar e depois imprimir
    setTimeout(function() {
        // Salvar estado atual das abas
        const createTabDisplay = document.getElementById('createTab').style.display;
        const empresaTabDisplay = document.getElementById('empresaTab').style.display;
        const spreadsheetTabDisplay = document.getElementById('spreadsheetTab').style.display;
        const reportTabDisplay = document.getElementById('reportTab').style.display;
        
        // Garantir que apenas a aba de relatório está visível
        document.getElementById('createTab').style.display = 'none';
        document.getElementById('empresaTab').style.display = 'none';
        document.getElementById('spreadsheetTab').style.display = 'none';
        document.getElementById('reportTab').style.display = 'block';
        
        // Imprimir
        window.print();
        
        // Restaurar estado original após impressão
        setTimeout(function() {
            document.getElementById('createTab').style.display = createTabDisplay;
            document.getElementById('empresaTab').style.display = empresaTabDisplay;
            document.getElementById('spreadsheetTab').style.display = spreadsheetTabDisplay;
            document.getElementById('reportTab').style.display = reportTabDisplay;
        }, 500);
        
    }, 500);
}

// ===== FUNÇÕES DA PLANILHA =====
function atualizarVisualizacaoPlanilha() {
    const tbody = document.getElementById('spreadsheetBody');
    if (recibosSalvos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;">📭 Nenhum registro</td></tr>';
    } else {
        tbody.innerHTML = recibosSalvos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)).map(r => `
            <tr>
                <td>#${r.id.toString().slice(-6)}</td>
                <td>${new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td>${r.tipo}</td>
                <td>${r.nome}</td>
                <td>${r.cpf}</td>
                <td style="color:#10b981;font-weight:600;">R$ ${formatarValorBR(r.valor)}</td>
                <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.referente}">${r.referente}</td>
                <td>${r.formaPagamento}</td>
                <td>${new Date(r.dataCriacao).toLocaleDateString('pt-BR')}</td>
                <td class="actions-cell">
                    <button class="btn btn-info btn-sm" onclick="visualizarRecibo(${r.id})">👁️</button>
                    <button class="btn btn-warning btn-sm" onclick="editarRecibo(${r.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirRecibo(${r.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }
    document.getElementById('totalRecibos').textContent = recibosSalvos.length;
    const total = recibosSalvos.reduce((s, r) => s + r.valor, 0);
    document.getElementById('valorTotal').textContent = `R$ ${formatarValorBR(total)}`;
    document.getElementById('ultimoRecibo').textContent = recibosSalvos.length > 0 ? new Date(recibosSalvos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))[0].dataCriacao).toLocaleDateString('pt-BR') : '-';
}

function exportarCSV() {
    if (recibosSalvos.length === 0) { alert('⚠️ Nenhum recibo para exportar!'); return; }
    const headers = ['ID', 'Data Recibo', 'Tipo', 'Nome', 'CPF', 'Valor', 'Extenso', 'Referente', 'Forma Pagamento', 'Observações', 'Data Criação'];
    const rows = recibosSalvos.map(r => [r.id, r.data, r.tipo, r.nome, r.cpf, r.valor.toFixed(2), r.extenso, r.referente.replace(/,/g, ';'), r.formaPagamento, (r.observacoes || '').replace(/,/g, ';'), r.dataCriacao]);
    let csv = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recibos_${empresaAtiva.nome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    alert('✅ Planilha exportada!');
}

function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split('\n').filter(l => l.trim());
        if (linhas.length < 2) { alert('⚠️ Planilha inválida!'); return; }
        const dados = linhas.slice(1).map(l => {
            const c = l.split(',');
            return { id: parseInt(c[0]) || Date.now(), data: c[1], tipo: c[2], nome: c[3], cpf: c[4], valor: parseFloat(c[5]) || 0, extenso: c[6] || '', referente: (c[7] || '').replace(/;/g, ','), formaPagamento: c[8] || 'transferencia', observacoes: (c[9] || '').replace(/;/g, ','), dataCriacao: c[10] || new Date().toISOString(), empresaId: empresaAtiva.id };
        });
        if (confirm(`${dados.length} recibos encontrados.\nOK = Substituir\nCancelar = Adicionar`)) {
            recibosSalvos = dados;
        } else {
            dados.forEach(n => { if (!recibosSalvos.find(r => r.id === n.id)) recibosSalvos.push(n); });
        }
        localStorage.setItem('recibos', JSON.stringify(recibosSalvos));
        atualizarVisualizacaoPlanilha();
        alert(`✅ ${dados.length} recibos importados!`);
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
}

function limparPlanilha() {
    if (recibosSalvos.length === 0) { alert('📭 Planilha já está vazia!'); return; }
    if (confirm(`⚠️ Excluir TODOS os ${recibosSalvos.length} recibos?`)) {
        exportarCSV();
        recibosSalvos = [];
        localStorage.setItem('recibos', JSON.stringify(recibosSalvos));
        atualizarVisualizacaoPlanilha();
        alert('🗑️ Planilha limpa! Backup salvo.');
    }
}

function visualizarRecibo(id) {
    const r = recibosSalvos.find(r => r.id === id);
    if (r) {
        document.getElementById('reciboType').value = r.tipo;
        document.getElementById('nomeRecebedor').value = r.nome;
        document.getElementById('cpfRecebedor').value = r.cpf;
        document.getElementById('valorRecibo').value = r.valor;
        document.getElementById('valorExtenso').value = r.extenso;
        document.getElementById('referente').value = r.referente;
        document.getElementById('dataRecibo').value = r.data;
        document.getElementById('formaPagamento').value = r.formaPagamento;
        document.getElementById('observacoes').value = r.observacoes || '';
        gerarRecibo();
        showTab('create', document.querySelectorAll('.tab')[0]);
    }
}

function editarRecibo(id) {
    editandoReciboId = id;
    visualizarRecibo(id);
    alert('✏️ Edite e clique em "Salvar na Planilha"');
}

function excluirRecibo(id) {
    if (confirm('⚠️ Excluir este recibo?')) {
        recibosSalvos = recibosSalvos.filter(r => r.id !== id);
        localStorage.setItem('recibos', JSON.stringify(recibosSalvos));
        atualizarVisualizacaoPlanilha();
        alert('🗑️ Recibo excluído!');
    }
}

// ===== FUNÇÕES DE RELATÓRIO =====
function gerarRelatorio() {
    const dataInicio = document.getElementById('filterDataInicio').value;
    const dataFim = document.getElementById('filterDataFim').value;
    const tipoFiltro = document.getElementById('filterTipo').value;

    let recibosFiltrados = [...recibosSalvos];

    if (dataInicio) recibosFiltrados = recibosFiltrados.filter(r => r.data >= dataInicio);
    if (dataFim) recibosFiltrados = recibosFiltrados.filter(r => r.data <= dataFim);
    if (tipoFiltro !== 'todos') recibosFiltrados = recibosFiltrados.filter(r => r.tipo === tipoFiltro);

    recibosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));

    const totalRecibos = recibosFiltrados.length;
    const valorTotal = recibosFiltrados.reduce((s, r) => s + r.valor, 0);
    const mediaValor = totalRecibos > 0 ? valorTotal / totalRecibos : 0;
    const maiorValor = totalRecibos > 0 ? Math.max(...recibosFiltrados.map(r => r.valor)) : 0;

    document.getElementById('rTotalRecibos').textContent = totalRecibos;
    document.getElementById('rValorTotal').textContent = `R$ ${formatarValorBR(valorTotal)}`;
    document.getElementById('rMediaValor').textContent = `R$ ${formatarValorBR(mediaValor)}`;
    document.getElementById('rMaiorValor').textContent = `R$ ${formatarValorBR(maiorValor)}`;

    const tipos = ['premiacao', 'pagamento', 'adiantamento', 'reembolso'];
    const maxTipo = Math.max(1, ...tipos.map(t => recibosFiltrados.filter(r => r.tipo === t).length));
    document.getElementById('chartPorTipo').innerHTML = tipos.map(t => {
        const qtd = recibosFiltrados.filter(r => r.tipo === t).length;
        const pct = (qtd / maxTipo * 100).toFixed(0);
        return `<div class="bar-item"><span class="bar-label">${t}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%">${qtd}</div></div></div>`;
    }).join('');

    const meses = {};
    recibosFiltrados.forEach(r => {
        const mes = r.data.substring(0, 7);
        if (!meses[mes]) meses[mes] = 0;
        meses[mes] += r.valor;
    });
    const maxMes = Math.max(1, ...Object.values(meses));
    document.getElementById('chartPorMes').innerHTML = Object.entries(meses).sort().map(([mes, valor]) => {
        const pct = (valor / maxMes * 100).toFixed(0);
        const nomeMes = new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return `<div class="bar-item"><span class="bar-label">${nomeMes}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%">R$ ${formatarValorBR(valor)}</div></div></div>`;
    }).join('');

    document.getElementById('reportTableBody').innerHTML = recibosFiltrados.length > 0 ?
        recibosFiltrados.map(r => `
            <tr>
                <td>${new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td>${r.tipo}</td>
                <td>${r.nome}</td>
                <td>${r.cpf}</td>
                <td style="color:#10b981;font-weight:600;">R$ ${formatarValorBR(r.valor)}</td>
                <td>${r.formaPagamento}</td>
            </tr>
        `).join('') :
        '<tr><td colspan="6" style="text-align:center;padding:30px;">Nenhum recibo no período</td></tr>';

    const menorValor = totalRecibos > 0 ? Math.min(...recibosFiltrados.map(r => r.valor)) : 0;
    document.getElementById('sTotalRecibos').textContent = totalRecibos;
    document.getElementById('sValorTotal').textContent = `R$ ${formatarValorBR(valorTotal)}`;
    document.getElementById('sMediaValor').textContent = `R$ ${formatarValorBR(mediaValor)}`;
    document.getElementById('sMaiorValor').textContent = `R$ ${formatarValorBR(maiorValor)}`;
    document.getElementById('sMenorValor').textContent = `R$ ${formatarValorBR(menorValor)}`;
    
    const periodoTexto = dataInicio && dataFim ? 
        `${new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}` :
        'Todo o período';
    document.getElementById('sPeriodo').textContent = periodoTexto;
}