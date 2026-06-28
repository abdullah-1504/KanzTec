// =============================================================================
// Provider adapter layer. This is the ONLY thing that talks to the actual
// WhatsApp transport. For the MVP we ship a mock/in-memory provider; a real
// WhatsApp Business API / BSP (e.g. Meta Cloud API, Twilio) is a drop-in
// replacement implementing the same interface — no changes to the agent.
// =============================================================================

export interface OutboundMessage {
  to: string;
  text: string;
  at: string; // ISO timestamp
}

export interface WhatsAppProvider {
  /** Send a message to a guest. Returns once "delivered". */
  sendMessage(to: string, text: string): Promise<void>;
}

/**
 * Mock provider — records outbound messages and notifies listeners so the
 * in-app simulator can render them. Real implementation would POST to the
 * WhatsApp Cloud API here instead.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  private outbox: OutboundMessage[] = [];
  private listeners = new Set<(msg: OutboundMessage) => void>();

  async sendMessage(to: string, text: string): Promise<void> {
    const msg: OutboundMessage = { to, text, at: new Date().toISOString() };
    this.outbox.push(msg);
    this.listeners.forEach((l) => l(msg));
  }

  onSend(listener: (msg: OutboundMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getOutbox(): OutboundMessage[] {
    return [...this.outbox];
  }
}

// Shared singleton used by the simulator + (future) webhook route.
export const mockProvider = new MockWhatsAppProvider();