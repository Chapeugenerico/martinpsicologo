class PerfilPaciente {
    constructor() {
        this.paciente = null;
        this.init();
    }

    init() {
        console.log('=== DEBUG PERFIL PACIENTE ===');
        console.log('Paciente data:', this.paciente);
        console.log('usucodigo:', this.paciente?.usucodigo);
        console.log('=== FIM DEBUG ===');
        
        if (!this.verificarAutenticacao()) {
            return;
        }
        this.carregarDadosPaciente();
        this.configurarEventListeners();
    }

    verificarAutenticacao() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        const pacienteLogado = localStorage.getItem('pacienteLogado');
        const psicologoLogado = localStorage.getItem('psicologoLogado');
        
        if (!usuarioLogado && !pacienteLogado && !psicologoLogado) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (psicologoLogado) {
            alert('Psicólogo detectado! Redirecionando para o perfil correto...');
            window.location.href = 'perfilPsicologo.html';
            return false;
        }
        
        if (usuarioLogado) {
            const usuario = JSON.parse(usuarioLogado);
            
            if (this.isPaciente(usuario)) {
                this.paciente = usuario;
                localStorage.setItem('pacienteLogado', usuarioLogado);
                return true;
            } else {
                alert('Redirecionando para perfil do psicólogo...');
                window.location.href = 'perfilPsicologo.html';
                return false;
            }
        }
        
        if (pacienteLogado) {
            this.paciente = JSON.parse(pacienteLogado);
            return true;
        }
        
        return false;
    }

    isPaciente(usuario) {
        if (usuario.dataNascimento || usuario.convenio || usuario.historicoMedico) {
            return true;
        }
        
        if (usuario.crp || usuario.especialidade || usuario.curriculo) {
            return false;
        }
        
        if (usuario.tipoUsuario) {
            return usuario.tipoUsuario.toLowerCase() === 'paciente';
        }
        
        if (usuario.roles && Array.isArray(usuario.roles)) {
            return usuario.roles.some(role => 
                role.includes('PACIENTE') || role.includes('ROLE_PACIENTE')
            );
        }
        
        // Verificar pelo campo usutipo da sua API
        if (usuario.usutipo) {
            return usuario.usutipo === 'PACIENTE';
        }
        
        return true;
    }

    carregarDadosPaciente() {
        if (!this.paciente) return;

        console.log('Dados completos do paciente:', this.paciente);

        
        const nome = this.paciente.usunome || 'Nome não informado';
        const email = this.paciente.usuemail || 'Email não informado';
        const telefone = this.paciente.telefone || 'Telefone não informado';
        const endereco = this.paciente.cep || 'CEP não informado';
        const cpf = this.paciente.cpf || 'CPF não informado';

        document.getElementById('nome').textContent = nome;
        const emailEl = document.getElementById('email');
        if (emailEl) emailEl.textContent = email;
        const telEl = document.getElementById('telefone');
        if (telEl) telEl.textContent = telefone;
        const endEl = document.getElementById('endereco');
        if (endEl) endEl.textContent = endereco;
        const cpfEl = document.getElementById('cpf');
        if (cpfEl) cpfEl.textContent = cpf;

        // Preencher formulário de edição
        if (document.getElementById('editNome')) document.getElementById('editNome').value = nome;
        if (document.getElementById('editEmail')) document.getElementById('editEmail').value = email;
        if (document.getElementById('editTelefone')) document.getElementById('editTelefone').value = telefone;
        if (document.getElementById('editEndereco')) document.getElementById('editEndereco').value = endereco;
        if (document.getElementById('editCpf')) document.getElementById('editCpf').value = this.paciente.cpf || '';
    }

    configurarEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        const perfilTab = document.getElementById('perfilTab');
        if (perfilTab) perfilTab.addEventListener('click', () => this.mostrarAba('perfil'));

        const horariosTab = document.getElementById('horariosTab');
        if (horariosTab) horariosTab.addEventListener('click', () => this.mostrarAba('horarios'));

        const editBtn = document.getElementById('editBtn');
        if (editBtn) editBtn.addEventListener('click', () => this.mostrarFormularioEdicao());

        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.cancelarEdicao());

        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.addEventListener('submit', (e) => this.salvarEdicao(e));

        // Configurar botão de excluir conta
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.mostrarModalExclusao());

        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) confirmDelete.addEventListener('click', () => this.excluirConta());

        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) cancelDelete.addEventListener('click', () => this.fecharModalExclusao());
    }

    // Método para mostrar modal de exclusão
    mostrarModalExclusao() {
        document.getElementById('deleteModal').style.display = 'flex';
    }

    // Método para fechar modal
    fecharModalExclusao() {
        document.getElementById('deleteModal').style.display = 'none';
    }

    // Método principal para excluir conta
    async excluirConta() {
        if (!this.paciente || !this.paciente.usucodigo) {
            alert('Erro: Dados do usuário não encontrados.');
            return;
        }

        const usuarioId = this.paciente.usucodigo;
        
        console.log('🗑️ INICIANDO EXCLUSÃO DA CONTA:');
        console.log('ID do usuário:', usuarioId);
        console.log('Nome:', this.paciente.usunome);

        try {
            const response = await fetch(`historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/usuarios/${usuarioId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 RESPOSTA DA EXCLUSÃO:');
            console.log('Status:', response.status);
            console.log('OK:', response.ok);

            if (response.ok) {
                console.log('CONTA EXCLUÍDA COM SUCESSO');
                
                // Feedback para o usuário
                alert('Sua conta foi excluída com sucesso. Todos os dados foram removidos.');
                
                // Limpar todos os dados locais
                this.limparDadosLocais();
                
                // Redirecionar para a página inicial
                window.location.href = 'login.html';
                
            } else if (response.status === 404) {
                throw new Error('Usuário não encontrado no sistema.');
            } else {
                const errorText = await response.text();
                console.error('❌ ERRO NA EXCLUSÃO:', errorText);
                
                let errorMessage = 'Erro ao excluir conta';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Erro ${response.status}: ${errorText}`;
                }
                
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ ERRO COMPLETO NA EXCLUSÃO:', error);
            alert(`❌ Falha ao excluir conta: ${error.message}`);
        } finally {
            // Fechar modal independente do resultado
            this.fecharModalExclusao();
        }
    }

    // Método para limpar dados locais
    limparDadosLocais() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('pacienteLogado');
        localStorage.removeItem('psicologoLogado');
        localStorage.removeItem('token');
        
        // Limpar horários específicos deste usuário
        if (this.paciente && this.paciente.usuemail) {
            localStorage.removeItem(`horarios_${this.paciente.usuemail}`);
        }
        
        console.log('🧹 Dados locais limpos');
    }

    mostrarAba(aba) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById('perfilSection').style.display = 'none';
        document.getElementById('horariosSection').style.display = 'none';
        document.getElementById('editForm').style.display = 'none';

        if (aba === 'perfil') {
            document.getElementById('perfilTab').classList.add('active');
            document.getElementById('perfilSection').style.display = 'block';
        } else if (aba === 'horarios') {
            document.getElementById('horariosTab').classList.add('active');
            document.getElementById('horariosSection').style.display = 'block';
            this.carregarHorarios();
        }
    }

    mostrarFormularioEdicao() {
        document.getElementById('perfilSection').style.display = 'none';
        document.getElementById('editForm').style.display = 'block';
    }

    cancelarEdicao() {
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('perfilSection').style.display = 'block';
        this.carregarDadosPaciente();
    }

    async salvarEdicao(e) {
        e.preventDefault();

        // OBTER O ID CORRETO - usucodigo
        const usuarioId = this.paciente.usucodigo;
        
        
        const dadosAtualizados = {
            usunome: document.getElementById('editNome').value,
            usuemail: document.getElementById('editEmail').value,
            telefone: document.getElementById('editTelefone').value,
            cep: document.getElementById('editEndereco').value,
            cpf: document.getElementById('editCpf') ? document.getElementById('editCpf').value : undefined
        };

        console.log('🔄 ENVIANDO ATUALIZAÇÃO PARA API:');
        console.log('URL:', `http://localhost:8080/api/usuarios/${usuarioId}`);
        console.log('Método: PUT');
        console.log('Dados:', dadosAtualizados);

        try {
            const response = await fetch(`historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosAtualizados)
            });

            console.log('📥 RESPOSTA DA API:');
            console.log('Status:', response.status);
            console.log('OK:', response.ok);

            if (response.ok) {
                const usuarioAtualizado = await response.json();
                console.log('✅ SUCESSO - Dados atualizados:', usuarioAtualizado);
                
                // ATUALIZAR LOCALSTORAGE COM OS DADOS ATUALIZADOS DO BANCO
                this.paciente = { ...this.paciente, ...usuarioAtualizado };
                localStorage.setItem('usuarioLogado', JSON.stringify(this.paciente));
                localStorage.setItem('pacienteLogado', JSON.stringify(this.paciente));
                
                // ATUALIZAR A VISUALIZAÇÃO
                this.carregarDadosPaciente();
                
                // VOLTAR PARA VISUALIZAÇÃO
                document.getElementById('editForm').style.display = 'none';
                document.getElementById('perfilSection').style.display = 'block';
                
                alert('✅ Perfil atualizado com sucesso no banco de dados!');
                
            } else {
                const errorText = await response.text();
                console.error('❌ ERRO DA API:', errorText);
                
                let errorMessage = 'Erro ao atualizar perfil';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Erro ${response.status}: ${errorText}`;
                }
                
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ ERRO COMPLETO:', error);
            alert(`❌ Erro ao atualizar perfil: ${error.message}`);
        }
    }

    carregarHorarios() {
        const horariosList = document.getElementById('horariosList');
        
        const pacienteEmail = this.paciente.usuemail;
        const horarios = JSON.parse(localStorage.getItem(`horarios_${pacienteEmail}`) || '[]');
        
        if (horarios.length === 0) {
            horariosList.innerHTML = '<p class="no-horarios">Nenhum horário agendado</p>';
            return;
        }

        horariosList.innerHTML = horarios.map(horario => `
            <div class="horario-item">
                <div class="horario-data">
                    ${new Date(horario.data).toLocaleDateString('pt-BR')} - ${horario.hora}
                    <span class="horario-status status-${horario.status}">${horario.status}</span>
                </div>
                <div>Psicólogo: ${horario.psicologo}</div>
                ${horario.observacoes ? `<div>Observações: ${horario.observacoes}</div>` : ''}
            </div>
        `).join('');
    }

    logout() {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('pacienteLogado');
        localStorage.removeItem('psicologoLogado');
        window.location.href = 'login.html';
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new PerfilPaciente();
});