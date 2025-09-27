#!/bin/bash

# Configuração da nomeação
CONFIG_ID=55
VOTERS=(2361 2187 2327 2185 2124 2146 2368 2221 2193)
CANDIDATES=(2189 2274 2337 2350 2238 2361 2105 2106 2234 2187)
POSITIONS=(
  "Primeiro Ancião(ã)"
  "Ancião/Anciã Teen"
  "Ancião/Anciã Jovem"
  "Secretário(a)"
  "Secretário(a) Associado(a)"
  "Secretário(a) Teen"
  "Tesoureiro(a)"
  "Tesoureiro(a) Associado(a)"
  "Tesoureiro(a) Teen"
  "Patrimônio"
  "Diáconos"
  "Diácono(s) Teen"
  "Primeiro Diácono"
  "Diaconisas"
  "Diaconisa(s) Teen"
  "Primeira Diaconisa"
  "Diretor(a)"
  "Diretor(a) Associado(a)"
  "Discípulo Teen"
  "Ministério da Criança – Coordenador(a)"
  "Ministério da Criança – Coordenador(a) Associado(a)"
  "Ministério dos Adolescentes – Coordenador(a)"
  "Ministério dos Adolescentes – Coordenador(a) Associado(a)"
  "Ministério Jovem – Diretor(a)"
  "Ministério Jovem – Diretor(a) Associado(a)"
  "Clube de Aventureiros – Diretor(a)"
  "Clube de Aventureiros – Diretor(a) Associado(a)"
  "Clube de Aventureiros – Discípulo Teen"
  "Clube de Desbravadores – Diretor(a)"
  "Clube de Desbravadores – Diretor(a) Associado(a)"
  "Clube de Desbravadores – Discípulo Teen"
  "Professores(as) das Unidades: Bebês"
  "Professores(as) das Unidades: Iniciantes"
  "Professores(as) das Unidades: Infantis"
  "Professores(as) das Unidades: Primários"
  "Professores(as) das Unidades: Pré-adolescentes"
  "Professores(as) das Unidades: Adolescentes"
  "Secretário(a) Escola Sabatina"
  "Diretor(a) Associado(a) Escola Sabatina"
  "Discípulo Teen Escola Sabatina"
  "Diretor(a) Ministério Pessoal"
  "Diretor(a) Associado(a) Ministério Pessoal"
  "Discípulo Teen Ministério Pessoal"
  "Evangelismo – Diretor(a)"
  "Evangelismo – Diretor(a) Associado(a)"
  "Evangelismo – Secretário(a)"
  "Evangelismo – Discípulo Teen"
  "Coordenador(a) de Classes Bíblicas"
  "Coordenador(a) de Interessados"
  "Diretor(a) ASA"
  "Diretor(a) Associado(a) ASA"
  "Discípulo Teen ASA"
  "Casal Diretor"
  "Casal Associado"
  "Discípulo Teen Ministério da Família"
  "Diretora Ministério da Mulher"
  "Diretora Associada Ministério da Mulher"
  "Discípulo Teen Ministério da Mulher"
  "Líder Ministério da Recepção"
  "Equipe Ministério da Recepção"
  "Diretor Ministério do Homem"
  "Diretor Associado Ministério do Homem"
  "Discípulo Teen Ministério do Homem"
  "Diretor(a) Ministério da Saúde"
  "Diretor(a) Associado(a) Ministério da Saúde"
  "Discípulo Teen Ministério da Saúde"
  "Diretor(a) Ministério das Possibilidades"
  "Diretor(a) Associado(a) Ministério das Possibilidades"
  "Discípulo Teen Ministério das Possibilidades"
  "Diretor(a) Ministério da Música"
  "Diretor(a) Associado(a) Ministério da Música"
  "Discípulo Teen Ministério da Música"
  "Diretor(a) Comunicação"
  "Diretor(a) Associado(a) Comunicação"
  "Social Media (redes sociais)"
  "Discípulo Teen Comunicação"
  "Diretor(a) Sonoplastia"
  "Diretor(a) Associado(a) Sonoplastia"
  "Equipe Sonoplastia"
)

echo "🚀 Iniciando automação COMPLETA da nomeação..."
echo "📊 Configuração ID: $CONFIG_ID"
echo "👥 Votantes: ${#VOTERS[@]}"
echo "🎯 Cargos: ${#POSITIONS[@]}"

