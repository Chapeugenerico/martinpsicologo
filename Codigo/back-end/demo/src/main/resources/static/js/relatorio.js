// Variáveis globais
let psicologoId = null;
let despesasAtuais = [];
let mesSelecionado = '';
let anoSelecionado = '';

// Função para formatar valor monetário
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}


// Função para limpar campos de despesas
function limparCamposDespesas() {
    document.getElementById('energia').value = 'R$ 0,00';
    document.getElementById('internet').value = 'R$ 0,00';
    document.getElementById('outros').value = 'R$ 0,00';
    document.getElementById('taxa').value = '0 %';
    atualizarTotalDespesas();
}

// Função para preencher os selects de mês e ano no modal de adicionar
function preencherSelectsAdicionar() {
    const mesSelect = document.getElementById('mesAdicionar');
    const anoSelect = document.getElementById('anoAdicionar');

    // Limpar selects
    mesSelect.innerHTML = '<option value="">Selecione o mês</option>';
    anoSelect.innerHTML = '<option value="">Selecione o ano</option>';

    // Preencher meses
    // Preencher meses
    const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
];

meses.forEach(mes => {
    const option = document.createElement('option');
    option.value = mes.valor;
    option.textContent = mes.nome;
    mesSelect.appendChild(option);
});

    // Preencher anos (últimos 5 anos)
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= anoAtual - 4; ano--) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        anoSelect.appendChild(option);
    }
}

// Função para abrir o modal de adicionar despesa
function abrirModalAdicionar() {
    const modal = document.getElementById('modalAdicionarDespesa');
    preencherSelectsAdicionar();
    modal.style.display = "block";
}

// Função para fechar o modal de adicionar
function fecharModalAdicionar() {
    const modal = document.getElementById('modalAdicionarDespesa');
    modal.style.display = "none";
}

// Função para salvar as novas despesas
async function salvarNovaDespesa() {
    const mes = document.getElementById('mesAdicionar').value;
    const ano = parseInt(document.getElementById('anoAdicionar').value);
    const energia = parseFloat(document.getElementById('energiaAdicionar').value) || 0;
    const internet = parseFloat(document.getElementById('internetAdicionar').value) || 0;
    const outros = parseFloat(document.getElementById('outrosAdicionar').value) || 0;
    const taxa = parseFloat(document.getElementById('taxaAdicionar').value) || 0;

    if (!mes || !ano) {
        alert('Por favor, selecione mês e ano.');
        return;
    }

    if (taxa < 0 || taxa > 100) {
        alert('A taxa deve estar entre 0% e 100%');
        return;
    }

    const despesas = [
        {
            categoria: 'Energia',
            valor: energia,
            taxaDespesa: taxa,
            mes: mes,
            ano: ano,
            psicologoId: psicologoId 
        },
        {
            categoria: 'Internet',
            valor: internet,
            taxaDespesa: taxa,
            mes: mes,
            ano: ano
        },
        {
            categoria: 'Outros',
            valor: outros,
            taxaDespesa: taxa,
            mes: mes,
            ano: ano
        }
    ];

    try {
        const response = await fetch('http://localhost:8080/api/despesas/salvar-mes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(despesas)
        });

        if (response.ok) {
            const despesasSalvas = await response.json();
            console.log('Despesas salvas com sucesso:', despesasSalvas);
            alert('Despesas adicionadas com sucesso!');
            fecharModalAdicionar();

            // Se o mês e ano salvos forem os mesmos que estão atualmente selecionados, recarregue as despesas
            if (mes === mesSelecionado && ano === anoSelecionado) {
                await carregarDespesas(mes, ano);
            }
        } else {
            const errorText = await response.text();
            throw new Error(`Erro do servidor: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar despesas. Por favor, tente novamente. ' + error.message);
    }
}

// Função para atualizar o total de despesas
function atualizarTotalDespesas() {
    const energia = parseFloat(document.getElementById('energia').value.replace('R$ ', '').replace(',', '.')) || 0;
    const internet = parseFloat(document.getElementById('internet').value.replace('R$ ', '').replace(',', '.')) || 0;
    const outros = parseFloat(document.getElementById('outros').value.replace('R$ ', '').replace(',', '.')) || 0;
    
    const total = energia + internet + outros;
    document.querySelector('.total').textContent = `Total: ${formatarMoeda(total)}`;
}

// Função para salvar despesas
// Função para salvar despesas (EDIÇÃO)
async function salvarDespesas() {
    try {
        const energia = parseFloat(energiaModal.value) || 0;
        const internet = parseFloat(internetModal.value) || 0;
        const outros = parseFloat(outrosModal.value) || 0;
        const taxa = parseFloat(taxaModal.value) || 0;

        // Validar a taxa
        if (taxa < 0 || taxa > 100) {
            alert('A taxa deve estar entre 0% e 100%');
            return;
        }

        const despesas = [
            {
                categoria: 'Energia',
                valor: energia,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            },
            {
                categoria: 'Internet',
                valor: internet,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            },
            {
                categoria: 'Outros',
                valor: outros,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            }
        ];

        const response = await fetch('http://localhost:8080/api/despesas/salvar-mes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(despesas)
        });

        if (response.ok) {
            const despesasSalvas = await response.json();
            console.log('Despesas salvas com sucesso:', despesasSalvas);
            alert('Despesas atualizadas com sucesso!');
            
            // Atualizar a interface
            energiaInput.value = formatarMoeda(energia);
            internetInput.value = formatarMoeda(internet);
            outrosInput.value = formatarMoeda(outros);
            taxaInput.value = formatarPercentual(taxa);
            
            // Recalcular totais
            atualizarTotalDespesas();
            
            fecharModal();
        } else {
            const errorText = await response.text();
            throw new Error(`Erro do servidor: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar despesas. Por favor, tente novamente. ' + error.message);
    }
}

// Função para preencher os selects de mês e ano
function preencherSelectsDatas() {
    const mesesSelect = document.getElementById('meses');
    const anosSelect = document.getElementById('anos');

    // Limpar selects
    mesesSelect.innerHTML = '<option value="">meses</option>';
    anosSelect.innerHTML = '<option value="">anos</option>';

    // Preencher meses
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    meses.forEach((mes, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = mes;
        mesesSelect.appendChild(option);
    });

    // Preencher anos (últimos 5 anos)
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= anoAtual - 4; ano--) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        anosSelect.appendChild(option);
    }
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar percentual
function formatarPercentual(valor) {
    return `${valor}%`;
}

