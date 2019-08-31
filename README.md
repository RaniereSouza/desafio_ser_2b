# Excelsior! (Desafio Ser 2B)

Projeto desenvolvido como parte de um desafio apresentado pela empresa [Editora 2B Educação](https://www.editora2b.com.br/), mas que também passo a ser um projeto para revisão e estudo das estruturas mais recentes na plataforma Meteor.

Uma versão desse projeto está atualmente rodando no Heroku e pode ser acessada [por aqui](https://desafio-ser-2b.herokuapp.com/).

## Como rodar na minha máquina? ##

As etapas para poder fazer o projeto rodar localmente e ver seu funcionamento no seu próprio computador são em resumo estas (serão explicadas com mais detalhes em partes futuras do documento, se necessário):

* Baixar uma versão do código do projeto
* Instalar o [Meteor](https://www.meteor.com/) na sua máquina
* Baixar os pacotes [npm](https://www.npmjs.com/) que o projeto usa (`meteor npm install --save`; nesse projeto aqui, talves não precise baixar, por causa de uns problemas específicos que foram mais simplesmente resolvidos com a pasta `node_modules` fazendo parte do repositório)
* Rodar o comando `meteor` dentro da pasta do projeto, isso vai fazer a aplicação começar a rodar na sua máquina
* Acessar qualquer browser na porta local 3000 (http://localhost:3000)

Esses passos simples são o suficiente para rodar e testar a maioria dos projetos feitos no Meteor, com as ressalvas de casos mais específicos, mais complexos.

### 1. Instalando o Meteor

Independente de qual é o seu sistema, a plataforma Meteor pode ser facilmente instalada. Instruções mais detalhadas podem ser encontradas [nesse endereço aqui](https://www.meteor.com/install), mas basicamente é da seguinte forma:

* Usuário Windows: baixar o instalador e instalar normalmente como qualquer programa
* Usuário Linux/MacOS: executar a linha de comando `curl https://install.meteor.com/ | sh` no terminal

Pronto! =)

### 2. Baixando os pacotes npm

Uma vez tendo o Meteor instalado, basta executar dentro da pasta do projeto o comando `meteor npm install --save`, e ele vai varrer o arquivo `package.json` e instalar tudo o que o projeto precisa. Faz parte das boas práticas de desenvolvimento não submeter a pasta onde os pacotes npm ficam (`node_modules`), logo toda vez que alguém for rodar um projeto novo do zero, vai ser necessário instalar os pacotes.

Nesse projeto específico aqui, foi feita uma correção no arquivo que está no endereço `node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss` do projeto; para tentar manter essa correção, foi submetida a pasta `node_modules` junto com o resto do projeto, **coisa que não é prática recomendada pelos desenvolvedores, e nem é comum de acontecer**.
