// Banco de Perguntas — Agatha PsiCanina V1
// 7 categorias × 20 perguntas = 140 perguntas
// Seleção determinística via PRNG seeded com session.id

export type QuestionCategory =
  | 'trabalho'
  | 'relacionamentos'
  | 'sonhos'
  | 'habitos'
  | 'comida'
  | 'estudos'
  | 'emocoes'

export type QuestionTag =
  | 'produtividade'
  | 'pressão'
  | 'liderança'
  | 'equipe'
  | 'rotina'
  | 'conflito'
  | 'identidade'
  | 'estilo'
  | 'conexão'
  | 'cuidado'
  | 'comunicação'
  | 'apego'
  | 'confiança'
  | 'futuro'
  | 'liberdade'
  | 'medo'
  | 'esperança'
  | 'mudança'
  | 'organização'
  | 'procrastinação'
  | 'autocuidado'
  | 'conforto'
  | 'hábito'
  | 'prazer'
  | 'curiosidade'
  | 'aprendizado'
  | 'disciplina'
  | 'vulnerabilidade'
  | 'autoconsciência'
  | 'regulação'
  | 'humor'

export type QuestionItem = {
  id: string
  category: QuestionCategory
  text: string
  tags: QuestionTag[]
}

// ─── Banco completo ───────────────────────────────────────────────────────────