# Função para fazer requisição
make_request() {
  local url="$1"
  local method="$2"
  local data="$3"
  
  if [ "$method" = "POST" ]; then
    curl -s -X POST "$url" \
      -H "Content-Type: application/json" \
      -H "Cache-Control: no-cache" \
      -H "Pragma: no-cache" \
      -d "$data"
  else
    curl -s "$url" \
      -H "Cache-Control: no-cache" \
      -H "Pragma: no-cache"
  fi
}

# Função para aguardar
sleep_seconds() {
  sleep "$1"
}

# Obter status inicial
echo "📋 Obtendo status inicial..."
initial_status=$(make_request "https://7care.netlify.app/api/elections/dashboard?configId=$CONFIG_ID")
current_position=$(echo "$initial_status" | jq '.currentPosition')
echo "📍 Posição atual: $current_position"

# Processar TODOS os cargos restantes
total_positions=${#POSITIONS[@]}
for ((i=current_position; i<total_positions; i++)); do
  position="${POSITIONS[$i]}"
  position_num=$((i + 1))
  
  echo ""
  echo "🎯 Processando cargo $position_num/$total_positions: $position"
  
  # FASE 1: INDICAÇÕES
  echo "📝 Fase 1: Simulando indicações..."
  
  # Simular 3 indicações por cargo
  for j in {0..2}; do
    voter="${VOTERS[$j]}"
    candidate="${CANDIDATES[$j]}"
    
    echo "   👤 Votante $voter indica candidato $candidate"
    
    indication_data="{\"positionId\":\"$position\",\"candidateId\":$candidate,\"voterId\":$voter}"
    indication_result=$(make_request "https://7care.netlify.app/api/elections/auto-nominate" "POST" "$indication_data")
    echo "   Resultado: $indication_result"
    
    sleep_seconds 0.5
  done
  
  # FASE 2: VOTAÇÕES
  echo "🗳️ Fase 2: Simulando votações..."
  
  # Simular votações de todos os votantes
  for voter in "${VOTERS[@]}"; do
    candidate="${CANDIDATES[$((RANDOM % ${#CANDIDATES[@]}))]}"
    
    echo "   🗳️ Votante $voter vota no candidato $candidate"
    
    vote_data="{\"positionId\":\"$position\",\"candidateId\":$candidate,\"voterId\":$voter}"
    vote_result=$(make_request "https://7care.netlify.app/api/elections/auto-vote" "POST" "$vote_data")
    echo "   Resultado: $vote_result"
    
    sleep_seconds 0.5
  done
  
  # Avançar para próxima posição
  echo "⏭️ Avançando para próxima posição..."
  advance_result=$(make_request "https://7care.netlify.app/api/elections/next-position" "POST" "{}")
  echo "   Resultado: $advance_result"
  
  sleep_seconds 1
  
  # Mostrar progresso a cada 10 cargos
  if [ $((position_num % 10)) -eq 0 ]; then
    echo ""
    echo "📊 Progresso: $position_num/$total_positions cargos processados"
    current_status=$(make_request "https://7care.netlify.app/api/elections/dashboard?configId=$CONFIG_ID")
    voted_voters=$(echo "$current_status" | jq '.votedVoters')
    echo "🗳️ Votantes que votaram: $voted_voters"
  fi
done

# Obter resultados finais
echo ""
echo "📊 Obtendo resultados finais..."
final_results=$(make_request "https://7care.netlify.app/api/elections/dashboard?configId=$CONFIG_ID")
echo "🎉 Nomeação automatizada COMPLETA!"
echo "📋 Resumo dos resultados:"
echo "$final_results" | jq '{
  totalVoters: .totalVoters,
  votedVoters: .votedVoters,
  currentPosition: .currentPosition,
  totalPositions: .totalPositions,
  isActive: .isActive,
  positionsCompleted: (.positions | length)
}'

echo ""
echo "🏆 NOMEADOS PARA LIDERANÇA:"
echo "$final_results" | jq '.positions[] | select(.winner != null) | {
  cargo: .positionName,
  nomeado: .winner.candidateName,
  votos: .winner.votes,
  porcentagem: .winner.percentage
}'
