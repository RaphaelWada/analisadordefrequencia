// ==UserScript==
// @name         SIGEDUCA MT - Analisador de Frequência
// @namespace    http://github.com/seu-usuario/sigeduca-frequencia-extension
// @version      1.0
// @description  Ferramenta para análise de frequência de alunos no SIGEDUCA/MT
// @author       Seu Nome
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwgedboletim.aspx?9
// @icon         https://github.com/seu-usuario/sigeduca-frequencia-extension/raw/main/images/icon.png
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js
// @resource     select2CSS https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css
// @connect      sigeduca.seduc.mt.gov.br
// ==/UserScript==

(function() {
    'use strict';

    // Adiciona CSS do Select2
    GM_addStyle(GM_getResourceText("select2CSS"));

    // CSS customizado para a extensão
    GM_addStyle(`
        .sigeduca-extension {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
        }
        .sigeduca-extension h2 {
            color: #2c3e50;
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .sigeduca-form-group {
            margin-bottom: 15px;
        }
        .sigeduca-form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #495057;
        }
        .sigeduca-form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
        }
        .sigeduca-btn {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .sigeduca-btn:hover {
            background-color: #2980b9;
        }
        .sigeduca-results {
            margin-top: 20px;
            background-color: white;
            border-radius: 4px;
            padding: 15px;
            border: 1px solid #dee2e6;
        }
        .sigeduca-alert {
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .sigeduca-alert-info {
            background-color: #e7f5ff;
            color: #1864ab;
            border: 1px solid #a5d8ff;
        }
        .sigeduca-alert-error {
            background-color: #fff3bf;
            color: #e67700;
            border: 1px solid #ffec99;
        }
        .sigeduca-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .sigeduca-table th, .sigeduca-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .sigeduca-table th {
            background-color: #f1f3f5;
            font-weight: 600;
        }
        .select2-container {
            width: 100% !important;
            margin-bottom: 15px;
        }
    `);

    // Aguarda o carregamento completo da página
    $(document).ready(function() {
        // Cria a interface da extensão
        createExtensionUI();

        // Carrega os alunos disponíveis (simulação - na prática você precisaria extrair do banco de dados)
        loadStudents();
    });

    function createExtensionUI() {
        // Cria o container principal
        const extensionHTML = `
            <div class="sigeduca-extension">
                <h2>Análise de Frequência Escolar</h2>
                <div class="sigeduca-form-group">
                    <label for="sigeduca-student">Aluno:</label>
                    <select id="sigeduca-student" class="sigeduca-form-control">
                        <option value="">Carregando alunos...</option>
                    </select>
                </div>
                <div class="sigeduca-form-group">
                    <label for="sigeduca-month">Mês:</label>
                    <select id="sigeduca-month" class="sigeduca-form-control">
                        <option value="1">Janeiro</option>
                        <option value="2">Fevereiro</option>
                        <option value="3">Março</option>
                        <option value="4">Abril</option>
                        <option value="5">Maio</option>
                        <option value="6">Junho</option>
                        <option value="7">Julho</option>
                        <option value="8">Agosto</option>
                        <option value="9">Setembro</option>
                        <option value="10">Outubro</option>
                        <option value="11">Novembro</option>
                        <option value="12">Dezembro</option>
                    </select>
                </div>
                <div class="sigeduca-form-group">
                    <label for="sigeduca-year">Ano:</label>
                    <select id="sigeduca-year" class="sigeduca-form-control">
                        <option value="${new Date().getFullYear()}">${new Date().getFullYear()}</option>
                        <option value="${new Date().getFullYear() - 1}">${new Date().getFullYear() - 1}</option>
                    </select>
                </div>
                <button id="sigeduca-search-btn" class="sigeduca-btn">Pesquisar Frequência</button>
                <div id="sigeduca-results" class="sigeduca-results" style="display: none;">
                    <div id="sigeduca-alert" class="sigeduca-alert" style="display: none;"></div>
                    <div id="sigeduca-data-container"></div>
                </div>
            </div>
        `;

        // Insere a extensão no topo da página
        $('#form1').prepend(extensionHTML);

        // Inicializa o Select2 para os selects
        $('#sigeduca-student').select2({
            placeholder: "Selecione um aluno",
            allowClear: true
        });

        // Configura o evento de clique do botão
        $('#sigeduca-search-btn').click(function() {
            searchAttendance();
        });
    }

    function loadStudents() {
        // Simulação de carregamento de alunos
        // Na prática, você precisaria extrair essa lista do banco de dados do SIGEDUCA
        
        // Exemplo de como poderia ser feito (adaptar para a estrutura real do SIGEDUCA):
        try {
            // Simula um delay de carregamento
            setTimeout(function() {
                const students = [
                    { id: 1, text: "ALUNO 1 - MATRICULA: 12345" },
                    { id: 2, text: "ALUNO 2 - MATRICULA: 67890" },
                    { id: 3, text: "ALUNO 3 - MATRICULA: 54321" }
                ];

                $('#sigeduca-student').empty().select2({
                    data: students,
                    placeholder: "Selecione um aluno",
                    allowClear: true
                });

                // Se não encontrar alunos (adaptar conforme necessidade)
                if (students.length === 0) {
                    showAlert('Nenhum aluno encontrado. Verifique se você tem permissão para acessar esses dados.', 'error');
                }
            }, 1000);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            showAlert('Erro ao carregar a lista de alunos. Tente recarregar a página.', 'error');
        }
    }

    function searchAttendance() {
        const studentId = $('#sigeduca-student').val();
        const month = $('#sigeduca-month').val();
        const year = $('#sigeduca-year').val();

        if (!studentId) {
            showAlert('Por favor, selecione um aluno para pesquisar.', 'error');
            return;
        }

        // Mostra o container de resultados
        $('#sigeduca-results').show();
        $('#sigeduca-alert').hide();
        $('#sigeduca-data-container').html('<p>Carregando dados de frequência...</p>');

        // Simulação de busca de dados (substituir pela lógica real de extração do SIGEDUCA)
        setTimeout(function() {
            try {
                // Exemplo de dados simulados
                const studentName = $('#sigeduca-student').select2('data')[0].text.split(' - ')[0];
                const attendanceData = {
                    student: studentName,
                    month: $('#sigeduca-month option:selected').text(),
                    year: year,
                    totalDays: 22,
                    presences: 18,
                    absences: 4,
                    percentage: (18 / 22 * 100).toFixed(2),
                    details: [
                        { date: '01/' + month.toString().padStart(2, '0') + '/' + year, status: 'Presença' },
                        { date: '02/' + month.toString().padStart(2, '0') + '/' + year, status: 'Presença' },
                        { date: '03/' + month.toString().padStart(2, '0') + '/' + year, status: 'Falta' },
                        // ... mais dados simulados
                    ]
                };

                displayAttendanceData(attendanceData);
            } catch (error) {
                console.error('Erro ao buscar frequência:', error);
                showAlert('Erro ao buscar dados de frequência. Tente novamente.', 'error');
            }
        }, 1500);
    }

    function displayAttendanceData(data) {
        let html = `
            <h3>Dados de Frequência</h3>
            <p><strong>Aluno:</strong> ${data.student}</p>
            <p><strong>Período:</strong> ${data.month}/${data.year}</p>
            
            <div class="sigeduca-alert sigeduca-alert-info">
                <p><strong>Resumo:</strong></p>
                <p>Total de dias letivos: ${data.totalDays}</p>
                <p>Presenças: ${data.presences}</p>
                <p>Faltas: ${data.absences}</p>
                <p>Percentual de presença: ${data.percentage}%</p>
            </div>
            
            <h4>Detalhes por dia:</h4>
            <table class="sigeduca-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Limita a exibição para os primeiros 5 registros no exemplo
        data.details.slice(0, 5).forEach(item => {
            html += `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.status}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <p><em>Mostrando 5 de ${data.details.length} registros.</em></p>
        `;

        $('#sigeduca-data-container').html(html);
    }

    function showAlert(message, type) {
        const alertDiv = $('#sigeduca-alert');
        alertDiv.removeClass('sigeduca-alert-info sigeduca-alert-error');
        
        if (type === 'error') {
            alertDiv.addClass('sigeduca-alert-error');
        } else {
            alertDiv.addClass('sigeduca-alert-info');
        }
        
        alertDiv.text(message).show();
        $('#sigeduca-results').show();
    }
})();