const QUESTION_BANK: QuestionItem[] = [
  // ── trabalho ──────────────────────────────────────────────────────────────
  { id: 'trab_01', category: 'trabalho', text: 'Você prefere começar pelo mais difícil ou pelo mais fácil?', tags: ['produtividade', 'estilo'] },
  { id: 'trab_02', category: 'trabalho', text: 'Quando alguém atrasa uma entrega, como você reage?', tags: ['conflito', 'equipe'] },
  { id: 'trab_03', category: 'trabalho', text: 'Você trabalha melhor sob pressão ou com planejamento?', tags: ['pressão', 'estilo'] },
  { id: 'trab_04', category: 'trabalho', text: 'O que te dá mais satisfação: começar projetos ou finalizar?', tags: ['identidade', 'estilo'] },
  { id: 'trab_05', category: 'trabalho', text: 'Você é da equipe checklist ou da equipe improviso?', tags: ['organização', 'estilo'] },
  { id: 'trab_06', category: 'trabalho', text: 'Quando recebe uma tarefa nova, você organiza tudo ou sai farejando solução?', tags: ['produtividade', 'estilo'] },
  { id: 'trab_07', category: 'trabalho', text: 'Você gosta de liderar, apoiar ou observar de longe com cara de quem sabe tudo?', tags: ['liderança', 'identidade'] },
  { id: 'trab_08', category: 'trabalho', text: 'Seu ambiente de trabalho te energiza ou suga sua bateria emocional?', tags: ['autocuidado', 'identidade'] },
  { id: 'trab_09', category: 'trabalho', text: 'Quando algo dá errado, você procura culpados, soluções ou café?', tags: ['conflito', 'humor'] },
  { id: 'trab_10', category: 'trabalho', text: 'Você costuma pedir ajuda cedo ou só quando o navio já virou jangada?', tags: ['vulnerabilidade', 'equipe'] },
  { id: 'trab_11', category: 'trabalho', text: 'Você prefere rotina previsível ou desafios inesperados?', tags: ['rotina', 'estilo'] },
  { id: 'trab_12', category: 'trabalho', text: 'Como você reage quando mudam o combinado de última hora?', tags: ['conflito', 'regulação'] },
  { id: 'trab_13', category: 'trabalho', text: 'Você celebra pequenas entregas ou só respira depois do caos inteiro acabar?', tags: ['autocuidado', 'produtividade'] },
  { id: 'trab_14', category: 'trabalho', text: 'Você tem facilidade para dizer "não" no trabalho?', tags: ['conflito', 'identidade'] },
  { id: 'trab_15', category: 'trabalho', text: 'Quando está muito ocupada, você fica mais silenciosa, acelerada ou dramática?', tags: ['pressão', 'regulação'] },
  { id: 'trab_16', category: 'trabalho', text: 'Você prefere resolver sozinha ou em matilha?', tags: ['equipe', 'identidade'] },
  { id: 'trab_17', category: 'trabalho', text: 'Seu maior talento profissional é paciência, criatividade, velocidade ou teimosia?', tags: ['identidade', 'humor'] },
  { id: 'trab_18', category: 'trabalho', text: 'Você costuma revisar tudo várias vezes ou confia no primeiro instinto?', tags: ['produtividade', 'estilo'] },
  { id: 'trab_19', category: 'trabalho', text: 'Qual tarefa faz você pensar "isso aqui poderia ser feito por uma IA com bom senso"?', tags: ['humor', 'identidade'] },
  { id: 'trab_20', category: 'trabalho', text: 'Se sua vida profissional fosse uma raça de cachorro, seria qual energia: poodle elétrico, shih tzu estratégico ou border collie hiperfocado?', tags: ['humor', 'identidade'] },

  // ── relacionamentos ───────────────────────────────────────────────────────
  { id: 'rel_01', category: 'relacionamentos', text: 'Você manda mensagem primeiro ou espera a outra pessoa se lembrar de existir?', tags: ['conexão', 'comunicação'] },
  { id: 'rel_02', category: 'relacionamentos', text: 'Quando sente saudade de alguém, fala ou guarda a saudade como troféu?', tags: ['vulnerabilidade', 'comunicação'] },
  { id: 'rel_03', category: 'relacionamentos', text: 'Você perdoa rápido ou tem memória de elefante afetivo?', tags: ['conflito', 'apego'] },
  { id: 'rel_04', category: 'relacionamentos', text: 'Você prefere ter poucos amigos próximos ou muitos conhecidos de abraço frouxo?', tags: ['conexão', 'identidade'] },
  { id: 'rel_05', category: 'relacionamentos', text: 'O que você mais valoriza numa amizade: lealdade, presença, humor ou café junto?', tags: ['confiança', 'identidade'] },
  { id: 'rel_06', category: 'relacionamentos', text: 'Você demonstra carinho com palavras, presença, comida ou pequenos cuidados silenciosos?', tags: ['cuidado', 'comunicação'] },
  { id: 'rel_07', category: 'relacionamentos', text: 'Em conflito, você conversa, foge ou fica ensaiando a resposta perfeita no chuveiro?', tags: ['conflito', 'comunicação'] },
  { id: 'rel_08', category: 'relacionamentos', text: 'Você gosta de receber atenção ou prefere observar discretamente do canto?', tags: ['identidade', 'autoconsciência'] },
  { id: 'rel_09', category: 'relacionamentos', text: 'Você se apega rápido ou exige um longo período de adaptação emocional?', tags: ['apego', 'identidade'] },
  { id: 'rel_10', category: 'relacionamentos', text: 'Você confia nas pessoas com facilidade ou faz uma triagem completa antes?', tags: ['confiança', 'identidade'] },
  { id: 'rel_11', category: 'relacionamentos', text: 'O que mais te afasta de alguém: falsidade, descaso ou mascar chiclete barulhento?', tags: ['conflito', 'humor'] },
  { id: 'rel_12', category: 'relacionamentos', text: 'Você prefere relações intensas e profundas ou leves e tranquilas?', tags: ['apego', 'identidade'] },
  { id: 'rel_13', category: 'relacionamentos', text: 'Você gosta mais de cuidar das pessoas ou de ser cuidada?', tags: ['cuidado', 'identidade'] },
  { id: 'rel_14', category: 'relacionamentos', text: 'Quando alguém some sem explicação, você pergunta o que houve ou cria 14 teorias?', tags: ['apego', 'humor'] },
  { id: 'rel_15', category: 'relacionamentos', text: 'Você gosta de surpresas ou prefere que a vida te avise com antecedência?', tags: ['identidade', 'regulação'] },
  { id: 'rel_16', category: 'relacionamentos', text: 'Você se sente confortável pedindo ajuda ou prefere resolver tudo antes de incomodar?', tags: ['vulnerabilidade', 'comunicação'] },
  { id: 'rel_17', category: 'relacionamentos', text: 'Qual gesto simples te conquista imediatamente?', tags: ['cuidado', 'identidade'] },
  { id: 'rel_18', category: 'relacionamentos', text: 'Você prefere conversar por mensagem, áudio ou olho no olho com chá na mão?', tags: ['comunicação', 'estilo'] },
  { id: 'rel_19', category: 'relacionamentos', text: 'Quando gosta de alguém, fica óbvio para o mundo inteiro ou ninguém percebe?', tags: ['comunicação', 'identidade'] },
  { id: 'rel_20', category: 'relacionamentos', text: 'Você é mais coração aberto ou portão eletrônico com senha e câmera de segurança?', tags: ['apego', 'humor'] },

  // ── sonhos ────────────────────────────────────────────────────────────────
  { id: 'son_01', category: 'sonhos', text: 'Se pudesse acordar amanhã em qualquer lugar do mundo, onde seria?', tags: ['liberdade', 'esperança'] },
  { id: 'son_02', category: 'sonhos', text: 'Qual sonho você ainda não realizou mas pensa nele com frequência?', tags: ['futuro', 'esperança'] },
  { id: 'son_03', category: 'sonhos', text: 'Você sonha grande e assustador ou prefere metas pequenas e alcançáveis?', tags: ['medo', 'identidade'] },
  { id: 'son_04', category: 'sonhos', text: 'O que você faria se não precisasse se preocupar com dinheiro?', tags: ['liberdade', 'identidade'] },
  { id: 'son_05', category: 'sonhos', text: 'Qual aventura você gostaria de viver pelo menos uma vez?', tags: ['liberdade', 'esperança'] },
  { id: 'son_06', category: 'sonhos', text: 'Você planeja o futuro com detalhes ou prefere deixar ele te encontrar?', tags: ['futuro', 'estilo'] },
  { id: 'son_07', category: 'sonhos', text: 'Qual versão de você mesma você quer conhecer daqui a um ano?', tags: ['futuro', 'identidade'] },
  { id: 'son_08', category: 'sonhos', text: 'Existe algum lugar no mundo que parece estar chamando seu nome?', tags: ['liberdade', 'esperança'] },
  { id: 'son_09', category: 'sonhos', text: 'O que você faria se tivesse 30 dias completamente livres?', tags: ['liberdade', 'autocuidado'] },
  { id: 'son_10', category: 'sonhos', text: 'Você tem mais medo de falhar ou de nunca ter tentado?', tags: ['medo', 'autoconsciência'] },
  { id: 'son_11', category: 'sonhos', text: 'Seu sonho mais forte hoje envolve paz, dinheiro, amor, liberdade ou descanso?', tags: ['futuro', 'identidade'] },
  { id: 'son_12', category: 'sonhos', text: 'Você gosta mais de imaginar possibilidades ou de executar planos concretos?', tags: ['estilo', 'identidade'] },
  { id: 'son_13', category: 'sonhos', text: 'Se a Agatha pudesse te dar uma permissão oficial para algo, qual seria?', tags: ['liberdade', 'humor'] },
  { id: 'son_14', category: 'sonhos', text: 'Qual sonho parece pequeno demais, mas mudaria completamente o seu dia?', tags: ['esperança', 'autocuidado'] },
  { id: 'son_15', category: 'sonhos', text: 'Você se permite desejar coisas grandes sem pedir desculpa por isso?', tags: ['identidade', 'vulnerabilidade'] },
  { id: 'son_16', category: 'sonhos', text: 'O que você quer sentir com mais frequência no futuro próximo?', tags: ['futuro', 'regulação'] },
  { id: 'son_17', category: 'sonhos', text: 'Se a sua vida virasse um filme leve, qual seria a cena final feliz?', tags: ['esperança', 'humor'] },
  { id: 'son_18', category: 'sonhos', text: 'Qual meta sua merece mais carinho e menos cobrança?', tags: ['autocuidado', 'mudança'] },
  { id: 'son_19', category: 'sonhos', text: 'Você prefere uma vida estável e segura ou uma vida cheia de histórias imprevisíveis?', tags: ['identidade', 'liberdade'] },
  { id: 'son_20', category: 'sonhos', text: 'O que sua versão cansada de hoje pediria para sua versão do futuro?', tags: ['futuro', 'autocuidado'] },

  // ── habitos ───────────────────────────────────────────────────────────────
  { id: 'hab_01', category: 'habitos', text: 'Você é mais matutina animada ou noturna filosófica?', tags: ['rotina', 'identidade'] },
  { id: 'hab_02', category: 'habitos', text: 'Sua cama costuma estar arrumada ou é território livre?', tags: ['organização', 'humor'] },
  { id: 'hab_03', category: 'habitos', text: 'Você deixa tarefas acumularem até virar avalanche ou resolve na hora?', tags: ['procrastinação', 'rotina'] },
  { id: 'hab_04', category: 'habitos', text: 'Você costuma terminar o que começa ou tem um cemitério de projetos no HD?', tags: ['procrastinação', 'humor'] },
  { id: 'hab_05', category: 'habitos', text: 'Você prefere organização rígida ou criatividade caótica?', tags: ['organização', 'identidade'] },
  { id: 'hab_06', category: 'habitos', text: 'Você tem algum ritual para começar o dia ou apenas sobrevive aos primeiros 20 minutos?', tags: ['rotina', 'autocuidado'] },
  { id: 'hab_07', category: 'habitos', text: 'Como você costuma terminar a noite: planejando amanhã, assistindo série ou filosofando?', tags: ['rotina', 'identidade'] },
  { id: 'hab_08', category: 'habitos', text: 'Seu celular descansa longe de você à noite ou dorme praticamente no seu travesseiro?', tags: ['hábito', 'autocuidado'] },
  { id: 'hab_09', category: 'habitos', text: 'Você funciona melhor com silêncio absoluto, música ou barulho de vida acontecendo?', tags: ['identidade', 'estilo'] },
  { id: 'hab_10', category: 'habitos', text: 'Você costuma beber água suficiente ou vive negociando com sua própria hidratação?', tags: ['autocuidado', 'humor'] },
  { id: 'hab_11', category: 'habitos', text: 'Você acumula abas abertas no navegador como se fossem intenções nobres?', tags: ['procrastinação', 'humor'] },
  { id: 'hab_12', category: 'habitos', text: 'Você esquece de descansar quando está empolgada com algo?', tags: ['autocuidado', 'produtividade'] },
  { id: 'hab_13', category: 'habitos', text: 'Você prefere agenda organizada ou confia na memória emocional improvisada?', tags: ['organização', 'estilo'] },
  { id: 'hab_14', category: 'habitos', text: 'Qual hábito você repete todo dia sem nem perceber que está fazendo?', tags: ['hábito', 'autoconsciência'] },
  { id: 'hab_15', category: 'habitos', text: 'Seu quarto ou mesa costuma refletir paz interior ou episódio final de novela?', tags: ['organização', 'humor'] },
  { id: 'hab_16', category: 'habitos', text: 'Você cria listas e cumpre ou cria listas para criar outras listas mais completas?', tags: ['procrastinação', 'humor'] },
  { id: 'hab_17', category: 'habitos', text: 'Tem algum hábito que você sabe que te faria bem, mas vive adiando para semana que vem?', tags: ['procrastinação', 'autocuidado'] },
  { id: 'hab_18', category: 'habitos', text: 'Você come devagar apreciando ou como quem tem uma missão secreta urgente?', tags: ['hábito', 'humor'] },
  { id: 'hab_19', category: 'habitos', text: 'Você lida bem com mudanças de rotina ou precisa de tempo de adaptação emocional?', tags: ['rotina', 'regulação'] },
  { id: 'hab_20', category: 'habitos', text: 'Se a Agatha auditasse seus hábitos esta semana, qual item receberia carimbo vermelho?', tags: ['autoconsciência', 'humor'] },

  // ── comida ────────────────────────────────────────────────────────────────
  { id: 'com_01', category: 'comida', text: 'Pão de queijo quentinho ou pizza fria da geladeira às 23h?', tags: ['conforto', 'humor'] },
  { id: 'com_02', category: 'comida', text: 'Você é mais de doce ou de salgado quando a vida aperta?', tags: ['conforto', 'identidade'] },
  { id: 'com_03', category: 'comida', text: 'Café da manhã reforçado com calma ou só um café e sair correndo?', tags: ['rotina', 'hábito'] },
  { id: 'com_04', category: 'comida', text: 'Qual comida te traz lembranças felizes imediatamente?', tags: ['conforto', 'identidade'] },
  { id: 'com_05', category: 'comida', text: 'Existe alguma comida que melhora instantaneamente seu humor?', tags: ['conforto', 'regulação'] },
  { id: 'com_06', category: 'comida', text: 'Você cozinha por prazer, por necessidade ou por pura sobrevivência calórica?', tags: ['prazer', 'identidade'] },
  { id: 'com_07', category: 'comida', text: 'Você compartilha comida com facilidade ou protege o último pedaço com o olhar?', tags: ['conforto', 'humor'] },
  { id: 'com_08', category: 'comida', text: 'O café resolve problemas ou só acompanha o drama sem interferir?', tags: ['hábito', 'humor'] },
  { id: 'com_09', category: 'comida', text: 'Qual comida tem gosto de abraço para você?', tags: ['conforto', 'identidade'] },
  { id: 'com_10', category: 'comida', text: 'Você tem alguma combinação alimentar estranha que defenderia em tribunal?', tags: ['humor', 'identidade'] },
  { id: 'com_11', category: 'comida', text: 'Quando está triste, você perde o apetite ou procura conforto direto na cozinha?', tags: ['conforto', 'regulação'] },
  { id: 'com_12', category: 'comida', text: 'Você é mais marmita planejada com cálculo nutricional ou delivery filosófico às 22h?', tags: ['hábito', 'humor'] },
  { id: 'com_13', category: 'comida', text: 'Se a sua personalidade fosse um prato hoje, qual seria?', tags: ['identidade', 'humor'] },
  { id: 'com_14', category: 'comida', text: 'Você gosta de experimentar sabores novos ou prefere o território conhecido?', tags: ['identidade', 'prazer'] },
  { id: 'com_15', category: 'comida', text: 'O que é mais perigoso para sua paz interior: fome, sono ou vontade de doce?', tags: ['autocuidado', 'humor'] },
  { id: 'com_16', category: 'comida', text: 'Você come primeiro com os olhos ou ignora apresentação e vai direto ao assunto?', tags: ['prazer', 'estilo'] },
  { id: 'com_17', category: 'comida', text: 'Tem alguma comida que te deixa imediatamente mais feliz independente do contexto?', tags: ['conforto', 'prazer'] },
  { id: 'com_18', category: 'comida', text: 'Você tem uma relação emocional com pão de queijo que talvez mereça ser estudada?', tags: ['conforto', 'humor'] },
  { id: 'com_19', category: 'comida', text: 'Qual lanche combina melhor com o seu estado de espírito agora?', tags: ['conforto', 'autoconsciência'] },
  { id: 'com_20', category: 'comida', text: 'Se a Agatha te prescrevesse um alimento simbólico para esta semana, qual você acha que seria?', tags: ['humor', 'identidade'] },

  // ── estudos ───────────────────────────────────────────────────────────────
  { id: 'est_01', category: 'estudos', text: 'Você aprende melhor lendo, assistindo vídeo ou colocando a mão na massa?', tags: ['aprendizado', 'estilo'] },
  { id: 'est_02', category: 'estudos', text: 'Qual assunto mais desperta sua curiosidade sem motivo aparente?', tags: ['curiosidade', 'identidade'] },
  { id: 'est_03', category: 'estudos', text: 'Você prefere estudar sozinha no silêncio ou em grupo com energia coletiva?', tags: ['aprendizado', 'estilo'] },
  { id: 'est_04', category: 'estudos', text: 'Você pesquisa coisas aleatórias por pura diversão ou só quando tem motivo prático?', tags: ['curiosidade', 'identidade'] },
  { id: 'est_05', category: 'estudos', text: 'Qual foi a última coisa que você aprendeu que te surpreendeu?', tags: ['curiosidade', 'aprendizado'] },
  { id: 'est_06', category: 'estudos', text: 'Você gosta de começar cursos novos com entusiasmo total?', tags: ['aprendizado', 'humor'] },
  { id: 'est_07', category: 'estudos', text: 'Você termina os cursos que começa ou coleciona certificados de 30% concluído?', tags: ['procrastinação', 'humor'] },
  { id: 'est_08', category: 'estudos', text: 'Você aprende por disciplina constante ou por hiperfoco repentino de 14 horas?', tags: ['disciplina', 'estilo'] },
  { id: 'est_09', category: 'estudos', text: 'Qual tema faz seus olhos brilharem quando alguém menciona no meio de uma conversa?', tags: ['curiosidade', 'identidade'] },
  { id: 'est_10', category: 'estudos', text: 'Quando não entende algo, você insiste, pausa para pesquisar ou culpa o universo?', tags: ['aprendizado', 'humor'] },
  { id: 'est_11', category: 'estudos', text: 'Você faz anotações organizadas e coloridas ou mapas do tesouro improvisados?', tags: ['organização', 'humor'] },
  { id: 'est_12', category: 'estudos', text: 'Você prefere entender a teoria antes ou partir direto para a prática?', tags: ['aprendizado', 'estilo'] },
  { id: 'est_13', category: 'estudos', text: 'Você se cobra para aprender rápido como se houvesse um prazo secreto?', tags: ['pressão', 'autoconsciência'] },
  { id: 'est_14', category: 'estudos', text: 'O que costuma te motivar a estudar: curiosidade, necessidade ou ansiedade produtiva?', tags: ['curiosidade', 'identidade'] },
  { id: 'est_15', category: 'estudos', text: 'Você costuma estudar até tarde ou aprende melhor com o cérebro descansado?', tags: ['rotina', 'estilo'] },
  { id: 'est_16', category: 'estudos', text: 'Você sente prazer genuíno em finalmente entender algo que era difícil?', tags: ['prazer', 'aprendizado'] },
  { id: 'est_17', category: 'estudos', text: 'Você prefere tutoriais rápidos de 10 minutos ou explicações profundas e completas?', tags: ['estilo', 'aprendizado'] },
  { id: 'est_18', category: 'estudos', text: 'Quando aprende algo novo e interessante, você sente vontade de ensinar alguém?', tags: ['conexão', 'curiosidade'] },
  { id: 'est_19', category: 'estudos', text: 'Qual habilidade você gostaria de dominar completamente se tivesse tempo infinito?', tags: ['futuro', 'identidade'] },
  { id: 'est_20', category: 'estudos', text: 'Se a Agatha fosse sua orientadora acadêmica, que conselho ela te daria hoje?', tags: ['humor', 'autoconsciência'] },

  // ── emocoes ───────────────────────────────────────────────────────────────
  { id: 'emo_01', category: 'emocoes', text: 'Quando está triste, o que você costuma fazer para se reencontrar?', tags: ['regulação', 'autocuidado'] },
  { id: 'emo_02', category: 'emocoes', text: 'Você demonstra emoções com facilidade ou guarda tudo para processar em particular?', tags: ['vulnerabilidade', 'identidade'] },
  { id: 'emo_03', category: 'emocoes', text: 'Você costuma se cobrar demais por coisas que estavam fora do seu controle?', tags: ['autoconsciência', 'pressão'] },
  { id: 'emo_04', category: 'emocoes', text: 'O que te deixa verdadeiramente orgulhosa de você mesma?', tags: ['identidade', 'autoconsciência'] },
  { id: 'emo_05', category: 'emocoes', text: 'Como você recarrega sua energia emocional quando está no limite?', tags: ['autocuidado', 'regulação'] },
  { id: 'emo_06', category: 'emocoes', text: 'Você chora com facilidade ou segura tudo até virar tempestade interna?', tags: ['vulnerabilidade', 'regulação'] },
  { id: 'emo_07', category: 'emocoes', text: 'Quando sente raiva, você fala, silencia ou começa a organizar coisas aleatórias?', tags: ['conflito', 'regulação'] },
  { id: 'emo_08', category: 'emocoes', text: 'Você reconhece seus limites antes ou só depois de ultrapassar todos eles?', tags: ['autoconsciência', 'autocuidado'] },
  { id: 'emo_09', category: 'emocoes', text: 'O que te acalma de verdade quando a ansiedade aparece?', tags: ['regulação', 'autocuidado'] },
  { id: 'emo_10', category: 'emocoes', text: 'Você se trata com a mesma gentileza que oferece às pessoas que ama?', tags: ['autocuidado', 'vulnerabilidade'] },
  { id: 'emo_11', category: 'emocoes', text: 'Quando algo bom acontece, você compartilha com alguém ou guarda quietinha?', tags: ['conexão', 'identidade'] },
  { id: 'emo_12', category: 'emocoes', text: 'O que pesa mais no seu dia: excesso de responsabilidade ou falta de reconhecimento?', tags: ['pressão', 'identidade'] },
  { id: 'emo_13', category: 'emocoes', text: 'Você sente culpa quando decide descansar sem ter "merecido" antes?', tags: ['autoconsciência', 'regulação'] },
  { id: 'emo_14', category: 'emocoes', text: 'Você sabe pedir colo emocional quando precisa ou prefere parecer que está bem?', tags: ['vulnerabilidade', 'comunicação'] },
  { id: 'emo_15', category: 'emocoes', text: 'Qual emoção aparece com mais frequência no seu dia sem ser convidada?', tags: ['autoconsciência', 'regulação'] },
  { id: 'emo_16', category: 'emocoes', text: 'Você costuma transformar preocupação em planejamento ou fica em loop sem sair?', tags: ['regulação', 'estilo'] },
  { id: 'emo_17', category: 'emocoes', text: 'Quando algo bom acontece, você comemora de verdade ou já procura o próximo problema?', tags: ['autoconsciência', 'humor'] },
  { id: 'emo_18', category: 'emocoes', text: 'Você consegue ficar em paz sem estar produzindo ou resolvendo algo?', tags: ['autocuidado', 'identidade'] },
  { id: 'emo_19', category: 'emocoes', text: 'O que sua ansiedade tentaria organizar primeiro se tivesse uma prancheta e marcadores?', tags: ['humor', 'autoconsciência'] },
  { id: 'emo_20', category: 'emocoes', text: 'Se seu coração pudesse latir uma frase para você hoje, qual seria?', tags: ['vulnerabilidade', 'identidade'] },
]

