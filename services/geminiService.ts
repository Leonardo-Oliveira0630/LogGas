
import { GoogleGenAI } from "@google/genai";
import { Product, Transaction, Sale, Customer } from "../types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[], products: Product[], sales: Sale[]) => {
  const prompt = `
    Analise os seguintes dados de uma distribuidora de gás e água:
    Produtos: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, min: p.minStock, sell: p.sellPrice })))}
    Transações Recentes: ${JSON.stringify(transactions.slice(0, 5))}
    Vendas Recentes: ${JSON.stringify(sales.slice(0, 5))}

    Por favor, forneça:
    1. Uma análise rápida da saúde financeira (lucratividade aproximada).
    2. Identifique os 3 produtos mais críticos em termos de estoque.
    3. Dê uma sugestão estratégica para aumentar as vendas nesta semana.
    
    Responda em português de forma concisa e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar insights inteligentes.";
  }
};

export const getCustomerProjections = async (customer: Customer, sales: Sale[]) => {
  const customerSales = sales.filter(s => s.customerId === customer.id);
  const prompt = `
    Analise o histórico de compras deste cliente:
    Cliente: ${customer.name}
    Total de Compras: ${customer.purchaseCount}
    Valor Total Gasto: R$ ${customer.totalSpent}
    Histórico Recente: ${JSON.stringify(customerSales.slice(0, 10).map(s => ({ date: s.date, total: s.total, items: s.items.map(i => i.productName) })))}

    Com base na frequência de compra e itens (gás dura em média 30-45 dias, água 7-15 dias), faça:
    1. Uma projeção de data para a próxima compra.
    2. Sugira qual produto oferecer no próximo contato.
    3. Uma mensagem curta e personalizada de lembrete via WhatsApp.
    
    Seja breve e direto ao ponto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Sem projeções no momento.";
  } catch (error) {
    return "Erro ao gerar projeção.";
  }
};

export const optimizeDeliveryRoute = async (sales: Sale[]) => {
  const prompt = `
    Você é um especialista em logística. Otimize a sequência de entrega para os seguintes pedidos:
    ${JSON.stringify(sales.map(s => ({ id: s.id, address: s.customerAddress, items: s.items.map(i => i.productName) })))}

    Considere que o ponto de partida é a distribuidora central.
    1. Organize os pedidos em uma sequência lógica de entrega para minimizar o tempo.
    2. Explique brevemente o porquê dessa ordem (ex: agrupamento por bairro).
    
    Responda em português de forma clara.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível otimizar a rota.";
  } catch (error) {
    return "Erro ao otimizar rota.";
  }
};
