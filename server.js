const express = require('express'); // O express é uma biblioteca para Node.js que facilita a criação de servidores web e APIs. Ele fornece uma maneira simples e eficiente de lidar com rotas, requisições e respostas HTTP.
const cors = require('cors'); /* O CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança que permite ou restringe requisições entre diferentes origens (domínios). Ele é usado para controlar o acesso a recursos em um servidor web a partir de outro domínio. Resumindo: Ajuda a controlar quais origens podem acessar seu backend por meio de requisições feitas pelo navegador.
É útil quando o frontend e o backend estão em endereços ou portas diferentes. */

const fs = require('fs'); // Módulo do Node para ler e escrever arquivos no computador. Permite ler, criar, escrever e modificar arquivos no computador.

const path = require('path') /* Montar e manipular caminhos de arquivos/pastas . Tanto esse quanto o fs são pertencentes ao Node. Ajuda a montar e manipular caminhos de arquivos e pastas.
Ele evita que você precise escrever o caminho completo do arquivo manualmente.*/

const app = express(); // Aqui a função é chamada para criar uma instância do servidor web usando o Express. A variável app representa o servidor e é nele que vamos usar para definir rotas, middlewares e outras configurações.
const PORT = process.env.PORT || 3000; // Aqui definimos a porta em que o servidor vai rodar. A porta é como uma "porta de entrada" para o servidor, permitindo que ele receba requisições HTTP. Essa variável define o número da porta que você pretende utilizar para o servidor. Colocamos o valor da variável de ambiente PORT, caso exista, ou então usamos a porta 3000 como padrão. Isso é útil para quando você for hospedar o servidor em algum serviço que define a porta automaticamente.


// Configurações simples

app.use(express.json()) // permite que o servidor entenda os dados enviados em formato json. 
app.use(cors()) // Permitir/controlar requisições entre origens diferentes. Libera o acesso para o frontend.

// arquivo que vai simular o banco de dados
const DB_FILE = path.join(__dirname, 'database.json');

// Aqui eu crio um funçao auxiliar para ler os usuários salvos
function lerUsuario(){
    if(!fs.existsSync(DB_FILE)){
      return[];  
    } 
    const dados = fs.readFileSync(DB_FILE, 'utf8')

    if(dados){
        return JSON.parse(dados);
    } else {
        return [];
    }
}

// outra função auxiliar para salvar novos usuários no arquivo
function salvarUsuario(usuarios) {
    fs.writeFileSync(DB_FILE, JSON.stringify(usuarios, null, 2))    
}

// rota de cadastro

app.post('/api/cadastro', (req,res) => {
    const { nome, email, senha } = req.body;

    const usuarios = lerUsuario();

    // aqui vamos verificar se o email já foi cadastrado
    const usuarioExiste = usuarios.find(user => user.email === email);
    if (usuarioExiste) {
        return res.status(400).json({ 
            erro: 'Este e-mail já está cadastrado!'})
    }
    
    // algoritimo para criar novo usuario
    const novoUsuario = {
        id: Date.now(), 
        nome: nome, 
        email: email, 
        senha: senha
    };
    usuarios.push(novoUsuario);

    // salva no banco de dados (arquivo json)
    salvarUsuario(usuarios);

    return res.status(201).json({mensagem: 'Usuário cadastrado com sucesso!'})
})

// --- ROTA DE LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const usuarios = lerUsuario();

    // Procura um usuário com o mesmo e-mail e senha
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);

    if (!usuario) {
        return res.status(401).json({ erro: 'E-mail ou senha incorretos!' });
    }

    // Login bem-sucedido (retornamos o nome para exibir no dashboard)
    return res.status(200).json({ 
        mensagem: 'Login realizado com sucesso!',
        nome: usuario.nome 
    });
});

// Inicia o servidor na porta 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});