// ─── PRNG determinístico (FNV-1a seed → XorShift32) ─────────────────────────

function makeRng(seed: string): () => number {
  // FNV-1a para obter estado inicial a partir do session.id (string cuid)
  let state = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i)
    state = Math.imul(state, 16777619) >>> 0
  }
  if (state === 0) state = 1

  return function next(): number {
    // XorShift32
    state ^= state << 13
    state ^= state >> 17
    state ^= state << 5
    state = state >>> 0
    return state / 0x100000000
  }
}

// ─── Seleção ponderada da categoria extra ────────────────────────────────────

const EXTRA_WEIGHTS: [QuestionCategory, number][] = [
  ['comida', 0.25],
  ['sonhos', 0.25],
  ['emocoes', 0.20],
  ['estudos', 0.10],
  ['relacionamentos', 0.10],
  ['habitos', 0.05],
  ['trabalho', 0.05],
]

function pickWeightedCategory(rng: () => number): QuestionCategory {
  const r = rng()
  let cumulative = 0
  for (const [cat, weight] of EXTRA_WEIGHTS) {
    cumulative += weight
    if (r < cumulative) return cat
  }
  return 'comida'
}

// ─── API pública ─────────────────────────────────────────────────────────────

export const CATEGORIES: QuestionCategory[] = [
  'trabalho', 'relacionamentos', 'sonhos', 'habitos', 'comida', 'estudos', 'emocoes',
]

