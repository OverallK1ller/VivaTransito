import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResponderAtividade() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [atividade, setAtividade] = useState<any>(null);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const IMAGES_URL = 'http://localhost:3001/Images';

  useEffect(() => {
    const headers: Record<string,string> = {};
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  
    fetch(`http://localhost:3001/atividades/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar atividade");
        return res.json();
      })
      .then(setAtividade)
      .catch(err => setErro(err.message));
  }, [id]);
  
  
  
  const enviarResposta = async () => {
    if (respostaSelecionada === null) {
      alert("Escolha uma alternativa.");
      return;
    }
  
    const token = localStorage.getItem("token");
    let usuarioId: number | null = null;
  
    // Se tiver token, decodifica para pegar o id
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        usuarioId = decoded.id;
      } catch (err) {
        console.error("Token inválido.");
      }
    }
  
    // Se a atividade não for pública e o usuário não estiver logado
    if (atividade.usuario_id !== -1 && !usuarioId) {
      alert("Você precisa estar logado para responder esta atividade.");
      return;
    }
  
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch("http://localhost:3001/responder", {
      method: "POST",
      headers,
      body: JSON.stringify({
        usuarioId,
        atividadeId: atividade.id,
        resposta: respostaSelecionada,
      }),
    });
    
  
    if (res.status === 400) {
      setResultado("⚠️ Você já respondeu esta atividade.");
      return;
    }
  
    const json = await res.json();
    setResultado(json.acertou ? "✅ Você acertou!" : "❌ Você errou.");
  };
  


  if (erro) return <div className="p-6 text-red-600">{erro}</div>;
  if (!atividade) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <button onClick={() => navigate(-1)} className="mb-4 underline text-blue-600">Voltar</button>
      <h1 className="text-xl font-bold mb-4">Responder Atividade</h1>

      <p className="mb-2">{atividade.texto_principal}</p>
      {atividade.texto_secundario && <p className="mb-2 text-gray-600">{atividade.texto_secundario}</p>}
      {atividade.imagem && (
        <img src={`${IMAGES_URL}/${atividade.imagem}`} alt="Atividade"className="mb-4 w-full h-auto object-contain"
      />
      )}

      {[1, 2, 3, 4].map((num) => (
        <label key={num} className="block mb-2 cursor-pointer">
          <input
            type="radio"
            name="resposta"
            value={num}
            checked={respostaSelecionada === num}
            onChange={() => setRespostaSelecionada(num)}
            className="mr-2"
          />
          {atividade[`resposta${num}`]}
        </label>
      ))}

      <button
        onClick={enviarResposta}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enviar Resposta
      </button>

      {resultado && (
        <p className={`mt-4 font-bold ${resultado.includes("acertou") ? "text-green-600" : "text-red-600"}`}>
          {resultado}
        </p>
      )}
       <button
        onClick={() => navigate(`/atividades/${atividade.id}/feedback`)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
      >
        Deixe seu feedback!
      </button>
    </div>
  );
  }
