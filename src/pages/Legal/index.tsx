import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Section = { title: string; paragraphs: string[] };

const documents: Record<string, { title: string; intro: string; sections: Section[] }> = {
  '/diretrizes': {
    title: 'Diretrizes da Comunidade',
    intro: 'O Soul é um espaço para compartilhar experiências com respeito. Estas regras se aplicam a posts, Soults, comentários, mensagens, perfis e destaques.',
    sections: [
      { title: 'Respeito entre pessoas', paragraphs: ['Não publique ameaças, assédio, discurso de ódio, humilhação ou exposição de informações privadas de outras pessoas. Não se passe por outra pessoa ou organização.'] },
      { title: 'Conteúdo e segurança', paragraphs: ['Não compartilhe exploração sexual, violência explícita, golpes, spam ou conteúdo ilegal. Respeite direitos autorais e obtenha autorização antes de publicar imagens de terceiros.'] },
      { title: 'Denúncias e moderação', paragraphs: ['Use a opção Denunciar em perfis e conteúdos para sinalizar violações. A equipe de moderação pode analisar denúncias e restringir ou remover contas e conteúdos. Uma denúncia não garante remoção automática.'] },
      { title: 'Cuide da sua privacidade', paragraphs: ['Pense antes de publicar dados pessoais. Um perfil privado restringe o acesso comum, mas o conteúdo ainda pode ser visto por pessoas autorizadas e pela moderação quando necessário.'] },
    ],
  },
  '/privacidade': {
    title: 'Política de Privacidade',
    intro: 'Esta página descreve os dados usados pelo protótipo Soul para que você possa avaliar antes de criar uma conta.',
    sections: [
      { title: 'Dados tratados', paragraphs: ['No cadastro, o Soul recebe nome, nome de usuário, e-mail, data de nascimento e senha. A senha é processada pelo servidor; a interface não a exibe publicamente. Também tratamos dados de perfil, publicações, Soults, mídias, mensagens, interações, denúncias e configurações que você fornecer.'] },
      { title: 'Finalidades e acesso', paragraphs: ['Esses dados permitem autenticação, funcionamento da rede, comunicação entre usuários, personalização de preferências, segurança e moderação. Outras pessoas podem ver dados e conteúdos conforme a visibilidade escolhida. Administradores podem acessar conteúdo necessário à moderação.'] },
      { title: 'Armazenamento no navegador', paragraphs: ['A aplicação guarda dados de sessão e algumas preferências e rascunhos neste navegador. O histórico de tempo de tela é local ao navegador. Limpar os dados do navegador pode apagar esses registros locais. Evite usar uma sessão aberta em dispositivo compartilhado.'] },
      { title: 'Seus controles', paragraphs: ['Nas Configurações você pode tornar o perfil privado, ajustar notificações, bloquear contas, trocar senha e e-mail ou solicitar a exclusão da conta. Para denunciar conteúdo ou contas, use as opções de denúncia na própria aplicação.'] },
      { title: 'Contato provisório', paragraphs: ['privacidade@exemplo.com é um endereço ilustrativo deste TCC e não recebe solicitações. Antes de disponibilizar o Soul como serviço real, o responsável deverá publicar uma identidade e um canal de privacidade funcionais, além de revisar este aviso.'] },
    ],
  },
  '/termos': {
    title: 'Termos de Uso',
    intro: 'O Soul é um protótipo de rede social desenvolvido para um TCC. Leia estas condições antes de usar o ambiente de teste.',
    sections: [
      { title: 'Conta e acesso', paragraphs: ['Você deve fornecer informações de cadastro corretas, proteger suas credenciais e ter pelo menos 13 anos. A conta é pessoal; não use a identidade de terceiros.'] },
      { title: 'Conteúdo publicado', paragraphs: ['Você é responsável pelo conteúdo que envia e deve ter direito de compartilhá-lo. Ao publicar, autoriza o Soul a armazenar e exibir esse conteúdo conforme a visibilidade escolhida para operar a aplicação.'] },
      { title: 'Uso adequado', paragraphs: ['Siga as Diretrizes da Comunidade. Não tente invadir, automatizar abusivamente, prejudicar o serviço ou acessar dados de outras pessoas sem autorização. Violações podem gerar moderação ou suspensão da conta.'] },
      { title: 'Ambiente de teste', paragraphs: ['O projeto pode apresentar falhas, mudanças ou indisponibilidade. Evite usar o protótipo para armazenar informações críticas. Estes termos e a Política de Privacidade precisam de revisão do responsável antes de uma operação pública definitiva.'] },
      { title: 'Contato provisório', paragraphs: ['privacidade@exemplo.com é apenas um endereço ilustrativo e não deve ser usado para pedidos reais.'] },
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const document = documents[pathname];
  if (!document) return null;

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-textPrimary sm:py-12">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/auth')} className="mb-8 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-textSecondary transition-colors hover:bg-white/5 hover:text-textPrimary focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{document.title}</h1>
        <p className="mt-3 text-sm leading-7 text-textSecondary">{document.intro}</p>
        <div className="mt-8 space-y-5">
          {document.sections.map(section => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-base font-semibold">{section.title}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph} className="mt-2 text-sm leading-7 text-textSecondary">{paragraph}</p>)}
            </section>
          ))}
        </div>
        <nav aria-label="Documentos do Soul" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-textSecondary">
          <Link to="/diretrizes" className="hover:text-white">Diretrizes</Link>
          <Link to="/privacidade" className="hover:text-white">Privacidade</Link>
          <Link to="/termos" className="hover:text-white">Termos</Link>
        </nav>
      </div>
    </main>
  );
}
