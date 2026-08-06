# 📄 Sistema de Recibos - DEV Sistemas

Sistema completo para geração, gerenciamento e impressão de recibos empresariais com interface moderna em dark mode.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Usar](#-como-usar)
  - [Instalação](#instalação)
  - [Navegação](#navegação)
  - [Cadastro de Empresa](#cadastro-de-empresa)
  - [Criação de Recibos](#criação-de-recibos)
  - [Planilha de Dados](#planilha-de-dados)
  - [Relatórios](#relatórios)
  - [Impressão](#impressão)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
- [Armazenamento de Dados](#-armazenamento-de-dados)
- [Personalização](#-personalização)
- [Compatibilidade](#-compatibilidade)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

O **Sistema de Recibos** é uma aplicação web completa desenvolvida para gerenciar a criação, edição, exclusão e impressão de recibos empresariais. 

O sistema foi projetado para atender às necessidades de empresas que geram recibos, podendo ser facilmente adaptado para qualquer empresa.

### Principais características:
- 🎨 **Interface moderna** em Dark Mode
- 📱 **Totalmente responsivo** (funciona em desktop, tablet e mobile)
- 💾 **Armazenamento local** (não requer banco de dados)
- 🖨️ **Impressão otimizada** em formato A4
- 📊 **Relatórios com gráficos**
- 📥 **Exportação/Importação CSV** (compatível com Excel)

---

## ✨ Funcionalidades

### 1. 🏢 Cadastro de Empresas
- Cadastrar múltiplas empresas
- Editar dados da empresa
- Excluir empresas
- Ativar/desativar empresa para uso nos recibos
- Dados salvos: Nome, CNPJ, Endereço, Responsável, Cargo, Telefone, Email

### 2. 📝 Geração de Recibos
- 4 tipos de recibos: Premiação, Pagamento, Adiantamento, Reembolso
- Upload de logo da empresa
- Conversão automática de valor numérico para extenso
- Formatação brasileira (R$ 1.800,00)
- Preview em tempo real antes de imprimir
- 4 formas de pagamento: Transferência, Dinheiro, Cartão, PIX

### 3. 📊 Planilha de Dados
- Visualização em tabela de todos os recibos
- Estatísticas: Total de recibos, Valor total, Último recibo
- Exportar para CSV (compatível com Excel, Google Sheets)
- Importar planilha CSV
- Limpar planilha com backup automático

### 4. 📈 Relatórios
- Filtros por período e tipo de recibo
- Gráfico de distribuição por tipo
- Gráfico de valor total por mês
- Cards com estatísticas do período
- Tabela detalhada de recibos
- Resumo com totais, médias, maior e menor valor
- Impressão do relatório

### 5. 🖨️ Impressão
- Impressão individual de recibos
- Impressão de relatórios completos
- Formato A4 otimizado
- Sem bordas ou elementos desnecessários
- Logo e título centralizados

---

## 📁 Estrutura de Arquivos
projeto-recibos/
│
├── index.html # Estrutura principal da aplicação
├── style.css # Estilos e temas (Dark Mode)
├── script.js # Lógica e funcionalidades
└── README.md # Documentação do projeto
