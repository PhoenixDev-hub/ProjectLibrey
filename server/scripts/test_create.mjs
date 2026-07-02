import { criarUsuario } from '../src/service/usuario.service.js'
async function main() {
  try {
    const res = await criarUsuario({nome:"T",sobrenome:"U",email:"t2@gmail.com",senha:"pwd123",tipoUsuario:"ALUNO",anoInicioEnsinoMedio:2025,anoSala:"1A"}, false)
    console.log(res)
  } catch(e) {
    console.log(e.message, e.stack)
  }
}
main()