// Função para formatar tempo (hh:mm)
function formatarTempo(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

async function deletarDespesasExistentes(mes, ano) {
    try {
        const response = await fetch(`http://localhost:8080/api/despesas?mes=${mes}&ano=${ano}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Erro ao deletar despesas existentes');
        }
    } catch (error) {
        console.error('Erro ao deletar despesas existentes:', error);
        throw error;
    }
}

// Função para carregar despesas do mês
async function carregarDespesas(mes, ano) {
    try {
        const response = await fetch(`http://localhost:8080/api/despesas/filtro?mes=${mes}&ano=${ano}`);if (response.ok) {
            const despesas = await response.json();
            // Limpar campos
            document.getElementById('energia').value = 'R$ 0,00';
            document.getElementById('internet').value = 'R$ 0,00';
            document.getElementById('outros').value = 'R$ 0,00';
            document.getElementById('taxa').value = '0 %';

            // Preencher com os dados encontrados
            despesas.forEach(despesa => {
                if (despesa.categoria === 'Energia') {
                    document.getElementById('energia').value = formatarMoeda(despesa.valor);
                } else if (despesa.categoria === 'Internet') {
                    document.getElementById('internet').value = formatarMoeda(despesa.valor);
                } else if (despesa.categoria === 'Outros') {
                    document.getElementById('outros').value = formatarMoeda(despesa.valor);
                }
                // A taxa é a mesma para todas, então pegamos a primeira
                if (despesa.taxaDespesa) {
                    document.getElementById('taxa').value = formatarPercentual(despesa.taxaDespesa);
                }
            });

            // Recalcular o total
            atualizarTotalDespesas();
        } else {
            console.error('Erro ao carregar despesas');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function gerarDataISO(ano, mes, dia) {
  // Garante que mês e dia tenham dois dígitos
  const mesFormatado = String(mes).padStart(2, '0');
  const diaFormatado = String(dia).padStart(2, '0');

  // Monta a string no formato ISO, eu odeio javaScript
  const dataInicio = `${ano}-${mesFormatado}-${diaFormatado}`;
  return dataInicio;
}

// Função para carregar dados das sessões do mês
async function carregarDadosSessoes(mes, ano) {

    //Gerando data num espaço de um mes para as requsições
    let rendaResposta = 0;
    let diaFim = 31;
    if (mes==4 || mes==6 || mes==9 || mes==11 ){
        diaFim = 30
    }
    if(mes==2){
        const bissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
        diaFim = bissexto ? 29 : 28;
    }
    const dataInicio = gerarDataISO(ano, mes, 1);
    const dataFim = gerarDataISO(ano, mes, diaFim); //não tenho certeza se isso funciona pra mes com 30 ou menos dias mas to com preguiça de olhar :)
    
    try {
        //Requsição FODA da rendaMedia
        await fetch(`/agendamentos/rendaMediaData?dataInicio=${dataInicio}&dataFim=${dataFim}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        }).then(valor =>{
            console.log(valor);
            document.getElementById('preçoMedio').value = valor;
        }).catch (error => {
            console.error('Erro:', error);
        });
        
        //Requisição menos FODA de quantidade de sessoes
        await fetch(`/agendamentos/sessoesData?dataInicio=${dataInicio}&dataFim=${dataFim}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(sessoes => {
            if (!sessoes.ok) {
                throw new Error('Erro na requisição');
            }
            return sessoes.json();
        }).then(valor =>{
            console.log(valor);
            document.getElementById('totalSessoes').value = valor;
        }).catch (error => {
            console.error('Erro:', error);
        });

        //Requsição FINAL de renda
        const renda = await fetch(`/agendamentos/rendaData?dataInicio=${dataInicio}&dataFim=${dataFim}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        }).then (valor =>{
            console.log(valor);
            document.querySelector('.ganhos').textContent = `Ganhos: ${formatarMoeda(valor)}`;
            rendaResposta = valor;
        }).catch (error => {
            console.error('Erro:', error);
        });
    } catch (error) {
        console.error('Erro:', error);
    }
    return rendaResposta;
}

// Função para calcular o total das despesas
function calcularTotalDespesas() {
    let total = 0;
    
    // Pegar valores dos inputs de despesas
    const energia = parseFloat(document.getElementById('energia').value.replace('R$ ', '').replace(',', '.')) || 0;
    const internet = parseFloat(document.getElementById('internet').value.replace('R$ ', '').replace(',', '.')) || 0;
    const outros = parseFloat(document.getElementById('outros').value.replace('R$ ', '').replace(',', '.')) || 0;
    
    total = energia + internet + outros;
    
    // A taxa não é calculada, é um valor fixo. Portanto, não mexemos no campo de taxa.
    // Atualizar total das despesas
    document.querySelector('.total').textContent = `Total: ${formatarMoeda(total)}`;
    
    return total;
}

// Função para calcular e atualizar o lucro
function atualizarLucro(ganhos, despesas) {
    const lucro = ganhos - despesas;
    document.querySelector('.secao-lucro input').value = formatarMoeda(lucro);
}

// Função para gerar relatório
async function gerarRelatorio() {
    mesSelecionado = document.getElementById('meses').value;
    anoSelecionado = document.getElementById('anos').value;
    
    if (!mesSelecionado || !anoSelecionado) {
        alert('Selecione mês e ano para gerar o relatório');
        return;
    }
    
    // Carregar dados das sessões
    const ganhos = await carregarDadosSessoes(mesSelecionado, anoSelecionado);

    // Carregar despesas
    await carregarDespesas(mesSelecionado, anoSelecionado);
    
    // Calcular total de despesas
    const despesas = calcularTotalDespesas();
    
    // Atualizar lucro
    atualizarLucro(ganhos, despesas);
}

// Configurar eventos de entrada para campos de despesas
function configurarCamposDespesas() {
    const camposDespesas = document.querySelectorAll('.item-despesa input');
    camposDespesas.forEach(campo => {
        if (campo.parentElement.querySelector('span').textContent !== 'Taxa da despesa') {
            campo.removeAttribute('readonly');
            campo.value = '';
            campo.placeholder = 'R$ 0,00';
            campo.addEventListener('input', function(e) {
                // Formatar entrada para moeda
                let valor = e.target.value.replace(/\D/g, '');
                valor = (parseFloat(valor) / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                e.target.value = valor;
                
                // Recalcular totais
                const despesas = calcularTotalDespesas();
                const ganhos = parseFloat(document.querySelector('.ganhos').textContent.replace('Ganhos: R$ ', '').replace(',', '.')) || 0;
                atualizarLucro(ganhos, despesas);
            });
        }
    });
}

// Função de redirecionamento
function redirecionarPara(pagina) {
    window.location.href = pagina;
}

// Event Listeners quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    


    
    
    // Inicializar interface
    preencherSelectsDatas();
    configurarCamposDespesas();
    
    // Configurar evento do botão gerar
    document.getElementById('btnGerar').addEventListener('click', gerarRelatorio);
    
    // Configurar eventos do modal de EDIÇÃO
    const modalEditar = document.getElementById('modalEditarDespesas');
    const btnEditarDespesas = document.getElementById('btnDespesa');
    const btnFecharEditar = document.querySelector('.fechar');
    const btnCancelarEditar = document.querySelector('.btn-cancelar');
    const btnSalvarEditar = document.querySelector('.btn-salvar');


    // Configurar abertura do modal de edição
    if (btnEditarDespesas) {
        btnEditarDespesas.addEventListener('click', function() {
            // Preencher os campos do modal com os valores atuais da página
            const energia = parseFloat(document.getElementById('energia').value.replace('R$ ', '').replace(',', '.')) || 0;
            const internet = parseFloat(document.getElementById('internet').value.replace('R$ ', '').replace(',', '.')) || 0;
            const outros = parseFloat(document.getElementById('outros').value.replace('R$ ', '').replace(',', '.')) || 0;
            const taxa = parseFloat(document.getElementById('taxa').value.replace(' %', '')) || 0;
            
            document.getElementById('energiaModal').value = energia;
            document.getElementById('internetModal').value = internet;
            document.getElementById('outrosModal').value = outros;
            document.getElementById('taxaModal').value = taxa;
            
            modalEditar.style.display = "block";
        });
    }

    // Configurar fechamento do modal de edição
    if (btnFecharEditar) {
        btnFecharEditar.addEventListener('click', function() {
            modalEditar.style.display = "none";
        });
    }

    if (btnCancelarEditar) {
        btnCancelarEditar.addEventListener('click', function() {
            modalEditar.style.display = "none";
        });
    }

    // Configurar salvamento do modal de edição
    if (btnSalvarEditar) {
        btnSalvarEditar.addEventListener('click', async function() {
            await salvarDespesasEdicao();
        });
    }


    // Configurar modal de adicionar despesa

    const modalAdicionar = document.getElementById('modalAdicionarDespesa');
    const btnAdicionarDespesa = document.getElementById('btnAdicionarDespesa');
    const btnFecharAdicionar = document.querySelector('.fechar-adicionar');
    const btnCancelarAdicionar = document.querySelector('.btn-cancelar-adicionar');
    const btnSalvarAdicionar = document.querySelector('.btn-salvar-adicionar');

    // DEBUG: Verificar se botao foi encontrado
    console.log('Botao Adicionar Despesa encontrado:', btnAdicionarDespesa);


    // Configurar eventos do modal de ADICIONAR

    if (btnAdicionarDespesa) {
        btnAdicionarDespesa.addEventListener('click', abrirModalAdicionar);
    }

    if (btnFecharAdicionar) {
        btnFecharAdicionar.addEventListener('click', fecharModalAdicionar);
    }

    if (btnCancelarAdicionar) {
        btnCancelarAdicionar.addEventListener('click', fecharModalAdicionar);
    }

    if (btnSalvarAdicionar) {
        btnSalvarAdicionar.addEventListener('click', salvarNovaDespesa);
    }

    // Fechar modais quando clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === modalEditar) {
            modalEditar.style.display = "none";
        }
        if (event.target === modalAdicionar) {
            fecharModalAdicionar();
        }
    });

    
});

// Função para salvar despesas edicao
async function salvarDespesasEdicao() {
    try {
        const energia = parseFloat(document.getElementById('energiaModal').value) || 0;
        const internet = parseFloat(document.getElementById('internetModal').value) || 0;
        const outros = parseFloat(document.getElementById('outrosModal').value) || 0;
        const taxa = parseFloat(document.getElementById('taxaModal').value) || 0;

        // Validar a taxa
        if (taxa < 0 || taxa > 100) {
            alert('A taxa deve estar entre 0% e 100%');
            return;
        }

        // Verificar se temos mês e ano selecionados
        if (!mesSelecionado || !anoSelecionado) {
            alert('Por favor, selecione um mês e ano primeiro usando o botão "Carregar"');
            return;
        }

        const despesas = [
            {
                categoria: 'Energia',
                valor: energia,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            },
            {
                categoria: 'Internet',
                valor: internet,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            },
            {
                categoria: 'Outros',
                valor: outros,
                taxaDespesa: taxa,
                mes: mesSelecionado,
                ano: parseInt(anoSelecionado)
            }
        ];

        const response = await fetch('http://localhost:8080/api/despesas/salvar-mes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(despesas)
        });

        if (response.ok) {
            const despesasSalvas = await response.json();
            console.log('Despesas salvas com sucesso:', despesasSalvas);
            alert('Despesas atualizadas com sucesso!');
            
            // Atualizar a interface com os novos valores
            document.getElementById('energia').value = formatarMoeda(energia);
            document.getElementById('internet').value = formatarMoeda(internet);
            document.getElementById('outros').value = formatarMoeda(outros);
            document.getElementById('taxa').value = formatarPercentual(taxa);
            
            // Recalcular totais
            atualizarTotalDespesas();
            
            // Fechar o modal
            document.getElementById('modalEditarDespesas').style.display = "none";
        } else {
            const errorText = await response.text();
            throw new Error(`Erro do servidor: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar despesas. Por favor, tente novamente. ' + error.message);
    }
}
 
//o que esta no html 
// Elementos do modal
        const modal = document.getElementById('modalEditarDespesas');
        const btnEditarDespesas = document.getElementById('btnDespesa');
        const btnFechar = document.querySelector('.fechar');
        const btnCancelar = document.querySelector('.btn-cancelar');
        const btnSalvar = document.querySelector('.btn-salvar');

        // Campos de input dox modal
        const energiaModal = document.getElementById('energiaModal');
        const internetModal = document.getElementById('internetModal');
        const outrosModal = document.getElementById('outrosModal');
        const taxaModal = document.getElementById('taxaModal');

        // Campos de input da página
        const energiaInput = document.getElementById('energia');
        const internetInput = document.getElementById('internet');
        const outrosInput = document.getElementById('outros');
        const taxaInput = document.getElementById('taxa');

        // Função para extrair o valor numérico de uma string formatada em R$
        function extrairValor(str) {
            if (!str) return 0;
            return parseFloat(str.replace('R$', '').replace(',', '.').trim());
        }

        // Função para extrair o valor percentual
        function extrairPercentual(str) {
            if (!str) return 0;
            return parseFloat(str.replace('%', '').trim());
        }

        // Função para formatar valor em R$
        function formatarMoeda(valor) {
            return `R$ ${valor.toFixed(2).replace('.', ',')}`;
        }

        // Função para formatar percentual
        function formatarPercentual(valor) {
            return `${valor.toFixed(2)}%`;
        }

        // Abrir modal
        btnEditarDespesas.onclick = function () {
            // Preencher os campos do modal com os valores atuais
            energiaModal.value = extrairValor(energiaInput.value);
            internetModal.value = extrairValor(internetInput.value);
            outrosModal.value = extrairValor(outrosInput.value);
            taxaModal.value = extrairPercentual(taxaInput.value);
            modal.style.display = "block";
        }

        // Fechar modal
        function fecharModal() {
            modal.style.display = "none";
        }

        btnFechar.onclick = fecharModal;
        btnCancelar.onclick = fecharModal;

        // Quando o usuário clicar fora do modal, fechar
        window.onclick = function (event) {
            if (event.target == modal) {
                fecharModal();
            }
        }

        const excluirDespesa = document.getElementById("btnExcluirDespesa")
        excluirDespesa.onclick = function(){
            try{
                // Verificar se temos mês e ano selecionados
                if (!mesSelecionado || !anoSelecionado) {
                    alert('Por favor, selecione um mês e ano primeiro usando o botão "Carregar"');
                    return;
                }
                fetch(`/api/despesas?mes=${encodeURIComponent(mesSelecionado)}&ano=${anoSelecionado}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response =>{
                    if (response.ok){
                        alert('Despesa excluída com sucesso.')
                    }
                }).catch(error =>{
                    console.error('Erro na requisição:', error);
                })
            } catch(error){}           
        }   

        // Salvar alterações
        btnSalvar.onclick = function () {
            // Validar os campos
            const energia = parseFloat(energiaModal.value) || 0;
            const internet = parseFloat(internetModal.value) || 0;
            const outros = parseFloat(outrosModal.value) || 0;
            const taxa = parseFloat(taxaModal.value) || 0;

            // Validar a taxa (deve estar entre 0 e 100)
            if (taxa < 0 || taxa > 100) {
                alert('A taxa deve estar entre 0% e 100%');
                return;
            }

            // Atualizar os campos na página
            energiaInput.value = formatarMoeda(energia);
            internetInput.value = formatarMoeda(internet);
            outrosInput.value = formatarMoeda(outros);
            taxaInput.value = formatarPercentual(taxa);

            // Calcular e atualizar o total
            const total = energia + internet + outros;
            document.querySelector('.total').textContent = `Total: ${formatarMoeda(total)}`;

            fecharModal();    
        }