// GET /api/nomes - Carregar todos os nomes
export async function carregarNomesAPI() {
  try {
    const response = await fetch('/api/nomes')
    
    if (!response.ok) {
      console.error('Erro na resposta:', response.status, response.statusText)
      throw new Error('Erro ao carregar nomes')
    }
    
    const data = await response.json()
    return data

  } catch (error) {
    console.error('Erro ao carregar nomes:', error)
    throw error
  }
}

// POST /api/nomes - Adicionar novo nome
export async function adicionarNomeAPI(nome) {
  try {
    const response = await fetch('/api/nomes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.erro || 'Erro ao adicionar nome')
    }
    
    const resultado = await response.json()
    return resultado

  } catch (error) {
    console.error('Erro ao adicionar nome:', error)
    throw error
  }
}