/** Retorna as 8 perguntas da sessão de forma determinística.
 *  Ordem: 7 obrigatórias (1 por categoria) + 1 extra ponderada, embaralhadas. */
export function selectQuestionsForSession(seed: string): QuestionItem[] {
  const rng = makeRng(seed)
  const byCategory = new Map<QuestionCategory, QuestionItem[]>()

  for (const cat of CATEGORIES) {
    byCategory.set(cat, QUESTION_BANK.filter((q) => q.category === cat))
  }

  // 1 pergunta obrigatória por categoria
  const selected: QuestionItem[] = CATEGORIES.map((cat) => {
    const pool = byCategory.get(cat)!
    const idx = Math.floor(rng() * pool.length)
    return pool[idx]
  })

  // 1 pergunta extra com peso maior em comida/sonhos/emocoes
  const extraCat = pickWeightedCategory(rng)
  const extraPool = byCategory.get(extraCat)!
  // Evitar repetir a pergunta já selecionada desta categoria
  const alreadySelected = new Set(selected.map((q) => q.id))
  const extraFiltered = extraPool.filter((q) => !alreadySelected.has(q.id))
  const extraSource = extraFiltered.length > 0 ? extraFiltered : extraPool
  const extraIdx = Math.floor(rng() * extraSource.length)
  selected.push(extraSource[extraIdx])

  // Embaralhar as 8 perguntas (Fisher-Yates determinístico)
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[selected[i], selected[j]] = [selected[j], selected[i]]
  }

  return selected
}

/** Conta quantas perguntas foram feitas por categoria em uma lista de perguntas selecionadas. */
export function countByCategory(questions: QuestionItem[]): Partial<Record<QuestionCategory, number>> {
  const counts: Partial<Record<QuestionCategory, number>> = {}
  for (const q of questions) {
    counts[q.category] = (counts[q.category] ?? 0) + 1
  }
  return counts
}
