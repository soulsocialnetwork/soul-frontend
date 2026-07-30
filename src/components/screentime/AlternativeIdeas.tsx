import { useState } from 'react';

const IDEAS = [
  { emoji: '📖', title: 'Ler um livro',       desc: '15 min de leitura renovam a mente.' },
  { emoji: '🚶', title: 'Caminhar',            desc: 'Sair por 10 min renova a energia.' },
  { emoji: '✍️', title: 'Escrever',            desc: 'Coloque pensamentos no papel.' },
  { emoji: '💧', title: 'Beber água',          desc: 'Você provavelmente precisa.' },
  { emoji: '🎵', title: 'Ouvir música',        desc: 'Desconecte com uma boa playlist.' },
  { emoji: '🧘', title: 'Respirar',            desc: '4 respirações fundas. Agora.' },
  { emoji: '📞', title: 'Ligar pra alguém',    desc: 'Uma conversa vale mais que mil stories.' },
  { emoji: '🌱', title: 'Cuidar de uma planta', desc: 'Conexão real com o presente.' },
];

export function AlternativeIdeas() {
  const [shuffled] = useState(() =>
    [...IDEAS].sort(() => Math.random() - 0.5).slice(0, 4)
  );

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {shuffled.map((idea, i) => (
        <div
          key={i}
          className="glass-card rounded-2xl p-4 flex flex-col gap-2 hover:bg-white/6 transition-colors duration-200"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="text-xl">{idea.emoji}</span>
          <p className="text-sm font-semibold text-textPrimary">{idea.title}</p>
          <p className="text-xs text-textSecondary leading-snug">{idea.desc}</p>
        </div>
      ))}
    </div>
  );
}
