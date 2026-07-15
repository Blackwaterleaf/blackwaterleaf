import { Message } from "./_core/llm";
import type { User } from "../drizzle/schema";

export type AiContextType = "plant" | "aquarium" | "terrarium" | "community" | "diagnosis" | "care" | "general";

export interface AiRequest {
  message: string;
  sessionId: string;
  userId?: number;
  contextType?: AiContextType;
  contextId?: number;
  history: Message[];
  userPreferences?: UserPreferences;
  seasonalContext?: SeasonalContext;
  locationContext?: LocationContext;
}

export interface UserPreferences {
  language: string;
  tone: "formal" | "informal";
  expertiseLevel: "beginner" | "advanced" | "expert";
}

export interface SeasonalContext {
  season: "spring" | "summer" | "autumn" | "winter";
  month: number;
}

export interface LocationContext {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  expertise: AiContextType[];
  promptTemplateVersion: string;
}

export interface PromptTemplate {
  version: string;
  template: string;
}

export class AiOrchestrator {
  private agents: Agent[] = [];
  private promptTemplates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.loadAgents();
    this.loadPromptTemplates();
  }

  private loadAgents() {
    // In a real application, these would be loaded from a database or configuration service.
    this.agents = [
      {
        id: "plant-expert",
        name: "Pflanzen-Experte",
        description: "Beantwortet Fragen zur Pflanzenpflege, -bestimmung und -gesundheit.",
        expertise: ["plant", "diagnosis", "care"],
        promptTemplateVersion: "v1.0",
      },
      {
        id: "aquaristik-expert",
        name: "Aquaristik-Experte",
        description: "Beantwortet Fragen zu Aquarien, Wasserwerten, Fischhaltung und -krankheiten.",
        expertise: ["aquarium", "diagnosis", "care"],
        promptTemplateVersion: "v1.0",
      },
      {
        id: "terrarium-expert",
        name: "Terraristik-Experte",
        description: "Beantwortet Fragen zu Terrarien, Reptilien- und Amphibienhaltung.",
        expertise: ["terrarium", "diagnosis", "care"],
        promptTemplateVersion: "v1.0",
      },
      {
        id: "community-manager",
        name: "Community-Manager",
        description: "Hilft bei Fragen zur Community, Moderation und Benutzerinteraktionen.",
        expertise: ["community"],
        promptTemplateVersion: "v1.0",
      },
      {
        id: "general-assistant",
        name: "Allgemeiner Assistent",
        description: "Beantwortet allgemeine Fragen und leitet bei Bedarf an spezialisierte Agenten weiter.",
        expertise: ["general"],
        promptTemplateVersion: "v1.0",
      },
    ];
  }

  private loadPromptTemplates() {
    // In a real application, these would be loaded from a database or configuration service.
    this.promptTemplates.set("v1.0", {
      version: "v1.0",
      template: `Du bist ein {agentName}. Deine Aufgabe ist es, präzise und faktenbasierte Antworten zu geben. Berücksichtige den folgenden Kontext:
Benutzerpräferenzen: {userPreferences}
Jahreszeit: {seasonalContext}
Standort: {locationContext}
Historie: {history}
Frage: {message}`,
    });
  }

  private classifyRequest(message: string): AiContextType {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("pflanze") || lowerMessage.includes("blatt") || lowerMessage.includes("erde")) {
      return "plant";
    }
    if (lowerMessage.includes("aquarium") || lowerMessage.includes("fisch") || lowerMessage.includes("wasser")) {
      return "aquarium";
    }
    if (lowerMessage.includes("terrarium") || lowerMessage.includes("reptil") || lowerMessage.includes("amphibie")) {
      return "terrarium";
    }
    if (lowerMessage.includes("community") || lowerMessage.includes("gruppe") || lowerMessage.includes("beitrag")) {
      return "community";
    }
    if (lowerMessage.includes("krankheit") || lowerMessage.includes("diagnose") || lowerMessage.includes("problem")) {
      return "diagnosis";
    }
    if (lowerMessage.includes("pflege") || lowerMessage.includes("dünger") || lowerMessage.includes("futter")) {
      return "care";
    }
    return "general";
  }

  private selectAgent(contextType: AiContextType): Agent {
    const suitableAgents = this.agents.filter(agent => agent.expertise.includes(contextType));
    if (suitableAgents.length > 0) {
      // Prioritize more specific agents if available, otherwise pick the first suitable one.
      return suitableAgents[0];
    }
    return this.agents.find(agent => agent.id === "general-assistant")!;
  }

  private manageContext(request: AiRequest): string {
    const { userPreferences, seasonalContext, locationContext, history, message } = request;
    let contextString = "";

    if (userPreferences) {
      contextString += `Benutzerpräferenzen: Sprache=${userPreferences.language}, Ton=${userPreferences.tone}, Expertise=${userPreferences.expertiseLevel}.\n`;
    }
    if (seasonalContext) {
      contextString += `Jahreszeit: ${seasonalContext.season} (Monat ${seasonalContext.month}).\n`;
    }
    if (locationContext) {
      contextString += `Standort: ${locationContext.city}, ${locationContext.country} (Lat: ${locationContext.latitude}, Lon: ${locationContext.longitude}).\n`;
    }
    if (history && history.length > 0) {
      contextString += "Historie:\n";
      history.forEach(msg => {
        contextString += `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}\n`;
      });
    }
    contextString += `Frage: ${message}`; // Add the current message to the context
    return contextString;
  }

  private applyPromptTemplate(agent: Agent, context: string, request: AiRequest): string {
    const template = this.promptTemplates.get(agent.promptTemplateVersion);
    if (!template) {
      throw new Error(`Prompt template for version ${agent.promptTemplateVersion} not found.`);
    }

    let finalPrompt = template.template;
    finalPrompt = finalPrompt.replace("{agentName}", agent.name);
    finalPrompt = finalPrompt.replace("{userPreferences}", request.userPreferences ? JSON.stringify(request.userPreferences) : "nicht angegeben");
    finalPrompt = finalPrompt.replace("{seasonalContext}", request.seasonalContext ? JSON.stringify(request.seasonalContext) : "nicht angegeben");
    finalPrompt = finalPrompt.replace("{locationContext}", request.locationContext ? JSON.stringify(request.locationContext) : "nicht angegeben");
    finalPrompt = finalPrompt.replace("{history}", request.history.map(msg => `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`).join('\n'));
    finalPrompt = finalPrompt.replace("{message}", request.message);

    return finalPrompt;
  }

  private performQualityCheck(response: string): boolean {
    // Implementierung der Qualitätsprüfung und Halluzinationsschutz
    // Dies könnte eine weitere KI-Prüfung, Stichwortanalyse oder Heuristiken umfassen.
    // Für dieses Beispiel wird eine einfache Längenprüfung verwendet.
    return response.length > 10 && !response.includes("als KI-Modell");
  }

  public async orchestrate(request: AiRequest): Promise<string> {
    const contextType = request.contextType || this.classifyRequest(request.message);
    const agent = this.selectAgent(contextType);
    const managedContext = this.manageContext(request);
    const finalPrompt = this.applyPromptTemplate(agent, managedContext, request);

    // Hier würde die tatsächliche LLM-Anfrage über `invokeLLM` erfolgen
    // Da `invokeLLM` nicht direkt hier aufgerufen werden kann, simulieren wir eine Antwort.
    console.log(`Orchestrating request for agent: ${agent.name}`);
    console.log(`Final Prompt: ${finalPrompt}`);

    // Simulierte LLM-Antwort
    let simulatedResponse = `Dies ist eine simulierte Antwort vom ${agent.name} zum Thema '${request.message}'.`;
    if (agent.id === "plant-expert") {
      simulatedResponse += " Pflanzen benötigen ausreichend Licht und Wasser.";
    } else if (agent.id === "aquaristik-expert") {
      simulatedResponse += " Achten Sie auf die Wasserwerte und die Beckengröße.";
    } else if (agent.id === "terrarium-expert") {
      simulatedResponse += " Die richtige Luftfeuchtigkeit ist entscheidend.";
    } else if (agent.id === "community-manager") {
      simulatedResponse += " Unsere Community freut sich über neue Beiträge.";
    }

    if (!this.performQualityCheck(simulatedResponse)) {
      console.warn("Simulierte Antwort hat die Qualitätsprüfung nicht bestanden.");
      // Hier könnte eine Fallback-Logik oder eine erneute Anfrage implementiert werden.
      return "Entschuldigung, ich konnte keine qualitativ hochwertige Antwort generieren. Bitte versuchen Sie es anders zu formulieren.";
    }

    return simulatedResponse;
  }
}
